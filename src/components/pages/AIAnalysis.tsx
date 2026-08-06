import { useState } from 'react';
import {
  Sparkles, Trophy, TrendingDown, Lightbulb, BarChart3, Activity, FileText, AlertCircle,
} from 'lucide-react';
import type { Expense, Income, Budget, CurrencyCode, FinancialReport } from '../../types';
import { generateFinancialReport } from '../../lib/gemini';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { Spinner } from '../Spinner';

interface AIAnalysisProps {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  currency: CurrencyCode;
  onGoAdd: () => void;
}

export function AIAnalysis({ expenses, incomes, budgets, currency, onGoAdd }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [error, setError] = useState(false);

  const handleAnalyze = async () => {
    if (loading || expenses.length === 0) return;
    setLoading(true);
    setError(false);
    try {
      const result = await generateFinancialReport(expenses, incomes, budgets, currency);
      setReport(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState icon={<Sparkles className="h-8 w-8" />} title="No data to analyze" message="Add a few expenses first, then let AI generate a full financial report."
          action={<button onClick={onGoAdd} className="btn-primary px-5 py-2.5 text-sm font-semibold">Add an expense</button>} />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Financial Analysis</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get a detailed report of your spending habits</p>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 dark:border-brand-800/30 dark:from-brand-600/10 dark:to-transparent">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">AI</span>
          <p className="text-sm font-semibold">Financial Report</p>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          AI will analyze your {expenses.length} expenses, {incomes.length} income entries, and {budgets.length} budgets to generate a comprehensive financial report.
        </p>
        <button onClick={handleAnalyze} disabled={loading} className="btn-primary mt-4 w-full py-3 sm:w-auto">
          {loading ? (<><Spinner size={18} color="#fff" /> Analyzing...</>) : (<><Sparkles className="h-4 w-4" /> {report ? 'Re-analyze' : 'Analyze Expenses'}</>)}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-surface-dark-muted dark:text-slate-300 animate-fade-up">
          <AlertCircle className="h-4 w-4 shrink-0 text-slate-400" />
          AI features are temporarily unavailable.
        </div>
      )}

      {loading && !report && (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 animate-shimmer rounded-xl shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 animate-shimmer rounded-lg shimmer" />
                  <div className="h-4 w-full animate-shimmer rounded-lg shimmer" />
                  <div className="h-4 w-2/3 animate-shimmer rounded-lg shimmer" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {report && !loading && (
        <div className="space-y-3">
          {/* Health score */}
          <Card className="p-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-600/10 dark:text-brand-300">
                  <Activity className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">Financial Health</p>
                  <p className="text-3xl font-bold tabular">{report.healthScore}<span className="text-lg text-slate-400">/100</span></p>
                </div>
              </div>
              <span className={`rounded-xl px-3 py-1.5 text-sm font-bold ${healthColor(report.healthLabel)}`}>{report.healthLabel}</span>
            </div>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-surface-dark-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-700 ease-smooth" style={{ width: `${report.healthScore}%` }} />
            </div>
          </Card>

          <ReportCard icon={<FileText className="h-4 w-4" />} title="Spending Summary" text={report.summary} delay={0.05} />
          <ReportCard icon={<BarChart3 className="h-4 w-4" />} title="Spending Patterns" text={report.patterns} delay={0.1} />
          <ReportCard icon={<Trophy className="h-4 w-4" />} title="Largest Categories" text={report.largestCategories} delay={0.15} />
          <ReportCard icon={<Lightbulb className="h-4 w-4" />} title="Budget Suggestions" text={report.budgetSuggestions} delay={0.2} />
          <ReportCard icon={<TrendingDown className="h-4 w-4" />} title="Areas to Reduce" text={report.reduceAreas} delay={0.25} />
        </div>
      )}
    </div>
  );
}

function ReportCard({ icon, title, text, delay }: { icon: React.ReactNode; title: string; text: string; delay: number }) {
  if (!text) return null;
  return (
    <Card className="p-5 animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/10 dark:text-brand-300">{icon}</div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{title}</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200 text-balance">{text}</p>
        </div>
      </div>
    </Card>
  );
}

const healthColor = (label: string): string => {
  switch (label) {
    case 'Excellent': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
    case 'Good': return 'bg-brand-100 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300';
    case 'Fair': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    case 'Poor': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
    case 'Critical': return 'bg-rose-500 text-white';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }
};
