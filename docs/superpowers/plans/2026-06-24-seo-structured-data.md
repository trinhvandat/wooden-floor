# Technical SEO + Structured Data (M4-A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make FUKIONE's existing pages SEO-complete — `metadataBase` + canonical/OG, dynamic `sitemap.xml`, `robots.txt`, and JSON-LD (LocalBusiness, Product, BreadcrumbList) — with no new routes or content.

**Architecture:** A `SITE_URL` single source + pure JSON-LD builders (`lib/seo/jsonld.ts`, unit-tested) rendered by a thin `<JsonLd>` server component, mirroring M2's pure-mapper/repository split. `sitemap.ts`/`robots.ts` use Next file conventions. Canonical and sitemap URLs use the Vietnamese public paths.

**Tech Stack:** Next.js 16 App Router (Metadata API, `MetadataRoute`), TypeScript strict, Vitest 4 (node env), Payload-backed `getProducts()`, `sharp` (placeholder OG image).

## Global Constraints

- All code/comments in English; Vietnamese only in user-facing copy strings.
- **Canonical and sitemap URLs use the Vietnamese public paths** (`/san-pham`, `/bao-gia`, `/dat-lich-khao-sat`, `/san-pham/<slug>`), never the English route-folder names — per `vn-urls-via-next-rewrites`.
- Base URL: `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`. Only `.env.example` is editable; `.env`/`.env.local` are read-only.
- NAP comes from the mock `src/lib/settings.ts` `SETTINGS` (do NOT DB-back the Payload `settings` global in this plan).
- `pnpm exec tsc --noEmit` must report **0 errors** (M2 left it fully green — keep it green).
- Vitest 4, env `node`, no globals — import from `"vitest"`; wrap `vi.mock` refs in `vi.hoisted()` (per `vitest4-vi-hoisted`).
- `sitemap.ts` and `robots.ts` live at `src/app/` root (NOT inside the `(app)` route group) so they serve at `/sitemap.xml` and `/robots.txt`.
- All commands run from `fukione-web/`. Branch: `feat/seo-structured-data`.
- `pnpm build` reads the DB at build (sitemap + generateStaticParams) → it is a DB-gated step deferred to verification; per-task gates are `pnpm lint` + `pnpm exec tsc --noEmit` + `pnpm test`.

---

## File Structure

- `src/lib/seo/site.ts` (new) — `SITE_URL` + `absoluteUrl(path)`.
- `src/lib/seo/jsonld.ts` (new) — pure JSON-LD builders.
- `src/lib/seo/jsonld.test.ts` (new) — builder unit tests.
- `src/components/seo/JsonLd.tsx` (new) — thin `<script type="application/ld+json">` renderer.
- `src/app/sitemap.ts` (new) + `src/app/sitemap.test.ts` (new).
- `src/app/robots.ts` (new) + `src/app/robots.test.ts` (new).
- `src/app/(app)/layout.tsx` (modify) — root metadata.
- `public/og.png` (new) — static placeholder OG image.
- `src/app/(app)/page.tsx` (modify) — home metadata + LocalBusiness JSON-LD.
- `src/app/(app)/products/page.tsx` (modify) — canonical + Breadcrumb JSON-LD.
- `src/app/(app)/products/[slug]/page.tsx` (modify) — canonical + per-product OG + Product/Breadcrumb JSON-LD.
- `src/app/(app)/quote/page.tsx`, `book-survey/page.tsx`, `thank-you/page.tsx` (modify) — canonical/title/robots.
- `.env.example` (modify) — add `NEXT_PUBLIC_SITE_URL`.

---

### Task 1: Site URL config

**Files:**
- Create: `src/lib/seo/site.ts`
- Test: `src/lib/seo/site.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `SITE_URL: string`; `absoluteUrl(path: string): string`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/seo/site.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SITE_URL, absoluteUrl } from "./site";

describe("absoluteUrl", () => {
  it("joins a root-relative path onto SITE_URL", () => {
    expect(absoluteUrl("/san-pham")).toBe(`${SITE_URL}/san-pham`);
  });

  it("produces an absolute URL for the homepage", () => {
    expect(absoluteUrl("/")).toBe(`${SITE_URL}/`);
  });

  it("defaults SITE_URL to localhost when the env var is unset", () => {
    // In the test env NEXT_PUBLIC_SITE_URL is not set.
    expect(SITE_URL).toBe("http://localhost:3000");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/seo/site.test.ts`
Expected: FAIL — cannot find module `./site`.

- [ ] **Step 3: Implement**

Create `src/lib/seo/site.ts`:

```ts
// Canonical site origin — single source for metadataBase, sitemap, canonical
// links, and JSON-LD @id/url. Set NEXT_PUBLIC_SITE_URL in the deploy env.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
```

- [ ] **Step 4: Add the env var to `.env.example`**

Append to `.env.example`:

```
# Public site origin (no trailing slash) — used for canonical URLs, sitemap, JSON-LD.
NEXT_PUBLIC_SITE_URL=https://fukione.vn
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test src/lib/seo/site.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo/site.ts src/lib/seo/site.test.ts .env.example
git commit -m "feat: add SITE_URL config for SEO canonical/sitemap"
```

---

### Task 2: JSON-LD builders + renderer

**Files:**
- Create: `src/lib/seo/jsonld.ts`
- Create: `src/components/seo/JsonLd.tsx`
- Test: `src/lib/seo/jsonld.test.ts`

**Interfaces:**
- Consumes: `Product` from `@/lib/types`.
- Produces:
  - `interface BusinessInfo { name: string; address?: string; phone?: string; hours?: string }`
  - `buildLocalBusinessJsonLd(biz: BusinessInfo, siteUrl: string): object`
  - `buildProductJsonLd(product: Product, siteUrl: string): object`
  - `buildBreadcrumbJsonLd(items: { name: string; path: string }[], siteUrl: string): object`
  - `JsonLd({ data }: { data: object }): JSX.Element`

- [ ] **Step 1: Write the failing test**

Create `src/lib/seo/jsonld.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  buildLocalBusinessJsonLd,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
} from "./jsonld";
import type { Product } from "@/lib/types";

const SITE = "https://fukione.vn";

const product: Product = {
  id: "3",
  slug: "san-go-walnut",
  name: "Sàn Gỗ Walnut",
  pricePerM2: 610000,
  thicknessMm: 12,
  waterproof: true,
  color: "Nâu Đậm",
  surface: "Vân gỗ óc chó",
  roomTypes: ["phòng khách"],
  images: [],
  specs: [],
};

describe("buildLocalBusinessJsonLd", () => {
  it("emits a HomeAndConstructionBusiness with NAP and area served", () => {
    const ld = buildLocalBusinessJsonLd(
      { name: "FUKIONE", address: "Số 12, Cầu Giấy, Hà Nội", phone: "0900 000 000", hours: "8:00–18:00" },
      SITE,
    ) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("HomeAndConstructionBusiness");
    expect(ld.name).toBe("FUKIONE");
    expect(ld.telephone).toBe("0900 000 000");
    expect(ld.areaServed).toBe("Hà Nội");
    expect((ld.address as Record<string, unknown>)["@type"]).toBe("PostalAddress");
  });

  it("omits telephone when phone is missing", () => {
    const ld = buildLocalBusinessJsonLd({ name: "FUKIONE" }, SITE) as Record<string, unknown>;
    expect("telephone" in ld).toBe(false);
  });
});

describe("buildProductJsonLd", () => {
  it("emits a Product with a VND offer at the product URL", () => {
    const ld = buildProductJsonLd(product, SITE) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Product");
    expect(ld.name).toBe("Sàn Gỗ Walnut");
    const offer = ld.offers as Record<string, unknown>;
    expect(offer.price).toBe(610000);
    expect(offer.priceCurrency).toBe("VND");
    expect(offer.url).toBe("https://fukione.vn/san-pham/san-go-walnut");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers items from 1 and resolves absolute item URLs", () => {
    const ld = buildBreadcrumbJsonLd(
      [{ name: "Trang chủ", path: "/" }, { name: "Sản phẩm", path: "/san-pham" }],
      SITE,
    ) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BreadcrumbList");
    const items = ld.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0].position).toBe(1);
    expect(items[1].item).toBe("https://fukione.vn/san-pham");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/seo/jsonld.test.ts`
Expected: FAIL — cannot find module `./jsonld`.

- [ ] **Step 3: Implement the builders**

Create `src/lib/seo/jsonld.ts`:

```ts
import type { Product } from "@/lib/types";

export interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  hours?: string;
}

export function buildLocalBusinessJsonLd(biz: BusinessInfo, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: biz.name,
    url: siteUrl,
    areaServed: "Hà Nội",
    priceRange: "$$",
    ...(biz.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: biz.address,
            addressLocality: "Hà Nội",
            addressCountry: "VN",
          },
        }
      : {}),
    ...(biz.phone ? { telephone: biz.phone } : {}),
    ...(biz.hours ? { openingHours: biz.hours } : {}),
  };
}

export function buildProductJsonLd(product: Product, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `${product.name} — sàn gỗ ${product.surface}, dày ${product.thicknessMm}mm${product.waterproof ? ", chống nước" : ""}. Lắp đặt trọn gói tại Hà Nội.`,
    brand: { "@type": "Brand", name: "FUKIONE" },
    ...(product.images.length ? { image: product.images } : {}),
    offers: {
      "@type": "Offer",
      price: product.pricePerM2,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: new URL(`/san-pham/${product.slug}`, siteUrl).toString(),
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: new URL(it.path, siteUrl).toString(),
    })),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/seo/jsonld.test.ts`
Expected: PASS.

- [ ] **Step 5: Create the renderer**

Create `src/components/seo/JsonLd.tsx`:

```tsx
// Renders a JSON-LD <script>. `data` is always server-built from trusted
// sources (Settings, DB products), so dangerouslySetInnerHTML is safe here.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 6: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: no errors (0 tsc errors).

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo/jsonld.ts src/lib/seo/jsonld.test.ts src/components/seo/JsonLd.tsx
git commit -m "feat: add JSON-LD builders and renderer"
```

---

### Task 3: sitemap.ts

**Files:**
- Create: `src/app/sitemap.ts`
- Test: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `getProducts()` from `@/lib/data/catalog`; `absoluteUrl` from `@/lib/seo/site`.
- Produces: default `async function sitemap(): Promise<MetadataRoute.Sitemap>`.

- [ ] **Step 1: Write the failing test**

Create `src/app/sitemap.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { getProductsMock } = vi.hoisted(() => ({ getProductsMock: vi.fn() }));
vi.mock("@/lib/data/catalog", () => ({ getProducts: getProductsMock }));

import sitemap from "./sitemap";
import { absoluteUrl } from "@/lib/seo/site";

beforeEach(() => getProductsMock.mockReset());

describe("sitemap", () => {
  it("includes the static VN routes and one entry per product, and excludes /cam-on", async () => {
    getProductsMock.mockResolvedValue([{ slug: "san-go-walnut" }, { slug: "san-go-o-soi" }]);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/san-pham"));
    expect(urls).toContain(absoluteUrl("/bao-gia"));
    expect(urls).toContain(absoluteUrl("/dat-lich-khao-sat"));
    expect(urls).toContain(absoluteUrl("/san-pham/san-go-walnut"));
    expect(urls).toContain(absoluteUrl("/san-pham/san-go-o-soi"));
    expect(urls).not.toContain(absoluteUrl("/cam-on"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/sitemap.test.ts`
Expected: FAIL — cannot find module `./sitemap`.

- [ ] **Step 3: Implement**

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/catalog";
import { absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/san-pham", "/bao-gia", "/dat-lich-khao-sat"];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.8,
  }));

  const products = await getProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/san-pham/${p.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/sitemap.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/sitemap.test.ts
git commit -m "feat: add dynamic sitemap (static routes + products)"
```

---

### Task 4: robots.ts

**Files:**
- Create: `src/app/robots.ts`
- Test: `src/app/robots.test.ts`

**Interfaces:**
- Consumes: `SITE_URL` from `@/lib/seo/site`.
- Produces: default `function robots(): MetadataRoute.Robots`.

- [ ] **Step 1: Write the failing test**

Create `src/app/robots.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import robots from "./robots";
import { SITE_URL } from "@/lib/seo/site";

describe("robots", () => {
  it("allows crawling but disallows admin/api/cam-on and points at the sitemap", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.allow).toBe("/");
    expect(rule?.disallow).toEqual(["/admin", "/api", "/cam-on"]);
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/robots.test.ts`
Expected: FAIL — cannot find module `./robots`.

- [ ] **Step 3: Implement**

Create `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/cam-on"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/robots.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/robots.ts src/app/robots.test.ts
git commit -m "feat: add robots.txt route"
```

---

### Task 5: Root layout metadata + placeholder OG image

**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Create: `public/og.png`

**Interfaces:**
- Consumes: `SITE_URL` from `@/lib/seo/site`.

- [ ] **Step 1: Generate the placeholder OG image**

`sharp` is already a dependency. Generate a 1200×630 solid-brand placeholder (design replaces it later):

Run:
```bash
node -e "require('sharp')({create:{width:1200,height:630,channels:3,background:'#241f1b'}}).png().toFile('public/og.png').then(()=>console.log('og.png written'))"
```
Expected: `og.png written`, and `public/og.png` exists.

- [ ] **Step 2: Update root metadata**

In `src/app/(app)/layout.tsx`, add the import and replace the `metadata` export.

Add near the top imports:
```ts
import { SITE_URL } from "@/lib/seo/site";
```

Replace:
```ts
export const metadata: Metadata = {
  title: "FUKIONE — Sàn gỗ cao cấp tại Hà Nội",
  description:
    "Sàn gỗ cao cấp, lắp đặt trọn gói tại Hà Nội. Tư vấn miễn phí, báo giá nhanh, khảo sát tận nơi.",
};
```
with:
```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FUKIONE — Sàn gỗ cao cấp tại Hà Nội",
    template: "%s — FUKIONE",
  },
  description:
    "Sàn gỗ cao cấp, lắp đặt trọn gói tại Hà Nội. Tư vấn miễn phí, báo giá nhanh, khảo sát tận nơi.",
  openGraph: {
    type: "website",
    siteName: "FUKIONE",
    locale: "vi_VN",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image" },
};
```

- [ ] **Step 3: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/layout.tsx" public/og.png
git commit -m "feat: add metadataBase, title template, default OG/Twitter"
```

---

### Task 6: Per-page metadata (canonical, titles, noindex)

**Files:**
- Modify: `src/app/(app)/page.tsx` (home)
- Modify: `src/app/(app)/products/page.tsx`
- Modify: `src/app/(app)/products/[slug]/page.tsx`
- Modify: `src/app/(app)/quote/page.tsx`
- Modify: `src/app/(app)/book-survey/page.tsx`
- Modify: `src/app/(app)/thank-you/page.tsx`

**Interfaces:**
- Consumes: the root `title.template` `"%s — FUKIONE"` from Task 5 — so each page's `title` is the BARE page name (the template appends the brand). The home page uses `title.absolute` to avoid the template.

- [ ] **Step 1: Home — add metadata**

In `src/app/(app)/page.tsx`, add an exported `metadata` above the component (the file currently has none):
```ts
export const metadata = {
  title: { absolute: "FUKIONE — Sàn gỗ cao cấp tại Hà Nội, lắp đặt trọn gói" },
  description:
    "Sàn gỗ cao cấp tại Hà Nội: 8 mẫu sàn, tính chi phí nhanh, khảo sát tận nơi, lắp đặt trọn gói. Tư vấn miễn phí qua Zalo.",
  alternates: { canonical: "/" },
};
```

- [ ] **Step 2: Catalog — canonical + bare title**

In `src/app/(app)/products/page.tsx`, replace the `metadata` block with:
```ts
export const metadata = {
  title: "Sản phẩm",
  description: "Xem toàn bộ sàn gỗ FUKIONE. Lọc theo màu sắc, độ dày, chống nước, phòng và giá.",
  alternates: { canonical: "/san-pham" },
};
```

- [ ] **Step 3: Quote — canonical + bare title**

In `src/app/(app)/quote/page.tsx`, replace the `metadata` block with:
```ts
export const metadata = {
  title: "Tính chi phí sàn gỗ",
  description:
    "Tính nhanh chi phí sàn gỗ theo diện tích — vật liệu, lắp đặt, phào nẹp. Nhận báo giá trong ngày.",
  alternates: { canonical: "/bao-gia" },
};
```

- [ ] **Step 4: Book-survey — canonical + bare title**

In `src/app/(app)/book-survey/page.tsx`, replace the `metadata` block with:
```ts
export const metadata = {
  title: "Đặt lịch khảo sát",
  description:
    "Đặt lịch khảo sát miễn phí tại nhà — đo thực tế, tư vấn sàn gỗ phù hợp, báo giá trọn gói trong ngày.",
  alternates: { canonical: "/dat-lich-khao-sat" },
};
```

- [ ] **Step 5: Thank-you — bare title + noindex**

In `src/app/(app)/thank-you/page.tsx`, replace the `metadata` block with:
```ts
export const metadata = {
  title: "Cảm ơn bạn!",
  description: "Yêu cầu của bạn đã được ghi nhận. Sale FUKIONE sẽ liên hệ trong ~15 phút.",
  robots: { index: false, follow: true },
};
```

- [ ] **Step 6: Product detail — canonical + per-product OG + bare title**

In `src/app/(app)/products/[slug]/page.tsx`, replace the `generateMetadata` return with:
```ts
  return {
    title: product.name,
    description: `${product.name} — ${formatVnd(product.pricePerM2)}/m². Sàn gỗ cao cấp tại Hà Nội, lắp đặt trọn gói.`,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      title: `${product.name} — FUKIONE`,
      description: `${product.name} — ${formatVnd(product.pricePerM2)}/m². Lắp đặt trọn gói tại Hà Nội.`,
    },
  };
```
(`formatVnd` is already imported in this file; the empty-product `return {}` branch stays unchanged.)

- [ ] **Step 7: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
Expected: all pass, 0 tsc errors.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(app)/page.tsx" "src/app/(app)/products/page.tsx" "src/app/(app)/products/[slug]/page.tsx" "src/app/(app)/quote/page.tsx" "src/app/(app)/book-survey/page.tsx" "src/app/(app)/thank-you/page.tsx"
git commit -m "feat: per-page canonical, titles, and thank-you noindex"
```

---

### Task 7: Inject JSON-LD into pages

**Files:**
- Modify: `src/app/(app)/page.tsx` (home — LocalBusiness)
- Modify: `src/app/(app)/products/page.tsx` (catalog — Breadcrumb)
- Modify: `src/app/(app)/products/[slug]/page.tsx` (detail — Product + Breadcrumb)

**Interfaces:**
- Consumes: `JsonLd` from `@/components/seo/JsonLd`; `buildLocalBusinessJsonLd`/`buildProductJsonLd`/`buildBreadcrumbJsonLd` from `@/lib/seo/jsonld`; `SITE_URL` from `@/lib/seo/site`; `SETTINGS` from `@/lib/settings`.

- [ ] **Step 1: Home — LocalBusiness JSON-LD**

In `src/app/(app)/page.tsx`, add imports:
```ts
import { JsonLd } from "@/components/seo/JsonLd";
import { buildLocalBusinessJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";
import { SETTINGS } from "@/lib/settings";
```
Then render the script as the FIRST child inside the top-level returned `<div className="relative overflow-hidden">` (right after the opening tag):
```tsx
      <JsonLd
        data={buildLocalBusinessJsonLd(
          { name: SETTINGS.nap.name, address: SETTINGS.nap.address, phone: SETTINGS.nap.phone, hours: SETTINGS.hours },
          SITE_URL,
        )}
      />
```

- [ ] **Step 2: Catalog — Breadcrumb JSON-LD**

In `src/app/(app)/products/page.tsx`, add imports:
```ts
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";
```
Render it first inside the returned fragment:
```tsx
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [{ name: "Trang chủ", path: "/" }, { name: "Sản phẩm", path: "/san-pham" }],
          SITE_URL,
        )}
      />
```

- [ ] **Step 3: Detail — Product + Breadcrumb JSON-LD**

In `src/app/(app)/products/[slug]/page.tsx`, add imports:
```ts
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";
```
Render both as the first children inside the returned top-level `<div className="flex flex-col gap-6 bg-bg pb-8">`:
```tsx
      <JsonLd data={buildProductJsonLd(product, SITE_URL)} />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Sản phẩm", path: "/san-pham" },
            { name: product.name, path: `/san-pham/${product.slug}` },
          ],
          SITE_URL,
        )}
      />
```

- [ ] **Step 4: Verify lint + types + tests**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
Expected: all pass, 0 tsc errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/page.tsx" "src/app/(app)/products/page.tsx" "src/app/(app)/products/[slug]/page.tsx"
git commit -m "feat: inject LocalBusiness/Product/Breadcrumb JSON-LD"
```

---

### Task 8: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full unit suite + lint + types**

Run: `pnpm test && pnpm lint && pnpm exec tsc --noEmit`
Expected: all suites pass (builders, sitemap, robots, site + existing), lint 0 errors, tsc 0 errors.

- [ ] **Step 2: Production build (DB-gated — defer if no DATABASE_URL)**

> Requires `DATABASE_URL` (sitemap + `generateStaticParams` read the DB at build). If unavailable in the worker, flag this as a manual follow-up — do not claim success without the output.

Run: `pnpm build`
Expected: build succeeds; `/sitemap.xml` and `/robots.txt` are generated.

- [ ] **Step 3: Manual validation (post-deploy follow-up)**

After deploy: paste a product URL into Google Rich Results Test — Product + BreadcrumbList valid; the home URL — LocalBusiness valid; fetch `/sitemap.xml` and `/robots.txt`. (Tracked as a follow-up; needs a live URL.)

---

## Self-Review

**Spec coverage:**
- §4.1 `site.ts` + `.env.example` → Task 1. ✓
- §4.2 root metadata (metadataBase, title template, OG, twitter) → Task 5. ✓
- §4.3 per-page metadata (home, canonical everywhere, detail OG, thank-you noindex) → Task 6. ✓
- §4.4 `sitemap.ts` → Task 3. ✓
- §4.5 `robots.ts` → Task 4. ✓
- §4.6 JSON-LD builders + renderer + injection → Tasks 2 (build/render) + 7 (inject). ✓
- §3 decisions (SITE_URL env, mock NAP, static OG) → Tasks 1, 5, 7. ✓
- §8 testing (builders, sitemap, robots unit-tested; build/manual for metadata) → Tasks 2/3/4 + 8. ✓
- VN-path canonical/sitemap constraint → Tasks 3, 6 use `/san-pham` etc. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. The `og.png` is a generated placeholder (explicitly flagged for design replacement), not a plan gap.

**Type consistency:** `SITE_URL`/`absoluteUrl`, `buildLocalBusinessJsonLd`/`buildProductJsonLd`/`buildBreadcrumbJsonLd`, `BusinessInfo`, and `JsonLd({ data })` are used identically across Tasks 2, 3, 4, 7. Home/catalog/detail import the same symbols they were defined with.

**Note on title template:** Task 5 introduces `template: "%s — FUKIONE"`; Task 6 changes every page `title` to the bare name (and home to `title.absolute`) so titles render once, not doubled. These two tasks must land together for titles to be correct — Task 6 depends on Task 5.
