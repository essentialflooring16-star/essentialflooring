import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isConfigured } from '../../lib/supabase';
import { useT, useLang, LANGS, translate } from '../../lib/admin-i18n';
import AdminIcon, { type Name as IconName } from './AdminIcon';
import Dashboard from './Dashboard';
import PortfolioManager from './PortfolioManager';
import LeadsInbox from './LeadsInbox';
import BlogManager from './BlogManager';
import ReviewsManager from './ReviewsManager';
import SeoHealth from './SeoHealth';

/**
 * Cadrul cabinetului, taiat ca anteta publica a site-ului, ca sa se simta
 * camera din spate a aceleiasi case, nu alt produs.
 *
 * Pe telefon si tableta: bara in trei, MENU in stanga, logoul CLIENTULUI in
 * mijloc, cererile cu numarul lor in dreapta. Meniul e o cortina verde care
 * coboara de sub bara si se inchide la Escape, pe fundal si la orice navigare.
 * De la lg in sus cortina lasa locul unei sine verzi fixe, cu logoul sus.
 *
 * Sectiunile sunt sase, nu noua: textele site-ului, viteza si setarile au fost
 * scoase la cererea lui Artiom. Clientul nu are ce cauta in ele si fiecare tab
 * in plus era inca un loc in care putea strica ceva fara sa vrea.
 */

/**
 * Fundalul logoului clientului, citit din fisierul lui: #24282c, uniform pe
 * toata suprafata. Poza nu are transparenta, deci pusa pe verde se vedea ca un
 * dreptunghi lipit. Banda din capul sinei poarta exact culoarea asta, si atunci
 * logoul nu mai are margine: se termina unde se termina banda.
 */
const LOGO_INK = '#24282c';

type Tab = 'dashboard' | 'leads' | 'portfolio' | 'reviews' | 'blog' | 'seo';

const TABS: { key: Tab; icon: IconName }[] = [
  { key: 'dashboard', icon: 'traffic' },
  { key: 'leads', icon: 'leads' },
  { key: 'portfolio', icon: 'portfolio' },
  { key: 'reviews', icon: 'reviews' },
  { key: 'blog', icon: 'blog' },
  { key: 'seo', icon: 'seo' },
];

export default function AdminApp() {
  const { t } = useT();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('leads');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

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

  // Numarul de cereri necitite calatoreste pe cadru, nu pe panou: o cerere noua
  // se vede de pe orice ecran, nu doar de pe cel pe care nimeni nu-l are deschis.
  useEffect(() => {
    if (!session || !supabase) return;
    let alive = true;
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .then(({ count }) => {
        if (alive) setUnread(count ?? 0);
      });
    return () => {
      alive = false;
    };
  }, [session, tab]);

  // Cortina se inchide singura la Escape si cand ecranul se face lat: altfel un
  // meniu deschis la latime de telefon ramane peste sina, si nimic nu-l inchide.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const mq = window.matchMedia('(min-width: 1024px)');
    const onWide = () => mq.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onWide);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  function go(next: Tab) {
    setTab(next);
    setOpen(false);
  }

  if (!isConfigured) {
    return (
      <Centered>
        <h1 className="font-display font-semibold text-2xl text-fg">{t('app.not_connected_title')}</h1>
        <p className="mt-3 text-[15px] text-fg-muted leading-relaxed">{t('app.not_connected_body')}</p>
      </Centered>
    );
  }

  if (!ready) {
    return (
      <Centered>
        <p className="text-fg-muted">{t('app.loading')}</p>
      </Centered>
    );
  }

  if (!session) return <Login />;

  const signOut = () => supabase!.auth.signOut();

  return (
    <div className="min-h-dvh bg-surface">
      {/* ─────────────────────────────────────────────── sina, de la desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col justify-between bg-surface-dark px-5 py-6 lg:flex">
        <div>
          <div className="-mx-5 -mt-6 px-5 pb-5 pt-6" style={{ backgroundColor: LOGO_INK }}>
            <img
              src="/admin/logo.webp"
              alt={t('app.brand')}
              width={640}
              height={243}
              className="w-full"
            />
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-fg-on-dark/55">
            {t('app.subtitle')}
          </p>
          <nav className="mt-7 flex flex-col gap-1" aria-label={t('app.nav_label')}>
            {TABS.map(({ key, icon }, i) => (
              <RailLink
                key={key}
                icon={icon}
                label={t(`app.tab_${key}`)}
                badge={key === 'leads' ? unread : 0}
                current={tab === key}
                onClick={() => go(key)}
                index={i}
              />
            ))}
          </nav>
        </div>
        <div className="grid gap-3">
          <LangSwitch onDark full />
          <a
            href="/"
            className="flex items-center gap-2.5 rounded-btn border border-fg-on-dark/20 px-3.5 py-2.5 text-[13.5px] font-semibold text-fg-on-dark/80 transition-colors hover:border-accent-on-dark hover:text-fg-on-dark"
          >
            <AdminIcon name="external" size={17} />
            {t('app.view_site')}
          </a>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2.5 rounded-btn px-3.5 py-2.5 text-[13.5px] font-semibold text-fg-on-dark/60 transition-colors hover:text-fg-on-dark"
          >
            <AdminIcon name="signout" size={17} />
            {t('app.sign_out')}
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────── bara in trei, pe telefon */}
      <header
        className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 lg:hidden"
        style={{ backgroundColor: LOGO_INK }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="justify-self-start flex items-center gap-2 rounded-btn px-2.5 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-fg-on-dark transition-colors hover:text-accent-on-dark"
        >
          <AdminIcon name={open ? 'close' : 'menu'} size={20} />
          {open ? t('app.close') : t('app.menu')}
        </button>

        <img
          src="/admin/logo.webp"
          alt={t('app.brand')}
          width={640}
          height={243}
          className="h-11 w-auto justify-self-center"
        />

        <button
          type="button"
          onClick={() => go('leads')}
          className="justify-self-end flex items-center gap-2 rounded-btn px-2.5 py-2 text-fg-on-dark transition-colors hover:text-accent-on-dark"
          aria-label={t('app.tab_leads')}
        >
          <AdminIcon name="leads" size={20} />
          {unread > 0 && (
            <span className="min-w-[1.35rem] rounded-full bg-accent-on-dark px-1.5 py-0.5 text-center text-[11.5px] font-bold text-fg">
              {unread}
            </span>
          )}
        </button>
      </header>

      {/* ─────────────────────────────────────────────────────────── cortina */}
      {open && (
        <>
          <button
            type="button"
            aria-label={t('app.close')}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-scrim/50 lg:hidden"
          />
          <div className="fixed inset-x-0 top-[64px] z-40 overflow-hidden shadow-lift lg:hidden">
          <nav
            aria-label={t('app.nav_label')}
            className="admin-curtain grid gap-1 bg-surface-dark px-4 pb-6 pt-2"
          >
            {TABS.map(({ key, icon }) => (
              <RailLink
                key={key}
                icon={icon}
                label={t(`app.tab_${key}`)}
                badge={key === 'leads' ? unread : 0}
                current={tab === key}
                onClick={() => go(key)}
                index={0}
                animate={false}
              />
            ))}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-fg-on-dark/15 pt-4">
              <LangSwitch onDark />
              <div className="flex items-center gap-1">
                <a
                  href="/"
                  aria-label={t('app.view_site')}
                  className="rounded-btn p-2.5 text-fg-on-dark/75 transition-colors hover:text-fg-on-dark"
                >
                  <AdminIcon name="external" size={19} />
                </a>
                <button
                  type="button"
                  onClick={signOut}
                  aria-label={t('app.sign_out')}
                  className="rounded-btn p-2.5 text-fg-on-dark/75 transition-colors hover:text-fg-on-dark"
                >
                  <AdminIcon name="signout" size={19} />
                </button>
              </div>
            </div>
          </nav>
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── continut */}
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-8 sm:pt-10">
          {/* Cheia pe tab remonteaza panoul, deci intrarea se joaca la fiecare
              schimbare de sectiune, nu doar o data la incarcarea paginii. */}
          <div key={tab} className="m-intro">
            {tab === 'dashboard' && <Dashboard />}
            {tab === 'leads' && <LeadsInbox />}
            {tab === 'portfolio' && <PortfolioManager />}
            {tab === 'reviews' && <ReviewsManager />}
            {tab === 'blog' && <BlogManager />}
            {tab === 'seo' && <SeoHealth />}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Logoul clientului pe fundalul lui, pentru capul ecranului de autentificare. */
function Logo() {
  const { t } = useT();
  return (
    <div className="text-center">
      <img
        src="/admin/logo.webp"
        alt={t('app.brand')}
        width={640}
        height={243}
        className="mx-auto w-full max-w-[212px]"
      />
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-fg-on-dark/55">{t('app.subtitle')}</p>
    </div>
  );
}

function RailLink({
  icon,
  label,
  badge,
  current,
  onClick,
  index,
  animate = true,
}: {
  icon: IconName;
  label: string;
  badge: number;
  current: boolean;
  onClick: () => void;
  index: number;
  /** In cortina, panoul intreg coboara deja; inca o intrare pe fiecare link
      s-ar bate cu ea si ar parea ca elementele vin din alta parte. */
  animate?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      style={{ '--i': index } as React.CSSProperties}
      className={`${animate ? 'm-intro' : ''} group flex items-center gap-3 rounded-btn px-3.5 py-3 text-left text-[14.5px] font-semibold transition-colors ${
        current
          ? 'bg-accent-on-dark text-fg'
          : 'text-fg-on-dark/70 hover:bg-fg-on-dark/10 hover:text-fg-on-dark'
      }`}
    >
      <span className="transition-transform duration-200 group-hover:-translate-y-px">
        <AdminIcon name={icon} size={21} />
      </span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span
          className={`min-w-[1.4rem] rounded-full px-1.5 py-0.5 text-center text-[11.5px] font-bold ${
            current ? 'bg-fg text-fg-on-dark' : 'bg-accent-on-dark text-fg'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-lg rounded-card border border-hairline bg-surface-raised p-8 text-center shadow-card">
        {children}
      </div>
    </div>
  );
}

function Login() {
  const { t } = useT();
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
    if (error) setError(t('app.login_error'));
    setBusy(false);
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="m-intro w-full max-w-sm overflow-hidden rounded-card border border-hairline bg-surface-raised shadow-lift"
      >
        <div className="px-8 pb-7 pt-8" style={{ backgroundColor: LOGO_INK }}>
          <Logo />
        </div>
        <div className="p-8">
          <div className="mb-6 flex justify-center">
            <LangSwitch />
          </div>
          <label className="mb-4 grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">{t('app.email_label')}</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </label>
          <label className="mb-6 grid gap-1.5">
            <span className="text-[14px] font-semibold text-fg-body">{t('app.password_label')}</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-card border border-hairline bg-field px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </label>
          {error && (
            <p className="mb-4 rounded-card border border-red-200 bg-red-50 px-4 py-2.5 text-[14px] text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-btn bg-accent py-3 font-semibold text-fg-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? t('app.signing_in') : t('app.sign_in')}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Comutatorul de limba. Sta si in cadru, si pe ecranul de autentificare: cine
 * deschide cabinetul si nu stie romana trebuie sa poata trece pe engleza
 * inainte sa se poata autentifica, nu dupa.
 */
function LangSwitch({ onDark = false, full = false }: { onDark?: boolean; full?: boolean }) {
  const [lang, setLang] = useLang();
  return (
    <div
      className={`overflow-hidden rounded-btn border ${full ? 'flex w-full' : 'inline-flex'} ${
        onDark ? 'border-fg-on-dark/20' : 'border-hairline'
      }`}
      role="group"
      aria-label={translate(lang, 'app.lang_label')}
    >
      {LANGS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          className={`px-3 py-2 text-[13px] font-semibold transition-colors ${full ? 'flex-1' : ''} ${
            lang === option.code
              ? onDark
                ? 'bg-accent-on-dark text-fg'
                : 'bg-control-dark text-fg-on-dark'
              : onDark
                ? 'text-fg-on-dark/55 hover:text-fg-on-dark'
                : 'bg-surface-raised text-fg-muted hover:text-fg-body'
          }`}
        >
          {option.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
