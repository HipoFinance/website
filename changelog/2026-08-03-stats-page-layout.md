# 2026-08-03 — Stats page layout rearrangement

Continuation of the 2026-08-02 charts session. The morning committed that
session's outstanding work (see the updated commit table in
[its report](2026-08-02-stats-charts.md)) plus two small fixes; the main work
here rearranged `/app/#page=stats/` per maintainer direction: last-value cards
first, history charts after, with several styling passes iterated on feedback.

## Commits

| Commit    | Description                                               |
| --------- | --------------------------------------------------------- |
| `d19da43` | Fix the workaround used for Community-Driven card's width |
| `046043a` | Arrange the hGRAM card data                               |
| `9e1bec3` | Rearrange the Stats page layout                           |
| `cee252a` | Rename the 24h volume figure to total volume              |

## What changed

- **Page order** (`9e1bec3`): last-value cards now come first — Protocol, then
  the Market token cards (hGRAM/HPO/GRAM, previously at the very bottom) — and
  all five history charts follow under one **History** section. The Refresh
  button stays at the top of the page because it refreshes everything; the
  range selector moved down to sit directly above the charts it controls,
  centered under the History header. Since the charts are mainnet-only, the
  selector now renders only on mainnet too (it previously showed on testnet
  and did nothing visible).
- **Full-width sections**: Protocol and History were `max-w-lg`/`max-w-3xl`
  while the Market grid spanned the page's `max-w-5xl`; all sections, heading
  rows, and the Refresh row now share `max-w-5xl` so edges align down the page.
- **Protocol tiles**: the stats page no longer reuses the shared `Stats`
  component (the stake page keeps it unchanged — an intermediate `wide` prop
  was added and then reverted). `StatsPage.tsx` renders its own card: APY,
  Staked, and Holders as centered label-over-value tiles, 3-across from `sm`
  (2-across on testnet, which has no Holders source), stacked on phones.
  Tooltips kept, now fixed-width (`w-52`) and centered under their icons.
- **Highlighted section headers**: Protocol/Market/History render via a new
  `SectionHeading` — centered bold text on a rounded `bg-c1/30`
  (`dark:bg-dark-700`) bar.
- **Header links**: "More Stats" (formerly inside the protocol card) and
  "TON Explorer" (formerly the card's heading row) moved to the page's
  top-right corner, stacked and vertically centered against the "Statistics"
  title via an absolute block so the title stays centered. Gap widened to
  `gap-3` for finger-sized tap separation.
- **Market card titles**: left-aligned on thin screens, centered from `lg`
  (the 3-across breakpoint), with `mt-6` to breathe below the previous card.
  The first iteration had the alignment the other way around
  (centered-on-mobile); the maintainer reversed it.
- **"24h volume" → "Total volume"** (`cee252a`): the gauge's `total_volume`
  figure is lifetime volume, not a 24-hour window, so the row label and the
  `TokenStats.volume24h` field (now `totalVolume`) were mislabeled. The
  neighboring "24h change" really is 24h (`price_change_percentage_24h`) and
  kept its name, as did the plain "Volume" labels on the HPO/landing pages.
- **hGRAM card row order** (`046043a`, pre-conversation): Holders moved above
  Circulating supply so the shared rows line up across the three token cards.
- **Landing page** (`d19da43`, pre-conversation): the Community-Driven card's
  invisible-dummy-text width workaround was removed; the
  `hipo-why-hipo-card-bg` utility now uses `w-full` instead of
  `w-fit`/`md:max-w-max`, letting the grid cell stretch properly.

### Verification performed

`npm run build` after every step (44 pages, clean) and `prettier --write` on
touched files (no reformats needed). The layout changes had no browser pass —
they are Tailwind-class-level and were reviewed in the diff. The volume rename
was verified end-to-end after the maintainer saw "—" values: headless Chrome
(scratchpad `playwright-core`, installed Chrome) against a fresh dev server
showed the gauge fetch returning 200 and all three cards rendering real
totals — the dashes were stale Vite HMR state (the page's MobX store still
held objects with the old `volume24h` field) and clear on a hard reload.

### Follow-ups

- Eyeball the tile tooltips on a narrow phone: they are fixed-width and
  centered, so the leftmost one may hug the screen edge.
- The corner links extend a few pixels above/below the title line; if bigger
  tap targets are wanted, pad each link instead of growing the gap.
- Unchanged from last session: expose the Prometheus proxy
  (`gauge.hipo.finance/prometheus`) so the charts get live data.
