import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  accent?: boolean;
}

export function StatCard({ label, value, icon, trend, trendUp, delay = 0, accent = false }: StatCardProps) {
  return (
    <div
      className={`card card-hover group p-5 animate-fade-up ${accent ? 'border-brand-200 dark:border-brand-800/50' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
          accent
            ? 'bg-brand-600 text-white'
            : 'bg-slate-100 text-slate-600 dark:bg-surface-dark-muted dark:text-slate-300'
        }`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-stat tabular">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
