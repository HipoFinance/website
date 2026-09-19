# 2026-09-19 — Three phone-width fixes the new locales made visible

Follow-on to the language-switcher rollout the same day. With nine more locales reachable, three layout
bugs that had been on `main` for weeks showed up in the longer translations: two pages scrolled sideways
on phones, and the Stake/Unstake toggle wrapped. Each was measured on the production build before and
after. Specs: `specs/faq-anchor-tooltip-overflow.md`, `specs/mobile-fit-hpo-hero-and-stake-toggle.md`.

| Commit         | Subject                                                              |
| -------------- | -------------------------------------------------------------------- |
| (this session) | Stop the FAQ tooltip and HPO hero widening phones; unwrap the toggle |

## What changed and why

- **FAQ anchor tooltip** (`AnchorLink.astro`). The "Link copied" `::after` was centred over the heading's
  link icon and hidden with `opacity: 0` only, which still counts toward scrollable width; near the right
  edge half of it hung off-screen (`/ru/faq/` 25 px at 320–360 px; also `hi`, `tr`, `fa`). It is now
  anchored to the icon's inline end, so it extends back over the heading — never the scrollable
  direction, LTR or RTL. Rejected: `display: none` until copied (still widens the page while shown).
- **`/hpo/` hero** (`Hpo.astro`). Below `lg` the hero grid had one implicit `auto` column, which never
  shrinks below the 40 px headline's longest word (German "Gewinnbeteiligungs-Token" → 370 px on a 320 px
  screen; eight locales, up to 94 px in Arabic). Now `grid-cols-1` (`minmax(0, 1fr)`) plus `hyphens-auto`
  on the `<h1>`, so long words hyphenate in the page's language. Side effect accepted: the browser also
  hyphenates some words that would have fit ("Go-vernance" in German at 320 px). Rejected: a smaller phone
  headline for every locale.
- **Stake/Unstake toggle** (`StakeUnstake.tsx`, shell mirror `ShellStakeForm.astro`). `px-9` let the label
  wrap in ar, hi, tr and pt-br (61–67 px tall instead of 44, desktop included). Now `whitespace-nowrap`
  with `px-4 sm:px-9`; the longest label is 95 px, so the equal-width pair fits 320 px with 2 px to spare
  (pt-br). The Telegram Mini App toggle is unchanged.

### Verification performed

- `npm run build` passes (i18n 0 warnings).
- Production build, headless: `/faq/` ten locales × 320–768 px, 60/60 without overflow; the tooltip shows
  fully on screen after a copy (en, fa) and the clipboard still gets the absolute `#anchor` URL. `/hpo/`
  ten locales × 320–768 px, 60/60 without overflow; the two-column hero unchanged at 1280 px. Toggle ten
  locales × 320/360/375/640/1280 px, 50/50 one line at 44 px, inside the content box; shell vs hydrated
  toggle on `/ar/stake/` identical at 320 and 1280 px.
- Tested by the user on the local preview before commit.

### Follow-ups

- None known. A sweep of every page × locale × phone width for `scrollWidth > clientWidth` would catch
  the next one before a visitor does.
