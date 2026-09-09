// Datele firmei: telefonul, emailul, programul, licenta, cifrele si linkurile.
//
// Sunt cele mai des schimbate texte de pe site si apar pe zeci de pagini, asa
// ca fiecare are o singura cheie folosita peste tot. Regula pe care o aplica
// acest fisier: niciun dat nu se scrie de doua ori. Telefonul are trei forme in
// cod (afisata, linkul de apel, forma structurata pentru Google) plus linkul de
// WhatsApp; toate patru se deduc din singura cheie de mai jos, ca sa nu existe
// campuri pe care clientul sa le tina sincronizate manual.
import type { ContentField } from './types';

const CONTACT = { ro: 'Contact', en: 'Contact' };
const DESPRE = { ro: 'Despre firmă', en: 'The business' };
const RETELE = { ro: 'Rețele sociale', en: 'Social profiles' };

export const firma: ContentField[] = [
  {
    key: 'business.contact.phone',
    group: 'firma',
    section: CONTACT,
    label: { ro: 'Numărul de telefon', en: 'Phone number' },
    help: {
      ro: 'Scrie-l o singură dată, aici. Butonul de apelare, linkul de WhatsApp și numărul pe care îl citește Google se fac automat din el. Se vede în subsolul fiecărei pagini și pe butoanele de apel, deci păstrează forma cu paranteze și liniuță.',
      en: 'Write it once, here. The call button, the WhatsApp link and the number Google reads are all built from it. It shows in the footer of every page and on the call buttons, so keep the same shape with brackets and a dash.',
    },
    type: 'tel',
    default: '(916) 425-1361',
    page: '/contact/',
    softMax: 18,
    required: true,
  },
  {
    key: 'business.contact.email',
    group: 'firma',
    section: CONTACT,
    label: { ro: 'Adresa de email', en: 'Email address' },
    help: {
      ro: 'Adresa pe care o deschide vizitatorul când apasă pe email, în subsol sau pe pagina de contact. O adresă mai lungă de vreo 34 de caractere se rupe pe două rânduri în subsol.',
      en: 'The address a visitor opens when they tap the email in the footer or on the contact page. Longer than about 34 characters and it breaks onto two lines in the footer.',
    },
    type: 'email',
    default: 'essentialflooring16@gmail.com',
    page: '/contact/',
    softMax: 34,
    required: true,
  },
  {
    key: 'business.contact.hours',
    group: 'firma',
    section: CONTACT,
    label: { ro: 'Programul de lucru', en: 'Working hours' },
    help: {
      ro: 'Se vede pe pagina de contact, la Hours, și în subsol. Ține-l pe un singur rând, zilele și apoi intervalul orar. Mai lung de vreo 40 de caractere și trece pe două rânduri.',
      en: 'Shows on the contact page under Hours and in the footer. Keep it on one line, the days and then the time range. Past about 40 characters it wraps onto two lines.',
    },
    type: 'text',
    default: 'Monday to Saturday, 7 AM to 7 PM',
    page: '/contact/',
    softMax: 40,
    required: true,
  },
  {
    key: 'business.details.license',
    group: 'firma',
    section: DESPRE,
    label: { ro: 'Numărul de licență CSLB', en: 'CSLB license number' },
    help: {
      ro: 'Apare cu litere mari pe pagina Despre și pe rândul "Licensed & Insured" din subsol, de pe prima pagină și de pe paginile de servicii. Scris mai lung de vreo 20 de caractere, sare pe două rânduri pe pagina Despre.',
      en: 'Shows in large type on the About page and on the "Licensed & Insured" line in the footer, on the home page and on the service pages. Longer than about 20 characters and it wraps on the About page.',
    },
    type: 'text',
    default: 'CSLB #1117565',
    page: '/about/',
    softMax: 20,
    required: true,
  },
  {
    key: 'business.details.founder',
    group: 'firma',
    section: DESPRE,
    label: { ro: 'Numele fondatorului', en: 'Founder name' },
    help: {
      ro: 'Se vede pe pagina Despre, sub citatul din caseta închisă la culoare, și intră în datele despre firmă pe care le citește Google.',
      en: 'Shows on the About page under the quote in the dark box, and goes into the business data Google reads.',
    },
    type: 'text',
    default: 'Alexandru Szep',
    page: '/about/',
    softMax: 28,
    required: true,
  },
  {
    key: 'business.details.founded',
    group: 'firma',
    section: DESPRE,
    label: { ro: 'Anul înființării', en: 'Year founded' },
    help: {
      ro: 'Cifra care se numără crescător în banda de pe prima pagină, la "Company founded". Scrie doar anul, din patru cifre, fără text în jur.',
      en: 'The number that counts up in the stats band on the home page, under "Company founded". Write the year alone, four digits, with no words around it.',
    },
    type: 'number',
    default: '2023',
    page: '/',
    required: true,
  },
  {
    key: 'business.details.experience_years',
    group: 'firma',
    section: DESPRE,
    label: { ro: 'Anii de experiență', en: 'Years of experience' },
    help: {
      ro: 'Tot în banda de cifre de pe prima pagină, la "Years of hands-on experience". Scrie doar numărul, semnul plus se adaugă singur.',
      en: 'Also in the stats band on the home page, under "Years of hands-on experience". Write the number alone, the plus sign is added for you.',
    },
    type: 'number',
    default: '5',
    page: '/',
    required: true,
  },
  {
    key: 'business.details.city',
    group: 'firma',
    section: DESPRE,
    label: { ro: 'Orașul firmei', en: 'Business city' },
    help: {
      ro: 'Orașul de bază: cel din blocul de contact din subsol și din datele pe care le citește Google. Nu are legătură cu paginile de oraș, acelea se editează la Zone deservite.',
      en: 'The home city: the one in the footer contact block and in the data Google reads. It has nothing to do with the city pages, those are edited under Service areas.',
    },
    type: 'text',
    default: 'Antelope',
    page: '/contact/',
    softMax: 24,
    required: true,
  },
  {
    key: 'business.social.instagram',
    group: 'firma',
    section: RETELE,
    label: { ro: 'Linkul de Instagram', en: 'Instagram link' },
    help: {
      ro: 'Butonul Instagram din subsolul fiecărei pagini duce aici. Copiază adresa întreagă din bara browserului, de pe pagina ta de Instagram.',
      en: 'The Instagram button in the footer of every page points here. Copy the whole address from the browser bar while on your Instagram page.',
    },
    type: 'url',
    default: 'https://www.instagram.com/essentialflooring16',
    page: '/',
  },
  {
    key: 'business.social.facebook',
    group: 'firma',
    section: RETELE,
    label: { ro: 'Linkul de Facebook', en: 'Facebook link' },
    help: {
      ro: 'Butonul Facebook din subsolul fiecărei pagini duce aici. Copiază adresa întreagă din bara browserului, de pe pagina ta de Facebook.',
      en: 'The Facebook button in the footer of every page points here. Copy the whole address from the browser bar while on your Facebook page.',
    },
    type: 'url',
    default: 'https://www.facebook.com/profile.php?id=61580305899098',
    page: '/',
  },
  {
    key: 'business.social.google',
    group: 'firma',
    section: RETELE,
    label: { ro: 'Linkul fișei Google', en: 'Google profile link' },
    help: {
      ro: 'Butonul de pe pagina de recenzii duce aici, acolo unde clienții pot lăsa o recenzie. Copiază linkul de partajare din fișa ta Google.',
      en: 'The button on the reviews page points here, where customers can leave a review. Copy the share link from your Google business profile.',
    },
    type: 'url',
    default: 'https://share.google/uPqoGQQ9rCQJQw4Gr',
    page: '/reviews/',
  },
];
