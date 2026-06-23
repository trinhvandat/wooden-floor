# HANDOFF — DB-back catalog (M2) shipped — 2026-06-23

## Current goal
None active. M2 (DB-back catalog) is merged to `master` (PR #8). There are deferred DB-only
follow-ups (below) but no pending code work.

## Done (settled, do not redo)
- **DB-back catalog** (PR #8, merged): catalog now reads Payload+Postgres via a repository
  (`src/lib/data/catalog.ts` + pure mappers `catalog.map.ts`) that maps docs back into the
  existing `Product`/`Collection`/`Project` types. ISR `revalidate=3600` on all 4 pages.
  `ProductFilters` + page-variant `CalculatorWidget` take data via props. See
  [[0010-db-back-catalog-repository]].
- **Seed** (`pnpm seed`, `src/seed.ts`): idempotent upsert-by-slug of the 8 SKUs + 2 collections
  + 2 projects from `mock-data.ts` (now the single seed source; no runtime app import).
- **productId re-enabled** on calculator leads: route coerces to number, drops a malformed value
  so the lead is still saved. Also fixed a latent `route.ts` `tsc` error. Builds on
  [[0008-lead-funnel-route-handler]].
- Verified: `pnpm test` 30/30, `pnpm exec tsc --noEmit` 0 errors, `pnpm lint` 0 errors. Final
  opus whole-branch review: no Critical/code defects.

## Deferred (needs DATABASE_URL — do before/at deploy)
- Run `pnpm seed` (expect "2 collections, 8 products, 2 projects"; re-run = idempotent).
- `pnpm build` — proves the build-time `generateStaticParams` DB read + the productId
  relationship insert (the one new behavior with no real-DB coverage yet).
- Write + run the "filter products → view detail" golden e2e (only `lead-funnel.spec.ts` exists;
  `CLAUDE.md` lists 2 golden flows).

## Deferred (YAGNI — do NOT build without a new ask)
- Import the full 52-SKU real dataset (separate content task); product/collection images (media
  uploads); M4 SEO (schema.org, sitemap) — unblocked by this, done separately.
- Repo hygiene: old merged local branches may remain (`feat/scaffold-ui`,
  `feat/scaffold-payload-backend`, `feat/design-review-agent`, `feat/review-pr-command`,
  `docs/uiux-visual-design`, and now `feat/db-back-catalog`) — safe to delete.

## In progress / Next steps
- None pending. Pick the DB follow-ups above (when a DB is reachable), or M4 SEO, or the 52-SKU
  import, when asked.
- NOTE: local `master` may still need `git pull` to pick up the squash-merge of PR #8 (the
  branch-cleanup Bash step was blocked by a temporarily-unavailable classifier at session end).

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0010-db-back-catalog-repository.md
- fukione-web/src/lib/data/catalog.ts
- fukione-web/src/lib/data/catalog.map.ts
- fukione-web/src/seed.ts
- docs/superpowers/plans/2026-06-23-db-back-catalog.md

## Blocked / Needs user input
- None.

ACTION: M2 is live on master. No pending code work — do the DATABASE_URL follow-ups (seed →
build → catalog e2e) before deploy, or wait for a new request.
