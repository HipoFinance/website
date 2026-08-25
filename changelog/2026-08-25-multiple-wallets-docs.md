# 2026-08-25 (third session) — Documenting how rewards follow wallets

A large HPO holder asked support whether connecting several wallets to
hipo.finance and Hipo Club would cost them rewards. The answer is mostly "no,
connect as many as you like" — but there is one sharp edge that nobody had
written down, and it is exactly the edge a big holder is most exposed to. This
session traced the behaviour through the `HipoGang/app` backend and turned it
into a docs page, in all ten locales.

## Commits

| Commit | Description                                           |
| ------ | ----------------------------------------------------- |
| (this) | Add the multiple-wallets docs page in all ten locales |

The related backend fix landed separately in `HipoGang/app` as `84a354c`.

## What the behaviour actually is

Four findings, from the backend rather than from any existing documentation:

- **Wallets are never un-tracked.** A wallet joins the reward set either by
  being connected in the club or simply by the website's rewards page querying
  it — `WalletRewards` adds the address itself, with a comment saying that is
  deliberate. Nothing ever removes it, so connecting a second wallet cannot stop
  the first from earning.
- **Both HPO streams are linear in balance.** Splitting a holding across wallets
  pays exactly what concentrating it pays. There is no dilution to warn about.
- **Club level lives on the Telegram account, not the wallet**, so every wallet
  a user connects earns at the same coefficient, up to the six-wallet limit.
- **The airdrop-retention check reads only `current_wallet`** — the single most
  recently connected wallet — and `connectWallet` overwrites that field on every
  connect. For a user who has claimed an airdrop, connecting another wallet in
  the club app therefore points the check at a wallet that probably does not
  hold the retained HPO, which starts the penalty: club level is forced to 0,
  the coefficient drops to 1×, and the required balance grows 1% a day until it
  is restored.

The last one is the whole reason for the page. For a level-10 holder the penalty
is a 90% cut across every wallet they own, and the trigger — connecting a wallet
— does not look dangerous. Worth stressing that the website cannot cause it: the
site never calls the club's connect API, so switching wallets on hipo.finance
leaves `current_wallet` alone.

## The page

`/docs/wallets-and-rewards/`, "Using Multiple Wallets", in Tokens & Governance
next to Hipo Club. It is written for holders, not for engineers: how a wallet
starts earning, the rules for several wallets, what the airdrop rule really
checks, a five-step procedure for adding a wallet safely, recovery if the level
has already dropped, and a quick-reference table.

The existing Hipo Club page says only that "selling rewarded HPO at any time
resets your level to Level 1". That is true but incomplete — moving the HPO, or
merely connecting a different wallet, is indistinguishable from selling as far
as the check is concerned. The new page says so plainly rather than amending the
Club page, so the Club page keeps describing the rule and this one describes the
mechanics.

## Translations

English plus the nine locales, so `check-i18n` stays green — a new docs page is
a hard error in every indexed locale until it is translated, so English-only was
not shippable. Numbers follow each locale's rules (Persian and Arabic-Indic
digits, Indian grouping in `hi`), Latin tokens stay isolated, and the sidebar
label was added to all ten `docs-sidebar.json` files. `--update-hashes` recorded
the new entries as unreviewed, like the rest of the translated corpus.

---

### Verification performed

- `npm run build` — 512 pages (up from 502), `i18n: ok, 9 warning(s)`; the
  warnings are the pre-existing "not yet reviewed by a native speaker" ones that
  every locale already carries.
- `npx prettier --check` on the ten pages, the ten sidebar catalogs and
  `astro.config.mjs`.
- All ten `/docs/wallets-and-rewards/` routes confirmed in the build output.
- Backend claims re-read against `HipoGang/app` at `9010b3a`: `connectwallet.go`,
  `currentwallet.go`, `jobs.go` (`updateWalletBalances`, `updateHpoRewards`,
  `upgradeClubLevel`) and `status.go`.

### Follow-ups

- **The nine translations are LLM-drafted and unreviewed**, like the rest of the
  corpus. This page carries money-affecting instructions, so it is a better
  candidate for native review than most.
- **The retention check arguably wants fixing, not just documenting.** Summing
  HPO across a user's connected wallets, instead of reading `current_wallet`
  alone, would remove the trap entirely and make this page half as necessary.
  Not attempted here: it changes who is penalised, which is a product decision.
- The Hipo Club page's "selling … resets your level" line still stands alone; it
  could link here.
- Nothing checked against the reporter's live account — the club's Redis is not
  reachable from a dev machine.
