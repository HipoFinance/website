# 2026-08-29 — Filling in the Stats page's empty cards

Fourth session of the day, following
`changelog/2026-08-29-static-app-shell.md`. Two of the Stats page's four
headline cards still started blank and filled in a moment later: the hGRAM/GRAM
rate, and the "▲ +x% over 1M" delta lines under TVL, stakers and rate. The
staking-fee caption under APY did the same. All of them are now in the HTML.

## Commits

| Commit | Description                                       |
| ------ | ------------------------------------------------- |
| (this) | Seed the Stats page's rate, fee and delta figures |

## Why they were empty

The previous session seeded the island from the gauge, which fixed the three
figures the gauge carries (TVL, APY, stakers). The rest have no gauge
equivalent:

- **The rate** (`statsRateFormatted`) reads `totalCoins / totalTokens` from
  treasury state — chain only.
- **The staking fee** (`protocolFee`) reads `treasuryState.governanceFee`.
- **The three deltas** are computed from chart history, which is a separate
  Prometheus fetch the island makes after mount.

## What changed

**The fee needed no new source.** The gauge already returns
`treasury.protocol_fee`; the wire type simply never declared it. `protocolFee`
now falls back to it exactly as `statsApyFormatted` and the others do, so it
comes for free from the seed that already exists. (It is a plain percentage
number like `current_apy`, not the contract's `/65535` ratio.)

**New `src/data/stats.ts`** fetches the same Prometheus range the charts use, at
build time, and keeps **only what the cards need**: the last rate value, and a
first-to-last percentage change for staked / holders / rate. The full response
is ~70 KB and inlining it on every locale's Stats page would have cost far more
than the cards are worth — `computeDelta()` only ever looks at the first and
last finite point, and the seed reproduces that rule exactly.

`AppLayout` inlines it as `#stats-data` on `/stats/` only, beside the existing
`#gauge-data`. `Model` reads it (`readInlineStats`), falls back to
`statsSeed.rate` in `statsRateFormatted`, and exposes `seededDelta(key)`.

**The seed is range-guarded.** A card's delta line names its window ("over 1M"),
so `seededDelta` returns nothing unless `statsRange` still matches the range the
seed was computed for (30d, Model's default). Switching to 24H drops back to
showing no delta until ChartsStore has that range's history — which is what it
did before, rather than mislabelling a 30-day change as a one-day one.

**New `src/data/prometheus-query.ts`.** The query string now has one definition
instead of two. Three places have to agree on it byte-for-byte — the chart
client, this new build-time fetch, and the nginx allowlist in
`specs/metrics-proxy-nginx.conf`, which returns 403 for anything else.

**`ShellStatsPage.astro`** extends the static shell to `/stats/`: the title
block, the range pills and all four cards, complete. The charts below are still
the island's — they have their own in-card loading state and there is nothing
useful to draw before their history arrives.

### One thing worth knowing about the build-time fetch

The gauge host sits behind Cloudflare, which answers a bare Node `fetch` with a
challenge — the request has to identify itself. The seed fetch sends a
`user-agent` naming the build. Without it the build silently falls back to
dashes. (This was found the slow way: a hand-rolled `curl` with
`--data-urlencode` produced a differently-encoded query and got a legitimate 403
from the allowlist, and a `urllib` attempt with the _correct_ encoding then got
Cloudflare's 403 — two different causes wearing the same status code.)

## Verification performed

- **The static `/stats/` HTML now carries every card in full**: `8M GRAM staked
(TVL) · $10.9M`, `▲ +217.1% over 1M`, `exactly 7,996,339 GRAM`, `17.34% APY,
last round`, `Staking fee 0%`, `23.4K Active stakers ▲ +0.8% over 1M`, and
  `1.1593 hGRAM / GRAM rate ▲ +1.2% over 1M` — the last of which was previously
  blank until the chain answered.
- **No blink**: the hydrated island's card text is character-identical to the
  shell's. The test is stronger than it looks, because on localhost both the v4
  chain endpoint and the Prometheus proxy are CORS-locked to the production
  origin — neither answers, so those figures can only have come from the two
  inlined seeds.
- All five app pages: shell removed on hydration, **0 JS errors**.
- `npm run build` clean, 512 pages; `check-i18n` ok (no new keys — the shell
  reuses the island's `app` catalog).
- The bidi isolate marks (U+2068/2069) appear in the built HTML but not in
  Chrome's `--dump-dom` output; the dump strips format characters everywhere, so
  that difference is an artefact of the tool, not of the render.

## Follow-ups

- `/defi/` still has no body mirror; it is a static link list and should be
  straightforward.
- The seed covers the 30d range only. Landing on `/stats/` and immediately
  switching range still shows no delta until that range loads.
- The Prometheus seed makes the build depend on one more external service. It
  degrades to the old behaviour (blank until the island fetches) and logs
  `[stats] seed unavailable`, so it cannot break a deploy — but a silent
  Cloudflare policy change would quietly cost the cards their figures.
