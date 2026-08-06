import { useCallback, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string) => show(message, 'success'),
    [show],
  );
  const error = useCallback(
    (message: string) => show(message, 'error'),
    [show],
  );
  const info = useCallback(
    (message: string) => show(message, 'info'),
    [show],
  );

  return { toasts, show, success, error, info, dismiss };
}
