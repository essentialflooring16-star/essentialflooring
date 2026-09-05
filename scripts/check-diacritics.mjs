// Verifica textul romanesc pe care il citeste clientul.
//
// Doua greseli trec neobservate la scriere si se vad imediat pe ecran: textul
// romanesc scris fara diacritice, si diacriticele cu sedila (ş, ţ) in loc de
// cele corecte, cu virgula (ș, ț). Comentariile din cod raman fara diacritice,
// ca restul proiectului, deci se verifica numai valorile.
import { build } from 'esbuild';

async function load(entry) {
  const out = await build({
    entryPoints: [entry], bundle: true, write: false, format: 'esm',
    platform: 'neutral', loader: { '.json': 'json' },
  });
  return import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
}

const { STRINGS } = await load('src/lib/admin-strings.ts');
const { CONTENT_FIELDS, GROUPS, CITY_FIELDS } = await load('src/data/content/index.ts');

// Cuvinte romanesti frecvente care ar trebui sa poarte diacritice.
// Numai cuvinte care poarta INTOTDEAUNA un diacritic. "Pagina" articulat, de
// pilda, se scrie corect fara, deci nu are ce cauta in lista: un verificator
// care da alarme false ajunge sa fie ignorat.
const SUSPECT = /\b(adauga|adaug|sterge|stergi|salveaza|salvezi|inapoi|schimba|schimbi|modifica|modifici|cauta|cauti|intrebare|intrebari|raspuns|raspunsuri|licenta|sectiune|sectiuni|romana|oras|orase|incarca|incarci|inchis|inchide|fara|dupa|inainte|catre|pana|inca|astepta|apasa|apesi|imbunatateste|scurta|lunga)\b/i;
const CEDILLA = /[şţŞŢ]/;

const problems = [];
const check = (where, value) => {
  if (typeof value !== 'string' || !value) return;
  if (CEDILLA.test(value)) problems.push([where, 'diacritice cu sedila', value.slice(0, 70)]);
  // are cuvant romanesc suspect dar niciun diacritic in tot textul
  if (SUSPECT.test(value) && !/[ăâîșț]/i.test(value)) {
    problems.push([where, 'romana fara diacritice', value.slice(0, 70)]);
  }
};

for (const [key, value] of Object.entries(STRINGS.ro)) check(`dictionar ${key}`, value);
for (const g of GROUPS) {
  check(`grup ${g.id} eticheta`, g.label.ro);
  check(`grup ${g.id} ajutor`, g.help.ro);
}
for (const f of CONTENT_FIELDS) {
  check(`camp ${f.key} eticheta`, f.label?.ro);
  check(`camp ${f.key} ajutor`, f.help?.ro);
  check(`camp ${f.key} sectiune`, f.section?.ro);
}
for (const f of CITY_FIELDS) {
  check(`oras ${f.suffix} eticheta`, f.label?.ro);
  check(`oras ${f.suffix} ajutor`, f.help?.ro);
}

console.log(problems.length ? `${problems.length} probleme de scriere:` : 'Textul romanesc e scris corect peste tot.');
for (const [where, why, sample] of problems.slice(0, 25)) {
  console.log(`  ${why.padEnd(24)} ${where}\n     ${JSON.stringify(sample)}`);
}
process.exit(problems.length ? 1 : 0);
