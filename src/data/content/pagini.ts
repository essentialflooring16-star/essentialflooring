// Celelalte pagini: portofoliu, recenzii, blog, pagina de eroare.
//
// Valorile implicite de aici sunt textele de azi de pe site, copiate exact.
// Ce e derivat din cod (numarul licentei, anul infiintarii, telefonul) apare in
// text ca substituent intre acolade si se completeaza singur la build.
import type { ContentField } from './types';

export const pagini: ContentField[] = [
  // PORTOFOLIU ---------------------------------------------------------------
  {
    key: 'portfolio.hero.title',
    group: 'pagini',
    section: { ro: 'Portofoliu', en: 'Portfolio' },
    label: {
      ro: 'Titlul paginii, cel mai mare text de sus',
      en: 'Page heading, the largest text at the top',
    },
    help: {
      ro: 'Se vede deasupra galeriei cu pozele lucrărilor. Peste două rânduri împinge pozele sub marginea ecranului.',
      en: 'Sits above the gallery of finished work. Over two lines it pushes the photos below the fold.',
    },
    type: 'text',
    default: 'Our work, room by room',
    page: '/portfolio/',
    softMax: 55,
    required: true,
  },
  {
    key: 'portfolio.hero.intro',
    group: 'pagini',
    section: { ro: 'Portofoliu', en: 'Portfolio' },
    label: {
      ro: 'Textul de sub titlu',
      en: 'Intro paragraph under the heading',
    },
    help: {
      ro: 'Două sau trei rânduri care spun ce vede omul în galerie. Mai lung de atât, primele poze coboară prea mult.',
      en: 'Two or three lines saying what the gallery shows. Any longer and the first photos sit too far down.',
    },
    type: 'textarea',
    default:
      'Every photo here is a real Essential Flooring project from the Sacramento area. Hardwood brought back to life, waterproof LVP for busy families, and staircases rebuilt tread by tread.',
    page: '/portfolio/',
  },
  {
    key: 'portfolio.before_after.title',
    group: 'pagini',
    section: { ro: 'Portofoliu, banda înainte și după', en: 'Portfolio, before and after band' },
    label: {
      ro: 'Titlul benzii cu poze înainte și după',
      en: 'Heading of the before and after band',
    },
    help: {
      ro: 'Titlul de deasupra perechilor de poze, pe fundalul gri de la mijlocul paginii.',
      en: 'The heading above the photo pairs, on the grey band in the middle of the page.',
    },
    type: 'text',
    default: 'The part that actually shows',
    page: '/portfolio/',
    softMax: 60,
  },
  {
    key: 'portfolio.before_after.text',
    group: 'pagini',
    section: { ro: 'Portofoliu, banda înainte și după', en: 'Portfolio, before and after band' },
    label: {
      ro: 'Textul benzii cu poze înainte și după',
      en: 'Text of the before and after band',
    },
    help: {
      ro: 'O explicație scurtă sub titlul benzii. Spune că cele două poze sunt de la aceeași lucrare.',
      en: 'A short explanation under that heading. It says both photos come from the same job.',
    },
    type: 'textarea',
    default:
      'Every pair below is one job, photographed before we started and after we finished. Nothing here is a stock photo or a showroom.',
    page: '/portfolio/',
  },
  {
    key: 'portfolio.cta.title',
    group: 'pagini',
    section: { ro: 'Portofoliu, îndemnul de la final', en: 'Portfolio, closing band' },
    label: {
      ro: 'Titlul benzii închise de la finalul paginii',
      en: 'Heading of the dark band at the bottom',
    },
    help: {
      ro: 'Ultimul lucru citit înainte de butonul de ofertă. O întrebare scurtă merge cel mai bine.',
      en: 'The last thing read before the estimate button. A short question works best.',
    },
    type: 'text',
    default: 'Want your floor in this gallery?',
    page: '/portfolio/',
    softMax: 60,
  },
  {
    key: 'portfolio.cta.text',
    group: 'pagini',
    section: { ro: 'Portofoliu, îndemnul de la final', en: 'Portfolio, closing band' },
    label: {
      ro: 'Textul benzii de la finalul paginii',
      en: 'Text of the closing band',
    },
    help: {
      ro: 'Un rând între titlu și buton. Spune ce se întâmplă după ce omul trimite cererea.',
      en: 'One line between the heading and the button. It says what happens after someone writes in.',
    },
    type: 'textarea',
    default:
      'Send us a few details about your project and we will come out for a free measurement and estimate.',
    page: '/portfolio/',
  },

  // RECENZII -----------------------------------------------------------------
  {
    key: 'reviews.hero.title_no_reviews',
    group: 'pagini',
    section: { ro: 'Recenzii', en: 'Reviews' },
    label: {
      ro: 'Titlul paginii cât timp nu ai nicio recenzie',
      en: 'Page heading while there are no reviews',
    },
    help: {
      ro: 'Acesta se vede acum, fiindcă pagina nu are încă recenzii. Dispare singur de la prima recenzie salvată.',
      en: 'This is what shows today, because the page has no reviews yet. It disappears once the first review is saved.',
    },
    type: 'text',
    default: 'The work speaks first',
    page: '/reviews/',
    softMax: 45,
    required: true,
  },
  {
    key: 'reviews.hero.intro_no_reviews',
    group: 'pagini',
    section: { ro: 'Recenzii', en: 'Reviews' },
    label: {
      ro: 'Textul de sub titlu cât timp nu ai nicio recenzie',
      en: 'Intro under the heading while there are no reviews',
    },
    help: {
      ro: 'Un rând care spune unde stau recenziile. Se vede tot cât timp pagina e goală.',
      en: 'One line saying where the reviews live. It shows for as long as the page is empty.',
    },
    type: 'textarea',
    default: 'Our reviews live on Google. Here, the floors do the talking.',
    page: '/reviews/',
  },
  {
    key: 'reviews.hero.title_with_reviews',
    group: 'pagini',
    section: { ro: 'Recenzii', en: 'Reviews' },
    label: {
      ro: 'Titlul paginii după ce ai recenzii',
      en: 'Page heading once reviews exist',
    },
    help: {
      ro: 'Ia locul titlului de mai sus din clipa în care apare prima recenzie pe pagină.',
      en: 'Takes the place of the heading above the moment the first review lands on the page.',
    },
    type: 'text',
    default: 'What our clients say',
    page: '/reviews/',
    softMax: 45,
    required: true,
  },
  {
    key: 'reviews.hero.intro_with_reviews',
    group: 'pagini',
    section: { ro: 'Recenzii', en: 'Reviews' },
    label: {
      ro: 'Textul de sub titlu după ce ai recenzii',
      en: 'Intro under the heading once reviews exist',
    },
    help: {
      ro: 'Un rând care spune de unde vin recenziile de dedesubt. Se vede doar când pagina are recenzii.',
      en: 'One line saying where the reviews below come from. It shows only when the page has reviews.',
    },
    type: 'textarea',
    default:
      'Every review below was left on our Google Business Profile by someone we worked for.',
    page: '/reviews/',
  },
  {
    key: 'reviews.facts.items',
    group: 'pagini',
    section: { ro: 'Recenzii, cele trei fapte', en: 'Reviews, the three facts' },
    label: {
      ro: 'Cele trei fapte de pe pagina de recenzii',
      en: 'The three facts on the reviews page',
    },
    help: {
      ro: 'Trei rânduri scurte lângă câte un semn desenat, fiecare cu un titlu gros și o explicație subțire. {license} aduce singur numărul licenței, {year} anul înființării, {years} anii de experiență.',
      en: 'Three short lines next to a small drawn sign, each with a bold title and a light explanation. {license} fills in the license number, {year} the founding year, {years} the years of experience.',
    },
    type: 'pairs',
    default:
      '[{"title":"Licensed and insured","text":"{license}"},{"title":"Founded {year}","text":"{years}+ years of hands-on experience"},{"title":"Free written estimates","text":"no hidden fees"}]',
    page: '/reviews/',
  },
  {
    key: 'reviews.invite.title',
    group: 'pagini',
    section: { ro: 'Recenzii, invitația de a scrie', en: 'Reviews, the ask' },
    label: {
      ro: 'Titlul benzii care cere o recenzie',
      en: 'Heading of the band asking for a review',
    },
    help: {
      ro: 'Banda închisă cu cinci stele, de la mijlocul paginii. Peste două rânduri, butonul de dedesubt coboară prea mult.',
      en: 'The dark band with five stars in the middle of the page. Over two lines it pushes the button too far down.',
    },
    type: 'text',
    default: 'Worked with us? Leave a review',
    page: '/reviews/',
    softMax: 60,
  },
  {
    key: 'reviews.invite.text',
    group: 'pagini',
    section: { ro: 'Recenzii, invitația de a scrie', en: 'Reviews, the ask' },
    label: {
      ro: 'Textul de sub titlul care cere o recenzie',
      en: 'Text under that heading',
    },
    help: {
      ro: 'Un singur rând, între titlu și buton. Motivul pentru care merită să scrie recenzia.',
      en: 'A single line between the heading and the button. The reason it is worth writing one.',
    },
    type: 'textarea',
    default: 'A short Google review helps a small local business more than any ad could.',
    page: '/reviews/',
  },
  {
    key: 'reviews.invite.button',
    group: 'pagini',
    section: { ro: 'Recenzii, invitația de a scrie', en: 'Reviews, the ask' },
    label: {
      ro: 'Textul scris pe buton',
      en: 'The words on the button',
    },
    help: {
      ro: 'Butonul deschide profilul Google într-o filă nouă. Mai lung de patru cuvinte, pe telefon se rupe pe două rânduri.',
      en: 'The button opens the Google profile in a new tab. Beyond four words it wraps onto two lines on a phone.',
    },
    type: 'text',
    default: 'Write a review on Google',
    page: '/reviews/',
    softMax: 32,
    required: true,
  },

  // BLOG ---------------------------------------------------------------------
  {
    key: 'blog.hero.title',
    group: 'pagini',
    section: { ro: 'Blog', en: 'Blog' },
    label: {
      ro: 'Titlul paginii de blog, cel mai mare text de sus',
      en: 'Blog page heading, the largest text at the top',
    },
    help: {
      ro: 'Se vede deasupra listei de articole. Peste două rânduri, primele articole intră sub marginea ecranului.',
      en: 'Sits above the list of articles. Over two lines the first posts slip below the fold.',
    },
    type: 'text',
    default: 'Flooring advice for Sacramento homeowners',
    page: '/blog/',
    softMax: 55,
    required: true,
  },
  {
    key: 'blog.hero.intro',
    group: 'pagini',
    section: { ro: 'Blog', en: 'Blog' },
    label: {
      ro: 'Textul de sub titlul blogului',
      en: 'Intro under the blog heading',
    },
    help: {
      ro: 'Două rânduri despre ce fel de articole scrii. Rămâne la fel oricâte articole adaugi.',
      en: 'Two lines about the kind of articles you write. It stays the same however many posts you add.',
    },
    type: 'textarea',
    default:
      'Project stories, honest advice and floor care tips from Essential Flooring in Sacramento.',
    page: '/blog/',
  },

  // PAGINA DE EROARE ---------------------------------------------------------
  {
    key: 'error404.hero.title',
    group: 'pagini',
    section: { ro: 'Pagina de adresă greșită', en: 'Error page' },
    label: {
      ro: 'Titlul paginii de adresă greșită',
      en: 'Heading of the wrong address page',
    },
    help: {
      ro: 'Se vede doar când cineva ajunge la o adresă care nu există pe site. Sub el rămân butoanele spre prima pagină și spre ofertă.',
      en: 'Shown only when someone lands on an address the site does not have. The buttons to the home page and the estimate stay below it.',
    },
    type: 'text',
    default: 'This page got sanded away',
    page: '/404',
    softMax: 50,
    required: true,
  },
  {
    key: 'error404.hero.text',
    group: 'pagini',
    section: { ro: 'Pagina de adresă greșită', en: 'Error page' },
    label: {
      ro: 'Textul de sub titlul paginii de adresă greșită',
      en: 'Text under the error page heading',
    },
    help: {
      ro: 'Un rând care liniștește omul și îl trimite mai departe. Numărul de telefon de dedesubt se pune singur din datele firmei.',
      en: 'One line that reassures the visitor and sends them onward. The phone number below it fills in on its own from the business details.',
    },
    type: 'textarea',
    default: "The address you followed does not exist. Let's get you back on solid ground.",
    page: '/404',
  },
];
