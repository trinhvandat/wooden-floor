# Lead email async (after) Implementation Plan

> **For agentic workers:** implement task-by-task with TDD. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Stop blocking the `/api/leads` response on the email send — fire `notifyLead` AFTER the response is flushed, using `after()` from `next/server`.

**Architecture:** The route keeps writing the lead to the DB synchronously and first (source of truth), then schedules the best-effort notification via `after(() => notifyLead(...))` instead of `await`ing it, and returns immediately. `notifyLead` is unchanged (still never throws). No new dependencies; no durability layer (deferred — see research doc).

**Tech Stack:** Next.js 16.2.9 App Router (`after` is stable), Payload 3.85, Vitest. pnpm.

## Global Constraints

- **DB write stays synchronous and FIRST** (gotcha #1) — unchanged. A `payload.create` failure still returns 500 and must NOT notify.
- **`notifyLead` stays best-effort and never-throws** — do not modify `notify.ts`.
- The notification now runs via **`after()` from `next/server`** — best-effort, in-invocation, NOT crash-safe. That is acceptable for Phase 1; durable delivery is explicitly out of scope (research doc `docs/superpowers/research/2026-06-22-lead-notify-fanout-research.md`).
- Do **NOT** install `@vercel/functions` — `after()` is built into `next/server` and is `waitUntil` under the hood on Vercel.
- Default `maxDuration` (10s) is sufficient (Resend < 1s) — do not change it.
- English code/comments; Vietnamese only in user-facing strings. Run commands in `fukione-web/`.
- Scope is ONE file of production change (`route.ts`) plus its test. Do not add a notifier interface, status field, cron, or Zalo — those were explicitly deferred.

---

### Task 1: Fire the lead notification after the response

**Files:**
- Modify: `fukione-web/src/app/(app)/api/leads/route.ts` (import line 1; notification block lines 54-69)
- Modify: `fukione-web/src/app/(app)/api/leads/route.test.ts` (add `next/server` mock; add one decoupling test)

**Interfaces:**
- Consumes: `notifyLead` (unchanged), `after` from `next/server`.
- Produces: no new exports; same `POST(req): Promise<Response>` contract and JSON shapes.

- [ ] **Step 1: Add the `after` test mock + a failing decoupling test**

In `fukione-web/src/app/(app)/api/leads/route.test.ts`, add a mock of `next/server` ABOVE the `import { POST }` line (alongside the other `vi.mock` calls, after line 11). It keeps the real `NextResponse` and makes `after()` invoke its callback synchronously (there is no Next request context in unit tests), swallowing the result so a rejecting notify cannot surface as an unhandled rejection:

```ts
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    // No Next request context in unit tests: run the callback now and swallow its
    // result so a best-effort notify failure can't become an unhandled rejection.
    after: (cb: () => unknown) => {
      Promise.resolve(cb()).catch(() => {});
    },
  };
});
```

Then add this test inside the `describe` block (it proves the response no longer waits on the email):

```ts
  it("returns without waiting for the notification to finish", async () => {
    createMock.mockResolvedValue({ id: 9 });
    // notify never settles — the response must still come back.
    notifyMock.mockReturnValue(new Promise<void>(() => {}));
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(notifyMock).toHaveBeenCalledOnce();
  });
```

- [ ] **Step 2: Run the test to verify the new one fails (RED)**

Run: `cd fukione-web && pnpm vitest run "src/app/(app)/api/leads/route.test.ts"`
Expected: the new test **fails by timing out** — the current route still `await`s `notifyLead`, whose mock promise never settles, so `POST` never returns. The other 5 tests pass.

- [ ] **Step 3: Switch the route to `after()`**

In `fukione-web/src/app/(app)/api/leads/route.ts`:

Change the import on line 1:
```ts
import { NextResponse, after } from "next/server";
```

Replace the notification block (lines 54-69, the `try { await notifyLead(...) } catch {...}`) with a non-blocking `after()` call:
```ts
  // Notify AFTER the response is flushed so the user isn't blocked on email.
  // notifyLead is best-effort and never throws; the lead is already persisted (gotcha #1).
  after(() =>
    notifyLead({
      id: leadId,
      name: data.name,
      phone: data.phone,
      source: data.source,
      email,
      message: data.message,
      area: data.area,
      estimatedCost: data.estimatedCost,
    }),
  );

  return NextResponse.json({ success: true, data: { id: leadId } });
```

- [ ] **Step 4: Run the test to verify all pass (GREEN)**

Run: `cd fukione-web && pnpm vitest run "src/app/(app)/api/leads/route.test.ts"`
Expected: all 6 tests pass. The decoupling test now returns 200 immediately (the never-settling notify is scheduled via `after` and not awaited); "creates a lead" still sees `notifyMock` called once; "returns 200 when notification throws" still passes (the rejecting notify is swallowed by the `after` mock and cannot affect the already-returned 200); "DB fails -> 500 and never notifies" still passes (the route returns before reaching `after`).

- [ ] **Step 5: Full suite + lint**

Run: `cd fukione-web && pnpm test`
Expected: all unit/integration tests green (e2e excluded).
Run: `cd fukione-web && pnpm lint`
Expected: 0 errors, 0 warnings.

- [ ] **Step 6: (Optional) e2e sanity**

Run: `cd fukione-web && pnpm test:e2e`
Expected: still 1 passed — the golden flow stubs `/api/leads`, so it is unaffected; this just confirms no regression.

- [ ] **Step 7: Commit**

```bash
git add "fukione-web/src/app/(app)/api/leads/route.ts" "fukione-web/src/app/(app)/api/leads/route.test.ts"
git commit -m "perf: send lead notification after the response via after()"
```

---

## Final verification

- [ ] `cd fukione-web && pnpm test` green; `pnpm lint` clean.
- [ ] Code reads correctly: DB write still first and synchronous; `after()` schedules the notify; `notify.ts` untouched.
- [ ] Separate review pass (code-reviewer agent — do not self-approve), then open a PR and run `/review-pr` per the trunk-based git-flow.
- [ ] Manual (optional, needs dev server + `.env`): submit a lead, confirm the response/`/cam-on` returns immediately and the email is still attempted (Resend logs), and the lead is in `/admin`.
