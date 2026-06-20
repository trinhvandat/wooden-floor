---
name: git-flow-agent
description: how to run git-flow with Claude Code agents — branch-per-task, worktrees for parallel agents, separate review pass, squash-merge
metadata:
  type: convention
  date: 2026-06-20
---

The agent-driven git workflow for this repo. Decision + rationale in [[0004-git-flow-trunk-based]].

**Branch naming:** `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`. Short-lived
(hours, not weeks). Delete after merge.

**One-task lifecycle:**
1. Plan (large task) → `/plan` or planner agent.
2. Branch → `git worktree add ../wf-<slug> feat/<slug>` (worktree only when running agents in parallel; otherwise a plain branch is fine).
3. TDD for high-risk paths first — cost calculator, lead→email — via `superpowers:test-driven-development`.
4. Build → executor agent, or `Agent(..., isolation: "worktree")` for parallel work.
5. **Review pass (separate context)** → code-reviewer / `typescript-reviewer` agent. Never self-approve in the authoring context.
6. Commit → `/git-commit` (atomic, Conventional Commits, English — see [[git-commit-english]]).
7. Verify → `pnpm test`; Vercel preview deploy lands on the PR automatically.
8. Merge → **squash** into `master`, then delete branch + worktree.
9. Memory → `/save-memory` to update HANDOFF + sessions.

**Why:**
- Worktrees give each parallel agent an isolated checkout sharing one `.git`, so two agents editing the same files can't corrupt each other's working tree.
- PRs are kept (even solo) for the Vercel preview URL + Lighthouse gate.
- Authoring and review stay in separate passes (global CLAUDE.md rule).

**How to apply:** default to this for any non-trivial change. Trivial one-liners may go
straight to a branch without the full pipeline, but still branch off `master` — don't commit
risky work to the default branch. Keep diagrams/docs English-only ([[english-only-artifacts]]).
