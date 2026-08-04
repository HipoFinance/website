# 2026-08-04 — Stats page feedback round

Second session of the day, applying six maintainer feedback points on the Stats
page — partly superseding the morning's link placement (see
[that report](2026-08-04-stats-links-placement.md)): the Refresh button and the
TON Explorer link are gone, and the More Stats link moved again, to the page
bottom.

## Commits

| Commit    | Description                                          |
| --------- | ---------------------------------------------------- |
| `f7a221a` | Apply feedback to the Stats page links and refreshes |

## What changed

- **Refresh on open instead of a Refresh button** (`StatsPage.tsx`,
  `charts/ChartsStore.ts`): `StatsPage` mounts fresh on every tab switch, so
  the mount effect now calls `model.loadHipoGauge()` (which also restarts the
  auto-refresh countdown), and `ChartsStore`'s first load busts the 5-minute
  module-level chart cache. Every visit fetches fresh gauge figures and
  charts; range toggles within a visit still hit the cache, and the existing
  5-minute auto-refresh timers keep running while the page stays open. The
  store's reaction no longer uses `fireImmediately` (the explicit cache-busting
  first load replaces it) and the now-unused `refresh()` method was removed.
- **TON Explorer link removed** from the Stats page. The Stake page card's own
  TON Explorer link was deliberately kept — the feedback item was read as the
  Stats page link; `model.explorerHref` remains in use there.
- **More Stats moved to the page bottom**, centered after the last chart. On
  testnet, where the charts don't render, it sits centered under the
  "mainnet only" note.
- **The two More Stats links now diverge** per feedback: the Stake page card's
  link became a button calling `model.setActivePage('stats')` — identical to a
  header tab click, so the network survives in the hash and the page scrolls
  to top — while the Stats page link keeps pointing at stats.hipo.finance.
- **Subtitle padding**: "Live protocol and market figures." went from `px-8`
  to `px-2` so it fits a single row on thin screens.
- **Section headings restyled** (`SectionHeading`): the rounded `bg-c1/30`
  bar — which read as a button — became a centered rule: bold title flanked by
  `h-px` lines, `bg-c1` in light mode and `bg-c2` in dark.
- Dropped a pre-existing dead `useEffect` import in `Stats.tsx`.

### Verification performed

`npm run build` (44 pages, clean); `prettier --write` on the three touched
files reported no reformats. Tailwind-class-level changes reviewed in the
diff; no browser pass.

### Follow-ups

- Eyeball the section-heading rule in dark mode — `c2` on the dark background
  may need a lighter or darker shade.
- The Stake page's TON Explorer link was kept; remove it too if the feedback
  meant both.
- Unchanged from earlier sessions: expose the Prometheus proxy
  (`gauge.hipo.finance/prometheus`) so the charts get live data.
