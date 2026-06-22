# HANDOFF — feat/review-pr-command — 2026-06-22

## Current goal
Add an automated **PR code-review** that audits a GitHub PR against FUKIONE standards and posts the result as a PR comment — **built, tested live, committed; PR #4 open into master (merge-conflict with master resolved).**

## Done (settled, do not redo)
- **`/review-pr [PR#]` command shipped** — `.claude/commands/review-pr.md` (registers as the `review-pr` skill). Hybrid adoption of Anthropic's official `/code-review` engine (multi-agent + confidence ≥80 + `gh pr comment`), with FUKIONE standards injected. See [[0007-adopt-code-review-pr]].
- **Investigated first:** no prior review-pr idea existed — git-flow only *promised* a separate review pass ([[git-flow-agent]]) with nothing wired up. The official `code-review` plugin (Boris Cherny) is installed + enabled and posts to GitHub, but only reads root `CLAUDE.md` — it misses FUKIONE's Gotchas + `.claude/memory/conventions/`. Hence the wrapper.
- **Tested live on PR #3** (the Payload backend scaffold): 3 parallel agents (standards / bug / security). **0 issues cleared the ≥80 filter** → posted a "no blocking issues" comment with non-blocking notes: https://github.com/trinhvandat/wooden-floor/pull/3#issuecomment-4765199978
  - Key result: the filter worked. Agents flagged "scary" security items (Users role privilege-escalation, Settings write, PAYLOAD_SECRET `|| ''`), but the `Users.ts:4` comment "`role` drives Phase-2 access control" + Payload secure-by-default revealed them as **intentional Phase-2 deferral** → confidence < 80 → not spammed onto the PR.
- **Committed (2 commits) + pushed**; PR #4 opened. **PR #3 (scaffold backend) is now MERGED** to master; merged master back into this branch and resolved the memory conflicts (MEMORY/HANDOFF/sessions — kept both 0006 and 0007 lines, all conventions, all session entries).

## In progress / Next steps
- **Merge PR #4** (squash, per [[0004-git-flow-trunk-based]]) once green.
- Restore the user's stashed WIP if not already done: `git switch feat/scaffold-payload-backend && git stash pop` (their `.env` change is at `stash@{0}`) — though that branch is now merged, so the stash may be discardable.
- Optional: run a real `/review-pr` on a PR that has genuine defects to confirm the ≥80 post path end-to-end (PR #3 was clean).

## Settled decisions + rationale
- Reuse the official `/code-review` engine, widen standards to FUKIONE — hybrid, mirrors the design-review adoption [[0005-adopt-onredoak-design-review]]. Full rationale: [[0007-adopt-code-review-pr]].
- `/review-pr` is the **separate review pass** the trunk-based git-flow [[0004-git-flow-trunk-based]] mandates — run it from a non-authoring context, never self-approve.
- Reading PR-head files for citations needs `gh api .../contents?ref=SHA | base64 -d` (not `git show`) — [[review-pr-read-files-via-gh-api]].
- Backend now exists on master: Payload 3 embedded, `(app)`/`(payload)` route split, 8 collections — [[0006-embed-payload-backend]], [[payload-next16-compat]].

## Context to Load (paths only, do NOT paste contents)
- .claude/commands/review-pr.md
- .claude/memory/decisions/0007-adopt-code-review-pr.md
- .claude/memory/conventions/review-pr-read-files-via-gh-api.md
- .claude/memory/conventions/git-flow-agent.md

## Blocked / Needs user input
- None.
