# Essential Flooring: ghid de lansare (pentru Artiom)

Site static Astro + React + Tailwind v4, cu cabinet de admin pe Supabase si formular prin Resend.
Aceeasi retetta ca la Maler Delius (Vercel + functie api) plus Supabase ca la ArtioMotion.

## 1. Local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # build static in dist/
```

Site-ul public functioneaza complet si FARA Supabase/Resend configurate:
galeria foloseste pozele built-in, formularul afiseaza eroare eleganta cu telefonul.

## 2. Supabase (cabinet admin: trafic, portofoliu, cereri)

1. Creeaza proiect nou pe supabase.com (regiunea us-west, e client din Sacramento).
2. SQL Editor > New query > lipeste TOT continutul din `supabase/schema.sql` > Run.
   Fisierul e idempotent, se poate rula de cate ori vrei.
3. Authentication > Users > Add user > email + parola pentru client
   (ex: essentialflooring16@gmail.com + parola generata). Confirm user: da.
   NU activa sign-up public: Authentication > Sign In / Up > dezactiveaza "Allow new users to sign up".
4. Settings > API: copiaza in `.env` (local) si in Vercel > Environment Variables:
   - `PUBLIC_SUPABASE_URL` (Project URL)
   - `PUBLIC_SUPABASE_ANON_KEY` (anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role) NUMAI in Vercel, niciodata in `.env`
     comis in git si niciodata in browser

**IMPORTANT, schimbat 22.08.2026.** Accesul de admin nu mai inseamna "orice cont
logat". Se verifica emailul in tabelul `admin_emails`. Motivul: site-ul e static,
deci `/admin` si bundle-ul lui sunt publice, iar RLS e singura bariera reala.
Schema seedeaza automat `essentialflooring16@gmail.com`. Ca sa iti dai si tie
acces, ruleaza in SQL Editor:

```sql
insert into public.admin_emails (email, note) values ('ark4su@gmail.com', 'artiom')
  on conflict (email) do nothing;
```

Verificare rapida, logat ca admin: `select public.is_admin();` trebuie sa dea `true`.

Cabinetul e la `/admin`. Clientul poate: vedea traficul (vizite pe zile, pagini top,
surse, dispozitive), incarca poze noi in portofoliu (apar instant pe site),
ascunde/sterge poze, vedea si gestiona cererile de oferta (statusuri new/contacted/closed).

## 3. Resend (formular -> email)

1. resend.com > API Keys > creeaza cheie -> `RESEND_API_KEY` in Vercel.
2. `CONTACT_TO_EMAIL=essentialflooring16@gmail.com`
3. Dupa cumpararea domeniului: adauga domeniul in Resend > Domains, pune DNS-urile,
   apoi seteaza `CONTACT_FROM_EMAIL=Essential Flooring <no-reply@essentialflooringinc.com>`.
   Pana atunci merge cu `onboarding@resend.dev` (default).
4. IMPORTANT (regula ta): nu trimite test-uri spre inbox-ul clientului fara sa-l anunti;
   testeaza cu adresa ta si subiect marcat TEST.

Ordinea e: functia `api/contact` salveaza intai cererea in Supabase (cu service
role), abia apoi incearca emailul. Daca Resend pica, raspunsul e tot 200 si
cererea exista in cabinet, deci nu se pierde niciun lead. Browserul mai are un
fallback de scriere, dar porneste doar daca functia chiar a esuat, ca sa nu
apara cereri duplicate.

Formularul are si rate limiting: 4 trimiteri la 10 minute de pe acelasi IP
(stocat doar ca hash), plus honeypot si o verificare de timp minim de completare.

## 4. Domeniu + Vercel

1. Verificat pe 16.08.2026: `essentialflooringinc.com` e LIBER. Asteapta confirmarea
   clientului, apoi inregistreaza-l (Namecheap/Porkbun, ~15 USD/an).
2. Vercel: importa repo-ul, framework Astro, build default. Functia `api/contact.ts`
   e preluata automat.
3. Domains: adauga essentialflooringinc.com + www (redirect spre apex).
4. Dupa lansare: Google Search Console > adauga domeniul > trimite
   `https://essentialflooringinc.com/sitemap-index.xml`.
5. Google Business Profile: seteaza website-ul nou pe profil; linkul "See our Google
   reviews" de pe pagina Reviews poate fi inlocuit cu linkul direct de recenzii din GBP
   (Share review form) in `src/pages/reviews.astro`.

## 4b. Blog (postat din cabinet, static pentru SEO)

Articolele se scriu in /admin > Blog (titlu, poza cover, text simplu sau markdown usor).
Paginile /blog si /blog/slug se genereaza STATIC la build din Supabase, deci pentru ca
un articol nou sa apara live site-ul trebuie rebuiltuit:

1. Vercel > Settings > Git > Deploy Hooks > creeaza un hook (branch main).
2. Copiaza URL-ul si ruleaza in Supabase SQL Editor:
   `insert into public.app_settings (key, value) values ('deploy_hook_url', 'URL_AICI')
    on conflict (key) do update set value = excluded.value;`
3. Din acel moment, cand clientul salveaza/publica/sterge un articol, cabinetul
   apeleaza hook-ul automat si site-ul se republica in 1-2 minute.

Fara hook configurat, articolele se salveaza dar apar live doar la urmatorul deploy.

## 5. Recenzii reale

Cand ai acces la Google Business, copiaza cele mai bune recenzii in
`src/data/reviews.json` in formatul:

```json
[
  { "author": "John D.", "rating": 5, "text": "...", "city": "Roseville", "date": "2026-07-10" }
]
```

Pagina /reviews le afiseaza automat (acum arata fallback-ul cu link spre Google).

## 6. Continut de actualizat cand raspunde clientul

- `src/data/site.ts`: numele legal exact (acum: Essential Flooring Inc), program, Facebook.
- Logo: acum e wordmark + icon SVG in Header; daca clientul are logo, inlocuieste in
  `src/components/Header.astro` si `public/favicon.svg`.
- Garantia: cand clientul confirma anii de garantie, actualizeaza textele care spun
  "workmanship warranty" (Home, About, FAQ) cu cifra reala.
- Video: clipurile din WhatsApp se pot adauga in galerie mai tarziu (galeria e pregatita
  doar pentru poze; clipurile pot merge intr-o sectiune hero sau pe pagini de serviciu).

## 7. Structura site

- `/` Home, `/services` + 4 pagini serviciu, `/portfolio`, `/service-areas` + 20 pagini
  oras (16 core Sacramento + 4 extended: SF, Bay Area, Orange County, South Lake Tahoe),
  `/about`, `/reviews`, `/faq`, `/contact`, `/privacy-policy`, `/404`, `/admin`.
- SEO: meta unice pe fiecare pagina, JSON-LD (LocalBusiness pe toate, Service pe
  servicii/orase, FAQPage, BreadcrumbList), sitemap automat, robots.txt,
  alt-text pe toate pozele, copy unic per oras (nu template).

## 7b. Cabinetul de admin: ce contine

Sapte sectiuni la `/admin`:

| Tab | Ce face |
| --- | --- |
| Traffic | vizite pe zile, pagini top, surse, dispozitive |
| Leads | cererile din formular, cu status new / contacted / closed |
| Portfolio | incarca poze noi, le ascunde sau le sterge |
| Reviews | **nou.** Clientul lipeste recenziile reale de pe Google. Media calculata aici alimenteaza insigna de rating de pe site si markup-ul AggregateRating |
| Blog | scrie si publica articole |
| Speed | **nou.** Core Web Vitals de la vizitatori reali (p75, separat mobil/desktop, paginile cele mai lente) |
| SEO | **nou.** Scaneaza tot site-ul prin sitemap si raporteaza title, meta, h1, alt, canonical, JSON-LD, continut subtire si titluri duplicate |
| Settings | **nou.** Deploy hook (mascat si validat), starea conexiunilor, datele firmei |

Doua lucruri de stiut:

- **Recenziile si articolele apar pe site doar dupa rebuild.** Site-ul e static.
  Cabinetul apeleaza singur deploy hook-ul, deci apar in 1-2 minute, dar hook-ul
  trebuie configurat intai (vezi 4b si tabul Settings).
- **Datele de viteza apar abia dupa lansare**, fiindca se colecteaza de la
  vizitatori reali. Local si inainte de deploy tabul e gol, si asa trebuie.

## 8. Directia de design

Stratul vizual e izolat in tokeni. Schimbarea directiei inseamna editarea unui
singur bloc din `src/styles/global.css`. Toate detaliile, plus cele trei
directii gata de copiat, sunt in [DESIGN.md](DESIGN.md).
