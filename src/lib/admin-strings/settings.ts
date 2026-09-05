// Textele din panoul Setari: publicarea site-ului, starea lui si datele firmei.
//
// Cheile care contin un numar au forme de plural separate prin " | ", in ordinea
// unu, putine, multe. Engleza foloseste doar primele doua forme, romana pe toate
// trei, pentru ca la numerele mari cere prepozitia "de" (21 de recenzii).
//
// Cheile de sanatate ('settings.health_*') sunt textele randurilor din lista de
// verificari, cate una pentru fiecare rezultat posibil al aceleiasi verificari.
export const settings = {
  en: {
    // Antet de pagina
    'settings.title': 'Settings',
    'settings.subtitle': 'Publishing, the health of the website, and the business details it shows.',
    'settings.no_database':
      'The admin cabinet is not connected to its database, so there is nothing to show here yet. Your developer needs to finish the setup.',

    // Sectiunea de publicare
    'settings.publishing_heading': 'Publishing',
    'settings.publishing_intro':
      'The website is rebuilt from a private link so new blog posts and photos appear for visitors. Your developer creates that link once in Vercel.',
    'settings.loading': 'Loading settings...',
    'settings.load_failed':
      'The publishing link could not be read, so it cannot be used or changed right now. Refresh the page to try again.',
    'settings.hook_label': 'Publishing link',
    'settings.hook_reveal': 'Show',
    'settings.hook_hide': 'Hide',
    'settings.hook_missing':
      'Not set yet. Until it is, everything you save stays in the cabinet and goes live only at the next developer deploy.',
    'settings.publish_action': 'Publish the website now',
    'settings.publish_pending': 'Sending...',
    'settings.hook_edit_cancel': 'Cancel',
    'settings.hook_replace': 'Replace the link',
    'settings.hook_add': 'Add the link',
    'settings.hook_input_label': 'Paste the deploy hook from Vercel',
    'settings.hook_input_help':
      'It has to start with {prefix}. Treat it like a password and do not share it.',
    'settings.hook_save': 'Save link',
    'settings.hook_saving': 'Saving...',

    // Mesajele care apar dupa salvare sau dupa publicare
    'settings.hook_invalid':
      'That does not look like a Vercel deploy hook. The full address has to start with {prefix} and carry the hook id after it.',
    'settings.hook_saved': 'Publishing link saved. You can now publish the website from this page.',
    'settings.hook_save_failed':
      'The publishing link could not be saved. Try again, and if it keeps failing contact your developer.',
    'settings.publish_hook_invalid':
      'The stored publishing link is not a Vercel deploy hook, so it was not called. Contact your developer.',
    'settings.publish_sent':
      'The rebuild request was sent. Vercel does not report back to this page, so give it a minute or two, then refresh the website to check your changes are there.',
    'settings.publish_failed':
      'The rebuild request did not go through. Check your internet connection and try again.',

    // Starea site-ului
    'settings.health_heading': 'Website health',
    'settings.health_intro': 'A quick check of the parts that run behind the website.',
    'settings.health_checking': 'Checking...',
    'settings.health_mark_good': 'Working',
    'settings.health_mark_warn': 'Needs attention',
    'settings.health_mark_bad': 'Not working',
    'settings.health_database_down':
      'The admin cabinet cannot reach its database right now, so nothing on this page can be checked. Sign out, sign back in, and if it keeps failing contact your developer.',
    'settings.health_database_ok': 'The admin cabinet is connected to its database.',
    'settings.health_hook_ok':
      'Publishing is wired up, so changes you make here can be pushed live from this page.',
    'settings.health_hook_missing':
      'No publishing link is set, so blog and portfolio changes wait for the next developer deploy.',
    'settings.health_reviews_failed':
      'The customer reviews could not be checked. Contact your developer if this stays here.',
    'settings.health_reviews_count':
      '{n} customer review is published on the website. | {n} customer reviews are published on the website.',
    'settings.health_reviews_empty': 'No customer reviews are published yet.',
    'settings.health_posts_failed':
      'The blog posts could not be checked. Contact your developer if this stays here.',
    'settings.health_posts_count':
      '{n} blog post is published on the website. | {n} blog posts are published on the website.',
    'settings.health_posts_empty': 'No blog post is published yet, so the blog page shows nothing.',
    'settings.health_analytics_failed':
      'Visitor tracking could not be checked. Contact your developer if this stays here.',
    'settings.health_analytics_empty':
      'No page views have been recorded yet, so there is nothing to report in the Traffic tab.',
    'settings.health_analytics_ok':
      'Visitor tracking is running. The last page view was recorded on {stamp}.',
    'settings.health_analytics_stale':
      'No page views for {n} days. The last one was recorded on {stamp}, so either the website is quiet or tracking stopped.',

    // Datele firmei, doar de citit
    'settings.business_heading': 'Business details',
    'settings.business_intro':
      'These are built into every page of the website, so changing them is a developer job. Send your developer the new details and they go out with the next update.',
    'settings.business_phone': 'Phone',
    'settings.business_email': 'Email',
    'settings.business_license': 'License',
    'settings.business_hours': 'Hours',
  },
  ro: {
    // Antet de pagina
    'settings.title': 'Setări',
    'settings.subtitle': 'Publicarea, starea site-ului și datele firmei pe care le arată.',
    'settings.no_database':
      'Cabinetul de administrare nu e conectat la baza lui de date, așa că aici nu e încă nimic de arătat. Dezvoltatorul tău trebuie să termine configurarea.',

    // Sectiunea de publicare
    'settings.publishing_heading': 'Publicare',
    'settings.publishing_intro':
      'Site-ul se reconstruiește printr-un link privat, ca articolele noi și fotografiile să ajungă la vizitatori. Dezvoltatorul tău creează linkul o singură dată, în Vercel.',
    'settings.loading': 'Se încarcă setările...',
    'settings.load_failed':
      'Linkul de publicare nu a putut fi citit, așa că acum nu poate fi nici folosit, nici schimbat. Reîncarcă pagina ca să încerci din nou.',
    'settings.hook_label': 'Link de publicare',
    'settings.hook_reveal': 'Arată',
    'settings.hook_hide': 'Ascunde',
    'settings.hook_missing':
      'Nu e pus încă. Până atunci, tot ce salvezi rămâne în cabinet și ajunge pe site abia la următoarea publicare făcută de dezvoltator.',
    'settings.publish_action': 'Publică site-ul acum',
    'settings.publish_pending': 'Se trimite...',
    'settings.hook_edit_cancel': 'Renunță',
    'settings.hook_replace': 'Înlocuiește linkul',
    'settings.hook_add': 'Adaugă linkul',
    'settings.hook_input_label': 'Lipește linkul de publicare din Vercel',
    'settings.hook_input_help':
      'Trebuie să înceapă cu {prefix}. Ține-l ca pe o parolă și nu îl da nimănui.',
    'settings.hook_save': 'Salvează linkul',
    'settings.hook_saving': 'Se salvează...',

    // Mesajele care apar dupa salvare sau dupa publicare
    'settings.hook_invalid':
      'Asta nu pare un link de publicare de la Vercel. Adresa completă trebuie să înceapă cu {prefix} și să aibă id-ul linkului după el.',
    'settings.hook_saved':
      'Linkul de publicare a fost salvat. De acum poți publica site-ul din pagina asta.',
    'settings.hook_save_failed':
      'Linkul de publicare nu a putut fi salvat. Mai încearcă o dată, iar dacă tot nu merge, ia legătura cu dezvoltatorul tău.',
    'settings.publish_hook_invalid':
      'Linkul salvat nu este un link de publicare de la Vercel, așa că nu a fost folosit. Ia legătura cu dezvoltatorul tău.',
    'settings.publish_sent':
      'Site-ul a fost trimis la reconstruire. Vercel nu răspunde înapoi în pagina asta, așa că lasă un minut, două, apoi reîncarcă site-ul ca să vezi dacă modificările tale au ajuns acolo.',
    'settings.publish_failed':
      'Site-ul nu a putut fi trimis la reconstruire. Verifică-ți conexiunea la internet și mai încearcă o dată.',

    // Starea site-ului
    'settings.health_heading': 'Starea site-ului',
    'settings.health_intro': 'O verificare rapidă a pieselor care lucrează în spatele site-ului.',
    'settings.health_checking': 'Se verifică...',
    'settings.health_mark_good': 'Funcționează',
    'settings.health_mark_warn': 'Cere atenție',
    'settings.health_mark_bad': 'Nu funcționează',
    'settings.health_database_down':
      'Cabinetul de administrare nu ajunge acum la baza lui de date, așa că nimic din pagina asta nu poate fi verificat. Ieși din cont și intră din nou, iar dacă tot nu merge, ia legătura cu dezvoltatorul tău.',
    'settings.health_database_ok': 'Cabinetul de administrare e conectat la baza lui de date.',
    'settings.health_hook_ok':
      'Publicarea e pregătită, deci modificările pe care le faci aici pot fi trimise pe site din pagina asta.',
    'settings.health_hook_missing':
      'Nu e pus niciun link de publicare, așa că modificările din Blog și Portofoliu așteaptă următoarea publicare făcută de dezvoltator.',
    'settings.health_reviews_failed':
      'Recenziile clienților nu au putut fi verificate. Dacă mesajul rămâne aici, ia legătura cu dezvoltatorul tău.',
    'settings.health_reviews_count':
      '{n} recenzie de la clienți este publicată pe site. | {n} recenzii de la clienți sunt publicate pe site. | {n} de recenzii de la clienți sunt publicate pe site.',
    'settings.health_reviews_empty': 'Nu e publicată încă nicio recenzie de la clienți.',
    'settings.health_posts_failed':
      'Articolele de blog nu au putut fi verificate. Dacă mesajul rămâne aici, ia legătura cu dezvoltatorul tău.',
    'settings.health_posts_count':
      '{n} articol de blog este publicat pe site. | {n} articole de blog sunt publicate pe site. | {n} de articole de blog sunt publicate pe site.',
    'settings.health_posts_empty':
      'Nu e publicat încă niciun articol, așa că pagina de blog e goală.',
    'settings.health_analytics_failed':
      'Urmărirea vizitatorilor nu a putut fi verificată. Dacă mesajul rămâne aici, ia legătura cu dezvoltatorul tău.',
    'settings.health_analytics_empty':
      'Nu s-a înregistrat încă nicio vizualizare, așa că în fila Trafic nu apare nimic.',
    'settings.health_analytics_ok':
      'Urmărirea vizitatorilor merge. Ultima vizualizare a fost înregistrată pe {stamp}.',
    'settings.health_analytics_stale':
      'Nicio vizualizare de {n} zi. Ultima a fost înregistrată pe {stamp}, deci ori nu intră nimeni pe site, ori urmărirea s-a oprit. | Nicio vizualizare de {n} zile. Ultima a fost înregistrată pe {stamp}, deci ori nu intră nimeni pe site, ori urmărirea s-a oprit. | Nicio vizualizare de {n} de zile. Ultima a fost înregistrată pe {stamp}, deci ori nu intră nimeni pe site, ori urmărirea s-a oprit.',

    // Datele firmei, doar de citit
    'settings.business_heading': 'Datele firmei',
    'settings.business_intro':
      'Datele astea sunt scrise în fiecare pagină a site-ului, așa că schimbarea lor e treaba dezvoltatorului. Trimite-i datele noi și ele ajung pe site la următoarea actualizare.',
    'settings.business_phone': 'Telefon',
    'settings.business_email': 'Email',
    'settings.business_license': 'Licență',
    'settings.business_hours': 'Program',
  },
} as const;
