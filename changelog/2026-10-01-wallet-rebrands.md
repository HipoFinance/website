# 2026-10-01 — Two partner wallets renamed: Walt and My Wallet

Reported from Telegram: the wallet names on `/defi/` are out of date. Both partner wallets in that
section have rebranded, and the names were repeated across the docs and the FAQ in every locale.

| Commit         | Subject                                          |
| -------------- | ------------------------------------------------ |
| (this session) | Rename the partner wallets to Walt and My Wallet |

## The two renames, as verified

Neither name was taken on trust; both were checked against the vendors' own announcements and the
reporting around them before anything shipped.

**MyTonWallet → My Wallet.** Announced late June 2026 alongside an expansion to eleven chains. The
brand is **two words**, not "MyWallet" as the request put it. It moved to `mywallet.io`;
`mytonwallet.io/get` still resolves but redirects to `get.mywallet.io`, so the link now points at
the new domain directly.

**TON Space → Walt**, with a caveat that decided the link. Two separate things happened in Telegram's
wallet space, and conflating them would have pointed stakers at the wrong product:

- "Wallet in Telegram" — the product our row actually linked to, at `t.me/wallet` — rebranded to
  **Walt** on 2026-09-28, moving to the `@walt` handle.
- **Gram Wallet** is Telegram's own new non-custodial wallet. It is the successor to what TON Space
  functionally was, but it is a _different product_: the two "operate alongside one another inside
  Telegram rather than share the same name."

The decision was Walt, and it is not only a label change. Reporting is explicit that Gram Wallet
**takes over the previous Wallet position inside Telegram**, so leaving the link on `@wallet` would
have quietly repointed this row at a wallet we have never checked. The URL moved to
`https://t.me/walt?startattach` for that reason, and `Model.ts` records it.

Gram Wallet is deliberately not added. It is not fully released and nobody has confirmed it displays
hGRAM, which is the only claim that section makes. It goes in when it supports us, not before.

## What changed

The names appeared far beyond the page that was reported — 49 and 37 occurrences across 47 and 35
files — so the sweep covered all of it rather than leaving the docs contradicting the app:

- `src/components/app/Defi.tsx` — both rows: names, logos, link fields and window targets.
- `src/components/app/Model.ts` — `tonspaceUrl` → `waltUrl` (new handle), `mtwUrl` → `myWalletUrl`
  (new domain), each with the reason recorded rather than just the new value.
- `hgram-use-cases.md`, the "can I use hGRAM in DeFi" FAQ prose, and the `/defi/` shell card — 33
  files, all eleven locales. Both names are proper nouns kept in Latin script in every locale per
  `src/i18n/GLOSSARY.md`, so the replacement is literal everywhere; only the names moved, never the
  surrounding connectives.
- `src/i18n/GLOSSARY.md` — the never-translate row now lists `My Wallet` and `Walt` in place of
  `MyTonWallet` and `Wallet (Telegram)`.

**Logos were replaced, not kept.** A renamed brand wearing its old mark is half a rename, and both
marks genuinely changed — the old MyTonWallet roundel is an ornate circular pattern, the new My
Wallet mark is a blue "M". `walt.jpg` (320×320, the official `@walt` avatar) and `mywallet.webp`
(400×400, from `mywallet.io`'s own app icon) replace `tonspace.jpg` and `mytonwallet.webp` at the
same dimensions the rows already expected. The old files are deleted; nothing else referenced them.

## What was deliberately left alone

`src/content/docs/**/tutorials/staking.md` carries `MyTonWallet` inside the alt text of
`tutorials-staking-3.png`:

> alt="The wallet-connect dialog listing Tonkeeper, MyTonWallet, Tonhub and DeWallet"

That alt text describes a **screenshot that still shows the old branding**. Renaming it would make
the alt text describe something the image does not show, which is worse for a screen-reader user
than a stale brand name. It is the one place the old name is still correct, and it stays until the
screenshot is retaken. Confirmed to be the only occurrence in those files, in all eleven locales.

### Verification performed

- `node scripts/check-i18n.mjs` went from 10 stale warnings (exactly the 3 changed items per locale)
  to **0 warnings, 100% coverage on all eleven locales**, after `--update-hashes` for the ten
  non-English locales. The hash update is honest here: the translations carry the same proper-noun
  change, so nothing was marked current that had not actually been updated.
- `npm run build` passes.
- The built `/defi/` page and the island bundle carry `Walt`, `My Wallet`, `t.me/walt?startattach`
  and `mywallet.io/get`; `walt.jpg` and `mywallet.webp` ship to `dist`, and the two old images no
  longer do.
- The page was opened in a real browser: both rows render with the new names, and both new logos
  load (`naturalWidth` 320 and 400, `complete: true`) — a renamed row with a 404 logo would have
  looked fine in the HTML.
- `mytonwallet.io/get`, `mywallet.io/get`, `t.me/walt` and `t.me/wallet` were each requested to
  confirm where they land; `t.me/walt` and `t.me/wallet` both currently return "Walt (ex. Wallet)".

### Follow-ups

- `tutorials-staking-3.png` needs retaking: it shows the wallet-connect dialog with the old
  MyTonWallet branding, and its alt text is pinned to that until it is replaced.
- Gram Wallet gets a row once it ships and is confirmed to display hGRAM.
- `public/llms.txt` was checked and needs nothing — it never named either wallet.
