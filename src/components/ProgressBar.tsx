interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = value > max;

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-surface-dark-muted ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-smooth ${
          over ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-brand-600'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
