// Textele din SeoHealth.tsx.
//
// Multe mesaje erau construite din bucati in componenta (numar + substantiv la
// plural + restul frazei). Aici fiecare mesaj e o singura cheie cu interpolare,
// iar pluralul se rezolva din formele separate prin " | ": unu, putine, multe.
// Engleza foloseste doar primele doua forme, romana toate trei.
//
// Frazele de numarare (seo.count_*, seo.page_words, seo.page_internal_links)
// exista separat pentru ca fraza gazda contine doua sau trei numere diferite,
// iar mecanismul de plural lucreaza cu un singur {n} pe cheie.

export const seo = {
  en: {
    /* Antet */
    'seo.title': 'SEO health',
    'seo.intro':
      'This downloads every page listed in the sitemap and checks the HTML a search engine reads first: titles, descriptions, headings, alt text, canonical tags and structured data. It looks at the pages themselves, not at your position in search results.',
    'seo.run': 'Run the scan',
    'seo.run_again': 'Run the scan again',
    'seo.running': 'Scanning...',
    'seo.cancel': 'Cancel',

    /* Ultima scanare si frazele de numarare */
    'seo.last_scan': 'Last scan {date}: {pages}, {errors}, {warnings}.',
    'seo.count_pages': '{n} page | {n} pages',
    'seo.count_pages_checked': '{n} page checked | {n} pages checked',
    'seo.count_errors': '{n} error | {n} errors',
    'seo.count_warnings': '{n} warning | {n} warnings',

    /* Progres */
    'seo.progress_sitemap': 'Reading the sitemap...',
    'seo.progress_page': 'Checking page {n} of {total}...',
    'seo.progress_label': 'Scan progress',

    /* Ecranul gol */
    'seo.empty_state': 'No scan has run in this session yet.',
    'seo.empty_state_hint':
      'Press Run the scan. It loads every page in the sitemap, so give it a moment.',

    /* Erori si note */
    'seo.error_sitemap':
      'The sitemap could not be read, so there was nothing to scan. Check that /sitemap-index.xml opens in a browser tab, then try again.',
    'seo.error_failed':
      'The scan could not finish. Check that the website is online, then run it again.',
    'seo.note_truncated':
      'The sitemap lists more than {max} pages, so only the first {max} were checked. Everything below covers that part of the site, not all of it.',
    'seo.note_stopped_empty':
      'Scan stopped before any page was checked. Run it again when you are ready.',
    'seo.note_stopped_early':
      'Scan stopped early. These are the {n} of {total} pages that were checked before you cancelled.',
    'seo.note_cancelled': 'Scan cancelled. Nothing was checked, so run it again when you are ready.',
    'seo.note_save_failed':
      'The results are on screen, but the scan date could not be saved for next time.',

    /* Anunturi pentru cititorul de ecran */
    'seo.announce_started': 'Scan started. Reading the sitemap.',
    'seo.announce_sitemap_failed': 'The scan could not start because the sitemap could not be read.',
    'seo.announce_stopped': 'Scan stopped. {n} of {total} pages were checked.',
    'seo.announce_finished': 'Scan finished. {pages}, {errors}, {warnings}.',
    'seo.announce_cancelled': 'Scan cancelled.',
    'seo.announce_failed': 'The scan could not finish.',

    /* Casetele de sumar */
    'seo.tile_pages': 'Pages scanned',
    'seo.tile_errors': 'Errors',
    'seo.tile_warnings': 'Warnings',
    'seo.tile_clean': 'Clean pages',

    /* Verdict */
    'seo.verdict_all_clean_single':
      'The page scanned passes every check on this list. Nothing to fix at the page level right now.',
    'seo.verdict_all_clean':
      'All {n} pages pass every check on this list. Nothing to fix at the page level right now.',
    'seo.verdict_warnings_only':
      'Nothing is broken. {n} page has smaller issues that are worth tidying up when there is time. | Nothing is broken. {n} pages have smaller issues that are worth tidying up when there is time.',
    'seo.verdict_needs_fixing':
      '{n} page needs a fix before it can rank properly | {n} pages need a fix before they can rank properly',
    'seo.verdict_needs_fixing_and_more':
      '{fixing}, and {n} more page could be stronger. | {fixing}, and {n} more pages could be stronger.',

    /* Sectiuni */
    'seo.section_errors_title': 'Fix these first',
    'seo.section_errors_blurb':
      'Each of these actively holds a page back in search. Start at the top.',
    'seo.section_warnings_title': 'Worth improving',
    'seo.section_warnings_blurb':
      'None of these stop a page from ranking, but each one is a small gain that is sitting there unused.',
    'seo.clean_list_title': 'Pages that passed every check ({n})',
    'seo.clean_list_empty': 'Every page has at least one thing to look at.',

    /* Cardul unei pagini */
    'seo.page_open': 'Open this page',
    'seo.page_open_label': 'Open {path} in a new tab',
    'seo.page_words': '{n} word of content | {n} words of content',
    'seo.page_internal_links': '{n} internal link | {n} internal links',
    'seo.page_stats': '{words}, {links}',

    /* Etichetele scurte de pe fiecare constatare */
    'seo.check_title': 'Title',
    'seo.check_meta_description': 'Meta description',
    'seo.check_heading': 'Heading',
    'seo.check_images': 'Images',
    'seo.check_canonical': 'Canonical',
    'seo.check_structured_data': 'Structured data',
    'seo.check_social_preview': 'Social preview',
    'seo.check_thin_content': 'Thin content',
    'seo.check_internal_links': 'Internal links',
    'seo.check_page': 'Page',
    'seo.check_duplicate_title': 'Duplicate title',
    'seo.check_duplicate_description': 'Duplicate description',

    /* Constatari */
    'seo.finding_title_missing':
      'This page has no title tag, so Google invents one from the page text. Add a title of 30 to 65 characters naming the service and the city.',
    'seo.finding_title_long':
      'Title is {n} characters, so Google will cut it off in the results. Shorten it to under {max}.',
    'seo.finding_title_short':
      'Title is only {n} characters and wastes the space Google gives you. Expand it to at least {min} by adding the service and the city.',
    'seo.finding_description_missing':
      'There is no meta description, so Google picks a sentence off the page itself to show under the link. Write one of 70 to 160 characters saying what you do and where.',
    'seo.finding_description_long':
      'Meta description is {n} characters, so the ending gets cut off in the results. Trim it to {max} or fewer.',
    'seo.finding_description_short':
      'Meta description is only {n} characters. Use the room you get, aim for {min} to {max}.',
    'seo.finding_h1_missing':
      'This page has no H1 heading, so search engines cannot tell what it is about. Give it one H1 naming the service and the area.',
    'seo.finding_h1_multiple':
      'This page has {n} H1 headings competing with each other. Keep one H1 and turn the others into H2s.',
    'seo.finding_heading_skip':
      'Heading levels skip a step: {jump}. Step down one level at a time so the page structure reads correctly.',
    'seo.heading_skip_item': 'H{from} straight to H{to} at "{text}"',
    'seo.finding_heading_skip_more':
      'There is {n} more skip like this further down. | There are {n} more skips like this further down.',
    'seo.finding_images_alt':
      '{n} image has no alt text ({examples}). Describe each one in a few words, or if it is pure decoration set alt="" together with aria-hidden="true". | {n} images have no alt text ({examples}). Describe each one in a few words, or if it is pure decoration set alt="" together with aria-hidden="true".',
    'seo.images_alt_more': ', and more',
    'seo.unnamed_image': 'unnamed image',
    'seo.finding_canonical_missing':
      'There is no canonical tag, so slightly different addresses for this page can split its ranking. Add one pointing at this page itself.',
    'seo.finding_canonical_invalid':
      "The canonical tag is not a valid address ({href}). Point it at this page's own full address.",
    'seo.finding_canonical_mismatch':
      'The canonical tag points at {canonical}, not at this page. Search engines usually follow that and index the other page instead. Point it at {path}.',
    'seo.finding_structured_data_missing':
      'No structured data on this page. Add a JSON-LD block (LocalBusiness, Service or FAQPage) so Google has the option of showing extra detail such as hours or answers next to the listing. Google decides whether to use it, but without the block it never can.',
    'seo.finding_structured_data_broken_single':
      'The structured data block on this page is not valid JSON, so Google throws it away and shows no rich result. Fix the JSON-LD markup on this page.',
    'seo.finding_structured_data_broken_many':
      '{n} of the {total} structured data blocks is not valid JSON, so Google throws it away and shows no rich result. Fix the JSON-LD markup on this page. | {n} of the {total} structured data blocks are not valid JSON, so Google throws them away and shows no rich result. Fix the JSON-LD markup on this page.',
    'seo.finding_og_missing':
      'The Open Graph {list} tag is missing, so this page looks bare when someone shares it on Facebook or by text message. Add og:title, og:description and og:image so the link shows a headline and a photo. | The Open Graph {list} tags are missing, so this page looks bare when someone shares it on Facebook or by text message. Add og:title, og:description and og:image so the link shows a headline and a photo.',
    'seo.og_title': 'title',
    'seo.og_description': 'description',
    'seo.og_image': 'image',
    'seo.finding_thin_content':
      'Only {n} words of real content. Thin pages rarely rank well. Aim for at least {min} words that answer the questions customers actually ask.',
    'seo.finding_internal_links_none':
      'No links from the content here to other pages of the site. Add at least {min} links to related services or nearby city pages so this page is not stranded.',
    'seo.finding_internal_links_few':
      'Only {n} link from the content here to other pages of the site. Add at least {min} links to related services or nearby city pages so this page is not stranded. | Only {n} links from the content here to other pages of the site. Add at least {min} links to related services or nearby city pages so this page is not stranded.',
    'seo.finding_page_status':
      'This page did not load during the scan (server answered {status}), so nothing on it could be checked. Open it yourself to see whether it is broken.',
    'seo.finding_page_unreachable':
      'This page could not be reached during the scan, so nothing on it could be checked. Open it yourself to see whether it is broken.',
    'seo.finding_duplicate_title':
      'This page has exactly the same title as {pages}. Duplicate titles make your own pages compete with each other. Give each page a title of its own, usually by naming its city or service.',
    'seo.finding_duplicate_description':
      'The meta description is identical to the one on {pages}. Rewrite each one so it describes that page in particular.',

    /* Legaturi intre bucati de enumerare */
    'seo.list_join': '{items} and {last}',
    'seo.others_more': '{shown} and {n} more',
  },
  ro: {
    /* Antet */
    'seo.title': 'Starea SEO',
    'seo.intro':
      'Descarcă fiecare pagină trecută în sitemap și verifică HTML-ul pe care un motor de căutare îl citește primul: titluri, descrieri, titluri de secțiune, texte alternative la imagini, etichete canonice și date structurate. Se uită la paginile în sine, nu la locul tău în rezultatele căutării.',
    'seo.run': 'Pornește scanarea',
    'seo.run_again': 'Scanează din nou',
    'seo.running': 'Se scanează...',
    'seo.cancel': 'Renunță',

    /* Ultima scanare si frazele de numarare */
    'seo.last_scan': 'Ultima scanare {date}: {pages}, {errors}, {warnings}.',
    'seo.count_pages': '{n} pagină | {n} pagini | {n} de pagini',
    'seo.count_pages_checked':
      '{n} pagină verificată | {n} pagini verificate | {n} de pagini verificate',
    'seo.count_errors': '{n} eroare | {n} erori | {n} de erori',
    'seo.count_warnings': '{n} avertisment | {n} avertismente | {n} de avertismente',

    /* Progres */
    'seo.progress_sitemap': 'Se citește sitemap-ul...',
    'seo.progress_page': 'Se verifică pagina {n} din {total}...',
    'seo.progress_label': 'Progresul scanării',

    /* Ecranul gol */
    'seo.empty_state': 'Nu ai pornit încă nicio scanare în această sesiune.',
    'seo.empty_state_hint':
      'Apasă Pornește scanarea. Încarcă fiecare pagină din sitemap, așa că durează puțin.',

    /* Erori si note */
    'seo.error_sitemap':
      'Sitemap-ul nu a putut fi citit, așa că nu a fost nimic de scanat. Verifică dacă /sitemap-index.xml se deschide într-o filă de browser, apoi încearcă din nou.',
    'seo.error_failed':
      'Scanarea nu s-a putut termina. Verifică dacă site-ul este online, apoi pornește-o din nou.',
    'seo.note_truncated':
      'Sitemap-ul are mai mult de {max} de pagini, așa că au fost verificate doar primele {max}. Tot ce urmează acoperă doar partea aceea din site, nu tot site-ul.',
    'seo.note_stopped_empty':
      'Scanarea s-a oprit înainte să fie verificată vreo pagină. Pornește-o din nou când ești gata.',
    'seo.note_stopped_early':
      'Scanarea s-a oprit mai devreme. Mai jos este singura pagină din {total} verificată înainte să renunți. | Scanarea s-a oprit mai devreme. Mai jos sunt cele {n} pagini din {total} verificate înainte să renunți. | Scanarea s-a oprit mai devreme. Mai jos sunt cele {n} de pagini din {total} verificate înainte să renunți.',
    'seo.note_cancelled':
      'Ai renunțat la scanare. Nu a fost verificat nimic, așa că pornește-o din nou când ești gata.',
    'seo.note_save_failed':
      'Rezultatele sunt pe ecran, dar data scanării nu a putut fi salvată pentru data viitoare.',

    /* Anunturi pentru cititorul de ecran */
    'seo.announce_started': 'Scanarea a pornit. Se citește sitemap-ul.',
    'seo.announce_sitemap_failed':
      'Scanarea nu a putut porni, pentru că sitemap-ul nu a putut fi citit.',
    'seo.announce_stopped':
      'Scanarea s-a oprit. A fost verificată {n} pagină din {total}. | Scanarea s-a oprit. Au fost verificate {n} pagini din {total}. | Scanarea s-a oprit. Au fost verificate {n} de pagini din {total}.',
    'seo.announce_finished': 'Scanarea s-a terminat. {pages}, {errors}, {warnings}.',
    'seo.announce_cancelled': 'Ai renunțat la scanare.',
    'seo.announce_failed': 'Scanarea nu s-a putut termina.',

    /* Casetele de sumar */
    'seo.tile_pages': 'Pagini scanate',
    'seo.tile_errors': 'Erori',
    'seo.tile_warnings': 'Avertismente',
    'seo.tile_clean': 'Pagini curate',

    /* Verdict */
    'seo.verdict_all_clean_single':
      'Pagina scanată trece fiecare verificare din această listă. Nu ai nimic de reparat la nivel de pagină acum.',
    'seo.verdict_all_clean':
      'Pagina trece fiecare verificare din această listă. Nu ai nimic de reparat la nivel de pagină acum. | Toate cele {n} pagini trec fiecare verificare din această listă. Nu ai nimic de reparat la nivel de pagină acum. | Toate cele {n} de pagini trec fiecare verificare din această listă. Nu ai nimic de reparat la nivel de pagină acum.',
    'seo.verdict_warnings_only':
      'Nimic nu este stricat. {n} pagină are probleme mai mici, bune de rezolvat când ai timp. | Nimic nu este stricat. {n} pagini au probleme mai mici, bune de rezolvat când ai timp. | Nimic nu este stricat. {n} de pagini au probleme mai mici, bune de rezolvat când ai timp.',
    'seo.verdict_needs_fixing':
      '{n} pagină are nevoie de o reparație ca să poată apărea cum trebuie în căutări | {n} pagini au nevoie de o reparație ca să poată apărea cum trebuie în căutări | {n} de pagini au nevoie de o reparație ca să poată apărea cum trebuie în căutări',
    'seo.verdict_needs_fixing_and_more':
      '{fixing}, iar încă {n} pagină ar putea sta mai bine. | {fixing}, iar alte {n} pagini ar putea sta mai bine. | {fixing}, iar alte {n} de pagini ar putea sta mai bine.',

    /* Sectiuni */
    'seo.section_errors_title': 'Repară-le pe acestea întâi',
    'seo.section_errors_blurb':
      'Fiecare dintre acestea chiar ține o pagină în urmă în căutări. Începe de sus.',
    'seo.section_warnings_title': 'Merită îmbunătățite',
    'seo.section_warnings_blurb':
      'Niciuna nu împiedică o pagină să apară în căutări, dar fiecare este un mic câștig pe care nu îl folosești.',
    'seo.clean_list_title': 'Pagini care au trecut fiecare verificare ({n})',
    'seo.clean_list_empty': 'Fiecare pagină are cel puțin un lucru la care să te uiți.',

    /* Cardul unei pagini */
    'seo.page_open': 'Deschide pagina',
    'seo.page_open_label': 'Deschide {path} într-o filă nouă',
    'seo.page_words':
      '{n} cuvânt de conținut | {n} cuvinte de conținut | {n} de cuvinte de conținut',
    'seo.page_internal_links':
      '{n} link intern | {n} linkuri interne | {n} de linkuri interne',
    'seo.page_stats': '{words}, {links}',

    /* Etichetele scurte de pe fiecare constatare */
    'seo.check_title': 'Titlu',
    'seo.check_meta_description': 'Meta descriere',
    'seo.check_heading': 'Titlu de secțiune',
    'seo.check_images': 'Imagini',
    'seo.check_canonical': 'Etichetă canonică',
    'seo.check_structured_data': 'Date structurate',
    'seo.check_social_preview': 'Aspect la partajare',
    'seo.check_thin_content': 'Conținut puțin',
    'seo.check_internal_links': 'Linkuri interne',
    'seo.check_page': 'Pagină',
    'seo.check_duplicate_title': 'Titlu duplicat',
    'seo.check_duplicate_description': 'Descriere duplicată',

    /* Constatari */
    'seo.finding_title_missing':
      'Pagina nu are etichetă de titlu, așa că Google inventează una din textul paginii. Adaugă un titlu de 30 până la 65 de caractere, în care să apară serviciul și orașul.',
    'seo.finding_title_long':
      'Titlul are {n} caracter, așa că Google îl taie în rezultate. Scurtează-l sub {max}. | Titlul are {n} caractere, așa că Google îl taie în rezultate. Scurtează-l sub {max}. | Titlul are {n} de caractere, așa că Google îl taie în rezultate. Scurtează-l sub {max}.',
    'seo.finding_title_short':
      'Titlul are doar {n} caracter și irosește spațiul pe care ți-l dă Google. Lungește-l la cel puțin {min}, adăugând serviciul și orașul. | Titlul are doar {n} caractere și irosește spațiul pe care ți-l dă Google. Lungește-l la cel puțin {min}, adăugând serviciul și orașul. | Titlul are doar {n} de caractere și irosește spațiul pe care ți-l dă Google. Lungește-l la cel puțin {min}, adăugând serviciul și orașul.',
    'seo.finding_description_missing':
      'Nu există meta descriere, așa că Google alege singur o frază din pagină și o arată sub link. Scrie una de 70 până la 160 de caractere, care spune ce faci și unde.',
    'seo.finding_description_long':
      'Meta descrierea are {n} caracter, așa că finalul se taie în rezultate. Scurteaz-o la {max} sau mai puțin. | Meta descrierea are {n} caractere, așa că finalul se taie în rezultate. Scurteaz-o la {max} sau mai puțin. | Meta descrierea are {n} de caractere, așa că finalul se taie în rezultate. Scurteaz-o la {max} sau mai puțin.',
    'seo.finding_description_short':
      'Meta descrierea are doar {n} caracter. Folosește spațiul pe care îl primești, țintește între {min} și {max}. | Meta descrierea are doar {n} caractere. Folosește spațiul pe care îl primești, țintește între {min} și {max}. | Meta descrierea are doar {n} de caractere. Folosește spațiul pe care îl primești, țintește între {min} și {max}.',
    'seo.finding_h1_missing':
      'Pagina nu are titlu H1, așa că motoarele de căutare nu își dau seama despre ce este. Pune-i un singur H1 în care să apară serviciul și zona.',
    'seo.finding_h1_multiple':
      'Pagina are {n} titlu H1 care se concurează între ele. Păstrează un singur H1 și transformă-le pe celelalte în H2. | Pagina are {n} titluri H1 care se concurează între ele. Păstrează un singur H1 și transformă-le pe celelalte în H2. | Pagina are {n} de titluri H1 care se concurează între ele. Păstrează un singur H1 și transformă-le pe celelalte în H2.',
    'seo.finding_heading_skip':
      'Nivelurile titlurilor sar peste o treaptă: {jump}. Coboară câte un nivel o dată, ca structura paginii să se citească corect.',
    'seo.heading_skip_item': 'de la H{from} direct la H{to}, la "{text}"',
    'seo.finding_heading_skip_more':
      'Mai jos mai este {n} salt ca acesta. | Mai jos mai sunt {n} salturi ca acesta. | Mai jos mai sunt {n} de salturi ca acesta.',
    'seo.finding_images_alt':
      '{n} imagine nu are text alternativ ({examples}). Descrie fiecare imagine în câteva cuvinte sau, dacă este pură decorație, pune alt="" împreună cu aria-hidden="true". | {n} imagini nu au text alternativ ({examples}). Descrie fiecare imagine în câteva cuvinte sau, dacă este pură decorație, pune alt="" împreună cu aria-hidden="true". | {n} de imagini nu au text alternativ ({examples}). Descrie fiecare imagine în câteva cuvinte sau, dacă este pură decorație, pune alt="" împreună cu aria-hidden="true".',
    'seo.images_alt_more': ', și altele',
    'seo.unnamed_image': 'imagine fără nume',
    'seo.finding_canonical_missing':
      'Nu există etichetă canonică, așa că adrese ușor diferite ale aceleiași pagini își pot împărți locul în căutări. Adaugă una care să arate chiar către pagina aceasta.',
    'seo.finding_canonical_invalid':
      'Eticheta canonică nu este o adresă validă ({href}). Îndreapt-o către adresa completă a acestei pagini.',
    'seo.finding_canonical_mismatch':
      'Eticheta canonică arată către {canonical}, nu către pagina aceasta. Motoarele de căutare o urmează de obicei și indexează cealaltă pagină. Îndreapt-o către {path}.',
    'seo.finding_structured_data_missing':
      'Pagina nu are date structurate. Adaugă un bloc JSON-LD (LocalBusiness, Service sau FAQPage), ca Google să aibă de unde arăta detalii în plus lângă rezultat, cum ar fi programul sau răspunsuri la întrebări. Google decide dacă le folosește, dar fără bloc nu are ce.',
    'seo.finding_structured_data_broken_single':
      'Blocul de date structurate de pe pagină nu este JSON valid, așa că Google îl aruncă și nu arată niciun rezultat îmbogățit. Repară marcajul JSON-LD de pe pagina aceasta.',
    'seo.finding_structured_data_broken_many':
      '{n} dintre cele {total} blocuri de date structurate nu este JSON valid, așa că Google îl aruncă și nu arată niciun rezultat îmbogățit. Repară marcajul JSON-LD de pe pagina aceasta. | {n} dintre cele {total} blocuri de date structurate nu sunt JSON valid, așa că Google le aruncă și nu arată niciun rezultat îmbogățit. Repară marcajul JSON-LD de pe pagina aceasta.',
    'seo.finding_og_missing':
      'Eticheta Open Graph {list} lipsește, așa că pagina arată goală când cineva o trimite mai departe pe Facebook sau prin mesaj. Adaugă og:title, og:description și og:image, ca linkul să arate un titlu și o poză. | Etichetele Open Graph {list} lipsesc, așa că pagina arată goală când cineva o trimite mai departe pe Facebook sau prin mesaj. Adaugă og:title, og:description și og:image, ca linkul să arate un titlu și o poză.',
    'seo.og_title': 'titlu',
    'seo.og_description': 'descriere',
    'seo.og_image': 'imagine',
    'seo.finding_thin_content':
      'Doar {n} cuvânt de conținut adevărat. Paginile sărace ajung rar sus în căutări. Țintește cel puțin {min} de cuvinte care răspund la întrebările pe care clienții chiar le pun. | Doar {n} cuvinte de conținut adevărat. Paginile sărace ajung rar sus în căutări. Țintește cel puțin {min} de cuvinte care răspund la întrebările pe care clienții chiar le pun. | Doar {n} de cuvinte de conținut adevărat. Paginile sărace ajung rar sus în căutări. Țintește cel puțin {min} de cuvinte care răspund la întrebările pe care clienții chiar le pun.',
    'seo.finding_internal_links_none':
      'Niciun link din conținutul de aici către alte pagini ale site-ului. Adaugă cel puțin {min} linkuri către servicii înrudite sau către pagini de orașe apropiate, ca pagina să nu rămână izolată.',
    'seo.finding_internal_links_few':
      'Doar {n} link din conținutul de aici către alte pagini ale site-ului. Adaugă cel puțin {min} linkuri către servicii înrudite sau către pagini de orașe apropiate, ca pagina să nu rămână izolată. | Doar {n} linkuri din conținutul de aici către alte pagini ale site-ului. Adaugă cel puțin {min} linkuri către servicii înrudite sau către pagini de orașe apropiate, ca pagina să nu rămână izolată.',
    'seo.finding_page_status':
      'Pagina nu s-a încărcat în timpul scanării (serverul a răspuns {status}), așa că nu a putut fi verificat nimic pe ea. Deschide-o tu, ca să vezi dacă este stricată.',
    'seo.finding_page_unreachable':
      'Pagina nu a putut fi accesată în timpul scanării, așa că nu a putut fi verificat nimic pe ea. Deschide-o tu, ca să vezi dacă este stricată.',
    'seo.finding_duplicate_title':
      'Pagina are exact același titlu ca {pages}. Titlurile duplicate îți pun paginile să concureze între ele. Dă-i fiecărei pagini titlul ei, de obicei numind orașul sau serviciul.',
    'seo.finding_duplicate_description':
      'Meta descrierea este identică cu cea de pe {pages}. Rescrie-le pe fiecare, ca să descrie exact pagina ei.',

    /* Legaturi intre bucati de enumerare */
    'seo.list_join': '{items} și {last}',
    'seo.others_more':
      '{shown} și încă o pagină | {shown} și încă {n} pagini | {shown} și încă {n} de pagini',
  },
} as const;
