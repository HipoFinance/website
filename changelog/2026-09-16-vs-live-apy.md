# 2026-09-16 — `/vs/` was the one page whose APY could not correct itself

Follow-on from the stake-label fix earlier the same day. Reported from Telegram: "check the APY
displayed on /vs/ — it might have problems and not match the root page or /stats/." It does not
match, and the reason is not a formula: all three surfaces round the same way. `/vs/` was simply
the only one frozen at its last deploy.

| Commit         | Subject                                                  |
| -------------- | -------------------------------------------------------- |
| (this session) | Refresh the live protocol figures on /vs/ in the browser |

## What the three surfaces actually do

| Surface                   | APY source                                                                            | Live at view time?                                                              |
| ------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `/` landing               | gauge `treasury.current_apy`                                                          | baked at build **+ one client refetch on load** (`src/scripts/landing-data.js`) |
| `/stats/`, the dApp strip | **chain** `(currentRate/previousRate) ^ (year/windowDuration) − 1`, gauge as fallback | live — chain every 5 min on `/stats/`, 10 s elsewhere                           |
| `/vs/`                    | gauge `treasury.current_apy`                                                          | **frozen at build time**                                                        |

All seven call sites format with `formatPercent(locale, …, 2)`, so rounding was never the problem.
Two real differences sat underneath the report:

1. **`/vs/` had no client refresh.** Every other gauge-fed figure on the site corrects itself in the
   visitor's browser; `/vs/` did not, so it kept quoting whatever the APY was at the last push. That
   is not a small drift: over the last 30 days `hipo_treasury_apy` ranged **12.34 % – 33.70 %**, and
   the series shows **28.12 % about 26 hours ago against 17.22 % now**. The spec itself records the
   page printing 33.70 % on 2026-09-14. A visitor comparing `/vs/` with `/` would have seen two
   "Current APY" figures sixteen points apart.
2. **`/stats/` prefers the chain; `/` and `/vs/` are pure gauge.** The gauge is a server-side mirror
   of the same contract fields and can lag by a round, so those two can differ from the dApp by a
   few basis points even when both are fresh. This is by design, it is small, and the landing page
   has always had it. Left alone.

Cause 1 is the bug. Cause 2 is worth knowing when comparing the pages.

## The fix

`/vs/` now does what the landing page does — bake for the crawlers, correct for the humans:

- **`vsValues()` in `src/data/gauge.ts`** formats the page's gauge-derived figures, keyed by the
  `data-vs-live` attribute that carries each in the markup. It is the fourth rounding of the same
  fields in that file, for the same reason the other three differ: `/vs/` prints the **exact**
  staked total, not a compact one. `VS_EXAMPLES` moved here too, because the client has to derive
  the per-year rows from the same stake list the table was built from.
- **`src/scripts/vs-data.js`** fetches the gauge once on load and writes every `[data-vs-live]`
  node through that same function — so a value that has not moved is written back
  character-identical and nothing flashes. A key names several nodes (the fee is in the hero card
  and in all four table rows, the APY in the hero card and in two sentences), so it writes every
  match, not the first. A field the gauge omits is skipped, so a partial payload cannot blank a
  good baked figure; a failed fetch leaves the page exactly as built.
- **`VsRoute.astro`** tags the hero cards, the per-year column and the fee column, and fills the
  `{apy}` placeholder in `vs.worth.leadWith` and `vs.compare.vsCurrent` with a `data-vs-live` span
  — the same interpolate-the-markup trick as `Landing.astro:76` and the stake label. Refreshing the
  hero but not the prose would have the page contradict itself half a sentence later.

No copy changed, so no locale work: the numbers move, the sentences do not.

### What is deliberately still frozen

- **The `<title>` and meta description**, which quote the APY. They are crawler-facing and rebuilt
  on every deploy; a client script cannot help them.
- **The HPO section.** Its boost-points sentence is priced from the gauge's HPO and GRAM prices,
  which move more than the APY does — but that copy already says "at the price when this page was
  built", and refreshing it would mean a second fetch (`api.hipogang.io`) and pulling
  `src/data/club.ts` into a browser bundle. Out of scope for a report about the APY; see follow-ups.
- **The realized-return section**, which is historical by construction.

Cost on `/vs/`: `format.js` was already loaded by `vs-stake.js`, so the addition is
`gauge.js` (1330 B) plus the 459 B script — about 700 B gzipped.

### Verification performed

- Read the current gauge: `current_apy` 17.221143117599613, `protocol_fee` 0, `current_tvl` 7046657982254413. Confirmed `/`, `/stats/` and `/vs/` all serve 17.22 % right now — they agree
  immediately after a deploy, which is why the bug is invisible at exactly the wrong moment.
- Queried the site's own Prometheus range (the `PROM_QUERY`, step 7200, 30 days) for the drift
  figures quoted above: `hipo_treasury_apy` min 12.335 / max 33.703, and 28.12 → 17.04 → 17.22 over
  the last 28 hours. `hipo_treasury_latest_apy` (the tooltip's single-release figure) reads 17.79,
  which is the gauge-versus-chain gap in cause 2, visible.
- `npm run build` — clean, `i18n: ok, 0 warnings`.
- Drove the **built** `vs-data` chunk against a stub DOM holding the cells the page ships:
  - a moved payload (28.1234 %) rewrote all three APY nodes, both `earn:` rows (`≈ 281 GRAM`,
    `≈ 14,062 GRAM`) and left the staked total correct;
  - a payload with `protocol_fee` omitted left the baked `0%` in place rather than blanking it;
  - `<html lang="fa">` produced `۲۸٫۱۲٪` and `≈ ۱۴٬۰۶۲ GRAM`, so the locale is read from the document
    as on the landing page;
  - the live payload reproduced the baked strings character-for-character.
- Checked the emitted chunk graph for the byte cost quoted above.

### Follow-ups

1. **The HPO boost sentence is still priced at build time.** Honest, because the copy says so, but
   HPO's price moves further than the APY does. If it is worth refreshing, it needs `club.ts` in a
   browser bundle and a second endpoint — decide whether the page wants that before doing it.
2. **`vs.hero.note`** still reads "read from the contracts when this page was built". Now
   conservative rather than wrong for a visitor with JS. Not changed here because it would mean
   re-translating a sentence in nine locales to say something weaker.
3. **The gauge-versus-chain gap (cause 2) is undocumented on the pages themselves.** Nothing to fix
   today; worth remembering the next time two surfaces are reported as disagreeing by a few
   basis points.
