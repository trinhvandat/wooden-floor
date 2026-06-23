---
name: 0010-db-back-catalog-repository
description: catalog reads Payload via a repository that maps docs back into the existing Product/Collection/Project types; ISR revalidate=3600; productId re-enabled (coerced to number)
metadata: { type: decision, date: 2026-06-23 }
---
M2 flips the catalog (home, `/san-pham`, `/san-pham/[slug]`, `/bao-gia`) from the static
`mock-data.ts` to embedded Payload+Postgres via a **repository layer that keeps the frontend
types as the contract**. Shipped in PR #8 (merged). Seeded the 8 existing SKUs (full 52-SKU real
dataset deferred). `mock-data.ts` is RETAINED as the single seed source — no app code imports it
at runtime anymore (only `src/seed.ts`).

**Why:** flipping the data source to async DB reads *mapped back into the same
`Product`/`Collection`/`Project` types* (`src/lib/types.ts`) means UI components barely change —
only the source moves. Mapping logic lives in one tested place. Unblocks M4 (SEO on real product
pages) and lets sales edit the catalog via `/admin`.

**How to apply:**
- Data access: `src/lib/data/catalog.ts` — `getProducts` / `getProductBySlug` / `getCollections`
  / `getProjects` (query published, `getPayload({ config })`). Pure mappers in
  `src/lib/data/catalog.map.ts` (no Payload import → DB-free unit tests).
- Schema↔type seams (Payload ≠ frontend type): `thicknessMm` select-string `'8'|'12'` → number
  `8|12`; `Collection.productIds` is the INVERSE of `Products.collectionRef` (Collection has no
  products field) → query products by collectionRef; `Project.productId` = first of `productRefs`
  (hasMany); ids number → `String(id)`; `images: []` (no assets yet, `ProductCard` guards
  `images[0]`).
- Pages are async server components with `export const revalidate = 3600` (ISR; `/admin` edits
  show ≤1h, no redeploy). `ProductFilters` + page-variant `CalculatorWidget` take data via props
  (client filtering preserved). All pages empty-DB safe (render empty, no crash before seed).
- Seed: `pnpm seed` → idempotent upsert-by-slug from `mock-data.ts` (collections → products →
  projects). See [[payload-run-relative-imports]].
- `productId` re-enabled on calculator leads: client sends the real id string; `route.ts` coerces
  to the integer the relationship needs and DROPS a malformed value (`Number.isInteger` guard) so
  the lead is still saved (leads-must-never-be-lost). This also fixed a latent `tsc` error where
  `productId: string` was assigned to the `number|Product|null` relationship. Builds on
  [[0008-lead-funnel-route-handler]].
- GOTCHA on Payload's typed API: see [[payload-typed-api-data-widening]].

**Deferred (needs DATABASE_URL, before/at deploy):** run `pnpm seed`; `pnpm build` (proves the
build-time `generateStaticParams` DB read + relationship insert); write+run the "filter products →
view detail" golden e2e (only `lead-funnel.spec.ts` exists today). Related:
[[0006-embed-payload-backend]].
