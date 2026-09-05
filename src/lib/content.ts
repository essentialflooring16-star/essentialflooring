// Textele editabile ale site-ului, citite la build.
//
// Contractul, in trei propozitii:
//   1. Valoarea implicita a fiecarui text sta in cod, in src/data/content.ts.
//   2. Clientul poate suprascrie oricare din ele din cabinet; suprascrierea sta
//      in tabelul site_content din Supabase.
//   3. Paginile cer textul dupa cheie si primesc suprascrierea daca exista,
//      altfel valoarea din cod.
//
// De aici decurge proprietatea care conteaza cel mai mult: daca Supabase e
// nelegat, gol, sau pica in timpul build-ului, site-ul se construieste identic
// cu cel de azi. Editarea din cabinet e un strat peste site, nu o dependenta a
// lui. Acelasi tipar ca lib/blog.ts si lib/reviews.ts, dus pana la capat.
import { CONTENT_FIELDS, type ContentKey } from '../data/content';
import { SITE } from '../data/site';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_FIELDS.map((f) => [f.key, f.default]),
);

type Row = { key: string; value: string };

// Build-ul Astro randeaza 41 de pagini si aproape fiecare cere texte. Fara
// memorare, fiecare pagina ar deschide o cerere HTTP catre Supabase; cu ea,
// se face una singura pentru tot build-ul. Promisiunea e memorata, nu
// rezultatul, ca doua pagini randate in paralel sa nu porneasca doua cereri.
let pending: Promise<Record<string, string>> | null = null;

async function fetchOverrides(): Promise<Record<string, string>> {
  if (!url || !key) return {};
  try {
    const res = await fetch(`${url}/rest/v1/site_content?select=key,value`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return {};
    const rows = (await res.json()) as Row[];
    const out: Record<string, string> = {};
    for (const row of rows) {
      // Un rand cu text gol inseamna "clientul a sters continutul campului", nu
      // "revino la valoarea din cod". Revenirea la implicit se face stergand
      // randul, iar cabinetul asa o face. Exceptia: un camp obligatoriu golit ar
      // lasa o gaura in pagina, asa ca golul cade pe implicit.
      if (typeof row.value === 'string' && row.value.trim() !== '') {
        out[row.key] = row.value;
      }
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Datele firmei, cu suprascrierile clientului aplicate peste constantele din
 * src/data/site.ts.
 *
 * Telefonul e motivul pentru care exista obiectul asta. In cod numarul apare in
 * patru forme: afisat "(916) 425-1361", link "tel:+19164251361", structurat
 * "+1-916-425-1361" si WhatsApp "https://wa.me/19164251361". Daca fiecare ar fi
 * un camp separat in cabinet, clientul le-ar schimba pe unele si ar uita altele,
 * iar site-ul ar afisa un numar si ar suna la altul. Asa, el scrie numarul o
 * singura data, in forma in care il citeste, iar celelalte trei se deduc.
 */
export type SiteData = Omit<typeof SITE, 'address'> & {
  address: typeof SITE.address;
  whatsapp: string;
};

/** Cifrele unui numar american, fara paranteze, spatii sau cratime. */
function digits(phone: string): string {
  const only = phone.replace(/\D/g, '');
  // Numarul poate fi scris cu sau fara prefixul de tara. Zece cifre inseamna
  // fara, deci se adauga; altfel se ia asa cum e.
  return only.length === 10 ? `1${only}` : only;
}

function buildSite(read: (key: string) => string): SiteData {
  const phone = read('business.contact.phone') || SITE.phone;
  const d = digits(phone);
  const years = Number.parseInt(read('business.details.experience_years'), 10);
  const founded = Number.parseInt(read('business.details.founded'), 10);

  return {
    ...SITE,
    phone,
    phoneHref: `tel:+${d}`,
    phoneSchema: `+${d.slice(0, 1)}-${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`,
    whatsapp: `https://wa.me/${d}`,
    email: read('business.contact.email') || SITE.email,
    hours: read('business.contact.hours') || SITE.hours,
    license: read('business.details.license') || SITE.license,
    founder: read('business.details.founder') || SITE.founder,
    founded: Number.isFinite(founded) ? founded : SITE.founded,
    experienceYears: Number.isFinite(years) ? years : SITE.experienceYears,
    instagram: read('business.social.instagram') || SITE.instagram,
    facebook: read('business.social.facebook') || SITE.facebook,
    googleProfile: read('business.social.google') || SITE.googleProfile,
    address: { ...SITE.address, locality: read('business.details.city') || SITE.address.locality },
  };
}

export type Content = {
  /** Textul pentru o cheie: suprascrierea clientului, altfel valoarea din cod. */
  (key: ContentKey): string;
  /** Lista dintr-un camp de tip lista, o valoare pe linie, golurile sarite. */
  list: (key: ContentKey) => string[];
  /** Numarul dintr-un camp numeric; textul nenumeric cade pe implicit. */
  num: (key: ContentKey) => number;
  /** true daca acest text a fost schimbat de client fata de cel din cod. */
  isEdited: (key: ContentKey) => boolean;
  /**
   * Textul pentru o cheie care nu e in registru, cu implicitul dat pe loc.
   * Asa functioneaza paginile de oras: cheile lor se compun din slug
   * (city.roseville.intro), sunt 25 x 6 la numar si n-ar avea ce cauta scrise
   * una cate una in registru, iar implicitul fiecareia sta in cities.json.
   */
  or: (key: ContentKey, fallback: string) => string;
  /** Datele firmei, cu suprascrierile aplicate si formele derivate recalculate. */
  site: SiteData;
  /** Aplica datele firmei peste un text venit din alta parte (cities.json,
   *  services-copy.json), ca numarul din proza sa nu ramana cel vechi. */
  apply: (text: string) => string;
};

export async function getContent(): Promise<Content> {
  if (!pending) pending = fetchOverrides();
  const overrides = await pending;

  const raw = (k: ContentKey): string => overrides[k] ?? DEFAULTS[k] ?? '';

  /**
   * Numarul de telefon si adresa de email sunt scrise si in interiorul
   * textelor: intro-urile celor 25 de orase, intrebarile frecvente, descrierile
   * pentru Google. Daca clientul schimba numarul din cabinet si textele acelea
   * ar ramane cu cel vechi, site-ul ar afisa doua numere diferite, iar el nu ar
   * avea de unde sti care unde. Deci datele firmei se aplica peste orice text
   * citit: se inlocuieste exact sirul vechi, nimic altceva.
   */
  const site = buildSite(raw);
  const substitutions: [string, string][] = [];
  if (site.phone !== SITE.phone) {
    substitutions.push([SITE.phone, site.phone]);
    substitutions.push([SITE.phoneSchema, site.phoneSchema]);
    substitutions.push([SITE.phoneHref, site.phoneHref]);
    substitutions.push([SITE.phone.replace(/\D/g, ''), site.phone.replace(/\D/g, '')]);
  }
  if (site.email !== SITE.email) substitutions.push([SITE.email, site.email]);
  if (site.license !== SITE.license) substitutions.push([SITE.license, site.license]);

  const apply = (text: string): string => {
    if (!substitutions.length || !text) return text;
    let out = text;
    for (const [from, to] of substitutions) out = out.split(from).join(to);
    return out;
  };

  const read = (k: ContentKey): string => apply(raw(k));

  const content = ((k: ContentKey) => read(k)) as Content;
  content.list = (k) =>
    read(k)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  content.num = (k) => {
    const parsed = Number.parseFloat(read(k).replace(/[^\d.-]/g, ''));
    if (Number.isFinite(parsed)) return parsed;
    const fallback = Number.parseFloat(String(DEFAULTS[k] ?? '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(fallback) ? fallback : 0;
  };
  content.isEdited = (k) => k in overrides;
  content.or = (k, fallback) => apply(overrides[k] ?? fallback);
  content.site = site;
  content.apply = apply;

  return content;
}
