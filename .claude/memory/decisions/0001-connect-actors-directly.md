---
name: 0001-connect-actors-directly
description: Connect each actor directly to each use case instead of grouping syntax
metadata:
  type: decision
  date: 2026-06-20
---

In use case diagrams (Mermaid), connect **each** actor directly to **each** use case.

**Why:** The grouping syntax (using `&` to link one actor to multiple nodes at once) makes
Mermaid merge the nodes incorrectly, breaking the diagram layout.

**How to apply:** Write each actor → use case edge separately; do not use `&`.
Related: [[mermaid-no-emoji]].
