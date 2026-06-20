# HANDOFF — master — 2026-06-20

## Current goal
Define the git-flow workflow for agent-driven development — **done, codified, awaiting commit**.

## Done (settled, do not redo)
- Project memory system + Tier 1 harness (earlier this day) — shipped (commits 3fc3fd5, 8cb6a10).
- **Git-flow researched & decided:** trunk-based (`master` always deployable + short-lived `feat/*`,`fix/*`,`chore/*` → PR → squash-merge → delete branch); parallel agents use git worktrees; review is a separate pass; NOT classic GitFlow.
- Codified into memory: decision `0004-git-flow-trunk-based`, conventions `git-flow-agent` + `where-to-codify-rules`; MEMORY.md index updated.
- **CLAUDE.md §Conventions:** added a Branching line (rule + pointer) so the flow reaches subagents too.

## In progress / Next steps
- **Commit** this session's changes (CLAUDE.md + .claude/memory/ additions) — not yet committed.
- Optional: add a PreToolUse hook to hard-block commits on `master` (machine-enforcement). User has NOT decided yet — was offered, no answer.
- Then: scaffold the app (M1 — Next.js + Payload + Postgres + Vercel) per `docs/architecture.md` §7, applying the new git-flow (branch `feat/scaffold-nextjs-payload` → PR → squash).

## Settled decisions + rationale
- Trunk-based, not GitFlow — solo + greenfield + Vercel CD makes `develop`/`release/*` pure overhead — see [[0004-git-flow-trunk-based]].
- Per-branch Vercel preview + Lighthouse gate is why PRs are kept even though solo.
- Rules that must always apply (incl. for subagents) belong in CLAUDE.md, detail in memory — the memory hook does NOT reach subagents — see [[where-to-codify-rules]].
- Earlier-settled: Tier 1 harness [[0003-adopt-shipwithai-tier1-harness]]; stack = Next.js 14+ + Payload 3 + Postgres + Tailwind/shadcn + Zod + Resend + Vercel; pnpm; TS strict; 80% coverage; English-only artifacts.

## Context to Load (paths only, do NOT paste contents)
- CLAUDE.md
- .claude/memory/conventions/git-flow-agent.md
- .claude/memory/decisions/0004-git-flow-trunk-based.md
- docs/architecture.md

## Blocked / Needs user input
- Decide whether to add the PreToolUse hard-block hook (optional) and whether to commit now.
