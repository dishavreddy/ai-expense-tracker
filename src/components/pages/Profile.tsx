import { TrendingUp, TrendingDown, Wallet, Mail, User as UserIcon } from 'lucide-react';
import type { UserProfile, Expense, Income, CurrencyCode } from '../../types';
import { totalSpent, totalIncome, monthTotal, monthIncome } from '../../lib/selectors';
import { formatCurrency, currentMonth } from '../../lib/format';
import { Card } from '../Card';
import { StatCard } from '../StatCard';

interface ProfileProps {
  profile: UserProfile;
  expenses: Expense[];
  incomes: Income[];
  currency: CurrencyCode;
}

export function Profile({ profile, expenses, incomes, currency }: ProfileProps) {
  const month = currentMonth();
  const monthExp = monthTotal(expenses, month);
  const monthInc = monthIncome(incomes, month);
  const lifetimeExp = totalSpent(expenses);
  const lifetimeInc = totalIncome(incomes);
  const totalSavings = lifetimeInc - lifetimeExp;

  const displayName = profile.name || profile.email?.split('@')[0] || 'User';
  const initials = displayName.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your account and financial summary</p>
      </div>

      <Card className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white">
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold">{displayName}</h2>
          <div className="mt-1 flex flex-col items-center gap-1 text-sm text-slate-500 dark:text-slate-400 sm:items-start">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {profile.email || '—'}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Monthly Income" value={formatCurrency(monthInc, currency)} icon={<TrendingUp className="h-5 w-5" />} accent delay={0} />
        <StatCard label="Monthly Expenses" value={formatCurrency(monthExp, currency)} icon={<TrendingDown className="h-5 w-5" />} delay={0.05} />
        <StatCard label="Total Savings" value={formatCurrency(totalSavings, currency)} icon={<Wallet className="h-5 w-5" />} delay={0.1} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">Lifetime Expenses</p>
          <p className="mt-2 text-2xl font-bold tabular">{formatCurrency(lifetimeExp, currency)}</p>
          <p className="mt-1 text-xs text-slate-400">{expenses.length} transactions</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400">Lifetime Income</p>
          <p className="mt-2 text-2xl font-bold tabular">{formatCurrency(lifetimeInc, currency)}</p>
          <p className="mt-1 text-xs text-slate-400">{incomes.length} income records</p>
        </Card>
      </div>
    </div>
  );
}
