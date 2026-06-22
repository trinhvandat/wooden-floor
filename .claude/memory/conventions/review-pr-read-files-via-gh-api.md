---
name: review-pr-read-files-via-gh-api
description: when /review-pr reviews a PR whose branch is not checked out locally, read files at the PR head SHA via `gh api .../contents?ref=SHA | base64 -d`, not `git show` — the SHA's objects may be absent from the worktree
metadata: { type: convention, date: 2026-06-22 }
---
`/review-pr` ([[0007-adopt-code-review-pr]]) reviews a PR from a **separate context** (the git-flow review pass) — typically a branch that is *not* the PR's own branch. The PR head commit/objects are then often **not present** in the local worktree, so `git show <sha>:path` returns empty (and a shallow `git fetch` of the branch may still not make that exact tree reachable).

To cite exact line numbers in the review comment, read the file at the PR head SHA through the GitHub API instead:

```bash
SHA=$(gh pr view <N> --json headRefOid --jq .headRefOid)
gh api "repos/<owner>/<repo>/contents/<path>?ref=$SHA" --jq '.content' | base64 -d | cat -n
```

`gh pr diff <N>` is enough to *see* the change, but for the `blob/<full-sha>#Lx-Ly` permalinks the comment needs (rendered as literal Markdown), pull the full file at that SHA so the line ranges are accurate. Always use the **full** `headRefOid` in the link, never `$(git rev-parse HEAD)` substitution.
