# PLAN — Project Memory System (cross-session catch-up)

## Objective
A memory system that **lives in the repo** (committed to git) to help Claude catch up on work
across sessions, and to onboard newcomers. Self-contained, not dependent on global plugins
(OMC/ECC). The old ECC summary is left on for A/B testing.

## Scope

### Create
- `.claude/settings.json` — project-level hooks (SessionStart load + Stop remind)
- `.claude/hooks/load-memory.sh` — inject memory index + handoff at session start
- `.claude/hooks/remind-save.sh` — nudge to run /save-memory at session end (once/session, guarded)
- `.claude/memory/MEMORY.md` — index, auto-loaded at session start
- `.claude/memory/README.md` — explains the system for newcomers
- `.claude/memory/HANDOFF.md` — WIP state (overwritten each session)
- `.claude/memory/decisions/` — ADR-lite (append, durable)
- `.claude/memory/conventions/` — conventions + gotchas (durable)
- `.claude/memory/sessions/` — per-day progress summaries (append)
- `.claude/skills/save-memory/SKILL.md` — skill that distills the four content types

### Do NOT touch
- ECC / supermemory plugins (kept for A/B testing)
- `.omc/` (inert, ignore)
- `~/.claude/` global (everything lives in the repo)

## Mechanism

### Session start — auto-load (tiered)
1. SessionStart hook injects `MEMORY.md` (index) + `HANDOFF.md` (WIP) — cheap.
2. A directive asks Claude to `Read` the files under the handoff's "Context to Load".
3. `decisions/` and `conventions/` files are read only when the index hints they are relevant.

### Session end — hybrid trigger
1. Stop hook detects unsaved changes → injects a reminder (once/session, loop-guarded).
2. `/save-memory` distills: decisions → conventions → HANDOFF → sessions/<date> → update index.

## Four content types
- **decisions/** — decision + rationale (durable, append-only)
- **conventions/** — conventions, gotchas (durable)
- **HANDOFF.md** — WIP, next step (ephemeral, overwritten)
- **sessions/** — per-day progress log (append)

## Conventions
- All project artifacts in English; only user-Claude chat is Vietnamese.

## Test
- [x] New session → MEMORY.md + HANDOFF.md injected (hook output verified)
- [x] After editing files → Stop hook nudges exactly once (fire-once + guard verified)
- [x] /save-memory produces the right files and updates the index (ran end-to-end)
- [ ] Fresh `git clone` → a reader understands the system from the README (pending commit)

## Status
- [x] Design + structure
- [x] Hooks + skill
- [x] Hook-level verify (SessionStart inject, Stop fire-once + guard, valid JSON)
- [x] All artifacts converted to English
- [ ] Live verify: real new session + decide whether to commit `.claude/` to git (user decision)
