# Visual Design — FUKIONE Wooden-Floor Website (Phase 1)

**Date:** 2026-06-21
**Direction:** "Disciplined Trust Commerce" — conversion-driven, tempered toward premium.
**Scope:** Phase B of the UI/UX work. This is the developer-facing reference for setting up the
Tailwind theme + shadcn/ui tokens and styling components.
**Related:**
- `2026-06-20-fukione-uiux-design.md` (Phase A — structure, wireframes, flows)
- Mockups: `docs/superpowers/mockups/2026-06-20-fukione-home-directions.html`
  (3 directions) and `docs/superpowers/mockups/2026-06-20-fukione-hero-screens-C.html`
  (chosen direction applied to Home, Product detail, Calculator)

> Language note: English prose per `english-only-artifacts`. Verbatim UI copy stays Vietnamese.

---

## 1. Design intent

The product is lead-gen-first: conversion rate decides win/lose. So the visual language is built
to **drive taps on lead CTAs**, but **disciplined** so it reads as a trustworthy, premium brand
rather than a discount landing page (wooden flooring is a high-value, considered purchase).

**Five discipline rules (non-negotiable):**
1. **Amber is for primary CTAs only.** Never use `--cta` for decoration, text, borders, or icons.
   One amber action per screen region.
2. **Warm paper background, not stark white.** The base surface is `#FAF7F2`; pure white is
   reserved for cards/sheets that need to lift off the page.
3. **One walnut touch for premium.** Walnut `#6B4A2E` appears sparingly — logo wordmark, a section
   heading underline, wood imagery. It is an accent, not a fill.
4. **Teal signals trust.** Secondary buttons, spec chips, checkmarks, "đã đính kèm" context, hours
   — all teal. It is the calm counterweight to amber.
5. **Trust-framed copy, not urgency.** Prefer "Tư vấn miễn phí", "Khảo sát tận nơi" over
   "60 giây", "1.000+ khách", "giá tận xưởng". Confidence, not pressure.

---

## 2. Color tokens

### Core palette
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#FAF7F2` | Page background (warm paper) |
| `--surface` | `#FFFFFF` | Cards, sheets, elevated surfaces |
| `--surface-warm` | `#F2EEE7` | Footer, muted section fills |
| `--ink` | `#241F1B` | Primary text (warm near-black) |
| `--muted` | `#6B6259` | Secondary text, labels |
| `--cta` | `#E8852B` | **Primary CTA only** (amber) |
| `--cta-ink` | `#9C5A16` | Amber-on-light text (CTA strip heading) |
| `--trust` | `#0F766E` | Trust accent: secondary buttons, chips, checks |
| `--wood` | `#6B4A2E` | Premium accent: logo, heading underline, imagery |
| `--line` | `#ECE5DC` | Borders, dividers (warm) |

### Tints (derived, for fills/states)
| Token | Hex | Use |
|---|---|---|
| `--cta-soft` | `#FBEFE0` → `#F6E2CC` | CTA strip gradient, soft amber badges |
| `--trust-soft` | `#EAF5F3` | Spec chips, "đã đính kèm" context box |
| `--trust-soft-border` | `#D3ECE8` | Border for trust-soft fills |
| `--result-bg` | `#FBF6EF` | Calculator result box fill |
| `--result-border` | `#E6C9A6` | Calculator result dashed border |

### Semantic mapping (shadcn / Tailwind)
- `primary` → `--cta` (amber); `primary-foreground` → `#FFFFFF`
- `secondary` → `--trust` (teal, outline style by default); `secondary-foreground` → `#FFFFFF`
- `background` → `--bg`; `card` → `--surface`; `foreground` → `--ink`;
  `muted-foreground` → `--muted`; `border` → `--line`
- `accent` → `--wood` (decorative only)

> Contrast: amber `#E8852B` on white passes for large/bold button text (use 700–800 weight,
> ≥14px). Body text always uses `--ink` on `--bg` (high contrast). Do not put small amber text on
> light backgrounds.

---

## 3. Typography

Mobile-first sizes (rem assumes 16px root).

| Style | Size / weight | Use |
|---|---|---|
| Display / H1 (hero) | 25px / 800, line-height 1.2, tracking -0.5px | Hero headline |
| H2 (page title) | 21px / 800 | Product name, calculator title |
| H3 (section) | 17px / 800 | Section headings (optional walnut underline) |
| Price | 20px / 800, color `--cta` | Product price, totals |
| Body | 13.5–14px / 400–500, color `--muted` for sub-copy | Paragraphs, leads |
| Label / chip | 11–12.5px / 700 | Spec chips, trust strip, form labels |
| Note | 10.5px / italic, `--muted` | "*giá cuối cần khảo sát*" |

- **Font family:** a clean, friendly sans for everything. Recommended: **Be Vietnam Pro** or
  **Inter** (both have full Vietnamese diacritics — critical). One family; weight carries hierarchy.
  No serif (serif belonged to direction A, not chosen).
- **Headings:** weight 800 for punch; tight line-height. **Body:** weight 400–500, comfortable
  line-height (~1.6).
- Ensure the chosen webfont includes Vietnamese subset; verify diacritics (ô, ư, ạ, ằ…) render.

---

## 4. Spacing, radius, elevation

- **Spacing scale:** 4 / 8 / 10 / 14 / 18 / 22px. Section padding 20px vertical, 18px horizontal
  on mobile. Generous whitespace is a premium signal — do not crowd.
- **Radius:** buttons/CTAs are **pill** (`999px`); cards/boxes `14px`; inputs `10px`; bottom-sheet
  top corners `22px`; chips `999px`.
- **Elevation (warm shadows):**
  - Card: `0 4px 14px rgba(0,0,0,.05)`
  - CTA (amber): `0 8px 20px rgba(232,133,43,.32)` — the glow that pulls the eye
  - Action bar (sticky): `0 -2px 12px rgba(0,0,0,.05)`
  - Bottom-sheet: `0 -10px 30px rgba(0,0,0,.2)`
- **Borders:** 1px `--line` for cards/dividers; 2px `--trust` for secondary (outline) buttons.

---

## 5. Component specs

### Buttons
- **Primary CTA:** amber fill, white 800-weight text, pill, amber glow shadow. One per region.
  Used for: "Tính chi phí", "Nhận báo giá", "Đặt lịch", "Gửi yêu cầu".
- **Secondary:** white fill, teal text, 2px teal pill border. Used for: "Xem sản phẩm",
  "Chat Zalo" (when paired with a primary).
- **Bypass link:** plain text under a CTA — "hoặc 💬 tư vấn ngay" with the action in teal bold.
  Always present at every conversion point (the "skip the form" escape hatch).

### Sticky chrome
- **Top bar:** warm translucent (`rgba(250,247,242,.92)` + blur), 1px `--line` bottom border.
  Logo wordmark `FUKI` in walnut + `ONE` in amber. Right: ☎ call + 💬 Zalo icons (always one tap).
- **Bottom action bar (mobile only, ≤768px):** white translucent + blur, top shadow. Layout =
  one full-width primary CTA (label changes per page context) + a teal circular Zalo button.
  Hidden on desktop.

### Cards (product)
- White surface, 1px `--line`, radius 14px, card shadow. Image block on top (wood-tone gradient
  placeholder until real photos). Body: name (800), price (amber 800), waterproof tag (teal 700).

### Chips
- Spec chips: teal-soft fill, teal 700 text, 1px teal-soft border, pill. e.g. "✓ Chống nước",
  "Dày 12mm", "Bảo hành 15 năm".

### Inputs & calculator
- Inputs: warm fill `#F4F1EB`, 1px `--line`, radius 10px, ink text.
- **Toggle (lắp đặt):** teal when on.
- **Result box:** `--result-bg` fill, dashed `--result-border`, line items in muted, total in
  ink 800 (15px), and the italic note "* giá cuối phụ thuộc khảo sát thực tế" always present.
- Calculator recomputes **live** as the user types (no submit needed to see the estimate).

### Bottom-sheet lead form
- White, top radius 22px, drag handle, scrim `rgba(20,15,10,.4)` behind.
- Soft amber badge "Bước cuối", title 800, sub-copy muted.
- Fields: Họ tên*, SĐT*, Email (optional). Teal "📎 Đã đính kèm: <SP> · <m²> · <tạm tính>" context box.
- Primary "Gửi yêu cầu" + bypass "hoặc 💬 Zalo · ☎ Gọi ngay".

### CTA strip
- Warm amber-soft gradient panel, heading in `--cta-ink`, a primary + secondary button.

### Footer
- `--surface-warm` fill, top `--line` border, muted text. NAP (name/address/phone) + hours +
  Zalo + Maps link. Present on every page (Local SEO + consistency).

---

## 6. Imagery & iconography

- Real photography is the main quality driver (product close-ups, completed projects, the Hanoi
  showroom). Mockups use wood-tone gradient placeholders; replace with `next/image` (lazy, sized)
  for Core Web Vitals.
- Emoji are placeholders for icons in the mockups. In the real build use a consistent icon set
  (e.g. lucide via shadcn) — line icons, `--trust` or `--ink` colored, never amber.
- Avoid stocky/generic visuals; prefer authentic FUKIONE project photos (strongest social proof).

---

## 7. Responsive behavior

- **Mobile (default, ≤768px):** single column, sticky bottom action bar present, 2-column product
  grid, horizontal scroll for carousels, forms as bottom-sheets.
- **Desktop (>768px):** horizontal nav (no hamburger, no bottom bar), primary CTA in header +
  inline; multi-column grids; bottom-sheet becomes a centered modal or inline panel.
- Touch targets ≥44px; thumb-zone CTAs on mobile.

---

## 8. Accessibility & quality gates

- Body text contrast ≥ 4.5:1 (`--ink` on `--bg` passes). Button text bold ≥14px.
- Vietnamese diacritics must render in all weights of the chosen font — verify before shipping.
- Lighthouse: performance + SEO are gated per the SRS; warm placeholders must not block LCP.
- Honor `prefers-reduced-motion` for any carousel/sheet animation.

## 9. Status
- [x] Phase A — structure (approved): `2026-06-20-fukione-uiux-design.md`
- [x] Phase B — visual direction chosen ("disciplined Trust Commerce") + hero mockups + this doc
- [ ] Next: implementation plan (writing-plans) → scaffold M1 (Next.js + Payload + Postgres), then
  build the design system in Tailwind/shadcn from these tokens.
