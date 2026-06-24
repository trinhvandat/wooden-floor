# HANDOFF — a11y quick-wins ready to PR; M4-A live & verified — 2026-06-24

## Current goal
a11y/conversion quick-wins are code-complete on branch `fix/a11y-conversion-quickwins` (1 commit,
off master). About to push + PR (memory rides along). M4-A (SEO) is merged + verified live.

## Done (settled, do not redo)
- **M4-A technical SEO merged** (PR #11) — and **verified end-to-end with real DB data**: seeded 8
  SKUs (idempotent), home/detail render real data + JSON-LD + canonical, `/sitemap.xml` (4 static +
  8 products), `/robots.txt`, and `pnpm build` SUCCEEDS (`/products/[slug]` SSG). The deferred DB
  gates are now PROVEN. See [[0011-seo-structured-data]], [[nextjs-opengraph-no-deep-merge]].
- **a11y quick-wins** (this branch): CTA contrast (CtaStrip white→`text-ink`), on-brand
  `:focus-visible` ring (2px solid cta + 2px offset — Playwright-verified), graceful-hide Zalo
  links while `zaloUrl` is "#" (added `ZALO_ENABLED` guard). Verified: 0 dead `#` links, ring
  renders, tsc 0 / 39 tests / lint 0.

## In progress / Next steps
- Push `fix/a11y-conversion-quickwins` + PR.
- M4-B when asked: trust/content pages (projects gallery `/du-an`, about `/gioi-thieu` + Maps,
  blog from Articles) — these then join the sitemap.

## Known bug to fix (NOT done)
- **`pnpm seed` silently no-ops**: `payload run src/seed.ts` exits before the async seed settles
  (exit 0, zero output, empty DB — a "false success"). Reliable runner: **`tsx --env-file=.env
  src/seed.ts`**. Fix the `seed` script in `fukione-web/package.json` + record a memory convention.

## Design backlog (from /design-review — pre-existing, for M5 polish / pre-go-live)
- **Zalo OA URL needed** (user has none yet): once obtained, set `SETTINGS.zaloUrl` → links auto-
  re-appear (guard already in place).
- High: white-on-orange elsewhere if reintroduced; (focus + CtaStrip already fixed).
- Medium: calculator "~" renders like a minus → use "khoảng"/"≈"; lead form should use Zod inline
  errors (not native `required`); "Xóa bộ lọc" uses teal (reserve teal for trust); desktop layouts
  — product detail hero is full-viewport at 1440px, `/bao-gia` is a narrow card in a wide page
  (two-column at ≥1024px); duplicate "Nhận báo giá" CTAs on detail; ProductCard needs a real
  `<img alt>` slot for when photos land. Nits: emoji contact links; slug `san-go-walnut` (English);
  flat trim estimate regardless of area.

## DB / deploy follow-ups
- M2: the catalog "filter → view detail" golden e2e still doesn't exist (only `lead-funnel.spec.ts`).
- Post-deploy: Google Rich Results Test (Product/Breadcrumb/LocalBusiness); needs a live URL.

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/sessions/2026-06-24.md
- fukione-web/src/lib/settings.ts
- fukione-web/src/app/(app)/globals.css

## Blocked / Needs user input
- Zalo OA URL (to re-enable Zalo links) — user said they don't have it yet.

ACTION: a11y branch is green + verified. Push + PR. Then fix the `pnpm seed` runner, or M4-B, or
the design backlog when asked.
