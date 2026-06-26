---
name: 0015-about-page-maps
description: About page (M4-B slice 2) at /gioi-thieu — story + trust + showroom map/contact + lead CTA, reusing Settings + a safe map-embed validator
metadata: { type: decision, date: 2026-06-26 }
---
The about page ships at the VN URL **`/gioi-thieu`** (English route folder `app/(app)/about/` +
`next.config.ts` rewrite, per [[vn-urls-via-next-rewrites]]). It is a static server page
(`revalidate = 3600`) with four sections: hero/story (`<h1>`), a trust-stat block, the
showroom map+contact, and a lead CTA.

Key choices:
- **Reuses existing data**: NAP / hours / `showroomAddress` / `mapEmbed` come from the `Settings`
  global (`getSettings()`); the page emits `buildLocalBusinessJsonLd` + breadcrumb JSON-LD. Story
  and trust-stat copy are **hardcoded** Vietnamese (YAGNI — no CMS for one page; NAP stays dynamic).
- **Map renders only when configured.** `Settings.mapEmbed` is operator-filled (empty in seed). A
  pure `extractMapSrc()` (`lib/maps.ts`, unit-tested) turns the free-form value into a safe
  controlled `<iframe src>`; when it returns `null` the page shows the address + a "Xem bản đồ"
  link (the footer's `maps/search?...query=<address>` pattern). No address-derived embed. See
  [[safe-embed-iframe-validation]] for the security pattern.
- **CTA generalized.** `ProjectQuoteCta` was renamed to a shared `LeadCtaSection({ settings, title,
  body })` (`components/site/`) used by both the projects detail page and the about page; still
  opens `LeadFormSheet` with **no context → `source: "quote"`** ([[leadformsheet-source-by-context]]).
- Nav gained "Giới thiệu" → `/gioi-thieu` (Header + MobileNav); sitemap gained `/gioi-thieu`.

**Why:** the about page is the canonical home for LocalBusiness data and a strong local-trust /
local-SEO surface for a Hà Nội lead-gen site; reusing `Settings` + the lead funnel kept it small.
**How to apply:** the last M4-B slice (blog from Articles) follows the same shape — English folder +
VN rewrite, reuse `lib/data` + builders, ISR 3600, JSON-LD, sitemap, a lead CTA via `LeadCtaSection`.
Related: [[0014-projects-gallery]], [[0011-seo-structured-data]], [[0012-db-back-settings]].
