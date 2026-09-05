// Zonele deservite: pagina cu toate zonele si textele comune ale paginilor de oras.
//
// Aici stau doua lucruri, si numai doua:
//   1. Pagina /service-areas/ (titlul, fraza de sub el, cele doua liste de orase,
//      ultimul paragraf pentru cine nu isi gaseste orasul).
//   2. Ramele care se repeta identic pe toate paginile de oras: titlurile de
//      sectiune, caseta de estimare din margine si banda de indemn de la final.
//
// Ce NU sta aici: cele cinci texte proprii fiecarui oras. Ele sunt peste 140 de
// campuri, se editeaza dintr-un ecran cu selector de oras si se salveaza sub chei
// generate, city.<slug>.<camp>. Forma lor e descrisa mai jos in CITY_FIELDS, iar
// implicitul fiecarui oras vine din src/data/cities.json la rulare, nu de aici.
import type { ContentField, Bilingual, FieldType } from './types';

export const zone: ContentField[] = [
  // --- Pagina cu toate zonele: capul paginii ---
  {
    key: 'areas.hero.title',
    group: 'zone',
    section: { ro: 'Capul paginii cu zone', en: 'Service areas page header' },
    label: { ro: 'Titlul mare, prima parte', en: 'Main heading, first part' },
    help: {
      ro: 'Se vede sus de tot, peste hartă. Partea a doua, cea scrisă înclinat, se schimbă din câmpul următor. Dacă e lung, titlul coboară peste rândul de fotografii.',
      en: 'Sits at the very top, over the map. The second, slanted part is edited in the next field. If it runs long, the heading drops onto the photo row.',
    },
    type: 'text',
    default: 'Where we work',
    page: '/service-areas/',
    softMax: 24,
    required: true,
  },
  {
    key: 'areas.hero.title_accent',
    group: 'zone',
    section: { ro: 'Capul paginii cu zone', en: 'Service areas page header' },
    label: { ro: 'Titlul mare, partea scrisă înclinat', en: 'Main heading, slanted part' },
    help: {
      ro: 'Continuarea titlului, cu litere înclinate și colorate. Se citește ca o singură frază împreună cu partea dinainte.',
      en: 'The rest of the heading, in slanted accent type. It reads as one sentence together with the part before it.',
    },
    type: 'text',
    default: 'around Sacramento',
    page: '/service-areas/',
    softMax: 24,
  },
  {
    key: 'areas.hero.intro',
    group: 'zone',
    section: { ro: 'Capul paginii cu zone', en: 'Service areas page header' },
    label: { ro: 'Fraza de sub titlu', en: 'Line under the heading' },
    help: {
      ro: 'O frază scurtă care spune de unde lucrați și până unde ajungeți. Peste trei rânduri împinge fotografiile în jos.',
      en: 'One short line saying where you are based and how far you go. Past three lines it pushes the photos down.',
    },
    type: 'textarea',
    default:
      'Based in Sacramento, working in homes across Sacramento, Placer, El Dorado, Yolo and Sutter counties.',
    page: '/service-areas/',
  },

  // --- Pagina cu toate zonele: cele doua liste de orase ---
  {
    key: 'areas.inner.title',
    group: 'zone',
    section: { ro: 'Listele de orașe', en: 'The town lists' },
    label: { ro: 'Titlul primei liste de orașe', en: 'Heading of the first town list' },
    help: {
      ro: 'Stă în stânga listei cu orașele din jurul Sacramento. Coloana e îngustă, așa că un titlu lung se rupe pe mai multe rânduri.',
      en: 'Sits to the left of the towns around Sacramento. The column is narrow, so a long heading breaks over several lines.',
    },
    type: 'text',
    default: 'Greater Sacramento',
    page: '/service-areas/',
    softMax: 26,
    required: true,
  },
  {
    key: 'areas.inner.text',
    group: 'zone',
    section: { ro: 'Listele de orașe', en: 'The town lists' },
    label: { ro: 'Textul de sub primul titlu', en: 'Text under the first heading' },
    help: {
      ro: 'Spune ce cuprinde prima listă. În locul lui {count} se pune automat numărul de orașe, ca cifra să nu rămână greșită dacă mai adăugăm unul.',
      en: 'Says what the first list covers. {count} is filled in automatically with the number of towns, so the figure cannot go stale.',
    },
    type: 'textarea',
    default: '{count} towns inside the metro, from Elk Grove up to Roseville.',
    page: '/service-areas/',
  },
  {
    key: 'areas.outer.title',
    group: 'zone',
    section: { ro: 'Listele de orașe', en: 'The town lists' },
    label: { ro: 'Titlul celei de-a doua liste de orașe', en: 'Heading of the second town list' },
    help: {
      ro: 'Stă în stânga listei cu orașele mai depărtate. Aceeași coloană îngustă ca la primul titlu.',
      en: 'Sits to the left of the towns further out. Same narrow column as the first heading.',
    },
    type: 'text',
    default: 'Surrounding areas',
    page: '/service-areas/',
    softMax: 26,
    required: true,
  },
  {
    key: 'areas.outer.text',
    group: 'zone',
    section: { ro: 'Listele de orașe', en: 'The town lists' },
    label: { ro: 'Textul de sub al doilea titlu', en: 'Text under the second heading' },
    help: {
      ro: 'În locul lui {count} se pune automat numărul de orașe, iar în locul lui {regions} rândul despre zonele lucrate prin înțelegere, azi San Francisco Bay Area. Lăsați-le așa cum sunt, se completează singure.',
      en: 'The site fills {count} with the number of towns and {regions} with the clause about areas worked by arrangement, today the San Francisco Bay Area. Leave both as they are, they fill themselves in.',
    },
    type: 'textarea',
    default:
      '{count} towns further out, from Yuba City down to Galt and from Davis over to El Dorado Hills{regions}.',
    page: '/service-areas/',
  },
  {
    key: 'areas.list.not_listed',
    group: 'zone',
    section: { ro: 'Listele de orașe', en: 'The town lists' },
    label: {
      ro: 'Textul pentru cine nu își găsește orașul',
      en: 'Message for towns not on the list',
    },
    help: {
      ro: 'Ultimul paragraf al paginii, sub cele două liste. În locul lui {phone} se pune automat numărul de telefon al firmei, ca să nu fie nevoie să-l schimbați în două locuri.',
      en: 'The last paragraph of the page, below both lists. {phone} is filled in automatically with the business phone number, so you never change it in two places.',
    },
    type: 'textarea',
    default:
      'Not on the list? Call {phone} and ask. If you are anywhere near Sacramento, the answer is usually yes.',
    page: '/service-areas/',
  },

  // --- Titlurile care se repeta identic pe toate paginile de oras ---
  {
    key: 'city_page.body.local_title',
    group: 'zone',
    section: { ro: 'Titluri comune paginilor de oraș', en: 'Shared city page headings' },
    label: {
      ro: 'Titlul secțiunii despre casele din oraș',
      en: 'Heading of the local homes section',
    },
    help: {
      ro: 'Același titlu pe fiecare pagină de oraș, după textul de deschidere. În locul lui {city} se pune automat numele orașului. Peste două rânduri depărtează prea mult paragrafele.',
      en: 'The same heading on every city page, right after the opening text. {city} is replaced automatically with the town name. Past two lines it pulls the paragraphs too far apart.',
    },
    type: 'text',
    default: 'Flooring that fits {city}',
    page: '/service-areas/sacramento/',
    softMax: 40,
    required: true,
  },
  {
    key: 'city_page.body.services_title',
    group: 'zone',
    section: { ro: 'Titluri comune paginilor de oraș', en: 'Shared city page headings' },
    label: { ro: 'Titlul secțiunii de lucrări', en: 'Heading of the services section' },
    help: {
      ro: 'Stă deasupra paragrafului cu lucrări și a celor cinci butoane de servicii, pe fiecare pagină de oraș.',
      en: 'Sits above the services paragraph and the five service buttons, on every city page.',
    },
    type: 'text',
    default: 'What we do for homes here',
    page: '/service-areas/sacramento/',
    softMax: 40,
    required: true,
  },
  {
    key: 'city_page.body.why_title',
    group: 'zone',
    section: { ro: 'Titluri comune paginilor de oraș', en: 'Shared city page headings' },
    label: { ro: 'Titlul secțiunii de încredere', en: 'Heading of the trust section' },
    help: {
      ro: 'Ultimul titlu din corpul paginii de oraș, deasupra paragrafului cu licența și felul în care lucrați.',
      en: 'The last heading in the body of a city page, above the paragraph about your licence and the way you work.',
    },
    type: 'text',
    default: 'Why neighbors trust us',
    page: '/service-areas/sacramento/',
    softMax: 40,
    required: true,
  },
  {
    key: 'city_page.faq.title',
    group: 'zone',
    section: { ro: 'Titluri comune paginilor de oraș', en: 'Shared city page headings' },
    label: { ro: 'Titlul de deasupra întrebărilor', en: 'Heading above the questions' },
    help: {
      ro: 'Titlul centrat de deasupra întrebărilor, pe fiecare pagină de oraș. În locul lui {city} se pune automat numele orașului.',
      en: 'The centred heading above the questions on every city page. {city} is replaced automatically with the town name.',
    },
    type: 'text',
    default: 'Flooring in {city}: common questions',
    page: '/service-areas/sacramento/',
    softMax: 46,
    required: true,
  },

  // --- Caseta de estimare din marginea paginilor de oras ---
  {
    key: 'city_page.sidebar.title',
    group: 'zone',
    section: { ro: 'Caseta de estimare', en: 'The estimate box' },
    label: { ro: 'Titlul casetei din dreapta', en: 'Heading of the side box' },
    help: {
      ro: 'Caseta albă care rămâne lângă text când coborâți pe pagină. E îngustă, așa că un titlu lung se rupe pe trei rânduri. În locul lui {city} se pune automat numele orașului.',
      en: 'The white box that stays beside the text as you scroll down. It is narrow, so a long heading breaks over three lines. {city} is replaced automatically with the town name.',
    },
    type: 'text',
    default: 'Free estimate in {city}',
    page: '/service-areas/sacramento/',
    softMax: 30,
    required: true,
  },
  {
    key: 'city_page.sidebar.text_near',
    group: 'zone',
    section: { ro: 'Caseta de estimare', en: 'The estimate box' },
    label: { ro: 'Textul casetei, orașe apropiate', en: 'Box text, nearby towns' },
    help: {
      ro: 'Se vede numai pe paginile orașelor din prima listă, cele din jurul Sacramento. Explică în două fraze cum se face măsurătoarea.',
      en: 'Shown only on the pages of the towns in the first list, the ones around Sacramento. Two sentences on how the measuring works.',
    },
    type: 'textarea',
    default:
      'Tell us about your rooms and floors. We measure on site and send a clear written quote, free of charge.',
    page: '/service-areas/sacramento/',
  },
  {
    key: 'city_page.sidebar.text_far',
    group: 'zone',
    section: { ro: 'Caseta de estimare', en: 'The estimate box' },
    label: { ro: 'Textul casetei, orașe depărtate', en: 'Box text, towns further out' },
    help: {
      ro: 'Același loc, dar numai pe paginile orașelor din a doua listă, de la Rocklin la San Francisco Bay Area. Acolo lucrarea se evaluează întâi după măsurători și fotografii.',
      en: 'Same spot, but only on the pages of the towns in the second list, from Rocklin to the San Francisco Bay Area, where the job is scoped from measurements and photos first.',
    },
    type: 'textarea',
    default:
      'Tell us about your rooms and floors. For projects outside the Sacramento area we scope the job from your measurements and photos first, then confirm on site before any work starts.',
    page: '/service-areas/auburn/',
  },

  // --- Banda de indemn de la baza paginilor de oras ---
  {
    key: 'city_page.cta.title',
    group: 'zone',
    section: { ro: 'Îndemnul de la baza paginii', en: 'The closing call to action' },
    label: { ro: 'Titlul benzii închise de la final', en: 'Heading of the dark closing band' },
    help: {
      ro: 'Banda închisă la culoare de la baza fiecărei pagini de oraș. În locul lui {city} se pune automat numele orașului.',
      en: 'The dark band at the bottom of every city page. {city} is replaced automatically with the town name.',
    },
    type: 'text',
    default: 'Ready to upgrade your floors in {city}?',
    page: '/service-areas/sacramento/',
    softMax: 60,
    required: true,
  },
  {
    key: 'city_page.cta.text_near',
    group: 'zone',
    section: { ro: 'Îndemnul de la baza paginii', en: 'The closing call to action' },
    label: { ro: 'Textul benzii, orașe apropiate', en: 'Band text, nearby towns' },
    help: {
      ro: 'Fraza de sub titlul benzii, pe paginile orașelor din prima listă. Țineți-o scurtă, e ultimul lucru citit înainte de buton.',
      en: 'The line under the band heading, on the pages of the towns in the first list. Keep it short, it is the last thing read before the button.',
    },
    type: 'textarea',
    default: 'Free estimate, clear timeline, licensed contractor. It starts with one call.',
    page: '/service-areas/sacramento/',
  },
  {
    key: 'city_page.cta.text_far',
    group: 'zone',
    section: { ro: 'Îndemnul de la baza paginii', en: 'The closing call to action' },
    label: { ro: 'Textul benzii, orașe depărtate', en: 'Band text, towns further out' },
    help: {
      ro: 'Același loc, pe paginile orașelor din a doua listă. Aici se promit date stabilite în scris, fiindcă drumul e mai lung.',
      en: 'Same spot, on the pages of the towns in the second list, where dates are agreed in writing because the drive is longer.',
    },
    type: 'textarea',
    default: 'Free estimate, dates agreed in writing, licensed contractor. It starts with one call.',
    page: '/service-areas/auburn/',
  },
];

/** Un camp propriu unui singur oras. Cheia lui se compune la rulare, din slug:
 *  city.<slug>.<suffix>, si nu apare in registrul de mai sus. */
export type CityField = {
  /** Ultima bucata a cheii generate: city.<slug>.<suffix>. */
  suffix: 'h1' | 'intro' | 'local_context' | 'services_block' | 'why_us' | 'faq';
  /** Campul corespunzator din cities.json, de unde vine valoarea implicita.
   *  Cheile noastre sunt snake_case, cele din cities.json camelCase, deci
   *  legatura se scrie explicit: dedusa, ar cadea tacut pe 'localContext'. */
  source: 'h1' | 'intro' | 'localContext' | 'servicesBlock' | 'whyUs' | 'faq';
  label: Bilingual;
  help: Bilingual;
  type: FieldType;
  softMax?: number;
};

/** Sablonul unei pagini de oras: aceleasi sase campuri pentru fiecare din cele
 *  24 de orase si pentru pagina de regiune. Nu are valoare implicita, fiindca
 *  implicitul difera de la oras la oras si se citeste din cities.json. */
export const CITY_FIELDS: CityField[] = [
  {
    suffix: 'h1',
    source: 'h1',
    label: { ro: 'Titlul mare al paginii', en: 'Main page heading' },
    help: {
      ro: 'Primul text de sus, peste fotografie. Spuneți în el numele orașului, așa caută oamenii pe Google. Peste trei rânduri ajunge peste butoane.',
      en: 'The first text at the top, over the photo. Name the town in it, that is how people search. Past three lines it runs into the buttons.',
    },
    type: 'text',
    softMax: 65,
  },
  {
    suffix: 'intro',
    source: 'intro',
    label: { ro: 'Textul de deschidere', en: 'Opening text' },
    help: {
      ro: 'Două paragrafe la începutul paginii. Lăsați un rând gol între ele, altfel se lipesc într-un bloc greu de citit.',
      en: 'Two paragraphs at the start of the page. Leave one blank line between them, otherwise they run together into one heavy block.',
    },
    type: 'textarea',
  },
  {
    suffix: 'local_context',
    source: 'localContext',
    label: { ro: 'Despre casele din oraș', en: 'About the homes in this town' },
    help: {
      ro: 'Al doilea bloc de text. Aici scrieți ce e specific locului: vechimea caselor, cartierele, ce podele se găsesc de obicei acolo.',
      en: 'The second block of text. Write what is particular to the place: the age of the homes, the neighborhoods, the floors usually found there.',
    },
    type: 'textarea',
  },
  {
    suffix: 'services_block',
    source: 'servicesBlock',
    label: { ro: 'Ce lucrări faceți acolo', en: 'What you do there' },
    help: {
      ro: 'Paragraful de deasupra celor cinci butoane de servicii. Spuneți ce se cere cel mai des în orașul acesta, nu tot ce știți să faceți.',
      en: 'The paragraph above the five service buttons. Say what is asked for most often in this town, not everything you can do.',
    },
    type: 'textarea',
  },
  {
    suffix: 'why_us',
    source: 'whyUs',
    label: { ro: 'De ce să vă aleagă', en: 'Why they should pick you' },
    help: {
      ro: 'Ultimul paragraf înainte de întrebări: licența, asigurarea, felul în care lucrați și lăsați casa la sfârșitul zilei.',
      en: 'The last paragraph before the questions: licence, insurance, the way you work and how you leave the house at the end of the day.',
    },
    type: 'textarea',
  },
  {
    suffix: 'faq',
    source: 'faq',
    label: { ro: 'Întrebări și răspunsuri', en: 'Questions and answers' },
    help: {
      ro: 'Trei întrebări cu răspunsurile lor, la baza paginii. Google le poate arăta direct sub rezultat, așa că un răspuns întreg ajută mai mult decât unul scurt.',
      en: 'Three questions with their answers, at the bottom of the page. Google can show them under the search result, so a full answer helps more than a short one.',
    },
    type: 'faq',
  },
];
