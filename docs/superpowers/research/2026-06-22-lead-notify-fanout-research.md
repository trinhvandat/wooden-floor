# Research — Lead notification: async decoupling + multi-channel fan-out

> Spike (no code) on branch `feat/lead-notify-fanout`, 2026-06-22.
> Goal: decouple lead notification from the `/api/leads` response, and make the notifier
> extensible to multiple channels (email + Zalo + future). Feeds the next brainstorm/design.

## Context

Today `POST /api/leads` (`fukione-web/src/app/(app)/api/leads/route.ts`) `await`s `notifyLead`
(Resend) — including up to 3 retries — **before** returning, so the user waits on the email.
`notifyLead` is hard-wired to Resend. We want: (1) send the notification AFTER the response
(don't block the user), and (2) a notifier abstraction so we can fan out to email + Zalo.

Stack that constrains the answer: **Next.js 16.2.9** App Router, **Payload 3.85** embedded,
hosted on **Vercel** (serverless).

---

## Finding 1 — Async after the response: use `after()` from `next/server`

**Recommendation: use `after()`. Do NOT install `@vercel/functions`.**

- Vercel's docs say: on Next.js 15.1+, use the built-in `after()` from `next/server` instead
  of `waitUntil()`. We're on 16.2.9 — `after()` is stable. Under the hood on Vercel `after()`
  *is* `waitUntil`, so there's zero divergence and no extra dependency.
- Shape in a Route Handler:
  ```ts
  import { after } from "next/server";
  // ...after the DB write succeeds:
  after(() => dispatchLeadNotifications(lead));   // runs AFTER the response is flushed
  return NextResponse.json({ success: true, data: { id: leadId } });
  ```
- Request-scoped data (`cookies()`, `headers()`) survives into the callback. No Payload caveat
  — it just calls our async fn. `after()` does not make the route static; POST routes are
  already dynamic.

**Limits & durability (important):**
- The callback runs **in the same invocation**, bounded by the route's `maxDuration`
  (default 10s Hobby / 15s Pro; raise with `export const maxDuration = 30`). A Resend call is
  < 1s, so defaults are fine.
- It is **best-effort / in-invocation**: NOT crash-safe, NOT redeploy-safe, no retry beyond
  the current execution. If the function times out, the callback is cancelled.
- This is acceptable for FUKIONE Phase 1 because the **DB write is always synchronous and
  first** (gotcha #1): an occasional lost *email* is tolerable; a lost *lead* is not.

**Scale path (when delivery must be guaranteed):** replace the `after()` call with a publish to
a durable queue/outbox — **Vercel Queues** (native, at-least-once, redelivery on crash),
**Upstash QStash** (HTTP, cheap, serverless-friendly), or **Inngest** (retry/step
orchestration). The route publishes a message and returns; a separate consumer runs the sends
with full retry, independent of the original invocation. The notifier interface below makes
this swap local.

Sources: nextjs.org/docs/app/api-reference/functions/after ·
vercel.com/docs/functions/functions-api-reference (waitUntil, cancellation, maxDuration) ·
vercel.com/docs/fluid-compute · vercel.com/changelog/waituntil-is-now-available-for-vercel-functions

---

## Finding 2 — Zalo for an internal sales alert: viable but operationally heavy

We want to "bắn" a lead alert to the **sales team** via Zalo. Realistic options:

| Option | What | Key constraint | Fit (internal alert) |
|---|---|---|---|
| **OA Broadcast** (Tin Truyền thông) | push to ALL OA followers | staff must **follow** the OA; **40 broadcasts/month**, 4 msg/follower/month; send window **06:00–19:59** | **Best** — free, proactive; OK while leads stay low-volume |
| **OA Advisory** (Tin Tư vấn) | 1:1 to a user | recipient must have messaged the OA within **7 days**; 8 free/48h then **55 VND/msg** | Fragile — staff must keep re-pinging the OA |
| **ZNS** | template push to a phone number | verified OA + approved templates; **120–300 VND/msg**, no free tier; **customer-facing by ToS** | Poor — wrong use case, paid, ToS risk |
| **Group / bot** | push into a Zalo group | **no official API** to push into groups | Poor — unsupported |

**Auth model:** OAuth; **access token 1h**, **refresh token 3-month single-use** (each refresh
issues a new pair, must be persisted). Needs an automated refresh (e.g. a cron every ~2 months
+ refresh-on-401), or the token lapses and someone re-authorizes manually.

**Recommended Zalo happy path (if we do it):** create + (ideally) verify the FUKIONE OA → each
sales person follows it once → on a new lead, a `ZaloNotifier` calls **OA Broadcast** with
name/phone/product/time → staff get it as a Zalo notification.

**Decisions the user must make before building Zalo:**
1. **Volume vs quota** — Broadcast is capped at **40/month**. A growing lead-gen site will
   exceed that; Advisory (the alternative) is fragile + paid. Email has no such cap.
2. **Token ownership** — someone must own the 3-month refresh-token lifecycle (a cron).
3. **Fallback** — Zalo can fail (token lapse, unfollow); email (already in stack) must remain
   the reliable channel. The notifier interface makes email the natural fallback.
4. **OA verification** — free OA works for Broadcast-to-followers; the verified badge needs
   business docs (few days) and is mainly for customer-facing use.

Sources: oa.zalo.me messaging policy + broadcast guide · developers.zalo.me OA API auth + ZNS
intro · smsthuonghieu.com (ZNS pricing) · beehexa.com (token tutorial).

---

## Architecture implication (informs the next design)

Both findings point to the same shape:

```
route: validate -> payload.create (sync, DB-first) -> after(() => dispatchLeadNotifications(lead)) -> 200
dispatch: channelsFor(lead) -> Promise.allSettled([ emailNotifier, zaloNotifier, ... ]) ; never throws
```

- `LeadNotifier` interface (`channel`, `notify(lead)`) with `emailNotifier` (Resend, today's
  `notify.ts` moved in) and a future `zaloNotifier`.
- `dispatchLeadNotifications` fans out in parallel, isolates per-channel failure
  (`Promise.allSettled`), logs per-channel result, never throws.
- `after()` decouples the whole dispatch from the response.
- Email stays the **reliable** channel; Zalo is an **optional, best-effort** channel gated on
  the operational decisions above.

## Recommended next step

The async decoupling + notifier-interface refactor is **low-risk, high-value, and email-only**
— worth doing now. Zalo is a **separate, heavier** track gated on the 4 decisions above
(quota, token ops, verification) — recommend deferring the actual Zalo implementation until
those are answered, while building the seam so it drops in later.

Suggested split:
1. **Iteration A (now):** `after()` + `LeadNotifier` interface + `dispatch` (email only) + tests.
2. **Iteration B (later, after the 4 decisions):** implement `zaloNotifier` + routing rules.
3. **Iteration C (only if needed):** swap `after()` for a durable queue/outbox.
