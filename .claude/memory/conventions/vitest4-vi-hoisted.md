---
name: vitest4-vi-hoisted
description: Vitest 4 hoists vi.mock factories above imports — reference top-level mock vars via vi.hoisted()
metadata: { type: convention, date: 2026-06-22 }
---
In Vitest 4.x, `vi.mock("mod", factory)` is hoisted to the top of the module, ABOVE all
`import` and `const` statements. So a bare `const createMock = vi.fn()` referenced inside the
factory is `undefined` when the factory runs → broken mock wiring. Declare such vars with
`vi.hoisted()` so they exist during the hoisting phase:

```ts
const { createMock, notifyMock } = vi.hoisted(() => ({ createMock: vi.fn(), notifyMock: vi.fn() }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ create: createMock })) }));
vi.mock("@/lib/leads/notify", () => ({ notifyLead: notifyMock }));
```

**Why:** Used in `src/app/(app)/api/leads/route.test.ts` to mock Payload's `getPayload` +
the notifier. Without `vi.hoisted()` the route's integration tests fail to wire the mocks.

**How to apply:** Any Vitest 4 test whose `vi.mock` factory closes over a local `vi.fn()`
must wrap those fns in `vi.hoisted()`. Related: [[0008-lead-funnel-route-handler]], [[vitest-exclude-e2e]].
