import { useCallback, useEffect, useState } from 'react';
import type { Budget, CategoryId } from '../types';
import { supabase } from '../lib/supabase';
import { currentMonth } from '../lib/format';
import { useAuth } from './useAuth';

interface BudgetRow {
  id: string;
  category: string;
  month: string;
  limit_amount: number;
}

const toBudget = (r: BudgetRow): Budget => ({
  id: r.id,
  category: r.category as CategoryId,
  month: r.month,
  limit: Number(r.limit_amount),
});

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('month', { ascending: false });
    if (error) return;
    setBudgets((data as BudgetRow[]).map(toBudget));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user, fetchAll]);

  const setBudget = useCallback(
    async (category: CategoryId, limit: number, month: string = currentMonth()): Promise<boolean> => {
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('category', category)
        .eq('month', month)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('budgets')
          .update({ limit_amount: limit })
          .eq('id', (existing as { id: string }).id);
        if (error) return false;
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === (existing as { id: string }).id ? { ...b, limit } : b,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from('budgets')
          .insert({ category, month, limit_amount: limit })
          .select()
          .single();
        if (error || !data) return false;
        setBudgets((prev) => [toBudget(data as BudgetRow), ...prev]);
      }
      return true;
    },
    [],
  );

  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) return false;
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    return true;
  }, []);

  return { budgets, loading, setBudget, deleteBudget, refetch: fetchAll };
}
