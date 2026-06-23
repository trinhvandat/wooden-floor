# DB-back Catalog (M2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flip the catalog (home, `/products`, `/products/[slug]`, `/quote`) from the static `mock-data.ts` to the embedded Payload + Postgres, seed the 8 existing SKUs, and re-enable the real `productId` relationship on captured leads.

**Architecture:** A small server-only repository (`src/lib/data/catalog.ts`) reads Payload via `getPayload({ config })` and maps each doc back into the existing `Product`/`Collection`/`Project` types using pure functions in `src/lib/data/catalog.map.ts`. Pages become async server components that call the repository; client components (`ProductFilters`, `CalculatorWidget`) receive their data via props instead of importing `mock-data`. A `pnpm seed` script seeds Payload from `mock-data.ts` (single seed source). Pages use ISR (`export const revalidate = 3600`).

**Tech Stack:** Next.js 16 App Router, Payload CMS 3.85 (Postgres adapter), TypeScript strict, Vitest 4 (node env), Playwright e2e.

## Global Constraints

- All repo artifacts in **English** (code, comments, identifiers); Vietnamese only in user-facing copy strings.
- Keep `zod@4`; do not pass schemas into Payload (per `zod4-payload-no-conflict`).
- Vitest 4 hoists `vi.mock` factories — wrap mock `vi.fn()`s in `vi.hoisted()` (per `vitest4-vi-hoisted`).
- Vitest env is `node`, no `globals` — import `{ describe, it, expect, vi, beforeEach }` from `"vitest"`.
- e2e specs live under `e2e/**` and are excluded from `pnpm test` (per `vitest-exclude-e2e`).
- Payload config alias: `@payload-config` → `fukione-web/payload.config.ts`. Source alias `@/*` → `fukione-web/src/*`.
- `thicknessMm` is a Payload `select` storing the **string** `'8'|'12'`; the frontend type is the **number** `8|12`.
- Product/Collection/Project ids from Postgres are **numbers**; the frontend types use **string** ids — always `String(id)` at the boundary.
- Prices live in Payload, never hardcoded (per project CLAUDE.md). The seed copies prices from `mock-data.ts`; no new hardcoded prices.
- `payload run` (tsx) requires Node 22 (per `payload-next16-compat`).
- All commands run from `fukione-web/`. Branch: `feat/db-back-catalog`.
- `mock-data.ts` is retained as the seed source — do NOT delete it in this plan.

---

## File Structure

- `src/lib/data/catalog.map.ts` (new) — pure doc→type mappers + raw doc interfaces. No Payload import → unit-testable without a DB.
- `src/lib/data/catalog.map.test.ts` (new) — unit tests for the mappers.
- `src/lib/data/catalog.ts` (new) — async repository: `getProducts`, `getProductBySlug`, `getCollections`, `getProjects`.
- `src/lib/data/catalog.test.ts` (new) — integration tests with a mocked `payload`.
- `src/seed.ts` (new) — idempotent seed from `mock-data.ts`.
- `package.json` (modify) — add `seed` script.
- `src/components/ProductFilters.tsx` (modify) — accept `products` prop.
- `src/components/CalculatorWidget.tsx` (modify) — accept optional `products` prop for the `page` variant.
- `src/app/(app)/products/page.tsx` (modify) — async server component + `revalidate`.
- `src/app/(app)/products/[slug]/page.tsx` (modify) — async data-layer reads + `revalidate`.
- `src/app/(app)/page.tsx` (modify) — async data-layer reads + `revalidate`.
- `src/app/(app)/quote/page.tsx` (modify) — async server component passing `products` + `revalidate`.
- `src/components/LeadFormSheet.tsx` (modify) — send real `productId`.
- `src/app/(app)/api/leads/route.test.ts` (modify) — assert `productId` is forwarded to `create`.

---

### Task 1: Pure mappers

**Files:**
- Create: `src/lib/data/catalog.map.ts`
- Test: `src/lib/data/catalog.map.test.ts`

**Interfaces:**
- Consumes: `Product`, `Collection`, `Project` from `@/lib/types`.
- Produces:
  - `interface ProductDoc { id: number|string; slug: string; name: string; pricePerM2: number; thicknessMm: string; waterproof?: boolean|null; color?: string|null; surface?: string|null; roomTypes?: string[]|null; specs?: {k:string;v:string}[]|null; collectionRef?: number|string|{id:number|string}|null }`
  - `interface CollectionDoc { id: number|string; slug: string; name: string; description?: string|null }`
  - `interface ProjectDoc { id: number|string; slug: string; title: string; location?: string|null; areaM2?: number|null; productRefs?: (number|string|{id:number|string})[]|null }`
  - `mapProduct(doc: ProductDoc): Product`
  - `mapCollection(doc: CollectionDoc, productDocs: ProductDoc[]): Collection`
  - `mapProject(doc: ProjectDoc): Project`

- [ ] **Step 1: Write the failing test**

Create `src/lib/data/catalog.map.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mapProduct, mapCollection, mapProject } from "./catalog.map";
import type { ProductDoc, CollectionDoc, ProjectDoc } from "./catalog.map";

const productDoc: ProductDoc = {
  id: 3,
  slug: "san-go-walnut",
  name: "Sàn Gỗ Walnut",
  pricePerM2: 610_000,
  thicknessMm: "12",
  waterproof: true,
  color: "Nâu Đậm",
  surface: "Vân gỗ óc chó",
  roomTypes: ["phòng khách"],
  specs: [{ k: "Độ dày", v: "12 mm" }],
  collectionRef: 1,
};

describe("mapProduct", () => {
  it("converts thicknessMm string to a number and stringifies the id", () => {
    const p = mapProduct(productDoc);
    expect(p.id).toBe("3");
    expect(p.thicknessMm).toBe(12);
    expect(p.waterproof).toBe(true);
    expect(p.images).toEqual([]);
    expect(p.specs).toEqual([{ k: "Độ dày", v: "12 mm" }]);
  });

  it("defaults nullable text fields to empty values", () => {
    const p = mapProduct({ id: 9, slug: "x", name: "X", pricePerM2: 1, thicknessMm: "8" });
    expect(p.thicknessMm).toBe(8);
    expect(p.color).toBe("");
    expect(p.roomTypes).toEqual([]);
  });
});

describe("mapCollection", () => {
  it("derives productIds from the inverse collectionRef on product docs", () => {
    const colDoc: CollectionDoc = { id: 1, slug: "cao-cap", name: "Cao Cấp", description: "d" };
    const others: ProductDoc[] = [
      productDoc,
      { id: 4, slug: "y", name: "Y", pricePerM2: 1, thicknessMm: "8", collectionRef: { id: 2 } },
      { id: 5, slug: "z", name: "Z", pricePerM2: 1, thicknessMm: "8", collectionRef: 1 },
    ];
    const c = mapCollection(colDoc, others);
    expect(c.id).toBe("1");
    expect(c.productIds).toEqual(["3", "5"]);
  });
});

describe("mapProject", () => {
  it("takes the first productRef as the single productId", () => {
    const doc: ProjectDoc = {
      id: 7, slug: "villa", title: "Villa", location: "HN", areaM2: 220, productRefs: [{ id: 3 }, { id: 5 }],
    };
    const j = mapProject(doc);
    expect(j.productId).toBe("3");
    expect(j.areaM2).toBe(220);
  });

  it("yields an empty productId when there are no refs", () => {
    expect(mapProject({ id: 8, slug: "s", title: "S" }).productId).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/data/catalog.map.test.ts`
Expected: FAIL — cannot find module `./catalog.map`.

- [ ] **Step 3: Write the mappers**

Create `src/lib/data/catalog.map.ts`:

```ts
// Pure mappers: Payload collection docs -> frontend domain types.
// No Payload runtime import, so these unit-test without a DB.
import type { Product, Collection, Project } from "@/lib/types";

export interface ProductDoc {
  id: number | string;
  slug: string;
  name: string;
  pricePerM2: number;
  thicknessMm: string; // Payload select stores '8' | '12'
  waterproof?: boolean | null;
  color?: string | null;
  surface?: string | null;
  roomTypes?: string[] | null;
  specs?: { k: string; v: string }[] | null;
  collectionRef?: number | string | { id: number | string } | null;
}

export interface CollectionDoc {
  id: number | string;
  slug: string;
  name: string;
  description?: string | null;
}

export interface ProjectDoc {
  id: number | string;
  slug: string;
  title: string;
  location?: string | null;
  areaM2?: number | null;
  productRefs?: (number | string | { id: number | string })[] | null;
}

function refId(
  ref: number | string | { id: number | string } | null | undefined,
): string | null {
  if (ref == null) return null;
  return typeof ref === "object" ? String(ref.id) : String(ref);
}

export function mapProduct(doc: ProductDoc): Product {
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    pricePerM2: doc.pricePerM2,
    thicknessMm: Number(doc.thicknessMm) === 12 ? 12 : 8,
    waterproof: Boolean(doc.waterproof),
    color: doc.color ?? "",
    surface: doc.surface ?? "",
    roomTypes: doc.roomTypes ?? [],
    images: [],
    specs: (doc.specs ?? []).map((s) => ({ k: s.k, v: s.v })),
  };
}

export function mapCollection(doc: CollectionDoc, productDocs: ProductDoc[]): Collection {
  const productIds = productDocs
    .filter((p) => refId(p.collectionRef) === String(doc.id))
    .map((p) => String(p.id));
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? "",
    coverImage: "",
    productIds,
  };
}

export function mapProject(doc: ProjectDoc): Project {
  const refs = doc.productRefs ?? [];
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    location: doc.location ?? "",
    areaM2: doc.areaM2 ?? 0,
    productId: refs.length ? (refId(refs[0]) ?? "") : "",
    images: [],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/data/catalog.map.test.ts`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/catalog.map.ts src/lib/data/catalog.map.test.ts
git commit -m "feat: add pure Payload-doc to domain-type mappers for catalog"
```

---

### Task 2: Repository fetchers

**Files:**
- Create: `src/lib/data/catalog.ts`
- Test: `src/lib/data/catalog.test.ts`

**Interfaces:**
- Consumes: `mapProduct`, `mapCollection`, `mapProject`, `ProductDoc`, `CollectionDoc`, `ProjectDoc` from `./catalog.map`; `getPayload` from `payload`; `config` from `@payload-config`.
- Produces:
  - `getProducts(): Promise<Product[]>`
  - `getProductBySlug(slug: string): Promise<Product | null>`
  - `getCollections(): Promise<Collection[]>`
  - `getProjects(): Promise<Project[]>`

- [ ] **Step 1: Write the failing test**

Create `src/lib/data/catalog.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { findMock } = vi.hoisted(() => ({ findMock: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ find: findMock })) }));

import { getProducts, getProductBySlug, getCollections, getProjects } from "./catalog";

beforeEach(() => findMock.mockReset());

const productDoc = {
  id: 1, slug: "a", name: "A", pricePerM2: 100, thicknessMm: "8", collectionRef: 10,
};

describe("getProducts", () => {
  it("queries published products and maps them", async () => {
    findMock.mockResolvedValue({ docs: [productDoc] });
    const result = await getProducts();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
    expect(result[0].thicknessMm).toBe(8);
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "products", where: { status: { equals: "published" } } }),
    );
  });
});

describe("getProductBySlug", () => {
  it("returns null when no product matches", async () => {
    findMock.mockResolvedValue({ docs: [] });
    expect(await getProductBySlug("missing")).toBeNull();
  });

  it("maps the first matching doc", async () => {
    findMock.mockResolvedValue({ docs: [productDoc] });
    const p = await getProductBySlug("a");
    expect(p?.slug).toBe("a");
  });
});

describe("getCollections", () => {
  it("builds productIds from the inverse collectionRef", async () => {
    findMock
      .mockResolvedValueOnce({ docs: [{ id: 10, slug: "c", name: "C", description: "d" }] })
      .mockResolvedValueOnce({ docs: [productDoc] });
    const cols = await getCollections();
    expect(cols[0].productIds).toEqual(["1"]);
  });
});

describe("getProjects", () => {
  it("maps project docs", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "p", title: "P", productRefs: [10] }] });
    const projects = await getProjects();
    expect(projects[0].productId).toBe("10");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/data/catalog.test.ts`
Expected: FAIL — cannot find module `./catalog`.

- [ ] **Step 3: Write the repository**

Create `src/lib/data/catalog.ts`:

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import type { Product, Collection, Project } from "@/lib/types";
import {
  mapProduct,
  mapCollection,
  mapProject,
  type ProductDoc,
  type CollectionDoc,
  type ProjectDoc,
} from "./catalog.map";

const PUBLISHED = { status: { equals: "published" } } as const;

export async function getProducts(): Promise<Product[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: PUBLISHED,
    limit: 200,
    depth: 0,
  });
  return (res.docs as unknown as ProductDoc[]).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 0,
  });
  const doc = res.docs[0] as unknown as ProductDoc | undefined;
  return doc ? mapProduct(doc) : null;
}

export async function getCollections(): Promise<Collection[]> {
  const payload = await getPayload({ config });
  const [cols, prods] = await Promise.all([
    payload.find({ collection: "collections", limit: 100, depth: 0 }),
    payload.find({ collection: "products", where: PUBLISHED, limit: 200, depth: 0 }),
  ]);
  const productDocs = prods.docs as unknown as ProductDoc[];
  return (cols.docs as unknown as CollectionDoc[]).map((c) => mapCollection(c, productDocs));
}

export async function getProjects(): Promise<Project[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({ collection: "projects", limit: 100, depth: 0 });
  return (res.docs as unknown as ProjectDoc[]).map(mapProject);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/data/catalog.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/catalog.ts src/lib/data/catalog.test.ts
git commit -m "feat: add Payload-backed catalog repository"
```

---

### Task 3: Seed script

**Files:**
- Create: `src/seed.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: `PRODUCTS`, `COLLECTIONS`, `PROJECTS` from `./lib/mock-data`; `getPayload` from `payload`; `config` from `../payload.config`.
- Produces: a runnable `pnpm seed` that idempotently upserts collections → products → projects by `slug`.

> NOTE: This task requires a reachable Postgres (`DATABASE_URL` set in `.env`). If no DB is available in the worker environment, complete Steps 1–2 (write the script + script entry), commit, and flag the run (Step 3) as a manual follow-up — do not fake a passing run.

- [ ] **Step 1: Write the seed script**

Create `src/seed.ts` (relative imports — `payload run` does not resolve the `@/` / `@payload-config` aliases):

```ts
import { getPayload } from "payload";
import config from "../payload.config";
import { PRODUCTS, COLLECTIONS, PROJECTS } from "./lib/mock-data";

// Idempotent: every entity is upserted by its unique `slug`, so re-running
// never creates duplicates. Order matters for relationships:
// collections -> products (collectionRef) -> projects (productRefs).
async function seed() {
  const payload = await getPayload({ config });

  // 1. Collections
  const collectionIdBySlug = new Map<string, number | string>();
  for (const c of COLLECTIONS) {
    const data = { name: c.name, slug: c.slug, description: c.description };
    const existing = await payload.find({
      collection: "collections",
      where: { slug: { equals: c.slug } },
      limit: 1,
    });
    const id = existing.docs.length
      ? (await payload.update({ collection: "collections", id: existing.docs[0].id, data })).id
      : (await payload.create({ collection: "collections", data })).id;
    collectionIdBySlug.set(c.slug, id);
  }

  // Invert the collection->productIds mock relation into product mock-id -> collection slug.
  const collectionSlugByProductMockId = new Map<string, string>();
  for (const c of COLLECTIONS) {
    for (const pid of c.productIds) collectionSlugByProductMockId.set(pid, c.slug);
  }

  // 2. Products
  const productIdByMockId = new Map<string, number | string>();
  for (const p of PRODUCTS) {
    const colSlug = collectionSlugByProductMockId.get(p.id);
    const collectionRef = colSlug ? collectionIdBySlug.get(colSlug) : undefined;
    const data = {
      name: p.name,
      slug: p.slug,
      pricePerM2: p.pricePerM2,
      thicknessMm: String(p.thicknessMm), // select expects '8' | '12'
      waterproof: p.waterproof,
      color: p.color,
      surface: p.surface,
      roomTypes: p.roomTypes,
      specs: p.specs,
      status: "published",
      ...(collectionRef ? { collectionRef } : {}),
    };
    const existing = await payload.find({
      collection: "products",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    const id = existing.docs.length
      ? (await payload.update({ collection: "products", id: existing.docs[0].id, data })).id
      : (await payload.create({ collection: "products", data })).id;
    productIdByMockId.set(p.id, id);
  }

  // 3. Projects
  for (const j of PROJECTS) {
    const productRef = productIdByMockId.get(j.productId);
    const data = {
      title: j.title,
      slug: j.slug,
      location: j.location,
      areaM2: j.areaM2,
      ...(productRef ? { productRefs: [productRef] } : {}),
    };
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: j.slug } },
      limit: 1,
    });
    if (existing.docs.length) {
      await payload.update({ collection: "projects", id: existing.docs[0].id, data });
    } else {
      await payload.create({ collection: "projects", data });
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${COLLECTIONS.length} collections, ${PRODUCTS.length} products, ${PROJECTS.length} projects.`,
  );
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the `seed` script**

In `package.json`, add to `scripts` (after `generate:importmap`):

```json
    "seed": "cross-env NODE_OPTIONS=--no-deprecation payload run src/seed.ts",
```

- [ ] **Step 3: Run the seed (requires DATABASE_URL)**

Run: `pnpm seed`
Expected: `Seeded 2 collections, 8 products, 8 projects.` — wait, PRODUCTS has 8 and PROJECTS has 2 → expect `Seeded 2 collections, 8 products, 2 projects.`
Then run it a SECOND time and confirm the same line (no duplicates — verify in `/admin` that counts are unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/seed.ts package.json
git commit -m "feat: add idempotent catalog seed script"
```

---

### Task 4: Catalog list page + ProductFilters prop

**Files:**
- Modify: `src/components/ProductFilters.tsx`
- Modify: `src/app/(app)/products/page.tsx`

**Interfaces:**
- Consumes: `getProducts` from `@/lib/data/catalog`; `Product` from `@/lib/types`.
- Produces: `ProductFilters` now takes `{ products: Product[] }`.

- [ ] **Step 1: Change `ProductFilters` to accept a `products` prop**

In `src/components/ProductFilters.tsx`:

Replace the import line:
```ts
import { PRODUCTS } from "@/lib/mock-data";
```
with:
```ts
import type { Product } from "@/lib/types";
```

Delete the module-level derived options (lines 16–19):
```ts
const ALL_COLORS = Array.from(new Set(PRODUCTS.map((p) => p.color)));
const ALL_ROOMS = Array.from(
  new Set(PRODUCTS.flatMap((p) => p.roomTypes)),
).sort();
```

Replace the `applyFilters` helper so it takes the product list:
```ts
function applyFilters(products: Product[], f: FilterState) {
  return products.filter((p) => {
    if (f.color && p.color !== f.color) return false;
    if (f.thicknessMm !== null && p.thicknessMm !== f.thicknessMm) return false;
    if (f.waterproof !== null && p.waterproof !== f.waterproof) return false;
    if (f.room && !p.roomTypes.includes(f.room)) return false;
    if (f.maxPrice !== null && p.pricePerM2 > f.maxPrice) return false;
    return true;
  });
}
```

Change the component signature and derive options from props:
```ts
export function ProductFilters({ products }: { products: Product[] }) {
  const ALL_COLORS = useMemo(
    () => Array.from(new Set(products.map((p) => p.color))),
    [products],
  );
  const ALL_ROOMS = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.roomTypes))).sort(),
    [products],
  );

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
```
(keep the rest of the existing state declarations unchanged).

Update the two `applyFilters` call sites to pass `products`:
```ts
  const filtered = useMemo(() => {
    const results = applyFilters(products, filters);
    if (sort === "price-asc") return [...results].sort((a, b) => a.pricePerM2 - b.pricePerM2);
    if (sort === "price-desc") return [...results].sort((a, b) => b.pricePerM2 - a.pricePerM2);
    return results;
  }, [products, filters, sort]);

  const draftCount = useMemo(() => applyFilters(products, draft).length, [products, draft]);
```

- [ ] **Step 2: Make the catalog page an async server component**

Replace the entire `src/app/(app)/products/page.tsx` with:

```tsx
import { ProductFilters } from "@/components/ProductFilters";
import { BottomActionBar } from "@/components/site/BottomActionBar";
import { getProducts } from "@/lib/data/catalog";

export const revalidate = 3600;

export const metadata = {
  title: "Sản phẩm — FUKIONE",
  description: "Xem toàn bộ sàn gỗ FUKIONE. Lọc theo màu sắc, độ dày, chống nước, phòng và giá.",
};

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <>
      <ProductFilters products={products} />
      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia" />
    </>
  );
}
```

- [ ] **Step 3: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: no errors. (Component has no unit test; correctness is covered by the e2e in Task 9.)

- [ ] **Step 4: Run the unit suite (ensure nothing else broke)**

Run: `pnpm test`
Expected: PASS (existing + Task 1/2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductFilters.tsx "src/app/(app)/products/page.tsx"
git commit -m "feat: source catalog list from Payload via props"
```

---

### Task 5: Product detail page

**Files:**
- Modify: `src/app/(app)/products/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProducts`, `getProductBySlug`, `getCollections` from `@/lib/data/catalog`; `Product` from `@/lib/types`.

- [ ] **Step 1: Rewrite the detail page to read from the repository**

In `src/app/(app)/products/[slug]/page.tsx`:

Replace the import:
```ts
import { PRODUCTS, COLLECTIONS } from "@/lib/mock-data";
```
with:
```ts
import type { Product } from "@/lib/types";
import { getProducts, getProductBySlug, getCollections } from "@/lib/data/catalog";
```

Add the revalidate export directly under the `PageParams` type:
```ts
export const revalidate = 3600;
```

Replace `generateStaticParams`:
```ts
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}
```

Replace `generateMetadata` body lookup:
```ts
export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — FUKIONE`,
    description: `${product.name} — ${formatVnd(product.pricePerM2)}/m². Sàn gỗ cao cấp tại Hà Nội, lắp đặt trọn gói.`,
  };
}
```

Replace the start of `ProductDetailPage` (the lookup + related block) with:
```ts
export default async function ProductDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [collections, all] = await Promise.all([getCollections(), getProducts()]);
  const collection = collections.find((c) => c.productIds.includes(product.id));
  const related: Product[] = (
    collection
      ? all.filter((p) => collection.productIds.includes(p.id) && p.id !== product.id)
      : all.filter((p) => p.id !== product.id)
  ).slice(0, 4);
```
(the JSX below `return (` is unchanged).

- [ ] **Step 2: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/products/[slug]/page.tsx"
git commit -m "feat: source product detail from Payload"
```

---

### Task 6: Home page

**Files:**
- Modify: `src/app/(app)/page.tsx`

**Interfaces:**
- Consumes: `getProducts`, `getCollections`, `getProjects` from `@/lib/data/catalog`.

- [ ] **Step 1: Move data into the async component**

In `src/app/(app)/page.tsx`:

Replace the import:
```ts
import { PRODUCTS, COLLECTIONS, PROJECTS } from "@/lib/mock-data";
```
with:
```ts
import { getProducts, getCollections, getProjects } from "@/lib/data/catalog";
```

Delete the five module-level data consts (lines 8–12):
```ts
const featured = PRODUCTS.slice(0, 3);
const heroProduct = PRODUCTS[0];
const collections = COLLECTIONS.slice(0, 2);
const projects = PROJECTS.slice(0, 4);
const leadProject = projects[0];
```

Add `revalidate` and make the component async, recomputing those locals from the repository:
```ts
export const revalidate = 3600;

export default async function HomePage() {
  const [products, allCollections, allProjects] = await Promise.all([
    getProducts(),
    getCollections(),
    getProjects(),
  ]);
  const featured = products.slice(0, 3);
  const heroProduct = products[0];
  const collections = allCollections.slice(0, 2);
  const projects = allProjects.slice(0, 4);
  const leadProject = projects[0];

  return (
```
(rest of JSX unchanged).

- [ ] **Step 2: Guard the hero caption against an empty catalog**

The floating caption block dereferences `heroProduct.name`/`heroProduct.pricePerM2`. Wrap it so an unseeded DB cannot crash the home page. Change:
```tsx
              {/* Floating product caption */}
              <div className="absolute -bottom-6 -left-6 hidden w-60 rounded-2xl border border-line bg-surface/95 p-4 shadow-card backdrop-blur sm:block">
                <p className="text-[12px] font-medium text-muted">Đang bán chạy</p>
                <p className="mt-0.5 font-display text-lg font-semibold text-ink">
                  {heroProduct.name}
                </p>
                <p className="mt-1 text-[15px] font-extrabold text-cta-ink">
                  {formatVnd(heroProduct.pricePerM2)}
                  <span className="text-[12px] font-medium text-muted">/m²</span>
                </p>
              </div>
```
to wrap the whole block in `{heroProduct && ( ... )}`:
```tsx
              {/* Floating product caption */}
              {heroProduct && (
                <div className="absolute -bottom-6 -left-6 hidden w-60 rounded-2xl border border-line bg-surface/95 p-4 shadow-card backdrop-blur sm:block">
                  <p className="text-[12px] font-medium text-muted">Đang bán chạy</p>
                  <p className="mt-0.5 font-display text-lg font-semibold text-ink">
                    {heroProduct.name}
                  </p>
                  <p className="mt-1 text-[15px] font-extrabold text-cta-ink">
                    {formatVnd(heroProduct.pricePerM2)}
                    <span className="text-[12px] font-medium text-muted">/m²</span>
                  </p>
                </div>
              )}
```

- [ ] **Step 3: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/page.tsx"
git commit -m "feat: source home page content from Payload"
```

---

### Task 7: Quote page + CalculatorWidget products prop

**Files:**
- Modify: `src/components/CalculatorWidget.tsx`
- Modify: `src/app/(app)/quote/page.tsx`

**Interfaces:**
- Consumes: `getProducts` from `@/lib/data/catalog`; `Product` from `@/lib/types`.
- Produces: `CalculatorWidget` props become `{ product?: Product; products?: Product[]; variant: "embedded" | "page" }`.

- [ ] **Step 1: Make `CalculatorWidget` take an optional `products` prop**

In `src/components/CalculatorWidget.tsx`:

Remove the mock import:
```ts
import { PRODUCTS } from "@/lib/mock-data";
```

Extend the props interface:
```ts
interface CalculatorWidgetProps {
  /**
   * Embedded variant: pre-fills and locks the product selector.
   * Page variant: renders a product <select> over `products`.
   */
  product?: Product;
  /** Catalog for the page variant's <select>. Ignored when `product` is set. */
  products?: Product[];
  variant: "embedded" | "page";
}

export function CalculatorWidget({ product, products, variant }: CalculatorWidgetProps) {
  const list = products ?? [];
  const [selectedId, setSelectedId] = useState<string>(product?.id ?? list[0]?.id ?? "");
  const [areaM2, setAreaM2] = useState<number>(25);
  const [withInstall, setWithInstall] = useState<boolean>(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeProduct = product ?? list.find((p) => p.id === selectedId) ?? list[0];

  // Nothing to calculate without a product (e.g. unseeded catalog on the page variant).
  if (!activeProduct) return null;
```

Replace the `<select>`'s `PRODUCTS.map` with `list.map`:
```tsx
              {list.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatVnd(p.pricePerM2)}/m²
                </option>
              ))}
```
(The `estimateCost` call and the `LeadFormSheet context={{ productId: activeProduct.id, ... }}` block are unchanged — `activeProduct.id` is now a real Payload id.)

- [ ] **Step 2: Feed the page-variant calculator from Payload**

Replace `src/app/(app)/quote/page.tsx` with:

```tsx
import { CalculatorWidget } from "@/components/CalculatorWidget";
import { getProducts } from "@/lib/data/catalog";

export const revalidate = 3600;

export const metadata = {
  title: "Tính chi phí sàn gỗ | FUKIONE",
  description:
    "Tính nhanh chi phí sàn gỗ theo diện tích — vật liệu, lắp đặt, phào nẹp. Nhận báo giá trong ngày.",
};

export default async function BaoGiaPage() {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-6 bg-bg px-4 pt-6 max-w-xl mx-auto">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-ink">
          Tính chi phí sàn gỗ
        </h1>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Nhập diện tích và chọn sản phẩm — tạm tính ngay lập tức.
          <br />
          Báo giá chính xác sau khi khảo sát thực tế.
        </p>
      </div>

      <CalculatorWidget variant="page" products={products} />
    </div>
  );
}
```

- [ ] **Step 3: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/CalculatorWidget.tsx "src/app/(app)/quote/page.tsx"
git commit -m "feat: feed the page-variant calculator from Payload"
```

---

### Task 8: Re-enable productId on lead submit

**Files:**
- Modify: `src/components/LeadFormSheet.tsx`
- Modify: `src/app/(app)/api/leads/route.test.ts`

**Interfaces:**
- Consumes: existing `LeadContext.productId` (already populated by `CalculatorWidget` with the real product id).

- [ ] **Step 1: Add the failing test for productId forwarding**

In `src/app/(app)/api/leads/route.test.ts`, add a test inside the `describe("POST /api/leads", ...)` block:

```ts
  it("forwards productId to the DB create when provided", async () => {
    createMock.mockResolvedValue({ id: 11 });
    await POST(post({ ...valid, source: "calculator", productId: "3" }));
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        data: expect.objectContaining({ productId: "3" }),
      }),
    );
  });
```

- [ ] **Step 2: Run it to verify the test passes against the existing route**

Run: `pnpm test src/app/\(app\)/api/leads/route.test.ts`
Expected: PASS — the route already destructures and persists `productId`; this test pins the behavior so re-enabling it on the client is safe.

> If this test FAILS, stop — the route is not forwarding `productId` and the plan's assumption is wrong; investigate `route.ts` before continuing.

- [ ] **Step 3: Send the real productId from the form**

In `src/components/LeadFormSheet.tsx`, in the `fetch` body, replace the omission comment line:
```ts
          // productId intentionally omitted until products are DB-backed (relationship to an unseeded table would fail). Product name is captured in message instead.
```
with:
```ts
          productId: context?.productId,
```

- [ ] **Step 4: Verify lint, types, and the full suite**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/LeadFormSheet.tsx "src/app/(app)/api/leads/route.test.ts"
git commit -m "feat: attach the real productId to calculator leads"
```

---

### Task 9: e2e + full verification

**Files:**
- Read/adjust if needed: `e2e/**` (the "filter products → view detail" golden flow).

> Requires a reachable, seeded Postgres (`DATABASE_URL`). If the worker has no DB, run Steps 1–2 where possible and flag Steps 3–4 as a manual follow-up — do not claim success without the command output.

- [ ] **Step 1: Confirm the catalog still serves the seeded SKUs**

With the dev server running (`pnpm dev`) and the DB seeded (Task 3), the 8 SKU names are identical to the previous mock data, so existing e2e selectors should not need changes. Read the catalog/detail e2e spec under `e2e/` and confirm it references product names/slugs (e.g. `san-go-walnut`), not the old mock ids (`p1`…`p8`). If any spec hard-codes a mock id, update it to the slug/name.

- [ ] **Step 2: Run the unit + integration suite**

Run: `pnpm test`
Expected: PASS (all suites, including the new mapper + repository tests).

- [ ] **Step 3: Run the e2e golden flows**

Run: `pnpm test:e2e`
Expected: the "filter products → view detail" and lead-funnel flows PASS against seeded data.

- [ ] **Step 4: Production build (proves the build-time DB read works)**

Run: `pnpm build`
Expected: build succeeds; `generateStaticParams` reads the seeded products from the DB (confirms the `DATABASE_URL`-at-build requirement is satisfied). If it fails with a DB connection error, ensure `DATABASE_URL` is present in the build environment.

- [ ] **Step 5: Final commit (if any e2e selector changed)**

```bash
git add e2e/
git commit -m "test: align catalog e2e with DB-backed slugs"
```

---

## Self-Review

**Spec coverage:**
- §3 repository keeping types as boundary → Tasks 1–2. ✓
- §4.1 `getProducts/getProductBySlug/getCollections/getProjects` → Task 2. ✓
- §4.2 idempotent seed from mock-data via `pnpm seed` → Task 3. ✓
- §4.3 page changes + `revalidate = 3600` (home, catalog, detail, quote) → Tasks 4–7. ✓
- §4.4 `ProductFilters` products prop → Task 4. ✓
- §4.5 re-enable `productId` → Task 8. ✓
- §2 schema-vs-type mappings (thickness string→number, collectionRef inverse, productRefs→productId, images empty, id→string) → Task 1 mappers + tests. ✓
- §6 error handling (empty → notFound / empty render; build-time DB) → `getProductBySlug` null path (Task 5), hero guard (Task 6), Task 9 Step 4. ✓
- §7 testing (unit mappers, integration repository, e2e) → Tasks 1, 2, 9. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**Type consistency:** `getProducts/getProductBySlug/getCollections/getProjects`, `mapProduct/mapCollection/mapProject`, `ProductDoc/CollectionDoc/ProjectDoc`, and the `ProductFilters({ products })` / `CalculatorWidget({ product, products, variant })` signatures are used identically across tasks. ✓

**Note on `productId` type:** ids cross the wire as strings (`schema.ts` keeps `productId: z.string().optional()`); Payload coerces the numeric string to the relationship's integer id. Task 8 Step 2 pins forwarding; Task 9 e2e exercises a real end-to-end submit.
