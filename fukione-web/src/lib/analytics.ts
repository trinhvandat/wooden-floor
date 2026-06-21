// GA4-ready analytics stub
// Pushes events to window.dataLayer (picked up by GTM/GA4) when present.
// Safe no-op in SSR, test, and pre-GTM environments.

export function trackConversion(event: string): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer?.push({ event });
}
