---
name: stop-hook-loop-guard
description: How to write a Stop hook that nudges without causing an infinite loop
metadata:
  type: convention
  date: 2026-06-20
---

A Stop hook fires at the **end of every assistant turn** (not only at session close). If the
hook returns `{"decision":"block","reason":...}` to nudge for an action, it forces Claude to
continue → easy to loop.

**Why:** A block makes Claude continue with `reason` as a new prompt; when it stops again the
hook fires again → infinite loop.

**How to apply:** Two guard layers in `remind-save.sh`:
1. Read `stop_hook_active` from stdin — if `true` (this turn was triggered by the hook
   itself), `exit 0`.
2. A flag file keyed by `session_id` (`$TMPDIR/claude-save-reminded-<sid>`) — fire once per
   session, stay silent afterwards.
3. Only fire when there are uncommitted changes outside `.claude/memory/` (filter via
   `git status --porcelain`).

Related: [[0002-project-memory-self-contained]].
