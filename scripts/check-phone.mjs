// Numarul de telefon are patru forme derivate dintr-una singura. Daca derivarea
// e gresita, site-ul afiseaza un numar si suna la altul, si nimeni nu observa
// pana nu suna un client. Deci se verifica.
import { build } from 'esbuild';
const out = await build({
  entryPoints: ['src/lib/content.ts'], bundle: true, write: false,
  format: 'esm', platform: 'neutral', loader: { '.json': 'json' },
  define: { 'import.meta.env.PUBLIC_SUPABASE_URL': 'undefined', 'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': 'undefined' },
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const c = await mod.getContent();
const s = c.site;
const expected = {
  phone: '(916) 425-1361', phoneHref: 'tel:+19164251361',
  phoneSchema: '+1-916-425-1361', whatsapp: 'https://wa.me/19164251361',
  email: 'essentialflooring16@gmail.com', license: 'CSLB #1117565',
  founded: 2023, experienceYears: 5,
};
let bad = 0;
for (const [k, v] of Object.entries(expected)) {
  const got = s[k];
  const ok = got === v;
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'GRESIT'} ${k.padEnd(16)} ${JSON.stringify(got)}${ok ? '' : `  asteptat ${JSON.stringify(v)}`}`);
}
console.log(bad ? `\n${bad} forme gresite` : '\nToate formele derivate sunt corecte fara suprascrieri.');
process.exit(bad ? 1 : 0);
