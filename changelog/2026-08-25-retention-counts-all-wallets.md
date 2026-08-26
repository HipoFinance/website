# 2026-08-25 (fourth session) — Retention now counts every wallet, so the docs stop asking users to order them

The page written earlier today told holders to connect their HPO-holding wallet
**last** in the Hipo Club app, because the airdrop-retention check read only
`current_wallet` and connecting anything after it pointed the check at the wrong
place. `HipoGang/app` now sums HPO across every wallet a user has connected, so
that instruction is obsolete — and it was the most error-prone part of the page,
a procedure the reader had to get right rather than a fact they had to know.

## Commits

| Commit | Description                                             |
| ------ | ------------------------------------------------------- |
| (this) | Drop the connect-last procedure now that retention sums |

Backend: `HipoGang/app` `e1902c0` (sum across wallets) and `5d270b4` (credit
from the scan rather than the stored total).

## What changed on the page

The "after you receive an airdrop" section used to list three ways to lose a
level, one of which was connecting a wallet. It now lists two — selling, and
sending HPO somewhere you have not connected — and states plainly that the
amount is counted across all of a user's Club wallets, in any order, with moves
between them free.

The five-step procedure collapsed to three, losing the step that existed only to
manage connect order. Recovery gained a second option that did not exist before:
connect the wallet that already holds the HPO, instead of moving HPO to the
wallet the check happened to be looking at.

## The one thing that got harder to explain

Registering a wallet on the website and connecting it in the club are no longer
interchangeable, and the page has to say so. `WalletRewards` adds an address to
the reward set without setting `user_id`; only the club's connect flow does
that. Rewards therefore accrue to a website-registered wallet, but its HPO is
credited to nobody and counts toward no one's retention.

So the note that used to reassure ("switching wallets on the website is always
safe") now also warns: connect the wallet holding your rewarded HPO in the Club
app too, or its balance will not count. That is a real trap — smaller than the
one it replaces, and it fails toward a level reset rather than silently, but it
is new surface the earlier version did not have.

## Translations

All nine locales rewritten from the same heading down, not patched line by line,
since the section's argument changed rather than its wording. `--update-hashes`
reset the docs entry to unreviewed in each locale; the sidebar labels were
untouched and kept their review state.

---

### Verification performed

- `npm run build` — 512 pages, `i18n: ok, 9 warning(s)` (the standing
  not-reviewed-by-a-native-speaker warnings).
- `npx prettier --write` across all ten pages.
- Grepped all ten for the old connect-last instruction. The three hits that
  remain are the new sentence in `ar`, `pt-br` and `ru` saying the order does
  **not** matter — checked by eye, not just by count.

### Follow-ups

- ~~**Publish only after the backend is deployed.**~~ Confirmed deployed
  2026-08-26 — the page and production agree.
- ~~The nine translations remain LLM-drafted and unreviewed.~~ Settled
  2026-08-26: no native review will happen, by decision; readers are the
  correction channel.
- ~~The Hipo Club page still says only that "selling rewarded HPO at any time
  resets your level to Level 1".~~ Done 2026-08-26 — see
  [2026-08-26-club-page-cross-link](2026-08-26-club-page-cross-link.md).
