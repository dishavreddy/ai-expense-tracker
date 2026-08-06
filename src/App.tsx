import { lazy, Suspense, useState } from 'react';
import type { PageId } from './types';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { useIncomes } from './hooks/useIncomes';
import { useBudgets } from './hooks/useBudgets';
import { useRecurring } from './hooks/useRecurring';
import { useSettings } from './hooks/useSettings';
import { useProfile } from './hooks/useProfile';
import { useToast } from './hooks/useToast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { Spinner } from './components/Spinner';

const AuthScreen = lazy(() => import('./components/pages/AuthScreen').then((m) => ({ default: m.AuthScreen })));

const Dashboard = lazy(() => import('./components/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Transactions = lazy(() => import('./components/pages/Transactions').then((m) => ({ default: m.Transactions })));
const AddExpense = lazy(() => import('./components/pages/AddExpense').then((m) => ({ default: m.AddExpense })));
const Analytics = lazy(() => import('./components/pages/Analytics').then((m) => ({ default: m.Analytics })));
const AIAnalysis = lazy(() => import('./components/pages/AIAnalysis').then((m) => ({ default: m.AIAnalysis })));
const AskAI = lazy(() => import('./components/pages/AskAI').then((m) => ({ default: m.AskAI })));
const Budgets = lazy(() => import('./components/pages/Budgets').then((m) => ({ default: m.Budgets })));
const Recurring = lazy(() => import('./components/pages/Recurring').then((m) => ({ default: m.Recurring })));
const Reports = lazy(() => import('./components/pages/Reports').then((m) => ({ default: m.Reports })));
const Profile = lazy(() => import('./components/pages/Profile').then((m) => ({ default: m.Profile })));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size={32} />
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const { user, loading: authLoading, signOut } = useAuth();

  const { expenses, loading: expLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { incomes, addIncome } = useIncomes();
  const { budgets, setBudget, deleteBudget } = useBudgets();
  const { recurring, addRecurring, toggleRecurring, deleteRecurring } = useRecurring();
  const { settings, updateSettings } = useSettings();
  const { profile } = useProfile();
  const toast = useToast();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-soft dark:bg-surface-dark">
        <Spinner size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner size={32} /></div>}>
        <AuthScreen />
      </Suspense>
    );
  }

  const handleToggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            expenses={expenses}
            incomes={incomes}
            settings={settings}
            budgets={budgets}
            onGoAdd={() => setPage('add')}
            onGoBudgets={() => setPage('budgets')}
          />
        );
      case 'transactions':
        return (
          <Transactions
            expenses={expenses}
            loading={expLoading}
            currency={settings.currency}
            onUpdate={updateExpense}
            onDelete={deleteExpense}
            onGoAdd={() => setPage('add')}
            onToast={toast}
          />
        );
      case 'add':
        return (
          <AddExpense
            onAdd={async (input) => {
              const result = await addExpense(input);
              if (result) toast.success('Expense saved');
              else toast.error('Could not save expense');
            }}
            onAddIncome={async (input) => {
              const result = await addIncome(input);
              if (result) toast.success('Income added');
              else toast.error('Could not add income');
            }}
            onDone={() => setPage('dashboard')}
            currency={settings.currency}
            onToast={toast}
          />
        );
      case 'analytics':
        return <Analytics expenses={expenses} currency={settings.currency} />;
      case 'ai-analysis':
        return (
          <AIAnalysis
            expenses={expenses}
            incomes={incomes}
            budgets={budgets}
            currency={settings.currency}
            onGoAdd={() => setPage('add')}
          />
        );
      case 'ask':
        return (
          <AskAI
            expenses={expenses}
            currency={settings.currency}
            onGoAdd={() => setPage('add')}
          />
        );
      case 'budgets':
        return (
          <Budgets
            expenses={expenses}
            budgets={budgets}
            currency={settings.currency}
            onSetBudget={setBudget}
            onDeleteBudget={deleteBudget}
            onToast={toast}
          />
        );
      case 'recurring':
        return (
          <Recurring
            recurring={recurring}
            onAdd={addRecurring}
            onToggle={toggleRecurring}
            onDelete={deleteRecurring}
            currency={settings.currency}
            onToast={toast}
          />
        );
      case 'reports':
        return (
          <Reports
            expenses={expenses}
            incomes={incomes}
            budgets={budgets}
            currency={settings.currency}
            profileName={profile.name}
            onToast={toast}
          />
        );
      case 'profile':
        return (
          <Profile
            profile={profile}
            expenses={expenses}
            incomes={incomes}
            currency={settings.currency}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onUpdate={updateSettings}
            onToast={toast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-soft dark:bg-surface-dark">
      <Sidebar
        active={page}
        onChange={setPage}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        profileName={profile.name}
        profileEmail={profile.email}
        onSignOut={signOut}
      />

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Header page={page} onQuickAdd={() => setPage('add')} />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </div>
        </main>
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}
