# Blog from Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the M4-B blog — `/tin-tuc` list + `/tin-tuc/[slug]` article pages from the scaffolded `Articles` collection — for organic SEO traffic and lead capture.

**Architecture:** A new `lib/data/articles.*` module (mirroring `catalog.*`) maps published Articles to public types; the lexical `body` is rendered server-side with Payload's official `RichText` React component (no `dangerouslySetInnerHTML`). Two pages, shared `LeadCtaSection`, `buildArticleJsonLd`, and seeded sample articles.

**Tech Stack:** Next.js 16 (App Router, ISR), Payload CMS 3, `@payloadcms/richtext-lexical@3.85.1`, TypeScript strict, Tailwind, Vitest.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-06-26-blog-articles-design.md` — authoritative.
- **Branch:** `feat/blog-articles` (already checked out). Commit per task; save memory on-branch before the PR push.
- **Public URLs Vietnamese-no-accent:** route folders English (`app/(app)/blog/`), public URLs `/tin-tuc` + `/tin-tuc/[slug]` via `next.config.ts` rewrites. Internal `<Link href>`/canonical/breadcrumb use `/tin-tuc`, never `/blog`.
- **Lexical render:** `import { RichText } from "@payloadcms/richtext-lexical/react"`; `<RichText data={body} className=… />`. Server-rendered, NO `dangerouslySetInnerHTML`. NO new dependency (no `@tailwindcss/typography` — style via Tailwind arbitrary-variant selectors).
- **Lead CTA records `source: "quote"`:** detail page uses `LeadCtaSection` (opens `LeadFormSheet` with no context).
- **Payload-generated artifacts** (`payload-types.ts`) are generated — not hand-edited. No schema change here (Articles already exists), so no codegen needed; but the seed writes through the typed local API → run `tsc`, not just lint+test ([[payload-typed-api-data-widening]]).
- Repo artifacts English; Vietnamese only in user-facing UI strings. **Gate before PR:** `tsc` 0 · `lint` 0 (2 pre-existing `seed.ts` warnings) · `pnpm test` green · `pnpm build` succeeds. All `pnpm` from `fukione-web/`.

---

### Task 1: Article types + data layer (TDD)

Replace the stub `Article` type and add the articles data module (mappers + queries), mirroring `catalog.*`.

**Files:**
- Modify: `fukione-web/src/lib/types.ts` (replace the `Article` stub)
- Create: `fukione-web/src/lib/data/articles.map.ts`
- Create: `fukione-web/src/lib/data/articles.ts`
- Test: `fukione-web/src/lib/data/articles.map.test.ts`
- Test: `fukione-web/src/lib/data/articles.test.ts`

**Interfaces:**
- Produces: `ArticleSummary`, `Article`, `RichTextContent` (types); `mapArticleSummary(doc): ArticleSummary`; `mapArticle(doc): Article`; `getArticles(): Promise<ArticleSummary[]>`; `getArticleBySlug(slug): Promise<Article | null>`; `ArticleDoc`, `ArticleSummaryDoc` (raw doc types).

- [ ] **Step 1: Replace the `Article` type**

In `fukione-web/src/lib/types.ts`, replace the existing `Article` type block (currently `{ id, slug, title, summary, coverImage, publishedAt, body }`) with:

```ts
/** Lexical editor-state shape from the Payload richText `body` field (what <RichText data> accepts). */
export type RichTextContent = {
  root: {
    type: string;
    children: { type: string; version: number; [k: string]: unknown }[];
    direction: ("ltr" | "rtl") | null;
    format: "" | "left" | "start" | "center" | "right" | "end" | "justify";
    indent: number;
    version: number;
  };
  [k: string]: unknown;
};

export type ArticleSummary = {
  id: string;
  slug: string;
  /** Vietnamese article title */
  title: string;
  excerpt: string;
  coverImage: { url: string; alt: string } | null;
  publishedAt: string; // ISO string ("" if unset)
  tags: string[];
};

export type Article = ArticleSummary & {
  body: RichTextContent;
  seo: { title: string; description: string };
};
```

- [ ] **Step 2: Write the failing mapper tests**

Create `fukione-web/src/lib/data/articles.map.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mapArticleSummary, mapArticle } from "./articles.map";
import type { ArticleDoc } from "./articles.map";

const body = { root: { type: "root", children: [], direction: "ltr", format: "", indent: 0, version: 1 } };

const fullDoc: ArticleDoc = {
  id: 5,
  slug: "san-go-cho-phong-tam",
  title: "Sàn gỗ cho phòng tắm",
  excerpt: "Chọn sàn chống nước đúng cách.",
  coverImage: { id: 1, url: "/m/a.jpg", alt: "Phòng tắm" },
  tags: ["chống nước", "mẹo"],
  publishedAt: "2026-06-12T00:00:00.000Z",
  body,
  seoMeta: { title: "SEO title", description: "SEO desc" },
};

describe("mapArticleSummary", () => {
  it("maps cover to {url, alt}, defaults, and tags", () => {
    const a = mapArticleSummary(fullDoc);
    expect(a.id).toBe("5");
    expect(a.coverImage).toEqual({ url: "/m/a.jpg", alt: "Phòng tắm" });
    expect(a.tags).toEqual(["chống nước", "mẹo"]);
    expect(a.publishedAt).toBe("2026-06-12T00:00:00.000Z");
  });

  it("nulls a url-less cover and defaults missing fields", () => {
    const a = mapArticleSummary({ id: 6, slug: "x", title: "X", coverImage: { id: 2 } });
    expect(a.coverImage).toBeNull();
    expect(a.excerpt).toBe("");
    expect(a.tags).toEqual([]);
    expect(a.publishedAt).toBe("");
  });
});

describe("mapArticle", () => {
  it("passes body through and derives seo from seoMeta", () => {
    const a = mapArticle(fullDoc);
    expect(a.body).toBe(body);
    expect(a.seo).toEqual({ title: "SEO title", description: "SEO desc" });
  });

  it("falls back seo to title/excerpt when seoMeta is empty", () => {
    const a = mapArticle({ ...fullDoc, seoMeta: undefined });
    expect(a.seo.title).toBe("Sàn gỗ cho phòng tắm");
    expect(a.seo.description).toBe("Chọn sàn chống nước đúng cách.");
  });
});
```

- [ ] **Step 3: Run the mapper tests to verify they fail**

Run: `pnpm test articles.map`
Expected: FAIL — module `./articles.map` not found.

- [ ] **Step 4: Implement `articles.map.ts`**

Create `fukione-web/src/lib/data/articles.map.ts`:

```ts
import type { Article, ArticleSummary, RichTextContent } from "@/lib/types";

interface MediaRef {
  id: number | string;
  url?: string | null;
  alt?: string | null;
}

export interface ArticleSummaryDoc {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: number | string | MediaRef | null;
  tags?: (string | null)[] | null;
  publishedAt?: string | null;
}

export interface ArticleDoc extends ArticleSummaryDoc {
  body?: RichTextContent | null;
  seoMeta?: { title?: string | null; description?: string | null } | null;
}

function mapCover(cover: ArticleSummaryDoc["coverImage"]): { url: string; alt: string } | null {
  if (cover && typeof cover === "object" && "url" in cover && cover.url) {
    return { url: cover.url, alt: cover.alt ?? "" };
  }
  return null;
}

const EMPTY_BODY: RichTextContent = {
  root: { type: "root", children: [], direction: "ltr", format: "", indent: 0, version: 1 },
};

export function mapArticleSummary(doc: ArticleSummaryDoc): ArticleSummary {
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? "",
    coverImage: mapCover(doc.coverImage),
    publishedAt: doc.publishedAt ?? "",
    tags: (doc.tags ?? []).filter((t): t is string => typeof t === "string"),
  };
}

export function mapArticle(doc: ArticleDoc): Article {
  return {
    ...mapArticleSummary(doc),
    body: doc.body ?? EMPTY_BODY,
    seo: {
      title: doc.seoMeta?.title || doc.title,
      description: doc.seoMeta?.description || doc.excerpt || "",
    },
  };
}
```

- [ ] **Step 5: Run the mapper tests to verify they pass**

Run: `pnpm test articles.map`
Expected: PASS.

- [ ] **Step 6: Write the failing data-layer tests**

Create `fukione-web/src/lib/data/articles.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { findMock } = vi.hoisted(() => ({ findMock: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ find: findMock })) }));

import { getArticles, getArticleBySlug } from "./articles";

beforeEach(() => findMock.mockReset());

describe("getArticles", () => {
  it("queries published articles sorted by -publishedAt and maps them", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "p", title: "P" }] });
    const res = await getArticles();
    expect(res[0].id).toBe("7");
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "articles",
        where: { status: { equals: "published" } },
        sort: "-publishedAt",
      }),
    );
  });
});

describe("getArticleBySlug", () => {
  it("returns the mapped article when found", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "villa", title: "Villa" }] });
    const a = await getArticleBySlug("villa");
    expect(a?.slug).toBe("villa");
  });
  it("returns null when not found", async () => {
    findMock.mockResolvedValue({ docs: [] });
    expect(await getArticleBySlug("nope")).toBeNull();
  });
});
```

- [ ] **Step 7: Run the data-layer tests to verify they fail**

Run: `pnpm test articles.test`
Expected: FAIL — module `./articles` not found.

- [ ] **Step 8: Implement `articles.ts`**

Create `fukione-web/src/lib/data/articles.ts`:

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import type { Article, ArticleSummary } from "@/lib/types";
import {
  mapArticleSummary,
  mapArticle,
  type ArticleSummaryDoc,
  type ArticleDoc,
} from "./articles.map";

const PUBLISHED = { status: { equals: "published" } } as const;

export async function getArticles(): Promise<ArticleSummary[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "articles",
    where: PUBLISHED,
    sort: "-publishedAt",
    limit: 100,
    depth: 1,
  });
  return (res.docs as unknown as ArticleSummaryDoc[]).map(mapArticleSummary);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "articles",
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  });
  const doc = res.docs[0] as unknown as ArticleDoc | undefined;
  return doc ? mapArticle(doc) : null;
}
```

- [ ] **Step 9: Run the data-layer tests to verify they pass, then typecheck**

Run: `pnpm test articles.test` → PASS. Then `pnpm exec tsc --noEmit` → 0 errors.

- [ ] **Step 10: Commit**

```bash
git add fukione-web/src/lib/types.ts fukione-web/src/lib/data/articles.map.ts \
  fukione-web/src/lib/data/articles.ts fukione-web/src/lib/data/articles.map.test.ts \
  fukione-web/src/lib/data/articles.test.ts
git commit -m "feat: articles data layer (types, mappers, getArticles/getArticleBySlug)"
```

---

### Task 2: `formatDate` + `buildArticleJsonLd` (TDD shared helpers)

Two small pure units used by the pages and sitemap.

**Files:**
- Modify: `fukione-web/src/lib/format.ts`
- Modify: `fukione-web/src/lib/seo/jsonld.ts`
- Test: `fukione-web/src/lib/format.test.ts`
- Test: `fukione-web/src/lib/seo/jsonld.test.ts`

**Interfaces:**
- Produces: `formatDate(iso: string): string`; `buildArticleJsonLd(a, siteUrl)`.

- [ ] **Step 1: Write the failing `formatDate` test**

Create `fukione-web/src/lib/format.test.ts` (if it exists, append the `formatDate` describe):

```ts
import { describe, it, expect } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats an ISO date as vi-VN day month year", () => {
    expect(formatDate("2026-06-12T00:00:00.000Z")).toBe("12 tháng 6, 2026");
  });
  it("returns empty string for empty/invalid input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test format`
Expected: FAIL — `formatDate` not exported.

- [ ] **Step 3: Implement `formatDate`**

Append to `fukione-web/src/lib/format.ts`:

```ts
/**
 * Format an ISO date string as a Vietnamese long date, e.g. "12 tháng 6, 2026".
 * Returns "" for empty or unparseable input.
 */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
```

Note: Node/V8's `vi-VN` long month renders as `"tháng 6"`; the expected string above matches `Intl` output (`"12 tháng 6, 2026"`). If the runtime ICU formats it differently (e.g. a leading "Tháng"), set the EXPECTED test value to the actual `Intl` output rather than changing the implementation.

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm test format`
Expected: PASS.

- [ ] **Step 5: Write the failing `buildArticleJsonLd` test**

In `fukione-web/src/lib/seo/jsonld.test.ts`, add `buildArticleJsonLd` to the import and add:

```ts
describe("buildArticleJsonLd", () => {
  it("builds a BlogPosting with headline, date, url, and optional image", () => {
    const ld = buildArticleJsonLd(
      {
        title: "Sàn gỗ cho phòng tắm",
        excerpt: "Chọn sàn chống nước.",
        slug: "san-go-cho-phong-tam",
        publishedAt: "2026-06-12T00:00:00.000Z",
        image: "/m/a.jpg",
      },
      "https://fukione.vn",
    ) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("Sàn gỗ cho phòng tắm");
    expect(ld.datePublished).toBe("2026-06-12T00:00:00.000Z");
    expect(ld.mainEntityOfPage).toBe("https://fukione.vn/tin-tuc/san-go-cho-phong-tam");
    expect(ld.image).toBe("https://fukione.vn/m/a.jpg");
  });

  it("omits image when not provided", () => {
    const ld = buildArticleJsonLd(
      { title: "X", excerpt: "y", slug: "x", publishedAt: "2026-01-01T00:00:00.000Z" },
      "https://fukione.vn",
    ) as Record<string, unknown>;
    expect("image" in ld).toBe(false);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm test jsonld`
Expected: FAIL — `buildArticleJsonLd` not exported.

- [ ] **Step 7: Implement `buildArticleJsonLd`**

Append to `fukione-web/src/lib/seo/jsonld.ts`:

```ts
export function buildArticleJsonLd(
  a: { title: string; excerpt: string; slug: string; publishedAt: string; image?: string },
  siteUrl: string,
) {
  const url = new URL(`/tin-tuc/${a.slug}`, siteUrl).toString();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.publishedAt,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "FUKIONE" },
    publisher: { "@type": "Organization", name: "FUKIONE" },
    ...(a.image ? { image: new URL(a.image, siteUrl).toString() } : {}),
  };
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `pnpm test jsonld`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add fukione-web/src/lib/format.ts fukione-web/src/lib/format.test.ts \
  fukione-web/src/lib/seo/jsonld.ts fukione-web/src/lib/seo/jsonld.test.ts
git commit -m "feat: add formatDate + buildArticleJsonLd helpers"
```

---

### Task 3: Seed sample articles

Add 2-3 published sample articles with a minimal valid lexical `body` so the blog renders in dev.

**Files:**
- Modify: `fukione-web/src/lib/mock-data.ts`
- Modify: `fukione-web/src/seed.ts`

**Interfaces:**
- Consumes: `Article`/`RichTextContent` (Task 1).
- Produces: `ARTICLES` mock; seed loop for the `articles` collection.

- [ ] **Step 1: Add a lexical-body helper + `ARTICLES` to mock-data**

In `fukione-web/src/lib/mock-data.ts`, add a small builder (a valid lexical editor state = one `h2` + N paragraphs) and the mock array. Put this near the other mock exports:

```ts
import type { RichTextContent } from "@/lib/types"; // add to existing imports if not present

function lexicalBody(heading: string, paragraphs: string[]): RichTextContent {
  const text = (t: string) => ({
    type: "text", text: t, detail: 0, format: 0, mode: "normal", style: "", version: 1,
  });
  return {
    root: {
      type: "root",
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
      children: [
        { type: "heading", tag: "h2", direction: "ltr", format: "", indent: 0, version: 1, children: [text(heading)] },
        ...paragraphs.map((p) => ({
          type: "paragraph", direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0, children: [text(p)],
        })),
      ],
    },
  };
}

export interface MockArticle {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  body: RichTextContent;
}

export const ARTICLES: MockArticle[] = [
  {
    slug: "chon-san-go-chong-nuoc",
    title: "Cách chọn sàn gỗ chống nước cho căn hộ",
    excerpt: "Tiêu chí chọn sàn gỗ chống nước bền đẹp cho phòng khách và bếp.",
    tags: ["chống nước", "kinh nghiệm"],
    publishedAt: "2026-06-10T00:00:00.000Z",
    body: lexicalBody("Vì sao nên chọn sàn gỗ chống nước", [
      "Sàn gỗ chống nước phù hợp với khí hậu ẩm của Hà Nội, hạn chế cong vênh.",
      "Hãy ưu tiên cốt gỗ HDF lõi xanh và lớp phủ chống xước cho khu vực đi lại nhiều.",
    ]),
  },
  {
    slug: "bao-duong-san-go-dung-cach",
    title: "Bảo dưỡng sàn gỗ đúng cách",
    excerpt: "Những lưu ý đơn giản giúp sàn gỗ bền màu theo năm tháng.",
    tags: ["bảo dưỡng", "mẹo"],
    publishedAt: "2026-06-05T00:00:00.000Z",
    body: lexicalBody("Bảo dưỡng sàn gỗ tại nhà", [
      "Lau sàn bằng khăn ẩm vắt khô, tránh đổ nước trực tiếp lên bề mặt.",
      "Dùng chân đế nỉ cho bàn ghế để tránh trầy xước khi di chuyển.",
    ]),
  },
  {
    slug: "san-go-cho-phong-ngu",
    title: "Chọn màu sàn gỗ cho phòng ngủ ấm cúng",
    excerpt: "Gợi ý phối màu sàn gỗ giúp phòng ngủ ấm áp, thư giãn.",
    tags: ["phối màu", "phòng ngủ"],
    publishedAt: "2026-05-28T00:00:00.000Z",
    body: lexicalBody("Phối màu sàn gỗ cho phòng ngủ", [
      "Tông nâu ấm và vân gỗ tự nhiên tạo cảm giác gần gũi cho không gian nghỉ ngơi.",
      "Kết hợp sàn màu trung tính với nội thất sáng để phòng ngủ rộng và thoáng hơn.",
    ]),
  },
];
```

- [ ] **Step 2: Add the seed loop**

In `fukione-web/src/seed.ts`: add `ARTICLES` to the existing `mock-data` import, and add this loop after the `// 3. Projects` loop (before the Settings global block):

```ts
  // 3b. Articles
  for (const a of ARTICLES) {
    const data = {
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      tags: a.tags,
      publishedAt: a.publishedAt,
      body: a.body,
      status: "published" as const,
    };
    const existing = await payload.find({
      collection: "articles",
      where: { slug: { equals: a.slug } },
      limit: 1,
    });
    if (existing.docs.length) {
      await payload.update({ collection: "articles", id: existing.docs[0].id, data });
    } else {
      await payload.create({ collection: "articles", data });
    }
  }
```

Then update the final summary `console.log` to include `${ARTICLES.length} articles`.

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors. (If the typed local API rejects `body`/`data` widening, cast the `body` field as the generated type per [[payload-typed-api-data-widening]] — do NOT loosen to `any`.)

- [ ] **Step 4: Commit**

```bash
git add fukione-web/src/lib/mock-data.ts fukione-web/src/seed.ts
git commit -m "feat: seed 3 sample articles with lexical bodies"
```

---

### Task 4: ArticleCard + `/tin-tuc` list page + rewrite + nav

**Files:**
- Create: `fukione-web/src/components/site/ArticleCard.tsx`
- Create: `fukione-web/src/app/(app)/blog/page.tsx`
- Modify: `fukione-web/next.config.ts`
- Modify: `fukione-web/src/components/site/Header.tsx`
- Modify: `fukione-web/src/components/site/MobileNav.tsx`

**Interfaces:**
- Consumes: `getArticles()`, `ArticleSummary` (Task 1), `formatDate` (Task 2), `SectionHeading`, `JsonLd`, `buildBreadcrumbJsonLd`, `SITE_URL`.
- Produces: `<ArticleCard article={...} />` linking to `/tin-tuc/[slug]`; the `/tin-tuc` route.

- [ ] **Step 1: Create `ArticleCard`**

Create `fukione-web/src/components/site/ArticleCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,.1)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-wood-soft to-wood">
        {article.coverImage && (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        {article.publishedAt && (
          <p className="text-[12px] font-semibold text-muted">{formatDate(article.publishedAt)}</p>
        )}
        <p className="line-clamp-2 text-[15px] font-extrabold leading-snug text-ink">
          {article.title}
        </p>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{article.excerpt}</p>
        {article.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <span key={t} className="rounded-pill bg-field px-2 py-0.5 text-[11px] font-semibold text-muted">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create the list page**

Create `fukione-web/src/app/(app)/blog/page.tsx`:

```tsx
import { getArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/site/ArticleCard";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata = {
  title: "Tin tức",
  description: "Kinh nghiệm chọn, thi công và bảo dưỡng sàn gỗ từ FUKIONE.",
  alternates: { canonical: "/tin-tuc" },
};

export default async function BlogPage() {
  const articles = await getArticles();
  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Tin tức", path: "/tin-tuc" },
          ],
          SITE_URL,
        )}
      />
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeading as="h1" withUnderline>Tin tức</SectionHeading>
        {articles.length === 0 ? (
          <p className="mt-8 text-[14px] text-muted">Bài viết sẽ sớm được cập nhật.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add the list rewrite**

In `fukione-web/next.config.ts`, add to the `rewrites()` array (after the `/gioi-thieu` entry):

```ts
      { source: "/tin-tuc", destination: "/blog" },
```

- [ ] **Step 4: Add the nav link (both files)**

In `fukione-web/src/components/site/Header.tsx` AND `fukione-web/src/components/site/MobileNav.tsx`, add to the `NAV` array between the `Giới thiệu` and `Báo giá` entries:

```ts
  { label: "Tin tức", href: "/tin-tuc" },
```

- [ ] **Step 5: Build + typecheck**

Run: `pnpm exec tsc --noEmit` → 0 errors. Then `pnpm lint` → 0 new errors. (DB-gated `pnpm build` is the controller's job.)

- [ ] **Step 6: Commit**

```bash
git add fukione-web/src/components/site/ArticleCard.tsx "fukione-web/src/app/(app)/blog/page.tsx" \
  fukione-web/next.config.ts fukione-web/src/components/site/Header.tsx fukione-web/src/components/site/MobileNav.tsx
git commit -m "feat: blog list page at /tin-tuc + nav link"
```

---

### Task 5: `/tin-tuc/[slug]` detail page (lexical render) + rewrite + sitemap

**Files:**
- Create: `fukione-web/src/app/(app)/blog/[slug]/page.tsx`
- Modify: `fukione-web/next.config.ts`
- Modify: `fukione-web/src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getArticles`, `getArticleBySlug` (Task 1), `getSettings`, `formatDate` (Task 2), `buildArticleJsonLd`/`buildBreadcrumbJsonLd`, `LeadCtaSection`, `RichText` (`@payloadcms/richtext-lexical/react`), `SITE_URL`/`BASE_OPEN_GRAPH`.

- [ ] **Step 1: Create the detail page**

Create `fukione-web/src/app/(app)/blog/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getArticles, getArticleBySlug } from "@/lib/data/articles";
import { getSettings } from "@/lib/data/settings";
import { formatDate } from "@/lib/format";
import { LeadCtaSection } from "@/components/site/LeadCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";

type PageParams = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: { canonical: `/tin-tuc/${article.slug}` },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${article.seo.title} — FUKIONE`,
      description: article.seo.description,
      ...(article.coverImage ? { images: [article.coverImage.url] } : {}),
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const settings = await getSettings();

  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildArticleJsonLd(
          {
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            publishedAt: article.publishedAt,
            image: article.coverImage?.url,
          },
          SITE_URL,
        )}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Tin tức", path: "/tin-tuc" },
            { name: article.title, path: `/tin-tuc/${article.slug}` },
          ],
          SITE_URL,
        )}
      />
      <article className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <header className="flex flex-col gap-3">
          {article.publishedAt && (
            <p className="text-[12.5px] font-semibold text-muted">{formatDate(article.publishedAt)}</p>
          )}
          <h1 className="font-display text-[26px] font-extrabold leading-tight text-ink">
            {article.title}
          </h1>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <span key={t} className="rounded-pill bg-field px-2.5 py-1 text-[11.5px] font-semibold text-muted">
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card bg-gradient-to-br from-wood-soft to-wood">
          {article.coverImage && (
            <Image
              src={article.coverImage.url}
              alt={article.coverImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 760px) 100vw, 760px"
              priority
            />
          )}
        </div>

        {/* Lexical body — rendered to JSX by Payload's RichText (no dangerouslySetInnerHTML).
            Typography via Tailwind arbitrary-variant selectors (no @tailwindcss/typography). */}
        <RichText
          data={article.body}
          className="space-y-4 text-[15px] leading-relaxed text-ink [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-extrabold [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:text-[16px] [&_h3]:font-bold [&_p]:text-muted [&_a]:text-trust [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_strong]:text-ink"
        />

        <LeadCtaSection
          settings={settings}
          title="Cần tư vấn cho không gian của bạn?"
          body="Để lại thông tin — FUKIONE sẽ tư vấn và báo giá miễn phí."
        />
      </article>
    </div>
  );
}
```

Note: `RichText`'s `data` prop expects the lexical editor state. If `tsc` rejects `article.body` (typed `RichTextContent`) against the prop's `SerializedEditorState`, type `RichTextContent` (Task 1, types.ts) as `DefaultTypedEditorState` imported from `@payloadcms/richtext-lexical` instead of the local structural shape — confirm the exact exported name against `node_modules/@payloadcms/richtext-lexical/dist/nodeTypes.d.ts` (it exports `DefaultTypedEditorState`). Do NOT cast to `any`/`never`.

- [ ] **Step 2: Add the detail rewrite**

In `fukione-web/next.config.ts`, add after the `/tin-tuc` rewrite:

```ts
      { source: "/tin-tuc/:slug", destination: "/blog/:slug" },
```

- [ ] **Step 3: Add articles to the sitemap**

In `fukione-web/src/app/sitemap.ts`: import `getArticles` (alongside the existing data imports), add `"/tin-tuc"` to `staticPaths`, add before the return:

```ts
  const articles = await getArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: absoluteUrl(`/tin-tuc/${a.slug}`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
```
and include `...articleEntries` in the returned array.

- [ ] **Step 4: Typecheck + lint**

Run: `pnpm exec tsc --noEmit` → 0 errors. Then `pnpm lint` → 0 new errors.

- [ ] **Step 5: Commit**

```bash
git add "fukione-web/src/app/(app)/blog/[slug]/page.tsx" fukione-web/next.config.ts fukione-web/src/app/sitemap.ts
git commit -m "feat: article detail page at /tin-tuc/[slug] with lexical render + sitemap"
```

---

## Self-Review

**Spec coverage:**
- §3.1 routes + rewrites + nav → Task 4 (list + `/tin-tuc` rewrite + nav), Task 5 (detail + `/tin-tuc/:slug` rewrite). ✓
- §3.2 types → Task 1 Step 1. ✓
- §3.3 data layer (`articles.ts`/`articles.map.ts`, getArticles/getArticleBySlug) → Task 1. ✓
- §3.4 ArticleCard, list, detail, lexical RichText render, formatDate → Task 4 (card/list), Task 5 (detail/render), Task 2 (formatDate). ✓
- §3.5 buildArticleJsonLd + sitemap → Task 2 (builder), Task 5 (sitemap + JSON-LD on pages). ✓
- §3.6 seed → Task 3. ✓
- §4 unit tests (mappers, data layer, buildArticleJsonLd, formatDate) → Tasks 1-2; pages via build/Playwright (controller). ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code; test steps have assertions. The two SDK-typing/format notes (RichText `data` type fallback; `Intl` month casing) give a concrete primary + a concrete, named contingency resolved via tsc/test output — not placeholders.

**Type consistency:** `ArticleSummary`/`Article`/`RichTextContent` defined in Task 1 and consumed identically in `ArticleCard` (4), list (4), detail (5), seed (3). `formatDate(string): string` and `buildArticleJsonLd(a, siteUrl)` defined in Task 2, used in Tasks 4-5. `getArticles`/`getArticleBySlug` signatures consistent across Task 1, 4, 5. `ArticleDoc`/`ArticleSummaryDoc` raw types defined in Task 1, used by the mappers + data layer. ✓
