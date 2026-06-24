---
name: 0011-seo-structured-data
description: M4-A technical SEO — SITE_URL config, metadataBase + title template + canonical (VN paths), dynamic sitemap/robots, JSON-LD via pure builders + <JsonLd> renderer
metadata: { type: decision, date: 2026-06-24 }
---
M4-A makes the existing pages SEO-complete (code-only, no new routes). Branch `feat/seo-structured-data`.
Part of M4 SEO & Trust; **M4-B** (trust/content pages: projects gallery, about, blog from the Articles
collection) is a separate later spec.

**Why:** FUKIONE is lead-gen-first; the competitive edge is "SEO + speed + lead conversion". The funnel
(M3) had no traffic backbone — no metadataBase, sitemap, robots, or JSON-LD. With the catalog DB-backed
(M2), Product/LocalBusiness structured data + canonical metadata are now meaningful.

**How to apply:**
- `src/lib/seo/site.ts` — `SITE_URL` (`process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`),
  `absoluteUrl(path)`, and `BASE_OPEN_GRAPH` (shared default OG — see [[nextjs-opengraph-no-deep-merge]]).
  `.env.example` carries `NEXT_PUBLIC_SITE_URL`.
- Root layout: `metadataBase`, `title: { default, template: "%s — FUKIONE" }`, `openGraph: BASE_OPEN_GRAPH`,
  twitter card. Each page's `title` is the BARE name (template adds the brand once); home uses `title.absolute`.
- Per-page `alternates.canonical` uses the **Vietnamese public path** (`/san-pham`, `/bao-gia`,
  `/dat-lich-khao-sat`, `/san-pham/<slug>`), never the English route folder — see [[vn-urls-via-next-rewrites]].
  `/cam-on` is `robots:{ index:false }`.
- `src/app/sitemap.ts` + `src/app/robots.ts` at the **app root** (NOT under `(app)`) so they serve at
  `/sitemap.xml` / `/robots.txt`. Sitemap = static VN routes + one entry per published product (`getProducts()`),
  excludes `/cam-on`/`/admin`/`/api`. Robots disallows those + points at the sitemap.
- JSON-LD: **pure builders** in `src/lib/seo/jsonld.ts` (LocalBusiness, Product, BreadcrumbList — unit-tested,
  no React/Payload import) + thin `<JsonLd>` renderer (`src/components/seo/JsonLd.tsx`). Mirrors M2's
  mapper/repository split. LocalBusiness on home (from mock `SETTINGS.nap` — Settings global is NOT DB-backed,
  a future slice); Product + BreadcrumbList on detail; BreadcrumbList on catalog. Offers use `priceCurrency:"VND"`.
- OG: one static site-wide `public/og.png` (1200×630 placeholder, design replaces later); per-product dynamic
  OG (next/og) deferred. Related: [[0010-db-back-catalog-repository]].

**Deferred (needs DATABASE_URL):** `pnpm build` (sitemap + generateStaticParams read DB at build — the real
end-to-end gate); post-deploy Google Rich Results validation (Product/Breadcrumb/LocalBusiness).
