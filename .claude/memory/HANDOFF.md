# HANDOFF — async lead notify shipped — 2026-06-22

## Current goal
None active. Lead funnel + async-notify work is merged to `master`. This branch
(`chore/save-memory-notify`) only records the session's decisions into memory.

## Done (settled, do not redo)
- **Lead funnel** (PR #5, merged): forms → `POST /api/leads` → Zod → DB-first → best-effort
  Resend email → `/cam-on`. See [[0008-lead-funnel-route-handler]].
- **Async notify** (PR #6, merged): the email now fires via **`after()` from `next/server`**
  (post-response, user not blocked); DB write still synchronous + first. See
  [[0009-async-notify-deferred-channels]], [[nextjs-after-for-background]].
- **Research spike** captured why Zalo is NOT an automated channel and reliability is deferred:
  `docs/superpowers/research/2026-06-22-lead-notify-fanout-research.md`.

## Deliberately deferred (YAGNI — do NOT build without a new ask)
- Automated Zalo notification channel — sales contact customers manually via Zalo (phone from
  the email/admin). Rationale in [[0009-async-notify-deferred-channels]].
- Multi-channel fan-out (`LeadNotifier` interface/dispatcher) — only email exists, so it'd be
  speculative.
- Email-failure durability (notify-status field + cron retry, or durable queue/outbox) — rare
  case; `/admin` (DB) is the no-lead-lost backstop. Scale path: Vercel Queues / Upstash QStash.

## In progress / Next steps
- Merge this `chore/save-memory-notify` PR (memory only).
- Possible future work when asked: DB-back the product catalog (seed + read from Payload
  instead of `mock-data.ts`), then re-enable calculator `productId`; or the deferred items above.
- Optional repo hygiene: several old merged local branches remain (`feat/scaffold-ui`,
  `feat/scaffold-payload-backend`, `feat/design-review-agent`, `feat/review-pr-command`,
  `docs/uiux-visual-design`) — safe to delete.

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0009-async-notify-deferred-channels.md
- docs/superpowers/research/2026-06-22-lead-notify-fanout-research.md
- fukione-web/src/app/(app)/api/leads/route.ts

## Blocked / Needs user input
- None.

ACTION: Both features are live on master. If resuming, there is no pending feature work —
pick from "Next steps" or wait for a new request.
