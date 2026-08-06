import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  PiggyBank,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import type { Expense, Income, AppSettings, Budget, CategoryId } from '../../types';
import {
  byCategory,
  totalSpent,
  monthTotal,
  monthIncome,
  highestCategory,
  recent,
  categorySpendInMonth,
} from '../../lib/selectors';
import { formatCurrency, formatDate, currentMonth } from '../../lib/format';
import { categoryMeta } from '../../constants';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { CategoryBadge } from '../CategoryBadge';
import { StatCard } from '../StatCard';
import { ProgressBar } from '../ProgressBar';

interface DashboardProps {
  expenses: Expense[];
  incomes: Income[];
  settings: AppSettings;
  budgets: Budget[];
  onGoAdd: () => void;
  onGoBudgets: () => void;
}

export function Dashboard({ expenses, incomes, settings, budgets, onGoAdd, onGoBudgets }: DashboardProps) {
  const month = currentMonth();
  const cur = settings.currency;

  const totalExp = useMemo(() => totalSpent(expenses), [expenses]);
  const monthExp = useMemo(() => monthTotal(expenses, month), [expenses, month]);
  const monthInc = useMemo(
    () => monthIncome(incomes, month),
    [incomes, month],
  );
  const balance = monthInc - monthExp;
  const savings = balance > 0 ? balance : 0;
  const savingsPct = monthInc > 0 ? Math.round((savings / monthInc) * 100) : 0;
  const topCat = useMemo(() => highestCategory(expenses), [expenses]);
  const slices = useMemo(() => byCategory(expenses), [expenses]);
  const last5 = useMemo(() => recent(expenses, 5), [expenses]);
  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month]);

  if (expenses.length === 0 && incomes.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState
          icon={<Wallet className="h-8 w-8" />}
          title="Welcome to ExpenseAI"
          message="Track expenses, set budgets, and let AI analyze your spending — all in one place."
          action={
            <button onClick={onGoAdd} className="btn-primary px-5 py-2.5 text-sm font-semibold">
              <Plus className="h-4 w-4" />
              Add your first transaction
            </button>
          }
        />
      </Card>
    );
  }

  const monthName = new Date().toLocaleDateString('en-IN', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {monthName} {new Date().getFullYear()} — here's your financial overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Balance" value={formatCurrency(balance, cur)} icon={<Wallet className="h-5 w-5" />} accent delay={0} />
        <StatCard label="Monthly Income" value={formatCurrency(monthInc, cur)} icon={<TrendingUp className="h-5 w-5" />} trendUp delay={0.05} />
        <StatCard label="Monthly Expenses" value={formatCurrency(monthExp, cur)} icon={<TrendingDown className="h-5 w-5" />} delay={0.1} />
        <StatCard label="Savings" value={formatCurrency(savings, cur)} icon={<PiggyBank className="h-5 w-5" />} trend={`${savingsPct}% rate`} trendUp delay={0.15} />
      </div>

      {/* Charts + Top category */}
      <div className="grid gap-4 lg:grid-cols-3">
        {slices.length > 0 && (
          <Card className="p-6 lg:col-span-2 animate-fade-up" >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Spending by Category</h2>
            </div>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={slices} dataKey="value" nameKey="label" innerRadius={52} outerRadius={82} paddingAngle={3} stroke="none" startAngle={90} endAngle={-270}>
                      {slices.map((s) => (<Cell key={s.category} fill={s.color} />))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v), cur)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
                  <span className="text-lg font-bold tabular">{formatCurrency(totalExp, cur)}</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2">
                {slices.slice(0, 5).map((s) => (
                  <li key={s.category} className="flex items-center gap-2.5 text-sm">
                    <span className="h-3 w-3 shrink-0 rounded-md" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{s.emoji} {s.label}</span>
                    <span className="tabular text-slate-500 dark:text-slate-400">{formatCurrency(s.value, cur)}</span>
                  </li>
                ))}
                {slices.length > 5 && <li className="text-xs text-slate-400">+{slices.length - 5} more</li>}
              </ul>
            </div>
          </Card>
        )}

        {/* Top category + savings rate */}
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {topCat && (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Trophy className="h-3.5 w-3.5" />
                Highest Category
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl text-2xl" style={{ backgroundColor: `${topCat.color}15` }}>
                  {topCat.emoji}
                </div>
                <div>
                  <p className="text-lg font-bold">{topCat.label}</p>
                  <p className="text-sm tabular text-slate-500">{formatCurrency(topCat.value, cur)}</p>
                </div>
              </div>
            </Card>
          )}
          <Card className="p-5">
            <p className="text-xs font-medium text-slate-400">Savings Rate</p>
            <p className="mt-2 text-3xl font-bold tabular">{savingsPct}%</p>
            <ProgressBar value={savings} max={monthInc > 0 ? monthInc : 1} className="mt-3" />
            <p className="mt-2 text-xs text-slate-400">
              {savingsPct >= 20 ? 'Great savings rate!' : savingsPct > 0 ? 'Keep it up' : 'No savings this month'}
            </p>
          </Card>
        </div>
      </div>

      {/* Budget overview + Recent transactions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Budget overview */}
        <Card className="p-6 animate-fade-up" >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Budget Overview</h2>
            {monthBudgets.length > 0 && (
              <button onClick={onGoBudgets} className="btn-ghost text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          {monthBudgets.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-400">No budgets set for this month</p>
              <button onClick={onGoBudgets} className="btn-secondary mt-3 text-xs">Create budget</button>
            </div>
          ) : (
            <div className="space-y-3">
              {monthBudgets.slice(0, 4).map((b) => {
                const spent = categorySpendInMonth(expenses, b.category, b.month);
                const meta = categoryMeta(b.category as CategoryId);
                const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                return (
                  <div key={b.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <span>{meta.emoji}</span>
                        <span className="text-slate-700 dark:text-slate-300">{meta.label}</span>
                      </span>
                      <span className="tabular text-xs text-slate-400">
                        {formatCurrency(spent, cur)} / {formatCurrency(b.limit, cur)}
                      </span>
                    </div>
                    <ProgressBar value={spent} max={b.limit} />
                    <p className="mt-1 text-right text-[11px] font-medium text-slate-400">{pct.toFixed(0)}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent transactions */}
        <Card className="p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Transactions</h2>
            <button onClick={onGoAdd} className="btn-ghost text-xs">
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          {last5.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {last5.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-base dark:bg-surface-dark-muted">
                    {e.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.description || 'Untitled'}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <CategoryBadge category={e.category} size="sm" />
                      <span className="text-[11px] text-slate-400">{formatDate(e.date)}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular">{formatCurrency(e.amount, cur)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  color: '#0f172a',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  padding: '8px 12px',
};
