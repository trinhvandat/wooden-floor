# About page + Google Maps — design spec

> Milestone **M4-B** (Trust/content pages), slice 2 of 3. Date: 2026-06-26.
> Branch: `feat/about-maps`.

## 1. Goal & context

FUKIONE is a lead-gen-first wooden-flooring site (Hà Nội). The about page builds **local
trust** (company story + trust signals) and **local SEO** (LocalBusiness JSON-LD + an embedded
Google Map of the showroom), and — like every content-rich page — ends with a path to a lead.
It complements, not duplicates, the footer (which already shows NAP + a "Xem bản đồ" link).

Settled with the user:
- **Full trust page**: story + trust block + map/contact + lead CTA.
- **Map renders only when configured**: a controlled `<iframe>` when `Settings.mapEmbed` is set;
  otherwise the address + a "Xem bản đồ" link (no address-derived embed).
- **Copy is hardcoded** in the page (Vietnamese; NAP/hours/map come from `Settings`).

## 2. What already exists (reuse, don't rebuild)

- `Settings` global + `getSettings()` + `mapSettings`: the `Settings` type already includes
  `nap { name, address, phone }`, `hours`, `zaloUrl`, **`showroomAddress`**, and **`mapEmbed`**
  (both operator-filled in `/admin`, empty in the seed).
- `buildLocalBusinessJsonLd(biz: { name; address?; phone?; hours? }, siteUrl)` and
  `buildBreadcrumbJsonLd(items, siteUrl)` in `lib/seo/jsonld.ts`; `<JsonLd>`; `SITE_URL` /
  `BASE_OPEN_GRAPH` in `lib/seo/site.ts`.
- The footer (`components/site/Footer.tsx`) renders NAP/hours/Zalo and a Google-Maps **search**
  link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nap.address)}` —
  reuse this exact pattern for the page's fallback link.
- `next.config.ts` rewrites map VN URLs → English route folders; `sitemap.ts` enumerates static
  paths; `NAV` arrays live in `Header.tsx` + `MobileNav.tsx`.
- `ProjectQuoteCta` (`components/site/ProjectQuoteCta.tsx`) — opens `LeadFormSheet` with **no
  context** (records `source: "quote"`, per `[[leadformsheet-source-by-context]]`). This will be
  generalized (§3.4).

## 3. Changes

### 3.1 Route + nav + rewrite

- Create `app/(app)/about/page.tsx`; public URL `/gioi-thieu`.
- `next.config.ts`: add `{ source: "/gioi-thieu", destination: "/about" }`.
- Add `{ label: "Giới thiệu", href: "/gioi-thieu" }` to the `NAV` array in **both**
  `Header.tsx` and `MobileNav.tsx` (place after the `Dự án` entry, before `Báo giá`).
- `export const metadata` (or `generateMetadata`): title `"Giới thiệu"`, a VN description,
  `alternates.canonical: "/gioi-thieu"`, `openGraph: { ...BASE_OPEN_GRAPH, title, description }`.
- Static page; `export const revalidate = 3600` (reads `Settings`, which is cached/ISR).

### 3.2 Map helper — `lib/maps.ts` (the one unit-tested unit)

A pure, security-conscious function that turns the free-form `mapEmbed` into a safe iframe `src`:

```ts
/** Returns a Google-Maps embed URL to use as an <iframe src>, or null if none/unsafe. */
export function extractMapSrc(mapEmbed: string): string | null
```

Behaviour:
- Trim. Empty → `null`.
- If the value contains `<iframe`, regex-extract the `src="…"` attribute value; else treat the
  whole trimmed value as the candidate URL.
- Parse the candidate as a URL. Return it **only if** the host is a Google Maps host
  (`www.google.com` / `google.com` / `maps.google.com`) AND the path indicates an embed/maps URL
  (e.g. starts with `/maps`). Otherwise → `null` (never render an arbitrary third-party iframe).
- Any parse failure → `null`.

### 3.3 Page sections (`app/(app)/about/page.tsx`)

Server component; `const settings = await getSettings()`. Width-capped, centered, consistent with
the other pages. Emits `buildLocalBusinessJsonLd({ name, address, phone, hours }, SITE_URL)` +
`buildBreadcrumbJsonLd([Trang chủ, Giới thiệu], SITE_URL)` via `<JsonLd>`.

1. **Hero/intro** — `<h1>` (use the existing `SectionHeading as="h1"` or a styled `<h1>`) +
   a short hardcoded VN company story (2–3 sentences).
2. **Trust block** — a small grid of hardcoded stat/feature cards (e.g. *năm kinh nghiệm*,
   *công trình đã thi công*, *bảo hành*, *lắp đặt trọn gói*). On-brand placeholder values, easy
   to edit. Use existing card/`SpecChip`/token vocabulary; no new design system.
3. **Map + contact** — showroom section:
   - NAP block (name / `showroomAddress` || `nap.address` / phone (tel:) / Zalo (guarded by
     `isZaloEnabled`) / `hours`), mirroring the footer's presentation.
   - Map: `const mapSrc = extractMapSrc(settings.mapEmbed)`. If `mapSrc` → render
     `<iframe src={mapSrc} loading="lazy" title="Bản đồ showroom FUKIONE" className=…aspect…>`;
     else render the footer-style "Xem bản đồ" link
     (`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nap.address)}`).
4. **Lead CTA** — `<LeadCtaSection settings={settings} title=… body=… />` (§3.4).

### 3.4 Generalize the CTA — `LeadCtaSection`

Rename/refactor `ProjectQuoteCta` → `components/site/LeadCtaSection.tsx`, parameterized:

```tsx
export function LeadCtaSection({ settings, title, body }:
  { settings: Settings; title: string; body: string }) { … }
```

- Same behaviour: owns the sheet open-state, renders the CTA button + `BypassConsult`, opens
  `LeadFormSheet` with **no context** (`source: "quote"`). The `id` stays `"nhan-bao-gia"` (the
  project detail's `BottomActionBar` anchors to it).
- Update the **projects detail page** (`app/(app)/projects/[slug]/page.tsx`) to use
  `LeadCtaSection` with its current copy (title "Muốn một công trình tương tự?", the existing
  body line) — no behaviour change there.
- The about page passes about-flavored copy (e.g. title "Sẵn sàng làm mới sàn nhà bạn?", a short
  body line).

### 3.5 SEO

- `sitemap.ts`: add `"/gioi-thieu"` to `staticPaths`.
- LocalBusiness + breadcrumb JSON-LD on the page (§3.3). (The homepage also emits LocalBusiness;
  Google dedupes — the about page is the canonical home for it.)

## 4. Testing

- **Unit-test `extractMapSrc`** (`lib/maps.test.ts`): plain Google embed URL passes; a full
  `<iframe …src="https://www.google.com/maps/embed?…"…>` snippet → extracted src; a non-Google
  host (e.g. `https://evil.com/x`) → `null`; empty/whitespace → `null`; malformed → `null`.
- `buildLocalBusinessJsonLd` already has tests; no change.
- Page + map render verified via `pnpm build` + Playwright at 375/1440 (0 console errors), with
  `mapEmbed` both empty (link fallback) and set (iframe) — controller seeds a sample `mapEmbed`
  to exercise the iframe path.
- Standard gate: `tsc` 0 · `lint` 0 · `pnpm test` green · `pnpm build` succeeds.

## 5. Out of scope (YAGNI / later)

- CMS-editable about copy (a Payload `About` global) — deferred unless copy changes often.
- A separate `/lien-he` contact page; reviews/testimonials; real photography.
- Address-derived map embed (chosen against: map shows only when `mapEmbed` is configured).
- Blog from Articles (M4-B slice 3).

## 6. Risks & notes

- **Operator `mapEmbed` format is free-form.** `extractMapSrc` must never emit a non-Google
  iframe `src` (XSS/clickjacking surface) — host+path validation + URL parsing, no
  `dangerouslySetInnerHTML`. This is the security-load-bearing unit and is unit-tested.
- **Generalizing `ProjectQuoteCta`** touches just-merged code (the projects detail page). Keep the
  `id="nhan-bao-gia"` and the no-context/`source:"quote"` behaviour identical so the projects
  page is unchanged in behaviour; the only diff there is the component name + passing copy props.
- **LocalBusiness on two pages** (home + about) is acceptable; if it ever needs a single source,
  add an `@id` — out of scope now.
