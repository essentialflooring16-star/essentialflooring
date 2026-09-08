// The four legal pages, in one place.
//
// They share a layout, a set of prose classes and a footer nav, so a fifth one
// is a single entry here plus a page file, and none of them can drift into a
// different typography from the rest.

export const LEGAL_PAGES = [
  { href: '/privacy-policy/', label: 'Privacy Policy' },
  { href: '/cookie-policy/', label: 'Cookie Policy' },
  { href: '/terms-of-use/', label: 'Terms of Use' },
  { href: '/cancellation-and-refunds/', label: 'Cancellations & Refunds' },
] as const;

/**
 * Utility class strings for legal prose. These live here rather than in a
 * stylesheet because the CSS is inlined into all 41 pages: a rule that only
 * four pages use would be carried by every one of them.
 */
export const PROSE = {
  h2: 'font-display font-semibold text-2xl text-fg pt-4',
  h3: 'font-display font-semibold text-xl text-fg pt-1',
  ul: 'list-disc pl-5 space-y-2 marker:text-accent-display',
  ol: 'list-decimal pl-5 space-y-2 marker:text-accent-display',
  a: 'text-accent-on-light font-medium underline underline-offset-4 decoration-1 hover:text-fg transition-colors',
  strong: 'font-semibold text-fg',
  note: 'rounded-card border border-hairline bg-surface-sunken px-5 py-4 text-[15px] leading-relaxed text-fg-body',
  th: 'text-left align-top font-semibold text-fg px-3 py-2.5 border-b border-hairline',
  td: 'align-top px-3 py-2.5 border-b border-hairline text-fg-body',
} as const;
