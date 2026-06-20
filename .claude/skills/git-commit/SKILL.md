---
name: git-commit
description: Use when creating git commits — stages changes, splits them into atomic commits, and writes Conventional Commit messages in English that match this repo's style. Triggers on "commit", "git commit", "save changes".
---

# Git Commit

Create clean, atomic commits with Conventional Commit messages that match the existing history of THIS repo.

## When to use

- The user asks to commit, "save changes", or stage and commit work.
- After finishing a unit of work that should be recorded in history.

Do NOT push, create branches, or open PRs unless explicitly asked — this skill stops at the commit.

## Workflow

Create a todo per step and follow in order. The flow is **inspect → propose → confirm → commit → verify**. Never run `git commit` before the user approves the plan.

1. **Inspect state** — run in parallel:
   - `git status` — see what's modified/untracked/staged.
   - `git diff` and `git diff --staged` — read the ACTUAL changes, never guess.
   - `git log --pretty=format:'%s' -15` — learn this repo's commit style (type prefixes, casing, scope usage).
2. **Detect style** from the log. Match the repo's Conventional Commit format, types, and scope conventions. **Always write the commit message in English**, regardless of the language used in prior commits or in the conversation.
3. **Propose a commit plan** — decide how to split the changed files into atomic commits (one logical change each). Files that belong to the same concern go together; unrelated changes (e.g. a feature + a config tweak) go in separate commits. Then present the plan to the user, e.g.:

   ```
   Proposing 2 commits for 5 files:

   Commit 1 — feat: add consultation request form (3 files)
     • src/components/ConsultForm.tsx
     • src/app/products/[slug]/page.tsx
     • src/lib/validation.ts

   Commit 2 — chore: configure ESLint + Prettier (2 files)
     • .eslintrc.json
     • .prettierrc
   ```

   State why you grouped them this way in one line if it isn't obvious.
4. **Confirm with the user** — ask for approval and wait. Make it easy to adjust: the user may merge groups, split further, reword a message, or drop a file. Re-present the plan if they change it. Do NOT proceed on silence or assume yes.
5. **Commit each group** — for every approved group: `git add <explicit paths>` then `git commit -m "<message>"` (multiple `-m` flags or a heredoc for a body). Stage only that group's files — never `git add -A` when the plan has more than one commit.
6. **Verify** — `git status` and `git log -<n> --stat` to confirm each commit landed with the intended files. Report the result; do not claim success without this check.

## Message format

```
<type>: <description>

<optional body — what & why, not how>
```

- **Subject**: imperative mood, lowercase after the colon, ≤ 72 chars, no trailing period.
- **Description language**: English. Always write the commit message in English, even when the repo history or the conversation is in another language.
- **Body** (optional): only when the change needs context — the motivation, trade-offs, or affected areas. Wrap at ~72 chars. Skip it for trivial changes.

### Types

| Type | Use for |
|------|---------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation, specs, design docs |
| `test` | Adding or fixing tests |
| `chore` | Tooling, deps, config, housekeeping |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

Add an optional scope when it clarifies the area: `feat(checkout): ...`.

## Rules

- **Always confirm before committing** — present the commit plan (file count + message per commit) and wait for explicit approval. Never commit on silence.
- **Write the message in English** — even when the repo history or the conversation is in another language.
- **NO attribution** — never add `Co-Authored-By`, "Generated with Claude", or any tool footer. Attribution is disabled globally.
- **Read the diff before writing the message** — the message must describe what actually changed, not what you intended.
- **One concern per commit** — split unrelated changes.
- **Never `git add` secrets** — scan the diff for `.env`, keys, tokens, passwords. Stop and warn if found.
- **Don't amend or rebase** published commits unless explicitly asked.
- **Don't run destructive commands** (`reset --hard`, `clean -fd`, force-push) as part of committing.

## Examples

Good:
```
feat: add flooring consultation form on the product page
fix: correct wrong price shown when switching m2 unit
docs: add Payload CMS architecture diagram to design doc
chore: configure ESLint and Prettier for the Next.js project
```

Bad:
```
update files                  → no type, vague
Fixed bug.                     → wrong case, trailing period, not imperative
feat: add form + fix pricing   → two concerns in one commit
docs: add design 🤖 Generated with Claude   → attribution footer
```
