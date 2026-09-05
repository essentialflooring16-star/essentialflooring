// Textele din administrarea blogului (src/components/admin/BlogManager.tsx).
//
// "Deploy hook" nu ramane in romana ca termen tehnic: pentru proprietar e doar
// linkul prin care modificarile ajung pe site. La fel, "post" e articol, iar
// butonul care creeaza ceva spune ce adauga, nu ca e nou.
export const blog = {
  en: {
    'blog.heading': 'Blog articles',
    'blog.intro':
      'Articles help the website rank on Google. Photos plus a few honest paragraphs about a recent project work great.',
    'blog.new_action': 'New article',
    'blog.empty_state':
      'No articles yet. Write the first one, a before and after story is a great start.',
    'blog.post_meta': '{date} · /blog/{slug}',
    'blog.status_published': 'Published',
    'blog.status_draft': 'Draft',
    'blog.edit_action': 'Edit',
    'blog.delete_action': 'Delete',
    'blog.delete_confirm': 'Delete the article "{title}"?',
    'blog.form_title_edit': 'Edit article',
    'blog.form_title_new': 'New article',
    'blog.back_to_list': 'Back to list',
    'blog.field_title': 'Title *',
    'blog.field_excerpt': 'Short summary (shown on the blog page and Google)',
    'blog.field_cover': 'Cover photo',
    'blog.field_content': 'Article text *',
    'blog.content_hint':
      'Plain text works fine. For a subheading start a line with ## and for a list start lines with -',
    'blog.field_published': 'Published (visible on the website)',
    'blog.submit_saving': 'Saving...',
    'blog.submit_update': 'Save changes',
    'blog.submit_create': 'Publish article',
    'blog.cover_too_large': 'Cover photo is over 8 MB.',
    'blog.save_error': 'Could not save the post. Check your connection and try again.',
    'blog.saved_no_hook':
      'Saved. Ask your developer to set the deploy hook so changes go live automatically.',
    'blog.saved_hook_invalid':
      'Saved, but the stored deploy hook does not look like a Vercel hook, so it was not called.',
    'blog.saved_rebuilding': 'Saved. The website is rebuilding now, changes go live in 1-2 minutes.',
    'blog.saved_rebuild_failed':
      'Saved, but the rebuild request failed. Try again or contact your developer.',
  },
  ro: {
    'blog.heading': 'Articole de blog',
    'blog.intro':
      'Articolele ajută site-ul să urce în Google. Câteva fotografii și două-trei paragrafe sincere despre o lucrare recentă funcționează foarte bine.',
    'blog.new_action': 'Adaugă articol',
    'blog.empty_state':
      'Nu ai niciun articol încă. Scrie-l pe primul, o poveste cu înainte și după e un început foarte bun.',
    'blog.post_meta': '{date} · /blog/{slug}',
    'blog.status_published': 'Publicat',
    'blog.status_draft': 'Ciornă',
    'blog.edit_action': 'Modifică',
    'blog.delete_action': 'Șterge',
    'blog.delete_confirm': 'Ștergi articolul „{title}”?',
    'blog.form_title_edit': 'Modifică articolul',
    'blog.form_title_new': 'Articol nou',
    'blog.back_to_list': 'Înapoi la listă',
    'blog.field_title': 'Titlu *',
    'blog.field_excerpt': 'Rezumat scurt (apare pe pagina de blog și în Google)',
    'blog.field_cover': 'Fotografie de copertă',
    'blog.field_content': 'Textul articolului *',
    'blog.content_hint':
      'Textul simplu e suficient. Pentru un subtitlu începe rândul cu ##, iar pentru o listă începe rândurile cu -',
    'blog.field_published': 'Publicat (vizibil pe site)',
    'blog.submit_saving': 'Se salvează...',
    'blog.submit_update': 'Salvează modificările',
    'blog.submit_create': 'Publică articolul',
    'blog.cover_too_large': 'Fotografia de copertă are peste 8 MB.',
    'blog.save_error': 'Articolul nu a putut fi salvat. Verifică conexiunea și încearcă din nou.',
    'blog.saved_no_hook':
      'Salvat. Cere-i dezvoltatorului să configureze linkul de publicare, ca modificările să ajungă singure pe site.',
    'blog.saved_hook_invalid':
      'Salvat, dar linkul de publicare din setări nu arată a link Vercel, așa că nu a fost folosit.',
    'blog.saved_rebuilding':
      'Salvat. Site-ul se reconstruiește acum, modificările sunt vizibile în 1-2 minute.',
    'blog.saved_rebuild_failed':
      'Salvat, dar cererea de reconstruire nu a reușit. Încearcă din nou sau anunță-l pe dezvoltator.',
  },
} as const;
