---
name: 0004-git-flow-trunk-based
description: adopt trunk-based git-flow (master + short-lived branch-per-task + PR + squash-merge), NOT classic GitFlow; git worktrees isolate parallel agents
metadata: { type: decision, date: 2026-06-20 }
---
Adopted a **trunk-based / GitHub-Flow** branching model for FUKIONE, explicitly rejecting classic GitFlow (`develop` + `release/*` + `hotfix/*`). The model is: `master` is always deployable; each task gets a **short-lived branch** (`feat/*`, `fix/*`, `chore/*`) → PR → **squash-merge** → delete branch. Parallel Claude Code agents each run in their **own git worktree** so they never collide on one working tree.

**Why:** the project is **solo + greenfield + continuous deploy to Vercel**. Classic GitFlow assumes a team integrating on `develop` and batched releases stabilised on `release/*` — none of those apply here. Vercel's **per-branch preview deploys** already provide the staging/QA gate that `release/*` exists for, and the Lighthouse CI gate (CLAUDE.md §Testing) runs on PRs. Long-lived branches also fight the agent workflow, where diffs land in hours, not weeks.

**How to apply:**
- Keep `master` green and deployable; never commit risky work directly to it (branch first). Mechanics + agent pipeline live in [[git-flow-agent]].
- PRs are kept even though solo: they attach the Vercel preview URL (mobile-first project → click-test on phone) and trigger the Lighthouse gate.
- Parallel agents → `Agent(..., isolation: "worktree")` or the `superpowers:using-git-worktrees` skill; merge each branch back to `master` when done.
- Commit discipline is unchanged — Conventional Commits in English via `/git-commit` — see [[git-commit-english]].
- Review is a **separate pass** (code-reviewer agent), never self-approve in the authoring context (global CLAUDE.md rule).
- Revisit if Phase 2 adds a team or the Spring Boot service (then a `develop` integration branch may earn its keep). Related: [[0003-adopt-shipwithai-tier1-harness]].
