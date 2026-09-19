# Two phone-width fits: the `/hpo/` hero and the Stake/Unstake toggle

**Status:** approved (2026-09-19)

Both surfaced after the nine locales went public (2026-09-19). Neither is a regression of that change —
both were already on `main` — but the longer translations now make them reachable.

## 1. `/hpo/` scrolls sideways on phones

**Root cause.** Below `lg` the hero is `<section class='grid …'>` with no column template, so it gets one
implicit `auto` column. An `auto` track never shrinks below its item's min-content width, and the item's
min-content is the longest unbreakable word of the 40 px `<h1>` (`overflow-wrap: break-word` from `body`
does not lower min-content — the case `CLAUDE.md` describes for flex/grid children). So the whole hero
column is as wide as, e.g., German "Gewinnbeteiligungs-Token", and the page scrolls. Measured on the
production build (overflow in px):

| Width | Affected locales                                          |
| ----- | --------------------------------------------------------- |
| 320   | ar 94, de 74, it 57, pt-br 45, fa 35, ru 26, hi 24, id 24 |
| 360   | ar 54, de 34, it 17, pt-br 5                              |
| 375   | ar 39, de 19, it 2                                        |

English and Turkish are unaffected.

**Fix** (`src/components/Hpo.astro`):

- The section gets `grid-cols-1` (Tailwind: `repeat(1, minmax(0, 1fr))`), so the column is the container's
  width and never its content's; the existing `lg:grid-cols-[1.05fr_0.95fr]` still takes over from `lg`.
  A word longer than the column then breaks instead of widening the page.
- The `<h1>` gets `hyphens-auto`, so that break is a proper hyphenated one in the page's language (`<html
lang>` is already set per locale) rather than an arbitrary mid-word cut.

Visible effect: on phones, long headline words wrap with a hyphen. Side effect of `hyphens: auto`: the
browser may also hyphenate words that would otherwise have fit on the next line — German at 320 px renders
"Go-/vernance- und / Gewinnbeteili-/gungs-Token". Rejected alternative: a smaller phone headline size for
every locale (a design change to fix a translation-length problem).

Verified before writing (style injected into the production build): 0 px overflow in all ten locales at
320, 360 and 375 px.

## 2. The Stake/Unstake toggle wraps to two lines

**Root cause.** The toggle on `/stake/` and `/unstake/` (`StakeUnstake.tsx`, mirrored in
`ShellStakeForm.astro`) gives each button `flex-1 … px-9` (36 px padding a side) and lets its label wrap.
In the longer locales the label wraps and the toggle grows from 44 px to 61–67 px tall: Arabic ("إلغاء
الستاكينغ"), Hindi, Turkish and Brazilian Portuguese — at every width, desktop included.

**Fix.** Buttons get `whitespace-nowrap`, and the padding becomes `px-4 sm:px-9`. The longest one-line
label is 95 px (ar "إلغاء الستاكينغ", pt-br "Fazer unstake"); the buttons are equal-width (`flex-1`), so
the toggle is `2 × (95 + 2 × padding) + 18` px: 272 px at `px-4`, exactly the content width at 320 px, and
352 px at `px-9` from 640 px up. Same change in both files (the shell's `pill` constant), so the pre-hydration
markup stays identical. Verified before writing (style injected into the production build, ar, pt-br and hi at 320 and 360 px):
both buttons 44 px tall, no clipped label, no overflow; the tightest case, pt-br at 320 px, spans 26–294 px
inside the 24–296 px content box. The Telegram Mini App's toggle (`TmaStakeUnstake.tsx`, no side padding) is not
changed.

## Changes

- `src/components/Hpo.astro` — `grid-cols-1` on the hero section; `hyphens-auto` on its `<h1>`.
- `src/components/app/StakeUnstake.tsx`, `src/components/app/shell/ShellStakeForm.astro` — toggle buttons
  `px-9` → `px-4 sm:px-9`, plus `whitespace-nowrap`.

## Acceptance criteria

- [ ] `/hpo/` in all ten locales at 320, 360, 375, 414, 640 and 768 px: `scrollWidth === clientWidth`;
      at ≥ 1024 px the two-column hero is unchanged (screenshot en at 1280).
- [ ] Toggle in all ten locales at 320, 360, 375, 640 and 1280 px: both buttons one line (44 px tall), the
      toggle inside the content box, no document overflow.
- [ ] Shell vs hydrated toggle on `/ar/stake/` at 320 and 1280 px: identical rects (no shift on mount).
- [ ] `npm run build` passes.
