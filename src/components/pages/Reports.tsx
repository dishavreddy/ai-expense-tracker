import { useState } from 'react';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import type { Expense, Income, Budget, CurrencyCode, FinancialReport } from '../../types';
import { byCategory, totalSpent, totalIncome } from '../../lib/selectors';
import { formatCurrency } from '../../lib/format';
import { exportCSV, exportPDF } from '../../lib/export';
import { generateFinancialReport } from '../../lib/gemini';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { Spinner } from '../Spinner';
import type { useToast } from '../../hooks/useToast';

interface ReportsProps {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  currency: CurrencyCode;
  profileName: string;
  onToast: ReturnType<typeof useToast>;
}

export function Reports({ expenses, incomes, budgets, currency, profileName, onToast }: ReportsProps) {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [generating, setGenerating] = useState(false);

  const slices = byCategory(expenses);
  const totalExp = totalSpent(expenses);
  const totalInc = totalIncome(incomes);
  const balance = totalInc - totalExp;

  const handleCSV = () => { exportCSV(expenses, incomes, budgets, report); onToast.success('CSV exported'); };
  const handlePDF = () => { exportPDF(expenses, incomes, budgets, slices, report, currency, profileName); onToast.success('PDF opened — use print to save'); };

  const handleGenerateReport = async () => {
    if (generating || expenses.length === 0) return;
    setGenerating(true);
    try {
      const r = await generateFinancialReport(expenses, incomes, budgets, currency);
      setReport(r);
      onToast.success('AI analysis generated');
    } catch {
      onToast.info('AI features are temporarily unavailable');
    } finally {
      setGenerating(false);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState icon={<FileText className="h-8 w-8" />} title="No data to export" message="Add expenses and income to generate reports." />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Export your financial data</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-t-2 border-brand-500 p-5"><p className="text-xs uppercase tracking-wider text-slate-400">Income</p><p className="mt-1 text-lg font-bold tabular sm:text-xl">{formatCurrency(totalInc, currency)}</p></Card>
        <Card className="border-t-2 border-brand-500 p-5"><p className="text-xs uppercase tracking-wider text-slate-400">Expenses</p><p className="mt-1 text-lg font-bold tabular sm:text-xl">{formatCurrency(totalExp, currency)}</p></Card>
        <Card className="border-t-2 border-brand-500 p-5"><p className="text-xs uppercase tracking-wider text-slate-400">Balance</p><p className="mt-1 text-lg font-bold tabular sm:text-xl">{formatCurrency(balance, currency)}</p></Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">AI</span>
          <h2 className="text-sm font-semibold">AI Analysis for Report</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {report ? 'AI analysis is ready and will be included in your exports.' : 'Generate an AI financial analysis to include in your exported reports.'}
        </p>
        <button onClick={handleGenerateReport} disabled={generating} className="btn-secondary mt-3">
          {generating ? <Spinner size={16} /> : null}
          {report ? 'Regenerate AI Analysis' : 'Generate AI Analysis'}
        </button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card hover className="flex flex-wrap items-center gap-3 p-5 sm:flex-nowrap sm:gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/10 dark:text-brand-300"><FileSpreadsheet className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">CSV Export</h3><p className="text-xs text-slate-400">Spreadsheet-compatible format</p></div>
          <button onClick={handleCSV} className="btn-primary w-full sm:w-auto"><Download className="h-4 w-4" /> Export</button>
        </Card>
        <Card hover className="flex flex-wrap items-center gap-3 p-5 sm:flex-nowrap sm:gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/10 dark:text-brand-300"><FileText className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">PDF Export</h3><p className="text-xs text-slate-400">Print-ready report with charts</p></div>
          <button onClick={handlePDF} className="btn-primary w-full sm:w-auto"><Download className="h-4 w-4" /> Export</button>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">What's included</h3>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> All expense transactions</li>
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Income records</li>
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Category breakdown</li>
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Budget summary</li>
          {report && <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> AI financial analysis</li>}
        </ul>
      </Card>
    </div>
  );
}
