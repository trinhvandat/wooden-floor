# HANDOFF — Projects gallery (M4-B slice 1) ready to PR — 2026-06-25

## Current goal
Projects gallery (M4-B slice 1) is code-complete + fully verified on branch
`feat/projects-gallery` (8 commits, memory saved on-branch; not yet pushed). Everything through
Slice 3 conversion polish + this gallery is done. Next requested work after this is the rest of
M4-B (about + Google Maps, blog from Articles).

## Done (settled, do not redo)
- **Projects gallery** (this branch) — built via subagent-driven development (6 tasks + 1 gate fix),
  all reviewed (per-task + opus whole-branch "Ready to merge: YES", no Critical/Important):
  - Data layer completed: `Project.productId`→**`productIds: string[]`**, `images`→`{url,alt}[]`,
    `description`; `getProjects()` PUBLISHED+`depth:1`; new `getProjectBySlug()`; `mapProject` skips
    url-less Media. `status` select added to `Projects` collection; seed sets `status:"published"`.
  - `/du-an` grid (`ProjectCard` + gradient fallback + empty state, `<h1>`) and `/du-an/[slug]`
    detail (gallery, location/area chips, description, "Sản phẩm trong dự án" cross-links,
    breadcrumb JSON-LD, generateStaticParams + ISR). Rewrites `/du-an` + `/du-an/:slug`.
  - Detail-page **lead CTA** (`ProjectQuoteCta` opens `LeadFormSheet`, **no context → source
    "quote"**, see [[leadformsheet-source-by-context]]) + mobile `BottomActionBar`.
  - Nav `Dự án` repointed `/#du-an`→`/du-an`; homepage teaser got `Xem tất cả →`; sitemap extended.
  - `SectionHeading` gained `as?:"h1"|"h2"` (default h2). See [[0014-projects-gallery]].
  - Verified: tsc 0, lint 0 (2 pre-existing seed.ts warnings), tests 45/45, `pnpm build` exit 0
    (`/projects` static + `/projects/[slug]` SSG), Playwright 375+1440 (0 console errors).
- Earlier this session (merged to master): Slice 3 conversion polish (PR #16).

## In progress / Next steps
- **Push `feat/projects-gallery` + open PR** (memory ships in same PR), then `/review-pr`.
- **M4-B remaining**: about page + Google Maps; blog from the Articles collection.
- Deferred polish follow-ups (non-blocking, from reviews): add `depth:1` assertion to
  `catalog.test.ts`; harden gallery `key` to `` `${img.url}-${i}` ``; desktop grid orphaned-4th-card
  max-width; 11px detail chips → 12-13px.

## Settled decisions
- [[0014-projects-gallery]] — gallery completes the scaffolded collection; grid+detail; gradient
  fallback; status/published seed coupling; lead CTA on every detail page.
- [[leadformsheet-source-by-context]] — LeadFormSheet source flips on `context` presence.

## Cleanup / known (not blocking, carried over)
- `src/components/CtaStrip.tsx` is DEAD CODE (own Zalo guard) — delete or settings-wire in a cleanup.
- Home `metadata.description` still mentions Zalo while the CTA is hidden — self-heals once OA URL set.
- DB follow-ups still open: catalog "filter → view detail" golden e2e; post-deploy Google Rich Results.

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0014-projects-gallery.md
- docs/superpowers/specs/2026-06-25-projects-gallery-design.md
- docs/superpowers/plans/2026-06-25-projects-gallery.md
- fukione-web/src/lib/data/catalog.ts
- fukione-web/src/components/site/ProjectQuoteCta.tsx
- fukione-web/src/app/(app)/projects/[slug]/page.tsx

## Blocked / Needs user input
- None. Branch is green + verified; awaiting push/PR.

ACTION: Projects gallery is green + verified. Push + open PR (memory on-branch), run /review-pr,
then M4-B about/Maps or blog when asked.
