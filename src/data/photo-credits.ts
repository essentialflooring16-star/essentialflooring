// The stock photographs, with the photographer and the page they came from.
//
// Attribution is not required by the Pexels License, so this list is here for
// honesty rather than obligation: a visitor who wonders whether a picture is a
// real job of ours can see for himself which few are not. Every name below was
// read off the photo page on pexels.com on 9 September 2026, not copied from a
// filename. Adding a stock photograph to the site means adding a line here.
//
// The client's own job photographs are not in this list. Everything in
// src/assets/portfolio, before-after and progress was shot on his own jobs.

export type PhotoCredit = {
  /** File in src/assets/stock, without the folder. */
  file: string;
  /** Where it appears, in the words a visitor would use. */
  where: string;
  /** The photographer, as Pexels spells the name. */
  photographer: string;
  /** The photo page it came from. */
  url: string;
};

export const STOCK_CREDITS: PhotoCredit[] = [
  {
    file: 'hero-hardwood.jpg',
    where: 'Hardwood refinishing page, behind the heading',
    photographer: 'hi room',
    url: 'https://www.pexels.com/photo/17181935/',
  },
  {
    file: 'hero-lvp.jpg',
    where: 'LVP and vinyl plank page, behind the heading',
    photographer: 'Curtis Adams',
    url: 'https://www.pexels.com/photo/18041820/',
  },
  {
    file: 'hero-stairs.jpg',
    where: 'Stairs page, behind the heading',
    photographer: 'Tahir Osman',
    url: 'https://www.pexels.com/photo/15758635/',
  },
  {
    file: 'hero-laminate.jpg',
    where: 'Laminate page, behind the heading',
    photographer: 'Max Vakhtbovych',
    url: 'https://www.pexels.com/photo/6636262/',
  },
  {
    file: 'hero-carpet.jpg',
    where: 'Carpet page, behind the heading',
    photographer: 'Engin Akyurt',
    url: 'https://www.pexels.com/photo/29060193/',
  },
  {
    file: 'faq-samples.jpg',
    where: 'Questions page, the photograph beside the answers',
    photographer: 'cottonbro studio',
    url: 'https://www.pexels.com/photo/6583355/',
  },
  {
    file: 'contact-room.jpg',
    where: 'Contact page, the card that explains what happens next',
    photographer: 'Allyson SALNESS',
    url: 'https://www.pexels.com/photo/8288962/',
  },
];
