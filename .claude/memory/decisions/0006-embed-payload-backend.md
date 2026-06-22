---
name: 0006-embed-payload-backend
description: Embed Payload CMS 3 into the existing Next.js app (one deploy); split app/ into (app) + (payload) route groups; 8 collections as schema-as-code
metadata: { type: decision, date: 2026-06-22 }
---
Scaffold the M1 backend foundation by **embedding Payload CMS 3 into the existing
`fukione-web` Next.js app** (one app, one deploy) — not a separate service, not
`create-payload-app`. Full design: [`docs/superpowers/specs/2026-06-22-scaffold-payload-backend-design.md`](../../../docs/superpowers/specs/2026-06-22-scaffold-payload-backend-design.md).

**Why:** matches `architecture.md` §2 (modular monolith, Payload embedded), keeps a
single cheap deploy, and the owned Postgres is ready for the Phase-2 Spring Boot service.

**How to apply:**
- Next.js allows only ONE root layout rendering `<html>/<body>`; Payload `/admin` needs its
  own. So `src/app/` is split into two route groups, each with its own root layout:
  `(app)/` holds the existing UI (moved via `git mv`, content unchanged), `(payload)/` holds
  Payload's admin+API (verbatim from the 3.x blank template — do not hand-edit). Route-group
  folders `(…)` are transparent to URLs.
- 8 entities as schema-as-code in `src/collections/*` + `src/globals/Settings.ts`, matching the
  class diagram + SRS §4. Enums (`source`/`status`/`role`) → Payload `select`.
- Config at `fukione-web/payload.config.ts`, alias `@payload-config` in tsconfig.
- **Scaffold only** — NOT wired: lead API route, Resend email, catalog migration off
  `mock-data.ts`, seeding, role-based access. Those are M2/M3, separate specs/PRs.
- Runtime constraint forced a Node pin — see [[payload-next16-compat]].
- Branch `feat/scaffold-payload-backend`, per [[0004-git-flow-trunk-based]].
