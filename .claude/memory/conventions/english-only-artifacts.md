---
name: english-only-artifacts
description: All project artifacts are written in English; only user-Claude chat is Vietnamese
metadata:
  type: convention
  date: 2026-06-20
---

Every artifact committed to this project — `docs/**`, everything under `.claude/**`
(memory, skills, hooks, settings), `PLAN.md`, code comments, commit messages — is written
in **English**.

**Why:** Keeps the repository consistent and onboardable by anyone, regardless of language.
The Vietnamese conversation between the user and Claude is a working channel only, not a
project artifact.

**How to apply:** Think/discuss with the user in Vietnamese, but write every file in
English. This generalizes [[git-commit-english]] to all artifacts, not just commits.
