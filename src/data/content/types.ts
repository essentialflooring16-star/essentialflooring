// Contractul continutului editabil.
//
// Un camp declarat aici apare automat in cabinet, sub grupul lui, cu eticheta in
// limba aleasa. Pagina care il foloseste il cere dupa cheie prin lib/content.ts.
// Registrul e singura sursa de adevar: nu exista camp editabil nedeclarat aici,
// si nu exista camp declarat pe care cabinetul sa nu-l stie desena.

export type FieldType =
  /** o singura linie: titluri, etichete de buton, nume */
  | 'text'
  /** mai multe randuri: paragrafe de prezentare */
  | 'textarea'
  /** o valoare pe linie: liste simple de servicii, pasi, avantaje scurte */
  | 'list'
  /** lista de obiecte cu titlu si text, editata ca perechi; valoarea e JSON */
  | 'pairs'
  /** intrebari si raspunsuri, editate ca perechi; valoarea e JSON */
  | 'faq'
  | 'number'
  | 'tel'
  | 'email'
  | 'url';

export type GroupId =
  | 'firma'
  | 'acasa'
  | 'servicii'
  | 'despre'
  | 'contact'
  | 'intrebari'
  | 'zone'
  | 'pagini';

export type Bilingual = { ro: string; en: string };

export type ContentField = {
  /** Cheie stabila. O data publicata, nu se mai schimba: randurile salvate de
   *  client in Supabase sunt legate de ea. */
  key: string;
  group: GroupId;
  /** Sub-sectiune in cadrul grupului, ca formularul sa nu fie o lista lunga. */
  section?: Bilingual;
  label: Bilingual;
  /** O propozitie sub camp: unde se vede pe site, ce efect are daca il schimbi. */
  help?: Bilingual;
  type: FieldType;
  /** Textul de azi de pe site. Ramane valoarea folosita cat timp clientul nu o
   *  suprascrie, si e si textul la care revine daca apasa "revino la initial". */
  default: string;
  /** Unde se vede, ca sa poata deschide pagina si verifica. */
  page?: string;
  /** Peste aceasta lungime cabinetul avertizeaza ca textul strica asezarea. */
  softMax?: number;
  /** Camp pe care site-ul il cere obligatoriu: golit, se revine la implicit. */
  required?: boolean;
};

/** Grupurile, in ordinea in care apar in cabinet. Primul e cel mai des folosit. */
export const GROUPS: { id: GroupId; label: Bilingual; help: Bilingual }[] = [
  {
    id: 'firma',
    label: { ro: 'Datele firmei', en: 'Business details' },
    help: {
      ro: 'Telefon, email, program, licență. Se schimbă peste tot pe site dintr-un singur loc.',
      en: 'Phone, email, hours, license. Changing these updates every page at once.',
    },
  },
  {
    id: 'acasa',
    label: { ro: 'Prima pagină', en: 'Home page' },
    help: {
      ro: 'Titlul mare de sus și secțiunile de pe pagina principală.',
      en: 'The large heading at the top and the sections of the home page.',
    },
  },
  {
    id: 'servicii',
    label: { ro: 'Servicii', en: 'Services' },
    help: {
      ro: 'Cele cinci servicii și textele de pe pagina fiecăruia.',
      en: 'The five services and the copy on each service page.',
    },
  },
  {
    id: 'despre',
    label: { ro: 'Despre noi', en: 'About' },
    help: { ro: 'Povestea firmei și valorile.', en: 'The company story and values.' },
  },
  {
    id: 'contact',
    label: { ro: 'Contact', en: 'Contact' },
    help: { ro: 'Pagina de contact și formularul de cerere.', en: 'The contact page and the request form.' },
  },
  {
    id: 'intrebari',
    label: { ro: 'Întrebări frecvente', en: 'FAQ' },
    help: {
      ro: 'Întrebările și răspunsurile. Apar și pe Google ca rezultate extinse.',
      en: 'Questions and answers. Google can show these as rich results.',
    },
  },
  {
    id: 'zone',
    label: { ro: 'Zone deservite', en: 'Service areas' },
    help: {
      ro: 'Cele 25 de pagini de oraș. Alege orașul, apoi editează textele lui.',
      en: 'The 24 city pages. Pick a city, then edit its copy.',
    },
  },
  {
    id: 'pagini',
    label: { ro: 'Celelalte pagini', en: 'Other pages' },
    help: {
      ro: 'Portofoliu, recenzii, blog, pagina de eroare.',
      en: 'Portfolio, reviews, blog, error page.',
    },
  },
];

/** O pereche titlu + text, pentru campurile de tip 'pairs'. */
export type Pair = { title: string; text: string };
/** O intrebare cu raspuns, pentru campurile de tip 'faq'. */
export type QA = { q: string; a: string };

export function parsePairs(value: string): Pair[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({ title: String(p.title ?? ''), text: String(p.text ?? '') }));
  } catch {
    return [];
  }
}

export function parseQA(value: string): QA[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({ q: String(p.q ?? ''), a: String(p.a ?? '') }));
  } catch {
    return [];
  }
}
