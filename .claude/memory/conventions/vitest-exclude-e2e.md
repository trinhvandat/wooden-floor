---
name: vitest-exclude-e2e
description: Vitest collects Playwright e2e specs unless excluded — add exclude e2e/** to vitest.config or `pnpm test` goes RED
metadata: { type: convention, date: 2026-06-22 }
---
`pnpm test` (= `vitest run`) collects **every** `*.test.*`/`*.spec.*` under the project by
default, including `e2e/*.spec.ts`. A Playwright spec calls `test()` from
`@playwright/test`, which throws "did not expect test() to be called here" when Vitest runs
it → `pnpm test` exits non-zero even though the unit tests pass. The whole-branch final
review caught this on the lead-funnel branch (per-task runs missed it — Task 3 added vitest,
Task 5 added the e2e, neither saw the other).

**Why:** Vitest and Playwright both own `test()`; they must not share a collection glob.

**How to apply:** In `fukione-web/vitest.config.ts`, exclude the e2e dir:
```ts
import { defineConfig, configDefaults } from "vitest/config";
export default defineConfig({
  test: { environment: "node", exclude: [...configDefaults.exclude, "e2e/**"] },
});
```
Run BOTH `pnpm test` and `pnpm test:e2e` before a PR — they cover different layers and the
combination is what exposes integration gaps. Related: [[0008-lead-funnel-route-handler]].
