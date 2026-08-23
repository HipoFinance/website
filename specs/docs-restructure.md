# Docs restructure — sidebar re-grouping, five new pages, `/docs/` as a hub

**Status:** approved (2026-08-24; all eight open questions at their defaults; English-only per the standing decision)

## Goal

Turn `/docs/` from a GitBook import — 40 pages in 12 top-level groups, ordered by the shape of the old
GitBook site rather than by what a reader needs — into 42 pages in 9 groups that follow the reader's path
(understand → use → tokens & governance → verify → build → fund → archive → legal → brand), retire the
duplicate pages the content review found, date and quarantine the nine dead-or-paused programme pages, add
the five pages the docs have never had (**Fees & Gas**, **Risks**, **Contracts & Audits**, **Glossary**,
**Staking Without the App**), and rewrite `index.md` — today an image, two sentences, a video and not one
link — as the hub that routes a newcomer into all of it.

This is **batch 2** of the three agreed content batches. Batch 1 (`specs/faq-restructure.md`, implemented
2026-08-23) restructured `/faq/` and the HPO FAQ; batch 3 (the docs formatting sweep — alt text, `<br>` and
`<sub>` run-ons, escaped asterisks, heading levels, `.rar` → `.zip`) is a separate later spec. The source of
truth for what any page _says_ is `specs/content-accuracy-fixes.md` (applied and committed 2026-08-23); its
canonical sentences **CS-1…CS-8** are reused here by reference, never restated in a new form.

## Context

### The sidebar today

Declared explicitly in `astro.config.mjs` (`docsSidebar`, lines 12–150) — 12 top-level entries, 40 pages:

```
💡 Introduction
   🦛 Hipo Liquid Staking Protocol              /docs/
   🚰 Liquid Staking (group)
      🚰 Liquid Staking                         /docs/introduction/liquid-staking/
      💎 Why TON?                               /docs/introduction/liquid-staking/why-ton/
   ⚙️ How Does Hipo Work? (group)
      ⚙️ How Does Hipo Work?                    /docs/introduction/how-does-hipo-work/
      🔒 Stake GRAM                             …/how-does-hipo-work/stake-gram/
      🔁 Get hGRAM                              …/how-does-hipo-work/get-hgram/
      🔑 Unstaking                              …/how-does-hipo-work/unstaking/
      💻 Validators                             …/how-does-hipo-work/validators/
   🔥 Advantages of Hipo                        /docs/introduction/advantages-of-hipo/
   🎁 Hipo Rewards                              /docs/introduction/hipo-rewards/
   📈 Hipo Stats                                /docs/introduction/hipo-stats/
   📊 Hipo on Dune                              /docs/introduction/hipo-on-dune/
💰 Hipo Fund            Hipo Fund · Quarterly Report: August 1, 2025 · Quarterly Report: December 18, 2025
🛡️ Security             Why Your Security Matters? · Phishing Awareness and Prevention
📚 Tutorials            🔐 Staking · 🔓 Unstaking
🪙 Hipo Tokens
   💧 Hipo Staked GRAM (hGRAM) (group)          hGRAM · ▶️ hGRAM Use Cases
   💎 Hipo Governance Token (HPO) (group)       HPO · 🏦 Tokenomics · 🚛 HPO Tokens Distribution
🗳️ DAO · 💲 Profit Sharing                      (top-level singletons)
🎁 Giveaways & Prizes   🛍️ Incentive Programs · 💹 TVL Milestones · ⭐ Hipo Club (group: Club · S2 · S3)
                        · 🎩 Hipo Gang (group: Gang · S1) · 🖼️ Hipo NFTs · 💲 $1,000,000 Rewards Program
😎 Hipo Ambassadors Program                     (top-level singleton)
📜 Legal Agreements     📄 Terms of Use · 🔏 Privacy Policy
🤖 Hipo MCP Server · 🎨 Brand Kit               (top-level singletons)
```

A parallel batch (`specs/hipo-fund-onchain-reports.md`) added one more page and sidebar entry while this spec
was being written: `src/content/docs/hipo-fund/quarterly-report-august-24-2026.md`, labelled
`Quarterly Report: August 24, 2026`, at the end of the `💰 Hipo Fund` group, plus its
`src/i18n/en/docs-sidebar.json` key. **This spec does not create that entry** — it only carries it into the
target tree so the two batches do not fight over the group. Re-read `astro.config.mjs` before editing, in case
that batch is still moving.

### The problems (content review, Part D)

- The newcomer → staker path is buried: Hipo Fund sits between "what is Hipo" and the tutorials, and the two
  tutorials are sidebar entries 20–21.
- Nine of forty pages are dead or paused programmes plus three point-in-time fund reports, none dated in the
  sidebar, several written in present or future tense.
- Six groups repeat their own label as their first child (`Liquid Staking › Liquid Staking`).
- Three top-level singletons (DAO, Profit Sharing, Ambassadors) plus the MCP page sit between Legal and Brand
  Kit for no reason.
- Duplicates: `how-does-hipo-work/get-hgram.md` ≡ `hipo-tokens/hipo-staked-gram-hgram.md` (near word-for-word);
  `hipo-governance-token-hpo.md` ⊂ `tokenomics.md`; `why-ton.md` is three paragraphs that belong on the liquid
  staking page; `stake-gram.md` is three steps that belong on its parent.
- Emoji misfire: four different locks across stake/unstake/security, `▶️` on a page with no video, `🚛` for a
  token distribution, and three collisions (`🎁` Hipo Rewards vs Giveaways, `💲` Profit Sharing vs $1M
  programme, `💎` Why TON? vs HPO).
- Missing entirely: Fees, Risks, Contracts & Audits, Glossary, and a "stake without the app" page — the "d"
  deposit comment is documented only in the FAQ and the "w" unstake comment only in
  `introduction/how-does-hipo-work/unstaking.md:14-62`.
- `llms.txt` requires the five risks to be disclosed and forbids "risk-free"; the fee facts exist only in the
  FAQ; the ~12 terms a newcomer trips over (validation round, treasury, exchange rate, slashing penalty,
  governance fee, jetton, bill/SBT, borrower, TVL, APY, XP, TGE/ILO) are defined nowhere.

### i18n gate constraints

`node scripts/check-i18n.mjs` (prebuild) enumerates English docs by walking `src/content/docs` recursively,
skipping registry-locale directories, and pairs `docs/<rel>` with `<locale>/<rel>`; sidebar labels are
enumerated as `docs-sidebar/<key>` from `src/i18n/<locale>/docs-sidebar.json`. Every non-English locale is
`status: 'draft'` today, so **nothing in this batch can fail the gate**: for a draft locale, missing keys are
capped warnings and coverage numbers. Even for a released locale, a translated file whose English original was
deleted lands in `extra` and is reported by `warnings.push(...)` **outside** the `strict` branch — an orphan
twin is always a warning, never an error.

`astro.config.mjs` itself is stricter than the gate: `withSidebarTranslations` throws if
`src/i18n/en/docs-sidebar.json` and `docsSidebar` disagree on any label, in either direction. That check is
what keeps the two files 1:1 and it fires at build time, so every label edit here must land in both files.

**English only.** fa/ru/hi are `draft` and are synced after all three batches. Deleted and renamed English
docs mean the locale twins get moved or deleted in that later sync. **Do not touch anything under
`src/content/docs/fa/`, `ru/`, `hi/` or `src/i18n/fa|ru|hi/` in this batch**, and do not run
`--update-hashes`. Until then `check-i18n` prints `extra (not in English)` warnings for the four orphaned
twins per locale and coverage reads slightly low. That is expected and documented here.

### Inbound-link inventory

`grep -rn '<path>' src public` over every page this batch moves, merges or deletes. English + shared sources
only; fa/ru/hi copies are out of scope by the rule above.

| Path                                               | Inbound references (outside `docs-sidebar.json`)                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `…/liquid-staking/why-ton/`                        | none                                                                                                                              |
| `…/how-does-hipo-work/stake-gram/`                 | none                                                                                                                              |
| `…/how-does-hipo-work/get-hgram/`                  | none                                                                                                                              |
| `…/hipo-governance-token-hpo/tokenomics/`          | `src/components/Hpo.astro:14` (comment), `:60`; `src/content/prose/en/hpo-faq/03-how-many-hpo-exist-and-how-many-are-burned.md:8` |
| `…/hipo-governance-token-hpo/` (kept)              | `public/llms.txt:291`                                                                                                             |
| `…/how-does-hipo-work/unstaking/` (kept, trimmed)  | `src/content/prose/en/shell/unstake/cards/04-learn-more.md:6` ("including how to unstake without the app")                        |
| `…/hpo-tokens-distribution/` (kept)                | `src/content/docs/giveaways-and-prizes/hipo-nfts.md:30`                                                                           |
| `…/hipo-staked-gram-hgram/` (kept)                 | `src/content/docs/tutorials/staking.md:33`; `public/llms.txt:290`                                                                 |
| `…/hgram-use-cases/` (kept)                        | `src/content/prose/en/shell/defi/cards/05-wallets-with-hgram-and-hpo-support.md:6`                                                |
| `/docs/hipo-ambassadors-program/` (kept, archived) | `src/content/docs/giveaways-and-prizes/hipo-incentive-programs.md:60`                                                             |
| every other moved page                             | sidebar only — the move changes no URL                                                                                            |

Also inbound and unaffected (their URLs do not change): `/docs/` , `/docs/introduction/how-does-hipo-work/`,
`…/validators/`, `…/advantages-of-hipo/`, `…/hipo-rewards/`, `…/hipo-stats/`, `…/hipo-on-dune/`, `/docs/dao/`,
`/docs/profit-sharing/`, `/docs/giveaways-and-prizes/hipo-club/`, `…/tvl-milestone-rewards/`,
`…/hipo-usd1-000-000-rewards-program/`, `…/hipo-nfts/`, `…/hipo-gang/`, `/docs/tutorials/{staking,unstaking}/`,
`/docs/hipo-mcp-server/`, `/docs/brand-kit/`, `/docs/legal-agreements/*`, `/docs/hipo-fund*`.

No file under `src/components/starlight/**` hardcodes a docs path or a sidebar label — `Header.astro` links
only `/faq/`, `/stats/`, `/stake/` through `localizedPath`, with labels from `src/content/i18n/<lang>.json`.
Nothing there changes.

### Link syntax constraint

`src/i18n/remark-localize-links.mjs` rewrites **only** mdast `link` and `definition` node URLs that start with
a single `/`, skipping `/docs/images/`, `/images/`, `/og/`, `/app/`, `/i18n/` and file-extension URLs. Raw
HTML `<a href>` inside Markdown is **not** rewritten. So every internal link on a new or edited docs page must
be a plain Markdown link to a root-relative path with a trailing slash — `[Fees & Gas](/docs/fees-and-gas/)`,
`[stake](/stake/)` — never `./x`, never `<a href>`.

## Approach

Order of operations, chosen so each step leaves the tree buildable and so the sidebar is edited exactly once:

1. **Merges and deletions first** (§ Merges). Four English pages are folded into their neighbours and deleted.
   Their translated twins stay on disk untouched; they become warnings until the locale sync.
2. **Then the five new pages** (§ New pages). Written English-only, each linking the FAQ answer that covers the
   same ground rather than restating it, and each obeying the `llms.txt` answer rules (no hardcoded APY, TVL,
   price or gas figures; no "risk-free"; no promise of instant native withdrawal).
3. **Then the sidebar move plus the emoji pass** — one edit to `docsSidebar` in `astro.config.mjs` and one to
   `src/i18n/en/docs-sidebar.json`, applied together because the config throws when they disagree.
4. **Then the hub** (`src/content/docs/index.md`), written last so it can link the final tree.
5. **Then the redirects and the inbound-link updates**, then `prettier`, then `npm run build`.

**Redirects.** GitHub Pages serves no server redirects, and `docs.hipo.finance` 301s legacy paths to
`hipo.finance/docs/<same path>` — so any URL that disappears here breaks a live inbound link. Verified against
the installed versions (astro 6.4.8, `@astrojs/starlight` 0.40.0):

- Starlight ~0.40 has **no** `redirects` option — its user-config schema does not contain the key.
- Astro's top-level `redirects` **does** work under `output: 'static'`. `core/routing/3xx.js:12-19` emits
  `<!doctype html><title>Redirecting to: …><meta http-equiv="refresh" content="0;url=…"><meta name="robots"
content="noindex"><link rel="canonical" href="…">` plus a body link, written to `dist/<from>/index.html`
  (`build.format` defaults to `'directory'`; redirect routes are treated exactly like pages by `getOutFolder`
  / `getOutFile`). `build.redirects` defaults to `true`.
- Redirect routes are **not** handed to integrations (`generate.js:316` only registers `route.type === 'page'`),
  so `@astrojs/sitemap` never lists them — and the emitted page already carries `noindex`.
- Keys need not correspond to any generated page. But a key that Starlight _still_ generates would produce two
  routes writing the same file and a `prerenderConflictBehavior: 'warn'` warning — so **only ever redirect a
  path that no longer exists**.
- With `trailingSlash: 'always'`, write **both** sides with a trailing slash: the match pattern is built with
  the trailing-slash rule, and the destination is normalised only when it matches an existing route key, so an
  unslashed destination would be emitted verbatim and cost a second GitHub Pages 301.

Preference is to keep URLs wherever the review allows, and it allows a lot: only four URLs disappear, all four
merges. Everything else — the Stats and Dune pages moving into Security & Transparency, the tutorials moving
into Using Hipo, the programme pages moving into Archive — is a sidebar move only, because the sidebar is
declared independently of the file paths. That decoupling is deliberate: after this batch, several file paths
(`introduction/hipo-stats.md` under `🛡️ Security & Transparency`, `giveaways-and-prizes/hipo-club.md` under
`🪙 Tokens & Governance`) no longer mirror their sidebar group. Renaming the files to match would cost four
more redirects and three locale-twin moves for no reader benefit.

**New pages get short top-level slugs** — `/docs/fees-and-gas/`, `/docs/risks/`, `/docs/contracts-and-audits/`,
`/docs/glossary/`, `/docs/staking-without-the-app/` — not paths under the GitBook-era folders. They are new,
so no legacy URL constrains them; short slugs survive future sidebar moves.

## Target sidebar

9 top-level entries, 42 pages (41 once the fund batch's 2026 report has landed, − 4 merged + 5 new). Every entry
carries a unique emoji; overview entries and dated sub-entries carry none, which is what distinguishes them.

```
💡 Start Here
   🦛 What is Hipo?                     /docs/                                                 rename + hub rewrite
   🚰 Liquid Staking                    /docs/introduction/liquid-staking/                     merge ← why-ton
   ⚙️ How Hipo Works                    /docs/introduction/how-does-hipo-work/                 rename, merge ← stake-gram
   💻 Validators & the Marketplace      …/how-does-hipo-work/validators/                       rename
   🔥 Why Hipo                          /docs/introduction/advantages-of-hipo/                 rename
   🎁 Rewards & APY                     /docs/introduction/hipo-rewards/                       rename
   📖 Glossary                          /docs/glossary/                                        NEW

📚 Using Hipo
   🔒 Stake GRAM                        /docs/tutorials/staking/                               move + rename
   🔓 Unstake hGRAM                     /docs/tutorials/unstaking/                             move + rename
   ⏳ How Unstaking Works               …/how-does-hipo-work/unstaking/                        move + rename + trim
   ✉️ Staking Without the App           /docs/staking-without-the-app/                         NEW
   ⛽ Fees & Gas                        /docs/fees-and-gas/                                    NEW
   ⚠️ Risks                             /docs/risks/                                           NEW
   🔄 hGRAM in DeFi                     …/hipo-staked-gram-hgram/hgram-use-cases/              move + rename

🪙 Tokens & Governance
   💧 hGRAM                             /docs/hipo-tokens/hipo-staked-gram-hgram/              rename (absorbs get-hgram)
   💎 HPO                               /docs/hipo-tokens/hipo-governance-token-hpo/           rename, merge ← tokenomics
   🥧 HPO Distribution & Wallets        …/hipo-governance-token-hpo/hpo-tokens-distribution/   rename
   🗳️ DAO                               /docs/dao/                                             move
   💲 Profit Sharing                    /docs/profit-sharing/                                  move
   ⭐ Hipo Club                         /docs/giveaways-and-prizes/hipo-club/                  move

🛡️ Security & Transparency
   🔐 Security Model                    /docs/security/why-your-security-matters/              rename
   🎣 Phishing Awareness                /docs/security/phishing-awareness-and-prevention/      rename
   🧾 Contracts & Audits                /docs/contracts-and-audits/                            NEW
   📈 Hipo Stats                        /docs/introduction/hipo-stats/                         move
   📊 Hipo on Dune                      /docs/introduction/hipo-on-dune/                       move

🛠️ Developers
   🤖 Hipo MCP Server                   /docs/hipo-mcp-server/                                 move

💰 Hipo Fund
   Overview                             /docs/hipo-fund/                                       relabel
   Quarterly Report: August 1, 2025     /docs/hipo-fund/quarterly-report-august-1-2025/        keep
   Quarterly Report: December 18, 2025  /docs/hipo-fund/quarterly-report-december-18-2025/     keep
   Quarterly Report: August 24, 2026    /docs/hipo-fund/quarterly-report-august-24-2026/       keep (fund batch)

🗄️ Archive: Past Programs
   Programs Overview                    …/giveaways-and-prizes/hipo-incentive-programs/        move + relabel
   💹 TVL Milestone Rewards (ended 2024) …/tvl-milestone-rewards/                              move + archive label
   🎩 Hipo Gang (ended 2025)   (group)
      Overview                          …/giveaways-and-prizes/hipo-gang/                      relabel
      Season 1 (2024–2025)              …/hipo-gang/hipo-gang-season-1/                        archive label
   🏅 Hipo Club Seasons        (group, no link)
      Season 2 (2025)                   …/hipo-club/hipo-club-season-2/                        move + archive label
      Season 3 (2025)                   …/hipo-club/hipo-club-season-3/                        move + archive label
   🖼️ Hipo NFTs (2024)                  …/giveaways-and-prizes/hipo-nfts/                      move + archive label
   💵 $1,000,000 Rewards Program (paused) …/hipo-usd1-000-000-rewards-program/                 move + archive label
   😎 Ambassadors Program (paused)      /docs/hipo-ambassadors-program/                        move + archive label

📜 Legal
   📄 Terms of Use                      /docs/legal-agreements/terms-of-use/                   keep
   🔏 Privacy Policy                    /docs/legal-agreements/privacy-policy/                 keep

🎨 Brand Kit                            /docs/brand-kit/                                       keep
```

### Emoji resolution

The four locks collapse to two used once each: `🔒` = stake, `🔓` = unstake, and `🔐` moves to Security Model
(`🔑` retires). The three collisions clear because the `🎁 Giveaways & Prizes` group becomes `🗄️ Archive`
(freeing `🎁` for Rewards & APY), `💎 Why TON?` is merged away (freeing `💎` for HPO), and the $1M programme
takes `💵` (freeing `💲` for Profit Sharing). `▶️` on a page with no video becomes `🔄`; `🚛` for a token
distribution becomes `🥧`; `⚠️` moves from Phishing (which takes the more literal `🎣`) to the Risks page.

### "Overview" first children

Six groups repeat their own label as their first child today. After the merges only two groups still have a
first child pointing at the group's own landing page — `💰 Hipo Fund` and `🎩 Hipo Gang (ended 2025)` — and
both children are relabelled plain **`Overview`**. The Archive group's first child is a status index for all
programmes, so it is labelled **`Programs Overview`**. These three labels carry no emoji, matching the
existing convention for the dated report and season entries. `🪙 Tokens & Governance` and
`🛡️ Security & Transparency` are flat groups with no landing page, so the question does not arise.

### `src/i18n/en/docs-sidebar.json` key changes

Keys are the entry's `link` for pages and `group:<English label>` for groups, so renaming a **group** removes
one key and adds another, while renaming a **page** only changes that key's value.

**Group keys removed (11):** `group:💡 Introduction` · `group:🚰 Liquid Staking` · `group:⚙️ How Does Hipo Work?`
· `group:🛡️ Security` · `group:📚 Tutorials` · `group:🪙 Hipo Tokens` ·
`group:💧 Hipo Staked GRAM (hGRAM)` · `group:💎 Hipo Governance Token (HPO)` · `group:🎁 Giveaways & Prizes` ·
`group:⭐ Hipo Club` · `group:🎩 Hipo Gang` · `group:📜 Legal Agreements`

**Group keys added (9):** `group:💡 Start Here` · `group:📚 Using Hipo` · `group:🪙 Tokens & Governance` ·
`group:🛡️ Security & Transparency` · `group:🛠️ Developers` · `group:🗄️ Archive: Past Programs` ·
`group:🎩 Hipo Gang (ended 2025)` · `group:🏅 Hipo Club Seasons` · `group:📜 Legal`
(`group:💰 Hipo Fund` is unchanged and stays.)

**Page keys removed (4)** — the merged pages:
`/docs/introduction/liquid-staking/why-ton/` · `/docs/introduction/how-does-hipo-work/stake-gram/` ·
`/docs/introduction/how-does-hipo-work/get-hgram/` · `/docs/hipo-tokens/hipo-governance-token-hpo/tokenomics/`

**Page keys added (5)** — the new pages:
`/docs/glossary/` · `/docs/staking-without-the-app/` · `/docs/fees-and-gas/` · `/docs/risks/` ·
`/docs/contracts-and-audits/`
(`/docs/hipo-fund/quarterly-report-august-24-2026/` was added by the fund batch, not here — carry it through
unchanged.)

**Page keys whose value changes (19):** `/docs/` · `…/liquid-staking/` · `…/how-does-hipo-work/` ·
`…/how-does-hipo-work/unstaking/` · `…/how-does-hipo-work/validators/` · `…/advantages-of-hipo/` ·
`…/hipo-rewards/` · `/docs/tutorials/staking/` · `/docs/tutorials/unstaking/` ·
`…/hipo-staked-gram-hgram/` · `…/hgram-use-cases/` · `…/hipo-governance-token-hpo/` ·
`…/hpo-tokens-distribution/` · `/docs/hipo-fund/` · `…/why-your-security-matters/` ·
`…/phishing-awareness-and-prevention/` · `…/hipo-incentive-programs/` · `…/tvl-milestone-rewards/` ·
`…/hipo-gang/` — plus the five dated archive entries (`…/hipo-gang-season-1/`, `…/hipo-club-season-2/`,
`…/hipo-club-season-3/`, `…/hipo-nfts/`, `…/hipo-usd1-000-000-rewards-program/`, `/docs/hipo-ambassadors-program/`).
`/docs/dao/`, `/docs/profit-sharing/`, `…/hipo-club/`, `/docs/hipo-mcp-server/`, `/docs/brand-kit/`,
`/docs/legal-agreements/*` and the two existing fund reports keep both key and value.

Net: 54 keys today → 52 keys after — 13 group keys → 10, 41 page keys → 42.
`withSidebarTranslations` verifies the 1:1 mapping at build time in both directions; `check-i18n` verifies it
per locale.

## Merges

Each merge deletes an English `.md` file. In every case the surviving page absorbs the content — no fact is
lost — and the disappearing URL gets an Astro redirect.

| #   | Deleted                                               | Absorbed into                                                                                                                                                                                                                                                                                                                                          | Redirect                                                                                   |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| M1  | `introduction/liquid-staking/why-ton.md`              | `introduction/liquid-staking.md`, appended as a `## Why TON?` section (the three reasons verbatim — the Telegram-roots wording was already corrected by the accuracy batch)                                                                                                                                                                            | `/docs/introduction/liquid-staking/why-ton/` → `/docs/introduction/liquid-staking/`        |
| M2  | `introduction/how-does-hipo-work/stake-gram.md`       | `introduction/how-does-hipo-work.md`, as a `## Staking, step by step` section; the figure moves with it; the walkthrough proper stays in the `/docs/tutorials/staking/` page, which this section links                                                                                                                                                 | `…/how-does-hipo-work/stake-gram/` → `/docs/introduction/how-does-hipo-work/`              |
| M3  | `introduction/how-does-hipo-work/get-hgram.md`        | nothing — it is a near word-for-word duplicate of `hipo-tokens/hipo-staked-gram-hgram.md`, which keeps the better text and its video. Its one unique sentence (per-round earnings visible in the app) is already there                                                                                                                                 | `…/how-does-hipo-work/get-hgram/` → `/docs/hipo-tokens/hipo-staked-gram-hgram/`            |
| M4  | `hipo-tokens/hipo-governance-token-hpo/tokenomics.md` | `hipo-tokens/hipo-governance-token-hpo.md` — the parent keeps the URL because `llms.txt:291` and the GitBook 301s point at it; it gains the tokenomics facts (name/ticker/standard/network/supply/address, Token Utility, Token Distribution + chart, Token Vesting + the dated Oct-2025 note, Burned So Far), and its own paragraph becomes the intro | `…/hipo-governance-token-hpo/tokenomics/` → `/docs/hipo-tokens/hipo-governance-token-hpo/` |

M4 leaves `hpo-tokens-distribution.md` a child of a page whose sidebar group is flat — that is fine, the URL is
unchanged and it is now a sibling entry (`🥧 HPO Distribution & Wallets`).

`introduction/how-does-hipo-work/unstaking.md` is **not** merged. It keeps its URL and its 4-step conceptual
explanation (lines 1–13); lines 14–62 (the "Unstaking hGRAM (Without Using the Hipo App)" block — DEX swaps,
the "w" command, the minter burn) move to the new Staking Without the App page and are replaced by one line
linking it.

## New pages

Full copy is drafted at implementation. What follows fixes each page's path, position, frontmatter and the
facts each section must carry, with the source for every fact. **No page may hardcode APY, TVL, price, holder
count or a gas amount** (`llms.txt:95`, `:157-159`, `:167`); live values are always a link to `/stats/` or a
pointer at the `get_treasury_fees` getter / the MCP `get_fees` tool. FAQ answers are **linked, never
restated** — the FAQ anchor is the file slug, e.g. `/faq/#what-does-it-cost-to-stake`.

### 1. Fees & Gas

- **File** `src/content/docs/fees-and-gas.md` → `/docs/fees-and-gas/`
- **Sidebar** `📚 Using Hipo`, 5th (after Staking Without the App)
- **title** `'Fees & Gas'`
- **description** `'What staking and unstaking with Hipo actually cost: no protocol cut of your stake, a governance fee currently at 0%, and a gas prepayment whose unused part is refunded.'`

| Section                                  | Facts                                                                                                                                                                                                                                                                                                                                      | Source                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `## Hipo takes no cut of your stake`     | (1) No protocol fee is taken from the staked amount. (2) The only protocol-level fee is the governance fee below. (3) Everything else attached to a transaction is network gas, not Hipo revenue.                                                                                                                                          | `llms.txt:145`; `advantages-of-hipo.md:12`                |
| `## The governance fee`                  | CS-8 verbatim: "a governance fee on validation rewards, set by the [Hipo DAO](/docs/dao/), currently 0%". Plus: it applies to validation rewards, not to the stake; any change goes through a DAO vote and is visible on-chain. Link `/docs/dao/`, `/faq/#does-hipo-take-a-cut-of-my-rewards`.                                             | CS-8; `faq/rewards/does-hipo-take-a-cut-of-my-rewards.md` |
| `## Gas prepayments and refunds`         | CS-7 verbatim, then the two flows: **deposit** — the prepayment rides on top of the staked amount and the unused part returns shortly after as a separate excess transfer; **unstake** — the prepayment rides with the token burn and little or none returns at request time, the remainder being paid out with the final GRAM withdrawal. | CS-7; `llms.txt:145-153`                                  |
| `## Reading your own numbers`            | A raw withdrawal payout slightly overstates the pure staking reward, because it carries the returned gas. To measure a real return, net all flows per cycle: (deposits sent − deposit refunds) vs (request-time refunds + withdrawal payout). Link `/rewards/`.                                                                            | `llms.txt:151-156`                                        |
| `## Where the current amounts come from` | (1) Never quote a fixed gas figure — network gas prices change. (2) The app shows the estimate before you confirm. (3) The authoritative source is the treasury's `get_treasury_fees` getter, also exposed as the MCP `get_fees` tool. Link `/stake/`, `/docs/hipo-mcp-server/`.                                                           | `llms.txt:157-159`                                        |
| `## Costs outside Hipo`                  | (1) A DEX swap costs the pool's fee plus price impact instead of Hipo's gas. (2) Rate comes from the pool, not the protocol. Link `/defi/`, `/docs/risks/`.                                                                                                                                                                                | `llms.txt:134-137`; `tutorials/unstaking.md:22`           |
| Closing links                            | `/faq/#what-does-it-cost-to-stake`, `/faq/#are-there-any-unstaking-fees`                                                                                                                                                                                                                                                                   | —                                                         |

### 2. Risks

- **File** `src/content/docs/risks.md` → `/docs/risks/`
- **Sidebar** `📚 Using Hipo`, 6th
- **title** `'Risks'`
- **description** `'The risks of staking GRAM with Hipo — smart contract, validator, liquidity, reward variability and phishing — and what the protocol does about each.'`

Opening line states plainly that staking and DeFi always involve risk and that Hipo does not guarantee
returns (`llms.txt:185`, `:274-276`) — the page must never contain "risk-free". Then one section per risk,
each: what it is → what Hipo does about it → what the reader can do.

| Section                         | Facts                                                                                                                                                                                                                                                                                                                                                                                                           | Source                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `## Smart contract risk`        | (1) Bugs or vulnerabilities may affect funds. (2) Mitigations: open source, four independent audits (CS-2), FunC + Blueprint with a public test suite. (3) Verify addresses yourself. Link `/docs/contracts-and-audits/`.                                                                                                                                                                                       | `llms.txt:177`, `:171-173`; CS-2; `why-your-security-matters.md:7-9` |
| `## Validator and staking risk` | (1) Rewards depend on validators participating correctly. (2) A borrowing validator locks collateral covering the maximum slashing penalty for the round plus the reward it promised; a penalty comes from that collateral, not from staked GRAM. (3) Underperformance still shows up as a lower reward that round. Link `…/how-does-hipo-work/validators/`, `/faq/#what-happens-if-a-validator-underperforms`. | `llms.txt:178`, `:183`; `validators.md:10`                           |
| `## Liquidity risk`             | (1) Instant unstake succeeds only when the protocol holds enough free GRAM; the app shows the maximum. (2) Full always goes through but settles after the round — up to ~36 h in the worst case. (3) A DEX exit depends on pool liquidity and carries price impact. Link `/unstake/`, `/defi/`, `/faq/#why-is-instant-unstaking-sometimes-unavailable`.                                                         | `llms.txt:130-132`, `:179`                                           |
| `## Reward variability`         | (1) APY changes over time with validator bids and network conditions. (2) No fixed return is promised. (3) Live figures live on `/stats/` — never in this page.                                                                                                                                                                                                                                                 | `llms.txt:167`, `:180`, `:274`                                       |
| `## Phishing risk`              | (1) Only official Hipo links; verify every wallet prompt. (2) The official channel list. Link `/docs/security/phishing-awareness-and-prevention/`, `/docs/contracts-and-audits/`.                                                                                                                                                                                                                               | `llms.txt:181`                                                       |
| `## What Hipo does not promise` | Three lines: no fixed returns, no risk-free staking, no instant native withdrawal in every case.                                                                                                                                                                                                                                                                                                                | `llms.txt:274-276`                                                   |
| Closing links                   | `/faq/#can-i-lose-my-funds`, `/faq/#is-hipo-safe`                                                                                                                                                                                                                                                                                                                                                               | —                                                                    |

### 3. Contracts & Audits

- **File** `src/content/docs/contracts-and-audits.md` → `/docs/contracts-and-audits/`
- **Sidebar** `🛡️ Security & Transparency`, 3rd
- **title** `'Contracts & Audits'`
- **description** `'Hipo's mainnet contract addresses, the four independent security audits, and where to read the source.'`

| Section                      | Facts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Source                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `## Mainnet addresses`       | Markdown table, three rows with Tonviewer links: **Treasury** (main contract, receives deposits, holds staked GRAM) `EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`; **Parent / jetton master (hGRAM)** `EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w` **with the caveat that the parent address can change on protocol upgrades and the contract repository README is the source of truth**; **HPO jetton** `EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM`. Anti-phishing line: verify against official Hipo sources before sending anything. | `llms.txt:207-211`, `:83`; `tokenomics.md:14`                    |
| `## Audits`                  | CS-2 verbatim — four independent audits: Quantstamp (April 2025) and ProgramCrafter (March 2024) on v2, TonTech and Daniil Sedov (October 2023) on v1 — plus the reports link `github.com/HipoFinance/audits`.                                                                                                                                                                                                                                                                                                                                            | CS-2; `llms.txt:173`                                             |
| `## Source code`             | (1) Contracts: `github.com/HipoFinance/contract`. (2) Written in FunC with Blueprint; the public test suite is runnable from that repo. (3) MCP server: `github.com/HipoFinance/mcp`, npm `@hipo-finance/mcp`, MIT.                                                                                                                                                                                                                                                                                                                                       | `llms.txt:171`, `:189`, `:204`; `why-your-security-matters.md:9` |
| `## What each contract does` | One line each: Treasury, Parent/minter, Wallet, Loan, Bill (non-transferable NFT/SBT issued when an operation cannot complete instantly), Collection, Librarian, Borrower application, Webapp.                                                                                                                                                                                                                                                                                                                                                            | `llms.txt:215-223`                                               |
| `## Technical documents`     | Four links: architecture, integration guide, `schema.tlb`, message-flow diagrams; plus `/docs/hipo-mcp-server/` for reading live state.                                                                                                                                                                                                                                                                                                                                                                                                                   | `llms.txt:193-199`                                               |
| Closing links                | `/faq/#has-hipo-been-audited`, `/faq/#where-can-i-verify-hipo-transactions`, `/docs/risks/`                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —                                                                |

### 4. Glossary

- **File** `src/content/docs/glossary.md` → `/docs/glossary/`
- **Sidebar** `💡 Start Here`, last
- **title** `'Glossary'`
- **description** `'One-line definitions of the terms used across the Hipo docs, app and FAQ.'`

One flat alphabetical list, `**Term** — one sentence.`, each linking the page that explains it in full. 17
entries, covering every term the review found undefined on first use:

| Term                   | Definition (one line)                                                                                                                                                                       | Source                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| APY                    | The annualised reward rate on staked GRAM; it varies — live figure on `/stats/`.                                                                                                            | `llms.txt:167`                                 |
| Bill (SBT)             | A non-transferable NFT the protocol issues when an operation cannot complete instantly, e.g. an unstake while funds are in a validation round.                                              | `llms.txt:219`                                 |
| Borrower               | A validator that borrows staked GRAM from Hipo for a validation round, posting collateral and paying the reward rate it bid.                                                                | `llms.txt:222`; `validators.md:7-8`            |
| Collateral             | The GRAM a borrowing validator locks, covering the maximum slashing penalty for the round plus the reward it promised.                                                                      | `validators.md:10`                             |
| DAO                    | The Hipo DAO — HPO holders voting on protocol decisions at ton.vote.                                                                                                                        | `llms.txt:87`; `dao.md`                        |
| Exchange rate          | How much GRAM one hGRAM redeems for; it rises as staking rewards settle.                                                                                                                    | `llms.txt:104`, `:109`                         |
| Full / Instant unstake | Full settles after the current validation round at the better rate and always goes through; Instant pays out immediately at a slightly lower rate when the protocol holds enough free GRAM. | `llms.txt:130-131`                             |
| Governance fee         | CS-8 — a governance fee on validation rewards, set by the Hipo DAO, currently 0%.                                                                                                           | CS-8                                           |
| GRAM                   | TON's native token, formerly Toncoin / TON.                                                                                                                                                 | `llms.txt:34`                                  |
| hGRAM                  | Hipo Staked Gram — the liquid staking token you receive for staking GRAM, formerly hTON.                                                                                                    | `llms.txt:35`, `:70`                           |
| Hipo Club              | The tiered programme whose level sets the HPO reward coefficient on the hGRAM you hold.                                                                                                     | `hipo-club.md:12`                              |
| HPO                    | CS-6 — Hipo's governance and profit-sharing token.                                                                                                                                          | CS-6; `llms.txt:81`                            |
| Jetton                 | TON's fungible-token standard (TEP-74); hGRAM and HPO are both jettons.                                                                                                                     | `tokenomics.md:11`                             |
| Liquid staking         | Staking that issues a transferable token representing the staked position, so it stays usable while it earns.                                                                               | `llms.txt:29`; `liquid-staking.md:7`           |
| Slashing penalty       | The penalty a validator can incur for failing its round; taken from the validator's collateral, not from staked GRAM.                                                                       | `validators.md:10`; `llms.txt:183`             |
| TGE / ILO              | HPO's token generation event, held on 25 November 2024 as an Initial Liquidity Offering — a launch directly on a DEX with no private round.                                                 | `prose/en/hpo-faq/04-when-did-hpo-launch.md:6` |
| Treasury               | Hipo's main smart contract: it holds deposited GRAM and lends it to borrowers.                                                                                                              | `llms.txt:215`, `:209`                         |
| TVL                    | Total value locked — the GRAM staked through Hipo; live figure on `/stats/`.                                                                                                                | `llms.txt:95`                                  |
| Validation round       | TON's ~18-hour cycle in which validators secure the network and earn rewards; stakes stay frozen ~9 hours after a round ends.                                                               | `llms.txt:132`                                 |
| XP                     | The activity score in Hipo Club, earned by staking and by the bot's tasks; it drives the seasonal level-up.                                                                                 | `hipo-club.md:27`                              |

### 5. Staking Without the App

- **File** `src/content/docs/staking-without-the-app.md` → `/docs/staking-without-the-app/`
- **Sidebar** `📚 Using Hipo`, 4th
- **title** `'Staking Without the App'`
- **description** `'Stake and unstake with Hipo using plain wallet transfers — for multisig, cold and other wallets that cannot sign dapp transactions.'`

This page consolidates the two halves that live apart today: the "d" deposit comment (only in
`prose/en/faq/staking/can-i-stake-with-a-multisig-or-cold-wallet.md`) and the "w" unstake comment plus the
minter burn (only in `introduction/how-does-hipo-work/unstaking.md:14-62`).

| Section                                   | Facts                                                                                                                                                                                                                                                                                                                                                        | Source                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `## When you need this`                   | (1) For wallets that cannot sign dapp transactions — multisig, some cold wallets. (2) Everyone else should use the app, which is cheaper and shows the estimate first. (3) When a multisig connects to the Hipo app, the app shows these instructions with the treasury address ready to copy. Link `/stake/`.                                               | FAQ multisig `:7-9`                                        |
| `## Stake — the "d" comment`              | (1) Send the GRAM you want to stake **plus 0.1 GRAM** as a gas prepayment to the treasury `EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`. (2) Text comment exactly `d`, lowercase, unencrypted. (3) CS-7 — the prepayment is generously rounded up; the unused part is refunded. (4) hGRAM is sent back to the same address. Link `/docs/fees-and-gas/`. | FAQ multisig `:7`; CS-7                                    |
| `## Unstake everything — the "w" comment` | (1) Send 0.1 GRAM to the same treasury address with the text comment `w`. (2) It unstakes the **entire** hGRAM balance of that wallet — there is no partial amount. (3) It settles under the normal protocol rules, so the Full-unstake timing applies. Link `/docs/introduction/how-does-hipo-work/unstaking/`, `/faq/#how-long-does-unstaking-take`.       | `how-does-hipo-work/unstaking.md:29-47`; FAQ multisig `:9` |
| `## Burn hGRAM via the minter`            | (1) `minter.ton.org` with the hGRAM master (Parent) address `EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w`. (2) You receive GRAM at the current redemption rate. (3) The parent address can change on protocol upgrades — check `/docs/contracts-and-audits/` first.                                                                                     | `how-does-hipo-work/unstaking.md:51-63`; `llms.txt:207`    |
| `## Or swap on a DEX`                     | Two lines: hGRAM pools exist on DeDust, STON.fi, TONCO, GroypFi and swap.coffee; swap fees and price impact apply. Link `/defi/`.                                                                                                                                                                                                                            | `llms.txt:134-137`                                         |
| `## Before you send`                      | (1) Verify the treasury address against `/docs/contracts-and-audits/` — never from a forwarded message. (2) The comment must be plain text, exactly `d` or `w`. (3) A transfer with no comment, or the wrong comment, is not a stake request. Link phishing page.                                                                                            | `llms.txt:181`; the treasury's comment handling            |
| Closing links                             | `/faq/#can-i-stake-with-a-multisig-or-cold-wallet`, `/docs/fees-and-gas/`                                                                                                                                                                                                                                                                                    | —                                                          |

### 6. Hub rewrite — `/docs/`

- **File** `src/content/docs/index.md` (rewrite in place; URL and frontmatter `title` unchanged so the h1 and
  the GitBook 301 target stay stable)
- **title** `'Hipo Liquid Staking Protocol'` (unchanged); **description** added:
  `'Documentation for Hipo, the liquid staking protocol on TON: how it works, how to stake and unstake, fees, risks, contracts and audits.'`
- **Sidebar label** `🦛 What is Hipo?`

Today the page is an image, two sentences, a video and zero links. The rewrite keeps the image and the video
and adds the routing. Plain Markdown throughout — link lists under `##` headings, plus Starlight's `:::note` /
`:::tip` asides, which this repo already uses in `.md` (`how-does-hipo-work.md:12`, `tokenomics.md:5`).
**No `<CardGrid>` / `<LinkCard>`:** those are MDX-only components, `@astrojs/mdx` is not installed, and every
page in the collection is `.md`.

| Section                     | Content                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Intro                       | The hero image, then the `llms.txt:231` answer to "What is Hipo?" in two sentences, then the existing video.          |
| `:::tip`                    | One line for the reader who only wants to act: stake at `/stake/`, unstake at `/unstake/`, live numbers at `/stats/`. |
| `## Start here`             | Liquid Staking · How Hipo Works · Validators & the Marketplace · Rewards & APY · Why Hipo — one clause each.          |
| `## Use Hipo`               | Stake GRAM · Unstake hGRAM · How Unstaking Works · Staking Without the App · Fees & Gas · Risks · hGRAM in DeFi.      |
| `## Tokens and governance`  | hGRAM · HPO · HPO Distribution & Wallets · DAO · Profit Sharing · Hipo Club.                                          |
| `## Verify for yourself`    | Contracts & Audits · Security Model · Phishing Awareness · Hipo Stats · Hipo on Dune.                                 |
| `## For developers`         | Hipo MCP Server · the contract repository · the architecture and integration documents (`llms.txt:193-196`).          |
| `## Still have a question?` | `/faq/` first, then the Glossary, then the Telegram and X links Starlight already shows in the header.                |

## Changes

### Deleted (English only — locale twins untouched, see i18n constraints)

1. `src/content/docs/introduction/liquid-staking/why-ton.md` (M1)
2. `src/content/docs/introduction/how-does-hipo-work/stake-gram.md` (M2)
3. `src/content/docs/introduction/how-does-hipo-work/get-hgram.md` (M3)
4. `src/content/docs/hipo-tokens/hipo-governance-token-hpo/tokenomics.md` (M4)

### Created

5. `src/content/docs/fees-and-gas.md`
6. `src/content/docs/risks.md`
7. `src/content/docs/contracts-and-audits.md`
8. `src/content/docs/glossary.md`
9. `src/content/docs/staking-without-the-app.md`

### Edited — docs

10. `src/content/docs/index.md` — full hub rewrite (§6).
11. `src/content/docs/introduction/liquid-staking.md` — absorbs M1 as `## Why TON?`.
12. `src/content/docs/introduction/how-does-hipo-work.md` — absorbs M2 as `## Staking, step by step`.
13. `src/content/docs/hipo-tokens/hipo-governance-token-hpo.md` — absorbs M4; keeps its own paragraph as the
    intro and its video.
14. `src/content/docs/introduction/how-does-hipo-work/unstaking.md` — delete lines 14–62; add one line:
    "Wallets that cannot sign dapp transactions can stake and unstake with plain transfers — see
    [Staking Without the App](/docs/staking-without-the-app/)."
15. `src/content/docs/introduction/advantages-of-hipo.md:12` — the "no cut / 0% governance fee" clause links
    `/docs/fees-and-gas/`.
16. `src/content/docs/security/why-your-security-matters.md` — the audits bullet links
    `/docs/contracts-and-audits/` instead of repeating the report URL; a closing line links `/docs/risks/`.
17. `src/content/docs/tutorials/staking.md` and `tutorials/unstaking.md` — one link each to
    `/docs/fees-and-gas/`; the unstaking tutorial also links `/docs/staking-without-the-app/`.

### Edited — inbound links found by the grep inventory

18. `src/components/Hpo.astro:60` — `tokenomicsDocs` target becomes
    `/docs/hipo-tokens/hipo-governance-token-hpo/`; update the explanatory comment at `:14` to the same path.
19. `src/content/prose/en/hpo-faq/03-how-many-hpo-exist-and-how-many-are-burned.md:8` — "tokenomics docs" link
    becomes `/docs/hipo-tokens/hipo-governance-token-hpo/`.
20. `src/content/prose/en/shell/unstake/cards/04-learn-more.md:6` — "including how to unstake without the app"
    now links `/docs/staking-without-the-app/` (the sentence's first link to
    `…/how-does-hipo-work/unstaking/` stays).

### Edited — FAQ prose (English only; twins in the later sync)

Minimal and explicit — three files, each gaining one link so the new pages are reachable from the FAQ. The
answers themselves are not rewritten; the new pages link _to_ the FAQ, not the other way round.

21. `src/content/prose/en/faq/staking/can-i-stake-with-a-multisig-or-cold-wallet.md` — closing sentence links
    `/docs/staking-without-the-app/` for the full procedure.
22. `src/content/prose/en/faq/staking/what-does-it-cost-to-stake.md` — links `/docs/fees-and-gas/`.
23. `src/content/prose/en/faq/security/can-i-lose-my-funds.md` — links `/docs/risks/`.

### Edited — configuration

24. `astro.config.mjs` — `docsSidebar` replaced with the target tree; the comment above it (currently
    "Sidebar order and labels mirror the GitBook site this section was imported from") is rewritten to say
    that the order is the reader path defined in `specs/docs-restructure.md` and that group order no longer
    mirrors file paths.
25. `astro.config.mjs` — a top-level `redirects` map with the four entries below (both sides slashed):

    ```js
    redirects: {
      '/docs/introduction/liquid-staking/why-ton/': '/docs/introduction/liquid-staking/',
      '/docs/introduction/how-does-hipo-work/stake-gram/': '/docs/introduction/how-does-hipo-work/',
      '/docs/introduction/how-does-hipo-work/get-hgram/': '/docs/hipo-tokens/hipo-staked-gram-hgram/',
      '/docs/hipo-tokens/hipo-governance-token-hpo/tokenomics/': '/docs/hipo-tokens/hipo-governance-token-hpo/',
    }
    ```

26. `src/i18n/en/docs-sidebar.json` — the key adds, removes and value changes listed under
    § `docs-sidebar.json key changes`. The `_comment` line stays as-is.

### Edited — `public/llms.txt`

27. Five entries appended to **Important links for LLMs**, keeping the existing order convention:
    `Fees and gas: https://hipo.finance/docs/fees-and-gas/` ·
    `Risks: https://hipo.finance/docs/risks/` ·
    `Contracts and audits: https://hipo.finance/docs/contracts-and-audits/` ·
    `Glossary: https://hipo.finance/docs/glossary/` ·
    `Staking without the app: https://hipo.finance/docs/staking-without-the-app/`.
    No existing `llms.txt` URL is removed — all twelve `/docs/…` links it carries survive the restructure.
    Bump `Last reviewed:` (`llms.txt:5`) to the implementation date.

### Changelog

28. `CHANGELOG.md` — one `## YYYY-MM-DD` heading, 3–5 one-line bullets, linking the report.
29. `changelog/YYYY-MM-DD-docs-restructure.md` — the detailed report, including the declined and deferred
    decisions from § Deferred and § Open questions.

## Acceptance criteria

1. `npm run build` exits 0. The `prebuild` gate (`node scripts/check-i18n.mjs`) exits 0 — every non-English
   locale is `draft`, so its output is warnings only; the four orphaned twins per locale appear as
   `extra (not in English)` warnings and are expected.
2. `npx prettier --check` passes on every file this batch touches (`.md`, `.mjs`, `.json`, `.astro`).
3. `astro.config.mjs`'s own `withSidebarTranslations` guard does not throw — i.e. `docsSidebar` and
   `src/i18n/en/docs-sidebar.json` agree on every label in both directions. This is what proves the labels
   match the keys 1:1; `check-i18n` re-checks it per locale.
4. Every URL that existed before this batch is still reachable in `dist/`: for each of the 41 pre-existing
   docs paths, `dist/<path>/index.html` exists — either as the real page or, for the four merged paths, as
   Astro's meta-refresh page. Verify with a loop over the four merged paths asserting the file exists and
   contains `http-equiv="refresh"`, `noindex`, and the correct destination.
5. `grep -rn "why-ton\|/stake-gram/\|/get-hgram/\|/tokenomics/" src public` returns only: the four
   `astro.config.mjs` redirect keys, and nothing else outside `src/content/docs/{fa,ru,hi}/` and
   `src/i18n/{fa,ru,hi}/` (whose hits are the untouched twins).
6. No dead sidebar entry: every `link` in `docsSidebar` resolves to an existing English `.md` under
   `src/content/docs/` (the Starlight build fails on a sidebar link with no page, so criterion 1 covers this —
   assert it explicitly anyway with a script that maps each link back to a file).
7. The sidebar renders 9 top-level entries and 42 pages, with no emoji used twice; overview and dated entries
   carry none.
8. A reviewer pass over the five new pages plus the hub against the `llms.txt` **LLM answer rules**
   (`llms.txt:261-276`) and **Avoid** list (`:54-60`): no hardcoded APY / TVL / price / holder / gas figure,
   no "risk-free", no unconditional instant-withdrawal claim, no investment advice, GRAM / TON / hGRAM / HPO /
   STON.fi naming per CS-5, and the Risks page explicitly discloses all five `llms.txt:177-181` risks.
9. Every internal link on a new or edited docs page is a plain Markdown link to a root-relative path with a
   trailing slash (the `remark-localize-links` constraint) — no `<a href>`, no relative path.
10. Local preview click-through: `/docs/` hub links all resolve; the four redirect pages land on the right
    page; `/docs/staking-without-the-app/` and `/docs/contracts-and-audits/` show the correct addresses.
11. `I18N_INCLUDE_DRAFTS=1 npm run build` also exits 0 — the draft locales still build with their unchanged
    (now stale) trees and their own sidebar catalogs; the four deleted English pages have no English sidebar
    entry, so the translated files simply stop being linked. Confirm no draft-locale route 500s.

## Risks & rollback

- **Sidebar/label desync.** The riskiest edit is the paired change to `docsSidebar` and `docs-sidebar.json` —
  12 group keys removed, 9 added, 19 values changed. Mitigation: the config throws on any mismatch, so the
  failure mode is a loud build error, not a silent wrong label. Rollback is a single-commit revert.
- **A merged page's URL was linked from somewhere off-site.** Mitigated by the four redirects; the `noindex`
  on the redirect page means the old URL drops out of the index while the link keeps working.
- **Locale drift.** Four English pages disappear while their fa/ru/hi twins stay on disk. Because every locale
  is `draft`, nothing breaks; but the twins must be deleted (M1–M4) and the merged content re-translated in the
  locale sync, or the sync will silently keep four orphan files per locale. This is recorded in § Follow-ups
  of the changelog report, not left to memory.
- **Collision with the fund-report batch.** Both batches edit `astro.config.mjs` and
  `src/i18n/en/docs-sidebar.json`. The fund report has already landed
  (`Quarterly Report: August 24, 2026`); re-read both files immediately before editing and keep its entry at
  the end of the `💰 Hipo Fund` group.
- **Search index.** Pagefind rebuilds from `dist/` at the end of `npm run build`, so the new pages are indexed
  automatically and the merged ones drop out. The redirect pages carry `noindex` but Pagefind indexes files,
  not robots directives — if the four meta-refresh stubs show up as search results, add
  `data-pagefind-ignore` handling or accept them (they are one-line pages that link the destination).

### Deferred

- **Batch 3 — the docs formatting sweep** (review D.4): `alt=""` on all 26 images, empty `<figcaption>`s,
  stray `<br>`, `\ <sub>` run-ons → tables, escaped-asterisk bold, `###`-first heading hierarchy, headings used
  as CTAs, bolded headings duplicating the title, `.rar` → `.zip`, the duplicate YouTube id on the two
  tutorials, `title="Hipo video"` iframes. Its own spec.
- **Splitting the April 2025 opening report out of `hipo-fund.md`** (review D.1) — belongs to
  `specs/hipo-fund-onchain-reports.md`, which owns that page.
- **Naming real integrations on `hgram-use-cases.md`** ("Minting Stablecoin" → the actual protocol) — content
  accuracy, not structure.
- **Legal review of `terms-of-use.md` / `privacy-policy.md`** (last updated 2023, predating HPO, the DAO, the
  Club, the TMA and the rename) — needs a lawyer, not this batch.
- **The current Hipo Club season page** (seasons stop at 3 / Nov 2025) — needs facts we do not have.
- **Per-locale redirects.** When fa/ru/hi are released, `/fa/docs/introduction/liquid-staking/why-ton/` and its
  siblings will 404. The locale sync must add the twelve locale-prefixed redirect entries alongside the four
  English ones.

## Decisions (2026-08-24)

All eight open questions at their defaults: dated parenthetical archive labels; Ambassadors archived, not
deleted; the single-child Developers group is created; the hub stays plain Markdown with asides; redirect
destinations carry no fragment; the `/docs/` sidebar label is "🦛 What is Hipo?"; the glossary closes the
Start Here group; the TGE date is stated after one confirmation against an official announcement.

## Open questions (with defaults)

1. **Archive label texts.** Default as written above: the status goes in parentheses after the name —
   `TVL Milestone Rewards (ended 2024)`, `Hipo Gang (ended 2025)`, `Hipo NFTs (2024)`,
   `$1,000,000 Rewards Program (paused)`, `Ambassadors Program (paused)`, `Season 2 (2025)`, `Season 3 (2025)`,
   `Season 1 (2024–2025)`. Years come from the pages' own dated notes (Gang ended 2025-02-25; TVL airdrop
   2024-12-09; NFT airdrop 2024-12-23; Club S2 Mar–Jun 2025, S3 Jul–Nov 2025). Alternative: put the status in
   the page body only and keep the sidebar clean — rejected, the whole point is that the sidebar carries no
   dates today. **Verify Season 1's span against `hipo-gang-season-1.md` at implementation.**
2. **Ambassadors — archive or delete?** Default: **archive**, not delete. It is linked from
   `hipo-incentive-programs.md:60`, it is "paused" rather than ended, and deleting it would add a fifth
   redirect and a fourth orphan twin per locale for no gain. If the programme is confirmed dead, deleting it in
   the batch-3 sweep is cheap.
3. **A `🛠️ Developers` group with one child.** Default: **yes, create it** — it matches the review's target,
   it names where developer content belongs, and the MCP page is the strongest page in the docs. The
   alternative (leave `🤖 Hipo MCP Server` as a top-level singleton) keeps the count at 8 groups but re-creates
   the "singletons scattered between Legal and Brand Kit" problem this batch is fixing. If a one-child group
   looks thin in the rendered sidebar, the fallback is to add the contract-repository links as a second entry
   later rather than to dissolve the group.
4. **Hub layout: Starlight components vs plain Markdown.** Default: **plain Markdown link lists plus `:::tip`
   asides.** `<CardGrid>` / `<LinkCard>` require `.mdx`; `@astrojs/mdx` is not a dependency, every one of the
   40 docs is `.md`, and `src/content.config.ts`'s `generateId` plus `check-i18n`'s `walk` both treat the tree
   as Markdown. Converting `index.md` to `index.mdx` for one page would add a dependency, a per-locale file
   extension divergence and an integration to the build for a visual nicety. Revisit only if the whole docs
   collection ever moves to MDX.
5. **Redirect destinations: with or without a fragment?** Default: **without.** `/docs/…/why-ton/` redirects to
   `/docs/introduction/liquid-staking/`, not `…/#why-ton`. Astro only normalises a destination that matches a
   known route, so a fragment would be emitted verbatim into both the meta refresh and the `<link rel=canonical>`;
   the merged page is short and its table of contents shows "Why TON?" anyway.
6. **Sidebar label for `/docs/`.** Default: `🦛 What is Hipo?` — it says what the page answers. Alternative:
   keep `🦛 Hipo Liquid Staking Protocol`. Either way the frontmatter `title` (the h1) does **not** change, so
   nothing SEO-visible moves.
7. **Glossary placement.** Default: last entry of `💡 Start Here`, where a newcomer meets it. Alternative: a
   `📖 Reference` group with Glossary + Brand Kit + Legal — rejected, it would take the group count to 10 and
   bury the glossary.
8. **TGE date in the glossary.** The 25 November 2024 / ILO / $0.02 facts are currently stated only in
   `prose/en/hpo-faq/04-when-did-hpo-launch.md:6`; the docs' `tokenomics.md` says "After TGE…" without a date.
   Default: state the date in the glossary and let the merged HPO page inherit it. Confirm the date once more
   against an official announcement before publishing.
