---
name: 0002-project-memory-self-contained
description: Catch-up memory system is self-contained in the repo, not wrapped around OMC/ECC
metadata:
  type: decision
  date: 2026-06-20
---

The project memory system (`.claude/memory/` + hooks + the `/save-memory` skill) is designed
to be **self-contained in the repo**, NOT integrated with or wrapped around the global OMC or
ECC plugins.

**Why:** Inspection showed `.omc/project-memory.json` is inert (empty techStack, empty
customNotes), and the "ECC summary" injected at SessionStart comes from the
`everything-claude-code` plugin (low quality: it logs command echoes instead of meaning).
Both are external plugins that do not live in the project, so wrapping them would couple the
system to something that is not version-controlled. The goal is memory that travels with git
so a newcomer who clones the repo gets it immediately.

**How to apply:** Keep everything under the repo's `.claude/`. Separate durable
([[mermaid-no-emoji]], decisions) from ephemeral (HANDOFF, sessions). Leave the ECC summary
on for A/B comparison; do not disable it. Hybrid trigger: Stop hook nudges → skill distills
(see [[stop-hook-loop-guard]]).
