---
name: 0014-projects-gallery
description: Projects gallery (M4-B slice 1) — /du-an grid + detail completing the scaffolded Projects collection, with a lead CTA on every detail page
metadata: { type: decision, date: 2026-06-25 }
---
The projects gallery (social proof for the lead-gen funnel) ships as a **grid + per-project
detail** at the VN URLs `/du-an` and `/du-an/[slug]` (English route folders
`app/(app)/projects/...` + `next.config.ts` rewrites, per [[vn-urls-via-next-rewrites]]). It
**completes the already-scaffolded `Projects` collection** rather than building greenfield.

Key choices:
- **Data layer finished the stubs** in `lib/data/catalog.ts` + `catalog.map.ts`: `getProjects()`
  now filters `PUBLISHED` + `depth: 1` (to populate cover images), and a new `getProjectBySlug()`
  mirrors `getProductBySlug`. The `Project` type changed `productId` (single) → **`productIds:
  string[]`** (all cross-links), `images: string[]` → **`images: { url; alt }[]`** (populated
  Media), and gained `description`. `mapProject` maps all refs and **skips Media entries without a
  `url`** (unpopulated relations / url-less docs).
- **`status` select** (`draft`/`published`, default `draft`) added to the `Projects` collection,
  mirroring `Products`, so operators stage projects in `/admin`. The seed therefore **must set
  `status: "published"`** or the gallery silently empties behind the published filter.
- **Gradient fallback**: cards + detail gallery render real `next/image` when present, else the wood
  gradient (`from-wood-soft to-wood`) — matches the catalog, never looks broken. Seed is text-only
  (no committed photos); operator uploads later.
- **Every detail page has a lead CTA** (`ProjectQuoteCta` → opens the shared `LeadFormSheet`) +
  mobile `BottomActionBar` — added after a design review flagged a content page with no path to a
  lead. See [[leadformsheet-source-by-context]] for why the CTA passes **no** context.
- Nav `Dự án` **repointed** `/#du-an` (homepage teaser anchor) → `/du-an`; the teaser kept a
  `Xem tất cả →` link into the page. Sitemap + breadcrumb JSON-LD extended (mirrors products).

**Why:** real installation photos are the strongest trust signal for a flooring buyer, and a
high-intent detail page must capture the lead, not just deep-link into the catalog. Reusing the
existing data-layer/SEO/lead-funnel patterns kept the slice small and consistent.
**How to apply:** the remaining M4-B slices (about + Maps, blog from Articles) follow the same
shape — English folder + VN rewrite, `lib/data` + pure mapper, ISR 3600, breadcrumb JSON-LD,
sitemap entry, and a lead CTA on any content-rich page. Related: [[0010-db-back-catalog-repository]],
[[0011-seo-structured-data]], [[0008-lead-funnel-route-handler]], [[payload-typed-api-data-widening]].
