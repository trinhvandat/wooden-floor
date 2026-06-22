---
name: 0009-async-notify-deferred-channels
description: Lead email is sent via Next after() (post-response, best-effort); Zalo stays a manual sales action, no automated channel/queue built
metadata: { type: decision, date: 2026-06-22 }
---
Two decisions about lead notification, settled after a research spike
(`docs/superpowers/research/2026-06-22-lead-notify-fanout-research.md`):

1. **Async dispatch:** the notification email is fired with **`after()` from `next/server`**
   (runs after the response is flushed), not `await`ed inline — so the user is not blocked on
   Resend/retries. The DB write stays synchronous and FIRST (gotcha #1); a DB failure still
   returns 500 and never notifies. Shipped in PR #6. See [[nextjs-after-for-background]].

2. **No automated Zalo channel; no fan-out abstraction; no email-fail durability — all
   deferred (YAGNI).** Sales contact customers **manually** via Zalo using the phone in the
   notification email / `/admin` — matching CLAUDE.md's "sales close via consultation
   (Zalo/phone)". We did NOT build a `ZaloNotifier` / multi-channel dispatcher / queue.

**Why:**
- Automated Zalo (OA messaging) is operationally heavy and quota-limited: OA + OAuth token
  (1h access / 3-month single-use refresh -> needs a cron), Broadcast capped ~40/msg-month
  with a 06:00-19:59 window; ZNS is customer-facing + paid; no official group-push API. Not
  worth it for Phase 1 when a human Zalo outreach already works.
- With only the email channel, a `LeadNotifier` fan-out interface was speculative (YAGNI).
- Email failure is rare and the lead is never lost (DB = source of truth, visible in
  `/admin`), so a notify-status field + cron retry / durable outbox is deferred.

**How to apply:** Keep `notifyLead` single-channel (email/Resend) called via `after()`. If a
real second automated channel or guaranteed delivery is later needed, the documented path is:
notifier interface + `Promise.allSettled` fan-out, and swap `after()` for a durable queue
(Vercel Queues / Upstash QStash). A nice zero-API aid for the manual flow: a click-to-Zalo
`zalo.me/<phone>` link in the email + admin (format to verify). Related:
[[0008-lead-funnel-route-handler]].
