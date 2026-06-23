# Design — M2: DB-back catalog (seed 8 SKU, ISR 1h)

> Date: 2026-06-23 · Milestone: M2 Catalog · Branch: `feat/db-back-catalog`
> Status: approved (brainstorm) → ready for implementation plan

## 1. Objective

The catalog UI (home, `/products`, `/products/[slug]`) currently reads from a
static `src/lib/mock-data.ts`. M3 (lead capture) already shipped on top of it.
This work flips the data source to the embedded **Payload + Postgres** so the
catalog is content-managed via `/admin`, and re-enables the real product
relationship on captured leads.

Scope is deliberately tight (decided in brainstorm):
- **Seed the 8 existing SKUs** (+ 2 collections, 2 projects) from `mock-data.ts`.
  Importing the full 52-SKU real dataset is deferred until that data exists.
- **ISR + time revalidate (`revalidate = 3600`)** — SSG at build (reads DB for
  `generateStaticParams`) + hourly refresh; no redeploy needed for `/admin` edits.

## 2. Key constraint: schema ≠ frontend type

Payload collections do not map 1:1 to the frontend `Product`/`Collection`/
`Project` types. The data layer is the single place that reconciles them:

| Frontend type | Payload source | Mapping |
|---|---|---|
| `Product.thicknessMm: 8 \| 12` (number) | `select` `'8' \| '12'` (string) | `parseInt` |
| `Product.images: string[]` (urls) | `upload` → media relation | media `.url`; empty for now |
| `Collection.productIds: string[]` | *(not on Collection)* — inverse of `Products.collectionRef` | query products where `collectionRef === id` |
| `Project.productId: string` (single) | `Projects.productRefs` relationship `hasMany` | take first ref id |
| `Leads.productId` | `relationship → products` | requires a **real** product id (now available) |

## 3. Approach: repository layer, keep existing types as the boundary

The data source flips from a static import to an `async` DB read **mapped back
into the same `Product`/`Collection`/`Project` types**. UI components keep
consuming the identical types — only the source changes. This minimizes churn
and keeps mapping logic in one tested place.

Considered and rejected:
- *Server-side filtering via query params* — unnecessary for ≤52 SKUs; would
  rewrite the working client-side `ProductFilters` UX. Keep client filtering.
- *On-demand revalidation (afterChange hook → revalidatePath)* — more accurate
  but adds a hook + complexity; hourly ISR is enough for Phase 1 edit cadence.

## 4. Units

### 4.1 `src/lib/data/catalog.ts` (new, server-only)
Repository over Payload local API (`getPayload({ config })`):
- `getProducts(): Promise<Product[]>` — `find` products `where status === 'published'`, map each doc → `Product`.
- `getProductBySlug(slug: string): Promise<Product | null>`.
- `getCollections(): Promise<Collection[]>` — for each, `productIds` = published products whose `collectionRef === collection.id` (inverse query).
- `getProjects(): Promise<Project[]>`.
- private `mapProduct` / `mapCollection` / `mapProject` implement the §2 table.

### 4.2 `src/seed.ts` (new, idempotent)
Seeds Payload **from `mock-data.ts`** (single seed source). Order matters for
relationships:
1. Collections → capture mock-slug → real-id map.
2. Products → set `collectionRef` from the map; set `status: 'published'`.
3. Projects → set `productRefs: [realId]` from a product mock-slug → real-id map.

Idempotent: upsert by `slug` (find existing → skip/update, never duplicate).
Wired as `pnpm seed` → `payload run src/seed.ts` (Node 22, per the pinned
`payload-next16-compat` convention; `payload run` uses tsx).

### 4.3 Page changes (all gain `export const revalidate = 3600`)
- `(app)/page.tsx` (home): `await getProducts/getCollections/getProjects`.
- `(app)/products/page.tsx`: becomes a **server component**; `await getProducts()` → `<ProductFilters products={...} />`.
- `(app)/products/[slug]/page.tsx`: `generateStaticParams`, `generateMetadata`, and the page read via the data layer; related products resolved through the collection.

### 4.4 `src/components/ProductFilters.tsx` (client)
Accept a `products: Product[]` prop instead of importing `mock-data`. Derive
`ALL_COLORS` / `ALL_ROOMTYPES` from props.

### 4.5 Re-enable `productId` on leads
Thread the real product id from the detail page / `CalculatorWidget` →
`LeadFormSheet` → `POST /api/leads`. Remove the intentional omission at
`LeadFormSheet.tsx:71`. `Leads.productId` is a relationship, so the now-real id
is valid; `schema.ts` already accepts `productId`.

## 5. Data flow

```
build / ISR (≤1h)
  → server page  → getPayload → Postgres → map → typed Product[]/Collection[]/Project[]
                 → (client ProductFilters filters in-browser via props)
lead submit
  → POST /api/leads → payload.create({ productId: <real relationship id>, ... })
```

## 6. Error handling
- Data layer returns `[]` on empty result; `getProductBySlug` → `null` → `notFound()`.
- DB empty (not seeded) → pages render empty, no crash.
- `generateStaticParams` now reads the DB at build → **build requires `DATABASE_URL`** (Vercel has it; flag for local builds).

## 7. Testing (keep ~80% on new paths)
- **Unit** — `mapProduct`/`mapProject`/`mapCollection`: thickness string→number, `productRefs`→`productId`, `collectionRef` inverse, empty images.
- **Integration** — data layer with a mocked `payload` (pattern from `api/leads/route.test.ts`): filters `published`, maps correctly, inverse collection query.
- **e2e** — golden flow "filter products → view detail" re-run against seeded data.
- Calculator unit test unaffected.

## 8. Risks / gotchas
- `generateStaticParams` build-time DB read needs `DATABASE_URL`.
- Seed idempotency — upsert by slug to avoid duplicates on re-run.
- `thicknessMm` select returns a string — always `parseInt`.
- `mock-data.ts` is retained (now only the seed source) — do not delete in this pass.
- Payload `run`/tsx needs Node 22 (already pinned).

## 9. Out of scope (YAGNI)
- Full 52-SKU real dataset import (separate content task).
- Server-side / query-param filtering.
- On-demand revalidation hooks.
- Product/collection images (media uploads) — empty until real assets exist.
- M4 SEO work (schema.org, sitemap) — unblocked by this, done separately.
