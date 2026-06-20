---
name: git-commit-english
description: Commit messages in English following Conventional Commits
metadata:
  type: convention
  date: 2026-06-20
---

Commit messages in this repo are written in **English**, following Conventional Commits
(`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, ...).

**Why:** The repo's `git-commit` skill was rewritten to English with an English-output rule
(commit b9fc4f3). This is a specific case of [[english-only-artifacts]].

**How to apply:** When committing, use the `/git-commit` skill; the message is in English
even when the conversation is in Vietnamese.
