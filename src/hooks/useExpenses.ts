import { useCallback, useEffect, useState } from 'react';
import type { Expense, CategoryId } from '../types';
import { isMissingColumnError, supabase } from '../lib/supabase';
import { categoryMeta } from '../constants';
import { todayISO } from '../lib/format';
import { useAuth } from './useAuth';

interface ExpenseRow {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  emoji: string;
}

const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  amount: Number(r.amount),
  description: r.description,
  category: r.category as CategoryId,
  date: r.date,
  emoji: r.emoji,
});

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const query = supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    const { data, error } = user
      ? await query.eq('user_id', user.id)
      : await query;
    if (error) {
      if (isMissingColumnError(error, 'user_id')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });
        if (fallbackError) return;
        setExpenses((fallbackData as ExpenseRow[]).map(toExpense));
        setLoading(false);
        return;
      }
      return;
    }
    setExpenses((data as ExpenseRow[]).map(toExpense));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(true);
      return;
    }
    fetchAll();
  }, [user, fetchAll]);

  const addExpense = useCallback(
    async (input: {
      amount: number;
      description: string;
      category: CategoryId;
      date?: string;
    }): Promise<Expense | null> => {
      const meta = categoryMeta(input.category);
      const row = {
        amount: input.amount,
        description: input.description.trim(),
        category: input.category,
        date: input.date ?? todayISO(),
        emoji: meta.emoji,
        user_id: user?.id,
      };
      const { data, error } = await supabase
        .from('expenses')
        .insert(row)
        .select()
        .single();
      if (error || !data) return null;
      const exp = toExpense(data as ExpenseRow);
      setExpenses((prev) => [exp, ...prev]);
      return exp;
    },
    [],
  );

  const updateExpense = useCallback(
    async (id: string, input: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date'>>): Promise<boolean> => {
      const patch: Record<string, unknown> = {};
      if (input.amount !== undefined) patch.amount = input.amount;
      if (input.description !== undefined) patch.description = input.description;
      if (input.category !== undefined) {
        patch.category = input.category;
        patch.emoji = categoryMeta(input.category).emoji;
      }
      if (input.date !== undefined) patch.date = input.date;

      const { error } = await supabase.from('expenses').update(patch).eq('id', id);
      if (error) return false;
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                ...input,
                emoji: input.category ? categoryMeta(input.category).emoji : e.emoji,
              }
            : e,
        ),
      );
      return true;
    },
    [],
  );

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) return false;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    return true;
  }, []);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchAll,
  };
}
