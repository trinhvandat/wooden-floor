# HANDOFF — feat/review-pr-command — 2026-06-22

## Current goal
Add an automated **PR code-review** that audits a GitHub PR against FUKIONE standards and posts the result as a PR comment — **built + tested live; uncommitted on branch `feat/review-pr-command` (off master).**

## Done (settled, do not redo)
- **`/review-pr [PR#]` command shipped** — `.claude/commands/review-pr.md` (registers as the `review-pr` skill). Hybrid adoption of Anthropic's official `/code-review` engine (multi-agent + confidence ≥80 + `gh pr comment`), with FUKIONE standards injected. See [[0007-adopt-code-review-pr]].
- **Investigated first:** no prior review-pr idea existed — git-flow only *promised* a separate review pass ([[git-flow-agent]]) with nothing wired up. The official `code-review` plugin (Boris Cherny) is installed + enabled and posts to GitHub, but only reads root `CLAUDE.md` — it misses FUKIONE's Gotchas + `.claude/memory/conventions/`. Hence the wrapper.
- **Tested live on PR #3** (`feat/scaffold-payload-backend`, the Payload backend scaffold): 3 parallel agents (standards / bug / security). **0 issues cleared the ≥80 filter** → posted a "no blocking issues" comment with non-blocking notes: https://github.com/trinhvandat/wooden-floor/pull/3#issuecomment-4765199978
  - Key result: the filter worked. Agents flagged "scary" security items (Users role privilege-escalation, Settings write, PAYLOAD_SECRET `|| ''`), but the `Users.ts:4` code comment "`role` drives Phase-2 access control" + Payload secure-by-default revealed them as **intentional Phase-2 deferral** → confidence < 80 → not spammed onto the PR.
- Memory written: decision `0007`, convention [[review-pr-read-files-via-gh-api]], `git-flow-agent` review-pass step now points to `/review-pr`, MEMORY index updated.

## In progress / Next steps
- **Commit + open PR** for `feat/review-pr-command` into master (5 files: command, decision 0007, new convention, MEMORY.md, git-flow-agent.md) — NOT done; user only asked to test, not commit.
- Restore the user's stashed WIP: `git switch feat/scaffold-payload-backend && git stash pop` (their `.env` change is at `stash@{0}`).
- Optional: run a real `/review-pr` on a PR that has genuine defects to confirm the ≥80 post path end-to-end (PR #3 was clean).

## Settled decisions + rationale
- Reuse the official `/code-review` engine, widen standards to FUKIONE — hybrid, mirrors the design-review adoption [[0005-adopt-onredoak-design-review]]. Full rationale: [[0007-adopt-code-review-pr]].
- `/review-pr` is the **separate review pass** the trunk-based git-flow [[0004-git-flow-trunk-based]] mandates — run it from a non-authoring context, never self-approve.
- Reading PR-head files for citations needs `gh api .../contents?ref=SHA | base64 -d` (not `git show`) — [[review-pr-read-files-via-gh-api]].

## Context to Load (paths only, do NOT paste contents)
- .claude/commands/review-pr.md
- .claude/memory/decisions/0007-adopt-code-review-pr.md
- .claude/memory/conventions/review-pr-read-files-via-gh-api.md
- .claude/memory/conventions/git-flow-agent.md

## Blocked / Needs user input
- None. Branched from `master`, so this branch lacks PR #3's memory advances (0006, hook-paths/payload-next16 conventions) — expected; resolve at merge time. User's `.env` WIP is safe in `stash@{0}` until restored.
