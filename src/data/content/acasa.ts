// Prima pagina. Textele sunt exact cele de azi din src/pages/index.astro,
// src/components/CtaBand.astro si src/components/WorkInProgress.astro: cat
// timp clientul nu suprascrie nimic, site-ul se construieste identic.
//
// Ce nu apare aici, si de ce:
//   - eyebrow-urile sectiunilor (Services, Process, FAQ): etichete de
//     categorie de un cuvant, pe care nimeni nu le schimba;
//   - legaturile de sectiune ("All 16 services", "See all 12 pairs"): sunt
//     navigatie, iar cifrele din ele urmaresc numaratori reale din cod;
//   - banda de cifre (Stats): fiecare eticheta e lipita de un numar calculat
//     in cod, deci editata singura ar contrazice numarul de langa ea;
//   - randul "Also serving ...", lista de orase si teaserul de recenzii: sunt
//     generate integral din date, nu au parte fixa de editat.
import type { ContentField } from './types';

export const acasa: ContentField[] = [
  // HERO
  {
    key: 'home.hero.title_line_1',
    group: 'acasa',
    section: { ro: 'Titlul de sus', en: 'Hero' },
    label: { ro: 'Titlul mare, primul rând', en: 'Main heading, first line' },
    help: {
      ro: 'Cel mai mare text de pe prima pagină, deasupra fotografiei. Dacă e prea lung se rupe pe încă un rând și împinge poza în jos.',
      en: 'The largest text on the home page, above the photo. Too long and it wraps onto another line and pushes the photo down.',
    },
    type: 'text',
    default: 'Sacramento Flooring Contractor',
    page: '/',
    softMax: 38,
    required: true,
  },
  {
    key: 'home.hero.title_line_2',
    group: 'acasa',
    section: { ro: 'Titlul de sus', en: 'Hero' },
    label: { ro: 'Titlul mare, al doilea rând', en: 'Main heading, second line' },
    help: {
      ro: 'Continuarea titlului, scrisă drept. Partea înclinată de la capătul rândului se editează separat, în câmpul următor.',
      en: 'The rest of the heading, in upright type. The slanted part at the end of the line is a separate field below.',
    },
    type: 'text',
    default: 'Hardwood, LVP',
    page: '/',
    softMax: 20,
  },
  {
    key: 'home.hero.title_accent',
    group: 'acasa',
    section: { ro: 'Titlul de sus', en: 'Hero' },
    label: { ro: 'Partea înclinată din titlu', en: 'Slanted part of the heading' },
    help: {
      ro: 'Se vede la capătul rândului al doilea, înclinată și în culoarea aramie. Poate rămâne goală dacă nu vrei accentul. Poți scrie semnul & normal, se afișează corect.',
      en: 'Shows at the end of the second line, slanted and in the copper colour. It can stay empty if you do not want the accent. You can type the & sign normally, it displays correctly.',
    },
    type: 'text',
    default: '& Stair Installation',
    page: '/',
    softMax: 26,
  },
  {
    key: 'home.hero.subtitle',
    group: 'acasa',
    section: { ro: 'Titlul de sus', en: 'Hero' },
    label: { ro: 'Rândul de sub titlu', en: 'Line under the heading' },
    help: {
      ro: 'Spune în câteva cuvinte ce faceți și unde. Stă sub titlu, deasupra butonului. Peste două rânduri împinge butonul prea jos.',
      en: 'Says in a few words what you do and where. It sits under the heading, above the button. Past two lines it pushes the button too far down.',
    },
    type: 'text',
    default: 'Hardwood refinishing, vinyl plank and stairs in greater Sacramento.',
    page: '/',
    softMax: 80,
  },
  {
    key: 'home.hero.cta_label',
    group: 'acasa',
    section: { ro: 'Titlul de sus', en: 'Hero' },
    label: { ro: 'Textul butonului principal', en: 'Main button label' },
    help: {
      ro: 'Butonul de sub titlu, care duce la pagina de contact. Trei, patru cuvinte: mai mult și textul iese din buton pe telefon.',
      en: 'The button under the heading that opens the contact page. Three or four words: more than that and the text breaks out of the button on a phone.',
    },
    type: 'text',
    default: 'Get a free estimate',
    page: '/',
    softMax: 24,
    required: true,
  },
  {
    key: 'home.hero.cta_note',
    group: 'acasa',
    section: { ro: 'Titlul de sus', en: 'Hero' },
    label: { ro: 'Nota de lângă buton', en: 'Note next to the button' },
    help: {
      ro: 'Rândul mic de lângă buton și numărul de telefon. Bun pentru o promisiune scurtă, de exemplu că devizul e gratuit.',
      en: 'The small line beside the button and the phone number. Good for one short promise, such as the estimate being free.',
    },
    type: 'text',
    default: 'Free estimates, no call-out fee',
    page: '/',
    softMax: 40,
  },
  {
    key: 'home.hero.facts',
    group: 'acasa',
    section: { ro: 'Titlul de sus', en: 'Hero' },
    label: { ro: 'Cele patru fapte de sub fotografie', en: 'The four facts under the photo' },
    help: {
      ro: 'Rândul de patru fapte de sub poza mare. Titlul e scris îngroșat, detaliul apare sub el. {license} se completează singur cu licența din Datele firmei, iar {cities} cu numărul de orașe deservite, deci lasă-le în text. Ține fiecare rând sub cinci cuvinte, altfel faptele nu mai stau aliniate.',
      en: 'The row of four facts under the large photo. The title is in bold, the detail sits under it. {license} fills in automatically with the licence from Business details, and {cities} with the number of cities served, so leave them in the text. Keep each line under five words, otherwise the facts stop lining up.',
    },
    type: 'pairs',
    default:
      '[{"title":"Licensed & insured","text":"{license}"},{"title":"Mon to Sat","text":"7 AM to 7 PM"},{"title":"{cities} cities and areas","text":"across Northern California"},{"title":"Free estimates","text":"written, no hidden fees"}]',
    page: '/',
    required: true,
  },

  // SERVICII
  {
    key: 'home.services.title',
    group: 'acasa',
    section: { ro: 'Servicii', en: 'Services' },
    label: { ro: 'Titlul secțiunii de servicii', en: 'Services section heading' },
    help: {
      ro: 'Titlul mare de pe banda verde închis cu serviciile. Peste două rânduri se lipește de textul de sub el.',
      en: 'The large heading on the dark green band with the services. Past two lines it crowds the text below it.',
    },
    type: 'text',
    default: 'What we install and refinish',
    page: '/',
    softMax: 46,
    required: true,
  },
  {
    key: 'home.services.intro',
    group: 'acasa',
    section: { ro: 'Servicii', en: 'Services' },
    label: { ro: 'Textul de sub titlul serviciilor', en: 'Services section intro' },
    help: {
      ro: 'Două propoziții sub titlu, pe banda verde închis. Aici spui pe scurt de ce merită să lucreze cu tine. Numele celor cinci servicii vin din grupul Servicii.',
      en: 'Two sentences under the heading on the dark green band. This is where you say briefly why working with you is worth it. The names of the five services come from the Services group.',
    },
    type: 'textarea',
    default:
      'From tear-out to the last baseboard, one licensed contractor owns the whole job. No handoffs, no finger-pointing.',
    page: '/',
  },

  // INAINTE SI DUPA
  {
    key: 'home.before_after.title',
    group: 'acasa',
    section: { ro: 'Înainte și după', en: 'Before and after' },
    label: { ro: 'Titlul secțiunii înainte și după', en: 'Before and after heading' },
    help: {
      ro: 'Stă în stânga, lângă fotografiile cu cursor. Coloana e îngustă, deci un titlu lung se rupe pe patru rânduri.',
      en: 'Sits on the left, next to the slider photos. The column is narrow, so a long heading breaks over four lines.',
    },
    type: 'text',
    default: 'The same room, photographed twice',
    page: '/',
    softMax: 44,
    required: true,
  },
  {
    key: 'home.before_after.intro',
    group: 'acasa',
    section: { ro: 'Înainte și după', en: 'Before and after' },
    label: { ro: 'Textul de sub titlul înainte și după', en: 'Before and after intro' },
    help: {
      ro: 'Spune vizitatorului că poate trage de cursor ca să vadă aceeași cameră înainte și după. Fotografiile în sine vin din portofoliu.',
      en: 'Tells the visitor they can drag the slider to see the same room before and after. The photos themselves come from the portfolio.',
    },
    type: 'textarea',
    default:
      'Every pair below was shot on real Sacramento area projects. Pick a project, pull the slider, and see exactly what we walked into and what we left behind.',
    page: '/',
  },

  // CUM LUCRAM
  {
    key: 'home.process.title',
    group: 'acasa',
    section: { ro: 'Cum lucrăm', en: 'Process' },
    label: { ro: 'Titlul secțiunii cu pașii lucrării', en: 'Process section heading' },
    help: {
      ro: 'Rămâne fixat în stânga cât timp vizitatorul derulează pașii. Coloana e îngustă, un titlu lung ocupă patru rânduri.',
      en: 'Stays pinned on the left while the visitor scrolls through the steps. The column is narrow, so a long heading takes four lines.',
    },
    type: 'text',
    default: 'From the first call to the final walkthrough',
    page: '/',
    softMax: 52,
    required: true,
  },
  {
    key: 'home.process.steps',
    group: 'acasa',
    section: { ro: 'Cum lucrăm', en: 'Process' },
    label: { ro: 'Cei patru pași ai lucrării', en: 'The four steps of the job' },
    help: {
      ro: 'Fiecare pas are un titlu scurt și o explicație de două, trei rânduri. Numerele 01 până la 04 se pun singure, în ordinea de aici. Poți schimba textele, dar patru pași este numărul care încape frumos lângă fotografie.',
      en: 'Each step has a short title and a two or three line explanation. The numbers 01 to 04 are added automatically, in this order. You can change the wording, but four steps is the count that fits neatly next to the photo.',
    },
    type: 'pairs',
    default:
      '[{"title":"Free consultation","text":"We visit your home, measure the space, and talk through materials, colors and budget. You get a clear written quote with no hidden fees."},{"title":"Preparation","text":"We remove old flooring when needed, level and grind the subfloor, and acclimate materials so your new floor stays flat and stable."},{"title":"Expert installation","text":"Every floor is installed or refinished with care for the details: tight seams, clean transitions, straight lines and finished baseboards."},{"title":"Final walkthrough","text":"We inspect every room together, clean up completely, and hand you a floor that is ready to live on from day one."}]',
    page: '/',
    required: true,
  },

  // PORTOFOLIU
  {
    key: 'home.portfolio.title',
    group: 'acasa',
    section: { ro: 'Portofoliu', en: 'Portfolio' },
    label: { ro: 'Titlul secțiunii cu fotografii', en: 'Recent work heading' },
    help: {
      ro: 'Titlul de deasupra mozaicului de poze din lucrări. Peste două rânduri împinge pozele în jos.',
      en: 'The heading above the mosaic of job photos. Past two lines it pushes the photos down.',
    },
    type: 'text',
    default: 'Floors we finished around Sacramento',
    page: '/',
    softMax: 46,
    required: true,
  },
  {
    key: 'home.portfolio.intro',
    group: 'acasa',
    section: { ro: 'Portofoliu', en: 'Portfolio' },
    label: { ro: 'Textul de sub titlul cu fotografii', en: 'Recent work intro' },
    help: {
      ro: 'O propoziție care spune că fotografiile sunt din lucrările voastre, nu luate de pe internet.',
      en: 'One sentence saying the photos are from your own jobs, not taken off the internet.',
    },
    type: 'textarea',
    default: 'Every photo is our own work in the Sacramento area, straight off the phone, on the job.',
    page: '/',
  },
  {
    key: 'home.work_in_progress.title',
    group: 'acasa',
    section: { ro: 'Portofoliu', en: 'Portfolio' },
    label: { ro: 'Titlul benzii cu poze din șantier', en: 'Jobs in progress heading' },
    help: {
      ro: 'Titlul centrat de deasupra celor trei poze din timpul lucrului. Două, trei cuvinte: e scris mare și centrat, iar un titlu lung se rupe deasupra pozelor.',
      en: 'The centred heading above the three photos taken during the work. Two or three words: it is set large and centred, and a long one breaks over the photos.',
    },
    type: 'text',
    default: 'Jobs in progress',
    page: '/',
    softMax: 34,
    required: true,
  },

  // DE CE NOI
  {
    key: 'home.why.title',
    group: 'acasa',
    section: { ro: 'De ce noi', en: 'Why us' },
    label: { ro: 'Titlul secțiunii cu motive', en: 'Why us heading' },
    help: {
      ro: 'Titlul din stânga, deasupra celor patru motive bifate. Peste două rânduri se apropie prea mult de prima bifă.',
      en: 'The heading on the left, above the four ticked reasons. Past two lines it sits too close to the first tick.',
    },
    type: 'text',
    default: 'Licensed, insured and owner operated',
    page: '/',
    softMax: 46,
    required: true,
  },
  {
    key: 'home.why.reasons',
    group: 'acasa',
    section: { ro: 'De ce noi', en: 'Why us' },
    label: { ro: 'Cele patru motive', en: 'The four reasons' },
    help: {
      ro: 'Fiecare motiv are un titlu scurt și o explicație de un rând, două. {license} se completează singur cu licența din Datele firmei, deci las-o în text. Patru motive încap fără să lungească pagina.',
      en: 'Each reason has a short title and a one or two line explanation. {license} fills in automatically with the licence from Business details, so leave it in the text. Four reasons fit without stretching the page.',
    },
    type: 'pairs',
    default:
      '[{"title":"California licensed contractor","text":"We operate under {license}, fully insured. You are protected, and the work is up to code."},{"title":"Transparent quotes","text":"Your written estimate spells out materials, labor and timeline. The price we quote is the price you pay."},{"title":"On-time completion","text":"Flooring work disrupts your routine, so we plan carefully and finish when we said we would."},{"title":"Prep work done properly","text":"Old flooring out, subfloor levelled and cleaned, moisture checked. The part you never see is what keeps a floor flat."}]',
    page: '/',
    required: true,
  },

  // ZONE DESERVITE
  {
    key: 'home.areas.title',
    group: 'acasa',
    section: { ro: 'Zone deservite', en: 'Service areas' },
    label: { ro: 'Titlul cutiei cu orașe', en: 'Service areas card heading' },
    help: {
      ro: 'Titlul cutiei albe din dreapta, cea cu lista de orașe. Ține-l de două, trei cuvinte, cutia e îngustă.',
      en: 'The heading of the white card on the right, the one with the city list. Keep it to two or three words, the card is narrow.',
    },
    type: 'text',
    default: 'Where we work',
    page: '/',
    softMax: 26,
    required: true,
  },
  {
    key: 'home.areas.intro',
    group: 'acasa',
    section: { ro: 'Zone deservite', en: 'Service areas' },
    label: { ro: 'Textul de sub titlul cutiei cu orașe', en: 'Service areas card intro' },
    help: {
      ro: 'O propoziție sub titlu, deasupra listei. Lista de orașe și rândul cu zonele suplimentare se scriu singure din zonele deservite, nu se editează aici.',
      en: 'One sentence under the heading, above the list. The city list and the line about the extra areas write themselves from the service areas, they are not edited here.',
    },
    type: 'textarea',
    default: 'Based in Sacramento, serving homes across the region.',
    page: '/',
  },

  // INTREBARI
  {
    key: 'home.faq.title',
    group: 'acasa',
    section: { ro: 'Întrebări frecvente', en: 'FAQ' },
    label: { ro: 'Titlul secțiunii de întrebări', en: 'FAQ section heading' },
    help: {
      ro: 'Titlul centrat de deasupra celor patru întrebări de pe prima pagină. Întrebările și răspunsurile în sine se editează la grupul Întrebări frecvente.',
      en: 'The centred heading above the four questions on the home page. The questions and answers themselves are edited in the FAQ group.',
    },
    type: 'text',
    default: 'Questions we get asked',
    page: '/',
    softMax: 44,
    required: true,
  },

  // BANDA DE FINAL
  {
    key: 'home.cta.title',
    group: 'acasa',
    section: { ro: 'Banda de final', en: 'Closing band' },
    label: { ro: 'Titlul benzii de la final', en: 'Closing band heading' },
    help: {
      ro: 'Titlul mare de pe banda verde închis de la finalul paginii. Aceeași bandă apare la finalul aproape tuturor paginilor, deci ce schimbi aici se vede peste tot.',
      en: 'The large heading on the dark green band at the bottom of the page. The same band closes nearly every page, so a change here shows everywhere.',
    },
    type: 'text',
    default: 'Tell us about your floor',
    page: '/',
    softMax: 44,
    required: true,
  },
  {
    key: 'home.cta.text',
    group: 'acasa',
    section: { ro: 'Banda de final', en: 'Closing band' },
    label: { ro: 'Textul benzii de la final', en: 'Closing band text' },
    help: {
      ro: 'Două propoziții sub titlul benzii, la fel pe aproape toate paginile. Aici e locul invitației de a cere un deviz.',
      en: 'Two sentences under the band heading, the same on nearly every page. This is the place for the invitation to ask for a quote.',
    },
    type: 'textarea',
    default:
      'Tell us about your project. We come out, measure, and give you a clear written quote. No pressure, no hidden fees.',
    page: '/',
  },
  {
    key: 'home.cta.button',
    group: 'acasa',
    section: { ro: 'Banda de final', en: 'Closing band' },
    label: { ro: 'Textul butonului din banda de final', en: 'Closing band button label' },
    help: {
      ro: 'Butonul care duce la pagina de contact, de pe banda de la finalul aproape tuturor paginilor. Trei, patru cuvinte, altfel textul iese din buton pe telefon.',
      en: 'The button that opens the contact page, on the band that closes nearly every page. Three or four words, otherwise the text breaks out of the button on a phone.',
    },
    type: 'text',
    default: 'Get a Free Estimate',
    page: '/',
    softMax: 24,
    required: true,
  },
];
