# FUKIONE Style Guide (tokens — source of truth)

> Mirrors the real tokens declared in `fukione-web/src/app/globals.css` and the fonts in
> `fukione-web/src/app/layout.tsx`. When code and this file disagree, **globals.css wins** —
> update this file to match, never hardcode hex in components.

## Dev server & routes (for the design-review agent)

- App lives in `fukione-web/`. Run: `cd fukione-web && pnpm dev` → `http://localhost:3000`.
- Public routes (Vietnamese-no-accent, do not anglicize):
  - `/` — home (editorial redesign)
  - `/san-pham` — product catalog + filters
  - `/bao-gia` — cost calculator / quote
  - `/dat-lich-khao-sat` — survey booking
  - `/cam-on` — thank-you
  - `/_scratch` — component verification harness (delete before commit; not a shipped page)

## Typography

- **Display / headings:** Fraunces (`--font-display`, fallback Georgia, serif) — the editorial voice.
- **Body / UI:** Be Vietnam Pro (`--font-sans`) — full Vietnamese diacritics support.
- **Mono:** Geist Mono (`--font-geist-mono`) — incidental only.
- Limited weights; do not introduce new font families. Headings carry the brand; body stays calm and readable.

## Color tokens (FUKIONE palette)

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#FAF7F2` | Warm paper page background |
| `--color-surface` | `#FFFFFF` | Cards / raised surfaces |
| `--color-surface-warm` | `#F2EEE7` | Secondary warm surface |
| `--color-ink` | `#241F1B` | Primary text (near-black brown) |
| `--color-muted` | `#6B6259` | Secondary / supporting text |
| `--color-cta` | `#E8852B` | **Primary CTA only** (orange) |
| `--color-cta-ink` | `#9C5A16` | CTA text on soft/orange backgrounds |
| `--color-trust` | `#0F766E` | **Trust signals only** (teal) — warranty, guarantees, credibility |
| `--color-wood` | `#6B4A2E` | Wood accent |
| `--color-wood-soft` | `#C8A97A` | Soft wood accent |
| `--color-line` | `#ECE5DC` | Borders / dividers |
| `--color-field` | `#F4F1EB` | Input background |
| `--color-cta-soft-from/to` | `#FBEFE0` → `#F6E2CC` | Soft CTA gradient surface |
| `--color-trust-soft` / `-border` | `#EAF5F3` / `#D3ECE8` | Soft trust surface |
| `--color-result-bg` / `-border` | `#FBF6EF` / `#E6C9A6` | Calculator result block |

**Usage rules**
- Orange (`--color-cta`) is the scarce, high-signal color — reserve it for the single primary action per view. Overuse kills its meaning.
- Teal (`--color-trust`) means "you can trust this" — warranty, certifications, guarantees. Do not use it as a generic accent.
- All text must clear WCAG AA (4.5:1). White text on `--color-cta` orange is borderline — verify per use; prefer `--color-cta-ink` on soft orange surfaces.

## Radius & shape

| Token | Value | Use |
|---|---|---|
| `--radius-pill` | `999px` | Chips, pills, badges |
| `--radius-card` | `14px` | Cards |
| `--radius-input` | `10px` | Inputs, buttons |
| `--radius-sheet` | `22px` | Bottom sheets / modals |

## Shadows (soft & warm — never hard)

- `--shadow-cta` — glow under primary CTA.
- `--shadow-card` — subtle card lift.
- `--shadow-bar` — sticky bottom CTA bar.
- `--shadow-sheet` — bottom-sheet elevation.

## Motion

- `.fk-rise` — staggered entrance reveal (0.8s, custom ease); set `animationDelay` inline to stagger.
- `.fk-grain` — film-grain atmosphere overlay (fixed, pointer-events-none).
- **`prefers-reduced-motion: reduce` disables `fk-rise`** — keep this honored for any new motion.

## Do / Don't

- DO: use tokens via Tailwind utilities (`text-ink`, `bg-bg`, `text-muted`, `bg-cta`...).
- DO: keep the page on the warm paper background; let white surfaces and wood accents carry depth.
- DON'T: hardcode hex values, add new fonts, use orange for non-primary actions, or use teal as decoration.
- DON'T: ship `/_scratch` — it is a dev harness.
