# HANDOFF — feat/scaffold-payload-backend — 2026-06-22

## Current goal
Scaffold the **Payload CMS 3 backend foundation** (M1) embedded in `fukione-web` —
**scaffold-only** (no lead wiring, no mock migration). All files written; **blocked on a Node
runtime switch before the codegen/build verification can run.**

## Done (settled, do not redo)
- **Design approved + spec written:** [`docs/superpowers/specs/2026-06-22-scaffold-payload-backend-design.md`](../../docs/superpowers/specs/2026-06-22-scaffold-payload-backend-design.md). Decision: [[0006-embed-payload-backend]].
- **Hook bug fixed + verified:** all 4 hooks in `.claude/settings.json` now use
  `$CLAUDE_PROJECT_DIR` (were relative paths → failed from non-root cwd). Committed `6c3cf38`.
  See [[hook-paths-claude-project-dir]].
- **All scaffold files written** (uncommitted):
  - `fukione-web/payload.config.ts` (8 collections + Settings global, postgres adapter, lexical, sharp, types→`payload-types.ts`)
  - `src/collections/{Users,Media,Products,Collections,Articles,Projects,Leads}.ts` + `src/globals/Settings.ts`
  - `src/app/(payload)/…` route group (verbatim from Payload 3.x blank template — do NOT hand-edit)
  - Existing UI **moved** into `src/app/(app)/…` via `git mv` (content unchanged; `favicon.ico` left at app root)
  - `next.config.ts` wrapped with `withPayload` + `turbopack:{}`; `tsconfig.json` alias `@payload-config`
  - `package.json`: scripts (`build` = `generate:importmap && next build --webpack`, `generate:types`, `generate:importmap`), deps (payload/@payloadcms/* 3.85.1, db-postgres, richtext-lexical, sharp, graphql **^16**, cross-env, sass), `pnpm.onlyBuiltDependencies: [sharp, esbuild]`
  - `.env.example` (Neon pooled URL + `PAYLOAD_SECRET`); real `.env` is user-owned/read-only
  - `.nvmrc` → **22**

## In progress / Next steps (RESUME HERE)
1. **User is installing Node 22 LTS** (`brew install node@22 && brew link --overwrite --force node@22`). Confirm `node -v` = v22.x.
2. `pnpm install` (rebuild native deps e.g. sharp for Node 22).
3. `pnpm generate:importmap` then `pnpm generate:types` → must produce `fukione-web/payload-types.ts` + `src/app/(payload)/admin/importMap.js`.
4. `pnpm build` (webpack) must pass; `pnpm test` still 4/4.
5. `/admin` boot check needs a real Neon `DATABASE_URL` + `PAYLOAD_SECRET` in `.env` (user supplies) → create-first-user screen, 7 collections + Settings in sidebar.
6. **Commit** the scaffold (stage `(app)` renames + all new files) and open/append PR into `master`.

## Settled decisions + rationale
- Embed Payload, split `(app)`/`(payload)` route groups, 8 collections schema-as-code — [[0006-embed-payload-backend]].
- Node **22 LTS, not 25**: Payload's tsx CLI breaks on Node 25 ESM; Next 16 IS in Payload 3.85 peerDep range; prod build must use `--webpack`; graphql pinned `^16` — [[payload-next16-compat]].
- Earlier: trunk-based git-flow [[0004-git-flow-trunk-based]]; design-review tooling [[0005-adopt-onredoak-design-review]]; English-only artifacts; mermaid-no-emoji.

## Context to Load (paths only, do NOT paste contents)
- docs/superpowers/specs/2026-06-22-scaffold-payload-backend-design.md
- fukione-web/payload.config.ts
- fukione-web/src/collections/ (+ src/globals/Settings.ts)
- fukione-web/package.json
- .claude/memory/conventions/payload-next16-compat.md

## Blocked / Needs user input
- **Node 22 install** (in progress, user-run). Until `node -v` = 22, steps 2–6 cannot run.
- **Live `/admin` verify** needs user's real Neon credentials in `.env` (read-only to Claude).
- Scaffold files are uncommitted — commit after build/test verification passes on Node 22.
