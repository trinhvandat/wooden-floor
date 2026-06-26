# Blog from Articles — design spec

> Milestone **M4-B** (Trust/content pages), slice 3 of 3. Date: 2026-06-26.
> Branch: `feat/blog-articles`.

## 1. Goal & context

FUKIONE is a lead-gen-first wooden-flooring site (Hà Nội). The blog drives **organic SEO traffic**
and captures leads: a `/tin-tuc` list + `/tin-tuc/[slug]` article pages, each ending in a lead CTA.
It completes M4-B (after the projects gallery and about page) by wiring the already-scaffolded
`Articles` collection to public pages.

Settled with the user:
- **List + detail; tags display-only** (no clickable tag-filter pages).
- **Render the lexical `body` with Payload's official React `RichText`** component (no
  `dangerouslySetInnerHTML`).
- **Seed 2-3 sample published articles** (short hand-authored lexical body) so the page is demoable.

## 2. What already exists (reuse, don't rebuild)

- `Articles` collection (`src/collections/Articles.ts`): `title`, `slug` (unique, indexed),
  `excerpt` (textarea), **`body` (richText / lexical)**, `coverImage` (`upload` → `media`),
  `tags` (`text`, `hasMany`), `seoMeta { title, description }`, `publishedAt` (date), `status`
  (select `draft`/`published`).
- `@payloadcms/richtext-lexical@3.85.1` is installed. The React renderer is exported at
  **`@payloadcms/richtext-lexical/react`** → `RichText`. Verified prop signature:
  `<RichText data={editorState} className?=… converters?=… disableContainer?=… />` — renders to
  JSX, no `dangerouslySetInnerHTML`.
- Data-layer pattern: `lib/data/catalog.ts` (`getProducts`/`getProductBySlug`, `PUBLISHED` filter,
  pure mappers in `catalog.map.ts`). `Media` upload (`url`+required `alt`).
- SEO: `buildLocalBusinessJsonLd`/`buildProductJsonLd`/`buildBreadcrumbJsonLd` (`lib/seo/jsonld.ts`),
  `<JsonLd>`, `SITE_URL`/`BASE_OPEN_GRAPH` (`lib/seo/site.ts`), `sitemap.ts` (static + product entries).
- `next.config.ts` rewrites (VN URL → English folder); `NAV` arrays in `Header.tsx`/`MobileNav.tsx`;
  `SectionHeading` (`as`/`withUnderline`); `LeadCtaSection({ settings, title, body })`; `formatVnd`
  and date helpers in `lib/format.ts` (add a date formatter if none exists — see §3.4).
- The current `Article` type in `types.ts` is a rough stub (`body: string`, `summary`,
  `coverImage: string`) that does NOT match the lexical reality. **No code consumes it** (grep:
  only `types.ts` references `Article`; no mock, no seed), so it is replaced freely (§3.2).

## 3. Changes

### 3.1 Routes + rewrites + nav

- `app/(app)/blog/page.tsx` (list, public `/tin-tuc`) and `app/(app)/blog/[slug]/page.tsx`
  (detail, public `/tin-tuc/[slug]`). `revalidate = 3600`; detail has `generateStaticParams`.
- `next.config.ts`: add `{ source: "/tin-tuc", destination: "/blog" }` and
  `{ source: "/tin-tuc/:slug", destination: "/blog/:slug" }`.
- Add `{ label: "Tin tức", href: "/tin-tuc" }` to `NAV` in `Header.tsx` + `MobileNav.tsx`
  (after "Giới thiệu", before "Báo giá").

### 3.2 Types — replace the stub (`lib/types.ts`)

```ts
import type { SerializedEditorState } from "lexical"; // exact import verified in the plan

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: { url: string; alt: string } | null;
  publishedAt: string;            // ISO string
  tags: string[];
};

export type Article = ArticleSummary & {
  body: SerializedEditorState;     // lexical editor state for <RichText data={...}>
  seo: { title: string; description: string };
};
```

### 3.3 Data layer — `lib/data/articles.ts` + `lib/data/articles.map.ts`

Separate from catalog (content ≠ catalog). Mirror the catalog pattern (`getPayload`, `PUBLISHED`,
`as unknown as Doc[]`).

- `articles.map.ts`: `ArticleDoc` (raw shape incl. populated `coverImage` Media + `body` lexical +
  `seoMeta`), plus:
  - `mapArticleSummary(doc): ArticleSummary` — `coverImage` → `{url,alt}` or `null` (skip url-less),
    `excerpt ?? ""`, `tags ?? []`, `publishedAt` → ISO string (`?? ""`).
  - `mapArticle(doc): Article` — summary + `body` passthrough (the lexical JSON) + `seo`
    (`seoMeta.title || title`, `seoMeta.description || excerpt`).
- `articles.ts`:
  - `getArticles(): Promise<ArticleSummary[]>` — `where: PUBLISHED`, `sort: "-publishedAt"`,
    `depth: 1`, `limit: 100`.
  - `getArticleBySlug(slug): Promise<Article | null>` — `where: { and: [PUBLISHED, { slug }] }`,
    `depth: 1`, returns `mapArticle(doc)` or `null`.

### 3.4 Pages & rendering

- `ArticleCard` (`components/site/ArticleCard.tsx`): links to `/tin-tuc/[slug]`; cover via
  `next/image` with the wood-gradient fallback; title, excerpt (`line-clamp`), formatted
  `publishedAt`, tag labels (display-only, non-interactive). Mirrors `ProductCard`/`ProjectCard`.
- **List page**: `getArticles()` → grid of `ArticleCard`; graceful empty state; breadcrumb JSON-LD;
  `metadata` (title "Tin tức", canonical `/tin-tuc`).
- **Detail page**: `getArticleBySlug` → `notFound()` if null. Renders cover (or gradient), `<h1>`
  title, formatted date, tag labels, then the **lexical body** via
  `<RichText data={article.body} className="…typography…" />` wrapped in a scoped typography
  container (Tailwind element styles for `h2/h3/p/ul/ol/a/strong` — **no `@tailwindcss/typography`
  dependency**), then `<LeadCtaSection title=… body=… settings=… />`.
  `generateMetadata` from `article.seo` (+ canonical, `BASE_OPEN_GRAPH`, cover as OG image when
  present). `buildArticleJsonLd` + breadcrumb JSON-LD.
- **Date formatting**: a small `formatDate(iso: string): string` (vi-VN, e.g. "12 Tháng 6, 2026")
  in `lib/format.ts` (unit-tested) — used by card + detail.

### 3.5 SEO — `buildArticleJsonLd` (`lib/seo/jsonld.ts`)

```ts
export function buildArticleJsonLd(
  a: { title: string; excerpt: string; slug: string; publishedAt: string; image?: string },
  siteUrl: string,
)
```
Returns a `BlogPosting` (`headline`, `description`, `datePublished`, `image?`, `author`/`publisher`
= FUKIONE, `mainEntityOfPage` = the article URL). Unit-tested with the existing jsonld tests.
`sitemap.ts`: add `/tin-tuc` to static paths + one entry per published article.

### 3.6 Seed (`mock-data.ts` + `seed.ts`)

- Add `ARTICLES` to `mock-data.ts`: 2-3 entries with `title`, `slug`, `excerpt`, `tags`,
  `publishedAt` (ISO), and a **minimal valid lexical `body`** (root → one `heading` + two
  `paragraph` nodes; the exact lexical node JSON shape is pinned in the plan).
- Seed loop (after Projects): upsert by `slug`, set `status: "published"`, `publishedAt`, `excerpt`,
  `tags`, `body`. No cover uploads (gradient fallback). Update the seed summary count line.

## 4. Testing

- **Unit**: `mapArticleSummary`/`mapArticle` (`articles.map.test.ts`) — coverImage `{url,alt}` +
  url-less skip, defaults, `seo` fallback (seoMeta → title/excerpt), body passthrough; `getArticles`
  published+sort and `getArticleBySlug` found/null (`articles.test.ts`, mirroring `catalog.test.ts`);
  `buildArticleJsonLd` (jsonld test); `formatDate` (format.test).
- **Lexical render**: exercised end-to-end via the seeded body — verified in `pnpm build` +
  Playwright (detail page renders headings/paragraphs, 0 console errors). Not unit-tested (it is
  Payload's renderer, not our code).
- Standard gate: `tsc` 0 · `lint` 0 (2 pre-existing `seed.ts` warnings) · `pnpm test` green ·
  `pnpm build` succeeds (`/blog`, `/blog/[slug]` generate).

## 5. Out of scope (YAGNI)

- Tag filter/index pages; related-articles; featured/hero treatment; reading time; author profiles;
  comments; RSS; `@tailwindcss/typography`; pagination (a handful of articles needs none).

## 6. Risks & notes

- **Lexical render is the SDK-risk crux.** The plan verifies the `RichText` import + `data` prop
  shape and the seed lexical-body JSON against the installed `@payloadcms/richtext-lexical@3.85.1`
  (e.g. read the package's `.d.ts` / a Payload local-API dump), not from memory. The renderer is
  server-safe (no `dangerouslySetInnerHTML`).
- **`body` typing**: `SerializedEditorState` (lexical) is the `RichText` `data` type. If importing
  from `lexical` causes friction, fall back to the Payload-generated `Article["body"]` type — pinned
  in the plan; do not loosen to `any`.
- **Seed lexical JSON** must be a valid editor state or the detail page renders empty/throws — keep
  the seeded body minimal and copy the node shape from a real Payload export.
- Build-order gotcha: no new collection/schema change here (Articles already exists), so codegen is
  unaffected; but the seed writes `body`/`publishedAt` through the typed local API — run `tsc`, not
  just lint+test (per [[payload-typed-api-data-widening]]).
