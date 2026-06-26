const GOOGLE_MAPS_HOSTS = new Set(["www.google.com", "google.com", "maps.google.com"]);

/**
 * Turn the operator's free-form `mapEmbed` (a Google "Embed a map" src URL, or the full
 * `<iframe …>` snippet) into a safe <iframe src>. Returns null for empty / non-Google /
 * non-https / malformed input so the page never renders an arbitrary third-party iframe.
 */
export function extractMapSrc(mapEmbed: string): string | null {
  const trimmed = mapEmbed.trim();
  if (!trimmed) return null;

  // Full `<iframe …src="…">` snippet → pull out the src; otherwise treat the whole value as the URL.
  let candidate = trimmed;
  if (trimmed.includes("<iframe")) {
    const m = trimmed.match(/src=["']([^"']+)["']/i);
    if (!m) return null;
    candidate = m[1];
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!GOOGLE_MAPS_HOSTS.has(url.hostname)) return null;
  const path = url.pathname;
  if (path !== "/maps" && !path.startsWith("/maps/")) return null;
  return url.toString();
}
