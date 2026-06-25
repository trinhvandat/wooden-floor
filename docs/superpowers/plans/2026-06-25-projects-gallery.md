# Projects Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the M4-B projects gallery — a `/du-an` grid + `/du-an/[slug]` detail pages showing completed installations as social proof, cross-linking the products used back to the catalog.

**Architecture:** Completes existing scaffolding. Finishes the stubbed `Project` type / `mapProject` / `getProjects` data layer, adds a `status` field to the `Projects` collection, adds two Next.js routes (English folders + Vietnamese rewrites), a `ProjectCard`, repoints the nav, and wires SEO (sitemap + breadcrumb JSON-LD). Images render via `next/image` when present, falling back to the wood gradient otherwise.

**Tech Stack:** Next.js 16 (App Router, SSG/ISR), Payload CMS 3, TypeScript (strict), Tailwind, Zod (unaffected), Vitest.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-06-25-projects-gallery-design.md` — authoritative.
- **Branch:** `feat/projects-gallery` (already checked out). Commit per task; save memory on-branch before the PR push.
- **Public URLs are Vietnamese-no-accent:** route folders are English (`app/(app)/projects/...`), public URLs are `/du-an` + `/du-an/[slug]` via `next.config.ts` rewrites. Internal `<Link href>` uses the Vietnamese URL.
- **Payload-generated artifacts** (types, migrations, `/admin`) are generated — never hand-edit; change the collection schema, codegen runs before the TS/Next build.
- **Prices/units** live in `Settings` — not touched here.
- **Repo artifacts in English** (code, comments, commits); Vietnamese only in user-facing UI strings.
- **Gradient fallback token:** `bg-gradient-to-br from-wood-soft to-wood` (matches the catalog) wherever a project has no image.
- **Verification gate before PR:** `pnpm tsc --noEmit` 0 · `pnpm lint` 0 · `pnpm test` green · `pnpm build` succeeds · Playwright spot-check at 375px + 1440px with 0 console errors.
- All `pnpm` commands run from `fukione-web/`.

---

### Task 1: Data foundation — `status` field, `Project` type, mapper, data layer (+ consumer fixes)

The `Project` type rename (`productId` → `productIds`) ripples through several files; this task keeps the repo green by updating every consumer together. It is the only unit-tested task (TDD on the mapper + data layer).

**Files:**
- Modify: `fukione-web/src/collections/Projects.ts`
- Modify: `fukione-web/src/lib/types.ts`
- Modify: `fukione-web/src/lib/data/catalog.map.ts`
- Modify: `fukione-web/src/lib/data/catalog.ts`
- Modify: `fukione-web/src/lib/mock-data.ts`
- Modify: `fukione-web/src/seed.ts`
- Test: `fukione-web/src/lib/data/catalog.map.test.ts`
- Test: `fukione-web/src/lib/data/catalog.test.ts`

**Interfaces:**
- Produces: `Project` (`{ id, slug, title, description, location, areaM2, productIds: string[], images: ProjectImage[] }`), `ProjectImage` (`{ url: string; alt: string }`), `mapProject(doc: ProjectDoc): Project`, `getProjects(): Promise<Project[]>`, `getProjectBySlug(slug: string): Promise<Project | null>`.

- [ ] **Step 1: Write the failing mapper tests**

Replace the entire `describe("mapProject", ...)` block (currently the last block) in `fukione-web/src/lib/data/catalog.map.test.ts` with:

```ts
describe("mapProject", () => {
  it("maps all productRefs to productIds and populated images to {url, alt}", () => {
    const doc: ProjectDoc = {
      id: 7,
      slug: "villa",
      title: "Villa",
      description: "desc",
      location: "HN",
      areaM2: 220,
      productRefs: [{ id: 3 }, 5],
      images: [
        { id: 1, url: "/m/a.jpg", alt: "A" },
        { id: 2, url: "/m/b.jpg", alt: "" },
      ],
    };
    const j = mapProject(doc);
    expect(j.productIds).toEqual(["3", "5"]);
    expect(j.images).toEqual([
      { url: "/m/a.jpg", alt: "A" },
      { url: "/m/b.jpg", alt: "" },
    ]);
    expect(j.description).toBe("desc");
    expect(j.areaM2).toBe(220);
  });

  it("defaults to empty arrays/strings and skips images without a url", () => {
    const j = mapProject({ id: 8, slug: "s", title: "S", images: [3, { id: 4 }] });
    expect(j.productIds).toEqual([]);
    expect(j.images).toEqual([]);
    expect(j.description).toBe("");
    expect(j.location).toBe("");
  });
});
```

- [ ] **Step 2: Run the mapper tests to verify they fail**

Run: `pnpm test catalog.map`
Expected: FAIL — `mapProject` returns `productId`/no `images`; assertions on `productIds`/`images`/`description` fail (and TS error on `ProjectDoc.images`/`description`).

- [ ] **Step 3: Add `ProjectImage` to the `Project` type**

In `fukione-web/src/lib/types.ts`, replace the `Project` type block:

```ts
export type ProjectImage = { url: string; alt: string };

export type Project = {
  id: string;
  slug: string;
  /** Vietnamese project title */
  title: string;
  description: string;
  location: string;
  areaM2: number;
  productIds: string[];
  images: ProjectImage[];
};
```

- [ ] **Step 4: Extend `ProjectDoc` + rewrite `mapProject`**

In `fukione-web/src/lib/data/catalog.map.ts`: ensure `ProjectImage` is imported from `@/lib/types` (add it to the existing types import). Replace the `ProjectDoc` interface and `mapProject` function:

```ts
export interface MediaDoc {
  id: number | string;
  url?: string | null;
  alt?: string | null;
}

export interface ProjectDoc {
  id: number | string;
  slug: string;
  title: string;
  description?: string | null;
  location?: string | null;
  areaM2?: number | null;
  productRefs?: (number | string | { id: number | string })[] | null;
  images?: (number | string | MediaDoc)[] | null;
}

export function mapProject(doc: ProjectDoc): Project {
  const refs = doc.productRefs ?? [];
  const productIds = refs
    .map(refId)
    .filter((id): id is string => id !== null);
  const images = (doc.images ?? [])
    .map((img): ProjectImage | null =>
      typeof img === "object" && img !== null && "url" in img && img.url
        ? { url: img.url, alt: img.alt ?? "" }
        : null,
    )
    .filter((i): i is ProjectImage => i !== null);
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    description: doc.description ?? "",
    location: doc.location ?? "",
    areaM2: doc.areaM2 ?? 0,
    productIds,
    images,
  };
}
```

(`refId` already exists in this file and handles `number | string | { id }`.)

- [ ] **Step 5: Run the mapper tests to verify they pass**

Run: `pnpm test catalog.map`
Expected: PASS (both `mapProject` cases green).

- [ ] **Step 6: Write the failing data-layer tests**

In `fukione-web/src/lib/data/catalog.test.ts`: add `getProjectBySlug` to the import on line 7 (`import { getProducts, getProductBySlug, getCollections, getProjects, getProjectBySlug } from "./catalog";`). Replace the `describe("getProjects", ...)` block at the bottom with:

```ts
describe("getProjects", () => {
  it("maps published project docs", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "p", title: "P", productRefs: [10] }] });
    const projects = await getProjects();
    expect(projects[0].productIds).toEqual(["10"]);
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "projects", where: { status: { equals: "published" } } }),
    );
  });
});

describe("getProjectBySlug", () => {
  it("returns the mapped project when found", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "villa", title: "Villa", productRefs: [10] }] });
    const project = await getProjectBySlug("villa");
    expect(project?.slug).toBe("villa");
    expect(project?.productIds).toEqual(["10"]);
  });

  it("returns null when not found", async () => {
    findMock.mockResolvedValue({ docs: [] });
    expect(await getProjectBySlug("nope")).toBeNull();
  });
});
```

- [ ] **Step 7: Run the data-layer tests to verify they fail**

Run: `pnpm test catalog.test`
Expected: FAIL — `getProjectBySlug` is not exported; `getProjects` lacks the `PUBLISHED` where clause.

- [ ] **Step 8: Update `getProjects` + add `getProjectBySlug`**

In `fukione-web/src/lib/data/catalog.ts`, replace the `getProjects` function (end of file) with:

```ts
export async function getProjects(): Promise<Project[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "projects",
    where: PUBLISHED,
    limit: 100,
    depth: 1,
  });
  return (res.docs as unknown as ProjectDoc[]).map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "projects",
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  });
  const doc = res.docs[0] as unknown as ProjectDoc | undefined;
  return doc ? mapProject(doc) : null;
}
```

- [ ] **Step 9: Run the data-layer tests to verify they pass**

Run: `pnpm test catalog.test`
Expected: PASS.

- [ ] **Step 10: Add the `status` field to the Projects collection**

In `fukione-web/src/collections/Projects.ts`, add this field as the last entry of the `fields` array (after `productRefs`), mirroring `Products.ts`:

```ts
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
```

- [ ] **Step 11: Update the `PROJECTS` mock to the new type + add 2 samples**

In `fukione-web/src/lib/mock-data.ts`, replace the `PROJECTS` array with (note `productIds`, `description`, and four samples for a fuller grid):

```ts
export const PROJECTS: Project[] = [
  {
    id: "j1",
    slug: "can-ho-vinhomes-ocean-park",
    title: "Căn Hộ Vinhomes Ocean Park",
    description:
      "Lắp đặt sàn gỗ trọn gói cho căn hộ 85m² tại Vinhomes Ocean Park, Gia Lâm.",
    location: "Gia Lâm, Hà Nội",
    areaM2: 85,
    productIds: ["p3", "p7"],
    images: [],
  },
  {
    id: "j2",
    slug: "villa-ecopark",
    title: "Villa Ecopark",
    description: "Thi công sàn gỗ cao cấp cho villa 220m² tại Ecopark, Văn Giang.",
    location: "Văn Giang, Hưng Yên",
    areaM2: 220,
    productIds: ["p7"],
    images: [],
  },
  {
    id: "j3",
    slug: "nha-pho-times-city",
    title: "Nhà Phố Times City",
    description: "Sàn gỗ chống nước cho nhà phố 120m² tại Times City, Hai Bà Trưng.",
    location: "Hai Bà Trưng, Hà Nội",
    areaM2: 120,
    productIds: ["p3"],
    images: [],
  },
  {
    id: "j4",
    slug: "can-ho-royal-city",
    title: "Căn Hộ Royal City",
    description: "Lắp đặt sàn gỗ phòng khách + phòng ngủ cho căn hộ 95m² tại Royal City.",
    location: "Thanh Xuân, Hà Nội",
    areaM2: 95,
    productIds: [],
    images: [],
  },
];
```

(If `tsc` reports `p3`/`p7` mismatches, they reference the same mock product ids used by the original projects; keep them. Unknown ids are safely dropped by the seed.)

- [ ] **Step 12: Update the seed project loop**

In `fukione-web/src/seed.ts`, replace the body of the `// 3. Projects` loop (the `const data = {...}` block and the `productRef` line above it) with:

```ts
  // 3. Projects
  for (const j of PROJECTS) {
    const productRefs = j.productIds
      .map((id) => productIdByMockId.get(id))
      .filter((id): id is number | string => id != null);
    const data = {
      title: j.title,
      slug: j.slug,
      description: j.description,
      location: j.location,
      areaM2: j.areaM2,
      status: "published" as const,
      ...(productRefs.length ? { productRefs } : {}),
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
```

- [ ] **Step 13: Regenerate Payload types + typecheck the whole repo**

Run: `pnpm build` (runs Payload codegen first, regenerating `payload-types.ts` with the new `status` field, then the TS/Next build).
Expected: build succeeds, 0 type errors. If `data` fails to typecheck in `seed.ts`, confirm codegen ran and `status`/`description` exist on the generated `Project` type.

- [ ] **Step 14: Run the full unit suite**

Run: `pnpm test`
Expected: all green (previous 43 + the updated project tests).

- [ ] **Step 15: Commit**

```bash
git add fukione-web/src/collections/Projects.ts fukione-web/src/lib/types.ts \
  fukione-web/src/lib/data/catalog.map.ts fukione-web/src/lib/data/catalog.ts \
  fukione-web/src/lib/mock-data.ts fukione-web/src/seed.ts \
  fukione-web/src/lib/data/catalog.map.test.ts fukione-web/src/lib/data/catalog.test.ts \
  fukione-web/src/payload-types.ts
git commit -m "feat: complete projects data layer (status field, productIds, images)"
```

---

### Task 2: ProjectCard + `/du-an` grid page + rewrite + nav repoint

Deliverable: `/du-an` renders a published-projects grid (gradient fallbacks), reachable from the nav.

**Files:**
- Create: `fukione-web/src/components/ProjectCard.tsx`
- Create: `fukione-web/src/app/(app)/projects/page.tsx`
- Modify: `fukione-web/next.config.ts`
- Modify: `fukione-web/src/components/site/Header.tsx`
- Modify: `fukione-web/src/components/site/MobileNav.tsx`

**Interfaces:**
- Consumes: `getProjects()`, `Project`, `ProjectImage` (Task 1).
- Produces: `<ProjectCard project={...} />` linking to `/du-an/[slug]`; the `/du-an` route.

- [ ] **Step 1: Create `ProjectCard`**

Create `fukione-web/src/components/ProjectCard.tsx` (mirrors `ProductCard.tsx`):

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cover = project.images[0];
  return (
    <Link
      href={`/du-an/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,.1)]"
    >
      {/* Image block — wood-tone gradient placeholder when no real photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-wood-soft to-wood">
        {cover && (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        )}
      </div>
      {/* Body */}
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-1 text-[14px] font-extrabold leading-snug text-ink">
          {project.title}
        </p>
        <p className="text-[12.5px] text-muted">{project.location}</p>
        {project.areaM2 > 0 && (
          <p className="text-[12.5px] font-semibold text-cta-ink">{project.areaM2}m²</p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create the grid page**

Create `fukione-web/src/app/(app)/projects/page.tsx`:

```tsx
import { getProjects } from "@/lib/data/catalog";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata = {
  title: "Dự án",
  description: "Công trình sàn gỗ FUKIONE đã hoàn thiện tại Hà Nội và lân cận.",
  alternates: { canonical: "/du-an" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Dự án", path: "/du-an" },
          ],
          SITE_URL,
        )}
      />
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeading withUnderline>Dự án thực tế</SectionHeading>
        {projects.length === 0 ? (
          <p className="mt-8 text-[14px] text-muted">
            Các công trình tiêu biểu sẽ sớm được cập nhật.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add the list rewrite**

In `fukione-web/next.config.ts`, add to the array returned by `rewrites()` (after the `/cam-on` entry):

```ts
      { source: "/du-an", destination: "/projects" },
```

- [ ] **Step 4: Repoint the nav link (both files)**

In `fukione-web/src/components/site/Header.tsx` AND `fukione-web/src/components/site/MobileNav.tsx`, change the `Dự án` entry in the `NAV` array from `href: "/#du-an"` to:

```ts
  { label: "Dự án", href: "/du-an" },
```

- [ ] **Step 5: Build + typecheck**

Run: `pnpm build`
Expected: succeeds; the route list includes `/projects` (served at `/du-an`).

- [ ] **Step 6: Verify the page renders (seed first if DB empty)**

Run (from `fukione-web/`, dev DB):
```bash
pnpm seed   # publishes the 4 sample projects
(pnpm dev > /tmp/du-an-dev.log 2>&1 &) ; sleep 4 ; until curl -sf localhost:3000 >/dev/null; do sleep 1; done
curl -sf localhost:3000/du-an | grep -c "Dự án thực tế"
```
Expected: `1` (page rendered). Stop dev: `kill %1` or the PID in `/tmp/du-an-dev.log`.

- [ ] **Step 7: Commit**

```bash
git add fukione-web/src/components/ProjectCard.tsx \
  "fukione-web/src/app/(app)/projects/page.tsx" \
  fukione-web/next.config.ts \
  fukione-web/src/components/site/Header.tsx fukione-web/src/components/site/MobileNav.tsx
git commit -m "feat: projects gallery grid page at /du-an + nav link"
```

---

### Task 3: `/du-an/[slug]` detail page (gallery, chips, description, product cross-links, SEO)

Deliverable: each project has a detail page with its gallery (or gradient fallback), location/area, description, the products used, page metadata, and breadcrumb JSON-LD.

**Files:**
- Create: `fukione-web/src/app/(app)/projects/[slug]/page.tsx`
- Modify: `fukione-web/next.config.ts`

**Interfaces:**
- Consumes: `getProjectBySlug()`, `getProjects()`, `getProducts()`, `Project`, `Product`, `ProductCard`, `SpecChip`, `SectionHeading`, `buildBreadcrumbJsonLd`, `JsonLd`, `SITE_URL`, `BASE_OPEN_GRAPH`.

- [ ] **Step 1: Create the detail page**

Create `fukione-web/src/app/(app)/projects/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { getProjects, getProjectBySlug, getProducts } from "@/lib/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { SpecChip } from "@/components/SpecChip";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";

// Next.js 16: params is a Promise
type PageParams = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const description =
    project.description || `Công trình sàn gỗ FUKIONE tại ${project.location || "Hà Nội"}.`;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/du-an/${project.slug}` },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${project.title} — FUKIONE`,
      description,
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await getProducts();
  const usedProducts: Product[] = all.filter((p) => project.productIds.includes(p.id));

  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Dự án", path: "/du-an" },
            { name: project.title, path: `/du-an/${project.slug}` },
          ],
          SITE_URL,
        )}
      />
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        {/* Header */}
        <section>
          <h1 className="font-display text-[22px] font-extrabold leading-tight text-ink">
            {project.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.location && <SpecChip>{project.location}</SpecChip>}
            {project.areaM2 > 0 && <SpecChip>{project.areaM2}m²</SpecChip>}
          </div>
          {project.description && (
            <p className="mt-4 text-[14px] leading-relaxed text-muted">{project.description}</p>
          )}
        </section>

        {/* Gallery — real photos, or a single gradient placeholder */}
        <section>
          {project.images.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {project.images.map((img, i) => (
                <div
                  key={img.url}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-gradient-to-br from-wood-soft to-wood"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-card bg-gradient-to-br from-wood-soft to-wood" />
          )}
        </section>

        {/* Products used — cross-link back into the catalog */}
        {usedProducts.length > 0 && (
          <section>
            <SectionHeading withUnderline>Sản phẩm trong dự án</SectionHeading>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {usedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the detail rewrite**

In `fukione-web/next.config.ts`, add directly after the `/du-an` rewrite from Task 2:

```ts
      { source: "/du-an/:slug", destination: "/projects/:slug" },
```

- [ ] **Step 3: Build + typecheck**

Run: `pnpm build`
Expected: succeeds; `generateStaticParams` pre-renders one page per published project.

- [ ] **Step 4: Verify a detail page renders + cross-links**

Run (dev server running, DB seeded):
```bash
(pnpm dev > /tmp/du-an-dev.log 2>&1 &) ; sleep 4 ; until curl -sf localhost:3000 >/dev/null; do sleep 1; done
curl -sf localhost:3000/du-an/can-ho-vinhomes-ocean-park | grep -c "Sản phẩm trong dự án"
```
Expected: `1` (j1 has `productIds: ["p3","p7"]`, so the cross-link section renders). Stop dev afterward.

- [ ] **Step 5: Commit**

```bash
git add "fukione-web/src/app/(app)/projects/[slug]/page.tsx" fukione-web/next.config.ts
git commit -m "feat: project detail page at /du-an/[slug] with product cross-links"
```

---

### Task 4: Homepage teaser link + sitemap entries

Deliverable: the homepage `#du-an` teaser funnels into `/du-an`; the sitemap lists `/du-an` and every published project.

**Files:**
- Modify: `fukione-web/src/app/(app)/page.tsx`
- Modify: `fukione-web/src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getProjects()` (already imported in both files / Task 1).

- [ ] **Step 1: Add the "Xem tất cả" link to the homepage teaser**

In `fukione-web/src/app/(app)/page.tsx`, inside the `#du-an` section, the header row is a `<div className="flex flex-wrap items-end justify-between gap-6">` containing a single `<div className="max-w-xl">…</div>`. Add this `Link` as a sibling immediately after that inner `</div>` (so `justify-between` pushes it to the right):

```tsx
            <Link
              href="/du-an"
              className="text-[13px] font-bold text-cta hover:underline"
            >
              Xem tất cả →
            </Link>
```

Ensure `import Link from "next/link";` is present at the top of the file (add it if missing).

- [ ] **Step 2: Add projects to the sitemap**

In `fukione-web/src/app/sitemap.ts`:
1. Change the import to `import { getProducts, getProjects } from "@/lib/data/catalog";`
2. Add `"/du-an"` to the `staticPaths` array.
3. Before the `return`, add:

```ts
  const projects = await getProjects();
  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: absoluteUrl(`/du-an/${p.slug}`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
```
4. Change the return to `return [...staticEntries, ...productEntries, ...projectEntries];`

- [ ] **Step 3: Build + verify sitemap**

Run:
```bash
pnpm build
(pnpm dev > /tmp/du-an-dev.log 2>&1 &) ; sleep 4 ; until curl -sf localhost:3000 >/dev/null; do sleep 1; done
curl -sf localhost:3000/sitemap.xml | grep -c "/du-an"
```
Expected: ≥ `5` (the `/du-an` static path + 4 seeded project detail URLs). Stop dev afterward.

- [ ] **Step 4: Commit**

```bash
git add "fukione-web/src/app/(app)/page.tsx" fukione-web/src/app/sitemap.ts
git commit -m "feat: link homepage teaser to /du-an and add projects to sitemap"
```

---

### Task 5: Full verification gate + design spot-check

Deliverable: evidence the whole slice is green before the PR.

**Files:** none (verification only).

- [ ] **Step 1: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: 0 errors (the 2 pre-existing `seed.ts` warnings are acceptable; do not introduce new ones).

- [ ] **Step 3: Unit + integration tests**

Run: `pnpm test`
Expected: all green.

- [ ] **Step 4: Production build**

Run: `pnpm build`
Expected: succeeds; route list includes `/projects` and `/projects/[slug]`.

- [ ] **Step 5: Playwright spot-check (375px + 1440px)**

With the dev server running and DB seeded, navigate via the Playwright MCP to `/du-an` and `/du-an/can-ho-vinhomes-ocean-park` at **375px first**, then **1440px**. Screenshot each into a pre-created `fukione-web/tmp-shots/` (absolute path), compare against `.claude/context/design-principles.md` + `style-guide.md`, and confirm **0 console errors**. Clean up: `git clean -fdx fukione-web/tmp-shots`. (See the `playwright-mcp-screenshot-paths` convention.)

- [ ] **Step 6: Save memory on-branch, then it's PR-ready**

Run the `/save-memory` skill (records the projects-gallery slice + the `productId`→`productIds` type change + status/seed coupling), commit the memory on `feat/projects-gallery`, then open the PR so memory ships in the same PR. Run `/review-pr` after the PR exists.

---

## Self-Review

**Spec coverage:**
- §3.1 status field → Task 1 Step 10. ✓
- §3.2 type/mapper/data-layer + ripple (mock-data, seed, both test files) → Task 1 Steps 3–12. ✓
- §3.3 routes + rewrites → Task 2 (grid + `/du-an` rewrite), Task 3 (detail + `/du-an/:slug` rewrite). ✓
- §3.4 ProjectCard + gradient fallback → Task 2 Step 1; detail gallery fallback → Task 3 Step 1. ✓
- §3.5 nav repoint + homepage teaser link → Task 2 Step 4, Task 4 Step 1. ✓
- §3.6 seed status:published + enriched mock → Task 1 Steps 11–12. ✓
- §3.7 sitemap + breadcrumb JSON-LD + metadata → Task 4 Step 2 (sitemap); Task 2/3 (JSON-LD + metadata). ✓
- §4 mapProject unit test + gates → Task 1 Steps 1–9, Task 5. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every test step shows assertions. ✓

**Type consistency:** `Project.productIds: string[]` / `ProjectImage {url, alt}` defined in Task 1 Step 3 and used identically in `mapProject` (1.4), `ProjectCard` (2.1), detail page (3.1), and tests. `getProjectBySlug` signature consistent across 1.8, 3.1, catalog.test. ✓
