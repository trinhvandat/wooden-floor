---
name: payload-run-relative-imports
description: scripts run via `payload run` do NOT resolve the `@/` or `@payload-config` tsconfig aliases — use relative imports
metadata: { type: convention, date: 2026-06-23 }
---
A script executed with `payload run src/seed.ts` (the `pnpm seed` entry) does **not** resolve the
tsconfig path aliases that app code uses. Imports like `@payload-config` or `@/lib/mock-data` fail
at runtime there.

**Why:** `payload run` uses its own tsx loader, which doesn't apply the Next/tsconfig-paths
resolution that the app build does.

**How to apply:** in seed/CLI scripts under `src/`, import by RELATIVE path —
`import config from "../payload.config"` and `import { PRODUCTS } from "./lib/mock-data"` — not via
`@/…`. The `seed` script itself: `cross-env NODE_OPTIONS=--no-deprecation payload run src/seed.ts`
(needs Node 22 per [[payload-next16-compat]]). Related: [[0010-db-back-catalog-repository]].
