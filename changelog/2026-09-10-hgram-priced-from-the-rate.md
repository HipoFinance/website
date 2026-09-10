# 2026-09-10 — hGRAM is priced from the redemption rate, not from a ticker

`hipo.finance/stats/` drew hGRAM below GRAM. That is not a market event, it is
impossible: one hGRAM redeems at the treasury for `total_coins / total_tokens`
GRAM, on demand, and that rate starts at 1 and only ever rises. It read 1.16516
that morning, so hGRAM was worth $1.61 against GRAM's $1.38 — and the chart said
$1.20.

The site was not computing that. It was faithfully drawing
`hipo_hton_current_price`, which gauge takes from CoinGecko, which is a
volume-weighted average of hGRAM's DEX tickers — and 73% of that weight sits on
a STON.fi v1 ticker reporting 0.8679 GRAM per hGRAM, which is exactly
1/1.1522. Repeating an aggregator's error under our own logo is the worst place
to stand while asking that aggregator to fix it.

## Commits

| Commit    | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| `594cba9` | Price hGRAM from GRAM and the redemption rate, not from a ticker |

## How wrong it was

Pulled from the live Prometheus range the charts already query — 30 days, 2h
step, 350 samples where GRAM's price and the rate overlap:

|                                    |                                        |
| ---------------------------------- | -------------------------------------- |
| published hGRAM ÷ GRAM             | min 0.8550, median 1.1364, max 1.1923  |
| error against the redemption value | median −1.5%, worst −26.4%, best +2.7% |
| within 2% of the redemption value  | 194 of 350 samples                     |
| published _below_ GRAM             | 55 of 350 samples (16%)                |

The shape is the diagnosis. A weighted average of a correct ticker and its own
reciprocal lands anywhere between the two depending on which had the volume that
day, which is why the series is right about half the time and badly wrong the
rest — and why this looked like it "worked until the other day" rather than like
a feed that had been broken for a month.

## What changed

**Chart 4** (`charts/derived.ts`, `StatsPage.tsx`) multiplies
`hipo_ton_current_price` by `hipo_treasury_hton_rate` — the rate chart 6 already
plots. Both inputs are sound: GRAM is a deep, many-venue market that no single
bad ticker moves, and the rate is read straight off the treasury contract. The
product is right across the **whole history**, which a fixed upstream feed would
not have been: it would only start being right from the moment it was fixed, and
every range longer than that would keep showing the bad points.

Joined on timestamp, never by index. `prometheus.ts` already warns why: the gauge
exporter drops a series it could not read rather than holding its last value, so
the two arrive with independent holes. 350 of 351 GRAM samples found a matching
rate sample, and a rate below 1 is skipped as a bad sample rather than drawn as a
cheap hGRAM, leaving a gap the chart renders as a gap.

**The hGRAM stat card** (`Model.derivedHgram`) does the same substitution from
the treasury state `/stats/` already polls every 5 minutes: price and market cap
from `totalCoins`, supply from `totalTokens`, holders passed through untouched
(that comes from TonApi and was never in doubt). The 24h change compounds GRAM's
with one day of the rate's growth — at a 13% APY that is +0.034 pp, and the card
shows two decimals of a percent, so it is visible and the same arithmetic gauge
does. Falls back to the gauge's own hGRAM block for the moments before the island
has read the chain.

**A zero volume now reads as "unknown"** in `tokenStats`, rendering `—` instead
of `$0`. gauge publishes `0` for hGRAM's volume because trade flow across venues
does not follow from a redemption rate; a listed token that traded nothing at all
in 24 hours does not happen, so `$0` would be a claim rather than a gap.

**A caption** on chart 4 — "hGRAM is priced from GRAM at the redemption rate
above: what the treasury pays for it, not what an exchange quotes" — in all nine
released locales, so the line is explained rather than merely correct.

## Declined

**Dropping `hipo_hton_current_price` from `PROM_QUERY`.** It is no longer drawn,
but that string is matched byte-for-byte by the reverse-proxy allowlist in
`specs/metrics-proxy-nginx.conf`; removing a name makes this a two-repo,
ordered deploy instead of a chart edit, and a mismatch is a 403 on every chart.
The series still scrapes, still costs nothing, and is worth keeping visible for
comparison against the derived line.

**Waiting for the gauge deploy alone.** gauge now derives the same figures
server-side (`gauge@dc0e407`), which fixes the `/data` endpoint, the Telegram
bot's pinned price and the Prometheus series for everyone. But the two deploy
independently, gauge's fix only helps the chart from its deploy forward, and the
history stays wrong either way. This is the half that is true the moment it
ships, and the half that owns the history.

## Verification performed

- `npm run build` — 523 pages, clean, Pagefind index built.
- `node scripts/check-i18n.mjs` — ok, 0 warnings, 631/631 in every released
  locale after `--update-hashes` on all nine.
- `npx prettier --check` on every file touched (`specs/app-stats-charts.md` was
  already non-conforming before this change and is left as it was).
- The derivation checked against live Prometheus through the same allowlisted
  query the site sends: at 2026-09-10 06:00 UTC, rate 1.16516 × GRAM $1.38 =
  **$1.6079**, against a published $1.2000. The 30-day table above is from that
  same pull.

## Follow-ups

- The upstream report to STON.fi and CoinGecko is still to be filed. STON.fi owns
  the V1 exchange integration and has an escalation path a token project does
  not; "STON.fi" and "STON.fi (V2)" are two separate CoinGecko exchange entries
  and only the first is wrong.
- CoinGecko's anomaly detector has it backwards on this pair — `is_anomaly: true`
  on the three correct tickers, `false` on the inverted one — because it compares
  each against its own bad average. Worth including in the report.
- `hipo_hton_current_price` is still the wrong number in Prometheus for anything
  else that reads it. Nothing on this site does any more.
