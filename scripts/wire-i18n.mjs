// Inlocuieste in componenta textele englezesti cu apelul t() din dictionar.
//
// Se ocupa doar de cazurile neambigue: textul din dictionar apare EXACT O DATA
// in fisier, ca text intre etichete JSX sau ca sir intreg intre ghilimele.
// Restul se raporteaza si se face de mana. Un panou pe jumatate tradus e
// suparator; un panou stricat e mai rau.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const [, , FILE, NS] = process.argv;
if (!FILE || !NS) { console.error('foloseste: node scripts/wire-i18n.mjs <Componenta> <prefix>'); process.exit(2); }

const out = await build({
  entryPoints: ['src/lib/admin-strings.ts'], bundle: true, write: false, format: 'esm', platform: 'neutral',
});
const { STRINGS } = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));

const path = `src/components/admin/${FILE}.tsx`;
let src = readFileSync(path, 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const entries = Object.entries(STRINGS.en)
  .filter(([k]) => k.startsWith(NS + '.'))
  // cele mai lungi intai: altfel un text scurt inghite bucata dintr-unul lung
  .sort((a, b) => b[1].length - a[1].length);

let done = 0;
const skipped = [];

for (const [key, text] of entries) {
  if (src.includes(`t('${key}')`) || src.includes(`t('${key}',`)) continue;
  // textele cu interpolare sau plural nu se pot potrivi litera cu litera
  if (text.includes('{') || text.includes(' | ')) { skipped.push([key, 'are interpolare sau plural']); continue; }
  if (text.length < 6) { skipped.push([key, 'prea scurt']); continue; }

  const pat = esc(text).replace(/\s+/g, '\\s+');

  // 1) text intre etichete JSX:  >Textul<
  const jsx = [...src.matchAll(new RegExp(`>(\\s*)${pat}(\\s*)<`, 'g'))];
  // 2) sir intreg intre ghilimele:  'Textul'  "Textul"  `Textul`
  const str = [...src.matchAll(new RegExp(`(['"\`])${pat}\\1`, 'g'))];

  if (jsx.length === 1 && str.length === 0) {
    src = src.replace(jsx[0][0], `>{t('${key}')}<`);
    done++;
  } else if (str.length === 1 && jsx.length === 0) {
    // Un atribut JSX care primeste o expresie are nevoie de acolade:
    // label={t('x')}. Fara ele fisierul nu compileaza.
    const at = src.indexOf(str[0][0]);
    const isJsxAttr = /\s[\w-]+=$/.test(src.slice(Math.max(0, at - 40), at));
    src = src.replace(str[0][0], isJsxAttr ? `{t('${key}')}` : `t('${key}')`);
    done++;
  } else if (jsx.length + str.length === 0) {
    skipped.push([key, 'negasit']);
  } else {
    skipped.push([key, `ambiguu: ${jsx.length} in JSX, ${str.length} intre ghilimele`]);
  }
}

writeFileSync(path, src);
console.log(`${FILE}: ${done} texte legate`);
if (skipped.length) {
  const byReason = {};
  for (const [k, why] of skipped) (byReason[why.split(':')[0]] ??= []).push(k);
  for (const [why, keys] of Object.entries(byReason)) {
    console.log(`  ${why} (${keys.length}): ${keys.slice(0, 8).join(', ')}${keys.length > 8 ? ', ...' : ''}`);
  }
}
