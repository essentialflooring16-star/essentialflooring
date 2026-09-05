// Registrul complet al continutului editabil.
//
// Fiecare grup isi declara campurile in fisierul lui; aici se aduna intr-o
// singura lista, care e sursa de adevar si pentru paginile care citesc textele,
// si pentru ecranul din cabinet care le deseneaza.
import type { ContentField } from './types';
import { firma } from './firma';
import { acasa } from './acasa';
import { servicii } from './servicii';
import { despre_contact } from './despre-contact';
import { zone } from './zone';
import { pagini } from './pagini';

export * from './types';
export { CITY_FIELDS, type CityField } from './zone';

export const CONTENT_FIELDS: ContentField[] = [
  ...firma,
  ...acasa,
  ...servicii,
  ...despre_contact,
  ...zone,
  ...pagini,
];

/** Cheile declarate, ca sa nu se poata cere din pagini un text inexistent. */
export type ContentKey = string;

/** Orasele, pentru selectorul din cabinet. Lista vine din site.ts ca sa nu
 *  poata ramane in urma fata de paginile chiar publicate. */
export { ALL_CITIES as CITY_LIST } from '../site';

const byKey = new Map(CONTENT_FIELDS.map((f) => [f.key, f]));

export function fieldByKey(key: string): ContentField | undefined {
  return byKey.get(key);
}

// O cheie duplicata ar insemna doua campuri in cabinet care se suprascriu unul
// pe altul in tacere: clientul editeaza unul, se schimba celalalt. Verificarea
// ruleaza la build, unde se vede, nu in browserul lui.
if (byKey.size !== CONTENT_FIELDS.length) {
  const seen = new Set<string>();
  const dupes = CONTENT_FIELDS.map((f) => f.key).filter((k) => !seen.add(k));
  throw new Error(`Chei duplicate in registrul de continut: ${[...new Set(dupes)].join(', ')}`);
}
