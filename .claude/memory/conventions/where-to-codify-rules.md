---
name: where-to-codify-rules
description: rules that must ALWAYS apply (incl. for subagents) go in CLAUDE.md; memory holds detail + rationale. The SessionStart memory hook does NOT reach subagents.
metadata:
  type: convention
  date: 2026-06-20
---

When codifying a rule the project must follow, pick the layer by how it loads:

| Layer | Loads | Reaches subagents? |
|---|---|---|
| `CLAUDE.md` | always injected, every session | **yes** |
| SessionStart hook → `MEMORY.md` + `HANDOFF.md` | main session only | **no** |
| `decisions/` + `conventions/` files | read on demand "when relevant" | no |
| PreToolUse hook on a tool | every matching tool call (deterministic) | yes |

**Why:** memory files are **passive** — a fresh session sees only the one-line index and may
not open the full file. More importantly, subagents spawned via the Agent tool (executor,
code-reviewer, …) do **not** receive the SessionStart memory injection; they only get
`CLAUDE.md`. So a rule that lives only in `.claude/memory/` will be silently skipped by
subagents.

**How to apply:** put the short **rule** (must-always-follow) in `CLAUDE.md` with a pointer to
the memory file; keep the **detail + rationale** in `decisions/`/`conventions/`. For absolute
machine-enforcement (can't be skipped), add a PreToolUse hook. This is exactly how
[[git-flow-agent]] was wired: one Branching line in CLAUDE.md → full pipeline in the convention
file. Related: [[0002-project-memory-self-contained]].
