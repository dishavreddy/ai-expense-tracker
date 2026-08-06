import { useState } from 'react';
import { Wallet, Mail, Lock, Loader2, ArrowRight, TrendingDown, BarChart3, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setInfo(null);
    setBusy(true);

    if (mode === 'signup') {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        setError(error);
        setBusy(false);
        return;
      }
      setInfo('Account created. If email confirmation is enabled, check your inbox before signing in.');
      setMode('login');
      setPassword('');
      setBusy(false);
    } else {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setError(error);
        setBusy(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 dark:bg-surface-dark">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-floating dark:border-slate-800 dark:bg-surface-dark lg:grid-cols-2">
        {/* Left — branding / hero */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white lg:flex">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ExpenseAI</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight">
              Spend smarter.<br />Save effortlessly.
            </h1>
            <p className="text-sm leading-relaxed text-white/80">
              Track expenses, set budgets, and get AI-powered insights into your spending habits — all in one beautiful place.
            </p>
            <div className="space-y-3">
              {[
                { icon: TrendingDown, text: 'Real-time expense tracking' },
                { icon: BarChart3, text: 'Visual analytics & reports' },
                { icon: Sparkles, text: 'AI financial analysis' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-sm">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <span className="text-white/90">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/50">Your data is private and secure.</p>
        </div>

        {/* Right — form */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ExpenseAI</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? 'Sign in to access your financial dashboard'
              : 'Start tracking your expenses in seconds'}
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}

          {info && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-10"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setInfo(null);
              }}
              className="font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-300"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
