// Verificarea in doi pasi: ecranul de pornire din cabinet si cel care cere
// codul la intrare.
//
// Textul e scris pentru cineva care nu a mai folosit un cod de acest fel. De
// aceea nu apar cuvintele "autentificare cu doi factori", "TOTP" sau "MFA":
// clientul citeste ce trebuie sa faca, nu cum se numeste.
export const security = {
  en: {
    'security.nav': 'Security',
    'security.title': 'Two step sign in',
    'security.subtitle': 'A code from your phone, on top of your password',
    'security.intro':
      'With two step sign in turned on, knowing the password is no longer enough to get in. Every sign in also asks for a six digit code that changes every 30 seconds and exists only on your phone.',
    'security.status_on': 'On',
    'security.status_off': 'Off',
    'security.on_body': 'Your account asks for the code from the app every time you sign in.',
    'security.off_body':
      'Right now the password alone opens the cabinet. Turning this on takes about two minutes.',
    'security.start': 'Turn it on',
    'security.starting': 'Getting ready...',
    'security.step_app':
      '1. Install Google Authenticator on your phone, from the App Store or Google Play.',
    'security.step_scan':
      '2. Open the app, press the plus button, choose Scan a QR code and point the phone at the square below.',
    'security.step_code': '3. Type the six digit code the app shows you.',
    'security.manual_label': 'If the camera will not scan, type this key into the app instead:',
    'security.code_label': 'Code from the app',
    'security.confirm': 'Confirm the code',
    'security.confirming': 'Checking...',
    'security.cancel': 'Cancel',
    'security.enrolled': 'Done. From now on we also ask for the code from your phone.',
    'security.bad_code': 'That code was not accepted. Try the next one, they change every 30 seconds.',
    'security.failed': 'Something went wrong. Try again in a few seconds.',
    'security.turn_off': 'Turn it off',
    'security.turning_off': 'Turning off...',
    'security.turn_off_ask':
      'Turn it off? After that the password on its own will be enough to open the cabinet.',
    'security.turn_off_yes': 'Yes, turn it off',
    'security.turned_off': 'Two step sign in is off.',
    'security.back': 'Back to the cabinet',
    'security.new_phone':
      'Changing phones? Set the new phone up first, and only then turn off the old one.',
    'security.challenge_title': 'Code from your phone',
    'security.challenge_body':
      'Open Google Authenticator and type the six digit code shown for Essential Flooring.',
    'security.challenge_submit': 'Sign in',
    'security.challenge_checking': 'Checking...',
    'security.challenge_signout': 'Sign in as someone else',
  },
  ro: {
    'security.nav': 'Siguranță',
    'security.title': 'Verificare în doi pași',
    'security.subtitle': 'Un cod din telefon, pe lângă parolă',
    'security.intro':
      'Cu verificarea în doi pași pornită, cine află parola tot nu poate intra. La fiecare intrare cerem și un cod de șase cifre care se schimbă la 30 de secunde și există doar pe telefonul tău.',
    'security.status_on': 'Pornită',
    'security.status_off': 'Oprită',
    'security.on_body': 'Contul îți cere codul din aplicație la fiecare intrare.',
    'security.off_body':
      'Acum se intră numai cu parola. Pornirea durează cam două minute.',
    'security.start': 'Pornește verificarea',
    'security.starting': 'Se pregătește...',
    'security.step_app':
      '1. Instalează pe telefon aplicația Google Authenticator, din App Store sau Google Play.',
    'security.step_scan':
      '2. Deschide aplicația, apasă pe plus, alege Scanează un cod QR și îndreaptă telefonul spre pătratul de mai jos.',
    'security.step_code': '3. Scrie codul de șase cifre pe care îl arată aplicația.',
    'security.manual_label': 'Dacă nu merge scanarea, scrie în aplicație cheia asta:',
    'security.code_label': 'Codul din aplicație',
    'security.confirm': 'Confirmă codul',
    'security.confirming': 'Se verifică...',
    'security.cancel': 'Renunță',
    'security.enrolled': 'Gata. De acum îți cerem la intrare și codul din telefon.',
    'security.bad_code':
      'Codul nu a fost acceptat. Încearcă următorul, codurile se schimbă la 30 de secunde.',
    'security.failed': 'Ceva nu a mers. Mai încearcă peste câteva secunde.',
    'security.turn_off': 'Oprește verificarea',
    'security.turning_off': 'Se oprește...',
    'security.turn_off_ask':
      'Oprim verificarea? După asta, pentru a intra în cabinet va fi de ajuns parola.',
    'security.turn_off_yes': 'Da, oprește',
    'security.turned_off': 'Verificarea în doi pași este oprită.',
    'security.back': 'Înapoi în cabinet',
    'security.new_phone':
      'Schimbi telefonul? Pornește verificarea pe telefonul nou întâi, și abia apoi oprește-o pe cel vechi.',
    'security.challenge_title': 'Codul din telefon',
    'security.challenge_body':
      'Deschide Google Authenticator și scrie codul de șase cifre afișat pentru Essential Flooring.',
    'security.challenge_submit': 'Intră în cont',
    'security.challenge_checking': 'Se verifică...',
    'security.challenge_signout': 'Intră cu alt cont',
  },
} as const;
