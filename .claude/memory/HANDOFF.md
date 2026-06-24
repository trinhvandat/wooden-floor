# HANDOFF — DB-back Settings ready to PR — 2026-06-24

## Current goal
DB-back Settings is code-complete + DB-verified on branch `feat/db-back-settings` (about to PR,
memory on-branch). M1–M3, M4-A, a11y, seed-fix, and DB-back Settings are all done. The next
requested slice is conversion/desktop polish (was "slice 3").

## Done (settled, do not redo)
- **DB-back Settings** (this branch): prices/NAP/hours/Zalo now read the Payload `settings` global
  via cached `getSettings()` (`lib/data/settings.ts`) + pure mapper; server components self-fetch,
  client tree (Calculator/LeadFormSheet/BypassConsult/SurveyForm/MobileNav) gets a `settings` prop;
  seed writes the global; `isZaloEnabled` per-render. See [[0012-db-back-settings]]. Verified DB
  end-to-end: `pnpm seed` "…1 settings global", `pnpm build` exit 0, 43/43, tsc 0, lint 0.
- Earlier today (merged): M4-A SEO (#11), a11y quick-wins (#12), `pnpm seed` runner fix (#13).
- Earlier (merged): M2 DB-back catalog, lead funnel + async notify.

## Operator action (unblocks a backlog item)
- Set the real **Zalo OA URL** in `/admin` → Settings → all Zalo links auto-reappear (the
  `isZaloEnabled` guard hides them while it's "#"). Same for NAP / prices / hours — now editable.

## In progress / Next steps
- Push `feat/db-back-settings` + PR.
- **Slice 3 — conversion/desktop polish** (the user's other chosen slice): product-detail hero is
  full-viewport at 1440px; `/bao-gia` is a narrow card in a wide page (two-column ≥1024px);
  calculator "~" reads as a minus (→ "khoảng"/"≈"); lead form should use Zod inline errors (not
  native `required`); "Xóa bộ lọc" uses teal (reserve teal for trust); duplicate "Nhận báo giá"
  CTAs on detail; ProductCard needs a real `<img alt>` slot.
- Later: M4-B trust/content pages (projects gallery / about + Maps / blog from Articles).

## Cleanup / known (not blocking)
- `src/components/CtaStrip.tsx` is DEAD CODE (not rendered) with its own Zalo guard — delete or
  settings-wire in a cleanup so there's one Zalo-visibility source of truth.
- Home `metadata.description` still mentions Zalo while the CTA is hidden — self-heals once the OA
  URL is set.
- DB follow-ups still open: the catalog "filter → view detail" golden e2e; post-deploy Google Rich
  Results validation.

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0012-db-back-settings.md
- fukione-web/src/lib/data/settings.ts
- .claude/memory/sessions/2026-06-24.md

## Blocked / Needs user input
- Zalo OA URL (operator sets it in /admin now — no longer a code dependency).

ACTION: DB-back Settings is green + DB-verified. Push + PR, then slice 3 (conversion/desktop polish)
or M4-B when asked.
