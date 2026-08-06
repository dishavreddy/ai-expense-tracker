import { useRef, useState } from 'react';
import { Check, Sparkles, Scan, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { CategoryId, CurrencyCode } from '../../types';
import { CATEGORIES } from '../../constants';
import { categorizeExpense, scanReceipt } from '../../lib/gemini';
import { todayISO } from '../../lib/format';
import { Card } from '../Card';
import { CategoryBadge } from '../CategoryBadge';
import { Spinner } from '../Spinner';
import type { useToast } from '../../hooks/useToast';

interface AddExpenseProps {
  onAdd: (input: { amount: number; description: string; category: CategoryId; date?: string }) => Promise<unknown>;
  onAddIncome: (input: { amount: number; description: string; date?: string }) => Promise<unknown>;
  onDone: () => void;
  currency: CurrencyCode;
  onToast: ReturnType<typeof useToast>;
}

type Mode = 'expense' | 'income';
type Phase = 'form' | 'categorizing' | 'scanning' | 'saved';

export function AddExpense({ onAdd, onAddIncome, onDone, currency, onToast }: AddExpenseProps) {
  const [mode, setMode] = useState<Mode>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('other');
  const [date, setDate] = useState(todayISO());
  const [phase, setPhase] = useState<Phase>('form');
  const [pickedCategory, setPickedCategory] = useState<CategoryId | null>(null);
  const [manualCategory, setManualCategory] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '¥';
  const amountNum = parseFloat(amount);
  const isValid = Number.isFinite(amountNum) && amountNum > 0 && description.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || phase === 'categorizing') return;
    if (mode === 'income') {
      await onAddIncome({ amount: amountNum, description, date });
      setPhase('saved');
      return;
    }
    if (!manualCategory) {
      setPhase('categorizing');
      const cat = await categorizeExpense(description, amountNum);
      setPickedCategory(cat);
      setCategory(cat);
      await onAdd({ amount: amountNum, description, category: cat, date });
      setPhase('saved');
      return;
    }
    await onAdd({ amount: amountNum, description, category, date });
    setPhase('saved');
  };

  const handleFile = async (file: File) => {
    setPhase('scanning');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await scanReceipt(base64);
        if (data.merchant) setDescription(data.merchant);
        if (data.amount !== null) setAmount(String(data.amount));
        if (data.date) setDate(data.date);
        setPhase('form');
        if (data.merchant || data.amount) onToast.success('Receipt scanned — review and save');
        else onToast.info('Could not extract data from receipt');
      };
      reader.readAsDataURL(file);
    } catch {
      setPhase('form');
      onToast.info('AI features are temporarily unavailable');
    }
  };

  const reset = () => {
    setAmount(''); setDescription(''); setCategory('other'); setDate(todayISO());
    setPickedCategory(null); setManualCategory(false); setPhase('form');
  };

  if (phase === 'saved') {
    return <SuccessView mode={mode} category={pickedCategory} symbol={symbol} amount={amountNum} onContinue={reset} onViewDashboard={onDone} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Transaction</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Record an expense or income</p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-700">
        <button onClick={() => setMode('expense')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${mode === 'expense' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
          <ArrowUpCircle className="h-4 w-4" /> Expense
        </button>
        <button onClick={() => setMode('income')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${mode === 'income' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
          <ArrowDownCircle className="h-4 w-4" /> Income
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          {/* Amount */}
          <Card className="p-6 text-center">
            <label htmlFor="amount" className="text-xs font-medium uppercase tracking-wider text-slate-400">Amount</label>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="text-4xl font-bold text-brand-600">{symbol}</span>
              <input id="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus className="w-40 bg-transparent text-center text-4xl font-bold outline-none tabular" />
            </div>
          </Card>

          {/* Receipt scan */}
          {mode === 'expense' && (
            <Card className="p-4">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                className={`rounded-xl border-2 border-dashed p-6 text-center transition ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-200 dark:border-slate-700'}`}
              >
                {phase === 'scanning' ? (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner size={24} />
                    <p className="text-sm text-slate-500">Scanning receipt...</p>
                  </div>
                ) : (
                  <>
                    <Scan className="mx-auto h-8 w-8 text-brand-500" />
                    <p className="mt-2 text-sm font-medium">Scan receipt with AI</p>
                    <p className="mt-1 text-xs text-slate-400">Drag & drop or click to upload</p>
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary mt-3 text-xs">Choose file</button>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Description */}
          <Card className="p-4">
            <label htmlFor="desc" className="text-xs font-medium uppercase tracking-wider text-slate-400">{mode === 'income' ? 'Source' : 'Description'}</label>
            <input id="desc" type="text" placeholder={mode === 'income' ? 'e.g. Salary, Freelance' : 'e.g. Lunch at cafe, Uber ride'} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field mt-1.5 w-full" />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Category */}
          {mode === 'expense' && (
            <Card className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Category</label>
                <button type="button" onClick={() => setManualCategory((m) => !m)} className="text-xs text-brand-600 transition hover:text-brand-700">
                  {manualCategory ? 'Let AI pick' : 'Choose manually'}
                </button>
              </div>
              {manualCategory ? (
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${category === c.id ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'}`}>
                      <span>{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-3 text-sm text-brand-700 dark:bg-brand-600/10 dark:text-brand-300">
                  <Sparkles className="h-4 w-4" /> AI will auto-categorize when you save
                </div>
              )}
            </Card>
          )}

          {/* Date */}
          <Card className="p-4">
            <label htmlFor="date" className="text-xs font-medium uppercase tracking-wider text-slate-400">Date</label>
            <input id="date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className="input-field mt-1.5 w-full" />
          </Card>

          {/* Submit */}
          <button type="submit" disabled={!isValid || phase === 'categorizing'} className="btn-primary w-full py-4 text-base">
            {phase === 'categorizing' ? (<><Spinner size={20} color="#fff" /> AI categorizing...</>) : (<><Sparkles className="h-5 w-5" /> Save {mode}</>)}
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessView({ mode, category, symbol, amount, onContinue, onViewDashboard }: {
  mode: Mode; category: CategoryId | null; symbol: string; amount: number; onContinue: () => void; onViewDashboard: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-scale-in">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-600 animate-check-pop">
        <svg viewBox="0 0 52 52" className="h-12 w-12" fill="none">
          <path className="animate-check-draw" d="M14 27l8 8 16-18" stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 48, strokeDashoffset: 0 }} />
        </svg>
      </div>
      <h2 className="mt-6 text-xl font-bold">{mode === 'income' ? 'Income Added!' : 'Saved!'}</h2>
      <p className="mt-1 text-sm text-slate-500">{symbol}{amount.toLocaleString()} has been recorded.</p>
      {category && mode === 'expense' && (
        <div className="mt-5 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-xs uppercase tracking-wider text-slate-400">AI picked this category</p>
          <CategoryBadge category={category} />
        </div>
      )}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
        <button onClick={onContinue} className="btn-primary w-full py-3.5">Add another</button>
        <button onClick={onViewDashboard} className="btn-secondary flex items-center justify-center gap-1.5 py-3.5"><Check className="h-4 w-4" /> View dashboard</button>
      </div>
    </div>
  );
}
