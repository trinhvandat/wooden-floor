# HANDOFF — About page + Google Maps (M4-B slice 2) ready to PR — 2026-06-26

## Current goal
About page (M4-B slice 2) is code-complete + fully verified on branch `feat/about-maps`
(6 commits, memory saved on-branch; not yet pushed). M4-B now has projects gallery ✅ + about/Maps ✅;
the last M4-B slice is the blog from the Articles collection.

## Done (settled, do not redo)
- **About page** (this branch) — built via subagent-driven development (3 tasks + 1 hardening),
  all reviewed (per-task + opus whole-branch "Ready to merge: YES", no Critical/Important):
  - `/gioi-thieu` static page: hero/story (`<h1>`), trust-stat block, showroom map+contact, lead CTA.
  - **`extractMapSrc`** (`lib/maps.ts`, unit-tested 8×): safe Google-Maps embed src from the free-form
    `Settings.mapEmbed` — host allowlist + `/maps`-exact-or-`/maps/` path, controlled `<iframe>`, never
    `dangerouslySetInnerHTML`; null → "Xem bản đồ" link fallback. See [[safe-embed-iframe-validation]].
  - **`ProjectQuoteCta` → shared `LeadCtaSection({ settings, title, body })`** (projects page unchanged
    in behaviour; both pages use it; no context → source "quote").
  - Nav "Giới thiệu" → `/gioi-thieu` (Header + MobileNav); `/gioi-thieu → /about` rewrite; sitemap entry;
    LocalBusiness + breadcrumb JSON-LD. See [[0015-about-page-maps]].
  - Verified: tsc 0, lint 0 (2 pre-existing seed.ts warnings), tests 53/53, `pnpm build` exit 0
    (/about static, served /gioi-thieu), design-review @375+1440 PASS (0 console errors). Map iframe-set
    state verified by composition (extractMapSrc unit-tested + reviewed guard), not live-screenshotted.
- Earlier (merged to master): projects gallery (PR #17), Slice 3 conversion polish (PR #16).

## In progress / Next steps
- **Push `feat/about-maps` + open PR** (memory ships in same PR), then `/review-pr`.
- **M4-B remaining**: blog from the Articles collection (`/tin-tuc` list + detail).
- Deferred polish (non-blocking): footer repeats showroom block on mobile (sitewide footer); add a
  `hover:`/`active:` state to the shared `LeadCtaSection` button (also helps the projects CTA);
  14px/12.5px about copy small; section `aria-label`s; "Trọn gói" stat card wraps to 2 lines.
  Carried over: projects gallery follow-ups (depth:1 test assertion, gallery key hardening, etc.).

## Settled decisions
- [[0015-about-page-maps]] — about page at /gioi-thieu; reuse Settings + LeadCtaSection; map only when configured.
- [[safe-embed-iframe-validation]] — operator embeds → host-allowlist validator → controlled iframe, never raw HTML.

## Cleanup / known (not blocking, carried over)
- `src/components/CtaStrip.tsx` is DEAD CODE (own Zalo guard) — delete or settings-wire in a cleanup.
- Home `metadata.description` still mentions Zalo while the CTA is hidden — self-heals once OA URL set.
- Two `LocalBusiness` JSON-LD emitters (home + about) without a shared `@id` — fine for now (spec §6).

## Context to Load (paths only, do NOT paste contents)
- .claude/memory/decisions/0015-about-page-maps.md
- docs/superpowers/specs/2026-06-26-about-maps-design.md
- fukione-web/src/lib/maps.ts
- fukione-web/src/app/(app)/about/page.tsx
- fukione-web/src/components/site/LeadCtaSection.tsx

## Blocked / Needs user input
- None. Branch is green + verified; awaiting push/PR.

ACTION: About page is green + verified. Push + open PR (memory on-branch), run /review-pr, then
M4-B blog (Articles) when asked.
