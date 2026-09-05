// Textele din inbox-ul de cereri (src/components/admin/LeadsInbox.tsx).
//
// "Lead" nu se traduce ca atare: proprietarul nu vorbeste limbajul de vanzari,
// pentru el fiecare rand de aici e o cerere de oferta venita prin formular.
export const leads = {
  en: {
    'leads.loading': 'Loading leads...',
    'leads.title': 'Estimate requests',
    'leads.subtitle':
      'Everything sent through the website contact form lands here (and in your email).',
    'leads.empty_state':
      'No requests yet. When a visitor fills the form, it appears here instantly.',
    'leads.status_new': 'New',
    'leads.status_contacted': 'Contacted',
    'leads.status_closed': 'Closed',
    'leads.call_action': 'Call {phone}',
    'leads.email_action': 'Email {email}',
  },
  ro: {
    'leads.loading': 'Se încarcă cererile...',
    'leads.title': 'Cereri de ofertă',
    'leads.subtitle':
      'Tot ce se trimite prin formularul de contact de pe site ajunge aici (și pe emailul tău).',
    'leads.empty_state':
      'Nu ai nicio cerere încă. Când un vizitator completează formularul, cererea apare aici pe loc.',
    'leads.status_new': 'Nouă',
    'leads.status_contacted': 'Contactată',
    'leads.status_closed': 'Închisă',
    'leads.call_action': 'Sună la {phone}',
    'leads.email_action': 'Scrie la {email}',
  },
} as const;
