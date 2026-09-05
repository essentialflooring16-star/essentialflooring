// Limba cabinetului de administrare.
//
// Romana e limba de baza: proprietarul afacerii e vorbitor de romana si nu are
// pregatire tehnica, deci fiecare cuvant pe care il citeste cand isi conduce
// site-ul trebuie sa fie in limba lui. Engleza ramane disponibila dintr-un
// comutator, pentru cazul in care cabinetul e deschis de altcineva.
//
// Site-ul PUBLIC ramane integral in engleza. Nimic de aici nu ajunge in paginile
// publice: modulul e importat numai din componentele din src/components/admin/.
import { useCallback, useEffect, useState } from 'react';
import { STRINGS } from './admin-strings';

export type Lang = 'ro' | 'en';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'ro', label: 'Romana' },
  { code: 'en', label: 'English' },
];

const STORAGE_KEY = 'ef-admin-lang';
const DEFAULT: Lang = 'ro';

/**
 * Preferinta de limba traieste in localStorage, nu in Supabase, ca sa se aplice
 * si pe ecranul de autentificare, inainte sa existe o sesiune din care sa citim
 * ceva. Este o preferinta de afisare, nu un dat al contului.
 */
export function readLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'ro' || raw === 'en' ? raw : DEFAULT;
  } catch {
    // Safari in navigare privata arunca la citirea din localStorage.
    return DEFAULT;
  }
}

function writeLang(lang: Lang): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Preferinta se pierde la reincarcare, cabinetul functioneaza mai departe.
  }
}

// Toate componentele montate trebuie sa se redeseneze cand se schimba limba,
// nu doar cea care contine comutatorul. Un set de abonati e destul: cabinetul
// are un singur arbore React si o singura sursa de adevar pentru limba.
const listeners = new Set<(lang: Lang) => void>();

export function setLang(lang: Lang): void {
  writeLang(lang);
  document.documentElement.lang = lang;
  listeners.forEach((fn) => fn(lang));
}

export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setState] = useState<Lang>(DEFAULT);

  // Prima citire se face dupa montare, nu la initializarea starii: cabinetul e
  // randat cu client:only, dar tot pornim de la aceeasi valoare pe fiecare
  // randare initiala ca sa nu depindem de momentul in care ruleaza modulul.
  useEffect(() => {
    setState(readLang());
    document.documentElement.lang = readLang();
    const fn = (next: Lang) => setState(next);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  return [lang, setLang];
}

export type Vars = Record<string, string | number>;

/**
 * Pluralul romanesc are trei forme, nu doua ca in engleza:
 *   1 cerere | 5 cereri | 21 de cereri
 * Forma a treia apare la numerele al caror rest modulo 100 e 0 sau intre 20 si
 * 99, si cere prepozitia "de". O traducere care ignora asta suna gresit exact
 * la numerele mari, adica fix acolo unde clientul se uita mai des.
 *
 * In dicionar formele se scriu separate prin " | ", in ordinea: unu, putine,
 * multe. Engleza foloseste doar primele doua.
 */
function pluralIndex(lang: Lang, n: number): number {
  const abs = Math.abs(Math.trunc(n));
  if (lang === 'en') return abs === 1 ? 0 : 1;
  if (abs === 1) return 0;
  const rest = abs % 100;
  if (abs === 0 || (rest >= 1 && rest <= 19)) return 1;
  return 2;
}

function pick(value: string, lang: Lang, vars?: Vars): string {
  if (!value.includes(' | ')) return value;
  const forms = value.split(' | ');
  const n = vars && typeof vars.n === 'number' ? vars.n : 0;
  const idx = pluralIndex(lang, n);
  return forms[Math.min(idx, forms.length - 1)];
}

function interpolate(value: string, vars?: Vars): string {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Traduce o cheie. Daca cheia lipseste din dictionar, intoarce cheia insasi:
 * un "leads.empty" vizibil in interfata e un defect evident si usor de gasit,
 * pe cand un text gol ar trece neobservat pana il vede clientul.
 */
export function translate(lang: Lang, key: string, vars?: Vars): string {
  const table = STRINGS[lang] as Record<string, string> | undefined;
  const fallback = STRINGS.en as Record<string, string>;
  const raw = table?.[key] ?? fallback[key];
  if (raw === undefined) {
    if (import.meta.env.DEV) console.warn(`[admin-i18n] cheie lipsa: ${key}`);
    return key;
  }
  return interpolate(pick(raw, lang, vars), vars);
}

export function useT(): { t: (key: string, vars?: Vars) => string; lang: Lang } {
  const [lang] = useLang();
  const t = useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang]);
  return { t, lang };
}

/** Formateaza date si numere in conventia limbii alese. */
export function useFormat() {
  const [lang] = useLang();
  const locale = lang === 'ro' ? 'ro-RO' : 'en-US';
  return {
    date: (value: string | number | Date) =>
      new Date(value).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
    dateTime: (value: string | number | Date) =>
      new Date(value).toLocaleString(locale, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    number: (value: number, digits = 0) =>
      value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
  };
}
