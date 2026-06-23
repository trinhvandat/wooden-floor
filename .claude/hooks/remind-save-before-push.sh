#!/usr/bin/env bash
# PreToolUse(Bash) hook — when pushing a FEATURE branch that carries real work
# but no .claude/memory/ update, turn the push confirmation into a save-memory
# suggestion, so feature + memory ship in ONE PR (not a follow-up save-memory PR).
#
# Not a wall: it only upgrades the prompt you'd already get (`git push` is in the
# settings `ask` list). Approve to push anyway, or cancel and run /save-memory +
# commit it on THIS branch first. Fires at most once per branch per session.
# Escape hatch: set ALLOW_PUSH_WITHOUT_MEMORY=1 to silence.
set -euo pipefail

[ "${ALLOW_PUSH_WITHOUT_MEMORY:-0}" = "1" ] && exit 0

input="$(cat)"

tool="$(printf '%s' "$input" | python3 -c "import sys,json;print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo '')"
[ "$tool" = "Bash" ] || exit 0

cmd="$(printf '%s' "$input" | python3 -c "import sys,json;print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null || echo '')"

# Only act when `git ... push` is in COMMAND position (start, or after a shell
# separator) so we don't trip on commands that merely mention it in a string.
printf '%s' "$cmd" | grep -Eq '(^|[;&|(])[[:space:]]*git( +-[^ ]+)* +push' || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
# Never on the protected/deployable branch — only short-lived feature branches.
case "$branch" in master|main|'') exit 0 ;; esac

# Remind at most once per branch per session.
flag="${TMPDIR:-/tmp}/claude-savemem-push-$(printf '%s' "$branch" | tr '/' '_')"
[ -f "$flag" ] && exit 0

base="master"

# Memory already committed on this branch since base? -> it'll ship in this PR; stay quiet.
mem_committed="$(git diff --name-only "${base}...HEAD" 2>/dev/null | grep -c '^\.claude/memory/' || true)"
[ "${mem_committed:-0}" -gt 0 ] && exit 0

# Uncommitted memory changes pending? -> already being handled; don't nag.
mem_pending="$(git status --porcelain 2>/dev/null | grep -c '\.claude/memory/' || true)"
[ "${mem_pending:-0}" -gt 0 ] && exit 0

# Real (non-memory) work on this branch since base? -> memory may genuinely be owed.
work="$(git diff --name-only "${base}...HEAD" 2>/dev/null | grep -v '^\.claude/memory/' | head -1 || true)"
[ -z "$work" ] && exit 0

touch "$flag"

cat <<EOF
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Branch '$branch' has code/doc work but no .claude/memory/ update. If this session made decisions, conventions, or WIP worth keeping, cancel and run /save-memory, then commit it on THIS branch so feature + memory ship in one PR. If nothing is worth saving, approve to push. (ALLOW_PUSH_WITHOUT_MEMORY=1 silences this.)"}}
EOF
