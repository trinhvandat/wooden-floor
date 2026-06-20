# HANDOFF — master — 2026-06-20

## Current goal
Set up the Claude Code harness for the FUKIONE project — **Tier 1 done**.

## Done (settled, do not redo)
- Project memory system (`.claude/memory/` + hooks + `/save-memory`) — complete & shipped (commit 3fc3fd5)
- Ran `/shipwithai-starter:init` → **Tier 1 harness**:
  - `CLAUDE.md` (stack, conventions, gotchas, pnpm commands, scope boundaries)
  - `docs/architecture.md` (SSOT distilled from the design doc)
  - `.claude/starter-context.json` (interview answers for future harness skills)
  - `.claude/settings.json` — added Node/pnpm `permissions` block, **merged** so memory hooks survived (valid JSON, both verified)

## In progress / Next steps
- Commit the harness files (this session's changes) — in progress alongside save-memory.
- Optional future: `/shipwithai-starter:review` to add Tier 2 (format/lint hooks, `.mcp.json`) and Tier 3 (agents, ADRs, CODEMAPS) **once Next.js/Payload code is scaffolded** (greenfield now → nothing for those to act on yet).
- Then: scaffold the app (M1 — Next.js + Payload + Postgres + Vercel) per `docs/architecture.md` §7.

## Settled decisions + rationale
- Tier 1 chosen because project is greenfield/docs-only — see [[0003-adopt-shipwithai-tier1-harness]]
- Permissions merged (not overwritten) into settings.json to keep memory hooks
- Adding permission allow-rules needs explicit user approval — see [[settings-permission-grant-needs-approval]]
- Stack of record: Next.js 14+ + Payload 3 (embedded) + Postgres + Tailwind/shadcn + Zod + Resend + Vercel; pnpm; TS strict; 80% coverage
- English for all artifacts; Vietnamese only for user-Claude chat

## Context to Load (paths only, do NOT paste contents)
- CLAUDE.md
- docs/architecture.md
- .claude/starter-context.json
- docs/superpowers/specs/2026-06-20-fukione-wooden-floor-ecommerce-design.md

## Blocked / Needs user input
- None.
