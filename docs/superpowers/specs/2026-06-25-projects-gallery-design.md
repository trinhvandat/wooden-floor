# Projects gallery — design spec

> Milestone **M4-B** (Trust/content pages), slice 1 of 3. Date: 2026-06-25.
> Branch: `feat/projects-gallery`.

## 1. Goal & context

FUKIONE is a lead-gen-first wooden-flooring site. For a flooring business, **real
installation photos are the strongest trust / social-proof signal**, so the projects
gallery is the highest-value M4-B slice. It shows completed installations and
cross-links the products used back into the catalog (internal SEO + conversion).

Scope decisions already settled with the user:
- **Grid + detail pages** (not a single lightbox, not a homepage-only strip).
- **Real images when present, wood-gradient fallback when absent** + seed text-only
  sample projects (no committed photos). Operator uploads real photos in `/admin` later.
- **Nav link only** this slice (`Dự án` → `/du-an`); no homepage changes.

## 2. What already exists (this slice completes scaffolding)

- `src/collections/Projects.ts` — collection with `title`, `slug` (unique, indexed),
  `description` (textarea), `location`, `areaM2`, `images` (`upload` → `media`, `hasMany`),
  `productRefs` (`relationship` → `products`, `hasMany`). **No `status` field.**
- `src/collections/Media.ts` — working `upload` collection with required `alt`.
- `src/lib/types.ts` — `Project` type (stub: `productId` singular, `images: string[]`).
- `src/lib/data/catalog.map.ts` — `ProjectDoc` + `mapProject` (stub: `images` hardcoded
  to `[]`, only the first `productRef` kept).
- `src/lib/data/catalog.ts` — `getProjects()` (stub: no published filter, `depth: 0`).
  **No `getProjectBySlug()`.**
- `src/seed.ts` (~line 63) — a `PROJECTS` mock + upsert loop that sets
  `productRefs: [productRef]` but **does not set `status`**.
- `next.config.ts` — rewrites map Vietnamese public URLs → English route folders.
- `src/app/sitemap.ts` — enumerates static paths + product detail pages.

## 3. Changes

### 3.1 Collection — add `status` (`src/collections/Projects.ts`)

Add a `status` select mirroring `Products` exactly, so the operator can stage projects:

```ts
{
  name: 'status',
  type: 'select',
  defaultValue: 'draft',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ],
}
```

Schema change → **Payload codegen runs before the TS/Next build** (build-order gotcha).
Generated artifacts (types, migrations) are not hand-edited.

### 3.2 Data model — finish the stubs

**`src/lib/types.ts` — `Project`:**
- `productId: string` → `productIds: string[]` (all cross-links, not just the first).
- `images: string[]` → `images: { url: string; alt: string }[]` (Media `url` + required `alt`).
- Surface `description: string`.

**`src/lib/data/catalog.map.ts` — `ProjectDoc` + `mapProject`:**
- Extend `ProjectDoc` with `description?: string | null` and `images` populated as Media
  docs (`{ id; url?; alt? }[]`).
- `mapProject`: map `description ?? ""`, map **all** `productRefs` → `productIds`, and map
  `images` → `{ url, alt }[]` (skip any entry without a `url`).

**`src/lib/data/catalog.ts`:**
- `getProjects()`: add `where: PUBLISHED` and `depth: 1` (so the cover image populates).
- Add `getProjectBySlug(slug)`: `where: { and: [PUBLISHED, { slug }] }`, `depth: 1`,
  returns `Project | null` (mirrors `getProductBySlug`).
- The detail page resolves `productIds` → product cards by filtering `getProducts()`
  (already cached) — no extra per-product query.

### 3.3 Routes + rewrites

- `src/app/(app)/projects/page.tsx` — server component; `getProjects()` → grid of
  `ProjectCard`. Page width-capped + centered, consistent with the catalog. Graceful
  empty state when there are no published projects.
- `src/app/(app)/projects/[slug]/page.tsx` — `getProjectBySlug`; `notFound()` when null;
  `generateStaticParams` from published slugs + ISR, mirroring product detail. Renders:
  photo gallery (or gradient fallback), `location` / `areaM2` chips, `description`, and a
  "Sản phẩm trong dự án" row reusing `ProductCard` for the cross-linked products.
- `next.config.ts` — add rewrites:
  `{ source: "/du-an", destination: "/projects" }` and
  `{ source: "/du-an/:slug", destination: "/projects/:slug" }`.

### 3.4 Components & imagery

- New `src/components/site/ProjectCard.tsx` (mirrors `ProductCard`): thumbnail, title,
  `location`, `areaM2`. Renders the first image via `next/image` when present; otherwise
  the wood gradient (`bg-gradient-to-br from-wood-soft to-wood`), matching the catalog so
  it never looks broken. Same fallback on the detail gallery.
- Reuse `SectionHeading`, `SpecChip`, `ProductCard`. Keep files small and focused.
- Payload local media is served same-origin, so `next/image` needs no `remotePatterns`
  change. (If a non-same-origin media host is introduced later, add `images.remotePatterns`
  then — out of scope now.)

### 3.5 Navigation

- Add `{ label: "Dự án", href: "/du-an" }` to `NAV_LINKS` in `src/components/site/Header.tsx`
  and `src/components/site/MobileNav.tsx`. Footer has no nav-link list → no footer change.
- Internal links use the **Vietnamese public URL** (`/du-an`, `/du-an/[slug]`).

### 3.6 Seed (`src/seed.ts`)

- Add `status: "published"` to the project seed `data` (otherwise the new `draft` default
  hides every seeded project behind the `PUBLISHED` filter).
- Enrich the `PROJECTS` mock so each sample has a `description` and (optionally) multiple
  `productRefs`, so the detail page demonstrates cross-links. No image uploads — gradient
  fallback covers the empty `images`.

### 3.7 SEO

- `src/app/sitemap.ts` — add `/du-an` to static paths; add one entry per published project
  (`/du-an/${slug}`), mirroring the product-detail block.
- Detail page — `generateMetadata` (title from project title, description from
  `description`) + breadcrumb JsonLd, mirroring product detail. No richer schema (YAGNI
  for Phase 1).

## 4. Testing

- Unit-test `mapProject` (extend / mirror `src/lib/data/catalog.map.test.ts`): asserts
  `description`, **all** `productIds`, image mapping (`{ url, alt }`), and the
  url-less-image skip. Cheap and matches the existing test pattern.
- A projects gallery is **not** on CLAUDE.md's high-risk list (calculator unit /
  form→lead→email integration / two golden e2e flows), so no forced e2e this slice.
- Standard gates before PR: `tsc --noEmit` 0, `pnpm lint` 0, `pnpm test` green,
  `pnpm build` succeeds, Playwright spot-check at 375px + 1440px with 0 console errors.

## 5. Out of scope (YAGNI / later M4-B slices)

- About page + Google Maps (M4-B slice 2); blog from Articles (M4-B slice 3).
- Homepage "recent installations" strip.
- Image upload via seed / committed sample photos.
- Filtering/pagination on the gallery (52-SKU-scale catalog has filters; a handful of
  projects does not need them).
- Richer structured data beyond breadcrumb.

## 6. Risks & notes

- **Status/seed coupling:** adding `status` (default `draft`) without seeding
  `status: "published"` would silently empty the gallery — the seed change ships in the
  same slice and is called out in §3.6.
- **`depth: 1`** is required for image/cover population; keep it minimal (don't deep-
  populate `productRefs` — resolve those from the already-cached `getProducts()`).
- **Empty state vs nav link:** the nav link is always shown; seed guarantees content in
  dev, and the operator publishes real projects before go-live. If the gallery must be
  hidden while empty (parallel to the Zalo `isZaloEnabled` guard), that's a small
  follow-up, not part of this slice.
