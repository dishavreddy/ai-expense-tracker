import { useState } from 'react';
import { Repeat, Plus, Trash2, Power } from 'lucide-react';
import type { RecurringExpense, Frequency, CategoryId, CurrencyCode } from '../../types';
import { CATEGORIES, categoryMeta } from '../../constants';
import { formatCurrency, formatDate, todayISO } from '../../lib/format';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { CategoryBadge } from '../CategoryBadge';
import type { useToast } from '../../hooks/useToast';

interface RecurringProps {
  recurring: RecurringExpense[];
  onAdd: (input: { description: string; amount: number; category: CategoryId; frequency: Frequency; startDate?: string }) => Promise<boolean>;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<boolean>;
  currency: CurrencyCode;
  onToast: ReturnType<typeof useToast>;
}

const FREQ_LABELS: Record<Frequency, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

export function Recurring({ recurring, onAdd, onToggle, onDelete, currency, onToast }: RecurringProps) {
  const [adding, setAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('housing');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [startDate, setStartDate] = useState(todayISO());

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !description.trim()) { onToast.error('Fill in all fields'); return; }
    const ok = await onAdd({ description, amount: amt, category, frequency, startDate });
    if (ok) { onToast.success('Recurring expense added'); setAdding(false); setDescription(''); setAmount(''); }
    else onToast.error('Could not add recurring expense');
  };

  const handleDelete = async (id: string) => {
    const ok = await onDelete(id);
    if (ok) onToast.success('Recurring expense removed');
    else onToast.error('Could not remove');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring Expenses</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Automate regular payments like rent, subscriptions</p>
        </div>
        <button onClick={() => setAdding((a) => !a)} className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
      </div>

      {adding && (
        <Card className="space-y-3 p-5 animate-fade-up">
          <h3 className="text-sm font-semibold">New Recurring Expense</h3>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Description</label>
            <input type="text" placeholder="e.g. Rent, Netflix, Gym" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field mt-1.5 w-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Amount</label>
              <input type="number" step="0.01" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field mt-1.5 w-full" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)} className="input-field mt-1.5 w-full">
                <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className="input-field mt-1.5 w-full">
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field mt-1.5 w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary flex-1 py-2.5">Add recurring</button>
            <button onClick={() => setAdding(false)} className="btn-secondary px-4 py-2.5">Cancel</button>
          </div>
        </Card>
      )}

      {recurring.length === 0 && !adding && (
        <Card className="mt-4">
          <EmptyState icon={<Repeat className="h-8 w-8" />} title="No recurring expenses" message="Set up recurring expenses for rent, subscriptions, and other regular payments."
            action={<button onClick={() => setAdding(true)} className="btn-primary px-5 py-2.5 text-sm font-semibold">Add recurring expense</button>} />
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {recurring.map((r) => {
          const meta = categoryMeta(r.category);
          return (
            <Card key={r.id} hover className={`p-5 animate-fade-up ${!r.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: `${meta.color}15` }}>{meta.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.description || 'Untitled'}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <CategoryBadge category={r.category} size="sm" />
                    <span className="text-[11px] text-slate-400">{FREQ_LABELS[r.frequency]}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">Next: {formatDate(r.nextDate)}</p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular">{formatCurrency(r.amount, currency)}</span>
              </div>
              <div className="mt-3 flex justify-end gap-1.5">
                <button onClick={() => onToggle(r.id, !r.active)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${r.active ? 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700' : 'border-brand-500 text-brand-600'}`}>
                  <Power className="h-3 w-3" /> {r.active ? 'Pause' : 'Resume'}
                </button>
                <button onClick={() => handleDelete(r.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:text-rose-500 dark:border-slate-700" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
