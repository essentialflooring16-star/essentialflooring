# Partea juridică a site-ului

Ce s-a verificat, ce s-a schimbat și ce a rămas de confirmat cu Alex.
Data reviziei: **9 septembrie 2026**.

---

## 1. Faptele verificate la sursă

Toate valorile din `src/data/site.ts` care spun ceva despre firmă vin de aici,
nu din memorie. Dacă se schimbă una, se schimbă și pagina care o afișează.

**Registrul CSLB**, licența 1117565
(https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=1117565):

| Ce scrie acolo | Valoare |
| --- | --- |
| Denumire | ESSENTIAL FLOORING INC |
| Adresă | 7733 Borthwick Way, Antelope, CA 95843 |
| Telefon | (916) 425-1361 |
| Tip | Corporation |
| Emisă | 03/07/2024 |
| Expiră | 03/31/2028 |
| Stare | current and active |
| Clasificare | **C15, Flooring and Floor Covering** |
| Garanție (bond) | 25.000 $, Western Surety, nr. 67661394, din 20.02.2026 |
| Asigurare de accidente de muncă | **scutit**, a declarat că nu are angajați |

**Fișa Google (Google Business Profile)**: adresa publicată acolo este
**8020 Walerga Rd, Antelope, CA 95843**, ratingul 5,0 din 18 recenzii.

**Registrul comerțului (California SOS)**: firma apare înregistrată la
**22 mai 2023**, deci „Founded 2023" de pe site se susține. Alex a spus că a
lucrat și înainte de asta, deci anul și cei 5+ ani de experiență rămân cum
sunt.

---

## 2. Ce s-a scos de pe site și de ce

### „Insured", scos pe 9 septembrie dimineața și pus la loc seara

Nicăieri, în niciun registru public, nu scrie că firma are asigurare de
răspundere civilă (general liability). CSLB nu urmărește asta. Pe 9 septembrie
dimineața, fiindcă Alex nu trimisese niciun certificat deși i se ceruse din
august, s-a înlocuit peste tot cu „Licensed & Bonded", plus garanția de
25.000 $ scrisă explicit acolo unde era o frază întreagă.

**În aceeași zi Alex a răspuns**, pe WhatsApp: „Am si asigurare, pune numa
licensend and insured. Ca aici oameni poate sa ma verifice daca chiar vor."
Artiom i-a confirmat în scris, la 17:56, că rămâne „Licensed & Insured" pe
site. Deci s-a pus la loc, în cele 41 de locuri, inclusiv pe cele 25 de pagini
de oraș, și `insured` din `src/data/site.ts` e acum `true`.

Ce s-a păstrat din pasa de dimineață, fiindcă nu ține de asigurare: garanția de
25.000 $ numită explicit unde era loc, corecțiile de change order, și
formulările care nu mai promit un preț neschimbat.

**Ce contează, dacă se ajunge vreodată la discuții:** certificatul tot nu a
ajuns. Ce avem e declarația lui scrisă, din 9 septembrie, plus faptul că el a
cerut expres formularea. Aia e proba. Dacă vrei să fii acoperit complet, ceri
poza certificatului și o pui la dosarul clientului.

Întrebarea din FAQ („Is Essential Flooring licensed and insured?") e scrisă să
nu mintă: spune că licența și garanția se verifică pe cslb.ca.gov în 30 de
secunde, și că asigurarea există dar statul nu o publică, deci cine vrea să
vadă certificatul, cere.

**Dacă vreodată se umblă din nou la formularea asta**, e nevoie de perechi:
textul din pagină **și** valoarea implicită din `src/data/content/*.ts`,
altfel `node scripts/check-content.mjs` pică. Întrebarea din FAQ trăiește în
două fișiere, `src/data/faq.json` și `src/data/content/despre-contact.ts`.
Cardul de preview, `public/og-default.jpg`, poartă și el linia asta: se
regenerează cu `node scripts/make-og.mjs`, unde textul e o singură linie.

La cererea lui Artiom, cuvântul „asigurare" nu apare în paginile juridice, unde
exista o frază care spunea că legea obligă contractul să declare ce asigurare
are contractorul. A rămas scoasă din Terms of Use și din pagina de anulări.

### „Tile installation" → „Vinyl and resilient tile installation"

Clasificarea C-15 acoperă „carpet, resilient sheet goods, resilient tile, wood
floors ... **except ceramic tile**" (16 CCR 832.15). Gresia și mozaicul sunt
C-54, altă licență. Iar B&P 7027.1 spune că e **infracțiune** (misdemeanor) să
faci reclamă pentru lucrări în afara clasificării pe care o ai.

Site-ul scria „Tile installation" în lista de servicii, în `knowsAbout` din
datele structurate și într-un card de pe pagina de servicii. Peste tot scrie
acum „vinyl and resilient tile", ceea ce **este** în C-15. Demontarea gresiei
vechi a rămas, aia e demolare, nu montaj.

Atât. Nu se face reclamă la gresie pe site, și nu e nevoie de nimic mai mult.

### Promisiunea „prețul din ofertă e prețul pe care îl plătești"

Apărea în patru locuri, fără nicio excepție scrisă. La pardoseli, o problemă
sub podeaua veche schimbă prețul, e normal. Acum scrie „prețul pe care îl
aprobi e prețul pe care îl plătești, iar orice apare neprevăzut se agreează cu
tine înainte să continuăm", ceea ce e și adevărat, și liniștitor.

### Datele structurate cu recenzii (AggregateRating + Review)

Scoase din `src/pages/reviews.astro`. Regula Google: dacă entitatea recenzată
controlează recenziile despre ea, pagina **nu e eligibilă** pentru stele în
rezultate, iar marcajul poate atrage o penalizare manuală pentru „spammy
structured data". Recenziile rămân pe pagină, întregi, cu link la fișa Google.
Stelele din Google vin oricum din fișa lui, nu din site.

### Adresa

`addressLocality` era „Sacramento". Firma e în **Antelope** și în registrul
CSLB, și în fișa Google. S-a corectat în `site.ts`, în datele structurate (cu
cod poștal), în subsol și în emailul de lead. Textul de marketing rămâne
„serving the greater Sacramento area", care e adevărat.

**Strada nu e publicată.** Cele două registre dau două adrese diferite
(Borthwick la CSLB, Walerga la Google) și una dintre ele e probabil casa lui.
De întrebat pe Alex care e cea bună înainte de a o pune pe site. Dacă o punem,
trebuie să fie **identică** cu cea din fișa Google, altfel strică semnalul
local NAP.

---

## 3. Recenziile sunt reale, nu s-a șters niciuna

Verificate una câte una pe Google Maps: Priyanka, Jason Tan, Emanuel Gana și
restul apar acolo cuvânt cu cuvânt, cu răspunsurile lui Alex sub ele. Fișa are
5,0 din 18 recenzii, site-ul arată 17. Nu e nimic fabricat, deci nu s-a șters
nimic. S-a adăugat în schimb o frază care spune de unde vin și că niciuna nu a
fost ascunsă pentru că nu ne-a plăcut, ceea ce e exact ce cere regula FTC
16 CFR 465.

Când Alex mai primește recenzii, se lipesc în cabinet, la Recenzii.

---

## 4. Cookie-uri: nu e nevoie de banner

Măsurat pe site-ul live, cu browser real, derulând pagina până jos:

- gazde contactate: `essentialflooringinc.com`, `dddtuvwqltjbtdaxcryp.supabase.co`
  (statistica noastră) și `www.google.com` (harta);
- **cookie-uri puse: zero**;
- `sessionStorage`: o singură cheie, `ef_sid`, care dispare la închiderea filei;
- `localStorage`: gol.

Harta, încărcată separat, cheamă `maps.googleapis.com` și `maps.gstatic.com`
și nu a pus niciun cookie în testul nostru, dar cererile duc oricum IP-ul
vizitatorului la Google.

Bannerele de cookie-uri vin din dreptul european, care cere consimțământ
*înainte*. Firma e din California și lucrează pentru proprietari din regiunea
Sacramento, nu se adresează Uniunii Europene. Legea aplicabilă este cea din
California: CalOPPA cere o politică publicată (o avem), iar CCPA/CPRA
funcționează pe principiul opt-out din vânzarea datelor, iar noi nu vindem
nimic. **Deci nu, nu trebuie banner.** Explicația stă scrisă pe
`/cookie-policy/`, ca să nu mai fie întrebarea pusă a doua oară.

Dacă vreodată apare Google Analytics, un pixel de Facebook sau un chat, situația
se schimbă și trebuie recitită pagina asta.

---

## 5. Formularul

Colectează strict: nume și telefon (obligatorii), email, oraș, serviciu și
mesaj (opționale). Plus un hash SHA-256 cu cheie al IP-ului, doar pentru
limitarea trimiterilor, care nu se poate întoarce în IP.

S-a adăugat o **bifă obligatorie** de consimțământ. Propoziția bifată se scrie
o singură dată în `ContactForm.astro`, ajunge la server prin `data-consent-text`
și se scrie în emailul de lead, ca să existe dovada a *ce* s-a acceptat, nu
doar că s-a acceptat ceva. Verificat în browser: formularul nu se trimite fără
bifă, iar corpul cererii conține `consent` și `consentText`.

Consimțământul **nu** se scrie în tabelul `leads`, fiindcă tabelul nu are
coloană pentru el și un câmp necunoscut ar face insertul să pice cu PGRST204,
adică s-ar pierde exact cererea. Dacă vrei să se salveze și în baza de date,
rulează întâi asta în SQL Editor din Supabase:

```sql
alter table public.leads
  add column if not exists consent_text text,
  add column if not exists consent_at timestamptz;
```

și abia apoi adaugă `consent_text` și `consent_at` în obiectul trimis către
`leads` din `api/contact.ts`. În ordinea asta, nu invers.

---

## 6. Poze și fonturi

- Pozele de lucrări sunt ale lui Alex. Nu apare nicio persoană identificabilă
  și niciun număr de casă.
- Cele 7 poze de stoc sunt de pe Pexels, licență comercială fără atribuire
  obligatorie, listate cu fotograf și link în `docs/PHOTO-CREDITS.md`.
  Verificate: niciuna nu arată o persoană identificabilă la față și niciuna nu
  e prezentată drept lucrare de-a noastră, ceea ce acoperă cele două restricții
  reale din licența Pexels.
- Fonturile Archivo și Fraunces sunt sub SIL Open Font License 1.1, servite de
  pe serverul nostru. Nu cer atribuire pe pagină.

---

## 7. Ce a rămas de făcut

1. **Certificatul de asigurare de la Alex.** O poză pe WhatsApp. Site-ul scrie
   „Licensed & Insured" pe baza declarației lui scrise din 9 septembrie, nu pe
   baza unui document văzut de noi. Poza se cere și se pune la dosar.
2. **Strada**, dacă vrea să apară pe site. Cele două registre dau două adrese
   diferite, deci întâi întrebi, apoi pui. Momentan scrie doar „Antelope, CA
   95843", care e corect în ambele.

Restul, decis de Artiom pe 9 septembrie: anul rămâne 2023 și experiența 5+ ani,
fișa Google se lasă în pace, gresia nu se mai discută, iar contractul rămâne cum
îl face el.
