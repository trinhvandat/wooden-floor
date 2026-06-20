#!/usr/bin/env bash
# PreToolUse(Bash) hook — block `git commit` while on a protected branch.
# Enforces the trunk-based git-flow: branch first, never commit risky work to the
# default/deployable branch. See .claude/memory/conventions/git-flow-agent.md.
#
# Guard-rail, not a wall: set ALLOW_MASTER_COMMIT=1 to deliberately commit a
# trivial change (docs/chore) straight to the default branch.
set -euo pipefail

# Deliberate override — let it through.
[ "${ALLOW_MASTER_COMMIT:-0}" = "1" ] && exit 0

input="$(cat)"

tool="$(printf '%s' "$input" | python3 -c "import sys,json;print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo '')"
[ "$tool" = "Bash" ] || exit 0

cmd="$(printf '%s' "$input" | python3 -c "import sys,json;print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null || echo '')"

# Only act when `git ... commit` is in COMMAND position (start, or after a shell
# separator) so we don't trip on commands that merely mention "git commit" in a
# quoted string (echo/grep/printf). Allows `git -C x commit`, `git commit -m`, etc.
printf '%s' "$cmd" | grep -Eq '(^|[;&|(])[[:space:]]*git( +-[^ ]+)* +commit' || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
case "$branch" in
  master|main) ;;
  *) exit 0 ;;
esac

cat <<EOF
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked: on protected branch '$branch'. Per the trunk-based git-flow, branch first: run 'git switch -c feat/<slug>' (or fix/chore/<slug>), commit there, then PR -> squash-merge. See .claude/memory/conventions/git-flow-agent.md. For a deliberate trivial commit straight to '$branch', re-run the command prefixed with ALLOW_MASTER_COMMIT=1."}}
EOF
