---
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh pr list:*), Bash(gh pr comment:*), Bash(gh search:*), Bash(gh api:*), Bash(git:*), Read, Grep, Glob, LS, Task, TodoWrite
description: Review a GitHub PR against FUKIONE project standards and post the review as a PR comment
---

You are running a **FUKIONE code review** of a GitHub pull request, then posting the result back as a PR comment via `gh`. FUKIONE is a lead-gen-first wooden-flooring retail site (Hà Nội, Phase 1). Review against the **project's own standards**, not a generic checklist.

TARGET PR: `$ARGUMENTS`
- If `$ARGUMENTS` is empty, resolve the PR for the current branch with `gh pr view --json number,headRefName,state,isDraft`.
- If no PR exists for the current branch, stop and tell the user to open one first (or pass a PR number).

## Project standards (the definition of "good" — load these as review criteria)

These hold the real FUKIONE rules. The generic `/code-review` only reads `CLAUDE.md`; this command deliberately goes wider. Read what is relevant to the changed files:

1. **`CLAUDE.md`** (root) — stack, conventions, and especially the **Gotchas** and **Scope boundaries (YAGNI)** sections. High-signal invariants to enforce:
   - Prices/unit-costs live in the Payload **`Settings` collection** — never hardcoded in code.
   - **Leads must never be lost:** write the lead to the DB **first**, then send email as a separate best-effort step with retry. DB write is the source of truth.
   - Public URLs are **Vietnamese-no-accent** (`/san-pham`, `/bao-gia`, `/dat-lich-khao-sat`) — do not "fix" to English.
   - **Payload-generated artifacts** (migrations, generated types, `/admin`) are generated — must not be hand-edited; the collection schema is changed instead.
   - **Secrets** only in `.env` (never committed, never hardcoded).
   - Phase-1 **out-of-scope** work (cart/online payment, realtime inventory, B2B portal, AR, separate Spring Boot service, multi-language) should not be introduced.
2. **`.claude/memory/conventions/`** — durable conventions. At minimum check: `english-only-artifacts.md` (all repo artifacts in English), `git-commit-english.md`, `mermaid-no-emoji.md` (no emoji / « » in diagrams).
3. **`.claude/memory/decisions/`** — read any decision whose area the PR touches (e.g. `0004-git-flow-trunk-based.md`, `0006-embed-payload-backend.md`) to avoid flagging deliberate choices as bugs.
4. **`CLAUDE.md` §Testing** — risk-priority for test coverage: (1) cost calculator unit, (2) form → create lead → email integration, (3) the two golden e2e flows. Flag missing tests **only** on these high-risk paths, not everywhere.
5. For **front-end / UI** changes, defer the visual critique to the dedicated `/design-review` command/`design-review` agent — mention it in the comment rather than duplicating it here.

## Procedure (precise — make a TODO list first)

1. **Eligibility (Haiku agent).** Check whether the PR is (a) closed, (b) a draft, (c) trivial/automated and obviously fine, or (d) already has a FUKIONE code-review comment from you. If any apply, **stop** and report why — do not post.
2. **Gather standards (Haiku agent).** Return the list of file *paths* (not contents) of the standards above that are relevant to the directories the PR modifies. Always include root `CLAUDE.md`.
3. **Summarize (Haiku agent).** `gh pr view` + `gh pr diff` → a short summary of the change and the list of changed files with their full blob SHA (`gh pr view --json headRefOid`).
4. **Review — launch 5 parallel Sonnet agents.** Each returns a list of issues, and for each issue the reason it was flagged (FUKIONE-standard adherence / bug / git history / prior-PR comment / code-comment). Pass the standards file paths from step 2 to every agent.
   - **Agent #1 — FUKIONE standards compliance:** audit the diff against the standards files above (root `CLAUDE.md` Gotchas + `.claude/memory/conventions/` + relevant decisions). Remember `CLAUDE.md` is guidance for writing code — not every line is a review rule; apply judgement.
   - **Agent #2 — bug scan:** read only the changed hunks, shallow scan for *large* bugs. Skip nitpicks and likely false positives.
   - **Agent #3 — historical context:** `git blame`/history of the modified lines to catch regressions in light of past changes.
   - **Agent #4 — prior-PR context:** previous PRs touching these files; surface earlier review comments that still apply.
   - **Agent #5 — code-comment compliance:** read comments in the modified files; ensure the change honors guidance written in them.
5. **Score confidence (one Haiku agent per issue, parallel).** Give each agent the PR, the issue, and the standards file paths. Score 0–100 (rubric verbatim):
   - **0:** false positive / doesn't survive light scrutiny / pre-existing.
   - **25:** might be real, couldn't verify; if stylistic, not explicitly called out in a FUKIONE standards file.
   - **50:** verified real, but a nitpick or rare in practice; low importance relative to the PR.
   - **75:** double-checked, very likely hit in practice and the PR's approach is insufficient — or it's directly named in a FUKIONE standards file (Gotcha/convention/decision).
   - **100:** confirmed, will happen frequently, evidence directly proves it.
6. **Filter** out issues scoring **< 80**. If none remain, post the "no issues" comment (step 8).
7. **Re-check eligibility (Haiku agent)** — repeat step 1 so a PR that was closed/merged mid-review is not commented on.
8. **Post via `gh pr comment`.** Brief, no emojis in the issue body, cite and link every issue.

## False positives to drop (steps 4 & 5)

- Pre-existing issues on lines the PR did not modify.
- Things that look like a bug but are intentional / part of the broader change.
- Pedantic nitpicks a senior engineer would not raise.
- Anything a linter / type-checker / compiler / CI would catch (imports, type errors, formatting, broken tests) — assume CI runs separately; **do not** build or typecheck here.
- General quality gaps (coverage, generic security, docs) **unless** a FUKIONE standards file explicitly requires it.
- A flagged standard that is explicitly silenced in code (e.g. lint-ignore).

## Comment format (follow exactly)

Use `gh pr comment <number> --body "..."`. For issues found:

```markdown
### FUKIONE code review

Found N issues:

1. <brief description> (CLAUDE.md says "<...>" / .claude/memory/conventions/<file> / bug)

<link to file+lines with FULL sha1, e.g. https://github.com/trinhvandat/wooden-floor/blob/<full-sha>/fukione-web/src/...#L12-L18>

2. <brief description> (<source of the rule>)

<link to file+lines with full sha1>
```

If no issues:

```markdown
### FUKIONE code review

No issues found. Checked for bugs and FUKIONE standards compliance (CLAUDE.md Gotchas, conventions, decisions).
```

### Linking rules (GitHub Markdown will not render otherwise)

- Use the **full** git SHA from `gh pr view --json headRefOid` — never `$(git rev-parse HEAD)` substitution, the body is rendered as literal Markdown.
- Format: `https://github.com/trinhvandat/wooden-floor/blob/<full-sha>/<path>#L<start>-L<end>` — `#` after the path, `L<start>-L<end>` range, at least 1 line of context above and below the target line.
- Repo in the link must match the PR's repo.

### Output conventions

- Keep the comment brief and in **English** (repo-artifact convention — see `.claude/memory/conventions/english-only-artifacts.md`).
- No emojis in issue descriptions.
- Your final reply to the user must state: the PR reviewed, how many issues were posted (and the comment URL), or why no comment was posted.
