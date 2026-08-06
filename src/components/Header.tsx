import { PlusCircle } from 'lucide-react';
import type { PageId } from '../types';

interface HeaderProps {
  page: PageId;
  onQuickAdd: () => void;
}

const PAGE_TITLES: Record<PageId, { title: string; crumb: string }> = {
  dashboard: { title: 'Dashboard', crumb: 'Overview' },
  analytics: { title: 'Analytics', crumb: 'Overview' },
  transactions: { title: 'Transactions', crumb: 'Manage' },
  add: { title: 'Add Transaction', crumb: 'Manage' },
  budgets: { title: 'Budgets', crumb: 'Manage' },
  recurring: { title: 'Recurring Expenses', crumb: 'Manage' },
  'ai-analysis': { title: 'AI Analysis', crumb: 'Intelligence' },
  ask: { title: 'Ask AI', crumb: 'Intelligence' },
  reports: { title: 'Reports', crumb: 'Account' },
  profile: { title: 'Profile', crumb: 'Account' },
  settings: { title: 'Settings', crumb: 'Account' },
};

export function Header({ page, onQuickAdd }: HeaderProps) {
  const info = PAGE_TITLES[page] ?? { title: 'Dashboard', crumb: 'Overview' };

  return (
    <>
      {/* Desktop header */}
      <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-slate-200/70 bg-white/80 px-8 py-4 backdrop-blur-lg dark:border-slate-800 dark:bg-surface-dark/80 lg:flex">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">{info.crumb}</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-semibold text-slate-900 dark:text-white">{info.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onQuickAdd}
            className="btn-primary"
          >
            <PlusCircle className="h-4 w-4" />
            Add Transaction
          </button>
        </div>
      </header>

      {/* Mobile header — visible below the mobile top bar */}
      <header className="flex items-center justify-between px-4 py-3 lg:hidden">
        <h1 className="text-lg font-bold tracking-tight">{info.title}</h1>
        <button
          onClick={onQuickAdd}
          className="btn-primary px-3 py-2 text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Add
        </button>
      </header>
    </>
  );
}
