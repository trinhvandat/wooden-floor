import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Next 16 defaults to Turbopack; declaring it silences the webpack/turbopack
  // co-config warning that withPayload's webpack injection would otherwise emit.
  turbopack: {},
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
      { source: "/du-an", destination: "/projects" },
    ];
  },
};

// withPayload wires Payload's admin/API into the Next.js build.
export default withPayload(nextConfig);
