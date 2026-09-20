# Keeping the /vs/ comparison current, and four fixes from review

Follow-up to [the realized-APY comparison](2026-09-14-realized-apy-comparison-on-vs.md), shipped the
same day. Four items came out of reviewing the live page: the preset chips wrapped, the reconciling
line about a 33% APY needed context, the page had no way to stay current, and `/stats/` had no route
to the new chart.

## The chips wrapped

`1,000,000` is wide, and the fourth preset fell to its own line. The labels now use the locale's own
compact notation through `formatCompact` — `1M` in English, `۱ میلیون` in Persian, `1 लाख` in Hindi,
which uses lakh and is right to — and the exact amount moved to each button's `aria-label`, since a
compact form is terse for a screen reader.

Shorter labels alone would not have fixed it. The row was one wrapping flex container with a spacer
between the input and the chips, so a break stranded a single chip. It is now two groups: the label
and input in one, the four chips in another that moves as a unit.

## The 33% APY

The gauge reported Hipo's current APY as 33.70% while the new section showed 8.56% realized, and the
page gained a line explaining that one is an instantaneous rate and the other a year's outcome. That
figure was an incident and is not expected to recur. The line stays, because it is written about the
two kinds of number rather than about that day's value, and it reads correctly when the current APY
is an ordinary 9%: the hero moves with every validation round, the comparison does not.

Worth recording that the incident did not distort the comparison itself. The realized figures come
from the exchange rate, whose largest single-day move across the whole two-year window is 0.08%.

## Phase 2: the page keeps itself current

Until now `/vs/` showed whatever was in the committed dataset, and only moved when someone re-ran the
backfill. `gauge` now takes one reading per protocol per UTC day and serves the accumulated tail at
`/lst-rates`; the site merges it onto the baseline at build time.

**The rule that makes two sources safe is that they never overlap**: the committed file is
authoritative for every date it contains, and the gauge supplies only dates after its last one. In
`src/data/lst.ts` that is a branch on the index, not a comparison — days inside the baseline read
from the baseline unconditionally, so a gauge sample for a date the baseline owns is unreachable
whatever it claims. Re-cutting the baseline moves the boundary and nothing else changes.

Three things in the gauge side are deliberate:

- **No new scheduler.** The actor rides the existing 15-minute collect loop and the store is
  `HSETNX`, so the first successful read of a UTC day wins and the rest of the day is a no-op. The
  sample lands within one collect period of 00:00 UTC, which is where the baseline was sampled,
  without a cron.
- **It is the only history gauge holds** — everything else in that Redis is a latest value — so the
  hash is trimmed to 400 days on write. The site needs a tail of days.
- **The backfill's guards are repeated, not relaxed.** The shared pool contract that Tonstakers,
  Stakee and KTON run ships two stack layouts, and index 13 is the jetton supply in one and
  `accrued_governance_fee` in the other; the collector branches on field count and refuses a count it
  has never seen rather than picking the nearest index. Hipo is read at indices 0 and 1 behind a
  minimum-arity assertion. The failure these prevent is a plausible wrong number, not an error.

All five measured protocols are collected, not the three the page draws, so which ones appear stays
an editorial decision rather than a data one.

## /stats/ gets a link, not a chart

The comparison chart was considered for `/stats/` and rejected: the page already carries five charts
and a sixth did not earn its place. But the comparison was unreachable from inside the dApp, so the
footer row of links there — next to "More stats" and "Source on GitHub" — now carries
"Compare with other protocols", localized in all ten locales and pointing at the reader's own locale
of `/vs/`.

### Verification performed

- `go build ./...`, `go vet ./...` and `go test ./...` clean in `gauge`.
- **The merge was exercised against a mock tail**, not just against the 404 the live gauge currently
  returns. Serving three days past the baseline with a deliberate one-day hole moved the window from
  2026-09-12 to 2026-09-15, extended the growth curve smoothly (1.1275 → 1.1289) and left the missing
  day as a gap. A poisoned sample for a date _inside_ the baseline was ignored, as the index branch
  guarantees.
- The unreachable-gauge path was confirmed by the ordinary build: `[lst] gauge tail unavailable` and
  a page ending on the baseline's last day.
- Preset labels render compact in every locale; the chip group no longer wraps.
- `npm run build` clean, 542 pages, `check-i18n` ok at 711 items across ten locales.

### Follow-ups

- **Deployment is not finished.** Pushing `gauge` builds a new image, but the tag in
  `operation/stack/gauge.yaml` still points at the old one and needs bumping plus a
  `docker stack deploy` on the host that serves it; the nginx config needs uploading and
  reloading. Until both
  land, `/lst-rates` answers 404 and the site ships the baseline — designed behaviour, but the page
  is not yet self-updating.
- The `/docs/` methodology page (spec R8) is still not built.
- The nine translations remain machine-translated and unreviewed.
