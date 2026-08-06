import { useMemo, useState } from 'react';
import { Search, Pencil, Trash2, ArrowUpDown, List, X, LayoutGrid, Rows3 } from 'lucide-react';
import type { Expense, CategoryId, CurrencyCode } from '../../types';
import { CATEGORIES } from '../../constants';
import { formatCurrency, formatDate, todayISO } from '../../lib/format';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { CategoryBadge } from '../CategoryBadge';
import { Spinner } from '../Spinner';
import type { useToast } from '../../hooks/useToast';

interface TransactionsProps {
  expenses: Expense[];
  loading: boolean;
  currency: CurrencyCode;
  onUpdate: (id: string, input: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date'>>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onGoAdd: () => void;
  onToast: ReturnType<typeof useToast>;
}

type SortField = 'date' | 'amount';
type ViewMode = 'table' | 'card';

const PAGE_SIZE = 10;

export function Transactions({
  expenses, loading, currency, onUpdate, onDelete, onGoAdd, onToast,
}: TransactionsProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CategoryId | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [view, setView] = useState<ViewMode>('table');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.description.toLowerCase().includes(q));
    }
    if (catFilter !== 'all') list = list.filter((e) => e.category === catFilter);
    if (dateFrom) list = list.filter((e) => e.date >= dateFrom);
    if (dateTo) list = list.filter((e) => e.date <= dateTo);
    list.sort((a, b) => {
      const cmp = sortField === 'amount' ? a.amount - b.amount : a.date.localeCompare(b.date);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [expenses, search, catFilter, dateFrom, dateTo, sortField, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((a) => !a);
    else { setSortField(field); setSortAsc(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const ok = await onDelete(deleting.id);
    if (ok) onToast.success('Expense deleted');
    else onToast.error('Could not delete');
    setDeleting(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size={32} /></div>;
  }

  if (expenses.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState
          icon={<List className="h-8 w-8" />}
          title="No transactions"
          message="Your transactions will appear here once you start tracking expenses."
          action={<button onClick={onGoAdd} className="btn-primary px-5 py-2.5 text-sm font-semibold">Add expense</button>}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filtered.length} of {expenses.length} transactions</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-700">
          <button onClick={() => setView('table')} className={`grid h-8 w-8 place-items-center rounded-lg transition ${view === 'table' ? 'bg-brand-600 text-white' : 'text-slate-400'}`} aria-label="Table view">
            <Rows3 className="h-4 w-4" />
          </button>
          <button onClick={() => setView('card')} className={`grid h-8 w-8 place-items-center rounded-lg transition ${view === 'card' ? 'bg-brand-600 text-white' : 'text-slate-400'}`} aria-label="Card view">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="space-y-3 p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search descriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field w-full pl-10" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value as CategoryId | 'all')} className="input-field">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field" aria-label="From date" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field" aria-label="To date" />
          <button onClick={() => { setSearch(''); setCatFilter('all'); setDateFrom(''); setDateTo(''); }} className="btn-secondary text-sm">Clear</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => toggleSort('date')} className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white">
            <ArrowUpDown className="h-3 w-3" /> Date {sortField === 'date' && (sortAsc ? '↑' : '↓')}
          </button>
          <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:hover:text-white">
            <ArrowUpDown className="h-3 w-3" /> Amount {sortField === 'amount' && (sortAsc ? '↑' : '↓')}
          </button>
        </div>
      </Card>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400">No transactions match your filters</Card>
      ) : view === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-surface-dark-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{e.emoji}</span>
                        <span className="font-medium">{e.description || 'Untitled'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><CategoryBadge category={e.category} size="sm" /></td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular">{formatCurrency(e.amount, currency)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(e)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-600/10" aria-label="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleting(e)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" aria-label="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pageItems.map((e) => (
            <Card key={e.id} hover className="flex items-center gap-3 p-4 animate-fade-up">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg dark:bg-surface-dark-muted">{e.emoji}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.description || 'Untitled'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <CategoryBadge category={e.category} size="sm" />
                  <span className="text-[11px] text-slate-400">{formatDate(e.date)}</span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular">{formatCurrency(e.amount, currency)}</span>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditing(e)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:text-brand-600" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDeleting(e)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:text-rose-500" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary px-3 py-2 text-sm">Prev</button>
          <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary px-3 py-2 text-sm">Next</button>
        </div>
      )}

      {/* Edit drawer */}
      {editing && (
        <EditDrawer expense={editing} onClose={() => setEditing(null)} onSave={async (input) => {
          const ok = await onUpdate(editing.id, input);
          if (ok) { onToast.success('Expense updated'); setEditing(null); }
          else onToast.error('Could not update');
        }} />
      )}

      {/* Delete confirmation */}
      {deleting && (
        <DeleteModal expense={deleting} currency={currency} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}

function EditDrawer({ expense, onClose, onSave }: {
  expense: Expense;
  onClose: () => void;
  onSave: (input: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date'>>) => void;
}) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [description, setDescription] = useState(expense.description);
  const [category, setCategory] = useState<CategoryId>(expense.category);
  const [date, setDate] = useState(expense.date);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white shadow-floating animate-slide-right dark:bg-surface-dark">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold">Edit Transaction</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 dark:border-slate-700" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Amount</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field mt-1.5 w-full" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field mt-1.5 w-full" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className="input-field mt-1.5 w-full">
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Date</label>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className="input-field mt-1.5 w-full" />
          </div>
          <button onClick={() => onSave({ amount: parseFloat(amount), description, category, date })} disabled={!amount || parseFloat(amount) <= 0} className="btn-primary w-full py-3">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ expense, currency, onCancel, onConfirm }: {
  expense: Expense;
  currency: CurrencyCode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <Card className="relative z-10 w-full max-w-sm p-6 animate-scale-in">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10">
          <Trash2 className="h-6 w-6" />
        </div>
        <h3 className="text-center text-lg font-bold">Delete transaction?</h3>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          This will permanently delete "{expense.description || 'Untitled'}" ({formatCurrency(expense.amount, currency)}).
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 py-3">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]">Delete</button>
        </div>
      </Card>
    </div>
  );
}
