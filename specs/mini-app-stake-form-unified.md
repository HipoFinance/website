# Mini App: one stake form with the website

**Status:** implemented 2026-11-15 (approved the same day by Behrang, with the recommended answer to the open question: tiles left out); not yet committed or checked on a phone.

## Goal

The Telegram Mini App's Stake tab uses the website's stake form, so Mini App users get what the website already
shows, above all the time left on a pending unstake ("Unstaking in …"), which users asked for. The button stays
pinned to the bottom of the screen, as it is in the Mini App today.

## In plain terms

Hipo has two stake forms today. The website has one. The Telegram Mini App has its own, built on 2026-08-11 from
a design mockup that looked like a wallet's swap screen: a "You stake" card, a "You receive" card and a big
button at the bottom. Both send the same transactions; only what they show differs.

The Mini App form was never given the website's balances panel. That panel opens once a wallet is connected. It
shows the GRAM and hGRAM balances, each stake still waiting for its round ("Staking starts in 2 days"), and an
unstake still waiting for its round ("Unstaking in 13 hours"). The Mini App user has no screen that shows a
pending unstake at all. The Mini App form also lacks the transaction cost, the "Swap on exchange" link, and the
links to the docs, FAQ, audits and the treasury on the explorer.

The change: the Mini App shows the website's form, with four adjustments for Telegram.

- No page title or subtitle above the form, because the Mini App's header already says "Stake GRAM" or
  "Unstake GRAM".
- The Stake / Unstake button sits in a bar pinned to the bottom of the screen, just above the tab row, so it
  never scrolls out of reach. On the website it stays inside the form card.
- The DeFi link the Mini App has today is dropped (Behrang, after the build): the Mini App has no way to DeFi
  after this change.
- The three statistics tiles the website shows under the form are left out (see Open questions).

What users lose: the swap-screen look, the big "You receive" card (it becomes the "You will receive" line of the
website form), and the balance shown inside the amount card (the balances panel shows it instead).

No text changes and nothing new needs translating: the website form's text already exists in all 11 languages.
Five Mini App texts that no screen uses after the change are deleted.

The risk is small. A layout mistake on a narrow phone, or the pinned bar covering the last line of the form, is
the likely fault; both are checked at phone width before release. The send path is the website's own, already
in use. Undoing it is a revert of one commit.

One decision is open: whether the statistics tiles come along. See Open questions.

## Definitions

**Concepts**

- **Mini App mode**: the site running inside Telegram's webview, or in a browser with `?tma=1`. `model.isTelegram`
  is true, and `App.tsx` renders `TmaApp` instead of the website chrome.
- **Web form**: `StakeUnstake.tsx`, the stake form on `/stake/` and `/unstake/` outside Telegram.
- **Mini App form**: `tma/TmaStakeUnstake.tsx`, deleted by this change.
- **Balances panel**: the strip that slides out above the web form's card once a wallet is connected (GRAM
  balance, stakes in progress, hGRAM balance, unstake in progress).
- **Pinned bar**: in Mini App mode, the bar holding the submit button, stuck to the bottom of the Mini App's
  scrolling area, above the tab row.
- **Statistics tiles**: `Stats.tsx`, the three tiles (APY, GRAM staked, hGRAM holders) that `App.tsx` renders
  under the web form. Not the Stats page.

## Context

- `src/components/app/App.tsx:87` renders `TmaApp` in Mini App mode; the web stake page is `StakeUnstake`,
  `AmountAlert`, `MultisigGuidance` and `Stats` (`App.tsx:56-63`).
- `src/components/app/tma/TmaApp.tsx:115-119` renders `TmaStakeUnstake` for the stake page; the overlays
  `AmountAlert` and `MultisigGuidance` are rendered there too (`TmaApp.tsx:147-148`). Its comment (`:22-23`)
  says only the stake form has a phone-specific layout; Rewards, Stats and DeFi reuse the web components.
- The Mini App form (`tma/TmaStakeUnstake.tsx`, 256 lines) pins its button with `min-h-full` on the root and
  `mt-auto` on the button block (`:12-14`, `:26`, `:215`). That holds only while the form fits the screen; a taller
  form pushes the button down.
- The web form (`StakeUnstake.tsx`) has the balances panel (`:56-103`), the transaction cost row with its
  tooltip (`:277-288`), the swap link (`:252-262`), the questions line (`:290-305`) and the links row
  (`:307-326`). The Mini App form has none of these.
- The balances panel reads `stakingInProgressDetails` and `unstakingInProgressDetails` (`Model.ts:1447`,
  `:1505`). An unstake shows "Unstaking in {remain}" when the oldest round is Staked or later, and plain
  "Unstaking" otherwise.
- The two submit handlers are the same, line for line (`StakeUnstake.tsx:226-250`,
  `TmaStakeUnstake.tsx:216-240`).
- In Mini App mode `TmaApp`'s capture handler (`TmaApp.tsx:75-92`) opens every link to another site, or to a
  page without the app (docs, FAQ), in Telegram's browser. The web form's swap, docs, FAQ, audits and explorer
  links are covered without change.
- The static shell (`src/components/app/shell/`) is hidden in Mini App mode (`data-tma-hide`,
  `src/styles/app.css:40`), so it is not touched.
- The Mini App header (`tma/TmaHeader.tsx`) shows the page title and the APY · fee line; it stays as is.
- The Mini App form's own texts: `app.tma.youStake`, `app.tma.youReceive`, `app.tma.youUnstake`,
  `app.tma.balance`, `app.tma.questions`. No other component uses them.

## Approach

`TmaApp` renders `StakeUnstake` for the stake page, and `StakeUnstake` reads `model.isTelegram` for the four
Mini App adjustments:

1. The `h1` and subtitle block is not rendered.
2. The submit button leaves the card and goes into a bar that is the last child of the form's root:
   `sticky bottom-0`, the page background, a top border, and the same padding as today's Mini App bar. The root
   gets `min-h-full flex flex-col` and the bar `mt-auto`, so on a short form the bar rests at the bottom and on
   a long one it sticks there while the form scrolls under it. The questions line ("Questions? Ask on
   Telegram") goes into the bar under the button, as in today's Mini App form. One button element, placed by
   the flag, so there is still one submit handler.
3. No DeFi link. The draft kept the Mini App form's DeFi link after the summary rows; Behrang had it removed
   after the build, so the Mini App no longer links to DeFi.
4. The outer padding becomes `px-4`, like the other Mini App screens; the card keeps its own padding.

`TmaApp` keeps rendering `AmountAlert` and `MultisigGuidance`; it does not render `Stats`.

Rejected: adding only the balances panel to the Mini App form. It is a smaller change, but it keeps two forms
that have already drifted apart once, and every later change to the form would again be made twice.

## Changes

- `src/components/app/StakeUnstake.tsx`: the four `model.isTelegram` adjustments above.
- `src/components/app/tma/TmaApp.tsx`: render `StakeUnstake` in place of `TmaStakeUnstake`; update the comment
  at `:22-23` and the overlay comment.
- `src/components/app/tma/TmaStakeUnstake.tsx`: deleted.
- `src/i18n/*/app.json` and `src/i18n/*/meta.json`, all locales: remove the five `app.tma.*` keys listed in
  Context.
- `CHANGELOG.md`: one entry.

## Acceptance criteria

- [x] In the `?tma=1` preview at 390×760, the Stake tab shows the web form without its title and subtitle: the
      Stake / Unstake toggle, the card with the amount field and Max, the summary rows (You will receive,
      exchange rate, yearly rewards, transaction cost), the questions line, and the links row; no DeFi link.
- [x] The Unstake tab adds the Full / Instant options, their hint line and the "Swap on exchange" link.
- [x] The submit button is visible at the bottom of the scrolling area, just above the tab row, at the top of
      the page and after scrolling to the end, on both tabs, at 390×760 and at 360×640. The last line of the
      form is not hidden behind the bar when scrolled to the end.
- [x] No horizontal scroll at 360px wide, in English and in Persian (RTL).
- [x] With a connected wallet that has a pending unstake, the balances panel shows "Unstaking in …" with the
      amount in the Mini App. Checked in a browser by giving the Model a wallet state with `unstaking > 0`
      (CDP request fulfilment or a temporary stub, removed before commit), and on a real phone in Telegram if a
      wallet with a pending unstake is at hand.
- [x] Outside Telegram, `/stake/` and `/unstake/` look as before: title and subtitle shown, button inside the
      card, no DeFi link in the form, statistics tiles below. Compared against screenshots taken before the
      change at 390px and 1280px.
- [x] In the preview, tapping the button with no wallet starts the connect flow, as today; the docs, FAQ,
      audits, explorer and swap links each make one open-outside request and do not change the page.
- [x] `grep -r TmaStakeUnstake src` and `grep -rE "app\.tma\.(youStake|youReceive|youUnstake|balance|questions)" src`
      return nothing.
- [x] `npm run build` passes (this runs the `check-i18n` gate) with no new warning, and
      `node --experimental-strip-types scripts/i18n-selftest.mjs` passes.

Checked 2026-11-15 in a headless browser against two builds (before and after), `?tma=1` for the Mini App. The
pending-unstake criterion was checked with a wallet state injected into the Model from the console (no code stub),
which showed "Unstaking in 13h 20m · 120 hGRAM"; not yet on a real phone in Telegram, and the keyboard case is
left to that phone check. The web pages at 390 and 1280px differ from the before build only in the loading spinner.

## Risks & rollback

- The pinned bar may cover the last line, or sit badly once the phone keyboard opens. The scrolling area's
  height does not shrink with the keyboard (`--tg-viewport-stable-height`, `app.css:58-65`), so the bar
  behaves as today's button does. Checked at two sizes in the preview; the keyboard case only on a phone.
- A `model.isTelegram` branch that leaks to the website. Caught by the before/after screenshots.
- Tier-2 detection can revoke Mini App mode after the first paint (`tma/telegram.ts`). `App.tsx` then swaps
  `TmaApp` for the web chrome, so React remounts the form without the adjustments. The typed amount is kept,
  because it lives in the Model (`amountRaw`); focus on the field is lost, as it was with the old Mini App form.
- Rollback: revert the commit. Nothing is stored, and the send path is the one the website already uses.

## Open questions

- **Do the three statistics tiles (APY, GRAM staked, hGRAM holders) come into the Mini App's Stake tab?**
  Leaving them out keeps the form shorter, so less scrolls under the pinned bar; the Mini App header already
  shows the APY, and the Stats tab is one tap away. Bringing them in makes the two screens fully alike, at the
  cost of a longer page. Recommendation: leave them out.
