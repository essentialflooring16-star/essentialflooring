// Textele panoului de viteza (src/components/admin/VitalsPanel.tsx).
//
// Cheile cu {n} trec prin selectorul de plural din admin-i18n: formele romanesti
// se scriu separate prin " | " in ordinea unu, putine, multe. Ca sa aleaga forma
// corecta, consumatorul trebuie sa trimita n ca numar, nu ca text deja formatat.
//
// vitals.sample_count primeste in {range} eticheta perioadei deja tradusa
// (vitals.range_option), pentru ca romana cere "30 de zile" si "7 zile", iar un
// singur string nu poate acorda doua numere odata.
export const vitals = {
  en: {
    'vitals.title': 'Site speed',
    'vitals.intro':
      'These numbers come from real visits to the live site, not from a test run on one machine. Every number here is the p75, meaning 3 out of 4 page loads were at least this fast. Google grades on the p75 rather than the average, because averages hide slow phones.',
    'vitals.range_group_label': 'Time range',
    'vitals.range_option': '{n} days',

    'vitals.unconfigured_title': 'Not connected',
    'vitals.unconfigured_body':
      'The site is not connected to its database right now, so there is nothing to show here. Nothing is lost, the measurements appear again once the connection is restored.',
    'vitals.load_error':
      'Could not load the speed measurements. Refresh the page, and if it keeps failing contact your developer.',
    'vitals.loading': 'Loading speed measurements...',
    'vitals.empty_title': 'No measurements yet',
    'vitals.empty_body':
      'This page fills in on its own once the site is live and real people browse it. Each visit quietly reports how fast the page loaded on that phone or computer. Give it a few days of traffic, then come back and check which pages are slow.',

    'vitals.sample_capped':
      'Showing the most recent {n} measurements. Older ones inside this period are not counted.',
    'vitals.sample_count': '{n} measurements from the last {range}.',
    'vitals.sample_caveat':
      'Some browsers report fewer of these numbers than others, so this is a large sample of visits rather than every single one.',
    'vitals.metrics_note':
      'Largest paint, layout shift and tap response are the three Google grades. First paint and server response are supporting numbers that help explain the others.',

    'vitals.metric_lcp_title': 'Largest paint',
    'vitals.metric_lcp_blurb': 'How long before the main photo or headline is on screen.',
    'vitals.metric_cls_title': 'Layout shift',
    'vitals.metric_cls_blurb': 'How much the page jumps around while it finishes loading.',
    'vitals.metric_inp_title': 'Tap response',
    'vitals.metric_inp_blurb': 'How quickly the page reacts after a visitor taps or clicks.',
    'vitals.metric_fcp_title': 'First paint',
    'vitals.metric_fcp_blurb': 'How long before anything at all appears instead of a blank screen.',
    'vitals.metric_ttfb_title': 'Server response',
    'vitals.metric_ttfb_blurb': 'How fast the server starts sending the page.',

    'vitals.rating_good': 'Good',
    'vitals.rating_needs_improvement': 'Needs work',
    'vitals.rating_poor': 'Poor',
    'vitals.rating_passing': 'Passing',
    'vitals.rating_share': '{label} {n}%',

    'vitals.no_value': 'Not measured yet in this period.',
    'vitals.p75_note': 'p75 across {n} page loads. Good is {threshold} or less.',

    'vitals.device_mobile': 'Phones',
    'vitals.device_desktop': 'Desktop and tablet',
    'vitals.device_empty': 'No data',
    'vitals.device_samples': '({n})',

    'vitals.unit_seconds': '{n} s',
    'vitals.unit_milliseconds': '{n} ms',

    'vitals.slowest_title': 'Slowest pages',
    'vitals.slowest_note':
      'Ranked by how long the main content takes to appear. Fix the top of this list first, and trust the rows with the most page loads behind them.',
    'vitals.slowest_empty': 'No page load times recorded yet.',
    'vitals.col_page': 'Page',
    'vitals.col_page_loads': 'Page loads measured',
    'vitals.col_main_content': 'Main content visible',
  },
  ro: {
    'vitals.title': 'Viteza site-ului',
    'vitals.intro':
      'Cifrele de aici vin din vizite reale pe site, nu dintr-un test rulat pe un singur calculator. Fiecare număr este p75, adică 3 din 4 încărcări de pagină au fost cel puțin la fel de rapide. Google dă nota după p75, nu după medie, pentru că media ascunde telefoanele lente.',
    'vitals.range_group_label': 'Perioada',
    'vitals.range_option': '{n} zi | {n} zile | {n} de zile',

    'vitals.unconfigured_title': 'Nu este conectat',
    'vitals.unconfigured_body':
      'Site-ul nu este conectat acum la baza lui de date, așa că nu avem ce afișa aici. Nu s-a pierdut nimic, măsurătorile apar din nou imediat ce legătura este refăcută.',
    'vitals.load_error':
      'Nu am putut încărca măsurătorile de viteză. Reîncarcă pagina, iar dacă tot nu merge, ia legătura cu dezvoltatorul tău.',
    'vitals.loading': 'Se încarcă măsurătorile de viteză...',
    'vitals.empty_title': 'Nicio măsurătoare încă',
    'vitals.empty_body':
      'Pagina se completează singură după ce site-ul este online și îl vizitează oameni reali. Fiecare vizită trimite discret cât de repede s-a încărcat pagina pe telefonul sau calculatorul acela. Lasă să treacă câteva zile de trafic, apoi întoarce-te și vezi care pagini sunt lente.',

    'vitals.sample_capped':
      'Se afișează cele mai recente {n} de măsurători. Cele mai vechi din această perioadă nu intră la socoteală.',
    'vitals.sample_count':
      '{n} măsurătoare din ultimele {range}. | {n} măsurători din ultimele {range}. | {n} de măsurători din ultimele {range}.',
    'vitals.sample_caveat':
      'Unele browsere raportează mai puține astfel de valori decât altele, deci ce vezi aici este un eșantion mare din vizite, nu chiar fiecare vizită în parte.',
    'vitals.metrics_note':
      'Afișarea conținutului, saltul paginii și răspunsul la atingere sunt cele trei note date de Google. Prima afișare și răspunsul serverului sunt cifre de sprijin, care ajută la înțelegerea celorlalte.',

    'vitals.metric_lcp_title': 'Afișarea conținutului',
    'vitals.metric_lcp_blurb': 'Cât durează până când poza principală sau titlul ajung pe ecran.',
    'vitals.metric_cls_title': 'Saltul paginii',
    'vitals.metric_cls_blurb': 'Cât de mult sare pagina în timp ce termină de încărcat.',
    'vitals.metric_inp_title': 'Răspuns la atingere',
    'vitals.metric_inp_blurb':
      'Cât de repede reacționează pagina după ce un vizitator atinge ecranul sau dă clic.',
    'vitals.metric_fcp_title': 'Prima afișare',
    'vitals.metric_fcp_blurb': 'Cât durează până apare ceva pe ecran, în loc de o pagină goală.',
    'vitals.metric_ttfb_title': 'Răspunsul serverului',
    'vitals.metric_ttfb_blurb': 'Cât de repede începe serverul să trimită pagina.',

    'vitals.rating_good': 'Bine',
    'vitals.rating_needs_improvement': 'De îmbunătățit',
    'vitals.rating_poor': 'Slab',
    'vitals.rating_passing': 'Trece',
    'vitals.rating_share': '{label} {n}%',

    'vitals.no_value': 'Încă nu s-a măsurat nimic în această perioadă.',
    'vitals.p75_note':
      'p75 din {n} încărcare de pagină. Bine înseamnă {threshold} sau mai puțin. | p75 din {n} încărcări de pagină. Bine înseamnă {threshold} sau mai puțin. | p75 din {n} de încărcări de pagină. Bine înseamnă {threshold} sau mai puțin.',

    'vitals.device_mobile': 'Telefoane',
    'vitals.device_desktop': 'Calculatoare și tablete',
    'vitals.device_empty': 'Fără date',
    'vitals.device_samples': '({n})',

    'vitals.unit_seconds': '{n} s',
    'vitals.unit_milliseconds': '{n} ms',

    'vitals.slowest_title': 'Cele mai lente pagini',
    'vitals.slowest_note':
      'Ordonate după cât durează până apare conținutul principal. Rezolvă întâi ce este sus în listă și ai încredere în rândurile care au în spate cele mai multe încărcări de pagină.',
    'vitals.slowest_empty': 'Nu s-a înregistrat încă niciun timp de încărcare.',
    'vitals.col_page': 'Pagina',
    'vitals.col_page_loads': 'Încărcări măsurate',
    'vitals.col_main_content': 'Conținutul principal vizibil',
  },
} as const;
