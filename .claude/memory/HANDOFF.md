# HANDOFF — feat/lead-funnel — 2026-06-22

## Current goal
Wire the **lead funnel** end-to-end (core of this lead-gen-first site): both forms →
`POST /api/leads` → Zod validate → create Lead in DB (source of truth) → best-effort Resend
email → `/cam-on`. **Built, reviewed, all gates green — opening PR.**

## Done (settled, do not redo)
- **All 5 plan tasks complete + per-task reviewed (Approved)** on branch `feat/lead-funnel`,
  via subagent-driven-development. Plan/spec: `docs/superpowers/{plans,specs}/2026-06-22-lead-funnel*`.
  - schema (`src/lib/leads/schema.ts`), notifier (`src/lib/leads/notify.ts`, never-throws),
    route (`src/app/(app)/api/leads/route.ts` + `vitest.config.ts`), forms wired
    (`SurveyForm`, `LeadFormSheet`, `CalculatorWidget`), Playwright e2e (`e2e/lead-funnel.spec.ts`).
- **Whole-branch final review (opus)** caught 2 integration bugs the per-task passes missed,
  both FIXED in `3da0cf1`:
  - `pnpm test` was RED (Vitest collected the Playwright spec) → added e2e exclude. See [[vitest-exclude-e2e]].
  - Calculator sent a mock-data `productId` into a Payload relationship on an unseeded table →
    would 500 + LOSE the lead. Per user decision: dropped `productId` from the calculator
    payload, capture `productName` in `message`, keep the schema/`LeadContext` plumbing.
- **Gates green:** `pnpm lint` 0/0, `pnpm test` 17/17, `pnpm test:e2e` 1 passed.
- Architecture + rationale: [[0008-lead-funnel-route-handler]]. Routing was already done: [[vn-urls-via-next-rewrites]].

## In progress / Next steps
- Commit memory → push `feat/lead-funnel` → open PR → master → run **`/review-pr`** (separate
  review pass) → squash-merge per [[0004-git-flow-trunk-based]].
- **Fast-follow (post-merge, in PR body):** notify.test `!LEAD_NOTIFY_EMAIL`-alone branch;
  schema phone 11-digit range + empty-name test. (Test/plan-mandated polish, low risk.)
- **Future iteration (separate):** DB-back products (seed + read from Payload instead of
  `mock-data.ts`), then re-enable sending `productId` from the calculator (plumbing is ready).
- Real email delivery needs `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` in `.env` (absent → lead
  still saved, email skipped).

## Settled decisions + rationale
- Funnel architecture: [[0008-lead-funnel-route-handler]]. Don't downgrade zod: [[zod4-payload-no-conflict]].
- Vitest gotchas hit this session: [[vitest-exclude-e2e]], [[vitest4-vi-hoisted]].

## Context to Load (paths only, do NOT paste contents)
- docs/superpowers/plans/2026-06-22-lead-funnel.md
- .superpowers/sdd/progress.md
- .claude/memory/decisions/0008-lead-funnel-route-handler.md

## Blocked / Needs user input
- None. Branch is ready; PR is the next step.

ACTION: If resuming, the feature is complete on `feat/lead-funnel` (HEAD 3da0cf1). Check
whether the PR was opened / `/review-pr` was run / it was squash-merged, then finish that.
