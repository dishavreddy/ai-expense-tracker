import { useCallback, useEffect, useState } from 'react';
import type { Income } from '../types';
import { isMissingColumnError, supabase } from '../lib/supabase';
import { todayISO } from '../lib/format';
import { useAuth } from './useAuth';

interface IncomeRow {
  id: string;
  amount: number;
  source: string;
  date: string;
}

const toIncome = (r: IncomeRow): Income => ({
  id: r.id,
  amount: Number(r.amount),
  description: r.source,
  date: r.date,
});

export function useIncomes() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const query = supabase
      .from('incomes')
      .select('*')
      .order('date', { ascending: false });
    const { data, error } = user
      ? await query.eq('user_id', user.id)
      : await query;
    if (error) {
      if (isMissingColumnError(error, 'user_id')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('incomes')
          .select('*')
          .order('date', { ascending: false });
        if (fallbackError) return;
        setIncomes((fallbackData as IncomeRow[]).map(toIncome));
        setLoading(false);
        return;
      }
      return;
    }
    setIncomes((data as IncomeRow[]).map(toIncome));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIncomes([]);
      setLoading(true);
      return;
    }
    fetchAll();
  }, [user, fetchAll]);

  const addIncome = useCallback(
    async (input: { amount: number; description: string; date?: string }): Promise<Income | null> => {
      const row = {
        amount: input.amount,
        source: input.description.trim(),
        date: input.date ?? todayISO(),
        user_id: user?.id,
      };
      const { data, error } = await supabase
        .from('incomes')
        .insert(row)
        .select()
        .single();
      if (error || !data) return null;
      const inc = toIncome(data as IncomeRow);
      setIncomes((prev) => [inc, ...prev]);
      return inc;
    },
    [user?.id],
  );

  const deleteIncome = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (error) return false;
    setIncomes((prev) => prev.filter((i) => i.id !== id));
    return true;
  }, []);

  return { incomes, loading, addIncome, deleteIncome, refetch: fetchAll };
}
