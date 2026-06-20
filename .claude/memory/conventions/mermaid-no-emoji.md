---
name: mermaid-no-emoji
description: Do not use emoji or « » guillemets in Mermaid diagrams
metadata:
  type: convention
  date: 2026-06-20
---

In Mermaid diagrams (use case, class, etc.), do NOT use emoji and do NOT use « »
guillemets.

**Why:** Rendering/terminal fonts lack glyphs for these characters, so they show up as
empty boxes (tofu), making the diagram look broken.

**How to apply:** Use plain text labels for nodes.
Related: [[0001-connect-actors-directly]].
