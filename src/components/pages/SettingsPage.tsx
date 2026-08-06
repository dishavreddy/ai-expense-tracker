import { Moon, Sun, DollarSign, LogOut } from 'lucide-react';
import type { AppSettings, CurrencyCode, ThemeMode } from '../../types';
import { CURRENCY_LABELS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../Card';
import type { useToast } from '../../hooks/useToast';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => Promise<boolean>;
  onToast: ReturnType<typeof useToast>;
}

export function SettingsPage({ settings, onUpdate, onToast }: SettingsPageProps) {
  const { signOut } = useAuth();

  const handleCurrency = async (currency: CurrencyCode) => {
    const ok = await onUpdate({ currency });
    if (ok) onToast.success('Currency updated');
    else onToast.error('Could not update currency');
  };

  const handleTheme = async (theme: ThemeMode) => {
    const ok = await onUpdate({ theme });
    if (ok) onToast.success(`${theme === 'dark' ? 'Dark' : 'Light'} theme enabled`);
    else onToast.error('Could not update theme');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Customize your experience</p>
      </div>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold">Appearance</h2>
        <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-700">
          <button onClick={() => handleTheme('light')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${settings.theme === 'light' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
            <Sun className="h-4 w-4" /> Light
          </button>
          <button onClick={() => handleTheme('dark')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${settings.theme === 'dark' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>
      </Card>

      {/* Currency */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold">Currency</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(CURRENCY_LABELS) as CurrencyCode[]).map((c) => (
            <button key={c} onClick={() => handleCurrency(c)} className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${settings.currency === c ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>
              <DollarSign className="h-3.5 w-3.5" /> {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold">Account</h2>
        <button onClick={signOut} className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </Card>
    </div>
  );
}
