---
name: payload-next16-compat
description: Payload 3.85+ supports Next 16.2.6+, but its tsx-based CLI breaks on Node 25 — pin Node 22 LTS; use next build --webpack for prod; graphql must be ^16
metadata: { type: convention, date: 2026-06-22 }
---
Running Payload CMS 3 on this stack (Next 16.2.9 / React 19.2.4) has several non-obvious
constraints, verified against primary Payload sources:

- **Next 16 IS supported.** `@payloadcms/next` 3.85.1 peerDep is `next >=16.2.6 <17.0.0`, so
  16.2.9 is in range — no `--legacy-peer-deps` / override needed. React 19 has no declared
  peerDep. Support was added in Payload 3.73.0. Do NOT use Payload 4.0 beta (needs Node 24).
- **graphql must be `^16`** (Payload peerDep `^16.8.1`). Installing bare `graphql` pulls v17 →
  pin `graphql@^16` explicitly.
- **Node 25 breaks the Payload CLI.** Payload's CLI (`generate:types`, `generate:importmap`,
  and the `generate:importmap` step inside `pnpm build`) loads `payload.config.ts` via `tsx`.
  On **Node 25**, tsx appends `?namespace=<ts>` to every module specifier and Node 25's ESM
  resolver rejects it → `ERR_MODULE_NOT_FOUND ...index.js?namespace=...`. The Next dev/build
  of the frontend itself works on 25 (SWC, not tsx), which is why this only surfaced once
  Payload was added. **Fix: pin Node 22 LTS** (`.nvmrc` → 22). Payload officially supports
  `^18.20.2 || >=20.9.0`; 22 LTS is the safe choice. Machine had only brew Node 25 + no
  version manager, so this required a `brew install node@22 && brew link --overwrite`.
- **Turbopack prod build is unsafe.** Next 16 defaults to Turbopack for `dev` AND `build`, but
  Payload issue #15429 (open) makes the config return `null` in RSC during Turbopack
  **production** builds → `/admin` crashes. So `build` script uses `next build --webpack`;
  `dev` keeps Turbopack. Add `turbopack: {}` to `next.config` to silence the webpack/turbopack
  co-config warning (#14354).

**How to apply:** keep `.nvmrc` at 22; `build` = `generate:importmap && next build --webpack`;
never bump graphql past 16 or Payload to 4.x without re-checking. Related: [[0006-embed-payload-backend]].
