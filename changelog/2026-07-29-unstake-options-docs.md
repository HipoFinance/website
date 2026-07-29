# 2026-07-29 — Full and Instant unstake options

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. The
maintainer reported that unstaking is now a choice between two options in the
app — Full and Instant — and asked for the FAQ and anywhere else affected to be
updated. Nothing on the site described either option; the whole site still
framed unstaking as one path that was sometimes fast by luck.

| Commit    | Summary                                       |
| --------- | --------------------------------------------- |
| `1b70ef1` | Document the Full and Instant unstake options |

This report and the `CHANGELOG.md` entry land in a follow-up commit. The work
is on the `unstake-options-docs` branch, not `main`.

---

### What the options are

- **Full** — settled after the current validation round ends. The staked GRAM
  keeps earning until then, so it yields the better exchange rate and the
  maximum rewards on the hGRAM being redeemed. It always goes through. It is
  the default.
- **Instant** — processed immediately at a slightly lower exchange rate.
  It succeeds only while the protocol holds enough free GRAM to cover the
  request.

### Naming

The docs use **Full** and **Instant**, matching the app's own labels in
`StakeUnstake.tsx` ("Wait until round ends / Maximum rewards" and "If liquidity
is available / Reduced rewards"). The internal identifier for Full is `'best'`
(`type UnstakeOption = 'best' | 'instant'` in `Model.ts`), which does not appear
in any user-facing text and deliberately does not appear in the docs either. A
reader comparing the site against the screen should see the same two words.

### Why this was more than an addition

The previous wording was not merely incomplete, it pointed users in the wrong
direction:

- The FAQ asked "Does Hipo support instant unstaking?" and answered "Yes, when
  enough liquidity is available", which reads as an occasional stroke of luck
  rather than a button. It is a first-class option the user selects.
- `tutorials/unstaking.md` said "If you need your GRAM instantly, you can swap
  your hGRAM through decentralized exchanges", presenting a DEX as _the_ route
  to immediate GRAM. The protocol now does this itself, at a protocol rate
  rather than a pool rate, with no third party.
- `how-does-hipo-work/unstaking.md` step 3 read "Choose Cooldown Period or
  Instant Swap" — the actual choice at that point in the flow is Full or
  Instant, and "Instant Swap" sent the reader off-protocol.

So the DEX route was demoted rather than removed. It remains genuinely useful
when Instant cannot cover the amount, and it is now framed that way, with the
caveat that the rate comes from the pool rather than the protocol.

### Where the 18-hour cycle went

The previous session had added an explanation of the recovery cycle — a window
opens roughly every 18 hours, a typical wait is ~9 hours, the worst case is 36.
All of that describes the **Full** option specifically, and it now sits there
rather than under a generic "standard unstaking". The 36-hour figure is
unchanged, so `tutorials/unstaking.md`, `llms.txt` and
`specs/gitbook-docs-migration.md:142` remain in agreement, and both anchors
other pages deep-link to — `#how-long-does-unstaking-take` and the new
`#what-is-the-difference-between-full-and-instant-unstaking` — resolve.

### The rate difference

The site attributes Full's better rate to the stake continuing to earn until the
round ends. That follows from the timing and matches the app's "Maximum
rewards" versus "Reduced rewards", but whether Instant also takes an explicit
discount or fee on top of that was not verified against the contract. If it
does, the current wording understates it. Flagged to the maintainer rather than
guessed at; noted as a follow-up below.

### A terminology collision

`how-does-hipo-work/unstaking.md` documents a treasury `w` command under the
heading "Treasury 'w' Command (Full Unstake)", where "Full" meant _the entire
balance_. With Full now naming an option, that heading reads as though the
command selects it. Retitled to "Unstake Entire Balance".

Which option the `w` command actually uses is not documented anywhere in this
repo and was not guessed at — it plausibly takes the `'best'` default, but that
is worth confirming and stating on the page.

### llms.txt

Updated in five places, not just the unstaking section: the "do not say"
list entry about waiting time, the liquidity-risk bullet, the "Can users
unstake anytime?" answer, and the guidance rule "Do not claim instant native
withdrawals in all cases" — which is now qualified rather than flat, since
instant native withdrawal is exactly what Instant is, conditional on liquidity.
`Last reviewed` moved to 2026-07-29.

### Considered and not done

- **Naming the internal `'best'` identifier** anywhere user-facing. See above.
- **Quantifying the rate difference.** "Slightly lower" is what the maintainer
  described and what the app implies; a number would go stale every round and
  the exact mechanism is unconfirmed.
- **Quantifying Instant's liquidity ceiling.** It moves constantly and the app
  already shows the live figure, so the docs point at the app instead.
- **Touching `Landing.astro`.** Its unstaking copy ("Return your hGRAM whenever
  you want") is generic enough to stay correct under both options.

---

### Verification performed

- Read `StakeUnstake.tsx` and `Model.ts` for the option labels and behaviour
  rather than relying on the description alone: the UI strings, the
  `UnstakeOption` type, `maxBurnableTokens` as the Instant ceiling surfaced as
  "Max Instant", the `instant-unstake-max` amount alert, and
  `createUnstakeMessage(..., unstakeOption, ...)` confirming the choice is
  encoded in the message.
- Confirmed `'best'` is the initial value of `model.unstakeOption`, which is
  the basis for calling Full the default.
- Searched every file mentioning unstaking rather than editing only the FAQ:
  four needed changes, `Landing.astro` did not.
- Confirmed no duplicate `id` attributes across all 66 questions after the
  edits, and that both deep-linked anchors resolve.
- `npx prettier --write` on the three source files; `llms.txt` has no prettier
  parser.
- `npm run build` — 44 pages, Pagefind index rebuilt, no errors.

### Follow-ups

- **Confirm whether Instant takes a discount beyond forgoing the round's
  rewards**, and sharpen the wording if so.
- **Confirm which option the treasury `w` command uses** and state it on
  `how-does-hipo-work/unstaking.md`.
- Carried over: the `~20% APY` and `up to 43.7% total APY` figures in
  `introduction/hipo-rewards.md` overstate live data.
- Carried over and still open: **the `docs.hipo.finance` Cloudflare cutover**
  has not been executed; the runbook is in `specs/gitbook-docs-migration.md`.
- Carried over: the `engines` field for the `HipoFinance/mcp` repo, the
  `abs-0.twimg.com` emoji hotlink in `tokenomics.md`, and the five pre-rule
  verbose `CHANGELOG.md` entries.
