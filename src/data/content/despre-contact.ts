// Despre noi, Contact si Intrebari frecvente.
//
// Trei pagini pe care clientul le schimba cel mai des: povestea firmei, ce
// scrie langa formular, si raspunsurile la intrebari. Valorile de mai jos sunt
// textele de azi, litera cu litera. Cat timp clientul nu le suprascrie din
// cabinet, site-ul se construieste exact cum arata acum.
//
// Ce nu e aici, si de ce: telefonul, emailul, programul si licenta vin din
// datele firmei (grupul 'firma'), ca sa se schimbe dintr-un singur loc pe tot
// site-ul. Etichetele formularului si mesajele lui de sistem raman in cod.
import type { ContentField } from './types';

export const despre_contact: ContentField[] = [
  // ------------------------------------------------------------------ despre
  {
    key: 'about.hero.eyebrow',
    group: 'despre',
    section: { ro: 'Partea de sus', en: 'Top of the page' },
    label: { ro: 'Rândul mic de deasupra titlului', en: 'Small line above the heading' },
    help: {
      ro: 'Se vede cu litere mici, scrise tot cu majuscule, chiar deasupra titlului mare. Punctul dintre cele două părți se scrie normal, ca semn. Peste 40 de caractere trece pe două rânduri și înghesuie titlul.',
      en: 'Shows in small all-caps type right above the main heading. The dot between the two halves is typed as a plain character. Past 40 characters it wraps and crowds the heading.',
    },
    type: 'text',
    default: 'Founded 2023 · Sacramento, CA',
    page: '/about/',
    softMax: 40,
  },
  {
    key: 'about.hero.title',
    group: 'despre',
    section: { ro: 'Partea de sus', en: 'Top of the page' },
    label: { ro: 'Titlul mare al paginii Despre noi', en: 'Main heading on the About page' },
    help: {
      ro: 'Cel mai mare text de pe pagină, primul pe care îl citește vizitatorul. Peste 60 de caractere se rupe pe trei rânduri și împinge în jos tot textul de sub el.',
      en: 'The largest text on the page and the first thing a visitor reads. Past 60 characters it breaks onto three lines and pushes everything below it down.',
    },
    type: 'text',
    default: 'Quality is the foundation of everything we do',
    page: '/about/',
    softMax: 60,
  },
  {
    key: 'about.story.paragraph_1',
    group: 'despre',
    section: { ro: 'Povestea firmei', en: 'Company story' },
    label: { ro: 'Primul paragraf despre firmă', en: 'First paragraph about the company' },
    help: {
      ro: 'Textul de sub titlu, în stânga fotografiei mari. Aici se spune cine a înființat firma și cu ce experiență. Trei sau patru propoziții, altfel coloana de text ajunge mai lungă decât poza de alături.',
      en: 'The text under the heading, to the left of the large photo. It says who founded the company and with what experience. Three or four sentences, otherwise the text column runs longer than the photo beside it.',
    },
    type: 'textarea',
    default:
      'Essential Flooring was founded in 2023 by Alexandru Szep with a clear goal: deliver high-quality flooring through a fast, efficient and stress-free process. With more than 5 years of hands-on experience in the flooring industry, Alexandru brings knowledge, precision and reliability to every project he takes on.',
    page: '/about/',
  },
  {
    key: 'about.story.paragraph_2',
    group: 'despre',
    section: { ro: 'Povestea firmei', en: 'Company story' },
    label: { ro: 'Al doilea paragraf despre firmă', en: 'Second paragraph about the company' },
    help: {
      ro: 'Continuarea, tot sub titlu. Aici sunt lucrările pe care le faceți și rezultatul promis. Dacă îl faci mult mai lung decât primul, textul coboară sub fotografie și pagina arată dezechilibrată.',
      en: 'The continuation, still under the heading. It covers the work you do and the result you promise. Much longer than the first one and the text runs past the photo, leaving the page lopsided.',
    },
    type: 'textarea',
    default:
      'We specialize in professional floor preparation, installation and finishing, for both residential and commercial spaces. Every job gets the same focus: speed, precision, attention to detail and results that last. The goal is simple, floors that raise the look, value and comfort of every space we touch.',
    page: '/about/',
  },
  {
    key: 'about.quote.text',
    group: 'despre',
    section: { ro: 'Citatul din caseta închisă', en: 'Quote in the dark card' },
    label: { ro: 'Fraza din caseta neagră', en: 'The line in the dark card' },
    help: {
      ro: 'Se vede în caseta neagră de sub fotografia mare, lângă poza mică. Ghilimelele fac parte din text, păstrează-le la început și la sfârșit. Peste 90 de caractere caseta crește și dă poza mică jos.',
      en: 'Shows in the dark card under the large photo, next to the small one. The quotation marks are part of the text, keep them at both ends. Past 90 characters the card grows and pushes the small photo down.',
    },
    type: 'text',
    default: '"Fast, efficient and stress-free. That is the whole philosophy."',
    page: '/about/',
    softMax: 90,
  },
  {
    key: 'about.quote.author',
    group: 'despre',
    section: { ro: 'Citatul din caseta închisă', en: 'Quote in the dark card' },
    label: { ro: 'Numele de sub frază', en: 'Name under the quote' },
    help: {
      ro: 'Rândul mic și palid de sub citat, cine a spus fraza. Un nume și o funcție scurtă, atât încape pe un singur rând.',
      en: 'The small faded line under the quote, saying who said it. A name and a short role is all that fits on one line.',
    },
    type: 'text',
    default: 'Alexandru Szep, founder',
    page: '/about/',
    softMax: 40,
  },
  {
    key: 'about.values.title',
    group: 'despre',
    section: { ro: 'Valorile, cele patru casete', en: 'Values, the four cards' },
    label: { ro: 'Titlul de deasupra celor patru casete', en: 'Heading above the four cards' },
    help: {
      ro: 'Titlul secțiunii din josul paginii, unde stau cele patru casete cu principiile firmei. Trei sau patru cuvinte.',
      en: 'The section heading at the bottom of the page, above the four cards with the company principles. Three or four words.',
    },
    type: 'text',
    default: 'What we stand for',
    page: '/about/',
    softMax: 40,
  },
  {
    key: 'about.values.items',
    group: 'despre',
    section: { ro: 'Valorile, cele patru casete', en: 'Values, the four cards' },
    label: { ro: 'Cele patru principii, titlu și explicație', en: 'The four principles, title and text' },
    help: {
      ro: 'Fiecare pereche devine o casetă, patru pe un rând pe ecran mare. Titlul de două sau trei cuvinte, explicația de una sau două propoziții. Dacă adaugi a cincea, rândul se rupe și ultima rămâne singură dedesubt.',
      en: 'Each pair becomes a card, four across on a wide screen. Two or three words for the title, one or two sentences for the text. Add a fifth and the row breaks, leaving the last one alone underneath.',
    },
    type: 'pairs',
    default: `[
  {
    "title": "Craft over shortcuts",
    "text": "Tight seams, straight lines, clean transitions. The small details are what you notice for the next twenty years."
  },
  {
    "title": "Straight talk",
    "text": "We tell you honestly when refinishing beats replacement, and when it does not. The estimate is free either way."
  },
  {
    "title": "Respect for your home",
    "text": "We mask, we protect, we clean up. You get new floors, not a mess."
  },
  {
    "title": "On schedule",
    "text": "Flooring work turns a home upside down, so we plan tightly and finish when we promised."
  }
]`,
    page: '/about/',
  },

  // ----------------------------------------------------------------- contact
  {
    key: 'contact.hero.title',
    group: 'contact',
    section: { ro: 'Partea de sus', en: 'Top of the page' },
    label: { ro: 'Titlul mare al paginii de contact', en: 'Main heading on the Contact page' },
    help: {
      ro: 'Primul text de pe pagina de contact, deasupra telefonului și emailului. Peste 45 de caractere trece pe trei rânduri și împinge datele de contact sub formular.',
      en: 'The first text on the contact page, above the phone and email. Past 45 characters it runs to three lines and pushes the contact details below the form.',
    },
    type: 'text',
    default: "Let's talk about your floors",
    page: '/contact/',
    softMax: 45,
  },
  {
    key: 'contact.hero.intro',
    group: 'contact',
    section: { ro: 'Partea de sus', en: 'Top of the page' },
    label: { ro: 'Textul de sub titlu', en: 'Text under the heading' },
    help: {
      ro: 'Două propoziții între titlu și lista cu telefon, email, zonă și program. Spune ce se întâmplă după ce omul trimite cererea. Mai lung de atât, lista de contact coboară prea jos în pagină.',
      en: 'Two sentences between the heading and the list with phone, email, area and hours. It says what happens after someone sends a request. Longer than that and the contact list sits too far down the page.',
    },
    type: 'textarea',
    default:
      'Send a few details and we will get back to you to schedule a free on-site estimate. Prefer to talk? Call us directly, we answer.',
    page: '/contact/',
  },
  {
    key: 'contact.next.title',
    group: 'contact',
    section: { ro: 'Caseta de pe fotografie', en: 'Box on the photo' },
    label: { ro: 'Titlul casetei de pe fotografie', en: 'Heading on the photo box' },
    help: {
      ro: 'Scris alb peste fotografia din josul paginii de contact, deasupra celor trei pași. Un rând scurt, altfel acoperă pașii de sub el.',
      en: 'White type over the photo at the bottom of the contact page, above the three steps. One short line, otherwise it covers the steps below it.',
    },
    type: 'text',
    default: 'What happens next?',
    page: '/contact/',
    softMax: 30,
  },
  {
    key: 'contact.next.steps',
    group: 'contact',
    section: { ro: 'Caseta de pe fotografie', en: 'Box on the photo' },
    label: { ro: 'Cei trei pași de după cerere', en: 'The three steps after a request' },
    help: {
      ro: 'Câte un pas pe rând, numerotate automat cu 1, 2, 3 peste fotografie. Trei rânduri scurte încap frumos, de la al patrulea caseta acoperă toată poza.',
      en: 'One step per line, numbered 1, 2, 3 automatically over the photo. Three short lines fit nicely, from the fourth on the box covers the whole photo.',
    },
    type: 'list',
    default: `We reply to confirm a time for the free on-site visit.
We measure, look at the space and talk options.
You receive a clear written quote. No hidden fees.`,
    page: '/contact/',
  },
  {
    key: 'contact.form.title',
    group: 'contact',
    section: { ro: 'Formularul', en: 'The form' },
    label: { ro: 'Titlul de deasupra formularului', en: 'Heading above the form' },
    help: {
      ro: 'Se vede în capul casetei albe cu formular, în dreapta pe ecran mare. Peste 34 de caractere trece pe două rânduri și îndepărtează primele câmpuri.',
      en: 'Sits at the top of the white form card, on the right on a wide screen. Past 34 characters it wraps to two lines and pushes the first fields down.',
    },
    type: 'text',
    default: 'Request a free estimate',
    page: '/contact/',
    softMax: 34,
  },

  // --------------------------------------------------------------- intrebari
  {
    key: 'faq.hero.title',
    group: 'intrebari',
    section: { ro: 'Partea de sus', en: 'Top of the page' },
    label: { ro: 'Titlul paginii de întrebări', en: 'Heading on the FAQ page' },
    help: {
      ro: 'Cel mai mare text de pe pagina cu întrebări frecvente, în stânga fotografiei. Două sau trei cuvinte, ca să rămână pe un rând lângă poză.',
      en: 'The largest text on the FAQ page, to the left of the photo. Two or three words, so it stays on one line next to the picture.',
    },
    type: 'text',
    default: 'Questions, answered',
    page: '/faq/',
    softMax: 34,
  },
  {
    key: 'faq.hero.intro',
    group: 'intrebari',
    section: { ro: 'Partea de sus', en: 'Top of the page' },
    label: { ro: 'Propoziția de sub titlu', en: 'Sentence under the heading' },
    help: {
      ro: 'Un singur rând sub titlul paginii de întrebări. Peste 90 de caractere trece pe două rânduri și împinge în jos rândul cu numărul de telefon.',
      en: 'A single line under the FAQ heading. Past 90 characters it wraps to two lines and pushes down the line with the phone number.',
    },
    type: 'text',
    default: 'Everything homeowners usually ask before starting a flooring project.',
    page: '/faq/',
    softMax: 90,
  },
  {
    key: 'faq.list.items',
    group: 'intrebari',
    section: { ro: 'Lista de întrebări', en: 'The question list' },
    label: { ro: 'Întrebările și răspunsurile', en: 'The questions and answers' },
    help: {
      ro: 'Fiecare pereche devine o întrebare care se deschide la clic. Aceleași răspunsuri le citește și Google și le poate arăta direct în rezultate, așa că scrie trei sau patru propoziții complete la fiecare. În primul răspuns și în cel despre licență sunt scrise telefonul, emailul și numărul de licență: dacă se schimbă, schimbă-le și aici.',
      en: 'Each pair becomes a question that opens on click. Google reads these answers too and can show them directly in search results, so write three or four full sentences for each. The first answer and the license one spell out the phone, the email and the license number: if those change, change them here as well.',
    },
    type: 'faq',
    default: `[
  {
    "q": "How does the free estimate work?",
    "a": "Call (916) 425-1361 or email essentialflooring16@gmail.com to set a time. We visit your home, measure the space, look at the subfloor, and talk through materials and finishes. You get a clear written quote with no obligation and no hidden fees. It costs nothing, and you decide from there at your own pace."
  },
  {
    "q": "How long does a typical floor installation take?",
    "a": "Every project is different, so timing depends on the size of the space, the material, and how much prep the subfloor needs. A single room can often be done in a day or two, while whole-home installations and hardwood refinishing take longer. You receive a clear timeline with your estimate, and we stick to it."
  },
  {
    "q": "Is furniture moving included in the price?",
    "a": "It depends on the project, so we discuss it during your free estimate. Some homeowners prefer to clear rooms themselves, while others want help with larger pieces. Either way, you will know exactly what is included before work begins, and it will be listed clearly in your written quote."
  },
  {
    "q": "Will hardwood refinishing fill my house with dust?",
    "a": "Far less than you might expect. Our modern sanding equipment uses dust containment that captures most dust at the source, so your home stays much cleaner than with older methods. We also cover vents and doorways where needed and clean up thoroughly before applying stain and protective finish."
  },
  {
    "q": "What flooring works best in kitchens and bathrooms?",
    "a": "For wet areas we usually recommend LVP installation. Luxury vinyl plank is 100 percent waterproof, so spills, splashes, and humidity will not warp or swell it, and it comes in wood and stone looks that suit any style. Moisture resistant laminate can also work in the right spaces. We will walk you through the options during your free estimate."
  },
  {
    "q": "Which floors hold up best with pets and kids?",
    "a": "LVP and vinyl plank are excellent choices for busy households. They are 100 percent waterproof, scratch resistant, and easy to clean after muddy paws and spilled juice. Laminate is another durable, budget friendly option. If you love the look of hardwood, we can recommend finishes that stand up well to daily wear. Tell us about your household and we will match the floor to your life."
  },
  {
    "q": "How should I prepare for installation day?",
    "a": "We will give you a simple checklist ahead of time. In general, remove small and fragile items from the work area, plan for pets to stay in another room, and keep a clear path to the space. Anything else, like furniture or appliance moving, will be agreed on during your estimate, so nothing catches you off guard on the day."
  },
  {
    "q": "Is Essential Flooring licensed and bonded?",
    "a": "Yes, and you can check every word of that yourself in about a minute. Essential Flooring Inc holds California contractor license CSLB #1117565, classification C-15 Flooring and Floor Covering, issued 7 March 2024 and current through 31 March 2028, with a $25,000 contractor bond filed with Western Surety Company. Type the license number into the Check A License page at cslb.ca.gov and you will see the status, the bond and any complaints on record. California also requires your written home improvement contract to state what insurance we carry, so you get that in writing before you sign anything."
  },
  {
    "q": "What areas do you serve?",
    "a": "We serve the greater Sacramento region, including Sacramento, Arden-Arcade, Carmichael, Citrus Heights, Rancho Cordova, North Highlands, Rio Linda, Antelope, Orangevale, Fair Oaks, Elk Grove, West Sacramento, Folsom, Roseville, Rocklin, Granite Bay, Lincoln, Loomis, El Dorado Hills, Auburn, Davis, Woodland, Galt and Yuba City. For select projects we also travel to the San Francisco Bay Area. Not sure if you are in range? Just call and ask."
  },
  {
    "q": "Are there any hidden fees in your quotes?",
    "a": "No. Your written quote lists everything the project includes, from floor removal and subfloor preparation to baseboard work and the flooring itself. The price you approve is the price you pay. If something unexpected comes up once the old floor is out, we talk it through with you and get your approval before any extra work happens."
  }
]`,
    page: '/faq/',
  },
];
