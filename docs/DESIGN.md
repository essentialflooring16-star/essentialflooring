# Cum schimbi direcția de design

Site-ul e construit ca stratul vizual să fie schimbabil dintr-un singur loc.
Nicio componentă nu numește o culoare. Toate folosesc **roluri** (`bg-surface`,
`text-fg`, `border-hairline`, `bg-accent`), rolurile trimit spre **primitive**,
iar primitivele sunt singurele care au valori reale.

Ca sa schimbi tot look-ul, editezi **LAYER 1** din `src/styles/global.css`.
Atat.

## Cele trei straturi

```
src/styles/global.css
├── LAYER 1  :root { --ef-ground, --ef-accent, ... }   valori reale  ← editezi aici
├── LAYER 2  :root { --ef-surface: var(--ef-ground) } roluri         ← nu se atinge
└── LAYER 3  @theme inline { --color-surface: ... }   utilitare      ← nu se atinge
```

## Rolurile disponibile

| Rol | Cand il folosesti |
| --- | --- |
| `surface` | fundalul paginii |
| `surface-raised` | carduri, panouri ridicate |
| `surface-sunken` | benzi tonate, chips, placeholdere |
| `field` | fundalul inputurilor (doar in admin) |
| `surface-dark` | sectiuni intregi pe fundal inchis |
| `control-dark` / `control-dark-hover` | buton sau chip inchis, asezat pe fundal deschis |
| `veil-on-dark` | voal translucid deschis, peste inchis |
| `fg` / `fg-body` / `fg-muted` / `fg-subtle` | text: titlu, corp, secundar, decorativ |
| `fg-on-dark` | text peste `surface-dark` |
| `fg-on-accent` | eticheta chiar pe umplutura de accent |
| `fg-on-media` | text si controale peste fotografie |
| `accent` / `accent-hover` | umpluturi, borduri, ringuri |
| `accent-on-light` / `accent-on-dark` | text de accent, dupa fundal |
| `accent-display` | numerale mari, randuri de stele |
| `accent-wash` | insigna cu accent la 15% |
| `hairline` / `hairline-on-dark` / `hairline-strong` | linii de 1px |
| `scrim` / `scrim-media` | gradient peste poze |

Doua reguli care nu se incalca:

1. **`scrim`, `scrim-media` si `fg-on-media` nu urmeaza paleta.** Stau peste
   fotografii. Daca le legi de paleta, la o directie inchisa gradientul devine
   alb si subtitrarile pozelor dispar.
2. **`fg-on-accent` trebuie verificat la contrast la fiecare directie.** Sunt
   23 de butoane care depind de tokenul asta. Vezi sectiunea de mai jos: paleta
   de acum pica deja pragul.

## Direcția A: "Proba"

Fundal bej piatra, tipografie grea, accent caramiziu. Perechile inainte/dupa
sunt sistemul de design.

```css
:root {
  --ef-ground: #efece4;  --ef-ground-tint: #e6e2d6;  --ef-ground-raised: #f8f7f3;
  --ef-ground-field: #e6e2d6;  --ef-rule: #d5d0c1;
  --ef-ink-900: #16150f;  --ef-ink-700: #33312a;  --ef-ink-500: #5d594d;
  --ef-dark-900: #16150f;  --ef-dark-control: #16150f;  --ef-dark-control-hi: #2c2a22;
  --ef-light-50: #efece4;
  --ef-accent: #c8442a;  --ef-accent-hi: #a3341f;
  --ef-accent-light: #a3341f;  --ef-accent-dark: #e8775e;
  --ef-accent-display: #c8442a;  --ef-accent-wash-pct: 12%;
  --ef-on-accent: #ffffff;
  --ef-scrim: #16150f;  --ef-scrim-media: #000000;  --ef-on-media: #ffffff;
  --ef-font-display: 'Archivo', Helvetica, Arial, sans-serif;
  --ef-font-body: 'Archivo', system-ui, sans-serif;
  --ef-grain-opacity: 0.07;
  --ef-radius-card: 0.25rem;  --ef-radius-pill: 0.25rem;
  --ef-shadow-tint: 22 21 15;
}
```

## Direcția B: "Atelier linistit"

Crem cald, serif clasic, accent alama stinsa.

```css
:root {
  --ef-ground: #f6f2e9;  --ef-ground-tint: #efe9db;  --ef-ground-raised: #fffdf8;
  --ef-ground-field: #efe9db;  --ef-rule: #e0d8c6;
  --ef-ink-900: #26221c;  --ef-ink-700: #433d33;  --ef-ink-500: #6b6355;
  --ef-dark-900: #26221c;  --ef-dark-control: #26221c;  --ef-dark-control-hi: #3a342b;
  --ef-light-50: #f6f2e9;
  --ef-accent: #7a6340;  --ef-accent-hi: #5f4c2f;
  --ef-accent-light: #5f4c2f;  --ef-accent-dark: #c2a878;
  --ef-accent-display: #8a7048;  --ef-accent-wash-pct: 18%;
  --ef-on-accent: #fffdf8;
  --ef-scrim: #26221c;  --ef-scrim-media: #000000;  --ef-on-media: #ffffff;
  --ef-font-display: 'Instrument Serif', Georgia, serif;
  --ef-font-body: 'Inter Variable', system-ui, sans-serif;
  --ef-grain-opacity: 0.04;
  --ef-radius-card: 0.5rem;  --ef-radius-pill: 9999px;
  --ef-shadow-tint: 38 34 28;
}
```

Nota: alama a fost inchisa de la `#8a7048` la `#7a6340` pentru `--ef-accent`.
Masurat: alb pe `#8a7048` da 4.60:1, adica trece la limita; pe `#7a6340` da
5.60:1, cu o marja confortabila.

## Direcția C: "Tura de noapte"

Negru aproape total, tipografie condensata, aramiu doar ca accent.

Aici se vede castigul stratului semantic: fiindca `surface-dark` si `fg-on-dark`
sunt o **pereche**, directia C doar le inverseaza polii. Sectiunea "inchisa"
devine un panou deschis pe o pagina neagra, si nicio componenta nu se modifica.

```css
:root {
  --ef-ground: #0e0e10;  --ef-ground-tint: #17171b;  --ef-ground-raised: #1c1c21;
  --ef-ground-field: #17171b;  --ef-rule: #2c2c33;
  --ef-ink-900: #f0ece4;  --ef-ink-700: #ccc7bd;  --ef-ink-500: #97928a;

  /* inversarea polilor: regiunea "inversa" e acum DESCHISA */
  --ef-dark-900: #f0ece4;  --ef-dark-control: #f0ece4;  --ef-dark-control-hi: #dcd6cb;
  --ef-light-50: #0e0e10;

  --ef-accent: #b5773a;  --ef-accent-hi: #cc8c4c;   /* hover mai DESCHIS pe inchis */
  --ef-accent-light: #d9a86c;  /* "accent pe deschis" = pe pagina neagra */
  --ef-accent-dark: #96602c;   /* "accent pe inchis"  = pe panoul deschis */
  --ef-accent-display: #b5773a;  --ef-accent-wash-pct: 22%;
  --ef-on-accent: #14100a;   /* masurat 5.11:1. Alb ar da 3.71:1, adica pica */
  --ef-scrim: #000000;  --ef-scrim-media: #000000;  --ef-on-media: #ffffff;
  --ef-font-display: 'Anton', 'Archivo Narrow', Impact, sans-serif;
  --ef-font-body: 'Inter Variable', system-ui, sans-serif;
  --ef-grain-opacity: 0.09;
  --ef-radius-card: 0.125rem;  --ef-radius-pill: 9999px;
  --ef-shadow-tint: 0 0 0;
}
```

## De decis: contrastul butonului principal

Asta nu e o problema viitoare, e in paleta de **acum**.

Butonul principal ("Get a Free Estimate", 23 aparitii) e `bg-accent` `#b5773a`
cu eticheta alba. Masurat, raportul e **3.71:1**. WCAG AA cere 4.5:1 pentru text
sub 18.66px bold. Eticheta e la 15-16px semibold, deci **pica**.

Trei variante, toate masurate:

| Varianta | Rezultat | Ce schimba vizual |
| --- | --- | --- |
| Inchizi umplutura la `#9e6430` | 4.86:1 | aramiul devine putin mai inchis |
| Inchizi umplutura la `#96602c` | 5.24:1 | e chiar culoarea de hover de azi |
| Pastrezi `#b5773a`, eticheta devine `#221a14` | 4.62:1 | butonul devine aramiu cu text inchis |

Nu am ales eu, fiindca e o decizie de design, nu una tehnica, si se leaga de
directia pe care o alegi. Cand alegi, e o singura linie in LAYER 1.

Restul paletei actuale trece: text pe fundal 15.5:1, secundar 5.9:1, accentul
de text pe deschis 5.8:1.

## Ce NU se rezolva din tokeni

Lista scurta de lucruri care cer munca de mana la orice schimbare de directie:

1. **Fonturile.** Archivo, Instrument Serif si Anton nu sunt instalate. Fiecare
   directie cere un pachet `@fontsource` nou, doua importuri in
   `src/layouts/Base.astro` si `src/pages/admin/index.astro`, si o reglare a
   marimilor din hero (inaltimile de x difera mult fata de Fraunces).
2. **`font-variation-settings: 'SOFT' 60, 'WONK' 1`** din `.accent-italic`.
   Axele exista doar in Fraunces. La alta directie se sterge.
3. **`.accent-italic` ca idee.** E "un cuvant italic serif intr-un titlu".
   Directia B il pastreaza. Anton nu are italic deloc, deci directia C are
   nevoie de alt procedeu de accentuare.
4. **Zgomotul `.grain`.** E un data-URI SVG negru. O variabila CSS nu se poate
   interpola intr-un data-URI, deci doar intensitatea e reglabila.
5. **Umbrele.** Pe fundal aproape negru, umbrele nu se vad. Directia C are
   nevoie de alt model de elevatie (o linie de 1px), nu de alta valoare.
6. **`rounded-full`** (70 aparitii) nu e tokenizabil, compileaza la
   `calc(infinity * 1px)`. O directie cu colturi drepte le cere editate manual.
7. **`<meta name="theme-color">`** din `Base.astro` trebuie sa fie hex literal.
8. **Culorile din emailul tranzactional** (`api/contact.ts`). Clientii de email
   ignora variabilele CSS.
9. **Verdele WhatsApp** `#25D366` din `QuickContact.astro` ramane literal
   la orice directie.
10. **Fotografiile.** Toate pozele clientului sunt in tonuri calde de stejar.
    Caramiziul directiei A intra in conflict cu ele. Merita verificat pe
    ecran inainte de decizie.

## Cum verifici ca nu ai stricat nimic

Refactorizarea a fost validata cu capturi inainte/dupa pe 12 pagini si 4 pozitii
de scroll, cu animatiile inghetate. Scriptul e in scratchpad-ul sesiunii, dar
reteta e simpla si merita repetata la orice schimbare mare:

1. `npm run build`, apoi servesti `dist/` pe un port.
2. Faci capturi.
3. Schimbi, rebuild, capturi din nou, compari cu `PIL.ImageChops.difference`.

Atentie la doua surse de fals-pozitiv: contorul animat din `Stats.astro` si
inelul de puls al butonului flotant din `QuickContact.astro`.
