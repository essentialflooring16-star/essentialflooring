// Textele din panoul de trafic (src/components/admin/Dashboard.tsx).
//
// Cifrele de aici sunt singurele numere pe care proprietarul le citeste zilnic,
// deci etichetele raman scurte si fara jargon de analiza web: "vizualizari" si
// "vizite", nu "sesiuni" si "impresii". Intervalele si tooltipul graficului au
// numarul in interpolare, ca sa iasa corect forma cu "de" (30 de zile).
export const dashboard = {
  en: {
    'dashboard.range_days': '{n} days',
    'dashboard.loading': 'Loading traffic data...',
    'dashboard.load_error':
      'Could not load the traffic data. Refresh the page, and if it keeps failing contact your developer.',
    'dashboard.error_banner': 'Could not load analytics: {message}',
    'dashboard.title': 'Website traffic',
    'dashboard.stat_page_views': 'Pages opened',
    'dashboard.stat_page_views_note': 'every page a visitor opened',
    'dashboard.stat_unique_visits': 'Visitors',
    'dashboard.stat_unique_visits_note': 'people, counted once each',
    'dashboard.chart_title': 'Daily page views',
    'dashboard.chart_aria_label': 'Daily page views chart',
    'dashboard.chart_bar_tooltip': '{day}: {n} views',
    'dashboard.top_pages_title': 'Most visited pages',
    'dashboard.top_pages_empty': 'No visits yet.',
    'dashboard.sources_title': 'Traffic sources',
    'dashboard.sources_empty': 'Direct visits only so far.',
    'dashboard.devices_title': 'Devices',
    'dashboard.devices_empty': 'No data yet.',
  },
  ro: {
    'dashboard.range_days': '{n} zi | {n} zile | {n} de zile',
    'dashboard.loading': 'Se încarcă datele de trafic...',
    'dashboard.load_error':
      'Nu am putut încărca datele de trafic. Reîncarcă pagina, iar dacă tot nu merge, ia legătura cu dezvoltatorul tău.',
    'dashboard.error_banner': 'Nu am putut încărca statisticile: {message}',
    'dashboard.title': 'Traficul site-ului',
    'dashboard.stat_page_views': 'Pagini deschise',
    'dashboard.stat_page_views_note': 'fiecare pagină deschisă de un vizitator',
    'dashboard.stat_unique_visits': 'Vizitatori',
    'dashboard.stat_unique_visits_note': 'oameni, numărați o singură dată',
    'dashboard.chart_title': 'Vizualizări pe zi',
    'dashboard.chart_aria_label': 'Grafic cu vizualizările pe zi',
    'dashboard.chart_bar_tooltip':
      '{day}: {n} vizualizare | {day}: {n} vizualizări | {day}: {n} de vizualizări',
    'dashboard.top_pages_title': 'Cele mai vizitate pagini',
    'dashboard.top_pages_empty': 'Nu ai nicio vizită încă.',
    'dashboard.sources_title': 'Surse de trafic',
    'dashboard.sources_empty': 'Deocamdată ai numai vizite directe.',
    'dashboard.devices_title': 'Dispozitive',
    'dashboard.devices_empty': 'Nu ai date încă.',
  },
} as const;
