# lead.io

A mortgage brokerage landing page — rebuilt for 2026 with zero front-end dependencies.

**Live file:** `index.html` (open it directly; no build step, no server, no package install needed).

---

## What changed

The original page was a Bootstrap 4 + jQuery + Font Awesome page with a fixed hero image,
four lorem-ipsum service cards, a carousel of stock photos and a Contact Us block. It was
rewritten from the ground up.

| | Before | Now |
|---|---|---|
| CSS framework | Bootstrap 4 (~160 KB) | none — one 40 KB hand-written stylesheet |
| JS | jQuery + Bootstrap JS + Popper (~110 KB) | one 15 KB vanilla ES5-compatible file |
| Icons | Font Awesome (~1 MB of fonts) | inline SVG sprite (no requests) |
| Fonts | system defaults | self-hosted Instrument Sans + Instrument Serif (OFL) |
| Images | 8 unoptimised JPEG/PNG files | WebP + JPEG with `srcset`, explicit dimensions |
| Content | lorem ipsum ×4, duplicate address | real, specific copy; services, FAQ, process, reviews |
| Interactivity | carousel slider | live rate card, mortgage calculator, FAQ accordion, JS-validated form, concierge |

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

## Content

Rewritten for a Canadian mortgage brokerage, not a template placeholder:

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

All names, reviews, licence numbers and contact details are illustrative placeholders for the
demo — swap them before publishing.

## Accessibility & performance

- Landmarks (`header`/`nav`/`main`/`section`/`footer`), one `h1`, ordered heading levels.
- Skip link, visible focus rings, `aria-expanded` / `aria-controls` on every disclosure,
  `aria-pressed` on the rate toggle, `inert` background while the mobile menu is open.
- Form errors are announced via `aria-invalid` + `aria-describedby`, and focus moves to the
  first invalid field.
- Progressive enhancement: without JavaScript the page still renders, FAQ answers stay open,
  and the calculator shows real default figures.
- Fonts are preloaded and subset to Latin; images use `srcset`/`sizes`, `loading="lazy"` and
  `width`/`height` to avoid layout shift.

## Structure

```
index.html                 single page
assets/css/style.css       design tokens, layout, components, responsive rules
assets/js/main.js          nav, reveals, counters, rates, calculator, FAQ, form, concierge
assets/fonts/              Instrument Sans + Instrument Serif (woff2) + OFL licences
assets/img/                hero, service and about imagery (webp + jpg), favicon
```

## Editing notes

- Colours and spacing live as custom properties at the top of `style.css`.
- Section copy sits in `index.html`; the concierge answers are the `answers` array in `main.js`.
- The form and newsletter currently succeed client-side only — point `data-contact-form` at your
  endpoint (or add a `fetch()` in the submit handler) to make them live.
