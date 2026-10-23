# lead.io

A two-page marketing site for a Canadian mortgage brokerage — a landing page and a
**careers case study** — rebuilt for 2026 with zero front-end dependencies.

**Live files:** `index.html` (home) and `careers.html` (careers). Open them directly;
no build step, no server, no package install needed.

---

## What changed in this pass

| | Before | Now |
|---|---|---|
| Dark-surface text | Muted greys at 3–4.5:1, often unreadable | Every text surface audited to WCAG AA (≥ 4.5:1 body, ≥ 3:1 large) |
| "I'm interested in" dropdown | Native `<select>` — OS-rendered list, unreadable on dark | Custom listbox: styled panel, keyboard-navigable, `role="listbox"`, native select kept as the form value holder and no-JS fallback |
| Logo | Text wordmark only | Purpose-built vector mark + wordmark — roofline, doorway "L" and a lime beacon node |
| Careers | Dead `#` link in the footer | `careers.html` — a single-page case study of the full 2006→2026 journey, with 12 filterable roles and an apply form |
| Referral program | Footer link | Removed entirely |
| Responsive | Desktop-first, patched at the edges | Audited at 8 viewports from 320px to 1920px — no horizontal scroll, no overflow, no clipped text |

## Design system

A calm, editorial direction rather than a generic SaaS template.

- **Palette** — warm paper `#F5F2EC` and near-black ink `#0B0C0D` carry the page; acid lime
  `#D8FF4F` is the single accent; warm gold for review stars.
- **Type** — Instrument Sans (variable 400–700) for UI, with Instrument Serif italic used as an
  editorial contrast on emphasised words and figures. Scale is fluid (`clamp()`), tracking is
  tightened on display sizes.
- **Layout** — 1200 px container, 24–34 px radii, hairline borders instead of heavy shadows,
  asymmetric section heads, and a bento-style services grid where one card is image-led.
- **Motion** — slow image drift in the hero, staggered reveals via `IntersectionObserver`,
  animated counters, and a scroll-linked reading progress line. Everything is disabled under
  `prefers-reduced-motion: reduce`.
- **Texture** — subtle SVG grain on the hero, glass-morphism only where it earns its keep
  (sticky nav, rate card).

### Brand

`assets/img/logo.svg` (for light backgrounds) and `assets/img/logo-dark.svg` (for dark
backgrounds) are the full lockup — a rounded-square emblem whose roofline and doorway "L"
reference the product, plus a vector `lead.io` wordmark. `assets/img/favicon.svg` is the
emblem alone on a rounded ink tile.

In the header and footer the lockup is inlined as an SVG sprite symbol (`#i-logo`) and
coloured with `currentColor`, so it flips from white to ink as the sticky header changes
state — no image swaps, no flash of the wrong colour.

## Pages

### `index.html` — the landing page

- Hero: clear proposition ("A better mortgage, without the runaround"), a pre-approval CTA and
  a live rate card with fixed/variable switching, APRs and an O.A.C. disclosure.
- Six services with real specifics: purchase, refinance/equity, first-time buyers (FHSA + HBP),
  renewals, investment properties, debt consolidation.
- A working mortgage calculator with provincial minimum-down-payment logic, CMHC insurance
  tiers, 20/25/30-year amortization and a principal-vs-interest split.
- A four-step process, a 20-year about section, verified-style reviews with concrete savings,
  and a six-question FAQ.
- A contact form with real validation, consent, and a "what happens next" panel.
- "Milo", a lightweight concierge that answers common questions and hands off to a human.
- Compliance-minded footer: licence number, rate disclaimers, and an explicit note that the
  sample data is illustrative.

### `careers.html` — the case study

One page that tells the whole Lead.io story and does the recruiting:

- **The brief** — the 2006 transparency problem, plus a case-parameters panel.
- **The journey** — six chapters on a timeline (2006 → 2026), each an answer to something
  that went wrong for a client.
- **The outcome** — six headline numbers on a dark panel.
- **Life here** — six concrete commitments (real hours, a path, tools, five languages, learning
  budget, benefits from day one).
- **How we decide** — the three rules we hire and fire on.
- **Open roles** — 12 roles filterable by team (brokerage / operations / technology / growth),
  each with type and compensation band.
- **Hiring** — the four-step, two-week process with stage timings.
- **The team** — a photo, a quote, and the retention numbers.
- **Apply** — a validated application form with the same custom dropdown.

All names, reviews, licence numbers, roles and contact details are illustrative placeholders
for the demo — swap them before publishing.

## Accessibility & performance

- Landmarks (`header`/`nav`/`main`/`section`/`footer`), one `h1`, ordered heading levels.
- Skip link, visible focus rings, `aria-expanded` / `aria-controls` on every disclosure,
  `aria-pressed` on the rate toggle, `inert` background while the mobile menu is open.
- The custom select is a proper listbox: `role="combobox"` trigger, `role="listbox"` popup,
  `aria-activedescendant`, Arrow/Home/End/Enter/Escape keys, and click-outside dismissal. The
  native `<select>` stays in the DOM as the form value holder and is the visible fallback when
  JavaScript is unavailable.
- Form errors are announced via `aria-invalid` + `aria-describedby`, and focus moves to the
  first invalid field (to the dropdown trigger, not the hidden native select, when relevant).
- Star ratings are inline SVG, not `★` characters — the display face has no U+2605 glyph and
  the text version rendered as tofu boxes.
- Progressive enhancement: without JavaScript the page still renders, FAQ answers stay open,
  the calculator shows real default figures, and the native dropdown is usable.
- Fonts are preloaded and subset to Latin; images use `srcset`/`sizes`, `loading="lazy"` and
  `width`/`height` to avoid layout shift.

## Structure

```
index.html                 home page
careers.html               careers case study
assets/css/style.css       design tokens, layout, components, responsive rules
assets/css/careers.css     careers-page-specific styles
assets/js/main.js          nav, reveals, counters, rates, calculator, FAQ, custom select,
                           form, concierge
assets/js/careers.js       role filtering + application form
assets/fonts/              Instrument Sans + Instrument Serif (woff2) + OFL licences
assets/img/                hero, service, about and careers imagery (webp + jpg)
assets/img/logo.svg        full logo lockup, for light backgrounds
assets/img/logo-dark.svg   full logo lockup, for dark backgrounds
assets/img/favicon.svg     emblem on a rounded ink tile
```

## Editing notes

- Colours and spacing live as custom properties at the top of `style.css`.
- Section copy sits in `index.html` / `careers.html`; the concierge answers are the `answers`
  array in `main.js`.
- Roles on the careers page are plain `<li data-team="…">` elements — add one and it appears
  in the list (and in the matching filter count) automatically.
- The forms currently succeed client-side only — point `data-contact-form` / `data-apply-form`
  at your endpoint (or add a `fetch()` in the submit handler) to make them live.
