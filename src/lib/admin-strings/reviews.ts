// Textele din managerul de recenzii (src/components/admin/ReviewsManager.tsx).
//
// O recenzie e scrisa de un client si e citata pe site, deci in romana "review"
// ramane "recenzie", iar "author" e autorul ei, nu un "utilizator".
//
// Doua capcane de acord: recenzia e substantiv feminin, deci starea unei
// recenzii e "Publicata"/"Ascunsa", nu forma din glosar la masculin. Butonul de
// stare isi lipeste numele accesibil din doua bucati ("Publicata" + " recenzia
// de la Ana"), asa ca acordul trebuie sa tina peste ambele chei.
//
// Etichetele sursei se traduc linistit: in baza de date se scrie codul
// ("google", "direct"), eticheta traieste doar in lista derulanta din cabinet.
export const reviews = {
  en: {
    'reviews.heading': 'Customer reviews',
    'reviews.intro':
      'Copy each review from your Google profile exactly as the customer wrote it. Published reviews appear on the home page and on the reviews page, together with the star rating.',
    'reviews.publish_pending': 'You have review changes that are not on the website yet.',
    'reviews.publish_idle':
      'Reviews are saved here first. Publishing rebuilds the website with them.',
    'reviews.publish_busy': 'Sending...',
    'reviews.publish_button': 'Publish the website now',
    'reviews.saved_note': 'Saved here. Press "Publish the website now" above to put it online.',
    'reviews.notice_rebuilding':
      'The website is rebuilding now. The reviews are online in a minute or two, then refresh the site to see them.',
    'reviews.error_load':
      'Could not load the reviews. Refresh the page, and if it keeps failing contact your developer.',
    'reviews.error_hook_missing':
      'The publishing link is not set yet, so the website cannot rebuild. Add it on the Settings page, or ask your developer.',
    'reviews.error_hook_invalid':
      'The stored publishing link is not a Vercel deploy hook, so it was not used. Contact your developer.',
    'reviews.error_publish':
      'The publish request did not go through. Check your internet connection and try again.',
    'reviews.error_missing_fields': 'Add the customer name and the review text before saving.',
    'reviews.error_save':
      'Could not save this review. Check your internet connection and try again.',
    'reviews.error_toggle': 'Could not change that review. Try again in a moment.',
    'reviews.error_delete': 'Could not delete that review. Try again in a moment.',
    'reviews.notice_shown': 'Review from {author} will go back on the website. {note}',
    'reviews.notice_hidden': 'Review from {author} will come off the website. {note}',
    'reviews.notice_deleted': 'Review from {author} was deleted. {note}',
    'reviews.not_connected':
      'Reviews cannot load because the admin is not connected to the database yet.',
    'reviews.stat_published': 'Published',
    'reviews.stat_published_hint': 'Live after the next publish',
    'reviews.stat_average': 'Average rating',
    'reviews.stat_average_none': 'None',
    'reviews.stat_average_hint': 'Shown on the home page and reviews page',
    'reviews.stat_hidden': 'Hidden',
    'reviews.stat_hidden_hint': 'Saved here, not on the website',
    'reviews.form_heading': 'Add a review',
    'reviews.author_label': 'Customer name',
    'reviews.city_label': 'City (optional)',
    'reviews.city_placeholder': 'Roseville',
    'reviews.rating_label': 'Star rating',
    // Se citeste numai la cititorul de ecran, dupa cifra: "5 stele".
    'reviews.rating_star_unit': 'star | stars',
    'reviews.text_label': 'Review text',
    'reviews.text_counter': '{n} of {max} characters',
    'reviews.date_label': 'Review date (optional)',
    'reviews.source_label': 'Where it was left',
    'reviews.source_google': 'Google',
    'reviews.source_yelp': 'Yelp',
    'reviews.source_facebook': 'Facebook',
    'reviews.source_direct': 'Sent to us directly',
    'reviews.submit_busy': 'Saving...',
    'reviews.submit': 'Save review',
    'reviews.list_heading_capped': 'Reviews (newest {n})',
    'reviews.list_heading': 'All reviews',
    'reviews.list_heading_count': 'All reviews ({n})',
    'reviews.list_error':
      'The reviews could not be read just now, so this list is incomplete. Refresh the page to try again.',
    'reviews.loading': 'Loading reviews...',
    'reviews.empty_state':
      'No reviews yet. Until you add some, the reviews page invites visitors to read your Google profile instead.',
    'reviews.status_published': 'Published',
    'reviews.status_hidden': 'Hidden',
    // Spatiul de la inceput e intentionat: textul se lipeste dupa eticheta
    // vizibila a butonului si formeaza numele lui accesibil.
    'reviews.sr_review_from': ' review from {author}',
    'reviews.action_delete': 'Delete',
    'reviews.action_delete_confirm': 'Delete for good',
    'reviews.action_delete_cancel': 'Keep',
    'reviews.stars_label': '{n} out of 5 stars',
  },
  ro: {
    'reviews.heading': 'Recenzii de la clienți',
    'reviews.intro':
      'Copiază fiecare recenzie din profilul tău Google exact cum a scris-o clientul. Recenziile publicate apar pe pagina principală și pe pagina de recenzii, împreună cu nota în stele.',
    'reviews.publish_pending': 'Ai modificări la recenzii care încă nu sunt pe site.',
    'reviews.publish_idle':
      'Recenziile se salvează întâi aici. Publicarea reconstruiește site-ul cu ele.',
    'reviews.publish_busy': 'Se trimite...',
    'reviews.publish_button': 'Publică site-ul acum',
    'reviews.saved_note': 'Salvat aici. Apasă „Publică site-ul acum” mai sus ca să ajungă online.',
    'reviews.notice_rebuilding':
      'Site-ul se reconstruiește acum. Recenziile sunt online într-un minut sau două, apoi reîncarcă site-ul ca să le vezi.',
    'reviews.error_load':
      'Nu am putut încărca recenziile. Reîncarcă pagina, iar dacă tot nu merge, contactează dezvoltatorul.',
    'reviews.error_hook_missing':
      'Linkul de publicare lipsește, așa că site-ul nu se poate reconstrui. Adaugă-l în pagina Setări sau cere-i dezvoltatorului.',
    'reviews.error_hook_invalid':
      'Linkul de publicare salvat nu duce către Vercel, așa că nu a fost folosit. Contactează dezvoltatorul.',
    'reviews.error_publish':
      'Cererea de publicare nu a ajuns. Verifică conexiunea la internet și încearcă din nou.',
    'reviews.error_missing_fields':
      'Adaugă numele clientului și textul recenziei înainte să salvezi.',
    'reviews.error_save':
      'Nu am putut salva această recenzie. Verifică conexiunea la internet și încearcă din nou.',
    'reviews.error_toggle': 'Nu am putut schimba această recenzie. Încearcă din nou peste un moment.',
    'reviews.error_delete': 'Nu am putut șterge această recenzie. Încearcă din nou peste un moment.',
    'reviews.notice_shown': 'Recenzia de la {author} revine pe site. {note}',
    'reviews.notice_hidden': 'Recenzia de la {author} iese de pe site. {note}',
    'reviews.notice_deleted': 'Recenzia de la {author} a fost ștearsă. {note}',
    'reviews.not_connected':
      'Recenziile nu se pot încărca pentru că nu ai conectat încă cabinetul la baza de date.',
    'reviews.stat_published': 'Publicate',
    'reviews.stat_published_hint': 'Ajung pe site la următoarea publicare',
    'reviews.stat_average': 'Nota medie',
    'reviews.stat_average_none': 'Nicio notă',
    'reviews.stat_average_hint': 'Se vede pe pagina principală și pe pagina de recenzii',
    'reviews.stat_hidden': 'Ascunse',
    'reviews.stat_hidden_hint': 'Salvate aici, nu pe site',
    'reviews.form_heading': 'Adaugă o recenzie',
    'reviews.author_label': 'Numele clientului',
    'reviews.city_label': 'Oraș (opțional)',
    'reviews.city_placeholder': 'Roseville',
    'reviews.rating_label': 'Nota în stele',
    'reviews.rating_star_unit': 'stea | stele | de stele',
    'reviews.text_label': 'Textul recenziei',
    'reviews.text_counter':
      '{n} caracter din {max} | {n} caractere din {max} | {n} de caractere din {max}',
    'reviews.date_label': 'Data recenziei (opțional)',
    'reviews.source_label': 'Unde a fost lăsată',
    'reviews.source_google': 'Google',
    'reviews.source_yelp': 'Yelp',
    'reviews.source_facebook': 'Facebook',
    'reviews.source_direct': 'Trimisă direct către noi',
    'reviews.submit_busy': 'Se salvează...',
    'reviews.submit': 'Salvează recenzia',
    'reviews.list_heading_capped': 'Recenzii (cele mai noi {n})',
    'reviews.list_heading': 'Toate recenziile',
    'reviews.list_heading_count': 'Toate recenziile ({n})',
    'reviews.list_error':
      'Recenziile nu au putut fi citite acum, așa că lista nu este completă. Reîncarcă pagina ca să încerci din nou.',
    'reviews.loading': 'Se încarcă recenziile...',
    'reviews.empty_state':
      'Nu ai nicio recenzie încă. Până adaugi câteva, pagina de recenzii îi invită pe vizitatori să citească profilul tău Google.',
    'reviews.status_published': 'Publicată',
    'reviews.status_hidden': 'Ascunsă',
    'reviews.sr_review_from': ' recenzia de la {author}',
    'reviews.action_delete': 'Șterge',
    'reviews.action_delete_confirm': 'Șterge definitiv',
    'reviews.action_delete_cancel': 'Păstrează',
    'reviews.stars_label': '{n} din 5 stele',
  },
} as const;
