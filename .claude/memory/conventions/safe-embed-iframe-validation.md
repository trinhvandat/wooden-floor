---
name: safe-embed-iframe-validation
description: Render operator-supplied embeds (Google Maps, etc.) through a host-allowlist validator into a controlled <iframe>, never dangerouslySetInnerHTML
metadata: { type: convention, date: 2026-06-26 }
---
Operator-filled embed fields (e.g. `Settings.mapEmbed`) are free-form and untrusted at render
time. Never inject them as HTML (`dangerouslySetInnerHTML`) — that is an XSS/clickjacking surface.

**Pattern** (`lib/maps.ts` → `extractMapSrc`): a pure function turns the free-form value into a
safe `<iframe src>` or `null`:
- Accept either a bare URL or a full `<iframe …src="…">` snippet (regex-extract the `src`).
- Parse with the `URL` constructor (not hand-rolled) so `hostname` reflects the true host —
  this defeats userinfo/fragment confusion (`https://www.google.com@evil.com/…` → host `evil.com`).
- Allow ONLY: `protocol === "https:"`, host in an allowlist `Set`, and an expected path
  (`/maps` exact or `/maps/` subpath — `startsWith("/maps")` alone over-matches `/maps-evil`).
- Return `null` on any failure; the caller renders `{src && <iframe src={src} title=… loading="lazy"/>}`
  and a plain link fallback when `null`. So an unsafe value degrades to a link, never an injection.

**Why:** keeps a CMS-editable embed safe without losing operator flexibility; the iframe src is
provably only ever a validated allowlisted URL. **How to apply:** for any future operator embed
(YouTube, another map), add a host allowlist + path check in the same shape and unit-test the
bypass vectors (host confusion, protocol-relative, `javascript:`/`data:`, multi-`src` snippets).
Related: [[0015-about-page-maps]].
