import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-up">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-surface-dark-muted dark:text-slate-500">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {message}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
