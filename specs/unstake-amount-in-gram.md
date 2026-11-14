# Unstake amount in GRAM

**Status:** implemented (approved by Behrang 2026-11-14; amended after the spec audit)

## Goal

On `/unstake/` (desktop and the Telegram Mini App) the person types how much **GRAM** they want back,
as on `/stake/`, instead of how much hGRAM to burn. The app works out the hGRAM to send. Max still
unstakes the whole hGRAM balance, to the last nano-unit.

## In plain terms

Today the unstake box asks for hGRAM. Since 1 hGRAM is worth more than 1 GRAM, someone who wants
"500 GRAM back" has to guess an hGRAM number, look at "You will receive", and try again. We flip
it: they type 500 GRAM, and the app turns that into hGRAM at the current exchange rate, shows
"You will unstake: 4xx.xx hGRAM" under the box, and puts that hGRAM number into the transaction.

What goes on chain does not change: the transaction still names an hGRAM amount, exactly as today.
Only how we arrive at that number changes.

The risky part is Max. If Max wrote "balance × rate" into the GRAM box and the app later converted
that back to hGRAM, the rounding, or the rate moving a little before the person presses Unstake,
would make the hGRAM number land a hair above or below the real balance. Above, the hGRAM wallet
refuses the whole unstake ("not enough hGRAM"); below, a crumb of hGRAM stays behind. So Max
remembers the exact hGRAM balance at the moment it was pressed, and that exact number is sent. The
GRAM figure shown in the box is then only a display. Changing the number in the box, switching tabs,
or switching wallets forgets the remembered balance and goes back to converting what is in the box.

A typed amount is rounded down to whole nano-hGRAM, so the person gets at most a couple of
billionths of a GRAM less than they typed; it can never ask for more hGRAM than the typed amount is worth.
With the Full option they get a little more than typed, because Full is paid at the end of the round
at a higher rate. Instant pays at today's rate, the one we convert with.

If it went wrong, the worst realistic cases are: the wallet refuses an unstake (the 0.1 GRAM fee
comes back minus gas, nothing is burned), or someone unstakes slightly more or less than they meant.
The person's hGRAM can never be sent anywhere new: the destination and the message shape do not change.

No decisions needed: both open questions were settled (see the end).

## Definitions

**Concepts**

- **Field amount**: what the person typed in the box, now GRAM on both tabs. In code: `amount` /
  `amountInNano`.
- **Unstake tokens**: the hGRAM amount, in nano-hGRAM, that goes into the unstake message. New
  getter `unstakeTokensInNano`.
- **Max snapshot**: the exact hGRAM balance remembered when Max was pressed on the unstake tab. New
  field `amountMaxTokens`; `undefined` when the field holds a typed amount.
- **Instant liquidity**: `maxBurnableTokens`, the treasury's `get_max_burnable_tokens`, in nano-hGRAM.

**Formula parameters**

| Symbol | Meaning | Unit | Rounding / range |
| --- | --- | --- | --- |
| g | field amount | nano-GRAM | integer ≥ 0, from `toNano` |
| C | `treasuryState.totalCoins` | nano-GRAM | > 0 required; else no conversion |
| T | `treasuryState.totalTokens` | nano-hGRAM | > 0 |
| t | unstake tokens | nano-hGRAM | `t = floor(g · T / C)` in bigint; or the Max snapshot when set |
| b | hGRAM balance, `walletState.tokens` | nano-hGRAM | ≥ 0 |
| m | Max display value | nano-GRAM | `m = floor(b · T⁻¹ · C) = floor(b · C / T)` |

Why floor: the treasury pays `floor(t · C / T)` (`contract/contracts/treasury.fc:479`, `:641`), so
`t = floor(g·T/C)` gives a payout ≤ g and at least `g − ceil(C/T)` (2 nano-GRAM at today's rate), and
`t` never exceeds `b` when `g ≤ m`. Typing `m` back by hand gives `b − 1`, not `b`, which is why Max
needs the snapshot (checked by the spec audit over b = 1…200,000 at the live rate).

## Context

- The field is GRAM on stake and hGRAM on unstake; `amountInNano` is the field in its own unit
  (`src/components/app/Model.ts:1452`), and `send` passes it straight to `createUnstakeMessage`
  (`Model.ts:2958`). The multisig snapshot freezes the same value (`Model.ts:2467`).
- `maxAmount` on unstake is the raw hGRAM balance (`Model.ts:1435`); `setAmountToMax` writes
  `fromNano(maxAmount)` into the field (`Model.ts:2420`); `isAmountValid` checks `nano ≤ maxAmount`
  (`Model.ts:1473`).
- "You will receive" converts the field at `C/T` with floating point (`Model.ts:1542`, `:1568`).
- Instant-liquidity check compares the field with `maxBurnableTokens` (`Model.ts:1267`); the hint
  shows it as "Max Instant: X hGRAM" (`Model.ts:1259`, `app.model.maxInstant`).
- The swap link appends the field as `?amount=` for an hGRAM→GRAM swap (`Model.ts:1531`).
- The hGRAM wallet throws `insufficient_funds` unless `0 < amount ≤ tokens`
  (`contract/contracts/wallet.fc:180`): too much, or zero, bounces and burns nothing.
- Views: `StakeUnstake.tsx` (hGRAM icon line 115, receive row line 266), `tma/TmaStakeUnstake.tsx`
  (balance line 18, icons lines 73 and 110, receive card lines 106–115), static mirror
  `shell/ShellStakeForm.astro:66`.
- Copy that says "enter the amount of hGRAM": `src/content/prose/en/shell/unstake/cards/01-how-unstaking-works.md`,
  `src/content/docs/introduction/how-does-hipo-work/unstaking.md`.

## Approach

Model (`Model.ts`), unstake tab only; the stake tab is untouched:

1. `unstakeTokensInNano`: the Max snapshot if set; else `g·T/C` in bigint when `g` and a treasury
   state with `C > 0` exist; else `undefined`.
2. `sendAmountInNano`: stake → `amountInNano`; unstake → `unstakeTokensInNano`. `send`, the analytics
   `amountGram` (stays hGRAM, as today) and `captureMultisigSnapshot` use it. `send`'s guard checks
   `sendAmountInNano != null && > 0` in place of `amountInNano != null`.
3. `isAmountValid` on unstake (connected): `t ≤ b` instead of `g ≤ maxAmount`; an unknown `t` is not
   coloured invalid, and item 4 keeps it from being sent.
4. `isAmountPositive` on unstake: `g > 0` and `t` known and `t > 0`. So the button stays disabled while
   `t` cannot be computed (no treasury state yet), and dust that floors to 0 hGRAM never bounces. This
   also keeps `captureMultisigSnapshot` from freezing an unknown amount, which would leave the multisig
   person only the unstake-everything comment.
5. `maxAmount` on unstake becomes `m` (GRAM). `setAmountToMax` on unstake sets the field to
   `fromNano(m)` and `amountMaxTokens = b`; with no treasury state or `b = 0` it writes 0 and no
   snapshot (today's behaviour with no balance).
6. `setAmount` clears the snapshot only when the newly parsed `amount` differs from the current one
   (an input event with an unchanged value, or `relocalizeAmount` re-reading the same number, keeps it).
   `clearAmount` and `setAddress` (any wallet change or disconnect) clear it. `normalizeAmount` does
   not touch it.
7. `unstakeMoreThanInstantBurnable` compares `t` with `maxBurnableTokens`; the hint shows that limit in
   GRAM, `floor(maxBurnable · C / T)` in bigint.
7a. Every GRAM maximum shown to be typed back (the instant limit, the Mini App's `≈ m GRAM` balance) is
   truncated to 2 decimals in bigint before formatting, never rounded up, so typing the shown figure
   never trips "Not enough hGRAM" or the liquidity alert.
8. Unstake "receive" line becomes the hGRAM to unstake: exact `t`, formatted like other balances.
9. `swapUrl` passes `fromNano(t)` (hGRAM) when known, else no amount.

Views: GRAM icon in the unstake box (desktop, Mini App, shell mirror). Desktop row "You will unstake"
→ `t hGRAM`. Mini App: the box label becomes "You receive", the second card "You unstake" with the
hGRAM icon and `t` (both keys exist: `app.tma.youReceive`, `app.tma.youUnstake`); the balance hint shows
the hGRAM balance in GRAM (`≈ m GRAM`).

Rejected:

- **Max follows the live balance** (send whatever `b` is at press time of Unstake): an hGRAM arrival
  between Max and Unstake would send more than the person saw. The snapshot sends what they saw;
  if the balance drops below it, the existing "Not enough hGRAM" alert fires, as today.
- **Max writes `m` and converts back**: off by a nano-unit either way; above `b` the wallet bounces.
- **Ceil instead of floor**: the payout would be ≥ typed, but a typed `m` could convert to `b + 1`
  and be refused. The difference is at most ceil(C/T) nano-GRAM (2 today).
- **A GRAM/hGRAM toggle on the box**: more UI and two modes to test; not asked for.

## Changes

- `src/components/app/Model.ts` — items 1–9 above.
- `src/components/app/StakeUnstake.tsx` — icon; unstake row label and value.
- `src/components/app/tma/TmaStakeUnstake.tsx` — icon, labels, second card, balance hint.
- `src/components/app/shell/ShellStakeForm.astro` — unstake icon and row label, mirroring first paint.
- `src/i18n/en/app.json` — new `app.stake.youWillUnstake` ("You will unstake"); `app.model.maxInstant`
  to "Max Instant: {amount} GRAM" (new key `app.model.maxInstantGram`, old one removed, so no locale
  keeps the hGRAM text by accident).
- The two English copy files above: "enter the amount of GRAM you want back".
- Then, after English is approved (the `locales` skill): the same keys and copy in the ten other locales.
- `CHANGELOG.md` — one entry.

## Acceptance criteria

Checked in a browser against mainnet reads with a connected wallet that holds hGRAM (the CDP recipe
in memory), plus a small node script on the Model's conversion with fixed `C`, `T`, `b`:

- [x] Unstake box shows the GRAM icon; typing `g` shows "You will unstake" = `floor(g·T/C)` hGRAM.
- [x] The unstake message built on send carries exactly `floor(g·T/C)` nano-hGRAM (checked in the
      multisig payload, which uses the same getter, decoded from base64).
- [x] Max fills the box with `floor(b·C/T)` GRAM, and the message carries exactly `b`, not a round trip.
- [x] After Max, typing one digit or deleting one clears the snapshot (message carries the converted value).
- [x] After Max, the next poll changing the rate leaves the sent amount at `b`. (Checked with a block re-read; the rate did not actually move during the run. The snapshot has no rate input, by code and by both audits.)
- [x] The first typed `g` whose `t` exceeds `b` turns the box red and Unstake shows "Not enough hGRAM"; `g = m` typed by hand is valid. (Amended: `m + 1` nano-GRAM still converts to exactly `b`, since a nano-hGRAM is worth more than a nano-GRAM, so it is valid and accepted by the wallet.)
- [x] `g` = 1 nano-GRAM (`0.000000001`) keeps the button disabled (floors to 0 hGRAM).
- [x] Instant: hint reads "Max Instant: X GRAM"; `t` above `maxBurnableTokens` shows the liquidity alert.
- [x] Stake tab: same field, same message amount as before for the same input (no change).
- [x] Mini App (forced with `?tma=1` at 400px, not inside real Telegram): labels swapped, both icons right, numbers as above.
- [x] Shell mirror and the island's first paint match on `/unstake/` (no icon swap on hydration).
- [x] `npm run build` passes (includes the i18n gate) and `scripts/i18n-selftest.mjs` passes.

## Risks & rollback

- Wrong conversion direction (`C/T` vs `T/C`) would ask for ~1.3× too much or too little hGRAM: too
  much bounces on most wallets, too little under-unstakes. Caught by the criteria with fixed numbers.
- A stale snapshot after a balance drop: shows the existing "Not enough hGRAM" alert, sends nothing.
- Analytics `amount_gram` on unstake stays hGRAM, as today, so the funnel is not broken mid-series.
- Rollback: revert the commit and push; the site redeploys from `main`. No on-chain or server state.

## Open questions

None. Settled 2026-11-14 by Behrang, on the recommendations: the desktop row reads "You will unstake:
t hGRAM", and "Max Instant" is shown in GRAM.

## Money audit

Diff audited a second time (team:money-auditor, 2026-11-14, told to make it lose money): safe, no blocking finding. Code review, two lenses: no confirmed failing case on amounts; one confirmed miss on the site side (the unstake FAQ answer still said hGRAM, all locales), fixed.


Spec audited once (team:money-auditor, 2026-11-14): safe, no blocking finding. Its five notes are folded
in above (rounding bound, wallet switch, unchanged-value input, truncated maxima, unknown `t`). The
built diff gets a second audit.
