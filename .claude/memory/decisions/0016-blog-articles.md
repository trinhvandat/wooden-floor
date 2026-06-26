---
name: 0016-blog-articles
description: Blog (M4-B slice 3) at /tin-tuc — list + detail from the Articles collection, lexical body rendered via Payload's RichText
metadata: { type: decision, date: 2026-06-26 }
---
The blog ships at the VN URLs **`/tin-tuc`** (list) + `/tin-tuc/[slug]` (detail) (English route
folders `app/(app)/blog/...` + `next.config.ts` rewrites, per [[vn-urls-via-next-rewrites]]),
wiring the already-scaffolded `Articles` collection to public pages for organic SEO + lead capture.
This completes **M4-B** (after the projects gallery [[0014-projects-gallery]] and about page
[[0015-about-page-maps]]).

Key choices:
- **Data layer** is a separate `lib/data/articles.ts` + `articles.map.ts` (content ≠ catalog),
  mirroring `catalog.*`: `getArticles()` (published, `sort: "-publishedAt"`, `depth: 1`) +
  `getArticleBySlug()`. The stub `Article` type (which nothing consumed) was replaced with
  `ArticleSummary` + `Article` (+ a local `RichTextContent` lexical type).
- **Lexical `body` rendered with Payload's official `RichText`** React component — server-rendered
  JSX, no `dangerouslySetInnerHTML`, no `@tailwindcss/typography` dependency (typography via Tailwind
  arbitrary-variant selectors). See [[payload-lexical-richtext-render]].
- **Tags are display-only** labels (no filter/index pages — YAGNI). Cover images use the wood-gradient
  fallback. Per-article SEO: `seoMeta` override → title/excerpt fallback; `buildArticleJsonLd`
  (BlogPosting, conditional `datePublished`/`image`) + breadcrumb JSON-LD; sitemap entries.
- **Lead CTA** on the detail page via the shared `LeadCtaSection` (source "quote").
- **Seed** 3 published sample articles with hand-authored lexical bodies (`lexicalBody()` builder in
  mock-data) so the render path is exercised in dev; operator writes real articles in `/admin`.

**Why:** the blog is a long-tail SEO surface that must still capture leads; reusing the
`catalog.*` data pattern, the lead funnel, and Payload's own renderer kept it consistent and small.
**How to apply:** M4-B is now complete — next is M5 (Zalo widget, GA4, Lighthouse CI, golden e2e,
go-live). For any new content type, follow this shape (data module + pure mapper, VN rewrite, ISR,
JSON-LD, sitemap, lead CTA). Related: [[0011-seo-structured-data]], [[payload-typed-api-data-widening]].
