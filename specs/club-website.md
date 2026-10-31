# The website Club: `/club/` in the dApp, claims and upgrades through TON Connect

**Status:** approved 2026-10-27 (Alireza) (spec 3 of the Hipo Club redesign; BUILD-PLAN rev. 6 §4, §9; SPEC v7)

## Goal

At launch time L (Sat 2026-10-31 09:00 UTC) the Club moves to hipo.finance: a `/club/` section in the
dApp replaces Rewards, members log in with Telegram, link one Club wallet, and claim, upgrade and
withdraw revenue share from the site. The bot's Mini App opens the same pages in Telegram mode. Before
L the site is unchanged.

## In plain terms

Today the website's Rewards page only shows numbers; claiming is a link to the Telegram Mini App
(club.hipo.finance), which is a separate app. The new Club, as mili designed it, lives on the website
and the Mini App becomes the website opened inside Telegram.

What a member sees after L:

- **Club in the menu** where Rewards was, with four tabs: Overview, Rewards, Friends and Community.
  Old `/rewards/` links forward to `/club/`.
- **Without Telegram** a member with a connected wallet sees their level, boost, holdings and
  leaderboard place (state A). To claim, upgrade, change wallet, invite friends or get alerts they
  link Telegram: one tap on "Log in with Telegram", then the wallet signs a free "sign in" message.
  Inside Telegram the login is automatic.
- **Overview** shows one of seven states (A–G): wallet only, ready to claim, qualified for next
  season, 24-hour grace, suspended, restored, reset to Level 1. Each state has one sentence and one
  action at the top.
- **Claim** sends 1 GRAM from the member's Club wallet to hipo.ton; the server then pays the whole
  boosted HPO balance to that wallet. **Upgrade** sends the level's fee in GRAM to hipo.ton. The site
  builds both transactions; the member signs them in their wallet app. **Revenue-share withdrawal** is
  a request to the server, which pays the wallet; nothing is signed.
- **One wallet per account.** When the connected wallet is not the account's Club wallet, the Club
  says so, offers to switch (with a confirm screen that warns about the Level minimum and the grace
  period) or to reconnect the old wallet, and pauses Claim and Upgrade until the member chooses.
- **Community** says "coming soon" with a short note, until Limzo delivers its data.

How it is built: the pages are in the code days before L but switched off by one setting, so the
live site shows today's Rewards page until the launch commit turns it on at L. Everything the Club
shows comes from the Club server over its WebSocket (login and wallet linking as spec 2 defines them;
the read data from spec 2b, still being drafted). For the first ~15 minutes after L the server is
still migrating accounts; the page says "The new Club opens in a few minutes" and checks again.

The main risk is money sent for nothing. The server keeps GRAM that arrives with the wrong amount,
from the wrong wallet, for the wrong level or twice (rule D1): up to 1,100 GRAM for an upgrade. So
the site sends a payment only when every check passes (logged in, right wallet, right level, exact
fee), re-reads the account right before asking the wallet, and refuses to send while an earlier
payment may still be on its way. That last check looks at the wallet's own recent transactions on
the chain, so it also works from a second phone or after a reload. The first money audit of this
draft found the earlier, time-based lock unsafe; this version replaces it. The transaction building
is audited twice more on the code before it ships.

English first, on Wed Oct 28; the other ten languages on Thu–Fri, after approval. Decisions needed:
see Open questions (mainly the Mini App's tab row, revenue share on past wallets, and how the
Telegram login is tested before L).

## Definitions

**Concepts**

- **L** — launch time, Sat 2026-10-31 09:00 UTC: the server's `--season-end`. Season 5 ends, Season 6
  and the new rules start. (BUILD-PLAN rev. 6 still says "no set date"; the date is fixed since.)
- **Account** — the member's Telegram account on the server (`user:{U}`); it owns the level, the
  Level minimum, the unclaimed HPO and the timers (spec 1).
- **Club wallet** — the one wallet of an account that earns its boost and is paid its claims.
  **Naming trap:** it is the _member's_ wallet. The wallet that _receives_ claim fees and upgrade
  payments is **hipo.ton**, `UQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt6UI` (raw
  `0:92967851207602025b751684159411f3c6669038c8fd11fbbcd03c288204a5b7`).
- **Connected wallet** — the wallet TON Connect is connected to in the browser, shared by every dApp
  page.
- **Mismatch** — a session exists, the account has a Club wallet, and the connected wallet is another
  one.
- **Session** — the server's login record (spec 2 §3); the page holds its token. **Fresh** = the
  Telegram login is at most 1 hour old; needed to link, switch or release.
- **Flows 1, 2, 3** — board 09: (1) switch from the Club, (2) Telegram already linked to another
  wallet, (3) wallet changed on another page (BUILD-PLAN §9).
- **Release** — the Club wallet stops being one; the account has none until it links one (spec 2).
- **Revert** — a switch back to the wallet the last switch replaced, within 24 h (spec 2 §6).
- **D1** — a payment no rule honours: hipo.ton keeps the GRAM and nothing changes (spec 1).
- **Held** — the server keeps a fee or payment and acts on it later (during the migration, a switch,
  the 24-hour wait after a link); not lost.
- **Launching** — after L, before the launch migration is done: Club messages answer `not_open`.
- **States A–G** — SPEC §4: A wallet only, B eligible to claim, C qualified for next season, D below
  minimum (24 h grace), E suspended (restore window open), F restored, G reset to Level 1.
- **Club flag** — the build constant that decides whether `/club/` exists (§1 of Approach).
- **Spec 1 / 2 / 2b / 4** — club-server `specs/club-rules-and-money.md`,
  `specs/club-auth-and-wallet-linking.md`, `specs/club-read-api-alerts-xp-off.md` (drafting), and the
  launch run-book.
- **Mock** — a stand-in for the Club server inside the page, for local preview only.
- **Pending lock** — a record the page writes _before_ asking the wallet to sign a claim or an
  upgrade, keyed by account, target (n, or `claim`) and validUntil; it blocks a second send (§6–§7).
- **Payment on its way** — a message from the Club wallet to hipo.ton with the same op (and level),
  found in the wallet's recent transactions on the chain, that the server has not applied yet.
- **Server time** — the server's clock as the page estimates it: an offset taken from the `now` of a
  Club reply (2b: every reply has it); never the device clock alone. The chain checks of §6 use
  the read's own block time instead.
- **Chip** — 2b's summary of the state for the level card: `active`, `at_risk`, `suspended`,
  `restored` (restored in the last 7 days), `reset` (reset in the last 7 days, minimum still 0).
- **L6–L10, U3, K1, A1** — mili's questions, BUILD-PLAN §3. Terms of the protocol (hGRAM, HPO, GRAM):
  `src/i18n/GLOSSARY.md`.

**Formula parameters**

| Symbol | Meaning                                                     | Unit                      | Rounding / range                                                                                                                                                                                             |
| ------ | ----------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C      | claim fee                                                   | nanoGRAM                  | exactly 1,000,000,000 (a constant)                                                                                                                                                                           |
| n      | target level of an upgrade                                  | level, 1-based            | 2..10; n = `club_level` + 2 (`club_level` is 0-based on the wire)                                                                                                                                            |
| f_n    | upgrade fee to level n, from `clublevels`                   | GRAM (JSON number)        | must be a whole number, 0 < f_n ≤ 10,000; else no send                                                                                                                                                       |
| A_n    | amount sent for an upgrade                                  | nanoGRAM (decimal string) | A_n = f_n × 10^9 in BigInt; no float multiply                                                                                                                                                                |
| q      | query id in both payloads                                   | uint64                    | 0                                                                                                                                                                                                            |
| B      | claimable boosted HPO of the account (2b `unclaimed`)       | nanoHPO                   | parsed from the server's decimal string as BigInt: at most 9 decimals, no exponent, no sign, else treated as unknown (no Claim); never rounded; Claim offered only when B ≥ 100 × 10^9 and 2b's gate is `ok` |
| v      | validUntil of a transaction                                 | unix seconds              | floor(server time) + 300; the wallet contract checks it against chain time                                                                                                                                   |
| T      | the time the page may decide a pending payment did not land | unix seconds, server time | v + 60                                                                                                                                                                                                       |
| M, H   | Level minimum, holdings                                     | HPO (string)              | display only                                                                                                                                                                                                 |
| r      | holding ratio H ÷ M                                         | %                         | display; floor to whole %; "—" when M = 0                                                                                                                                                                    |
| s      | shortfall max(0, M − H)                                     | HPO                       | display; round **up** to 2 decimals so it never understates                                                                                                                                                  |
| R      | revenue-share balance of the Club wallet                    | GRAM                      | withdraw offered when R ≥ 10; the member receives HPO bought with R − 0.5                                                                                                                                    |
| g      | gas margin checked before a send                            | nanoGRAM                  | 50,000,000 (0.05 GRAM); display check only                                                                                                                                                                   |

## Context

References are website `857beba`, club-server working tree on `2eac323` (spec 1 and 2 code,
uncommitted), club-web `c4b6436`.

- **dApp island.** One MobX `Model` (`src/components/app/Model.ts`); pages are a route table
  (`Model.ts:315-321`) with `ActivePage = 'stake' | 'reward' | 'stats' | 'defi'` (`:31`). `/rewards/`
  is `src/pages/rewards/index.astro` → `ShellRoute` with a header-only shell
  (`src/components/app/shell/AppShell.astro:15`). Heavy stacks are dynamic imports (`.claude/rules/app.md`).
- **Rewards page today.** Reads `GET https://api.hipogang.io/wallet-rewards?address=`
  (`Model.ts:2488`) when the page is open (`:1175-1178`); shows the Season card (`Reward.tsx`,
  `Model.ts:2049-2114`) and a Claim that links to the bot (`Reward.tsx:100-120`). It reads the
  _wallet's_ `hton_sum_rewards` (`Model.ts:2510`); after L the account holds that balance (spec 1 §2),
  so this field is no longer what a member can claim.
- **Sends.** `guardedSendTransaction` (`Model.ts:2817-2823`) bounds a request by `txValidUntil` = 300 s
  (`:248`); TON Connect UI 5 (`package.json`), manifest `https://hipo.finance/tonconnect-manifest.json`
  (`Model.ts:3263`), so a ton_proof made on the site is for the domain `hipo.finance`.
- **Telegram mode.** `tma/telegram.ts:44-80` detects the Mini App (URL fragment, `?tma=1`); `TmaApp`
  renders `TmaTabs` (`Stake · Rewards · Stats · DeFi`, `TmaTabs.tsx:13-18`).
- **Nav to Rewards** in seven places: `SiteHeader.astro:28`, `app/Header.tsx:17` and `:32`,
  `shell/ShellHeader.astro:32` and `:41`, `AppLayout.astro:80` (footer), `TmaTabs.tsx:14`; the
  title in `TmaHeader.tsx:17`; the `/app/` stub maps `page=reward` → `/rewards/`
  (`src/pages/app/index.astro:42`). Sitemap: `APP_SECTIONS` (`astro.config.mjs:17`), lastmod
  `ROUTES.rewards` (`src/data/lastmod.mjs:57`).
- **i18n gate.** A released locale missing any key, prose file or doc fails `prebuild`
  (`scripts/check-i18n.mjs:15,326`); a changed English value only warns (stale).
- **club-web, today's flows** (`src/Model.ts`): claim = one message to hipo.ton, `'1000000000'`, body
  `0xfee1`(32) + 0(64) (`:3884-3893`); upgrade = fee × 1e9 by float `Math.floor`, body `0xb0`(32) + 0(64)
  - level(8) with level = `club_level` + 2 (`:3842-3861`); revenue share = WebSocket
    `hpowithdrawrewards {raw_address, value}` (`:2113-2121`); invite link
    `https://t.me/HipoFinanceBot/join?startapp=` (`:404`); socket `wss://api.hipogang.io/ws` (`:1208`).
- **Server checks a claim fee** as: internal message to hipo.ton, exactly 1 GRAM
  (`jobs.go:100`), body exactly op `0xfee1` + a 64-bit query id, no other bits
  (`jobs.go:2476-2493`); otherwise ignored. Under rules 6 the payer must be the account's Club wallet at
  the fee's chain time, the balance ≥ 100 HPO, and the payout goes to the payer (spec 1 §5).
- **Server checks an upgrade payment** as: body exactly `0xb0` + 64-bit query id + 8-bit level 2..10
  (`jobs.go:1632-1690`); amount equal to a fee of `FeesAcceptedAt(level, tx.Now)` (`jobs.go:1902-1911`,
  `game/clublevels.go`); level = current + 1 (`jobs.go` upgrade judge); payer = the Club wallet at
  chain time after L. Anything else is D1. Fees after L: 20, 40, 60, 100, 160, 260, 420, 680, 1,100
  GRAM for levels 2..10 (`clublevels.go:66`). The `clublevels` message answers the fees in force now,
  plus `next` and `fees_change_at` before L (`redis/clublevels.go`); `next` is never for a payment.
- **Revenue share.** `hpowithdrawrewards {raw_address, value}` (`redis/withdrawrewards.go`): value
  `-1` = all; minimum 10 GRAM (`:61`), fee 0.5 GRAM; allowed for the Club wallet, a past Club wallet
  with no new account, or by `user_id` (`mayWithdrawRevenueShare`); pays the wallet itself. A handler
  error closes the socket.
- **Spec 2 on the wire.** A socket opened without initData may send only `clubauth` first
  (`websocket/handler.go:238,366-370`); the new handshake is accepted only from the Origins
  `https://hipo.finance` and `https://club.hipo.finance` (`:263-268`). `clubauth {widget | init_data
| token}` → `{ok, reason, token, expires_at, account}` (`redis/clubsession.go:380-393`). Reasons:
  `not_open, bad_origin, bad_auth, auth_used, rate_limited, bad_session, reauth, busy, frozen,
bad_request, bad_challenge, bad_proof, not_a_wallet, custodian, retry, balance_unavailable,
same_wallet, wallet_taken, switch_limit, no_club_wallet, changed, expired, wallet_changed_hands`
  (`clubsession.go:57-79`). `clubstatus` and the prepare reply fields: `redis/clublink.go:272-287,
362-385`. Protocol version: the server accepts `v` 41 or 42 (`redis/service.go:194`).
- **Spec 2b (draft, club-server `specs/club-read-api-alerts-xp-off.md`).** Read messages
  `cluboverview`, `clubrewards`, `clubfriends {filter, offset, limit}`, `clubleaderboard
{club_level, by}`, and the write `clubsettings {hide_name?, alerts?}`; each refuses with a reply
  (`not_open` plus `launching` after L, spec 2's session reasons, `rate_limited` over 60 reads a
  minute), never by closing the socket. `cluboverview` carries the claim gate (`claim: {ok}` or
  `{reason, opens_at}`, reasons `launching, no_wallet, in_progress, frozen, switch_pending,
link_wait, revert_hold, below_min`), `unclaimed` = `ClubClaimable` (the figure the sweep takes),
  `claims_open_at`, `claim_in_progress`, `recent_claims`, `upgrade_fee` = `FeeAt(next, now)`, the
  chip, the holdings split, estimates, rank with `buy: {x, rank}`, settings and the friends teaser.
  State A is a `club` object on `/wallet-rewards`: `{club_wallet, club_level, boost, status, band}`,
  no rank (2b Open question 2); the page does not show the `band` (decision 2-A, `api.ts`
  `WalletClub`). `clubrewards` and `cluboverview` carry `unclaimed_by_stream` `{staking, referral,
  community}` (adding up to `unclaimed`), and `clubrewards` the last 10 rules-6 rounds of referral
  (`referral_rounds`) and `referral_before_launch` (2b §8, P6). Not provided at launch: per-round
  community rows (no community writer exists until Limzo), and base GRAM history over wallet + pools
  (`/wallet-rewards` keeps today's per-round `stake_reward`).

## Approach

### 1. Where it lives, and the flag

- **Section:** the dApp island (Model + React), not a landing page. Routes `/club/` (Overview),
  `/club/rewards/`, `/club/friends/`, `/club/community/`, each with its `[locale]` twin. The
  Leaderboard is a section of Overview with a level switcher (SPEC §4 item 6, §5), not a tab.
- **Flag:** `src/data/club-flag.mjs` exports `CLUB_LIVE` (false until the launch commit) and
  `clubBuilt()` = `CLUB_LIVE || env PUBLIC_CLUB === '1'` (local preview). The Club pages are rest routes
  `src/pages/club/[...tab].astro` and `src/pages/[locale]/club/[...tab].astro` whose `getStaticPaths`
  returns nothing when `clubBuilt()` is false, so no `/club/` URL exists in a production build before
  L. Every nav item, the `/rewards/` redirect, the sitemap group and the `/app/` mapping read the same
  flag, so the launch commit flips one constant (plus docs, §12).
- **Code splitting:** the Club UI and its socket client are one lazy chunk (`club/`), fetched only on
  a Club page; Model gains the route, `activePage: 'club'`, `clubTab`, and a `club` sub-store created
  on first use. The eager island grows by at most 3 KB gzipped.
- **Shell:** header-only mirror, like `/rewards/` today (Club active in the nav), plus SEO copy in
  `seo.json` and an explainer card `shell/club` in the prose collection.

### 2. Where the data comes from

| Data                                                                                                                                               | Source                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login, session, Club wallet, level, boost, minimum, state, frozen, switch limits                                                                   | spec 2 over `wss://api.hipogang.io/ws`: `clubauth`, `clubstatus`, `clublogout`                                                                     |
| Wallet linking, switch, release                                                                                                                    | spec 2: `clubproofchallenge`, `clublinkprepare/confirm`, `clubreleaseprepare/confirm`, `clubcancel`                                                |
| Upgrade fees and coefficients                                                                                                                      | the existing `clublevels` message, read when the upgrade modal opens and again just before the send; cross-checked with `cluboverview.upgrade_fee` |
| Overview: state, chip, minimum, holdings and split, B, claim gate, claims in progress, season, estimates, rank and nudge, settings, friends teaser | 2b `cluboverview`, polled at most every 30 s                                                                                                       |
| Rewards: split by stream, last 10 rounds each of staking and referral, referral before launch, past claims, lifetime totals per stream             | 2b `clubrewards`                                                                                                                                   |
| Friends: invite link, count, referral total, rows and filters                                                                                      | 2b `clubfriends`                                                                                                                                   |
| Leaderboard per level, by HPO or growth; own row                                                                                                   | 2b `clubleaderboard`                                                                                                                               |
| Hide my name, alerts on/off                                                                                                                        | 2b `clubsettings`                                                                                                                                  |
| State A (no session): Club wallet or not, level, boost, status (band sent, not shown)                                                              | 2b's `club` object on `/wallet-rewards`                                                                                                            |
| Base GRAM rewards history, revenue-share balance                                                                                                   | `/wallet-rewards` as today (`earned_rewards`, `hpo_sum_rewards` of the Club wallet)                                                                |
| Payments on their way, chain time                                                                                                                  | the Club wallet's recent transactions and the last block, through the existing `TonClient4` (`chain.ts`)                                           |
| Connected wallet, GRAM balance                                                                                                                     | TON Connect and the existing chain reads                                                                                                           |

One client module, `club/socket.ts`, owns the socket: opens it with no query (the new handshake),
sends `clubauth` first, matches replies by `type`, sends `v: 42`, reconnects with backoff and re-auths
with the stored token, and treats a closed socket during a request as "failed, try again". One
adapter, `club/api.ts`, maps 2b's wire format to the client types (`ClubOverview`, `ClubRewards`,
`ClubFriends`, `ClubLeaderboard`) that the components and the mock use, so 2b's format lands in one
file. `PUBLIC_CLUB_MOCK=1` swaps the socket for `club/mock.ts` (scenarios A–G, flows 1–3, launching,
errors; `?clubState=` picks one); a production build contains no mock code.

**What 2b still has to add or confirm for this spec** (one line each to its author):

- None left: 2b §2 now has `now` on every Club reply, `wrapup_pending`, `switch_pending`, and
  `claim_time` (chain time, 0 on old records) and `request_time` on `claim_in_progress` and
  `recent_claims`. This spec uses those names.

**What this spec drops or defers because 2b won't provide it at launch:**

- State A shows level, boost and status only: no holdings, no percentile band (decision 2-A; the
  server sends a `band`, `api.ts` drops it), no exact rank and no "Buy X" (2b Open question 2); all
  appear after linking Telegram.
- The Rewards history has no Community filter and no Community rows until a community writer exists
  (2b §8: community stays 0 until Limzo); `Rewards.dc.html` shows both. The Wireframe's Wallet and
  Level columns, its "Earned this season" and "Claimed in total" tiles, the Fee column of past
  claims, and the base GRAM tiles (hGRAM, APY) and "Earned on" column have no 2b field at launch.
  - Decided by Alireza 2026-10-28: Community filter left out until Community launches.
  - Decided by Alireza 2026-10-28: History is the server's last 10 staking rounds plus the last 10
    referral rounds, newest first.
  - Decided by Alireza 2026-10-28: wireframe items with no server data are left out at launch: the
    wallet and level columns, the "Earned this season" and "Claimed in total" tiles, the fee column
    in past claims, the hGRAM/APY tiles and the "Earned on" column, and "One claim before … qualifies
    you for Level N".
  - Decided by Alireza 2026-10-28: boost is always shown with one decimal ("10.0×").
- Base GRAM history is today's per-round `stake_reward` from `/wallet-rewards`; whether it counts
  pool hGRAM (mili's answer to SPEC §11.2) is not met at launch and goes in the changelog as open.

### 3. Telegram identity

- **Website:** "Log in with Telegram" opens Telegram's login popup for `@HipoFinanceBot` with
  `request_access=write` (`telegram-widget.js`, `Telegram.Login.auth`), from our own button so it
  matches the site in both schemes. The callback's fields go unchanged to `clubauth {widget}`.
  Rejected: the iframe widget button — fixed Telegram styling, awkward inside a React modal.
- **Mini App:** `clubauth {init_data: WebApp.initData}` on every open; no login button.
- **Session:** the token, its expiry, the account and the display name in `localStorage`
  (`hipo.club.session`); cleared on `clublogout`, `bad_session` or expiry. A `reauth` answer reopens
  the Telegram login and repeats the step. "Log out" sits in the Club's Telegram pill.
- **Link Telegram** is offered only for claim, upgrade, change wallet, Friends, alerts and Community
  (SPEC §2). After the login the page reads `clubstatus`: no Club wallet → link the connected wallet
  (proof, prepare, confirm); the connected wallet is the Club wallet → done; another wallet → flow 2;
  no wallet connected → "Connect your Club wallet UQAH…va_a".

### 4. Club load: the wallet check and the three flows

- **The check** runs on every Club page load and on every TON Connect change while a Club page is
  open: compare the connected wallet with `clubstatus.club_wallet` as parsed addresses
  (`Address.equals`), never as strings. Mismatch → flow 3,
  once per page load; "Decide later" leaves the strip "Your Club wallet is still …; claims and
  upgrades are paused until you choose" with **Choose a wallet**. While a mismatch lasts, Claim,
  Upgrade and Withdraw read "Paused until you choose a wallet" and send nothing (L6).
- **A wallet proof** needs a fresh TON Connect connect, because TON Connect returns `ton_proof` only
  when connecting: get `clubproofchallenge {purpose: link}`, set it with
  `setConnectRequestParameters({state: 'ready', value: {tonProof}})`, disconnect, open the modal, and
  send the returned proof as `clublinkprepare {proof: {raw_address, wallet_state_init, domain,
payload, signature, timestamp}}` (club-web's mapping, `src/Model.ts:5155-5170`). The parameters are
  cleared afterwards, so a later ordinary connect asks for no proof.
- **Confirm screen** (all flows): the board's Now / After table from the prepare reply (masked
  wallets, level and boost "from @name", the new wallet's HPO, the Level minimum); `below_minimum` →
  "… is N HPO below the Level minimum. If you switch, your 24-hour grace period starts now." with Buy
  HPO; else "… holds enough HPO to keep Level N"; always the old wallet stops counting, unclaimed HPO
  stays, confirmation on Telegram; `claims_open_at` → "Claims to this wallet are paid from …";
  `claims_from_wallet_void` → spec 2's sentence. The intent lives 5 minutes: at `expires_at` the
  confirm button turns into "Start again".
- **Outcomes:** `done` → the board's strip ("… is now your Club wallet", grace notice when below,
  "We sent a confirmation to @name"); `finishing` → "Finishing your wallet change" and `clubstatus`
  every 15 s for up to 3 minutes; each refusal reason has one fixed sentence (`wallet_taken`: "This
  wallet is linked to another Telegram account", never naming it; `switch_limit`: "You can change
  wallet again on {next_switch_at}"; `changed`/`expired`: reload; `busy`/`retry`: try again). The new
  token from the confirm replaces the stored one.
- **Reconnect previous** is client-only: disconnect, open TON Connect, compare again; match → "Welcome
  back: … is connected. Nothing changed." During grace it adds "Your grace period keeps running
  unless this wallet holds the minimum" (BUILD-PLAN §9 review note).
- **Release** is a low-emphasis "Release this wallet instead" in the Change-wallet explain step →
  `clubreleaseprepare` → a confirm with the warning (draft copy for mili): "Release UQAH…va_a? It
  stops being your Club wallet. Until you link another one, your Level minimum counts 0 HPO, so your
  24-hour grace period starts now. Your unclaimed HPO stays with @name. Another Telegram account can
  then link this wallet." (the grace sentence only when the minimum is above 0) →
  `clubreleaseconfirm`.
- A wallet changed on Stake, Unstake or in the Mini App shows nothing on those pages; the Club catches
  it on its next load.

### 5. Overview states

Order of the page and copy: SPEC §4 and `wireframes/Main.dc.html` `renderVals()`, with sample
numbers replaced by data and SPEC §10's pool copy. The status message is picked in this order:

1. Loading → skeleton cards at their final heights. Socket error → "Couldn't load the Club. Retry".
2. `not_open` → "The new Club opens in a few minutes", re-checked every 60 s.
3. No wallet and no session → connect prompt. No session → **A** from the `club` object of
   `/wallet-rewards`: level, boost and status, no holdings and no band (decision 2-A), no exact rank
   and no "Buy X" (2b Open question 2); the wallet is no Club wallet → A without level, with "Link
   Telegram to start".
4. `frozen` → "Your account is paused for a security check. Contact support"; all actions off.
5. Mismatch, decided later → the paused strip (§4).
6. **E** suspended → **D** grace (or its "claimed, still below" variant) → **G** chip `reset` →
   **F** chip `restored` → **C** claimed this season → **B** claim gate `ok` → below the claim
   minimum (gate `below_min`: "You'll reach the 100 HPO claim minimum in about N rounds", from
   `estimate_now`). F and G use 2b's chips, so each shows for 7 days.
7. A claim on its way (§6) overrides B/C until the server shows the claim. An upgrade on its way
   (`pay_in_progress` with target `upgrade`, from this device or another) likewise overrides B/C:
   "Your upgrade is on its way. Your payment for Level N is being applied", no action, until the
   server drops the record.

While the first load has not settled whether there is a session (a Mini App or preview login can
still be on its way), the header's Telegram pill is a skeleton, never "Telegram not linked".

Countdowns, as built: the header's "Season N ends {date} · D days left" rounds up (D = ⌈time left /
1 day⌉, so 4 days 1 h reads 5 days); the grace and restore deadlines (`ClubModel.duration`) show
hours and minutes under two days and whole days, rounded down, above (4 days 23 h reads "4 days").

Copy rule: "next season", never a season number next to a level; with Season 6's end open, "Claim
once this season to reach Level N next season" (no date).

### 6. The payment guard (claim and upgrade)

Both sends go through one function, `club/payments.ts` `sendClubPayment(kind, n?)`. It is the only
caller of `sendTransaction` for the Club, and it runs these steps in order; any failed step sends
nothing and shows its sentence.

1. **Static checks:** a session; not frozen; no mismatch (connected wallet `Address.equals`
   `club_wallet`, L6); GRAM balance ≥ amount + g ("You need {amount + 0.05} GRAM in this wallet").
2. **Payment on its way, from the chain.** Read the Club wallet's transactions through TonClient4,
   from its last transaction backwards. The read must be at a block no older than about 60 s by
   server time, else nothing is sent. It pages back until a transaction older than 24 h (chain time)
   is reached; if the page limit (10 pages) is hit first or any page fails, nothing is sent (fail
   closed: "Couldn't check your wallet's recent payments. Try again in a minute"). A **matching
   message** is an outgoing message to hipo.ton (`Address.equals`) with op `0xb0` and this n
   (upgrade) or op `0xfee1` (claim). It counts as **applied**:
   - upgrade: when `clubstatus.club_level` ≥ n − 1 (0-based);
   - claim: when some claim record (`claim_in_progress` or `recent_claims` of `cluboverview`) has
     `claim_time` ≥ the message's chain time; a record with `claim_time` 0 (an old record) uses its
     `request_time` instead.
     A matching message that is not applied and is at most 24 h old → "Your payment is on its way",
     nothing sent. Older than 24 h and still not applied → "Your payment of {time} wasn't applied;
     contact support before paying again", nothing sent until the member confirms that they have read
     it. This check works across devices and reloads. Edge: a claim fee sent from club-web in the 24 h
     before L, on the rules-5 path, has a wallet-keyed record that `recent_claims` may not show; it then
     reads "on its way" until it is 24 h old.
3. **Pending lock, local.** If a pending lock for this account and target exists (`localStorage`,
   `hipo.club.pending`), send nothing and try to release it (step 6).
4. **Re-read just before the send.** Immediately before `sendTransaction`, re-read `clubstatus` (and
   `clublevels` and `cluboverview` for upgrades; `cluboverview` for claims). Send nothing if
   `club_wallet`, `club_level`, `state`, `switch_pending` or the fee differ from what the modal showed;
   refresh the modal instead.
5. **Write the pending lock**, then call `sendTransaction`. The lock is `{account, target: n |
'claim', validUntil: v, created: server time, startLt: the Club wallet's last transaction LT from
step 2}` with v = floor(server time) + 300.
6. **Release the lock** only on:
   1. an explicit wallet rejection (`UserRejectsError`);
   2. the server showing it applied: `clubstatus` level ≥ n − 1, or, for a claim, a claim record
      newer than the lock (its `claim_time`, or `request_time` when that is 0, ≥ `created`);
   3. the chain: the chain read was made at a block whose time is ≥ v + 60, and it covers every
      transaction of the Club wallet from the lock's creation (`startLt`) to that block, with no
      matching message. This is judged by the read's own block time, not by server time or the device
      clock;
   4. the landed message is more than 24 h old by chain time and the server still hasn't applied it:
      the step-2 sentence "Your payment of {time} wasn't applied; contact support before paying
      again" is shown, and the lock is released only after the member confirms.

   Any other wallet error (timeout, stale session, closed bridge) keeps the lock. No lock expires on
   time alone, and the lock is kept across logout and wallet disconnect.

Server time = device time + the offset from the last Club reply's `now` (2b: every Club reply carries
it). No payment is built before the session's first reply has arrived. Every comparison in §6–§7 with
a server timestamp (`claims_open_at`, state E's `until`, L + 23 h) uses server time.

**Left over:** steps 2 and 4 run before the wallet shows its prompt; the member may spend up to 300 s
approving, and the account can change in that time (a switch from another device, a suspension, a
reset at the end of a restore window, wrapup pass 2). The server then judges the payment as it is
(held, or D1). §7 removes the two foreseeable cases (state E near its deadline, wrapup pass 2); the
rest is named in Risks.

**Server record, decided 2026-10-27 (Alireza).** A "payment in progress" record on the server, which
every device and the Mini App see (club-server spec `club-read-api-alerts-xp-off.md` §2). After step 4
and right before step 5, the guard sends `clubpayintent {target, level?, valid_until: v}`; a
`payment_in_progress` refusal shows "Your payment is on its way" (as a found chain message does), and
any other refusal, error or closed socket sends nothing (fail closed). An open `pay_in_progress` on
`cluboverview` or `clubstatus` refuses the same way, and the Claim and Upgrade buttons show it. On
`UserRejectsError` the guard sends `clubpaycancel`, then releases the lock; on no other outcome. The
server keeps the record until the payment is applied or v + 1260 s (an upgrade's record can stay open
until the server's next upgrade pass, up to 24 h). The server refuses a non-undo Club-wallet switch or
release while a payment is in progress; an exact undo is always allowed. The page shows the server's
refusal ("you can change wallets once the server has processed it") and does not retry. The undo and
release confirm screen warns that a payment sent in the last few minutes may not count.
`clubpayintent` also sends `wallet` (the Club wallet's raw address); `wallet_changed` shows "Your Club
wallet changed; check and try again" and sends nothing; `clubpaycancel` answering `not_yours` is done. The local lock and the chain check stay as they are.

### 6a. Claim (money: transaction building)

`buildClaimTx()` in `club/clubTx.ts` returns exactly:

```
{ validUntil: v, network: MAINNET, from: <Club wallet raw>,
  messages: [{ address: 'UQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt6UI',
               amount: '1000000000',
               payload: base64(BOC(cell: uint32 0xfee1, uint64 0)) }] }
```

No `stateInit`, one message; the non-bounceable form gives bounce false, as club-web sends today. The
address and C are constants in `clubTx.ts` (the server's `addressbook.go:25`, `jobs.go:100`). Claim
is offered only when, on top of §6:

- 2b's claim gate is `ok` (it follows the sweep's own order: `launching`, `no_wallet`,
  `in_progress`, `frozen`, `switch_pending`, `link_wait`, `revert_hold`, `below_min`); any reason
  shows its sentence, with `opens_at` where given;
- B ≥ 100 HPO, from `unclaimed` parsed as in Definitions. A fee sent with B under 100 is held up to
  24 h and then given up unless B reaches 100 meanwhile (spec 1 §5), which is why both checks stand;
- `claims_open_at`, when present, is past by server time + 60 s.

A disabled Claim or Upgrade button names its own action: with no Club wallet yet, "Link a Club wallet
to claim" / "Link a Club wallet to upgrade"; with the Club wallet not connected, "Connect {wallet} to
claim" / "Connect {wallet} to upgrade".

The claim modal shows the next-season effect, Level minimum before → after (M + B) and holdings after
(H + B), "1 GRAM fee to hipo.ton", and that the HPO goes to the Club wallet. Done → "You've qualified
for Level N" when the claim qualifies, else "Claimed"; the page polls `cluboverview` every 30 s until
the claim shows.

### 7. Upgrade (money: transaction building)

`buildUpgradeTx(n, fee)`:

```
{ validUntil: v, network: MAINNET, from: <Club wallet raw>,
  messages: [{ address: 'UQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt6UI',
               amount: A_n as decimal string (f_n × 10^9 in BigInt),
               payload: base64(BOC(cell: uint32 0xb0, uint64 0, uint8 n)) }] }
```

- n = `clubstatus.club_level` + 2; n ≤ 10, else "Top level reached".
- f_n = `clublevels.club_levels[n − 1].upgrade_fee`, never `next`, and it must equal
  `cluboverview.upgrade_fee`. A fee that is not a whole number in (0, 10,000] → no send, error
  shown. No fee is written in the site's code.
- **The Club exists only after L, so a `clublevels` reply that has `next` or `fees_change_at` means
  the server's clock or L is wrong: no send, error shown.**
- **While state E's `until` is within 1 h or past, by server time, Upgrade is off ("Your level is
  about to be reset").**
- **Wrapup pass 2** (spec 1 §10) can still raise an account whose Season 5 outcome is `noclaim`. For
  such an account (`cluboverview.wrapup_pending` true) Upgrade is paused from L + 23 h by server
  time until `wrapup_pending` turns false ("Upgrades reopen after the Season 5 wrap-up"); Open
  question 9.
- Allowed in grace and while suspended (otherwise), with the board's suspended copy.
- A second payment for the same n would be refused and kept (D1); §6 steps 2, 3 and 6 are what stop
  it.
- The modal: now vs after (boost, per-round estimate), the fee, "paid to hipo.ton", the board's note
  on the seasonal upgrade.

### 8. Revenue-share withdrawal (money: withdrawal path, no transaction)

`hpowithdrawrewards {raw_address: <Club wallet raw>, value: -1}` on the authenticated socket. Offered
when there is a session, no mismatch, and R ≥ 10 GRAM; the button is locked while a request is
open. The panel (collapsed, at the bottom of Rewards) says revenue sharing is paused, and "You
receive HPO bought with {R − 0.5} GRAM; the 0.5 GRAM fee is deducted". The reply's balance and
history replace the shown ones; a closed socket means "failed, try again", since the server's
check refuses a second withdrawal of an emptied balance.

### 9. Rewards, Friends, Leaderboard, Community

- **Rewards** (`Rewards.dc.html`, from `clubrewards`): ready to claim with its split by stream as the
  wireframe shows it, "Staking X + referral Y · sent to {Club wallet} · fee 1 GRAM" (a community
  part once `unclaimed_by_stream.community` is above 0; no "sent to" without a Club wallet); earning
  per round and lifetime totals per stream (staking, referral); per-round history with All /
  Staking / Referral filters, the last 10 staking rounds and the last 10 referral rounds merged
  newest first (Community filter and rows: §2); "Referral earned before launch" as one line (2b P6,
  not in the wireframe); past claims with wallet and transaction link; base GRAM rewards ported from
  today's page (`Reward.tsx`, `/wallet-rewards`), with "Stake more" → `/stake/`; revenue share (§8).
  Per-round HPO shows 2 decimals and per-round GRAM 4 (the wireframe's +7.83 and +0.3117), always
  that many; a non-zero value too small for them shows two significant digits. Boost always shows one decimal ("10.0×"; decided by Alireza 2026-10-28). The Overview's
  "Boosted HPO to claim" card shows the one figure, no split (`Main.dc.html`).
- **Friends** (`Friends.dc.html`, from `clubfriends {filter, offset, limit ≤ 50}`): the invite link
  as 2b returns it, with copy and share-to-Telegram (`https://t.me/share/url`); count and referral
  total; rows (name, friend's HPO, your 1%) with All / Earning / Not staking yet, 50 at a time with
  "Show more". Needs Telegram.
- **Leaderboard** (SPEC §5, from `clubleaderboard {club_level, by: hpo|growth}`): level switcher
  1–10, default own level; ranking toggle; other rows show rank, name, band and % change (absent when
  the server's switch is off; another row's change is a band, "−10% to −5%", "+100%+") only; the
  own row with its own holdings; "Buy about X HPO to reach #N" from `cluboverview.rank.buy`; "Hide my name" and the alerts switch through `clubsettings`;
  not-listed copy by 2b's `why` (`suspended`, `no_claim`, `no_wallet`).
- **Community "coming soon"** (K1, draft for mili): heading "Community rewards are coming soon",
  body "Soon you'll earn HPO each week for being part of Hipo Chat: helpful replies, appreciation
  from other members and showing up. Points are counted by Limzo and reviewed by the team before
  any HPO is credited. Join Hipo Chat now to be ready.", links **Hipo Chat** (t.me/hipo_chat) and
  "Powered by Limzo" (limzo.com/s/hipo). No points, no Limzo calls.
- Empty states: no claims yet, no friends yet ("Share your link"), no history yet, a level with no
  listed members.

### 10. Telegram mode (the Mini App)

The bot's WebApp button and the `join` Mini App open `https://hipo.finance/club/` (club.hipo.finance's
index redirects there, keeping the URL fragment, which carries Telegram's launch data). In Telegram
mode the Club uses initData (§3), shows no Telegram login and no "Link Telegram", and runs the same
wallet check (flow 3) on open. The proof's domain is `hipo.finance`, which the server takes from the
page's Origin. Layout: the bottom row stays Stake · Club · Stats · DeFi (Rewards → Club, Gift icon),
and the four Club tabs sit as a segmented row at the top of the Club page, the same component as on
the web (Open question 1).

### 11. Mobile, schemes, RTL

Every card stacks in one column below `sm`; the two Overview cards sit side by side from `md`. Modals
are bottom sheets on phones. Semantic tokens only; the strip tones (info, success, warn, neutral) get
four token pairs in `app.css` for both schemes; never `bg-accent`. Addresses are masked; a full
address uses `break-all` + `min-w-0`. Logical utilities only; numbers and tickers through
`model.isolate`/`num`. Checked at 360 px and 1280 px, dark and light, `fa` for RTL.

### 12. Before L, and the launch commit

- **Before L** (`CLUB_LIVE = false`): no `/club/` page in any locale, nav reads Rewards, `/rewards/`
  is today's page with its Season card, the Mini App is club-web.
- **The launch commit** at L, prepared and built with the flag on beforehand:
  1. `CLUB_LIVE = true`: 44 Club URLs (4 tabs × 11 locales) and their sitemap group `app`.
  2. Nav: Rewards → Club in all seven places and the TMA title (flag-driven, already in the code).
  3. `/rewards/` and `/<locale>/rewards/` become redirect pages to `/club/` (`location.replace`,
     `<meta http-equiv="refresh">`, canonical, `noindex`), out of the sitemap and `lastmod`;
     `/app/` maps `page=reward` to `/club/`.
  4. English docs (SPEC §7): `giveaways-and-prizes/hipo-club.md`, `wallets-and-rewards.md` ("Using
     Multiple Wallets" rewritten), `introduction/hipo-rewards.md`, `glossary.md`, the HPO page copy:
     100 HPO minimum, 1 GRAM claim fee, the new seasonal rule, "2–3 months", grace + 7-day restore
     instead of the penalty, the fee table, the Level minimum's streams, pools, no XP. New pages
     (pools, community) come later, when translated; until then the Club links `/defi/` (SPEC §10).
  5. `public/llms.txt` for the new rules; `CHANGELOG.md`.
  6. The post-deploy render check in `.github/workflows/deploy.yml` gains a second run for the Club:
     `node scripts/render-check.mjs --expect='Hipo Club' https://hipo.finance/club/`. It is not in
     `deploy.yml` before L, so the deploys until then stay exactly as today's.
  7. Every internal link to `/rewards/` is pointed at `/club/` (or `/club/rewards/` where it means the
     reward history), since `/rewards/` becomes a redirect page. English sources:
     `docs/wallets-and-rewards.md:16` and `:50` ("Rewards page"), `docs/fees-and-gas.md:23`,
     `docs/hipo-tokens/hipo-staked-gram-hgram.md:11` ("Staking Rewards Tracker"),
     `docs/introduction/how-does-hipo-work.md:8` ("staking rewards"),
     `docs/introduction/hipo-rewards.md:16` ("Hipo app"), `blog/hipo-2nd-anniversary-report/index.md:167`
     ("Hipo App"; the blog is English-only) and `public/llms.txt:334` (`https://hipo.finance/rewards/`).
     The same five docs pages carry the link in each of the ten other locales
     (`src/content/docs/<locale>/…`, 50 files). The nav items are flag-driven and need nothing.
- The other moves at L (bot button, `join` app, club.hipo.finance redirect, the order) are spec 4's.

### 13. Schedule

- **Wed Oct 28:** English build against the mock (`npm run dev`; `npx astro build` with the flag on
  for a build check, since the i18n gate fails until the locales land); the transaction diff goes to
  the two money audits. Nothing committed.
- **Thu Oct 29 – Fri Oct 30:** after the English approval, the ten locales and `npm run build`; the
  2b adapter; end to end against a local club-server; the pre-L Claim test (below); one dark
  commit (flag off) when Alireza says so.
- **Sat Oct 31, L:** the launch commit, pushed on Alireza's go. The page answers `not_open` until the
  migration is done (about L + 15 min); after that, the real-wallet tests below.

Wallet tests. **Claim, before L:** confirm the test wallet's real claimable is at least 100 HPO first
(today's `/wallet-rewards` `hton_sum_rewards`, which the rules-5 sweep takes), then claim through the
page in mock mode with a real transaction. **Upgrade, after the migration is done:** from the real
`clubstatus` and `clublevels` only, with the Level-4 test account (to Level 5, 100 GRAM). No real
upgrade is ever sent from mock data.

Rejected: Leaderboard as a fifth tab (SPEC puts it in Overview); REST endpoints for the site (spec 2
chose the WebSocket); rebuilding club-web (PLAN B4); client-side fee constants (the server's table is
what judges a payment, so a second copy can only disagree).

## Changes

- `src/data/club-flag.mjs` (new) — `CLUB_LIVE`, `clubBuilt()`.
- `src/pages/club/[...tab].astro`, `src/pages/[locale]/club/[...tab].astro` (new) — flag-gated
  routes; `ShellRoute` gains page `club`; `src/components/pages/ClubPage.astro` (explainer).
- `src/pages/rewards/index.astro`, `src/pages/[locale]/rewards/index.astro` — redirect when the flag
  is on; `src/pages/app/index.astro` — `page=reward` target by flag.
- `src/components/app/Model.ts` — route `/club/…`, `activePage 'club'`, `clubTab`, lazy `club`
  sub-store; nothing else of the stake path.
- `src/components/app/club/` (new) — `ClubModel.ts` (state and checks), `payments.ts` (the payment
  guard of §6: pending locks, chain check, re-read, server time), `socket.ts`, `api.ts` (2b adapter),
  `mock.ts`, `clubTx.ts` (the two builders and constants), `telegramLogin.ts`, and the
  components: `ClubPage`, `Overview`, `StatusStrip`, `GracePanel`, `LevelCard`, `ClaimCard`, `YourHpo`,
  `LevelUp`, `Leaderboard`, `Balances`, `Teasers`, `RewardsTab`, `FriendsTab`, `CommunityTab`,
  `modals/` (LinkTelegram, ChangeWallet, Choose, Confirm, Release, Claim, ClaimDone, Upgrade,
  UpgradeDone).
- `src/components/app/App.tsx`, `tma/TmaApp.tsx`, `tma/TmaTabs.tsx`, `tma/TmaHeader.tsx`,
  `Header.tsx`, `shell/ShellHeader.astro`, `shell/AppShell.astro`, `SiteHeader.astro`,
  `layouts/AppLayout.astro` — Club page and the flag-driven nav item.
- `src/i18n/<locale>/club.json` (new namespace, English first), `seo.json` keys `seo.club*`,
  `site.json`/`app.json` nav labels `club`; `src/content/prose/<locale>/shell/club.md`; the catalog
  inlined on Club pages and in `/i18n/<locale>.json` for Telegram mode.
- `src/styles/app.css` — strip tone tokens, both schemes.
- `astro.config.mjs` — `club` in `APP_SECTIONS`, `/rewards/` filtered from the sitemap when the flag
  is on; `src/data/lastmod.mjs` — `club` route.
- `scripts/club-tx-selftest.mjs` (new) — byte checks of both builders and the fee parsing.
- `.claude/money-map.txt` — `club/clubTx.ts` (tier 3: builds the claim and upgrade transactions),
  `club/payments.ts` (tier 3: the guard before every send), `club/ClubModel.ts` (tier 3: the
  checks before a send, the withdrawal request).
- Launch commit only: docs pages (all locales, for the `/rewards/` links), the blog post's `/rewards/` link, `public/llms.txt`, `.github/workflows/deploy.yml` (the `/club/` render check), `CHANGELOG.md`.

## Acceptance criteria

Flag and routes:

- [ ] With `CLUB_LIVE = false` and no env, `npm run build` emits no path under `/club/` or
      `/<locale>/club/`, the sitemap has no club URL, the nav says Rewards, and `/rewards/` is today's page.
- [ ] With the flag on, the build emits 44 Club pages, each in the `app` sitemap chunk of its locale;
      `/rewards/` and `/fa/rewards/` load `/club/` and `/fa/club/`, are `noindex` and not in the sitemap.
- [ ] `gzip -c dist/_astro/AppIsland.*.js | wc -c` grows by ≤ 3 KB against `857beba`; no file in a
      production `dist/_astro/` contains the mock's scenario names.

Money (each checked by `scripts/club-tx-selftest.mjs` and in the two audits):

- [ ] The claim BOC decodes to exactly 32 bits `0xfee1` + 64 bits 0, no refs; amount `'1000000000'`;
      address parses to `0:92967851…a5b7`; one message, no `stateInit`.
- [ ] For n = 2..10 and the after-L table, the upgrade amount strings are `20000000000` …
      `1100000000000`; the BOC is `0xb0`(32) + 0(64) + n(8), no other bits; fees 0, −1, 20.5, 10,001,
      `"420"`, NaN, Infinity, 1e21 and 1100.0000000000002 build nothing.
- [ ] B parsing: `"100"`, `"100.000000000"` and `"123.456789012"` parse exactly; `"1e2"`,
      `"100.0000000001"` (10 decimals), `"-5"`, `""` and `" 100"` are unknown and offer no Claim;
      99.999999999 HPO offers no Claim.
- [ ] validUntil is an integer number of seconds equal to floor(server time) + 300, also with the
      device clock set 10 minutes wrong.
- [ ] A base64 claim and upgrade BOC from the selftest is accepted by club-server's `0xfee1` parse and
      `parseUpgradePayment` (a scratch Go test outside the repo) with the same level.
- [ ] In the mock: Claim sends nothing with no session, on a mismatch, while frozen or switch
      pending, for each non-`ok` gate reason, before `claims_open_at` + 60 s by server time, or with 1.04
      GRAM; Upgrade sends nothing at level 10, when `clublevels` has `next` or `fees_change_at`, when its
      fee differs from `cluboverview.upgrade_fee`, while state E's `until` is within 1 h or past, or for a
      `noclaim` account from L + 23 h until pass 2; Withdraw sends nothing below 10 GRAM or on a mismatch.
- [ ] Pending lock: it is written before `sendTransaction` is called; a reload, a logout and a wallet
      disconnect keep it; a wallet timeout keeps it; `UserRejectsError` releases it; level ≥ n − 1
      (0-based) in `clubstatus` releases it, also when the level jumped by two; for a claim, only a claim
      record with `claim_time` (or `request_time` when 0) ≥ the lock's `created` releases it; it never
      releases on elapsed time alone.
- [ ] Chain release: a read at a block with time v + 59 does not release; a read at v + 60 whose pages
      stop short of `startLt` does not release; a read at v + 60 covering `startLt` onwards with no
      matching message releases; the device clock set 10 minutes ahead changes none of these.
- [ ] Chain check (fake transaction lists): an outgoing `0xb0` with this n to hipo.ton from the last
      hour, level not raised → a second device (empty `localStorage`) shows "Your payment is on its way"
      and sends nothing; the same for a `0xfee1` with no claim record of `claim_time` ≥ its time, and for
      one covered only by a record with `claim_time` 0 and an older `request_time`; a `0xfee1` covered by a
      record with `claim_time` ≥ its time does not block; another n does not block; a message over 24 h
      old and not applied shows "wasn't applied; contact support" and blocks until confirmed.
- [ ] Fail closed: a last block older than 60 s by server time, a failed page, or 10 pages without
      reaching a transaction older than 24 h → nothing is sent.
- [ ] Server record (decided 2026-10-27): `clubpayintent` is the last await before the lock is
      written; a `payment_in_progress` answer (a second device), any other refusal, an error or a closed
      socket → nothing is sent; `pay_in_progress` on `cluboverview` → nothing is sent and Claim / Upgrade
      show "on its way"; `UserRejectsError` → `clubpaycancel`, then the lock is released; a wallet timeout
      sends no cancel. A switch or release refused with `payment_in_progress` shows its sentence, no retry.
- [ ] Re-read: when `clubstatus` or `clublevels` read just before the send differs from the modal in
      `club_wallet`, `club_level`, `state`, `switch_pending` or the fee, nothing is sent and the modal
      refreshes.
- [ ] Before L, after confirming the test wallet's real claimable ≥ 100 HPO, Alireza claims through
      the page (mock status, real transaction) and the server pays it on today's path. After the
      migration is done (about L + 15 min), the Level-4 test account upgrades to Level 5 for 100 GRAM from
      the real `clubstatus` and `clublevels`, and a claim from a real account is paid.

Identity and wallets (mock, plus a local club-server when it allows the dev origin):

- [ ] Web: Link Telegram → login → proof → confirm links a first wallet; Mini App (`?tma=1` + mock
      initData): no login button, same check on open.
- [ ] Flow 1, 2 and 3 run as board 09 with both "meets" and "below minimum" new wallets; every Cancel
      and "Decide later" leaves `clubstatus` unchanged; each outcome shows its strip.
- [ ] Each refusal reason of spec 2 shows its sentence; `wallet_taken` names no account; `reauth`
      reopens the login and the step then succeeds; an intent past 5 minutes asks to start again.
- [ ] Release shows the 0-HPO warning; `claims_from_wallet_void` shows spec 2's warning.

States and layout:

- [ ] Mock states A–G, below-minimum, just-claimed, launching, frozen, loading, socket error and each
      empty state render with the board's copy and no sample number from the wireframes.
- [ ] No horizontal scroll at 360 px on any Club page or modal, dark and light, `en` and `fa`;
      screenshots kept in the scratchpad.
- [ ] `node scripts/check-i18n.mjs` passes with the ten locales; `npm run build` passes.
- [ ] The launch-commit build (flag on, docs) passes and every SPEC §7 item is addressed in the
      English docs, except the two new pages.

## Risks & rollback

- **GRAM sent for nothing** (D1): wrong amount, payload, level, wallet or a double send. Covered by the
  builders' byte tests, the payment guard (§6: chain check, pending lock released only by evidence,
  re-read just before the send), and the two money audits of the code. A loss is seen in the server's
  D1 log lines; there is no refund (F1).
- **The minutes in the wallet app.** Between the re-read and the member's approval (up to 300 s)
  the account can change: a switch from another device, a suspension, the reset at the end of a
  restore window, wrapup pass 2. The payment is then judged on the new state (held, or D1). §7 turns
  Upgrade off in the two foreseeable cases; the rest is accepted as rare.
- **Chain read unavailable.** If the wallet's transactions can't be read, or the read is stale or
  stops at the page limit, step 2 of §6 fails closed and nothing is sent ("Try again in a minute"); a
  lock is not released without a complete chain answer. A busy wallet (over 10 pages in 24 h) can't
  pay from the page at all; such wallets are not expected among members.
- **A payment held over 24 h, then honoured.** After 24 h the page lets the member pay again once
  they confirm the "wasn't applied; contact support" notice. If the server was only holding the
  first payment (a long freeze, a stuck switch) and later honours it, the second payment for the same
  n is D1. Mitigated by the server's held-payment alert at 6 h and by the notice telling the member to
  contact support first.
- **2b late or different:** the adapter isolates it; if 2b's wire format isn't ready by Thu, the
  tabs that need it ship with the mock's shape and a one-file change on Fri. If 2b misses L, Overview
  without 2b can't show B, so Claim can't be offered: the launch slips (spec 4's go/no-go).
- **Telegram login untested on hipo.finance before L** (the domain is set in BotFather; localhost is
  refused): the first real Widget login is at L. Open question 3.
- **Launching window:** members arriving between L and the migration see "opens in a few minutes";
  a claim or upgrade sent from club-web meanwhile is held, not lost (spec 1).
- **Stored token stolen by a script on the page:** it can read Club data and request a withdrawal to
  the member's own wallet; it can't move the Club wallet (fresh login needed). The site loads no
  third-party script on Club pages except Telegram's login script.
- **Rollback:** revert the launch commit and push (the site is back to Rewards in a few minutes).
  Members' Club state is on the server and is unaffected; claims and upgrades then go through the
  Mini App only if club-web is restored (spec 4).

## Open questions

Decided 2026-10-27 (Alireza), for the numbered questions below: **1** (a): the bottom row is Stake ·
Club · Stats · DeFi with the Club tabs on top, the same component as the web; **2** Club wallet only at
launch, with a read-only count of past wallets holding revenue share; **3** a dev bot with a tunnel to
test the Telegram login before L; **4** a dev-only allowed origin on club-server (`--dev-origin`, off in
production), built with spec 2b; **5** launch with the drafted Community and Release copy, improved later
if needed; **6** "Restored" and "Reset" show 7 days; **7** the BotFather change of the `join` Mini App to
`https://hipo.finance/club/` goes into spec 4's launch steps (the inviter is recorded, tested in 2b);
**8** accepted: the first real upgrade after the migration, from the real status; **9** pause Upgrade for
`noclaim` accounts from L + 23 h until pass 2 has run (`wrapup_pending`); **10** the split by stream,
the referral rows and the GRAM history over wallet + pools are shown at launch (spec 2b provides them).

1. **The Mini App's tab row.** SPEC §1 puts Overview · Rewards · Friends · Community in the bottom
   row; the website's Telegram mode has Stake · Rewards · Stats · DeFi there. Options: (a) bottom row
   Stake · Club · Stats · DeFi with the Club tabs on top, one component for web and Telegram; (b) the
   four Club tabs at the bottom on Club pages and today's row elsewhere, so the row changes under the
   thumb; (c) Club tabs at the bottom, Stake/Stats/DeFi in a menu. Recommend (a): one layout, staking
   stays one tap away. mili decides.
2. **Revenue share on past wallets.** The server lets a member withdraw for a past Club wallet, but
   the page only knows past wallets masked and checks the connected one. Options: Club wallet only at
   launch (simple; a past wallet's balance waits until it is the Club wallet again, or 2b lists
   them); or 2b returns each past wallet's balance and the page allows those too. Recommend Club
   wallet only now, and count how many past wallets hold revenue share (a read-only query). Alireza.
3. **Testing Telegram login before L.** Options: a dev bot with its domain set to a tunnel host and a
   dev club-server with that bot's token (half a day; tests the real popup); or accept that the
   first real login is at L + 15 min with the test account, and roll back if it fails. Recommend the
   dev bot, since login gates every claim. Alireza (BotFather access).
4. **Local end to end.** The new handshake refuses the Origin `http://localhost:4321`; a dev-only
   allowed origin on club-server (a flag, off in production) is needed for any test against a real
   server. Recommend adding it with spec 2b. Alireza.
5. **K1 and release copy.** The Community and Release texts above are drafts; mili's edit is needed
   by Thu Oct 29 so the locales can follow (BUILD-PLAN had Sun Nov 1, after L now).
6. **How long F and G show.** 2b's chips decide: "Restored" for 7 days after the restore, "Reset" for
   7 days while the minimum is still 0. mili may prefer shorter spans; that is a 2b change.
7. **The `join` Mini App and referrals.** Invite links open `t.me/HipoFinanceBot/join`; it must point
   to `hipo.finance/club/` at L too, and `clubauth {init_data}` must record the inviter from
   `start_param` as today's login does. Recommend spec 2b/4 confirm both; otherwise new friends after
   L are not counted.
8. **Upgrade tested only after the migration.** Before L the page can't log in (`not_open`), and a
   mocked level risks a refused payment, so the first real upgrade is the Level-4 test account once
   the migration is done (about L + 15 min), from the real `clubstatus` (100 GRAM). Recommend
   accepting that, with the cross-check against the server's parser above. Alireza.
9. **Upgrades around wrapup pass 2.** An account whose Season 5 outcome is `noclaim` can still be
   raised by pass 2 (L + 24 h or later); an upgrade paid just before and judged after it lands on a
   level the member didn't expect. Options: pause Upgrade for those accounts from L + 23 h until pass
   2 has run (2b's `wrapup_pending`), or rely on spec 1 §8's
   across-wrapup rule and accept the rest. Recommend the pause: it costs a few hours of no upgrades for
   members who didn't claim in Season 5. Alireza.
10. **Stream split and pool GRAM history at launch.** 2b gives one "ready to claim" figure, staking
    rows only and base GRAM history as today (wallet only, not checked). Recommend launching so, with
    the per-stream rows and wallet + pools history after launch (2b Open question 3). mili.
