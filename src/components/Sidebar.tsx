import { useState } from 'react';
import {
  LayoutDashboard,
  List,
  PlusCircle,
  BarChart3,
  Sparkles,
  MessageSquare,
  Wallet,
  Repeat,
  FileText,
  User,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import type { PageId, ThemeMode } from '../types';

interface SidebarProps {
  active: PageId;
  onChange: (page: PageId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  profileName: string;
  profileEmail: string;
  onSignOut: () => void;
}

const NAV_GROUPS: { label: string; items: { id: PageId; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'transactions', label: 'Transactions', icon: List },
      { id: 'add', label: 'Add Transaction', icon: PlusCircle },
      { id: 'budgets', label: 'Budgets', icon: Wallet },
      { id: 'recurring', label: 'Recurring', icon: Repeat },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'ai-analysis', label: 'AI Analysis', icon: Sparkles },
      { id: 'ask', label: 'Ask AI', icon: MessageSquare },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar({
  active,
  onChange,
  theme,
  onToggleTheme,
  profileName,
  profileEmail,
  onSignOut,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (page: PageId) => {
    onChange(page);
    setMobileOpen(false);
  };

  const initials = profileName.trim()
    ? profileName.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-slate-800 dark:bg-surface-dark/80 md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">ExpenseAI</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 dark:border-slate-700"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-floating animate-slide-right dark:bg-surface-dark">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white">
                  <Wallet className="h-4 w-4" />
                </div>
                <span className="text-base font-semibold">ExpenseAI</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 dark:border-slate-700"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavContent
              active={active}
              onNav={handleNav}
              collapsed={false}
              theme={theme}
              onToggleTheme={onToggleTheme}
              initials={initials}
              profileName={profileName}
              profileEmail={profileEmail}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200/70 bg-white transition-all duration-300 ease-smooth dark:border-slate-800 dark:bg-surface-dark lg:flex ${sidebarWidth}`}>
        {/* Logo — clickable to toggle collapse */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`flex items-center gap-2.5 px-5 py-5 transition-colors hover:bg-slate-50 dark:hover:bg-surface-dark-muted ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition-transform duration-200 hover:scale-105">
            <Wallet className="h-5 w-5" />
          </div>
          {!collapsed && <span className="text-lg font-semibold tracking-tight">ExpenseAI</span>}
        </button>

        <NavContent
          active={active}
          onNav={handleNav}
          collapsed={collapsed}
          theme={theme}
          onToggleTheme={onToggleTheme}
          initials={initials}
          profileName={profileName}
          profileEmail={profileEmail}
          onSignOut={onSignOut}
        />
      </aside>
    </>
  );
}

function NavContent({
  active,
  onNav,
  collapsed,
  theme,
  onToggleTheme,
  initials,
  profileName,
  profileEmail,
  onSignOut,
}: {
  active: PageId;
  onNav: (p: PageId) => void;
  collapsed: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  initials: string;
  profileName: string;
  profileEmail: string;
  onSignOut: () => void;
}) {
  return (
    <>
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-2 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNav(item.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-surface-dark-muted dark:hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 h-5 w-0.5 rounded-full bg-brand-600" />
                    )}
                    <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={onToggleTheme}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-dark-muted ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? (theme === 'light' ? 'Dark mode' : 'Light mode') : undefined}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {!collapsed && (theme === 'light' ? 'Dark mode' : 'Light mode')}
        </button>
      </div>

      {/* Profile section */}
      <div className="border-t border-slate-200/70 p-3 dark:border-slate-800">
        <button
          onClick={() => onNav('profile')}
          className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-100 dark:hover:bg-surface-dark-muted ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? profileName : undefined}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profileName || 'User'}</p>
              <p className="truncate text-xs text-slate-400">{profileEmail || '—'}</p>
            </div>
          )}
        </button>
        <button
          onClick={onSignOut}
          className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-400 dark:hover:bg-rose-500/10 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </>
  );
}
