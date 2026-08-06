import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-floating animate-toast-in"
        >
          {t.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />}
          {t.type === 'error' && <XCircle className="h-4 w-4 shrink-0 text-rose-500" />}
          {t.type === 'info' && <Info className="h-4 w-4 shrink-0 text-brand-500" />}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
