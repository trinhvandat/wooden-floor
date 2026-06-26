# HANDOFF — Blog from Articles (M4-B slice 3) ready to PR — 2026-06-26

## Current goal
Blog (M4-B slice 3) is code-complete + fully verified on branch `feat/blog-articles` (8 commits,
memory saved on-branch; not yet pushed). **M4-B is now complete** (projects gallery ✅ + about/Maps ✅
+ blog ✅). Next milestone is **M5** (Zalo widget, GA4, Lighthouse CI, golden e2e, go-live).

## Done (settled, do not redo)
- **Blog from Articles** (this branch) — built via subagent-driven development (5 tasks + 1 polish),
  all reviewed (per-task + opus whole-branch "Ready to merge: YES", no Critical/Important):
  - `/tin-tuc` list + `/tin-tuc/[slug]` detail from the `Articles` collection. New `lib/data/articles.*`
    module (mirrors `catalog.*`); stub `Article` type replaced with `ArticleSummary`/`Article`/`RichTextContent`.
  - **Lexical `body` rendered via Payload's `RichText`** (`@payloadcms/richtext-lexical/react`) — JSX,
    no `dangerouslySetInnerHTML`, no new dep; Tailwind arbitrary-variant typography. See
    [[payload-lexical-richtext-render]].
  - `ArticleCard` + gradient fallback; tags display-only; `formatDate` (vi-VN); `buildArticleJsonLd`
    (BlogPosting); nav "Tin tức"; sitemap entries; lead CTA via `LeadCtaSection`. See [[0016-blog-articles]].
  - Seeded 3 sample articles with hand-authored lexical bodies (`lexicalBody()` in mock-data).
  - Verified: tsc 0, lint 0 (2 pre-existing seed.ts warnings), tests 65/65, `pnpm build` exit 0
    (/blog + /blog/[slug] generate), live render of the lexical body as real <h2>/<p> (0 console errors),
    design-review @375+1440 PASS.
- Earlier (merged to master): about page (PR #18), projects gallery (PR #17), Slice 3 polish (PR #16).

## In progress / Next steps
- **Push `feat/blog-articles` + open PR** (memory ships in same PR), then `/review-pr`.
- **M5 (next milestone)**: Zalo OA widget, GA4, Lighthouse CI gate, the two golden Playwright e2e
  flows ("calculate cost → leave a lead", "filter products → view detail"), go-live.
- Deferred polish (non-blocking, from reviews): blog — `LeadCtaSection` `h2` heading semantics on
  article detail (cross-cutting shared component; consider configurable tag), mobile pb-12 dead space,
  `ArticleCard` title as `<p>` not heading (a11y), tag pill 11px/11.5px drift, ☎ unicode vs SVG;
  sitemap sequential calls (Promise.all). Carried: projects gallery follow-ups (depth:1 test assertion,
  gallery key hardening); about-page polish (footer mobile dup, LeadCtaSection button hover).

## Settled decisions
- [[0016-blog-articles]] — blog at /tin-tuc; articles data module; lexical RichText render; seed sample articles.
- [[payload-lexical-richtext-render]] — render Payload lexical richText with the official RichText React component.

## Cleanup / known (not blocking, carried over)
- `src/components/CtaStrip.tsx` is DEAD CODE (own Zalo guard) — delete or settings-wire in a cleanup.
- Home `metadata.description` still mentions Zalo while the CTA is hidden — self-heals once OA URL set.
- Two `LocalBusiness` JSON-LD emitters (home + about) without a shared `@id` — fine for now.

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0016-blog-articles.md
- docs/superpowers/specs/2026-06-26-blog-articles-design.md
- fukione-web/src/lib/data/articles.ts
- fukione-web/src/app/(app)/blog/[slug]/page.tsx
- fukione-web/src/lib/mock-data.ts

## Blocked / Needs user input
- None. Branch is green + verified; awaiting push/PR.

ACTION: Blog is green + verified; M4-B complete. Push + open PR (memory on-branch), run /review-pr,
then start M5 (go-live prep) when asked.
