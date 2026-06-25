# HANDOFF — Slice 3 conversion/desktop polish ready to PR — 2026-06-25

## Current goal
Slice 3 (conversion/desktop polish) is code-complete + verified on branch `feat/conversion-polish`
(memory saved on-branch; not yet committed/pushed). Everything through M4-A, a11y, DB-back catalog
+ Settings, and now conversion polish is done. Next requested slice after this is M4-B (trust/content
pages).

## Done (settled, do not redo)
- **Slice 3 conversion polish** (this branch), all verified (tsc 0, lint 0, 43/43, build OK,
  Playwright 375+1440 + 0 console errors):
  - Calculator `~` (read as minus) → "khoảng" on line-item + total (`CalculatorWidget.tsx`).
  - "Xóa bộ lọc" teal → neutral `border-line/text-muted` (`ProductFilters.tsx`); teal reserved for trust.
  - Duplicate "Nhận báo giá" CTAs: mobile sticky bar relabeled **"Tính chi phí"** (scrolls to calc)
    vs calculator's "Nhận báo giá" (opens form) — `products/[slug]/page.tsx`.
  - Product-detail desktop **two-column** (gallery left / header+calculator right), page capped
    1180px — fixes full-viewport hero (`products/[slug]/page.tsx`).
  - `/bao-gia` desktop **two-column** (intro left / calculator ≤420px right); mobile unchanged
    (`quote/page.tsx`).
  - Lead forms: native `required` → **inline Zod** (blur + submit-block), a11y wired. New
    `lib/leads/forms.ts` + `components/site/FieldError.tsx`. See [[0013-lead-form-client-zod-validation]].
  - ProductCard `<img alt>` was already correct (next/image + alt) → dropped from scope.
- Earlier (merged to master): README (#14), M4-A SEO (#11), a11y (#12), seed-runner fix (#13),
  DB-back Settings, DB-back catalog, lead funnel + async notify.

## In progress / Next steps
- Commit Slice 3 (`/git-commit`), push `feat/conversion-polish`, open PR (memory ships in same PR).
- **M4-B — trust/content pages**: projects gallery, about + Google Maps, blog from Articles collection.
- Optional polish leftovers: `/bao-gia` desktop left column is sparse (could host trust signals);
  empty-phone inline error says "không hợp lệ" (matches server — accepted).

## Cleanup / known (not blocking)
- `src/components/CtaStrip.tsx` is DEAD CODE (own Zalo guard) — delete or settings-wire in a cleanup.
- Home `metadata.description` still mentions Zalo while the CTA is hidden — self-heals once OA URL set.
- DB follow-ups still open: catalog "filter → view detail" golden e2e; post-deploy Google Rich
  Results validation.

## Operator action (unblocks backlog)
- Set the real **Zalo OA URL** in `/admin` → Settings → Zalo links reappear (hidden while "#").

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0013-lead-form-client-zod-validation.md
- fukione-web/src/lib/leads/forms.ts
- fukione-web/src/components/site/FieldError.tsx
- .claude/memory/sessions/2026-06-25.md

## Blocked / Needs user input
- None for Slice 3 (green). Awaiting user go-ahead to commit/push/PR.

ACTION: Slice 3 is green + verified. Commit + push + PR when the user confirms, then M4-B (or the
cleanup items) when asked.
