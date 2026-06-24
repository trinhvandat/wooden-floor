---
name: payload-run-relative-imports
description: run the seed via `tsx --env-file-if-exists` (NOT `payload run`, which silently no-ops the async script) + use relative imports (no `@/` aliases)
metadata: { type: convention, date: 2026-06-23 }
---
Two gotchas for standalone Payload scripts (e.g. `src/seed.ts`, the `pnpm seed` entry):

**1. `payload run` silently NO-OPS an async script.** `payload run src/seed.ts` exits 0 with ZERO
output before the top-level `seed().catch()` promise settles — the DB stays empty and nothing
errors (a "false success"). Discovered when the first seed appeared to succeed but wrote nothing.
The reliable runner keeps the event loop alive AND loads `.env` itself:
`tsx --env-file-if-exists=.env --env-file-if-exists=.env.local src/seed.ts`. So the `seed` script is:
`cross-env NODE_OPTIONS=--no-deprecation tsx --env-file-if-exists=.env --env-file-if-exists=.env.local src/seed.ts`
(add `tsx` as an explicit devDependency — it's otherwise only transitive via Payload; `--env-file-if-exists` needs Node 22 per [[payload-next16-compat]]).

**2. Aliases don't resolve in these scripts.** Imports like `@payload-config` or `@/lib/mock-data`
fail at runtime under the script runner. Import by RELATIVE path: `import config from
"../payload.config"`, `import { PRODUCTS } from "./lib/mock-data"`.

**How to apply:** use the `tsx --env-file-if-exists` runner + relative imports for any seed/CLI
script; never trust a silent `payload run` exit as proof of success — confirm the "Seeded …" log.
Related: [[0010-db-back-catalog-repository]].
