// First-party, cookie-free page view tracking into Supabase.
// No-op when Supabase env vars are not configured or when DNT is on.
const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

function deviceClass(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'desktop';
}

export function trackPageView(): void {
  try {
    if (!url || !key) return;
    if (navigator.doNotTrack === '1') return;
    if (location.pathname.startsWith('/admin')) return;

    // Session id lives only for the tab session, resets on browser close.
    let sid = sessionStorage.getItem('ef_sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('ef_sid', sid);
    }

    const payload = {
      path: location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : null,
      device: deviceClass(),
      session_id: sid,
    };

    const body = JSON.stringify(payload);
    const endpoint = `${url}/rest/v1/page_views`;
    // sendBeacon can't set headers, so use fetch with keepalive.
    fetch(endpoint, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body,
    }).catch(() => {});
  } catch {
    // analytics must never break the site
  }
}
