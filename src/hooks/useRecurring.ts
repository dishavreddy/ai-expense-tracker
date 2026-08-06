import { useCallback, useEffect, useState } from 'react';
import type { RecurringExpense, Frequency, CategoryId } from '../types';
import { isMissingColumnError, supabase } from '../lib/supabase';
import { categoryMeta } from '../constants';
import { todayISO } from '../lib/format';
import { useAuth } from './useAuth';

interface RecurringRow {
  id: string;
  description: string;
  amount: number;
  category: string;
  emoji: string;
  frequency: string;
  start_date: string;
  next_date: string;
  active: boolean;
}

const toRecurring = (r: RecurringRow): RecurringExpense => ({
  id: r.id,
  description: r.description,
  amount: Number(r.amount),
  category: r.category as CategoryId,
  emoji: r.emoji,
  frequency: r.frequency as Frequency,
  startDate: r.start_date,
  nextDate: r.next_date,
  active: r.active,
});

export function useRecurring() {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const query = supabase
      .from('recurring_expenses')
      .select('*')
      .order('created_at', { ascending: false });
    const { data, error } = user
      ? await query.eq('user_id', user.id)
      : await query;
    if (error) {
      if (isMissingColumnError(error, 'user_id')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('recurring_expenses')
          .select('*')
          .order('created_at', { ascending: false });
        if (fallbackError) return;
        setRecurring((fallbackData as RecurringRow[]).map(toRecurring));
        setLoading(false);
        return;
      }
      return;
    }
    setRecurring((data as RecurringRow[]).map(toRecurring));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRecurring([]);
      setLoading(true);
      return;
    }
    fetchAll();
  }, [user, fetchAll]);

  const addRecurring = useCallback(
    async (input: {
      description: string;
      amount: number;
      category: CategoryId;
      frequency: Frequency;
      startDate?: string;
    }): Promise<boolean> => {
      const meta = categoryMeta(input.category);
      const date = input.startDate ?? todayISO();
      const { error } = await supabase.from('recurring_expenses').insert({
        description: input.description.trim(),
        amount: input.amount,
        category: input.category,
        emoji: meta.emoji,
        frequency: input.frequency,
        start_date: date,
        next_date: date,
        active: true,
        user_id: user?.id,
      });
      if (error) return false;
      fetchAll();
      return true;
    },
    [fetchAll, user?.id],
  );

  const toggleRecurring = useCallback(
    async (id: string, active: boolean): Promise<void> => {
      await supabase.from('recurring_expenses').update({ active }).eq('id', id);
      setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
    },
    [],
  );

  const deleteRecurring = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);
      if (error) return false;
      setRecurring((prev) => prev.filter((r) => r.id !== id));
      return true;
    },
    [],
  );

  return {
    recurring,
    loading,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    refetch: fetchAll,
  };
}
