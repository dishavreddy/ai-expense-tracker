interface SpinnerProps {
  size?: number;
  className?: string;
  color?: string;
}

export function Spinner({ size = 20, className = '', color = '#2563eb' }: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin-slow rounded-full border-2 border-slate-200 dark:border-slate-700 ${className}`}
      style={{ width: size, height: size, borderTopColor: color }}
      aria-label="Loading"
      role="status"
    />
  );
}
