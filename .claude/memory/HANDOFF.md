# HANDOFF — master — 2026-06-20

## Current goal
Build a project memory system (cross-session catch-up) that lives in `.claude/memory/`.

## Done (settled, do not redo)
- Architecture: separate durable (decisions/conventions) from ephemeral (HANDOFF/sessions)
- SessionStart hook (load-memory.sh) + Stop hook (remind-save.sh) at project level
- `/save-memory` skill; seeded decisions/conventions from repo history
- All project artifacts converted to English (chat stays Vietnamese)
- ECC summary left on for A/B testing

## In progress / Next steps
- [x] Hook-level verify: SessionStart inject OK, Stop fire-once + guard OK, valid JSON
- [x] Ran /save-memory end-to-end (produced decision 0002 + stop-hook-loop-guard convention)
- [ ] **User decision:** commit `.claude/` to git or not (the core of the "lives with git" idea)
- [ ] Live verify: open a NEW real session to confirm the hook injects (so far only tested by running the script by hand)

## Settled decisions + rationale
- Self-contained system in the repo, NOT wrapped around OMC/ECC (external plugins; OMC inert, ECC low quality)
- Skill placed locally in `.claude/skills/` (not global)
- English for all artifacts; Vietnamese only for user-Claude chat

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/README.md
- .claude/skills/save-memory/SKILL.md
- PLAN.md

## Blocked / Needs user input
- Commit decision (see above)
