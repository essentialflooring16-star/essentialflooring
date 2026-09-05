// Textele din managerul de portofoliu (src/components/admin/PortfolioManager.tsx).
//
// "Portfolio item" e o lucrare, nu un "element": proprietarul incarca aici poze
// de la santierele lui, nu inregistrari dintr-o baza de date.
//
// Etichetele de categorie se traduc fara grija: in baza de date se scrie codul
// ("lvp-vinyl"), eticheta traieste doar in lista derulanta din cabinet.
export const portfolio = {
  en: {
    'portfolio.heading': 'Add a project photo',
    'portfolio.intro':
      'Photos you publish here appear instantly in the website portfolio, no developer needed.',
    'portfolio.photo_label': 'Photo (JPG/PNG, max 8 MB)',
    'portfolio.category_label': 'Category',
    'portfolio.category_hardwood': 'Hardwood Refinishing',
    'portfolio.category_lvp': 'LVP & Vinyl Plank',
    'portfolio.category_laminate': 'Laminate',
    'portfolio.category_carpet': 'Carpet',
    'portfolio.category_stairs': 'Stairs',
    'portfolio.category_other': 'Other',
    'portfolio.caption_label':
      'Caption (shown in the gallery, e.g. "LVP installation in Roseville")',
    'portfolio.submit_busy': 'Uploading...',
    'portfolio.submit': 'Publish photo',
    'portfolio.error_no_file': 'Choose a photo first.',
    'portfolio.error_too_large': 'Photo is too large. Keep it under 8 MB.',
    'portfolio.upload_success': 'Photo published. It is already visible on the website portfolio.',
    'portfolio.upload_error':
      'Upload failed. Check the file is a JPG, PNG or WebP under 8MB, then try again.',
    // Textul alternativ ajunge pe site-ul public, care ramane integral in
    // engleza, deci forma romaneasca e identica in mod deliberat.
    'portfolio.default_alt': 'Flooring project by Essential Flooring',
    'portfolio.delete_confirm': 'Delete this photo from the website portfolio?',
    'portfolio.list_heading': 'Uploaded photos ({n})',
    'portfolio.empty_state':
      'Nothing uploaded yet. The website still shows the built-in project gallery.',
    'portfolio.status_published': 'Published',
    'portfolio.status_hidden': 'Hidden',
    'portfolio.action_delete': 'Delete',
  },
  ro: {
    'portfolio.heading': 'Adaugă o poză de lucrare',
    'portfolio.intro':
      'Pozele pe care le publici aici apar imediat în portofoliul de pe site, fără să ai nevoie de programator.',
    'portfolio.photo_label': 'Poză (JPG/PNG, maximum 8 MB)',
    'portfolio.category_label': 'Categorie',
    'portfolio.category_hardwood': 'Recondiționare parchet masiv',
    'portfolio.category_lvp': 'LVP și plăci de vinil',
    'portfolio.category_laminate': 'Laminat',
    'portfolio.category_carpet': 'Mochetă',
    'portfolio.category_stairs': 'Scări',
    'portfolio.category_other': 'Altele',
    'portfolio.caption_label':
      'Descriere (apare în galerie, de exemplu "Montaj LVP în Roseville")',
    'portfolio.submit_busy': 'Se încarcă...',
    'portfolio.submit': 'Publică poza',
    'portfolio.error_no_file': 'Alege întâi o poză.',
    'portfolio.error_too_large': 'Poza este prea mare. Alege una sub 8 MB.',
    'portfolio.upload_success': 'Poza este publicată. Se vede deja în portofoliul de pe site.',
    'portfolio.upload_error':
      'Încărcarea nu a reușit. Verifică dacă fișierul este JPG, PNG sau WebP și are sub 8 MB, apoi încearcă din nou.',
    'portfolio.default_alt': 'Flooring project by Essential Flooring',
    'portfolio.delete_confirm': 'Ștergi această poză din portofoliul de pe site?',
    'portfolio.list_heading': 'Poze încărcate ({n})',
    'portfolio.empty_state':
      'Nu ai încărcat nicio poză încă. Site-ul arată în continuare galeria de lucrări prestabilită.',
    'portfolio.status_published': 'Publicat',
    'portfolio.status_hidden': 'Ascuns',
    'portfolio.action_delete': 'Șterge',
  },
} as const;
