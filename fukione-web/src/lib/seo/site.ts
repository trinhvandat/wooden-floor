// Canonical site origin — single source for metadataBase, sitemap, canonical
// links, and JSON-LD @id/url. Set NEXT_PUBLIC_SITE_URL in the deploy env.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// Shared OpenGraph base — spread into every page's openGraph so the site OG
// image, siteName, type, and locale are never lost when a page sets its own og.
export const BASE_OPEN_GRAPH = {
  type: "website" as const,
  siteName: "FUKIONE",
  locale: "vi_VN",
  images: ["/og.png"],
};
