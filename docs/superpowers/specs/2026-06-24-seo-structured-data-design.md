# Design — M4-A: Technical SEO + structured data

> Date: 2026-06-24 · Milestone: M4 SEO & Trust (sub-project A) · Branch: `feat/seo-structured-data`
> Status: approved (brainstorm) → ready for implementation plan

## 1. Objective

FUKIONE is lead-gen-first; `docs/architecture.md` names the competitive edge as
"SEO + speed + lead conversion". The funnel (M3) works and the catalog is now DB-backed (M2),
but the site has **no technical SEO backbone**: no `metadataBase`, no `sitemap.xml`, no
`robots.txt`, no JSON-LD, and the home page has no `metadata`. This sub-project makes the
**existing pages SEO-complete** — code only, no new routes/content/design.

M4 is split into two sub-projects; this is **A** (technical SEO + structured data). **B** (trust &
content pages: projects gallery, about, blog) is a later, separate spec.

## 2. Scope

Existing routes only: `/` (home), `/san-pham` (catalog), `/san-pham/[slug]` (product detail),
`/bao-gia` (quote), `/dat-lich-khao-sat` (book-survey), `/cam-on` (thank-you → noindex).

**Canonical and sitemap URLs use the Vietnamese public paths** (the `next.config` rewrites onto
English route folders), never the English folder names — per `vn-urls-via-next-rewrites`.

## 3. Decisions (settled in brainstorm)

- **Base URL:** `NEXT_PUBLIC_SITE_URL` env var, fallback `http://localhost:3000` in dev. Single
  source for `metadataBase`, sitemap, canonical, and JSON-LD `@id`/`url`. Add the var to
  `.env.example` (`.env` is user-managed, read-only to Claude).
- **NAP source:** the existing mock `src/lib/settings.ts` `SETTINGS.nap` (name/address/phone/hours).
  DB-backing the Payload `settings` global is a separate future slice (mirrors M2) — keeps A
  code-only with no behavior change (the calculator already reads this mock).
- **OG image:** one static site-wide image (`public/og.png`), declared in the root layout.
  Per-product dynamic OG (`next/og`) is deferred.

## 4. Units

### 4.1 `src/lib/seo/site.ts` (new)
`export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`. Plus a
small `absoluteUrl(path)` helper. Add `NEXT_PUBLIC_SITE_URL=` to `.env.example`.

### 4.2 Root metadata — `src/app/(app)/layout.tsx` (modify)
Add to the exported `metadata`: `metadataBase: new URL(SITE_URL)`; `title: { default: "FUKIONE —
Sàn gỗ cao cấp tại Hà Nội", template: "%s — FUKIONE" }`; default `openGraph` (`type: "website"`,
`siteName: "FUKIONE"`, `locale: "vi_VN"`, `images: ["/og.png"]`); `twitter: { card:
"summary_large_image" }`. Place `public/og.png` (a simple static asset; if none exists yet, ship a
placeholder and flag it).

### 4.3 Per-page metadata completeness
- `(app)/page.tsx` (home): add `export const metadata` with its own title/description +
  `alternates: { canonical: "/" }`.
- Catalog/quote/book-survey: add `alternates.canonical` (the VN path).
- `(app)/products/[slug]/page.tsx` `generateMetadata`: add `alternates.canonical:
  "/san-pham/<slug>"` + per-product `openGraph` (title/description; image = site default).
- `(app)/thank-you/page.tsx` (`/cam-on`): `robots: { index: false, follow: true }`.

### 4.4 `src/app/sitemap.ts` (new)
Default-exported `sitemap()` (Next file convention). Static entries: `/`, `/san-pham`, `/bao-gia`,
`/dat-lich-khao-sat`. Dynamic: a `/san-pham/<slug>` entry per published product from
`getProducts()`. Excludes `/cam-on`, `/admin`, `/api`. All URLs absolute via `SITE_URL`.

### 4.5 `src/app/robots.ts` (new)
Default-exported `robots()`: allow all; `disallow: ["/admin", "/api", "/cam-on"]`; `sitemap:
\`${SITE_URL}/sitemap.xml\``.

### 4.6 JSON-LD — `src/lib/seo/jsonld.ts` (new, pure) + `src/components/seo/JsonLd.tsx` (new)
Pure builder functions return plain JSON-LD objects (unit-testable, no React/Payload import):
- `buildLocalBusinessJsonLd(settings, siteUrl)` → `@type` `HomeAndConstructionBusiness`
  (name, address, telephone, openingHours, url, areaServed "Hà Nội", priceRange).
- `buildProductJsonLd(product, siteUrl)` → name, description, brand "FUKIONE", `offers`
  (`price: pricePerM2`, `priceCurrency: "VND"`, availability InStock, url).
- `buildBreadcrumbJsonLd(items, siteUrl)` → `BreadcrumbList` from `{name, path}[]`.

`<JsonLd data={...} />` renders `<script type="application/ld+json"
dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />` (data is server-built from trusted
sources). Injected: **LocalBusiness** on home; **Product** + **BreadcrumbList** on detail;
**BreadcrumbList** on catalog.

## 5. Data flow

Server components read `SITE_URL` + mock `SETTINGS` (NAP) + DB products → emit `metadata` and
`<script type="application/ld+json">`. `sitemap.ts`/`robots.ts` are Next file conventions executed
at build/request.

## 6. Pattern (mirror M2)

Keep the **pure JSON-LD builders** (`lib/seo/jsonld.ts`) separate from the **renderer**
(`<JsonLd>`), exactly as M2 split pure mappers from the repository. Builders unit-test without a
DB or React.

## 7. Error handling

- `SITE_URL` falls back to localhost in dev (no crash if the env var is unset).
- `getProducts()` empty → sitemap still returns the static routes.
- Builders guard missing optional fields (e.g. no phone → omit `telephone`).

## 8. Testing (keep ~80% on new logic)

- **Unit** — `buildProductJsonLd` / `buildLocalBusinessJsonLd` / `buildBreadcrumbJsonLd`: valid
  `@context`/`@type`, required fields present, price + `priceCurrency: "VND"`, breadcrumb order.
- **Unit/integration** — `sitemap()` includes the static routes plus a `/san-pham/<slug>` entry
  per product (mock `getProducts`); `robots()` disallows `/admin`,`/api`,`/cam-on` and points at
  the sitemap.
- Page `metadata` is not unit-tested (framework output) — covered by `pnpm build` + manual Google
  Rich Results validation post-deploy.

## 9. Out of scope (YAGNI)

Per-product dynamic OG (`next/og`); DB-backing the Payload `settings` global (use the mock);
Articles/Projects pages and their sitemap entries (sub-project B); `hreflang` (single language);
`WebSite` `SearchAction` (no site search); Google Business Profile / Maps setup (ops, manual).
