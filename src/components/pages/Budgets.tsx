import { useMemo, useState } from 'react';
import { Wallet, Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { Expense, Budget, CategoryId, CurrencyCode } from '../../types';
import { CATEGORIES, categoryMeta } from '../../constants';
import { categorySpendInMonth } from '../../lib/selectors';
import { formatCurrency, currentMonth, monthLabel } from '../../lib/format';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { ProgressBar } from '../ProgressBar';
import type { useToast } from '../../hooks/useToast';

interface BudgetsProps {
  expenses: Expense[];
  budgets: Budget[];
  currency: CurrencyCode;
  onSetBudget: (category: CategoryId, limit: number, month?: string) => Promise<boolean>;
  onDeleteBudget: (id: string) => Promise<boolean>;
  onToast: ReturnType<typeof useToast>;
}

export function Budgets({ expenses, budgets, currency, onSetBudget, onDeleteBudget, onToast }: BudgetsProps) {
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryId>('food');
  const [newLimit, setNewLimit] = useState('');
  const month = currentMonth();

  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month]);
  const budgetMap = useMemo(() => { const m = new Map<CategoryId, Budget>(); for (const b of monthBudgets) m.set(b.category, b); return m; }, [monthBudgets]);
  const availableCategories = CATEGORIES.filter((c) => !budgetMap.has(c.id));

  const handleSave = async () => {
    const limit = parseFloat(newLimit);
    if (!limit || limit <= 0) { onToast.error('Enter a valid amount'); return; }
    const ok = await onSetBudget(newCategory, limit, month);
    if (ok) { onToast.success('Budget set'); setAdding(false); setNewLimit(''); }
    else onToast.error('Could not set budget');
  };

  const handleDelete = async (id: string) => {
    const ok = await onDeleteBudget(id);
    if (ok) onToast.success('Budget removed');
    else onToast.error('Could not remove budget');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{monthLabel(month)}</p>
        </div>
        <button onClick={() => setAdding((a) => !a)} className="btn-primary"><Plus className="h-4 w-4" /> New Budget</button>
      </div>

      {adding && (
        <Card className="space-y-3 p-5 animate-fade-up">
          <h3 className="text-sm font-semibold">Create Monthly Budget</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as CategoryId)} className="input-field mt-1.5 w-full">
                {availableCategories.length === 0 ? <option value="">All categories budgeted</option> : availableCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Monthly Limit</label>
              <input type="number" step="0.01" placeholder="0" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} className="input-field mt-1.5 w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={availableCategories.length === 0} className="btn-primary flex-1 py-2.5">Save budget</button>
            <button onClick={() => setAdding(false)} className="btn-secondary px-4 py-2.5">Cancel</button>
          </div>
        </Card>
      )}

      {monthBudgets.length === 0 && !adding && (
        <Card className="mt-4">
          <EmptyState icon={<Wallet className="h-8 w-8" />} title="No budgets set" message="Create monthly budgets for each category to track your spending limits."
            action={<button onClick={() => setAdding(true)} className="btn-primary px-5 py-2.5 text-sm font-semibold">Create your first budget</button>} />
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {monthBudgets.map((b) => {
          const spent = categorySpendInMonth(expenses, b.category, b.month);
          const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
          const remaining = b.limit - spent;
          const meta = categoryMeta(b.category);
          const over = spent > b.limit;
          const warning = pct >= 80 && !over;
          return (
            <Card key={b.id} hover className="p-5 animate-fade-up">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl text-lg" style={{ backgroundColor: `${meta.color}15` }}>{meta.emoji}</div>
                  <div>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="text-xs text-slate-400">{formatCurrency(spent, currency)} of {formatCurrency(b.limit, currency)}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(b.id)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:text-rose-500" aria-label="Delete budget"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <ProgressBar value={spent} max={b.limit} />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={over ? 'font-medium text-rose-500' : warning ? 'font-medium text-amber-600' : 'text-slate-400'}>
                  {over ? `Over by ${formatCurrency(spent - b.limit, currency)}` : `${formatCurrency(remaining, currency)} remaining`}
                </span>
                <span className={`font-bold ${over ? 'text-rose-500' : warning ? 'text-amber-600' : 'text-brand-600'}`}>{pct.toFixed(0)}%</span>
              </div>
              {(over || warning) && (
                <div className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${over ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {over ? 'Budget exceeded — consider reducing spending.' : 'Approaching budget limit — 80% used.'}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
