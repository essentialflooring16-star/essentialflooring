// Textele ecranului de continut si ale publicarii.
export const content = {
  en: {
    'content.title': 'Website text',
    'content.intro':
      'Change any text on the website. Pick a page, edit what you need, then save and publish.',
    'content.search': 'Search all texts',
    'content.no_results': 'Nothing matches that search.',
    'content.pick_city': 'Pick a city page',
    'content.see_on_site': 'See on the site',
    'content.reset': 'Back to original',
    'content.reset_done': 'The original text is back. Publish to put it on the site.',
    'content.edited': 'Changed',
    'content.too_long': '{n} characters. Over {max} it may not fit the layout.',
    'content.save': 'Save',
    'content.saving': 'Saving...',
    'content.saved': 'Saved. Now press Publish to put it on the site.',
    'content.save_failed': 'Could not save. Check your connection and try again.',
    'content.unsaved': 'You have 1 unsaved change. | You have {n} unsaved changes.',
    'content.unpublished': 'Your changes are saved but not on the website yet.',
    'content.publish': 'Publish to the site',
    'content.publishing': 'Publishing...',
    'content.item_n': 'Item {n}',
    'content.item_title': 'Title',
    'content.item_text': 'Text',
    'content.question': 'Question',
    'content.answer': 'Answer',
    'content.add_item': 'Add item',
    'content.remove': 'Remove',
    'content.move_up': 'Move up',
    'content.move_down': 'Move down',
    'content.broken_json':
      'This list could not be read, so the raw text is shown. Fix it or press Back to original.',

    'publish.ok': 'The website is rebuilding. Your changes go live in one to two minutes.',
    'publish.no-hook':
      'Saved, but no publish link is set up yet, so the site cannot rebuild itself. Ask your developer to add it in Settings.',
    'publish.bad-hook':
      'Saved, but the publish link does not look right, so it was not used. Ask your developer to check it in Settings.',
    'publish.failed': 'Saved, but the publish request failed. Try again in a minute.',
  },
  ro: {
    'content.title': 'Textele site-ului',
    'content.intro':
      'Schimbă orice text de pe site. Alege pagina, modifică ce vrei, apoi salvează și publică.',
    'content.search': 'Caută în toate textele',
    'content.no_results': 'Nu am găsit nimic pentru căutarea asta.',
    'content.pick_city': 'Alege pagina de oraș',
    'content.see_on_site': 'Vezi pe site',
    'content.reset': 'Înapoi la textul inițial',
    'content.reset_done': 'Textul inițial a revenit. Publică pentru a-l pune pe site.',
    'content.edited': 'Modificat',
    'content.too_long': '{n} caractere. Peste {max} s-ar putea să nu încapă frumos.',
    'content.save': 'Salvează',
    'content.saving': 'Se salvează...',
    'content.saved': 'Salvat. Acum apasă Publică pentru a pune textul pe site.',
    'content.save_failed': 'Nu am putut salva. Verifică internetul și încearcă din nou.',
    'content.unsaved':
      'Ai o modificare nesalvată. | Ai {n} modificări nesalvate. | Ai {n} de modificări nesalvate.',
    'content.unpublished': 'Modificările sunt salvate, dar încă nu sunt pe site.',
    'content.publish': 'Publică pe site',
    'content.publishing': 'Se publică...',
    'content.item_n': 'Elementul {n}',
    'content.item_title': 'Titlu',
    'content.item_text': 'Text',
    'content.question': 'Întrebare',
    'content.answer': 'Răspuns',
    'content.add_item': 'Adaugă element',
    'content.remove': 'Șterge',
    'content.move_up': 'Mută mai sus',
    'content.move_down': 'Mută mai jos',
    'content.broken_json':
      'Lista asta nu a putut fi citită, așa că vezi textul brut. Repar-o sau apasă Înapoi la textul inițial.',

    'publish.ok': 'Site-ul se reconstruiește. Modificările apar în unu-două minute.',
    'publish.no-hook':
      'Salvat, dar nu e configurat niciun link de publicare, deci site-ul nu se poate reconstrui singur. Cere-i dezvoltatorului să îl adauge în Setări.',
    'publish.bad-hook':
      'Salvat, dar linkul de publicare nu arată corect, așa că nu a fost folosit. Cere-i dezvoltatorului să îl verifice în Setări.',
    'publish.failed': 'Salvat, dar cererea de publicare nu a reușit. Încearcă din nou peste un minut.',
  },
} as const;
