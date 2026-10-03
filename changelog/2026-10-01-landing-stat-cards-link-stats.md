# 2026-10-01 — The landing page's four stat cards link to `/stats/`

Requested from Telegram: the TVL, APY, holders and staking-fee cards in the landing page's stats
row were inert. They are now links to the Stats page, which is where each of those four figures is
explained in depth.

| Commit         | Subject                                              |
| -------------- | ---------------------------------------------------- |
| (this session) | Link the landing page's four stat cards to the stats |

## What changed

Each of the four cards in `src/components/Landing.astro`'s stats row went from a plain `<div>` to
an `<a href={localizedPath('/stats/', locale)}>`. The whole card is the target, not just the
number, so it is a comfortable tap on a phone.

The hover treatment is copied from the audit cards further down the same page —
`transition-transform hover:scale-[1.02]` on top of the existing
`border-border bg-surface rounded-[20px] border` — because those are already full-card links in a
grid, and two card grids on one page behaving differently is the kind of inconsistency nobody can
name but everybody notices. `block` is added because an `<a>` is inline by default and these are
grid children.

Everything inside the cards is untouched: the ids `statStakedUsd`, `statStaked`, `statApy`,
`statHolders` and `statFee` are what `src/scripts/landing-data.js` refreshes in the browser and
what `gaugeValues()` bakes at build time, and the `title` carrying the exact staked amount still
sits on the figure rather than the card.

## No new strings

Deliberately no `aria-label`. Each link takes its accessible name from its own content, which comes
out distinct and descriptive per card:

| Card    | Accessible name                        |
| ------- | -------------------------------------- |
| TVL     | `$11.8M staked, worth 7.78M GRAM`      |
| APY     | `20.09% Yearly rewards, last 2 rounds` |
| Holders | `23,196 GRAM holders staking`          |
| Fee     | `0% Staking fee`                       |

An `aria-label` would have made all four read "Stats" — four identical links on one page, which is
worse for a screen reader than what the content already gives — and it would have cost a new key in
eleven locales for the privilege. The `prebuild` i18n gate is untouched by this change.

Each of the four figures has a real counterpart on `/stats/`, so none of the links is a dead end:
staked, APY (with the staking fee as its caption), active stakers, and the rate.

### Verification performed

- `npm run build` passes, including the `check-i18n` prebuild gate.
- The four hrefs localise: `/stats/` on `/`, `/fa/stats/` on `/fa/`, `/ar/stats/` on `/ar/`.
- All five ids survive in the built HTML, so `landing-data.js` still finds what it refreshes.
- Each anchor's text content was read out of the built page to confirm the names above.

### Follow-ups

- The APY card reads 20.09 % (the gauge's last-two-rounds figure) while `/vs/` reports 9.31 %
  trailing-365d. Both are correct on their own definitions and the Stats page the card now links to
  uses the same two-round window, so the click is consistent — but the two numbers are now one click
  apart, which they were not before. Worth a look if it ever reads as a contradiction.
