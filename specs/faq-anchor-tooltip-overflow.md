# FAQ anchor tooltip — stop it widening the page on phones

**Status:** approved (2026-09-19)

## Root cause

`src/components/AnchorLink.astro` puts a link icon after every deep-linkable heading on `/faq/` and `/hpo/`
(and their locale twins). Its "Link copied" confirmation is an `::after` pseudo-element, **centred** over
the icon (`inset-inline-start: 50%; transform: translateX(-50%)`, `white-space: nowrap`) and hidden with
`opacity: 0` only. An element hidden by opacity still counts toward the page's scrollable width, so when a
heading's icon lands near the right edge of the screen, half of the invisible tooltip hangs past it and the
whole page scrolls sideways — the failure `CLAUDE.md` says is always a bug.

It shows where the translated string is long and a heading ends near the edge. Measured on the production
build: `/ru/faq/` 25 px at 320 and 360 px, 5 px at 375, 7 px at 640; `/hi/faq/` 5 px and `/tr/faq/` 6 px
at 375; `/fa/faq/` 3 px at 320. English happens not to trigger it today, but would with a different heading.
It has been live since the component was added (2026-08-24).

## Fix

Anchor the tooltip to the icon's **inline end** instead of centring it: `inset-inline-end: 0`, no
`transform` (which also makes the separate RTL `translateX(50%)` rule unnecessary — it is removed). The
tooltip then extends from the icon toward the start of the line, which is never the scrollable direction in
either LTR or RTL, so it can no longer widen the page in any locale or at any width. Everything else — the
text, the styling, the moment it shows, the fade — is unchanged.

Visible difference: after a copy, "Link copied" appears above the icon **aligned to its end** (right edge in
LTR, left edge in RTL) instead of centred on it. The icon sits at the end of the heading text, so the
tooltip now lies over the heading rather than past it.

Rejected: `display: none` until copied — it would fix the idle state but the tooltip could still push the
page sideways during the moment it is shown, and it breaks the fade. Clipping the heading or the page with
`overflow: hidden` — `CLAUDE.md` forbids papering over a bleed that way.

## Changes

- `src/components/AnchorLink.astro` — in the `.anchor-link::after` rule, `inset-inline-start: 50%` +
  `transform: translateX(-50%)` → `inset-inline-end: 0`; delete the `html[dir='rtl']` transform rule.

## Acceptance criteria

- [ ] All ten locales × `/faq/` and `/hpo/` at 320, 360, 375, 414, 640 and 768 px:
      `scrollWidth === clientWidth` (production build).
- [ ] Clicking an icon (English and `/fa/`) shows "Link copied" fully on screen, above the icon, aligned
      to its end; screenshot each.
- [ ] Copy behaviour unchanged: the clipboard gets the absolute URL with the `#anchor`.
- [ ] `npm run build` passes.
