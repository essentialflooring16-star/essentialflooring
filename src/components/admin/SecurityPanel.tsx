import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useT } from '../../lib/admin-i18n';
import AdminIcon from './AdminIcon';

/**
 * Verificarea in doi pasi, pe Supabase Auth (TOTP).
 *
 * Doua ecrane traiesc aici: panoul din cabinet, de unde se porneste si se
 * opreste, si ecranul care cere codul la intrare. Stau in acelasi fisier
 * fiindca impart aceleasi capcane si acelasi dictionar.
 *
 * Ecranul NU este bariera. Un gard scris in React se ocoleste, iar /admin e
 * static si public. Bariera reala e in baza de date: is_admin() din
 * supabase/schema.sql cere aal2 din momentul in care contul are un factor
 * confirmat, deci cine stie doar parola nu poate citi nimic nici lovind direct
 * API-ul cu cheia anon, care e publica prin design.
 */

/** Codurile TOTP au sase cifre. Campul nu primeste altceva. */
function onlyDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

/**
 * Numele factorului trebuie sa fie unic pe cont, iar o eticheta stampilata la
 * minut se repeta daca doua inrolari cad in acelasi minut. De aceea numele
 * primeste un sufix la a doua incercare, in loc sa esueze cu
 * mfa_factor_name_conflict in fata clientului.
 */
function factorName(attempt: number): string {
  const now = new Date();
  const stamp = now.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return attempt === 0 ? `Telefon ${stamp}` : `Telefon ${stamp} (${attempt + 1})`;
}

type Enrol = { factorId: string; qr: string; secret: string };

export default function SecurityPanel({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [hasFactor, setHasFactor] = useState<boolean | null>(null);
  const [enrol, setEnrol] = useState<Enrol | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  // listFactors() intreaba serverul, deci raspunde corect si daca inrolarea s-a
  // facut din alt browser. nextLevel din getAuthenticatorAssuranceLevel() citeste
  // sesiunea locala, care poate fi invechita, si nu are ce cauta aici.
  async function refresh() {
    try {
      const { data, error } = await supabase!.auth.mfa.listFactors();
      if (error) {
        setHasFactor(false);
        return;
      }
      setHasFactor((data?.totp ?? []).some((f) => f.status === 'verified'));
    } catch {
      setHasFactor(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  /**
   * Inrolarile abandonate lasa in urma factori neconfirmati, care se aduna la
   * fiecare incercare. Se curata inainte de una noua. Factorii CONFIRMATI nu se
   * ating niciodata aici: cine isi schimba telefonul trebuie sa ramana cu cel
   * vechi functional pana confirma noul cod.
   */
  async function clearUnverified() {
    const { data } = await supabase!.auth.mfa.listFactors();
    const stale = (data?.all ?? []).filter((f) => f.status === 'unverified');
    for (const f of stale) {
      await supabase!.auth.mfa.unenroll({ factorId: f.id });
    }
  }

  // Orice apel de aici poate si sa arunce, nu doar sa intoarca { error }. Fara
  // try/finally, o retea cazuta lasa butonul pe "se pregateste" pentru
  // totdeauna, fara niciun mesaj, si clientul crede ca s-a blocat cabinetul.
  async function start() {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await clearUnverified();
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { data, error } = await supabase!.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: factorName(attempt),
        });
        if (!error && data) {
          setEnrol({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
          setCode('');
          return;
        }
        // Numai conflictul de nume merita reincercat. Orice altceva e eroare reala.
        if (!String(error?.message ?? '').includes('already exists')) break;
      }
      setError(t('security.failed'));
    } catch {
      setError(t('security.failed'));
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enrol || code.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase!.auth.mfa.challengeAndVerify({
        factorId: enrol.factorId,
        code,
      });
      if (error) {
        setError(t('security.bad_code'));
        setCode('');
        return;
      }
      setEnrol(null);
      setNote(t('security.enrolled'));
      await refresh();
    } catch {
      setError(t('security.failed'));
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setError(null);
    try {
      const { data } = await supabase!.auth.mfa.listFactors();
      for (const f of data?.all ?? []) {
        await supabase!.auth.mfa.unenroll({ factorId: f.id });
      }
      setAsking(false);
      setNote(t('security.turned_off'));
      await refresh();
    } catch {
      setError(t('security.failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <header>
        <p className="eyebrow on-light mb-4">{t('security.subtitle')}</p>
        <h1 className="font-display font-semibold text-3xl text-fg">{t('security.title')}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">{t('security.intro')}</p>
      </header>

      <div className="mt-8 rounded-card border border-hairline bg-surface-raised p-7 shadow-card">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-10 w-10 place-items-center rounded-full ${
              hasFactor ? 'bg-accent/15 text-accent-on-light' : 'bg-surface-sunken text-fg-muted'
            }`}
          >
            <AdminIcon name="shield" size={22} />
          </span>
          <div>
            <p className="font-display font-semibold text-lg text-fg">
              {hasFactor ? t('security.status_on') : t('security.status_off')}
            </p>
            <p className="text-[15px] text-fg-muted">
              {hasFactor ? t('security.on_body') : t('security.off_body')}
            </p>
          </div>
        </div>

        {note && (
          <p className="mt-6 rounded-card bg-accent/10 px-4 py-3 text-[14.5px] text-accent-on-light">
            {note}
          </p>
        )}
        {error && (
          <p className="mt-6 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-[14.5px] text-red-700">
            {error}
          </p>
        )}

        {/* ─────────────────────────────────────────── pornirea, pas cu pas */}
        {!hasFactor && !enrol && (
          <button
            type="button"
            onClick={start}
            disabled={busy}
            className="mt-7 w-full rounded-btn bg-accent py-3 font-semibold text-fg-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60 sm:w-auto sm:px-7"
          >
            {busy ? t('security.starting') : t('security.start')}
          </button>
        )}

        {enrol && (
          <form onSubmit={confirm} className="mt-7 grid gap-5">
            <p className="text-[15px] leading-relaxed text-fg-body">{t('security.step_app')}</p>
            <p className="text-[15px] leading-relaxed text-fg-body">{t('security.step_scan')}</p>

            <div className="grid justify-items-center gap-4 rounded-card bg-surface-sunken/70 p-6">
              <QrCode value={enrol.qr} />
              <div className="text-center">
                <p className="text-[13.5px] text-fg-muted">{t('security.manual_label')}</p>
                <code className="mt-1.5 block break-all font-mono text-[15px] tracking-[0.08em] text-fg">
                  {enrol.secret}
                </code>
              </div>
            </div>

            <label className="grid gap-1.5">
              <span className="text-[15px] leading-relaxed text-fg-body">{t('security.step_code')}</span>
              <input
                value={code}
                onChange={(e) => setCode(onlyDigits(e.target.value))}
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={t('security.code_label')}
                placeholder="000000"
                className="w-full rounded-card border border-hairline bg-field px-4 py-3 text-center font-mono text-[22px] tracking-[0.35em] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 sm:w-56"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="rounded-btn bg-accent px-7 py-3 font-semibold text-fg-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {busy ? t('security.confirming') : t('security.confirm')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnrol(null);
                  setError(null);
                }}
                className="rounded-btn px-5 py-3 font-semibold text-fg-muted transition-colors hover:text-fg"
              >
                {t('security.cancel')}
              </button>
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────── oprirea */}
        {hasFactor && !asking && (
          <div className="mt-7 grid gap-4">
            <p className="text-[14.5px] leading-relaxed text-fg-muted">{t('security.new_phone')}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={start}
                disabled={busy}
                className="rounded-btn bg-accent px-6 py-3 font-semibold text-fg-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {busy ? t('security.starting') : t('security.start')}
              </button>
              <button
                type="button"
                onClick={() => setAsking(true)}
                className="rounded-btn px-5 py-3 font-semibold text-fg-muted transition-colors hover:text-fg"
              >
                {t('security.turn_off')}
              </button>
            </div>
          </div>
        )}

        {asking && (
          <div className="mt-7 grid gap-4 rounded-card bg-surface-sunken/70 p-6">
            <p className="text-[15px] leading-relaxed text-fg-body">{t('security.turn_off_ask')}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={turnOff}
                disabled={busy}
                className="rounded-btn bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? t('security.turning_off') : t('security.turn_off_yes')}
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="rounded-btn px-5 py-3 font-semibold text-fg-muted transition-colors hover:text-fg"
              >
                {t('security.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-8 inline-flex items-center gap-2 rounded-btn px-4 py-2.5 text-[14.5px] font-semibold text-fg-muted transition-colors hover:text-fg"
      >
        {t('security.back')}
      </button>
    </div>
  );
}

/**
 * Supabase intoarce codul QR ca SVG. In unele versiuni e un data URL, in altele
 * markup brut, deci componenta primeste si una, si alta: altfel clientul vede un
 * dreptunghi gol si nu are ce scana.
 */
function QrCode({ value }: { value: string }) {
  if (value.trim().startsWith('<svg')) {
    return (
      <div
        className="h-[196px] w-[196px] rounded-card bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }
  return (
    <img
      src={value}
      alt=""
      width={196}
      height={196}
      className="h-[196px] w-[196px] rounded-card bg-white p-2"
    />
  );
}

/**
 * Ecranul de la intrare: parola a trecut, sesiunea exista, dar are aal1. Pana
 * la codul din telefon nu se vede nimic din cabinet, iar baza de date nu ar
 * raspunde oricum.
 */
export function MfaChallenge({ onPassed, onSignOut }: { onPassed: () => void; onSignOut: () => void }) {
  const { t } = useT();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const { data, error: listError } = await supabase!.auth.mfa.listFactors();
      const factor = (data?.totp ?? []).find((f) => f.status === 'verified');
      if (listError || !factor) {
        setError(t('security.failed'));
        setBusy(false);
        return;
      }
      const { error } = await supabase!.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
      if (error) {
        setError(t('security.bad_code'));
        setCode('');
        setBusy(false);
        input.current?.focus();
        return;
      }
      onPassed();
    } catch {
      setError(t('security.failed'));
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="m-intro w-full max-w-sm overflow-hidden rounded-card border border-hairline bg-surface-raised shadow-lift"
      >
        <div className="px-8 pb-7 pt-8" style={{ backgroundColor: '#24282c' }}>
          <div className="text-center">
            <img
              src="/admin/logo.webp"
              alt={t('app.brand')}
              width={640}
              height={243}
              className="mx-auto w-full max-w-[212px]"
            />
            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-fg-on-dark/55">
              {t('app.subtitle')}
            </p>
          </div>
        </div>
        <div className="p-8">
          <h1 className="font-display font-semibold text-xl text-fg">{t('security.challenge_title')}</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">
            {t('security.challenge_body')}
          </p>
          <input
            ref={input}
            value={code}
            onChange={(e) => setCode(onlyDigits(e.target.value))}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={t('security.code_label')}
            placeholder="000000"
            className="mt-6 w-full rounded-card border border-hairline bg-field px-4 py-3 text-center font-mono text-[24px] tracking-[0.35em] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          {error && (
            <p className="mt-4 rounded-card border border-red-200 bg-red-50 px-4 py-2.5 text-[14px] text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="mt-5 w-full rounded-btn bg-accent py-3 font-semibold text-fg-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? t('security.challenge_checking') : t('security.challenge_submit')}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-4 w-full rounded-btn py-2.5 text-[14px] font-semibold text-fg-muted transition-colors hover:text-fg"
          >
            {t('security.challenge_signout')}
          </button>
        </div>
      </form>
    </div>
  );
}
