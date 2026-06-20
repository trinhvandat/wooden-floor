---
name: settings-permission-grant-needs-approval
description: editing .claude/settings.json to ADD permission allow-rules is blocked by the auto-mode classifier — needs explicit user approval, not just a plan/tier confirmation
metadata: { type: convention, date: 2026-06-20 }
---
Adding `permissions.allow` (wildcard) rules to `.claude/settings.json` is treated as a self-modification / permission-grant: the Claude Code auto-mode classifier **denies it** even after the user has confirmed a plan, because it widens the agent's auto-approval scope. A tier/plan confirmation does NOT count as approval of the specific rules.

**Why:** broadening auto-approved tools is security-sensitive; the user must approve the exact rules.

**How to apply:** when a harness step needs to write permission rules, show the user the exact `permissions` block and get explicit approval (re-run the Edit so they approve at the prompt, or have them paste it). Also: merge into the existing `settings.json` rather than overwriting it, to keep the project-memory hooks. Related: [[0003-adopt-shipwithai-tier1-harness]], [[stop-hook-loop-guard]].
