/**
 * Iconitele cabinetului, desenate pentru clientul asta, nu luate dintr-o
 * librarie: o dependenta noua ar fi adus zeci de kilobiti in bundle-ul de
 * admin pentru sase glife. Acelasi registru ca Icon.astro de pe site: grila
 * 28x28, contur de 1.8 in culoarea textului, deci aceeasi iconita merge si pe
 * verde inchis, si pe hartie, fara nicio varianta separata.
 */
interface Props {
  name: Name;
  /** px, implicit 22 */
  size?: number;
  className?: string;
}

export type Name =
  | 'traffic'
  | 'leads'
  | 'portfolio'
  | 'reviews'
  | 'blog'
  | 'seo'
  | 'menu'
  | 'close'
  | 'external'
  | 'signout';

const glyphs: Record<Name, string> = {
  // trei coloane care cresc: traficul
  traffic: `
    <path d="M4.5 23.5h19" />
    <path d="M8.5 23.5v-6M14 23.5v-11M19.5 23.5v-8" />`,
  // plic deschis: cererile care intra
  leads: `
    <path d="M4.5 10.5v11a1.5 1.5 0 0 0 1.5 1.5h16a1.5 1.5 0 0 0 1.5-1.5v-11" />
    <path d="M4.5 10.5 14 4.5l9.5 6" />
    <path d="m4.5 10.5 8.6 5.4a1.7 1.7 0 0 0 1.8 0l8.6-5.4" />`,
  // doua rame suprapuse: portofoliul de poze
  portfolio: `
    <rect x="8.5" y="4.5" width="15" height="12" rx="1.5" />
    <path d="M19.5 19.5h-14a1.5 1.5 0 0 1-1.5-1.5v-11" />
    <path d="m11 13.5 3-3.2 3 2.4 2.2-2 2.3 2.8" />`,
  // stea conturata: recenziile
  reviews: `
    <path d="m14 4.8 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />`,
  // foaie cu randuri: blogul
  blog: `
    <path d="M6.5 4.5h11l5 5v14a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 5 23.5v-17A1.5 1.5 0 0 1 6.5 4.5z" />
    <path d="M17.5 4.5v5.5h5" />
    <path d="M9 14.5h9M9 18.5h9M9 10.5h4" />`,
  // lupa peste o pagina: starea SEO
  seo: `
    <circle cx="12.5" cy="12.5" r="6.5" />
    <path d="m17.4 17.4 5.1 5.1" />
    <path d="M9.5 12.5h6M12.5 9.5v6" />`,
  menu: `<path d="M4.5 8.5h19M4.5 14h19M4.5 19.5h19" />`,
  close: `<path d="m6.5 6.5 15 15M21.5 6.5l-15 15" />`,
  external: `
    <path d="M11.5 5.5h-5A1.5 1.5 0 0 0 5 7v14.5A1.5 1.5 0 0 0 6.5 23H21a1.5 1.5 0 0 0 1.5-1.5v-5" />
    <path d="M15.5 5.5h7v7M22.5 5.5 12 16" />`,
  signout: `
    <path d="M11 23.5H6.5A1.5 1.5 0 0 1 5 22V6a1.5 1.5 0 0 1 1.5-1.5H11" />
    <path d="M17.5 8.5 23 14l-5.5 5.5M23 14H10.5" />`,
};

export default function AdminIcon({ name, size = 22, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: glyphs[name] }}
    />
  );
}
