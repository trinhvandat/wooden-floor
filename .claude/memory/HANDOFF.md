# HANDOFF — technical SEO (M4-A) ready to PR — 2026-06-24

## Current goal
M4-A (technical SEO + structured data) is code-complete on branch `feat/seo-structured-data`
(10 commits). About to push + open the PR (memory committed on the branch so it ships in the
same PR). M4-B (trust/content pages) is the next slice, not started.

## Done (settled, do not redo)
- **M4-A technical SEO** (this branch): `SITE_URL`/`BASE_OPEN_GRAPH` config, root `metadataBase` +
  title template, per-page canonical (VN paths) + `/cam-on` noindex, dynamic `sitemap.ts` +
  `robots.ts` (at app root), JSON-LD (LocalBusiness/Product/BreadcrumbList) via pure builders +
  `<JsonLd>` renderer. See [[0011-seo-structured-data]], [[nextjs-opengraph-no-deep-merge]].
- Verified: `pnpm test` 39/39, `pnpm exec tsc --noEmit` 0 errors, `pnpm lint` 0 errors / 2 warnings
  (seed.ts no-console only). Opus whole-branch review: no Critical; the one Important (product OG
  losing og:image because App Router replaces, not merges, `openGraph`) is FIXED via `BASE_OPEN_GRAPH`.
- Earlier this session: M2 DB-back catalog merged (PR #8); memory PR (#9); save-memory-before-push
  hook merged (PR #10) — feature+memory now ship in one PR via a `git push` nudge.

## In progress / Next steps
- Push `feat/seo-structured-data` + open the PR (this includes the memory commit).
- M4-B when asked: projects gallery (`/du-an`), about (`/gioi-thieu` + Maps/NAP), blog index +
  article detail (Articles collection) — these pages then get added to the sitemap.

## Deferred follow-ups (need DATABASE_URL — before/at deploy)
- From M4-A: `pnpm build` (proves sitemap + generateStaticParams + metadata/JSON-LD routes compile
  end-to-end); post-deploy Google Rich Results validation (Product/Breadcrumb/LocalBusiness).
- From M2 (still pending): `pnpm seed`; the "filter → view detail" golden e2e.

## Deferred (YAGNI — do NOT build without a new ask)
- Per-product dynamic OG (next/og); DB-back the Payload `settings` global (LocalBusiness reads mock
  `SETTINGS` for now); 52-SKU real dataset + product images; hreflang.

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0011-seo-structured-data.md
- docs/superpowers/plans/2026-06-24-seo-structured-data.md
- fukione-web/src/lib/seo/site.ts
- fukione-web/src/lib/seo/jsonld.ts

## Blocked / Needs user input
- None.

ACTION: M4-A is code-complete and green. Push + PR (memory rides along), then M4-B or the
DATABASE_URL follow-ups when asked.
