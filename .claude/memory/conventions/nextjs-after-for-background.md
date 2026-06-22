---
name: nextjs-after-for-background
description: For post-response background work on Vercel use after() from next/server (NOT @vercel/functions); it's best-effort, not crash-safe
metadata: { type: convention, date: 2026-06-22 }
---
To run work AFTER the HTTP response is sent (e.g. best-effort email), use **`after()` from
`next/server`** — do NOT plain-`await` it (blocks the user) and do NOT fire-and-forget an
un-awaited promise (Vercel can freeze/kill the function once the response is sent, so it never
runs). On Next.js 15.1+ (we're on 16.2.9) `after()` is stable and IS `waitUntil` under the
hood on Vercel, so there's no need to install `@vercel/functions`.

```ts
import { NextResponse, after } from "next/server";
// ...after the DB write:
after(() => bestEffortWork());        // runs after the response is flushed
return NextResponse.json({ ok: true });
```

**Caveats:**
- Best-effort, **in-invocation**: bounded by the route's `maxDuration` (10s Hobby / 15s Pro,
  raise with `export const maxDuration = N`); a Resend call is < 1s so defaults are fine.
- NOT crash-safe / redeploy-safe and no retry beyond the run. For guaranteed delivery use a
  durable queue/outbox (Vercel Queues / Upstash QStash) instead.

**Testing:** Vitest has no Next request context, so `after()` won't run its callback. Mock it:
`vi.mock("next/server", ...)` spreading the original and overriding `after` to invoke the
callback (swallow its result). A never-settling notify mock then proves the response does not
await it. Used in `src/app/(app)/api/leads/route.test.ts`. Related:
[[0009-async-notify-deferred-channels]], [[payload-next16-compat]].
