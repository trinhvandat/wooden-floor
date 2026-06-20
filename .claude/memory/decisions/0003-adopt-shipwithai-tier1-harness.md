---
name: 0003-adopt-shipwithai-tier1-harness
description: adopted shipwithai-starter Tier 1 harness — created CLAUDE.md + docs/architecture.md, merged permissions into existing settings.json
metadata: { type: decision, date: 2026-06-20 }
---
Ran `/shipwithai-starter:init` and set up the **Tier 1 (Essential)** Claude Code harness for the FUKIONE project: created `CLAUDE.md` (stack, conventions, gotchas, commands), `docs/architecture.md` (SSOT distilled from the design doc), and `.claude/starter-context.json` (interview answers for future harness skills). Added a Node/pnpm `permissions` block to `.claude/settings.json`.

**Why:** the project had no `CLAUDE.md` — newcomers and Claude had to rediscover the stack/architecture each session. Tier 1 (not 2/3) was chosen because the project is **greenfield/docs-only**: format/lint hooks and most MCP servers have nothing to act on until Next.js/Payload code is scaffolded.

**How to apply:**
- Permissions were **merged** into the existing `settings.json`, NOT overwritten, to preserve the project-memory hooks (SessionStart/Stop). Any future harness edit must do the same — see [[settings-permission-grant-needs-approval]].
- Stack of record (greenfield): Next.js 14+ App Router + Payload CMS 3 (embedded) + PostgreSQL + Tailwind/shadcn + Zod + Resend + Vercel; package manager **pnpm**.
- Testing convention set to **80% coverage** (user choice — overrode the design doc's "just enough"), with priority on the cost calculator, lead→email, and 2 golden e2e flows.
- Upgrade to Tier 2/3 via `/shipwithai-starter:review` once real code exists.
- Architecture/conventions/gotchas now live in `CLAUDE.md` + `docs/architecture.md`; keep them in sync. Related: [[0002-project-memory-self-contained]], [[english-only-artifacts]].
