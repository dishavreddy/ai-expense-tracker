import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { Expense, TimeRange, CurrencyCode } from '../../types';
import { byCategory, monthlyBars, spendingTrend } from '../../lib/selectors';
import { formatCurrency, formatCompact } from '../../lib/format';
import { CHART_COLORS } from '../../constants';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';

interface AnalyticsProps {
  expenses: Expense[];
  currency: CurrencyCode;
}

const RANGE_LABELS: Record<TimeRange, string> = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

export function Analytics({ expenses, currency }: AnalyticsProps) {
  const [range, setRange] = useState<TimeRange>('monthly');
  const [loading] = useState(false);

  const slices = useMemo(() => byCategory(expenses), [expenses]);
  const bars = useMemo(() => monthlyBars(expenses, 6), [expenses]);
  const trend = useMemo(() => spendingTrend(expenses, range), [expenses, range]);

  if (expenses.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No data to analyze" message="Add some expenses to see charts and spending trends." />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Visualize your spending patterns</p>
      </div>

      {/* Range switcher */}
      <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-700">
        {(Object.keys(RANGE_LABELS) as TimeRange[]).map((r) => (
          <button key={r} onClick={() => setRange(r)} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${range === r ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Category pie */}
      <Card className="p-6 animate-fade-up">
        <h2 className="mb-4 text-sm font-semibold">Category Breakdown</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} paddingAngle={3} stroke="none" startAngle={90} endAngle={-270}
                label={(entry: { label?: string; percent?: number }) => entry.percent && entry.percent > 0.05 ? `${entry.label ?? ''} ${(entry.percent * 100).toFixed(0)}%` : ''}
                labelLine={false} style={{ fontSize: '11px' }}>
                {slices.map((s, i) => <Cell key={s.category} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v), currency)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly bars */}
        <Card className="p-6 animate-fade-up" >
          <h2 className="mb-4 text-sm font-semibold">Monthly Expenses</h2>
          {loading ? <ChartSkeleton /> : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCompact(Number(v), currency)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v), currency)} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Trend line */}
        <Card className="p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="mb-4 text-sm font-semibold">Spending Trend ({RANGE_LABELS[range]})</h2>
          {loading ? <ChartSkeleton /> : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCompact(Number(v), currency)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v), currency)} />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-56 space-y-3">
      <div className="h-full w-full animate-shimmer rounded-xl shimmer" />
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
