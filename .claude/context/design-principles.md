# FUKIONE Design Principles & Review Checklist

> The standard the `design-review` agent grades against. FUKIONE is a **lead-gen-first**
> B2C retail site for wooden flooring, Phase 1 = Hà Nội. The job of the UI is: **build
> trust → give a fast quote → capture a lead** (closed later via Zalo/phone). It is NOT a
> full e-commerce store. Concrete tokens, fonts, and routes live in `style-guide.md`.

## I. Core philosophy

- [ ] **Lead-gen first, not catalog browsing.** Every screen has an obvious next step toward a lead: "nhận báo giá", "đặt lịch khảo sát", Zalo, or phone. If a user finishes a section and the next action is unclear, that is a defect.
- [ ] **Trust is the product.** This is a considered, high-value home purchase from an unknown brand. Specs, warranty, origin, real photos, and local (Hà Nội) signals must feel credible, not stocky or templated.
- [ ] **Mobile-first, always.** Most traffic is mobile. Review and judge at 375px first; desktop is the secondary case.
- [ ] **Honest numbers.** The cost calculator gives an **estimate**, never a binding quote. The disclaimer must always be visible with a result. A number that reads as a firm price and turns out wrong destroys trust.
- [ ] **Speed = SEO = leads.** Fast load and low layout shift are not just UX; they gate the Lighthouse SEO/Performance budget on every deploy.
- [ ] **Restraint.** Editorial, warm, premium-but-approachable. Resist generic AI-template polish (gradient soup, neon, too many weights, decorative noise without purpose).

## II. The conversion spine (FUKIONE-critical — review every time)

- [ ] **CTA hierarchy is unambiguous.** One clear primary action per view; secondary actions visibly subordinate. The orange CTA color is reserved for the primary action — do not dilute it.
- [ ] **Contact paths are always reachable.** Zalo + phone available without hunting; sticky mobile CTA bar does not cover form fields or content.
- [ ] **Calculator disclaimer present** whenever a cost result is shown, and legible (not greyed into invisibility).
- [ ] **Lead/survey forms are low-friction.** Minimal fields, clear labels, forgiving validation, immediate success/“cảm ơn” feedback. The form must reassure that the lead was received.
- [ ] **Golden flows work end-to-end:** (1) calculate cost → leave a lead; (2) filter products → view detail.

## III. Visual system (see `style-guide.md` for exact tokens)

- [ ] **Type roles respected:** Fraunces (display/headings) vs Be Vietnam Pro (body). No extra font families; limited weights.
- [ ] **Palette discipline:** warm paper background, ink/muted browns for text, orange CTA used sparingly, teal strictly for trust/credibility signals. No raw hex in code — tokens only.
- [ ] **Spacing & alignment** follow a consistent rhythm; generous white space; nothing optically misaligned.
- [ ] **Radii & shadows** use the defined scale (pill / card / input / sheet). Soft, warm shadows — not hard drop shadows.
- [ ] **Imagery** is real and high quality; wood textures read as premium, not stock.

## IV. Layout & hierarchy

- [ ] Clear visual hierarchy guides the eye to the value prop, then the CTA.
- [ ] Mobile layout adapts gracefully: no horizontal scroll, no overlap, comfortable tap targets (≥44px).
- [ ] Sticky elements (CTA bar, filters) behave correctly on scroll and do not trap focus or hide content.

## V. Interaction & motion

- [ ] Micro-interactions are immediate and purposeful (hover/active/focus/loading), 150–300ms, eased.
- [ ] `fk-rise` reveals feel intentional and are not janky; nothing important is hidden until scrolled if it harms first paint.
- [ ] **`prefers-reduced-motion` is honored** (the project already disables `fk-rise` under it — verify nothing else animates aggressively).

## VI. Vietnamese localization correctness

- [ ] Diacritics render correctly everywhere — no tofu boxes, no mojibake, no clipping at narrow widths.
- [ ] Prices format as VND and behave as if sourced from the Settings collection (never hardcoded).
- [ ] Phone/Zalo formats valid and tappable (`tel:` / Zalo deep link).
- [ ] Public URLs stay Vietnamese-no-accent (`/san-pham`, `/bao-gia`, `/dat-lich-khao-sat`). Do **not** flag these as needing English.

## VII. Accessibility (WCAG 2.1 AA)

- [ ] Full keyboard navigation; visible focus state on every interactive element.
- [ ] Text contrast ≥ 4.5:1. **Watch white-on-orange CTA labels and text on teal** — verify, don't assume.
- [ ] Semantic HTML, labelled form fields, alt text on meaningful images, Enter/Space activation.
- [ ] Touch targets ≥ 44px; hit areas not cramped on mobile.

## VIII. Robustness & edge cases

- [ ] Calculator handles zero, negative, empty, and very large area inputs gracefully (no NaN, no layout break) — this is already a tested risk path.
- [ ] Form validation surfaces clear Vietnamese error messages; submit is disabled or guarded against double-submit.
- [ ] Loading, empty (no products match a filter), and error states all exist and look intentional.
- [ ] Long product names / long Vietnamese strings do not break cards or chips.

## IX. Performance & SEO (deploy gate)

- [ ] No obvious layout shift (CLS) on load; images sized/optimized; fonts do not flash badly.
- [ ] Console is free of errors/warnings.
- [ ] Changes keep the page within the Lighthouse SEO/Performance budget.

---

**Severity calibration:** a missing calculator disclaimer, a broken VN string, a lost/blocked lead path, or a failed golden flow is a **[Blocker]**. Deviating from a stated token/font rule is **[High-Priority]**. Pure taste is at most **[Nitpick]** — and the human decides.
