# 2026-10-01 — Keeper, and a retaken wallet-connect screenshot

Follow-on from the Walt / My Wallet rename earlier the same day. That change left one file carrying
the old names on purpose — the alt text of `tutorials-staking-3.png`, which described a screenshot
that still showed the old branding. The screenshot has now been retaken, which unblocked the alt
text and surfaced a third rebrand.

| Commit         | Subject                                                             |
| -------------- | ------------------------------------------------------------------- |
| (this session) | Retake the wallet-connect screenshot and rename Tonkeeper to Keeper |

## The screenshot

`public/docs/images/tutorials-staking-3.png` is a composed tutorial graphic, not a raw capture: a
pale gradient, the `hipo.finance` mark, a ② badge, a phone mockup, a speech bubble and a red
highlight around the dialog. Redrawing that by hand would have broken the series' look, so only the
phone's screen was replaced.

The phone body was measured out of the original at `x 348..624, y 138..629`, and the current connect
dialog was captured from a real browser at a phone viewport (420×820 at 2×) against a local preview,
with the promo banner dismissed first — its emoji has no glyph in the headless build and would have
shipped as a tofu box. The new screen is letterboxed into that rect on the phone's own dark colour
and clipped to its corner radius.

The old modal sat at y 330..587 inside the frame; the new one lands within a few pixels of that, so
**the original speech bubble and red highlight still point at the right thing and were left
untouched**. The bubble's text needed no change either — it reads "Connect your TON wallet", which
is still verbatim what TonConnect's own modal title says.

What the dialog now shows, and what the alt text in all eleven locales now says: **Gram Wallet,
Keeper, My Wallet**. Tonhub and DeWallet have dropped out of the top row. Each locale keeps its own
sentence frame and connectives; the three names stay Latin per `GLOSSARY.md`. The Turkish accusative
suffix moved from `DeWallet'ı` to `My Wallet'i`, because vowel harmony follows the new final word.

## Tonkeeper → Keeper

Tonkeeper rebranded to **Keeper** on 2026-09-15, alongside an expansion to seven chains. This was
not in the original request, and it was swept anyway for one reason: the screenshot being shipped in
this same change _shows_ "Keeper", and the prose two lines above it said "Tonkeeper". That is a
contradiction the change itself would have introduced.

37 occurrences across 25 files: the staking and unstaking tutorials in all eleven locales, two code
comments in `Model.ts`, one in `MultisigGuidance.tsx`, and the never-translate row in
`src/i18n/GLOSSARY.md`. `Tonhub` is a different wallet and was not touched.

**Two lowercase `tonkeeper` strings were deliberately left alone**, and the TonConnect wallets
registry is the evidence for both. It currently lists `name: "Keeper"` with `app_name: "tonkeeper"`,
and `name: "My Wallet"` with `app_name: "mytonwallet"` — the brands renamed, the wire identifiers did
not. So:

- `Model.ts:612`, the comment naming `'tonkeeper'` / `'mytonwallet'` as the app names reported for
  analytics, is still accurate and would have become wrong if "corrected".
- `Model.ts:234` refers to `tonkeeper/tongo`, a GitHub org path, which does not rename just because
  a product does.

A later pass swept the historical record too — `CHANGELOG.md`, `changelog/*.md`, `specs/*.md` —
because the owner asked for "Keeper" everywhere, this entry's exclusion included. The only place the
old name survives now is a sentence that names both the before and the after, such as this section's
own heading and opening line: rename those and they read as "Keeper rebranded to Keeper," which is
self-contradictory rather than historically accurate.

## Also

`/defi/` now lists My Wallet above Walt, as requested.

### Verification performed

- `node scripts/check-i18n.mjs`: 20 stale items → **0 warnings, 100% coverage on all eleven
  locales** after `--update-hashes` for the ten non-English locales.
- `npm run build` passes. The built English, Persian and Turkish staking pages carry the new alt
  text; the English body prose reads "including Keeper, Tonhub, and others"; the new 79 KB image
  ships to `dist`.
- The `/defi/` island bundle has `mywallet.webp` ahead of `walt.jpg`.
- Repo-wide grep for `Tonkeeper` returns only the sentences that describe the rename itself, and `Tonhub` survives
  untouched next to `Keeper` in every locale's staking tutorial.

### Follow-ups

- **The rest of the tutorial images are further out of date than this one was**, and the prose around
  them has already moved on. `tutorials-staking-1.png` still shows "TON balance", "hTON balance",
  "Stake TON and receive hTON" and a protocol fee of 6.25% — pre-rename, pre-0%-fee and pre-redesign.
  Nine images in total (five staking, four unstaking). The same capture-and-composite method works
  for them, but several need the app driven into particular states (an amount entered, a wallet
  confirm sheet), so they are left pending a decision rather than started.
- The `/defi/` prose card and the DeFi FAQ still name the two wallets in the old order ("Walt and My
  Wallet"). Only the app rows were reordered; changing the sentence order would be 33 files and
  another hash pass for a cosmetic gain.
