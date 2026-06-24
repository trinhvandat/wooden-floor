---
name: nextjs-opengraph-no-deep-merge
description: Next.js App Router does NOT deep-merge nested metadata objects — a page's `openGraph` REPLACES the layout's wholesale; re-include inherited fields (e.g. og:image)
metadata: { type: convention, date: 2026-06-24 }
---
In the Next.js App Router Metadata API, when a page exports its own `openGraph` (or `twitter`,
`robots`, …), it **replaces** the parent layout's object wholesale — fields are NOT deep-merged.
Caught in M4-A: the product detail page set `openGraph: { title, description }`, which silently
dropped the root layout's `images: ["/og.png"]`, `siteName`, `type`, `locale` **on product pages
only** — exactly the most shareable pages rendered with no `og:image`.

**Why it matters:** the loss is silent (tsc/tests stay green) and page-specific, so it's easy to
miss without checking the rendered metadata per route.

**How to apply:** keep the shared defaults in one place and SPREAD them when a page overrides.
M4-A uses `BASE_OPEN_GRAPH` in `src/lib/seo/site.ts` — the layout sets `openGraph: BASE_OPEN_GRAPH`,
and the product page sets `openGraph: { ...BASE_OPEN_GRAPH, title, description }`. The same applies
to any nested metadata field a page redefines. Related: [[0011-seo-structured-data]].
