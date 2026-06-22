import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Route folders are English (app/products, app/quote, ...) for a clean codebase,
  // while the PUBLIC URLs stay Vietnamese for local SEO. These rewrites map the
  // Vietnamese URL a visitor sees onto the English route that renders it.
  // Internal <Link href> values use the Vietnamese (public) URLs.
  async rewrites() {
    return [
      { source: "/san-pham", destination: "/products" },
      { source: "/san-pham/:slug", destination: "/products/:slug" },
      { source: "/bao-gia", destination: "/quote" },
      { source: "/dat-lich-khao-sat", destination: "/book-survey" },
      { source: "/cam-on", destination: "/thank-you" },
    ];
  },
};

export default nextConfig;
