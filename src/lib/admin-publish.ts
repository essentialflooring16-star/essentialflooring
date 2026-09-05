// Publicarea pe site.
//
// Site-ul e static: o modificare salvata in Supabase ajunge pe paginile publice
// abia dupa ce Vercel reconstruieste site-ul. Reconstructia se cere apasand un
// deploy hook, adica un URL secret salvat in app_settings.
//
// Logica asta era copiata in patru panouri, fiecare cu propriul text de eroare.
// Aici e o singura data, ca toate panourile sa raspunda la fel cand ceva pica.
import { supabase } from './supabase';

const VERCEL_HOOK_PREFIX = 'https://api.vercel.com/v1/integrations/deploy/';

export type PublishResult =
  /** Build-ul a fost cerut. Site-ul se actualizeaza in unu-doua minute. */
  | { ok: true }
  /** Nu s-a configurat niciun link de publicare: modificarile stau salvate. */
  | { ok: false; reason: 'no-hook' }
  /** Randul din baza de date nu arata a hook Vercel: nu a fost apelat. */
  | { ok: false; reason: 'bad-hook' }
  /** Reteaua a picat sau Vercel a refuzat. */
  | { ok: false; reason: 'failed' };

export async function publishSite(): Promise<PublishResult> {
  const { data } = await supabase!
    .from('app_settings')
    .select('value')
    .eq('key', 'deploy_hook_url')
    .maybeSingle();

  const hook = data?.value?.trim();
  if (!hook) return { ok: false, reason: 'no-hook' };

  // Valoarea e o credentiala si browserul clientului face POST la ea. Baza de
  // date are deja o constrangere pe host, dar un URL citit dintr-un tabel nu se
  // apeleaza niciodata fara sa fie verificat aici: un rand gresit ar transforma
  // browserul adminului in client pentru orice host ar numi randul acela.
  if (!hook.startsWith(VERCEL_HOOK_PREFIX)) return { ok: false, reason: 'bad-hook' };

  try {
    await fetch(hook, { method: 'POST', mode: 'no-cors' });
  } catch {
    return { ok: false, reason: 'failed' };
  }

  // Momentul publicarii, ca panourile sa poata spune "ai modificari care inca nu
  // sunt pe site". mode: 'no-cors' nu lasa sa se citeasca raspunsul, deci nu
  // stim daca Vercel a acceptat; stampila inseamna "s-a cerut", nu "s-a livrat".
  // E suficient: daca build-ul pica, se vede in Vercel, nu aici.
  try {
    await supabase!
      .from('app_settings')
      .upsert({ key: 'last_publish_at', value: new Date().toISOString() }, { onConflict: 'key' });
  } catch {
    // Stampila e o comoditate. Daca nu se scrie, publicarea tot s-a cerut.
  }

  return { ok: true };
}

export async function lastPublishedAt(): Promise<Date | null> {
  const { data } = await supabase!
    .from('app_settings')
    .select('value')
    .eq('key', 'last_publish_at')
    .maybeSingle();
  if (!data?.value) return null;
  const d = new Date(data.value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Cheia de traducere a mesajului potrivit rezultatului. */
export function publishMessageKey(result: PublishResult): string {
  if (result.ok) return 'publish.ok';
  return `publish.${result.reason}`;
}
