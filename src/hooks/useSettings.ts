import { useCallback, useEffect, useState } from 'react';
import type { AppSettings, CurrencyCode, ThemeMode } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface SettingsRow {
  id: string;
  currency: string;
  monthly_income: number;
  theme: string;
  user_id: string;
}

const toSettings = (r: SettingsRow): AppSettings => ({
  currency: r.currency as CurrencyCode,
  monthlyIncome: Number(r.monthly_income),
  theme: r.theme as ThemeMode,
});

const DEFAULTS: AppSettings = {
  currency: 'INR',
  monthlyIncome: 0,
  theme: 'light',
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('app_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSettings(toSettings(data as SettingsRow));
    } else {
      // No settings row yet — create one with defaults
      const { data: inserted } = await supabase
        .from('app_settings')
        .insert({ currency: DEFAULTS.currency, monthly_income: 0, theme: DEFAULTS.theme })
        .select('*')
        .single();
      if (inserted) setSettings(toSettings(inserted as SettingsRow));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply dark mode class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>): Promise<boolean> => {
      if (!user) return false;
      const dbPatch: Record<string, unknown> = {};
      if (patch.currency !== undefined) dbPatch.currency = patch.currency;
      if (patch.monthlyIncome !== undefined)
        dbPatch.monthly_income = patch.monthlyIncome;
      if (patch.theme !== undefined) dbPatch.theme = patch.theme;

      const { error } = await supabase
        .from('app_settings')
        .update(dbPatch)
        .eq('user_id', user.id);
      if (error) return false;
      setSettings((prev) => ({ ...prev, ...patch }));
      return true;
    },
    [user],
  );

  return { settings, loading, updateSettings };
}
