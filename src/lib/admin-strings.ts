// Dictionarul cabinetului, adunat din fragmentele scrise pe panouri.
//
// Fiecare panou isi tine cheile in fisierul lui, sub propriul prefix, ca doua
// panouri sa nu se poata calca pe chei si ca traducerea unuia sa nu ceara
// citirea celorlalte.
import { app } from './admin-strings/app';
import { content } from './admin-strings/content';
import { dashboard } from './admin-strings/dashboard';
import { leads } from './admin-strings/leads';
import { portfolio } from './admin-strings/portfolio';
import { reviews } from './admin-strings/reviews';
import { blog } from './admin-strings/blog';
import { vitals } from './admin-strings/vitals';
import { seo } from './admin-strings/seo';
import { settings } from './admin-strings/settings';

const PARTS = [app, content, dashboard, leads, portfolio, reviews, blog, vitals, seo, settings];

export const STRINGS = {
  en: Object.assign({}, ...PARTS.map((p) => p.en)) as Record<string, string>,
  ro: Object.assign({}, ...PARTS.map((p) => p.ro)) as Record<string, string>,
};
