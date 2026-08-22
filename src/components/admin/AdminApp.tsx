import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isConfigured } from '../../lib/supabase';
import Dashboard from './Dashboard';
import PortfolioManager from './PortfolioManager';
import LeadsInbox from './LeadsInbox';
import BlogManager from './BlogManager';

type Tab = 'dashboard' | 'portfolio' | 'leads' | 'blog';

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isConfigured) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg mt-24 rounded-2xl border border-line bg-paper p-8 shadow-card text-center">
          <h1 className="font-display font-semibold text-2xl text-ink">Admin is not connected yet</h1>
          <p className="mt-3 text-[15px] text-coffee leading-relaxed">
            Supabase environment variables are missing. Add PUBLIC_SUPABASE_URL and
            PUBLIC_SUPABASE_ANON_KEY, then redeploy. See docs/SETUP-RO.md in the project.
          </p>
        </div>
      </Shell>
    );
  }

  if (!ready) {
    return (
      <Shell>
        <p className="text-center mt-24 text-coffee">Loading...</p>
      </Shell>
    );
  }

  if (!session) return <Login />;

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-line">
        <div>
          <p className="font-display font-semibold text-2xl text-ink">Essential Flooring</p>
          <p className="text-[13px] uppercase tracking-[0.16em] text-coffee mt-0.5">Admin cabinet</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="rounded-full border border-line px-4 py-2 text-[14px] font-medium text-bark hover:border-oak transition-colors"
          >
            View website
          </a>
          <button
            type="button"
            onClick={() => supabase!.auth.signOut()}
            className="rounded-full bg-ink text-cream px-4 py-2 text-[14px] font-medium hover:bg-bark transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex gap-2 mt-6 mb-8" aria-label="Admin sections">
        {(
          [
            ['dashboard', 'Traffic'],
            ['portfolio', 'Portfolio'],
            ['leads', 'Leads'],
            ['blog', 'Blog'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-5 py-2.5 text-[14.5px] font-semibold transition-colors ${
              tab === key ? 'bg-oak text-white' : 'bg-paper border border-line text-bark hover:border-oak'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'dashboard' && <Dashboard />}
      {tab === 'portfolio' && <PortfolioManager />}
      {tab === 'leads' && <LeadsInbox />}
      {tab === 'blog' && <BlogManager />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">{children}</div>;
}

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const { error } = await supabase!.auth.signInWithPassword({
      email: String(data.get('email')),
      password: String(data.get('password')),
    });
    if (error) setError('Wrong email or password.');
    setBusy(false);
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-line bg-paper p-8 shadow-lift"
      >
        <p className="font-display font-semibold text-2xl text-ink text-center">Essential Flooring</p>
        <p className="text-[13px] uppercase tracking-[0.16em] text-coffee text-center mt-1 mb-7">
          Admin sign in
        </p>
        <label className="grid gap-1.5 mb-4">
          <span className="text-[14px] font-semibold text-bark">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="rounded-xl border border-line bg-cream px-4 py-3 text-[15px] outline-none focus:border-oak focus:ring-2 focus:ring-oak/25 transition"
          />
        </label>
        <label className="grid gap-1.5 mb-6">
          <span className="text-[14px] font-semibold text-bark">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-xl border border-line bg-cream px-4 py-3 text-[15px] outline-none focus:border-oak focus:ring-2 focus:ring-oak/25 transition"
          />
        </label>
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[14px] px-4 py-2.5">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-oak hover:bg-oak-deep disabled:opacity-60 text-white font-semibold py-3 transition-colors"
        >
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
