# 2026-08-29 — Hipo Rewards, from a list of three bullets to a page that answers "what do I get"

The Hipo Rewards page named three reward streams in 171 words and left the reader
no way to tell what any of them was worth. Marketing supplied a draft — written
against live protocol figures — to replace it. This session merged that draft into
the existing page rather than adding a second one, and in the process found that
**five of its factual claims were wrong**, then found that the correction made to
the most important of them was **also wrong**, and settled it against the backend.

The page is now ~950 words: the formula, the level coefficients, a worked table,
and an honest statement of what the HPO boost is worth in percentage points.

## Commits

| Commit | Description                                                         |
| ------ | ------------------------------------------------------------------- |
| (this) | Expand Hipo Rewards with the HPO boost formula, table and valuation |

## What the draft got wrong

| Draft claim                                       | Actual                                                        |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `HPO reward = GRAM staked × …`                    | the base is the _current GRAM value_ of the stake — see below |
| `LevelRate` is the level number, 1–10             | a fixed coefficient table; Level 5 is **3×**, not 5×          |
| "Claims have a **72-hour window**"                | no claiming window since Season 4                             |
| "Seasonal upgrade — claim at the end of a season" | claim **at least once during** the season                     |
| "XP by … referring others (1% of HPO rewards)"    | conflates 5%-of-their-XP with the separate 1%-of-HPO reward   |

The 72-hour window is the Seasons 1–3 model, retired in Season 4 and already
documented as retired in `giveaways-and-prizes/hipo-club.md`. Publishing it would
have contradicted a sibling page directly.

The Level 5 error is the expensive one: the draft's table asserted a strict
multiplier, making its Level 5 column **67% too high**. The real coefficients come
from the maintainer's level spreadsheet and were confirmed twice over (below):

| Level | 1    | 2    | 3    | 4    | 5   | 6   | 7    | 8    | 9    | 10  |
| ----- | ---- | ---- | ---- | ---- | --- | --- | ---- | ---- | ---- | --- |
| Rate  | 1.0× | 1.2× | 1.6× | 2.2× | 3×  | 4×  | 5.2× | 6.6× | 8.2× | 10× |

They fit `1 + 0.1 × L × (L−1)` exactly — the gaps widen by a constant 0.2, so the
step from 9→10 is worth nine times the step from 1→2. The page states that in
words rather than printing the formula.

## The base of the formula, and how it was settled

This is worth recording because it was got wrong twice.

**Round 1 — the draft said "GRAM staked".** Four pages in this repo said
otherwise: `hipo-club.md:12` and `:16`, `glossary.md:18`, `index.md:43` all say
the reward is earned "on the hGRAM you hold" — as did the pre-existing version of
the very page being replaced. Four sources agreeing, one of them the page's own
prior text, was treated as sufficient. The table was re-keyed to hGRAM.

That was wrong, and the reasoning was bad in a specific way: it was documentation
agreeing with documentation. Hipo Club runs off-chain, so the truth was never in
these files. No reward data was checked before publishing.

**Round 2 — the reward history.** The maintainer supplied a Level 6 wallet.
Its `hpo_reward` **grows every round**, by ~0.0325%:

```
5.398266963 → 5.399996036 → 5.401793941 → … → 5.414074927
```

An hGRAM balance is constant by design — rewards accrue in the exchange rate, not
the balance — so a fixed-hGRAM base would produce a flat number. It grows at
precisely the rate the exchange rate grows. Backing the base out gives
`5.414074927 ÷ (0.0021902 × 4) = 617.99`, and the same wallet's GRAM rewards
disambiguate what that quantity is:

- as a **GRAM value**: 5.360 GRAM over 27 rounds → **16.7% APY** ✓ (protocol: 16.57%)
- as an **hGRAM balance**: the position would be worth 716.6 GRAM → **14.2% APY** ✗

**Round 3 — the code.** `HipoGang/app`, `game/redis/jobs.go:2579-2587` and
`:2641-2654`:

```go
htonExchangeRate := totalCoinsFloat / totalTokensFloat
htonMultiplier   := HtonHpoRewardRate * htonExchangeRate
...
htonRewardFloat  := balanceHtonFloat * htonMultiplier
```

So: `balanceHton × 0.0021902 × htonExchangeRate × rewardCoefficient`. The
multiplicand is the live jetton balance (`GetTokenWalletBalance`, `jobs.go:2354`),
and the treasury-wide rate is folded in before it. The effective base is the
**current GRAM value of the stake** — which is neither the draft's "GRAM staked"
(that implies the original deposit, which is fixed) nor "hGRAM held".

The page now says "what your stake is **worth in GRAM right now**", and notes the
consequence the draft missed: because base rewards lift that value every round,
the two streams compound together.

`game/clublevels.go:8-48` confirmed the coefficient table independently, and the
rewards API returns it verbatim as `reward_coefficients`.

## What it is worth

Stated as percentage points rather than a headline HPO number: **~0.18 pp** at
Level 1 and **~1.8 pp** at Level 10, on top of the GRAM APY, at HPO's price on
29 August 2026. The draft's own pair (0.2 and 1.6) was internally inconsistent —
they cannot both hold when Level 10 is exactly 10× Level 1.

The draft's paragraph explaining _why_ it is framed this way was kept nearly
verbatim; it is the best thing in the draft. HPO's 24h volume is around $4 on a
$1.8M cap, so a large position cannot be valued by multiplying by the quoted
price, and the page says so rather than letting a six-figure HPO number do
unearned work.

## Season 5: staking no longer earns XP

Confirmed by the maintainer: the hGRAM-balance XP constants in
`game/points.go:15-17` are dead in Season 5. Removed the staking-XP claim from
`hipo-rewards.md`, `hipo-club.md` (the whole "the more you stake, the more XP"
clause, plus the now-meaningless "5% of their staking XP" referral share) and
`glossary.md`. `hipo-club.md` gained an explicit disambiguation, because the two
mechanisms are easy to conflate now that only one responds to stake size: XP is
Club activity, the coefficient is what your stake is worth.

## Decisions declined

- **Publishing the level-up fees.** The spreadsheet carries two competing columns
  ("Model 1" $20–180, "Model 2" $20–460). That is an undecided internal pricing
  question, not documentation. The page still says "pay the level-up fee".
- **Sweeping the prose collection.** Six files in `src/content/prose/en/` carry
  the same "on the hGRAM you hold" shorthand. The maintainer decided to leave
  them: they are true at their level of detail — the multiplicand really is the
  hGRAM balance — and only the docs pages carrying a formula needed the
  precision. Each would also have cost nine retranslations.
- **A combined "total APY" number.** The streams are stated separately and the
  GRAM APY is never hardcoded, only linked to `/stats/`, per `risks.md`.
- **A `:::caution` for the thin-market note.** Rendered too loud directly under
  the reward table; the maintainer chose `:::note`.

## Locales

All four changed pages were updated in all nine released locales (fa, ru, ar, de,
hi, tr, it, id, pt-br) — 36 files. `hipo-rewards.md` was retranslated in full;
the other three took targeted single-sentence edits so the reviewed prose around
them survived.

Every locale independently overrode one instruction, correctly: the brief said
"preserve all numbers exactly", but `GLOSSARY.md` mandates per-locale separators
and the existing corpus already follows them. Values were kept identical and only
the notation localised — `1.000` (de/it/id/pt-br/tr), `1 000` (ru), `۱٬۰۵۵` (fa),
`١٬٠٥٥` (ar), `1,000` (hi, matching its own corpus). Left literal, `~1,055 HPO`
reads as _one point zero five five_ in half of them.

### Verification performed

- `npm run build` — clean, 512 pages, `prebuild` gate passed.
- `check-i18n.mjs` — `stale 0` for all nine locales, coverage 100% (585/585)
  after `--update-hashes`.
- Live protocol figures cross-checked before publishing: round 65,536 s and
  ~481.5 rounds/year, governance fee 0.00%, exchange rate 1.1596, APY 16.57%,
  HPO $0.00231886 — via the Hipo MCP tools and `gauge.hipo.finance/data`.
- The formula's base established three independent ways (docs, a real wallet's
  reward history, the backend source) — the last two agreeing to six decimals:
  533 hGRAM × 1.1596 × 0.0021902 × 4 = 5.414 HPO, matching the logged value.
- Structural diff of all 36 translated files against English: hrefs, `:::`
  markers, table rows, headings, code fences and every numeric magnitude match.
  Caught one divergence — pt-br had bolded a glossary clause English leaves
  plain — which was fixed.
- All nine localised pages served from a local `astro preview`: HTTP 200, both
  tables, both asides, `dir="rtl"` on fa and ar.
- All eight internal links on the English page resolve 200.

### Follow-ups

- **The 36 translated files are LLM-drafted and unreviewed.** `--update-hashes`
  reset the reviewed flag; a quiet gate is not a verified translation. Two
  sentences were flagged as having no idiomatic equivalent by several locales
  independently — "the reward for climbing is back-loaded" and "the two streams
  compound together". Simplifying the English may be better than fixing nine
  translations of it.
- **hGRAM in DEX pools also earns HPO.** `jobs.go:2641-2654` adds DeDust, STON.fi
  and TONCO balances to the base when the snapshot is under 6 h old. Nothing on
  the site says this, and it is a real reason to use `/defi/` without losing the
  boost.
- **You do not have to stake to earn the boost.** The base is a jetton balance, so
  hGRAM bought on a DEX earns identically. The page's framing is fine for the
  common case but is not the literal rule.
- **The level spreadsheet contradicts itself** — its table says Level 6 = 4×, its
  worked example says 4.2. The table is right (the API confirms 4). It also still
  says `hTON`.
- **`hipo-club.md`'s Season 4 note.** Its heading is now "What changed **since**
  Season 4" in all ten locales, matching the body text, which already said "From
  Season 4 onwards" — the note covers a Season 5 rule too, so "in" was wrong.
  Each locale needed its own construction rather than a word swap (fa "from …
  onwards", tr's ablative `-dan beri`, ru "starting from"). The note still needs
  a proper rewrite once the rest of the Season 5 changes are known.
- **`coefficient` has no `GLOSSARY.md` row** and the Hindi corpus renders it two
  ways (`गुणांक`, `कोएफ़िशिएंट`).
- The marketing package's `llms-txt-additions.md`, `vs.astro` and `verify.astro`
  are a separate task and untouched. The "43.7% total APY" figure that package
  asks to correct **does not exist in this repo** — no match in `src/` or
  `public/`; it must live on the old GitBook or off-site.
