# FAQ restructure — site FAQ, HPO FAQ, FAQPage JSON-LD

**Status:** implemented for English (2026-08-23); locale twins, the `/fa/` JSON-LD check and the preview click-through remain open until the locale sync pass

## Goal

Turn `/faq/` from 67 restating answers in 10 loosely-ordered sections into 40 answers in 9 sections that follow
the reader's path (understand → stake → get rewarded → hold → exit → trust → who validates → HPO → help), cut
the nine duplicate clusters the content review found, give every answer that calls for one the internal link it
is missing (`/stake/`, `/stats/`, `/defi/`, `/unstake/`, `/hpo/`, `/docs/…`), shrink the HPO page's FAQ from 9
items to 7 by dropping the two that repeat sections rendered higher on the same page and adding the three
questions a buyer actually asks (contract address, how the profit share reaches me, how do I vote), and emit
`FAQPage` JSON-LD on `/faq/` and `/hpo/` in every locale so the answers can win rich results.

This is batch 1 of three agreed content batches. It is a restructure of existing, already-corrected copy: the
accuracy batch (`specs/content-accuracy-fixes.md`, applied and committed 2026-08-23) is the source of truth for
what each answer says today, and its canonical sentences CS-1…CS-8 are reused here by reference rather than
restated.

## Context

### What `/faq/` is today

`src/components/FAQ.astro` hardcodes the section list and its order (lines 12–22): `general`, `staking`,
`hgram`, `unstaking`, `security`, `validators-and-staking-marketplace`, `hpo-token`, `ton-and-liquid-staking`,
`fees`, `support`. Each entry maps a **section id** (used verbatim as the `<section id>` deep-link anchor in
every locale) to a **catalog key** whose `faq.section.<key>.heading` / `.nav` values come from
`src/i18n/<locale>/faq.json`.

Answers come from the `prose` collection: `src/content/prose/<locale>/faq/<section>/<slug>.md`, frontmatter
`order: number`, `section: string`, `question: string`, body = the answer in Markdown. Three rules follow from
`FAQ.astro:34` and `:41-42` and matter for every decision below:

- **The anchor is the file name.** `anchor = entry.id.slice(entry.id.lastIndexOf('/') + 1)` — the last path
  segment, i.e. the file name without `.md`, rendered as `<details id={anchor}>`. The directory is _not_ part
  of the anchor, so **moving a file to another section keeps its anchor; renaming the file breaks it.**
- **The section is the frontmatter, not the directory.** Grouping filters on `entry.data.section === section.id`.
  The directory is convention only; we keep directory == section id so the tree stays readable.
- **`order` sorts within a section only** and is never displayed. It must be a contiguous 1…N per section.

There are 67 English files (`general` 7, `staking` 11, `hgram` 8, `unstaking` 7, `security` 5,
`validators-and-staking-marketplace` 7, `hpo-token` 6, `ton-and-liquid-staking` 9, `fees` 3, `support` 4) and
exactly 67 in each of `fa`, `ru`, `hi`.

### What `/hpo/`'s FAQ is today

`src/components/Hpo.astro:66-72` reads `src/content/prose/<locale>/hpo-faq/<nn>-<slug>.md`, sorts by `order`
and renders `<details>` **without an id** — the HPO FAQ has no anchors, so its file names can be changed
freely. The summary is `t('hpo.faq.item', { n, question })` = `"{n}. {question}"`, so **`order` is displayed**
and must be 1…7 and match the `NN` file-name prefix. Nine items today; items 03 and 08 restate the page's own
"HPO is built to get scarcer" (`hpo.scarcity.*`) and "How to buy HPO" (`hpo.buy.*`) sections almost verbatim,
05 is a signpost to 06/07/08, and 09 is investor-relations copy sitting next to a live price.

### JSON-LD today

`SEO.astro` already accepts a `jsonLd` prop and emits it as `<script type="application/ld+json">`. `AppLayout`
takes it as a prop with a default; **`LandingLayout` and `HpoLayout` do not** — they build a fixed `WebSite`
node and pass it. The dApp shell already ships FAQ JSON-LD: `src/components/pages/shellJsonLd.ts` builds
`@graph: [WebPage, FAQPage]` from `<locale>/shell/<page>/faq/` with a local `stripMarkdown()` helper. That file
is the pattern this batch extends; `/faq/` and `/hpo/` pass **no** `jsonLd` today.

### i18n gate constraints

`scripts/check-i18n.mjs` (the `prebuild` gate) enumerates prose by walking `src/content/prose/<locale>/**` and
keying each file on its path relative to the locale root (`prose/faq/<section>/<slug>.md`). Therefore, for the
released locales `fa`, `ru`, `hi`:

- Every English prose file must have a twin at the identical relative path — **a missing twin fails the build.**
- A file present in a locale but not in English counts as **extra** (a warning, but the acceptance criteria
  below require 0) — **every English deletion, rename and directory move must be mirrored in all four locales.**
- Catalog keys are compared the same way: removing `faq.section.general.*` from `en/faq.json` without removing
  it from `fa|ru|hi/faq.json` leaves three extras.
- Per-item hashes live in `src/i18n/<locale>/meta.json` (generated). A rename/move changes the key, so
  `node scripts/check-i18n.mjs --update-hashes <locale>` must run for each of fa/ru/hi at the end. No item is
  currently `reviewed: true` in any locale, so **this batch loses no review state.**

### Inbound anchor links

`grep -rn "/faq/#" src public` returns 13 hits, 4 distinct anchors:

| anchor                                                       | used by                                                              |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `#what-apy-does-hipo-offer`                                  | `src/content/docs/{,fa/,ru/,hi/}tutorials/staking.md:13`             |
| `#what-is-the-difference-between-full-and-instant-unstaking` | `src/content/docs/{,fa/,ru/,hi/}tutorials/unstaking.md:13`           |
| `#how-long-does-unstaking-take`                              | `src/content/docs/{,fa/,ru/,hi/}tutorials/unstaking.md:15`           |
| `#fees`                                                      | `src/i18n/GLOSSARY.md:137` — an _illustrative_ link inside backticks |

The three real ones are question anchors, i.e. file names. **All three file names are kept**, so no docs page in
any locale is edited by this batch. Only the GLOSSARY example changes, because the `fees` section is dissolved.

## Approach

1. **English first.** Apply the target structure below: catalog keys, `FAQ.astro`'s section list, then the prose
   files. Every answer is drafted at implementation from the sources named in the tables — this spec fixes the
   question titles, the facts each answer must state, its links and its length, not its sentences.
2. **Anchors are file names.** Keep the file name for every question that survives (its anchor survives with
   it, even when the file moves to another section directory); give a new file name only where the question
   itself changed. Every removed anchor is listed in the old→new map below.
3. **No docs changes.** The three anchors linked from `docs/tutorials/*` survive by construction. The only
   non-FAQ edit is the `/faq/#fees` example in `src/i18n/GLOSSARY.md`.
4. **Copy the shell wording where it is tighter.** `shell/stake/faq/01` (minimum), `shell/defi/faq/01`+`02`
   (DeFi rewards and DeFi risk), `shell/rewards/faq/01`+`02` (nothing to claim, Stats page),
   `shell/unstake/faq/01`+`02` (which option, other exits). The site FAQ becomes the superset; the shell files
   are the source, never a target — they are not touched by this batch.
5. **Twins deferred (decision 2026-08-23).** This batch, batch 2 (docs) and batch 3 (formatting) change
   **English only**; fa/ru/hi are synchronised once, after all three batches, in a dedicated pass (for a file
   whose body did not change, `git mv` the twin; for merged/renamed/new files, draft from the final English +
   `src/i18n/GLOSSARY.md`; then `--update-hashes` per locale). Because `scripts/check-i18n.mjs` fails the build
   for a released locale with missing items, fa/ru/hi are flipped back to `status: 'draft'` in
   `src/i18n/registry.mjs` for the duration (nothing on this branch is deployed) and flipped to `indexed` again
   at the sync step — the locale pages are simply not built in between.
6. **JSON-LD last**, once the answers are final, so the extracted texts are the shipped ones.

## Target structure

### Site FAQ

9 sections, 40 questions (67 → 40; the review's "~38" plus the two fee answers relocated instead of cut).
Section ids `staking`, `hgram`, `unstaking`, `security`, `validators-and-staking-marketplace`, `hpo-token`,
`support` are unchanged; `general` becomes `getting-started`, `rewards` is new, `ton-and-liquid-staking` and
`fees` are dissolved.

| #   | section id                           | English heading                  | nav label                | catalog key                    | Q   |
| --- | ------------------------------------ | -------------------------------- | ------------------------ | ------------------------------ | --- |
| 1   | `getting-started`                    | Getting started                  | Getting started          | `faq.section.gettingStarted.*` | 7   |
| 2   | `staking`                            | Staking                          | Staking                  | `faq.section.staking.*`        | 5   |
| 3   | `rewards`                            | Rewards & APY                    | Rewards & APY            | `faq.section.rewards.*`        | 5   |
| 4   | `hgram`                              | hGRAM                            | hGRAM                    | `faq.section.hgram.*`          | 4   |
| 5   | `unstaking`                          | Unstaking                        | Unstaking                | `faq.section.unstaking.*`      | 6   |
| 6   | `security`                           | Security & risks                 | Security & risks         | `faq.section.security.*`       | 4   |
| 7   | `validators-and-staking-marketplace` | Validators & Staking Marketplace | Validators & Marketplace | `faq.section.validators.*`     | 3   |
| 8   | `hpo-token`                          | HPO & Hipo Club                  | HPO & Club               | `faq.section.hpoToken.*`       | 3   |
| 9   | `support`                            | Support                          | Support                  | `faq.section.support.*`        | 3   |

Status vocabulary: **keep** = path unchanged, body lightly edited; **move** = same file name, new section
directory (anchor unchanged); **rename** = new file name (new anchor); **merge-of** = absorbs the listed
sources, keeping the named file's name. Paths are relative to `src/content/prose/<locale>/faq/`. "Max" is
guidance for the drafted answer, in words of body text.

#### 1. Getting started (`getting-started`, 7)

| order | question (frontmatter + `<summary>`) | file                             | status                                                                                                                                                 | must state                                                                                                                                                                                             | links                                         | max |
| ----- | ------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | --- |
| 1     | What is Hipo?                        | `what-is-hipo.md`                | move (from `general/`)                                                                                                                                 | Liquid staking protocol on TON; stake GRAM → receive hGRAM; hGRAM stays usable while the GRAM earns; open-source smart contracts, no account.                                                          | `/stake/`                                     | 70  |
| 2     | What is liquid staking?              | `what-is-liquid-staking.md`      | merge-of `general/what-is-liquid-staking`, `ton…/what-is-the-difference-between-staking-and-liquid-staking`, `ton…/what-is-a-liquid-staking-token-lst` | Ordinary staking locks the coin; liquid staking hands you a token (an LST) that represents the locked stake; Hipo's LST is hGRAM; rewards land in the LST's exchange rate.                             | —                                             | 90  |
| 3     | What is GRAM staking?                | `what-is-gram-staking.md`        | move (from `ton-and-liquid-staking/`)                                                                                                                  | Staked GRAM backs TON validators; validators secure the network and earn rewards; you need neither hardware nor the validator-sized stake to take part through Hipo.                                   | `/docs/introduction/how-does-hipo-work/`      | 70  |
| 4     | How does Hipo work?                  | `how-does-hipo-work.md`          | merge-of `general/how-does-hipo-work`, `general/what-happens-behind-the-scenes`                                                                        | The four steps (deposit → pooled → lent to validators for a validation round → rewards raise the hGRAM rate); **defines "validation round" once for the whole page** (≈ 18 h, then ≈ 9 h frozen). B14. | `/docs/introduction/how-does-hipo-work/`      | 110 |
| 5     | Why should I use Hipo?               | `why-should-i-use-hipo.md`       | move (from `general/`); drop the 5-bullet list                                                                                                         | Rewards without locking the coin; no minimum and no lock-up; permissionless validator marketplace instead of a hand-picked validator; audited, open-source contracts.                                  | `/stake/`                                     | 70  |
| 6     | Is Hipo non-custodial?               | `is-hipo-non-custodial.md`       | move (from `general/`); cut the repetitive second half                                                                                                 | Yes; contracts hold the stake, you hold the hGRAM; nobody can move your funds; you can leave at any time.                                                                                              | —                                             | 50  |
| 7     | Which wallets are supported?         | `which-wallets-are-supported.md` | move (from `support/`)                                                                                                                                 | Any TON Connect wallet, the connect dialog lists them; the Telegram Mini App; multisig/cold wallets via the comment flow (forward-link).                                                               | `#can-i-stake-with-a-multisig-or-cold-wallet` | 60  |

#### 2. Staking (`staking`, 5)

| order | question                                      | file                                              | status                                                                                                  | must state                                                                                                                                                                                                                                    | links     | max |
| ----- | --------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --- |
| 1     | How do I stake GRAM?                          | `how-do-i-stake-gram.md`                          | merge-of itself, `can-i-stake-directly-from-my-wallet`, `can-i-stake-more-after-my-initial-deposit`     | Connect a TON wallet on the Stake page, enter the amount, confirm in the wallet, hGRAM arrives in the same wallet; you can add more at any time and receive more hGRAM.                                                                       | `/stake/` | 70  |
| 2     | What is the minimum amount required to stake? | `what-is-the-minimum-amount-required-to-stake.md` | keep (already CS-1)                                                                                     | **CS-1** verbatim; no figure for the gas.                                                                                                                                                                                                     | —         | 60  |
| 3     | What does it cost to stake?                   | `what-does-it-cost-to-stake.md`                   | merge-of `fees/does-hipo-charge-a-staking-fee`, `fees/where-can-i-see-current-fees` → **new file name** | Hipo takes no cut of the staked amount — hGRAM for the full deposit; a TON gas prepayment rides on top, **CS-7** magnitude, never a figure; unused gas is refunded; the app shows the exact number before you confirm.                        | —         | 80  |
| 4     | How long does it take to receive hGRAM?       | `how-long-does-it-take-to-receive-hgram.md`       | keep                                                                                                    | Usually moments after confirmation; when all free GRAM is already committed to the current round the mint waits for the round to be committed and the app shows the countdown; the deposit is not at risk while it waits. B4 (of the review). | —         | 70  |
| 5     | Can I stake with a multisig or cold wallet?   | `can-i-stake-with-a-multisig-or-cold-wallet.md`   | keep (order 11 → 5)                                                                                     | Plain transfer with comment `d` plus a fee prepayment (generously rounded up, remainder refunded); comment `w` unstakes the whole balance; the app shows the treasury address to copy when a multisig connects.                               | —         | 90  |

#### 3. Rewards & APY (`rewards`, 5 — new section)

| order | question                             | file                                     | status                                                                                                                                                                              | must state                                                                                                                                                                                                                        | links                                            | max |
| ----- | ------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --- |
| 1     | Do I need to claim rewards?          | `do-i-need-to-claim-rewards.md`          | merge-of `staking/do-i-need-to-claim-rewards`, `hgram/does-hgram-earn-rewards`                                                                                                      | No claim step; the hGRAM balance never changes on its own, its GRAM value does; rewards accrue wherever the token sits. Wording from `shell/rewards/faq/01`. B16.                                                                 | —                                                | 60  |
| 2     | When do my rewards start?            | `when-do-my-rewards-start.md`            | rename-of `staking/do-i-receive-rewards-immediately`                                                                                                                                | Not instantly — once the deposit is working in a validation round, up to about 18 hours away; then the rate updates round by round after each round's rewards are recovered. B13.                                                 | `#how-does-hipo-work`                            | 70  |
| 3     | What APY does Hipo offer?            | `what-apy-does-hipo-offer.md`            | merge-of `staking/what-apy-does-hipo-offer`, `staking/is-apy-fixed`, `ton…/what-affects-staking-apy`, `ton…/why-does-apy-change-over-time` — **file name protected (inbound link)** | APY = estimated yearly reward rate; not fixed and never guaranteed; moves with TON's own rewards, validator bids and how much GRAM is staked; the live number and its history are on the Stats page. **No figure anywhere.** B18. | `/stats/`                                        | 80  |
| 4     | How are staking rewards distributed? | `how-are-staking-rewards-distributed.md` | move (from `staking/`)                                                                                                                                                              | The three-step waterfall as it stands today (validator's agreed share → governance fee **CS-8** → remainder to the treasury, raising the rate); forward-link the marketplace answer for "won the loan". B15.                      | `/docs/dao/`, `#how-does-hipo-select-validators` | 120 |
| 5     | Does Hipo take a cut of my rewards?  | `does-hipo-take-a-cut-of-my-rewards.md`  | rename-of `fees/does-hipo-charge-a-management-fee`                                                                                                                                  | No management or subscription fee, nothing skimmed as rewards accrue; the one protocol-level fee is **CS-8**, currently 0 %, changed only by governance and visible on-chain.                                                     | `/docs/dao/`                                     | 70  |

#### 4. hGRAM (`hgram`, 4)

| order | question                           | file                                   | status                                                                                           | must state                                                                                                                                                                                                                                                                                                                           | links                 | max |
| ----- | ---------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | --- |
| 1     | What is hGRAM?                     | `what-is-hgram.md`                     | merge-of itself, `why-do-i-receive-hgram`                                                        | A TON jetton you get when you stake; a receipt for a share of the staking pool; it stays yours to hold, send or use, which is the point of receiving it.                                                                                                                                                                             | —                     | 60  |
| 2     | Is 1 hGRAM always equal to 1 GRAM? | `is-1-hgram-always-equal-to-1-gram.md` | merge-of itself, `how-is-the-value-of-hgram-determined`                                          | No; one exchange rate for everybody, set by the treasury; it starts near 1 and **becomes redeemable for more GRAM after each round that earns rewards** (B16); the live rate is in the app.                                                                                                                                          | `/stats/`             | 70  |
| 3     | Can I use hGRAM in DeFi?           | `can-i-use-hgram-in-defi.md`           | merge-of itself, `can-i-transfer-hgram`, `ton…/can-i-earn-rewards-and-use-defi-at-the-same-time` | Yes — it is an ordinary jetton, so it transfers to any wallet; the named venues (DeDust, STON.fi, TONCO, GroypFi, swap.coffee) and pools, current list on the DeFi page; **rewards keep accruing wherever it sits** (`shell/defi/faq/01`); each protocol adds smart-contract, liquidity and price-impact risk (`shell/defi/faq/02`). | `/defi/`              | 100 |
| 4     | Can I sell hGRAM?                  | `can-i-sell-hgram.md`                  | keep                                                                                             | Yes — swap on a listed DEX at the pool rate (check price impact) or unstake through Hipo at the protocol rate; the two are different prices. Wording from `shell/unstake/faq/02`.                                                                                                                                                    | `/defi/`, `/unstake/` | 60  |

#### 5. Unstaking (`unstaking`, 6)

| order | question                                                     | file                                                             | status                                                                                          | must state                                                                                                                                                                                                                                                                          | links       | max |
| ----- | ------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --- |
| 1     | How do I unstake my GRAM?                                    | `how-do-i-unstake-my-gram.md`                                    | keep                                                                                            | Open the Unstake page, pick the amount, choose Full or Instant, confirm; GRAM comes back to the same wallet.                                                                                                                                                                        | `/unstake/` | 60  |
| 2     | What is the difference between Full and Instant unstaking?   | `what-is-the-difference-between-full-and-instant-unstaking.md`   | merge-of itself, `does-hipo-support-instant-unstaking` — **file name protected (inbound link)** | Full settles after the current round, best rate, always goes through, the default; Instant pays now from Hipo's free GRAM at a slightly lower rate, no DEX or third party involved, succeeds only while that liquidity covers the amount; which to choose (`shell/unstake/faq/01`). | —           | 110 |
| 3     | How long does unstaking take?                                | `how-long-does-unstaking-take.md`                                | keep — **file name protected (inbound link)**; lead with the numbers                            | Instant: seconds, same chain of messages. Full: typically under 18 h, up to 36 h in the worst case. Then, and only then, the round/freeze derivation as it reads today.                                                                                                             | —           | 150 |
| 4     | Why is instant unstaking sometimes unavailable?              | `why-is-instant-unstaking-sometimes-unavailable.md`              | keep                                                                                            | Instant is paid from free GRAM only; most of the stake is committed to rounds and cannot be released early; the app shows the current instant maximum and warns above it; Full always works.                                                                                        | —           | 80  |
| 5     | Will I continue earning rewards while waiting for unstaking? | `will-i-continue-earning-rewards-while-waiting-for-unstaking.md` | keep                                                                                            | Full: yes, until the round it is committed to ends — that is why it returns more; Instant: no waiting period to earn through; once GRAM is back in the wallet it earns nothing.                                                                                                     | —           | 70  |
| 6     | Are there any unstaking fees?                                | `are-there-any-unstaking-fees.md`                                | keep                                                                                            | No protocol fee; a gas prepayment shown before confirming; its unused part comes back **with the final payout**, not at request time. **CS-7** magnitude if a magnitude is given.                                                                                                   | —           | 60  |

#### 6. Security & risks (`security`, 4)

| order | question                              | file                                      | status                                          | must state                                                                                                                                                                                                                                          | links                                            | max |
| ----- | ------------------------------------- | ----------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --- |
| 1     | Is Hipo safe?                         | `is-hipo-safe.md`                         | keep; rewrite to be concrete                    | Contracts are open-source and audited four times (**CS-2**, short form); every step is on-chain and verifiable; the validator's collateral, not the stake, absorbs a penalty; **and it is not risk-free** — forward-link "Can I lose my funds?".    | `#has-hipo-been-audited`, `#can-i-lose-my-funds` | 80  |
| 2     | Has Hipo been audited?                | `has-hipo-been-audited.md`                | keep; fix the space before the comma (B17)      | **CS-2** verbatim + the audits repo link.                                                                                                                                                                                                           | github.com/HipoFinance/audits                    | 60  |
| 3     | Can I lose my funds?                  | `can-i-lose-my-funds.md`                  | merge-of itself, `what-risks-should-i-consider` | **Opens with "Yes."** then the five `llms.txt` risks (smart-contract, TON network, validator underperformance, thin instant liquidity, APY variability) and, for DeFi use, the extra layer; Hipo does not guarantee returns; never "risk-free". B7. | `#can-i-use-hgram-in-defi`                       | 100 |
| 4     | Where can I verify Hipo transactions? | `where-can-i-verify-hipo-transactions.md` | keep; fix the space before the full stop (B17)  | Any TON explorer; the app links straight to the treasury contract; staking, unstaking and rewards are all public.                                                                                                                                   | tonviewer.com                                    | 60  |

#### 7. Validators & Staking Marketplace (`validators-and-staking-marketplace`, 3)

| order | question                                        | file                                                | status                                                                                                                                                                                                     | must state                                                                                                                                                                                                                                            | links                            | max |
| ----- | ----------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --- |
| 1     | How does Hipo select validators?                | `how-does-hipo-select-validators.md`                | merge-of itself, `can-any-validator-participate-in-hipo`, `how-does-the-validator-auction-work`, `what-makes-hipo-different-from-traditional-staking-protocols`, `general/how-does-hipo-choose-validators` | Nobody picks them: a permissionless on-chain marketplace; any validator meeting the contract's requirements can bid, no team approval; they compete on the reward rate they promise and must post collateral; stake goes to the best bids each round. | `/docs/introduction/validators/` | 110 |
| 2     | What happens if a validator underperforms?      | `what-happens-if-a-validator-underperforms.md`      | merge-of itself, `what-collateral-do-validators-provide`                                                                                                                                                   | Before borrowing, the validator locks GRAM covering the round's maximum slashing penalty **plus** the reward it promised; a penalty is taken from that collateral, not from staked GRAM — that is what protects stakers. B10.                         | —                                | 90  |
| 3     | Why can Hipo offer competitive staking rewards? | `why-can-hipo-offer-competitive-staking-rewards.md` | keep                                                                                                                                                                                                       | Because validators bid against each other for the stake and pay the rate they promised. **No comparison to other protocols and no superlative** — the live number is on the Stats page.                                                               | `/stats/`                        | 60  |

#### 8. HPO & Hipo Club (`hpo-token`, 3)

| order | question                              | file                                      | status                                                                                        | must state                                                                                                                                                                                                                                   | links                                                               | max |
| ----- | ------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --- |
| 1     | What is HPO?                          | `what-is-hpo.md`                          | merge-of itself, `why-was-hpo-created`                                                        | **CS-6**; a TON jetton, separate from hGRAM — staking does not require it; it aligns stakers, holders and validators with the protocol's growth.                                                                                             | `/hpo/`                                                             | 60  |
| 2     | What benefits do HPO holders receive? | `what-benefits-do-hpo-holders-receive.md` | merge-of itself, `does-hpo-generate-revenue-for-holders`, `how-is-protocol-revenue-generated` | Three things: a share of protocol revenue (**CS-4c** — computed each round, paid at the end of each Club season), votes on proposals, and a Club level that sets how much HPO the hGRAM earns. Revenue comes from Hipo's staking operations. | `/docs/profit-sharing/`, `/docs/dao/`                               | 80  |
| 3     | What is Hipo Club?                    | `what-is-hipo-club.md`                    | keep; add the mechanics                                                                       | **CS-4b** — hGRAM holders accrue HPO after every validation round at a rate set by their level, withdrawable once the balance passes 1,000 HPO; holding rewarded HPO raises the level, selling it resets to 1; joined through the bot.       | `t.me/HipoFinanceBot/join`, `/docs/giveaways-and-prizes/hipo-club/` | 80  |

#### 9. Support (`support`, 3)

| order | question                                      | file                                              | status                                         | must state                                                                                                                              | links                                                | max |
| ----- | --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --- |
| 1     | Where can I get support?                      | `where-can-i-get-support.md`                      | keep                                           | Unchanged (Hipo Chat, channel, X, never-ask-for-seed).                                                                                  | t.me/hipo_chat, t.me/HipoFinance, x.com/hipofinance  | 60  |
| 2     | What should I do if a transaction is pending? | `what-should-i-do-if-a-transaction-is-pending.md` | keep                                           | Wait for confirmation, check in the wallet or an explorer; a Full unstake is not "pending", it is waiting for the round — forward-link. | `#how-long-does-unstaking-take`                      | 50  |
| 3     | Where can I learn more about Hipo?            | `where-can-i-learn-more-about-hipo.md`            | keep; fix the space before the full stop (B17) | Docs, live stats, the contracts on GitHub.                                                                                              | `/docs/`, stats.hipo.finance, github.com/HipoFinance | 50  |

#### Files deleted outright (no successor answer)

| file                                                                                                 | reason                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ton-and-liquid-staking/is-liquid-staking-better-than-traditional-staking.md`                        | One-sided comparison with no trade-off named; the honest half is already in "What is liquid staking?".                                                          |
| `ton-and-liquid-staking/can-institutions-use-hipo.md`                                                | Answers nothing ("Yes. Both individual users and institutions can use Hipo."); the real answer for a treasury is the multisig flow, which has its own question. |
| `ton-and-liquid-staking/why-does-hipo-often-offer-higher-apy-than-other-staking-protocols-on-ton.md` | Superiority claim without live data on the page — `llms.txt` "Avoid"; the mechanism is kept in "Why can Hipo offer competitive staking rewards?".               |

The other 24 removed files are folded into a survivor and are listed as `merge-of` sources above.

#### Old → new anchor map

Every anchor that disappears, with the answer that now carries its content. None of them is linked from
anywhere in `src/` or `public/` (verified by `grep -rn "/faq/#"`), so **no inbound link is edited** — the map
exists for redirects, for the optional alias script (open question 5) and for anyone holding an external link.

| removed anchor                                                              | now at                                                                                  |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `#what-happens-behind-the-scenes`                                           | `#how-does-hipo-work`                                                                   |
| `#what-is-the-difference-between-staking-and-liquid-staking`                | `#what-is-liquid-staking`                                                               |
| `#what-is-a-liquid-staking-token-lst`                                       | `#what-is-liquid-staking`                                                               |
| `#is-liquid-staking-better-than-traditional-staking`                        | `#what-is-liquid-staking` (cut)                                                         |
| `#how-does-hipo-choose-validators`                                          | `#how-does-hipo-select-validators`                                                      |
| `#can-any-validator-participate-in-hipo`                                    | `#how-does-hipo-select-validators`                                                      |
| `#how-does-the-validator-auction-work`                                      | `#how-does-hipo-select-validators`                                                      |
| `#what-makes-hipo-different-from-traditional-staking-protocols`             | `#how-does-hipo-select-validators`                                                      |
| `#what-collateral-do-validators-provide`                                    | `#what-happens-if-a-validator-underperforms`                                            |
| `#why-does-hipo-often-offer-higher-apy-than-other-staking-protocols-on-ton` | `#why-can-hipo-offer-competitive-staking-rewards` (cut)                                 |
| `#can-i-stake-directly-from-my-wallet`                                      | `#how-do-i-stake-gram`                                                                  |
| `#can-i-stake-more-after-my-initial-deposit`                                | `#how-do-i-stake-gram`                                                                  |
| `#do-i-receive-rewards-immediately`                                         | `#when-do-my-rewards-start`                                                             |
| `#is-apy-fixed`                                                             | `#what-apy-does-hipo-offer`                                                             |
| `#what-affects-staking-apy`                                                 | `#what-apy-does-hipo-offer`                                                             |
| `#why-does-apy-change-over-time`                                            | `#what-apy-does-hipo-offer`                                                             |
| `#does-hgram-earn-rewards`                                                  | `#do-i-need-to-claim-rewards`                                                           |
| `#why-do-i-receive-hgram`                                                   | `#what-is-hgram`                                                                        |
| `#how-is-the-value-of-hgram-determined`                                     | `#is-1-hgram-always-equal-to-1-gram`                                                    |
| `#can-i-transfer-hgram`                                                     | `#can-i-use-hgram-in-defi`                                                              |
| `#can-i-earn-rewards-and-use-defi-at-the-same-time`                         | `#can-i-use-hgram-in-defi`                                                              |
| `#does-hipo-support-instant-unstaking`                                      | `#what-is-the-difference-between-full-and-instant-unstaking`                            |
| `#what-risks-should-i-consider`                                             | `#can-i-lose-my-funds`                                                                  |
| `#why-was-hpo-created`                                                      | `#what-is-hpo`                                                                          |
| `#does-hpo-generate-revenue-for-holders`                                    | `#what-benefits-do-hpo-holders-receive`                                                 |
| `#how-is-protocol-revenue-generated`                                        | `#what-benefits-do-hpo-holders-receive`                                                 |
| `#can-institutions-use-hipo`                                                | `#can-i-stake-with-a-multisig-or-cold-wallet` (cut)                                     |
| `#does-hipo-charge-a-staking-fee`                                           | `#what-does-it-cost-to-stake`                                                           |
| `#where-can-i-see-current-fees`                                             | `#what-does-it-cost-to-stake`                                                           |
| `#does-hipo-charge-a-management-fee`                                        | `#does-hipo-take-a-cut-of-my-rewards`                                                   |
| `#general` (section)                                                        | `#getting-started`                                                                      |
| `#ton-and-liquid-staking` (section)                                         | `#getting-started`                                                                      |
| `#fees` (section)                                                           | `#what-does-it-cost-to-stake` — the one edit outside `faq/`: `src/i18n/GLOSSARY.md:137` |

Anchors kept (37 of 40; the three new ones are `#what-does-it-cost-to-stake`, `#when-do-my-rewards-start`,
`#does-hipo-take-a-cut-of-my-rewards`).

### HPO FAQ

9 → 7 items in `src/content/prose/<locale>/hpo-faq/`. No anchors exist on this list, so file names change
freely; `order` is rendered as the item number, so it must run 1…7 and match the `NN` prefix.

**Duplicate resolution:** the page sections stay, the FAQ duplicates go. `hpo.json`'s `hpo.buy.*` ("How to buy
HPO", 4 steps) and `hpo.scarcity.*` ("HPO is built to get scarcer", 4 cards + details line) are **kept
untouched**; the FAQ items that restate them (`08-how-to-buy-hpo`, `03-is-the-hpo-supply-fixed-what-gets-burned`)
are dropped, and item 3 becomes the non-duplicating question the review proposes for exactly this case — where
to see the live burned total. `09` is cut. `05` is a signpost and is absorbed.

| order | question                                           | file                                               | status                                                                                                            | must state                                                                                                                                                                                                                                                                                                                                                                                                            | links                                                                             | max |
| ----- | -------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --- |
| 1     | What is HPO?                                       | `01-what-is-hpo.md`                                | keep + add the contract line                                                                                      | **CS-6**; profit share, votes, more HPO through Hipo Club (as today); **plus the jetton address `EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`, linked to `https://tonviewer.com/EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`, with "check the address before you swap — that is the only HPO".**                                                                                                            | tonviewer, `/docs/giveaways-and-prizes/hipo-club/`                                | 80  |
| 2     | What makes HPO valuable?                           | `02-what-makes-hpo-valuable.md`                    | keep, untouched                                                                                                   | Already reconciled with `hpo.utility.*` by the accuracy batch (profit sharing / governance / Club rewards / Club standing ↔ the four utility cards, 1:1). Do not re-edit.                                                                                                                                                                                                                                             | `/docs/giveaways-and-prizes/hipo-club/`                                           | —   |
| 3     | How many HPO exist, and how many have been burned? | `03-how-many-hpo-exist-and-how-many-are-burned.md` | rewrite-of `03-is-the-hpo-supply-fixed-what-gets-burned.md`                                                       | 1,000,000,000 minted once, nothing can mint more, so the supply only moves down; **the live burned total is the counter in the tokenomics chart on this page** — no hardcoded figure; distribution and vesting are in the tokenomics docs. **Says nothing about the seasonal burn split** — that stays in the scarcity section above, whose wording (B14) is still held pending open question 4 of the accuracy spec. | `#tokenomics`, `/docs/hipo-tokens/hipo-governance-token-hpo/tokenomics/`          | 70  |
| 4     | When did HPO launch?                               | `04-when-did-hpo-launch.md`                        | keep, untouched                                                                                                   | TGE 25 November 2024 via ILO, initial DEX price $0.02, market-set since.                                                                                                                                                                                                                                                                                                                                              | —                                                                                 | —   |
| 5     | How do I get HPO?                                  | `05-how-do-i-get-hpo.md`                           | merge-of `05-how-can-i-become-a-hpo-holder`, `07-how-can-i-become-eligible-for-hpo-airdrops`, `08-how-to-buy-hpo` | Three routes, in order: **buy** on a named venue (STON.fi, DeDust, TONCO, GroypFi, swap.coffee) — the rate comes from the pool, check price impact; **earn** by staking (forward-link item 6); **airdrops** — plans are announced in the official channels, and staking plus Club membership are what qualifies. No "instantly!", no wallet-setup walk-through (that is the page's own How-to-buy section).           | t.me/HipoFinance, x.com/hipofinance                                               | 90  |
| 6     | How do I earn HPO by staking, and when am I paid?  | `06-how-do-i-earn-hpo-and-get-paid.md`             | merge-of `06-how-do-i-earn-hpo-by-staking` + `docs/profit-sharing.md` facts                                       | **CS-4b** — hGRAM accrues HPO after every validation round, amount set by holdings × Club level, withdrawable past 1,000 HPO; levels rise by holding rewarded HPO and reset to 1 on selling; **CS-4c** — profit shares are computed each round and paid at the end of each Club season; both are tracked and claimed in the Club bot.                                                                                 | `t.me/HipoFinanceBot/join`, `/docs/profit-sharing/`                               | 100 |
| 7     | How do I vote on Hipo proposals?                   | `07-how-do-i-vote-on-hipo-proposals.md`            | **new**                                                                                                           | Holding HPO is the voting right; proposals and past decisions live on ton.vote; connect the wallet that holds the HPO and vote; the DAO sets the governance fee, profit-sharing parameters and treasury decisions.                                                                                                                                                                                                    | `https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv`, `/docs/dao/` | 70  |

Deleted file names (all four locales): `03-is-the-hpo-supply-fixed-what-gets-burned.md`,
`05-how-can-i-become-a-hpo-holder.md`, `06-how-do-i-earn-hpo-by-staking.md`,
`07-how-can-i-become-eligible-for-hpo-airdrops.md`, `08-how-to-buy-hpo.md`,
`09-how-do-you-manage-sell-pressure-after-airdrops.md`. Cut outright, with no successor: `08` (verbatim
duplicate of the page's How-to-buy section) and `09` (investor-relations copy beside a live price; brushes
`llms.txt` "Do not give investment advice").

**B4 / B14.** The accuracy spec holds both pending its open question 4 (is the 20 %/80 % split of unclaimed
season rewards standing policy?). B14 (`hpo.scarcity.seasonal.body`) is untouched here and stays held. B4
targeted a sentence in the old `03`; because the new `03` deliberately says nothing about the seasonal burn
split, **B4 becomes moot** and open question 4 now concerns B14 only. Nothing in this batch pre-empts the
answer.

### FAQPage JSON-LD

Built exactly like the dApp shell's, which already ships and validates. Shape, per page:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "…",
      "description": "…",
      "url": "https://hipo.finance/fa/faq/",
      "inLanguage": "fa",
      "isPartOf": { "@type": "WebSite", "name": "Hipo", "url": "https://hipo.finance/fa/" }
    },
    {
      "@type": "FAQPage",
      "inLanguage": "fa",
      "mainEntity": [{ "@type": "Question", "name": "…", "acceptedAnswer": { "@type": "Answer", "text": "…" } }]
    }
  ]
}
```

- **Where.** `src/components/pages/jsonLd.ts` (new) holds the shared `stripMarkdown()` (moved out of
  `shellJsonLd.ts`, which imports it — no behaviour change), a `webPageNode()` helper, and two thin builders
  `faqJsonLd({ title, description, locale })` and `hpoFaqJsonLd({ title, description, locale })`.
  `FaqRoute.astro` and `HpoRoute.astro` call theirs and pass the result as `jsonLd` to the layout;
  `LandingLayout.astro` and `HpoLayout.astro` gain `jsonLd?: Record<string, any>` with their current `WebSite`
  object as the default — the identical pattern `AppLayout.astro:16,29` already uses, so no other page changes.
- **Order.** The FAQ's `mainEntity` must be in visible order, so the section list moves out of `FAQ.astro` into
  `src/components/faqSections.ts` (`export const FAQ_SECTIONS = [{ id, key }, …]`) and both `FAQ.astro` and the
  builder import it: sort by `FAQ_SECTIONS.indexOf(section)` then `data.order`. HPO sorts by `data.order` alone.
- **Answer text.** `stripMarkdown(entry.body)` — tags, links, emphasis, code and backslash escapes out,
  whitespace collapsed. **It must gain one rule the shell never needed:** the site FAQ answers contain ordered
  and bulleted lists (the reward waterfall, Full-vs-Instant), so strip a leading `- `, `* `, `+ ` or `1. ` from
  each line _before_ collapsing whitespace, and drop leading `#` heading marks. Everything else stays as it is.
- **Length.** No truncation. Schema.org wants the complete answer and the longest one here
  (`how-long-does-unstaking-take`, ≈ 1,150 characters) is far inside any practical limit. If a future answer
  exceeds ~2,500 characters, shorten the answer, not the JSON-LD.
- **Per locale.** `inLanguage: langOf(locale)`, `url: localizedPath('/faq/'|'/hpo/', locale)`. Draft locales
  are already `noindex`ed by `SEO.astro`; emitting the block there anyway is harmless and keeps the code
  branch-free.
- **Escaping.** `SEO.astro` writes the object with `set:html={JSON.stringify(jsonLd)}`, which does not escape
  `<`. `stripMarkdown` removes every tag, so `</script>` cannot survive into the payload; the acceptance
  criteria assert it.
- **Unaffected.** Starlight owns `/docs/` head tags and gets nothing. The app shell's existing FAQPage blocks
  are unchanged apart from the import move.
- **`/hpo/`: yes.** Same component, same builder, seven Q&As already written as prose — the marginal cost is
  one route line plus one layout prop, and the HPO FAQ is precisely the kind of buyer-intent content rich
  results serve.

## Changes

**Catalogs** — `src/i18n/{en,fa,ru,hi}/faq.json`: remove `faq.section.general.heading|nav`,
`faq.section.tonLiquidStaking.heading|nav`, `faq.section.fees.heading|nav` (6 keys); add
`faq.section.gettingStarted.heading|nav`, `faq.section.rewards.heading|nav` (4 keys); change the values of
`faq.section.security.heading|nav` ("Security & risks") and `faq.section.hpoToken.heading` ("HPO & Hipo Club")
/ `.nav` ("HPO & Club"). English key count 22 → 20, identical in all four locales.

`src/i18n/{en,fa,ru,hi}/seo.json`: `seo.hpo.title` currently reads "HPO — Decision-Making & Profit-Sharing
Token | Hipo", which the accuracy batch's CS-6 retired everywhere else → "HPO — Governance & Profit-Sharing
Token | Hipo" plus its three twins. `hpo.json` is otherwise untouched.

**Components** — new `src/components/faqSections.ts` (the section array); `src/components/FAQ.astro` imports it
instead of declaring it (lines 12–22 collapse to the import + the same `.map`). New
`src/components/pages/jsonLd.ts`; `src/components/pages/shellJsonLd.ts` imports `stripMarkdown` from it;
`src/components/routes/FaqRoute.astro` and `HpoRoute.astro` build and pass `jsonLd`;
`src/layouts/LandingLayout.astro` and `src/layouts/HpoLayout.astro` accept the optional prop.

**Prose, per locale (× 4: en, fa, ru, hi)** —

| collection | before | after | keep | move (dir change, same name) | rename | merge-of                  | new | deleted files                                      |
| ---------- | ------ | ----- | ---- | ---------------------------- | ------ | ------------------------- | --- | -------------------------------------------------- |
| `faq/`     | 67     | 40    | 17   | 6                            | 2      | 15                        | 0   | 27 net (3 cut outright, 24 folded into a survivor) |
| `hpo-faq/` | 9      | 7     | 3    | 0                            | 0      | 2 (one of them a rewrite) | 1   | 6 old file names                                   |

Total prose per locale 105 → 76. New directories `faq/getting-started/` and `faq/rewards/`; removed directories
`faq/general/`, `faq/ton-and-liquid-staking/`, `faq/fees/`.

**Inbound links** — none. The three anchors used by `src/content/docs/{,fa/,ru/,hi/}tutorials/{staking,unstaking}.md`
are all file names that survive. The single edit outside the FAQ is `src/i18n/GLOSSARY.md:137`, where the
illustrative `/faq/#fees` becomes `/faq/#what-does-it-cost-to-stake`.

**Translations** — `git mv` the fa/ru/hi twins for every `keep`/`move` file (23 files × 3 locales, bodies
unchanged); draft new fa/ru/hi bodies for the 17 changed FAQ answers and 3 changed/new HPO answers
(≈ 60 drafted items) from the new English plus `src/i18n/GLOSSARY.md`; then
`node scripts/check-i18n.mjs --update-hashes fa`, `… ru`, `… hi`. `meta.json` is generated — never hand-edited.
Nothing is currently `reviewed: true`, so no review state is lost.

**`public/llms.txt`** — untouched except one addition: the `### HPO` section gains the jetton address line
`HPO jetton (TON): EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`, because this batch puts that address on a
public page for the first time and `llms.txt` must carry the protocol-level facts the site states. No other
fact changes: every consolidated answer restates facts already published after the accuracy batch.

**Untouched on purpose** — `src/content/docs/**` (all four locales), `src/content/prose/*/shell/**`,
`src/components/Hpo.astro`'s section markup, `hpo.json`, `Landing.astro`, the app shell's JSON-LD output.

## Acceptance criteria

- [ ] _(deferred to the locale sync; English: 40 / 7 / 76 ✓)_ File counts are equal across locales and match the target:
      `for l in en fa ru hi; do find src/content/prose/$l/faq -type f | wc -l; done` → `40` four times;
      the same for `hpo-faq` → `7`; and `find src/content/prose/$l -type f | wc -l` → `76`.
- [x] Every English `faq/**.md` has frontmatter `section` equal to its parent directory name, and each section's
      `order` values are exactly `1…N` with no gaps or repeats; the same for `hpo-faq` `order` `1…7` matching
      the `NN` file-name prefix.
- [x] File-name (= anchor) uniqueness across sections: no two `faq/**.md` share a base name.
- [ ] _(deferred to the locale sync; today fa/ru/hi are `draft` and the gate exits 0 with warnings)_ `node scripts/check-i18n.mjs` exits 0 and reports for each of fa/ru/hi: `missing 0`, `stale 0`, `extra 0`
      (`unreviewed > 0` is expected).
- [x] `node --experimental-strip-types scripts/i18n-selftest.mjs` passes; `npm run build` completes.
- [x] `npx prettier --check` passes on every touched file.
- [x] Anchors: `grep -rho '/faq/#[a-z0-9-]*' src public | sort -u` yields only anchors that exist in the built
      page — check each against `grep -o 'id="[a-z0-9-]*"' dist/faq/index.html`. Expected survivors:
      `#what-apy-does-hipo-offer`, `#what-is-the-difference-between-full-and-instant-unstaking`,
      `#how-long-does-unstaking-take`, `#what-does-it-cost-to-stake` (from GLOSSARY).
- [x] Every removed anchor in the old→new map returns nothing from `grep -rn "<anchor>" src public`.
- [x] Section ids: the nine `<section id>` values in `dist/faq/index.html` equal `FAQ_SECTIONS` in order, and
      every side-nav `href="#…"` resolves to one of them.
- [x] JSON-LD on `/faq/`: extract the `application/ld+json` script from `dist/faq/index.html`, `JSON.parse` it
      in node, and assert `@graph[1]['@type'] === 'FAQPage'`, `mainEntity.length === 40`, every `name` matches
      a rendered `<summary>` (on `/hpo/`: matches the `<summary>` text with its `N. ` prefix stripped), every `acceptedAnswer.text` is non-empty and contains no `<`, `](`, `**`, or a
      leading `- `/`1. `, and the whole document contains no `</script>` inside the block.
- [ ] _(deferred to the locale sync)_ The same for `dist/fa/faq/index.html` (and ru, hi) with `inLanguage === 'fa'` (`'ru'`, `'hi'`) and
      `url` = `https://hipo.finance/fa/faq/`.
- [x] JSON-LD on `/hpo/`: `mainEntity.length === 7`, same assertions, `dist/hpo/index.html` and the three
      locale twins. The app shell's five pages still emit their existing FAQPage blocks unchanged
      (`diff` the extracted JSON against a pre-change build).
- [x] A reviewer reads every new or changed English answer against `public/llms.txt` "LLM answer rules" and
      "Avoid": no superlative without live data on the same page, no hardcoded APY / TVL / price / gas figure,
      no unconditional-withdrawal claim, no investment advice, no "risk-free"; "Can I lose my funds?" opens
      with "Yes"; GRAM/TON/hGRAM/HPO/STON.fi spelling per CS-5.
- [ ] `npm run preview` and a click through `/faq/` (open every section, follow every internal link), `/hpo/`,
      and the three doc deep links `/docs/tutorials/staking/#…`, `/docs/tutorials/unstaking/` → their `/faq/#…`
      targets land on the right answer; plus the `/fa/` RTL rendering of `/fa/faq/`.
- [ ] **Post-deploy only:** Google Rich Results Test on `https://hipo.finance/faq/` and `https://hipo.finance/hpo/`
      reports a valid FAQPage with the expected item count (cannot be run locally — the tool fetches the live
      URL). Re-run `node scripts/check-i18n.mjs --top-urls <locale>` and resubmit `/faq/` in Search Console.

### Deferred

Batch 2 (docs sidebar restructure, the new Fees / Risks / Contracts & Audits / Glossary / Getting-started-hub /
"Staking Without the App" pages, the docs merges and deletions) and batch 3 (the formatting sweep: alt text,
heading hierarchy, stray `<br>`, `\ <sub>` run-ons, escaped-asterisk bold, headings used as CTAs, `.rar` →
`.zip`) each get their own spec and are not designed here. Also out of scope: the FAQ side-nav scroll-spy
(`FAQ.astro:57` hardcodes the first section as active), the `seo.faq.description` superlatives, and the
still-held B14 / accuracy-spec open question 4. `seo.faq.description` superlatives now also appear as the FAQ
page's JSON-LD WebPage.description — still deferred to the SEO copy decision (flagged).

## Risks & rollback

- **Lost anchors.** 30 question anchors and 3 section anchors disappear. Nothing in the repo links to them, but
  Google's FAQ rich-result jump links and any external deep link will land at the top of `/faq/` instead of the
  answer (an unknown fragment is silently ignored). Mitigated by the old→new map and, if open question 5 is
  taken, by the alias script. The three anchors that are actually linked survive by construction.
- **SEO surface.** 67 indexed question strings become 40; long-tail queries that matched a cut title lose their
  exact-match heading. Mitigation: each merged answer keeps the folded question's wording inside its body, and
  the new FAQPage markup is a net gain in eligibility.
- **Translation cost and drift.** ~60 answers × 3 locales are re-drafted and land `reviewed: false`. fa/ru/hi
  are `indexed`, not `public`, so they are crawler-visible but carry no language UI; a nuance error is a
  warning-level risk cleaned up in the next native review. The 23 unchanged answers are moved, not
  re-translated, which keeps the diff honest.
- **Gate churn.** Every rename/move changes a `meta.json` key, so a forgotten `--update-hashes` shows up as
  dozens of `untracked` warnings, and a forgotten twin move fails the build — which is the desired behaviour
  and is caught by `npm run build` before push.
- **Invalid JSON-LD.** Malformed markup is ignored by Google, not penalised; there is no ranking risk. The one
  real hazard is a `</script>` sequence escaping the inline block, which `stripMarkdown` prevents and the
  acceptance criteria assert.
- **Rollback.** Content plus five small code edits, no route, schema or config change. `git revert` of the
  branch restores the previous FAQ wholesale; the only external coupling is the three doc anchors, which never
  moved.

## Decisions (2026-08-23)

All eight open questions at their defaults: Fees dissolved; "TON & Liquid Staking" retired; 40 questions;
`/hpo/` keeps the "scarcer" section and drops the FAQ duplicate; anchor alias script added; no JSON-LD length
cap; FAQPage on `/hpo/` too; `seo.hpo.title` fixed here. Plus: English only for this and the next two batches,
locale sync at the end (Approach §5).

Review follow-ups applied (2026-08-23): (1) gas wording distinguishes the attached 0.1 GRAM prepayment from
the ~hundredth-of-a-GRAM actually spent (CS-7 updated in the accuracy spec); (2) "Is Hipo non-custodial?"
names Full / Instant unstaking instead of "leave whenever you choose"; (3) `llms.txt` lists the HPO jetton
address; (4) Club-level wording everywhere: holding keeps the level, selling resets to Level 1, levels rise
through Club activity (instant or seasonal upgrade); (5) `hpo.scarcity.seasonal.body` says no claim window /
no leftover pool to burn; (6) "Can I lose my funds?" trimmed to ≤ 120 words; (7) `faq-anchors.ts` also
reveals the target on same-hash clicks (re-clicking the current anchor re-opens a collapsed `<details>`).

## Open questions

Each has a recommended default — answer "defaults" to take all of them.

1. **Dissolve the "Fees" section?** _Default: yes_ (per the review). The three fee answers move to where the
   cost is felt: gas → `staking/what-does-it-cost-to-stake`, the governance fee → `rewards/does-hipo-take-a-cut-of-my-rewards`,
   unstaking gas stays in Unstaking. Cost: the `#fees` section anchor dies (used only as an example in
   `GLOSSARY.md`). _Alternative:_ keep a 2-question Fees section, 10 sections and 41 questions.
2. **Retire "TON & Liquid Staking" as a section name?** _Default: yes_ — its four surviving answers are the
   most beginner-level on the page and belong at the top, in "Getting started" (which also replaces the vague
   "General"). _Alternative:_ keep it as a trailing glossary-ish section.
3. **40 questions, or trim to the review's 38?** _Default: 40._ The two candidates for a further cut are
   "Why should I use Hipo?" (folds into "What is Hipo?") and "What should I do if a transaction is pending?"
   (folds into "Where can I get support?"). Both are real search queries with distinct intent, so they stay.
4. **Does the HPO page keep its "HPO is built to get scarcer" section?** _Default: yes — keep the section, drop
   the FAQ item that repeats it_, and make FAQ item 3 the "where do I see the live burned total" question
   instead. The section is four scannable cards with icons above the fold-ish; the accordion copy was a
   near-verbatim second telling. Consequence: accuracy-spec item B4 is moot, B14 stays held.
5. **Alias script for the 30 dead anchors?** _Default: yes_ — ~15 lines in `FAQ.astro`: a map of removed → kept
   anchors, applied on `DOMContentLoaded` and `hashchange`; it also fixes a pre-existing bug where landing on a
   question anchor scrolls to a **collapsed** `<details>` (the three doc deep links hit this today), by setting
   `open = true` on the target. _Alternative:_ ship without it and accept that old fragments land at the top of
   the page.
6. **Answer-length cap in the JSON-LD?** _Default: no cap_ — emit the full answer text; the longest is ~1,150
   characters. _Alternative:_ truncate at 1,000 characters on a sentence boundary, which risks shipping a
   different answer to crawlers than to readers.
7. **FAQPage on `/hpo/` too?** _Default: yes_ — the builder, the layout prop and the route line are shared with
   `/faq/`, so it is three extra lines for a page whose seven answers are buyer-intent questions.
8. **`seo.hpo.title` "Decision-Making & Profit-Sharing".** Contradicts CS-6, which the accuracy batch applied
   everywhere else. _Default: fix it here_ (one key × four catalogs) since this batch already rewrites HPO copy.
   _Alternative:_ leave the whole `seo.json` superlative/wording sweep — including `seo.faq.description`'s
   "most profitable" and "highest staking rewards" on a page that shows no live data — to a separate pass.
