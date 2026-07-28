# 2026-07-28 — FAQ accuracy pass

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. The
maintainer had hand-added `src/content/docs/faq/faq.md`, a second FAQ intended
for `/docs/`, and asked for it to be reviewed against the site's existing FAQ
component. The review found thirteen substantive conflicts between the two. The
decision was to publish only one FAQ — the existing `/faq/` page — and to fold
the corrections the comparison surfaced into it.

| Commit    | Summary                                                         |
| --------- | --------------------------------------------------------------- |
| `a8f6f93` | Correct and expand the FAQ, and fix the validation round length |

This report and the `CHANGELOG.md` entry land in a follow-up commit. The work
is on the `faq-accuracy-pass` branch, not `main`.

---

### Why there is no docs FAQ

`specs/gitbook-docs-migration.md:132-136` records that GitBook's
`frequently-asked-questions` section was retired during the migration with no
equivalent under `/docs/`, and that inbound links to it were remapped to the
site's own `/faq/` page. Reintroducing a docs FAQ would have reversed that
decision and left the site with two FAQs that disagreed with each other on
minimum stake, unstaking time, reward mechanics, audits and fees.

The maintainer's own reason for not simply linking `/docs/` readers to `/faq/`
is worth recording: the two are themed differently — Starlight owns `/docs/`
and deliberately does not load `global.css` — so bouncing a reader between them
is a visible discontinuity. Hence no docs FAQ at all, neither content nor link.

`src/content/docs/faq/faq.md` was removed. It was never committed, so it leaves
no trace in `git log`; its contents were the retired GitBook FAQ.

Removing it also unbroke the build. The file had no frontmatter, and
`docsSchema()` requires `title`, so `npm run build` failed outright while it was
present — it would have broken the deploy had it been pushed.

### What the comparison found, and what was changed

The docs draft was mostly worse than the page it duplicated — more marketing
register, no instant-unstake coverage, `$HPO` styling, "Grams" vs "GRAM" — but
it was right about several things the live page was vague or wrong about. Those
became the edits:

- **Rewards are not real-time and do not land in your balance.** The old answer
  said rewards are "included in the value of hGRAM", which is correct but thin;
  the docs draft said outright that rewards are "added to your hGRAM balance",
  which describes a rebasing token. hGRAM is value-accrual. The page now states
  explicitly that the count in your wallet never changes on its own. This was
  the single most user-damaging discrepancy of the thirteen.
- **The reward waterfall** from the docs draft was worth keeping: validator
  share first, then the protocol share, then the remainder returns to the
  treasury and lifts the rate for everyone. It answers "where do rewards
  actually come from" better than the previous one-liner.
- **Deferred minting** had no coverage at all. `instantMint` was `false` at the
  time of writing with pending deposits queued, so "you will receive hGRAM in
  your wallet" was not the whole story. A new question,
  `#how-long-does-it-take-to-receive-hgram`, covers both cases.
- **Unstaking timing** was the most interesting one; see below.
- **Fees** were three deflections ("any applicable fees are displayed in the
  app"). The real answers are better than the evasions: nothing is taken from
  the staked amount, the governance fee is currently 0%, and gas is a
  prepayment whose unused remainder is refunded — on unstaking, together with
  the final payout rather than at request time.
- **Audits** said Hipo "publishes security audits when available", which reads
  as though there might not be any. There are two, and they are linked.
- **Minimum stake** contradicted outright: "no fixed minimum" on the page
  versus "1 GRAM" in the draft and in `introduction/advantages-of-hipo.md`. The
  unified wording keeps both true.
- **Support** named no channels; it now links Hipo Chat, the Telegram channel
  and X, and carries a line that Hipo never asks for a seed phrase.

Eight typos were live on the page and are fixed: `muchf`, `mroe` twice, `yoru`,
`supprted`, `reflecting`, `Ver`, `sstaking`, and "there process".

### The 36-hour figure

The docs draft said a validation round is "approximately 18 hours, with an
additional 9 hours for complaints". `public/llms.txt` said "A TON validation
round is roughly 36 hours" and `introduction/hipo-rewards.md` said rewards are
distributed "every validation round (~36 hours)".

The draft was right and the repo was wrong. `get_round_timing` reports
`roundDurationSeconds: 65536` (18.20 h) and `stakeHeldForSeconds: 32768`
(9.10 h). Thirty-six hours is two rounds.

The important distinction is that 36 hours is still correct as the **worst-case
unstaking wait**, which is what `tutorials/unstaking.md` and `llms.txt` were
really pointing at, and `specs/gitbook-docs-migration.md:142` explicitly asks
that the figure be kept in agreement across the three places it appears. So the
36-hour wait is unchanged everywhere; only the claim that a _round_ is 36 hours
was corrected, in the two files that made it.

The unstaking answer now explains the mechanism rather than just quoting a
bound: recovery windows open roughly every 18 hours as consecutive rounds
release their stake, so a request that has to wait lands somewhere in that
cycle — averaging about 9 hours, topping out near 18, with 36 as the worst case
of just missing a window. Derived from two live participations 18.20 hours
apart in their recovery times.

### Considered and not done

- **Empirical average unstaking time.** The ~9 hour figure is an expectation
  derived from the round cycle, not a measurement. Neither the contract getters
  nor the MCP server expose historical unstake-to-payout data, so the page
  describes the cycle rather than claiming a measured average. The docs draft's
  "around 30 hours on average" corresponds to nothing in the protocol — neither
  one round nor two — and was not carried over.
- **Quantitative liquidity claims.** How often Hipo can pay an unstake
  instantly depends on deposit flow, which is not a stable protocol property, so
  that stays qualitative ("usually").
- **The `~20% APY` and `up to 43.7% total APY` figures** in
  `introduction/hipo-rewards.md`. Live APY was 15.59% while writing this. They
  read as marketing figures rather than errors and were left alone, but they
  overstate current chain data and are worth a decision.
- **The duplicated six-benefit list** in `introduction/advantages-of-hipo.md`,
  near-verbatim from the docs draft. Not a conflict now that the draft is gone,
  just redundancy.
- **Naming "Hipo Hub".** The draft mentioned it as a multilingual forum but
  gave no link, and none was found in the repo. Naming an unlinkable thing is
  worse than omitting it.

---

### Verification performed

- Reproduced the build failure the new file caused before removing it:
  `InvalidContentEntryDataError: docs → docs/faq/faq … title: Required`.
- Checked every numeric claim against live contract state through the Hipo MCP
  server rather than against the repo's own prose: `get_round_timing` for round
  and freeze durations, `get_treasury_state` for participations, pending
  deposits, `instantMint` and the 0% governance fee, `get_fees` for the gas
  prepayment behaviour.
- Confirmed the two recovery times in the live participations are 18.20 hours
  apart, which is the basis for the recovery-window wording.
- Confirmed no duplicate `id` attributes across all 65 questions and 10
  sections after the edits.
- Confirmed the two anchors other pages deep-link to still exist:
  `#what-apy-does-hipo-offer` and `#how-long-does-unstaking-take`.
- Sourced the audit names and links from `security/why-your-security-matters.md`
  and `Landing.astro`, and the support links from `LandingFooter.astro`, rather
  than writing them from memory.
- `npx prettier --write` on `FAQ.astro` and `hipo-rewards.md`; `llms.txt` has no
  prettier parser and was left as plain text.
- `npm run build` — 44 pages, Pagefind index rebuilt, no errors.

### Follow-ups

- **`introduction/hipo-rewards.md` APY figures** overstate live data; see above.
- **`src/content/docs/hipo-ambassadors-program.md`** has an uncommitted
  prettier reformat in the working tree that did not come from this session,
  most likely an editor's format-on-save. Left unstaged deliberately so it is
  not swept into an unrelated commit.
- Carried over and still open: **the `docs.hipo.finance` Cloudflare cutover**
  has not been executed; the runbook is in `specs/gitbook-docs-migration.md`.
- Carried over: the `engines` field for the `HipoFinance/mcp` repo, the
  `abs-0.twimg.com` emoji hotlink in `tokenomics.md`, and the five pre-rule
  verbose `CHANGELOG.md` entries.
