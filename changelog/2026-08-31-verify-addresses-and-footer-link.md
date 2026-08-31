# 2026-08-31 — Raw addresses on /verify/, and a footer link that reaches it

Two small changes, both blocking an outreach campaign.

`/verify/` (added 2026-08-29, see that day's
[report](2026-08-29-verify-and-vs-pages.md)) listed our two wallets by their TON
DNS name only. That is the one identifier a recipient of an on-chain message
cannot check: their wallet shows them `UQCSlnhR…`, not `hipo.ton`, so someone
who tries to verify us by searching what they were actually shown finds nothing
on the page that matches. Both wallets now print their raw address.

And the page itself was unreachable by navigation — it existed only for people
who already had the link, which is the opposite of who needs it. It is now in
the site footer on every page, in every locale, including the docs.

## Commits

| Commit | Description                                                             |
| ------ | ----------------------------------------------------------------------- |
| (this) | Print the raw wallet addresses on /verify/, and link it from the footer |

## What changed

### Both address forms, derived rather than written down

`src/pages/verify.astro` now carries one string per wallet — the `UQ…` form —
and derives the pair at build time with `Address.parse(…).toString({ urlSafe:
true, bounceable: <bool> })` from `@ton/core`:

```
hipo.ton         UQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt6UI
                 EQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt_jN
hipofinance.ton  UQA-_KVxC_rkwmACpXDChgb0tkpHH2ZfYNXcSnT6afMgoX-O
                 EQA-_KVxC_rkwmACpXDChgb0tkpHH2ZfYNXcSnT6afMgoSJL
```

Both forms are printed because explorers disagree about which to show, and a
person checking us pastes whichever one they were handed. They encode the same
account and differ only in the bounceable flag — and therefore in the trailing
checksum, which is exactly the part a human cannot eyeball. Writing the second
string out by hand would have been four hand-copied checksum characters per
wallet with no way to notice a mistake; a wrong address on this page is worse
than no address at all, since the whole page is a claim to authority. Deriving
it makes a wrong character impossible to introduce.

`@ton/core` here is a frontmatter import, so it runs at build time only: the
page's client bundle is 71 bytes (the shared copy module) and contains no `@ton`
reference. This is the same package `chain.ts` already depends on, so it adds
nothing to `package.json`. Note that the dApp's rule about never importing the
`@ton/ton` barrel does not apply — `@ton/core` is the ESM package the rule
points _at_.

The rendered address is a `<code>` with `select-all` (one tap takes the whole
string on a phone, where it has wrapped) and `break-all` (it wraps inside the
card instead of widening the page). It is written with `set:text` rather than as
element content: prettier reformats a long line and would leave the formatted-in
newline and indentation inside the text node, where `select-all` picks it up.
With `set:text` the text node is exactly the address.

A short note under the list explains that `UQ…` and `EQ…` are the same account,
so that seeing the same wallet twice does not itself look suspicious.

### The copy button reuses the existing clipboard module

`src/scripts/anchor-copy.ts` already carried the clipboard core — an async
`clipboard.writeText` with a `document.execCommand` fallback for non-secure
contexts, plus the `is-copied` flash — but only for `a[data-anchor-copy]`, where
what gets copied is the link's own URL. It now also handles any element with
`data-copy-text`, which copies that attribute's literal value. No new copy
mechanism was written; the second selector is eight lines in the same handler.

The button's markup mirrors the dApp's `CopyField` (`MultisigGuidance.tsx`) —
same `bg-border` / `hover:bg-border-strong` pill, same lucide `copy` → `check`
swap — with the icon paths hand-written, as `ShellIcon.astro` does, because an
Astro page cannot import a React icon. The swap is CSS on the `is-copied` class
rather than JS, so the script stays generic.

### The footer link

`src/components/SiteFooter.astro` gets a `Verify` entry in the Docs column,
between FAQ and Help & support. Its `href` is a plain `/verify/`, deliberately
**not** `localizedPath(…)`: the page is English-only with no `[locale]` twin, so
`/fa/verify/` would 404.

### The docs needed their own override

Starlight renders its own footer, so `SiteFooter.astro` never runs under
`/docs/` — which is 430 of the site's 512 real pages, and includes
`phishing-awareness-and-prevention`, the page a worried reader is most likely to
already be on. A new `src/components/starlight/Footer.astro` renders Starlight's
default footer and appends the link, wired in `astro.config.mjs` alongside the
four overrides already there. It reads its label from the same gated `site`
catalog the site footer uses rather than adding a key to the Starlight i18n
collection (`src/content/i18n/<lang>.json`), so the string has one home.

### The label stays English in every locale

`site.footer.verify` was added to all ten `src/i18n/<locale>/site.json` files
with the value `"Verify"` — the English string in the non-English catalogs too,
which is what makes the `check-i18n` gate pass without a special case: the key
is present everywhere, so nothing is missing, and `--update-hashes` recorded it
as translated-but-unreviewed like every other item.

This is more than a gate workaround. `/verify/` is English-only, and a Persian
or Turkish label would promise a localized page that does not exist. An English
word in an otherwise translated footer is the honest signal about where the link
goes. If `/verify/` ever gains `[locale]` twins, translating the label is a
one-line change per catalog and should happen in the same pass.

### Declined

- **Linking the wallet addresses to tonviewer**, the way the Contracts section
  below does. On the contracts the useful action is "go look at it"; on the
  wallets it is "compare this against what my wallet is showing me", which wants
  copy, not navigation. Sending someone to an explorer they did not choose also
  sits badly on a page about not trusting links you were handed.
- **Adding the link to `/404.astro`.** That page has no footer at all, by an
  earlier decision, and giving it one is not this change.

## Verification performed

- **Derived EQ forms, checked against tonviewer's own API** (`tonapi.io/v2`, the
  backend tonviewer reads). Each `EQ…` string was queried directly, so its
  checksum had to be accepted by the API before it would resolve at all:

  | DNS name          | Printed `UQ…`                                      | Derived `EQ…`                                      | API `address` (raw)                                                  | `name` reported   | `is_scam` |
  | ----------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------- | ----------------- | --------- |
  | `hipo.ton`        | `UQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt6UI` | `EQCSlnhRIHYCAlt1FoQVlBHzxmaQOMj9Efu80DwoggSlt_jN` | `0:92967851207602025b751684159411f3c6669038c8fd11fbbcd03c288204a5b7` | `hipo.ton`        | `false`   |
  | `hipofinance.ton` | `UQA-_KVxC_rkwmACpXDChgb0tkpHH2ZfYNXcSnT6afMgoX-O` | `EQA-_KVxC_rkwmACpXDChgb0tkpHH2ZfYNXcSnT6afMgoSJL` | `0:3efca5710bfae4c26002a570c28606f4b64a471f665f60d5dc4a74fa69f320a1` | `hipofinance.ton` | `false`   |

  Both forms of each wallet resolve to the same raw account, and the API returns
  the expected DNS name for it — which independently confirms the name → address
  mapping in the source, not just the encoding. Both are active `wallet_v5r1`
  accounts and neither is flagged.

- **The rendered text nodes are exactly the addresses** — the four `<code>`
  elements in `dist/verify/index.html` extracted and compared: no leading or
  trailing whitespace, so a `select-all` copy matches the button's.

- **No chain code in the client bundle** — `/verify/` loads one 71-byte page
  script, and `grep` for `@ton` / `Address` across it returns nothing.

- **The footer link renders in every locale.** All ten locale roots
  (`/`, `/fa/`, `/ru/`, `/ar/`, `/de/`, `/hi/`, `/tr/`, `/it/`, `/id/`,
  `/pt-br/`) carry exactly one `href="/verify/"`, as do the spot-checked
  `/faq/`, `/hpo/`, `/stake/`, `/stats/`, `/vs/` and their `fa` twins. Across
  the whole build, **512 of 554 emitted HTML files** contain the link. The 42
  that do not are all non-pages: 40 meta-refresh redirect stubs for the docs
  URLs the 2026-08 restructure merged away (4 paths × 10 locales, `noindex`),
  the `/app/` legacy stub, and `404.html`, which has no footer.

- **The docs footer** was checked per locale on
  `…/docs/security/phishing-awareness-and-prevention/`: all ten render
  `<p class="hipo-verify …"><a href="/verify/">Verify</a></p>`.

- `node scripts/check-i18n.mjs` — exits 0. Coverage stays 100.0 % (586/586) for
  all nine released locales, with 0 missing, 0 stale, 0 untracked, 0 extra. The
  nine warnings are the pre-existing whole-catalog "not yet reviewed by a native
  speaker" notices, unchanged in kind.
- `node --experimental-strip-types scripts/i18n-selftest.mjs` — 17 groups passed.
- `npm run build` — 514 pages, clean.
- `npx prettier --write` on every touched file.

## Follow-ups

- The copy button's success state has not been exercised in a browser; it is CSS
  on a class the shared module already sets for the anchor icons, but a click
  test on `/verify/` is worth a minute before the campaign goes out.
- `/verify/` is still English-only. If the campaign runs in other languages, the
  page — not just the footer label — is what needs translating, and the footer
  label should switch to `localizedPath` in the same pass.
- The contract addresses in the section below are still single-form `EQ…`
  strings written by hand, matching `contracts-and-audits.md` and the SDK
  `Constants`. Deriving their `UQ…` twins the same way would be consistent, but
  it changes a list that is deliberately kept byte-identical across three
  places; left alone on purpose.
