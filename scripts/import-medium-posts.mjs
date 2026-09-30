#!/usr/bin/env node
// One-time importer that pulls the Hipo blog posts out of a Medium "Download your information"
// export and writes them into this repository as the `blog` content collection. See
// specs/blog-migration.md, "Content migration".
//
//   node scripts/import-medium-posts.mjs <export-dir> [--out src/content/blog] [--only <slug>] [--force] [--image-cache <dir>]
//
// <export-dir> is the unzipped export's root (the directory that contains `posts/`). Each story is
// one `posts/<name>.html` file; draft filenames start with `draft_` and are skipped.
//
// Like scripts/import-gitbook-docs.mjs, this is kept for reference after the migration and is not
// re-run once posts have been hand-edited (see --force below).
//
// Hand edits made directly on Medium on 2026-09-30, after the 2026-09-29 export this importer was
// checked against, are NOT reflected in the export and so are not reproduced by this script: the
// Terra section and the "## Ethereum 2.0" -> "## Ethereum" rename in liquid-staking-token, the
// unbolded "h" fix in hgram-vs-gram-liquidity-pools' worked example, the "Hipo Application" link
// text in staking-on-ton, and the two trailing "submit what you have done" blocks dropped from
// hipo-ambassador-program. A re-import from a NEW export made after 2026-09-30 will pick these up
// on its own; a `--force` re-run from the OLD (2026-09-29) export would revert them.
//
// Further markup-only fixes made by hand on 2026-09-30, not reproduced by this script (visible text
// unchanged): `_..._` emphasis touching an emoji or an escaped bracket rewritten with `*` delimiters
// (or, where a `*` still can't flank next to the emoji, restructured without a literal bracket span)
// in hipo-gang-first-two-months; the two bare "Watch on YouTube" links in what-is-hipo-gang given
// their video's oEmbed title; "##" sub-points demoted to "###" under "Why Stake GRAM?" and "Why
// Choose Hipo…" in hton-renamed-to-hgram and under "Platforms Offering Liquid Staking Tokens" in
// liquid-staking-token; a run-on paragraph split at its hard line breaks (and its last bullet's
// trailing sentence moved out into its own paragraph) in hgram-vs-gram-liquidity-pools; the
// "See note in Results section" bullets turned into `\* See note in Results section` footnote
// paragraphs in gram-staking-benchmark-q1-2026; and a numbered list reconstructed from a run-on
// paragraph in why-we-launched-hipo-club.
//
// Written against a synthetic fixture, then checked against the real export (2026-09-29, 25
// published files: the 22 mapped stories plus three short responses, which are reported as unmapped
// and skipped). What the real export showed:
//   - h-entry, p-name, dt-published, p-canonical and the nested `section--body` sections are as
//     assumed. Each body section opens with a divider <hr>; the first one is hidden on Medium and
//     dropped here.
//   - The body repeats the title as `h3.graf--title`; there is never a `graf--subtitle`. Medium's
//     subtitle lives only in `<section data-field="subtitle">` — see mediumSubtitle().
//   - No Medium chrome (subscribe box, clap bar, author bio, "click to view image in full size") and
//     no "About Hipo" footer appear in the export; the chrome rules below are kept as insurance.
//   - No <table> and no mixtapeEmbed; two YouTube <iframe>s (in `figure.graf--iframe`).
//   - Images are on cdn-images-1.medium.com under `/max/800/`; `/max/2000/` returns the native size
//     (never an upscale). Many image ids have no file extension, so the extension comes from the
//     response's content-type.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import TurndownService from 'turndown'

// ---------------------------------------------------------------------------------------------
// Mapping (specs/blog-migration.md, "Mapping" table — copied exactly, 23 rows). `path` is the
// Medium path with the `https://medium.com/@hipofinance/` prefix stripped, as in the spec.
// Row 23's Medium path isn't known yet (the anniversary report is published 30 Oct); it's matched
// by title instead, and is meant to be imported on its own later with `--only hipo-3rd-anniversary-report`.
// ---------------------------------------------------------------------------------------------
const MAPPING = [
  {
    slug: 'gram-staking-benchmark-q2-2026',
    title: 'Comparing GRAM Staking Performance: Q2 2026',
    path: 'comparing-gram-staking-performance-45-day-on-chain-benchmark-q2-2026-432479caec00',
  },
  {
    slug: 'hton-renamed-to-hgram',
    title: 'Hipo Renames hTON to hGRAM',
    path: 'hipo-renames-hton-to-hgram-a-new-chapter-for-gram-staking-on-ton-7a021b9dd178',
  },
  {
    slug: 'gram-staking-benchmark-q1-2026',
    title: 'Benchmarking GRAM Staking Yields (Q1 2026)',
    path: 'benchmarking-ton-staking-yields-a-real-world-comparison-42e497afaab4',
  },
  {
    slug: 'hipo-2nd-anniversary-report',
    title: 'Hipo 2nd Anniversary Report',
    path: 'hipo-2nd-anniversary-report-building-sustainable-community-driven-defi-1abae215391c',
  },
  {
    slug: 'how-ton-can-grow',
    title: 'How TON Can Grow',
    path: 'how-ton-can-grow-the-obstacles-that-need-to-be-removed-b221f834b0d6',
  },
  {
    slug: 'why-we-launched-hpo-and-hipo-fund',
    title: 'Why We Launched HPO and Hipo Fund',
    path: 'why-we-launched-hpo-and-hipo-fund-aee9a5e05d53',
  },
  {
    slug: 'why-we-launched-hipo-club',
    title: 'Why We Launched Hipo Club',
    path: 'why-we-launched-hipo-club-what-we-learned-from-hipo-gang-and-hpo-99f3ba2f8261',
  },
  {
    slug: 'hipo-at-token2049-dubai-2025',
    title: 'Hipo at Token2049 Dubai',
    path: 'hipo-at-token2049-dubai-conversations-concerns-and-commitments-to-the-ton-ecosystem-79a214ae8fb7',
  },
  {
    slug: 'hpo-governance-token',
    title: 'The Hipo Governance Token, $HPO',
    path: 'the-hipo-governance-token-hpo-your-key-to-community-and-growth-eb091be85b2f',
  },
  {
    slug: 'hipo-1st-anniversary-report',
    title: 'Hipo Annual Report (year 1)',
    path: 'hipo-annual-report-a-year-of-growth-and-innovation-on-ton-blockchain-3399169667ed',
  },
  {
    slug: 'ton-validator-penalties',
    title: 'TON Validator Penalties',
    path: 'ton-validator-penalties-are-coming-what-it-means-for-hipo-stakers-3a1213ec5095',
  },
  {
    slug: 'what-is-hipo-gang',
    title: 'What is Hipo Gang?',
    path: 'what-is-hipo-gang-and-why-is-it-different-from-other-t2e-games-a39361102f71',
  },
  {
    slug: 'ton-blockchain-features',
    title: 'TON Blockchain: Features, Services, Earning',
    path: 'ton-blockchain-features-services-and-earning-opportunities-a9559f2cdb07',
  },
  {
    slug: 'staking-on-ton',
    title: 'Staking on TON Blockchain',
    path: 'staking-on-ton-blockchain-maximize-your-earnings-by-hipo-4a7613e472a3',
  },
  {
    slug: 'hipo-ambassador-program',
    title: 'Hipo Ambassador Program',
    path: 'hipo-ambassador-program-what-is-it-how-you-can-participate-01259b8e286c',
  },
  {
    slug: 'hgram-vs-gram-liquidity-pools',
    title: 'hGRAM vs GRAM in Liquidity Pools',
    path: 'why-should-you-choose-hton-over-ton-to-create-liquidity-pools-2546d93f31c4',
  },
  {
    slug: 'what-is-liquid-staking',
    title: 'Liquid Staking: Definition and Guide',
    path: 'liquid-staking-definition-and-guide-to-get-started-a5a4d6244a68',
  },
  {
    slug: 'what-is-staking',
    title: 'What is Staking and How Does it Work?',
    path: 'cryptocurrency-staking-what-is-it-and-how-does-it-work-54c0e9f21d80',
  },
  {
    slug: 'liquid-staking-token',
    title: 'Liquid Staking Token (LST)',
    path: 'liquid-staking-token-lst-what-is-it-and-how-does-it-work-20fcf72f1a8d',
  },
  {
    slug: 'blockchain-validators',
    title: 'Blockchain Validators',
    path: 'blockchain-validators-definition-roles-and-selection-factors-641f7404144d',
  },
  {
    slug: 'hipo-gang-first-two-months',
    title: 'Hipo Gang: A Two-Month Journey of Explosive Growth',
    path: 'hipo-gang-a-two-month-journey-of-explosive-growth-4023e82cfbac',
  },
  {
    slug: 'ton-vs-bitcoin',
    title: 'Could TON Be the Future Bitcoin?',
    path: 'could-ton-be-the-future-bitcoin-12-compelling-reasons-why-523e12d39ad6',
  },
  {
    slug: 'hipo-3rd-anniversary-report',
    title: 'Hipo at Three',
    path: null, // known only after the report is published on Medium (30 Oct) — matched by title
  },
]

// Hand-maintained metadata: seoTitle/description/subtitle written by the blog owner, keyed by slug
// (approved 2026-09-29). A missing description gets a TODO placeholder, which the schema rejects; a
// missing seoTitle is simply omitted (the page falls back to the title). `subtitle`: a string is used
// as-is; absent means "use the post's own Medium subtitle if it is a genuine one" (see
// mediumSubtitle()); `null` means "no subtitle", for posts whose Medium subtitle is genuine but stale.
// Shape: { seoTitle?: string, description?: string, subtitle?: string | null }
const META = {
  'gram-staking-benchmark-q2-2026': {
    seoTitle: 'GRAM Staking Benchmark Q2 2026: 4 Protocols, 45 Days',
    description:
      'We measured realized GRAM staking returns across Hipo, Tonstakers, Stakee and KTON over 45 days. Method, wallet and results are public.',
    subtitle:
      'Our second quarterly test: 100 GRAM in Hipo, Tonstakers, Stakee and KTON for 45 days, measured on-chain after fees.',
  },
  'hton-renamed-to-hgram': {
    seoTitle: 'hTON Is Now hGRAM: What Changed and What It Means for You',
    description:
      "Hipo's liquid staking token is now called hGRAM, following TON's rename of its coin to GRAM. What changed, and what it means for holders.",
  },
  'gram-staking-benchmark-q1-2026': {
    seoTitle: 'GRAM Staking Yields Compared: On-Chain Benchmark (Q1 2026)',
    description:
      '100 GRAM staked in six TON liquid staking protocols under identical conditions. Real returns, fees and withdrawal times, from a public wallet.',
    subtitle:
      'We staked 100 GRAM in six TON liquid staking protocols at the same time and measured what each one actually paid back.',
  },
  'hipo-2nd-anniversary-report': {
    seoTitle: 'Hipo 2nd Anniversary Report: Our Second Year on TON',
    description:
      "Hipo's second year of liquid staking on TON: the numbers, the launches, the $1M liquidity program, and lessons from building a community-driven protocol.",
  },
  'how-ton-can-grow': {
    description:
      'What is holding TON back, from wallet exclusivity to onboarding, seen from two years of building a liquid staking protocol on it.',
  },
  'why-we-launched-hpo-and-hipo-fund': {
    description:
      "Why Hipo created the HPO governance token and the Hipo Fund, what each one is for, and how they fit into the protocol's long-term plan.",
  },
  'why-we-launched-hipo-club': {
    seoTitle: 'Why We Launched Hipo Club: Lessons from Hipo Gang',
    description:
      'What Hipo Gang taught us about rewards, and why we replaced it with Hipo Club, a staking rewards program built around hGRAM and HPO.',
  },
  'hipo-at-token2049-dubai-2025': {
    seoTitle: 'Hipo at Token2049 Dubai 2025: What We Heard About TON',
    description:
      'Conversations, concerns and commitments from Token2049 Dubai 2025: what builders and investors told us about TON, and what Hipo is doing about it.',
  },
  'hpo-governance-token': {
    seoTitle: "HPO, Hipo's Governance Token: Utility and Tokenomics",
    description:
      'What HPO does: Hipo DAO votes, Hipo Club levels, profit sharing when a staking fee is charged, the borrower-fee buy-and-burn, and tokenomics.',
    subtitle:
      "Hipo's governance token: vote in the Hipo DAO, keep your Hipo Club level, and share protocol revenue when a staking fee is charged.",
  },
  'hipo-1st-anniversary-report': {
    seoTitle: 'Hipo 1st Anniversary Report: Our First Year on TON',
    description:
      "Hipo's first year of liquid staking on TON: how the protocol launched, how staking on it grew, and what we built next.",
  },
  'ton-validator-penalties': {
    seoTitle: 'How Hipo Protects GRAM Stakers from TON Validator Penalties',
    description:
      'TON penalizes underperforming validators. On Hipo, validators post collateral first, so penalties come from their stake, not yours.',
    subtitle:
      "TON began penalizing underperforming validators on 9 Sept 2024. How Hipo's collateral model protects stakers from those penalties.",
  },
  'what-is-hipo-gang': {
    seoTitle: "What Was Hipo Gang? Hipo's Tap-to-Earn Game on Telegram",
    description:
      "A record of Hipo Gang, Hipo's 2024 tap-to-earn game on Telegram: how it worked and how it differed from other T2E games. Now replaced by Hipo Club.",
    // Medium's subtitle still says "…where you can earn $HPO airdrops via a game" — present tense for
    // a game that has ended, contradicting the post's own update note and the description above.
    subtitle: null,
  },
  'ton-blockchain-features': {
    seoTitle: 'TON Blockchain Explained: Features, Services and GRAM',
    description:
      'An overview of the TON blockchain: how it works, its main services, and ways to earn with its native coin GRAM (formerly Toncoin).',
    subtitle: null,
  },
  'staking-on-ton': {
    seoTitle: 'How GRAM Staking Works on TON: Staking vs Liquid Staking',
    description:
      'How staking GRAM on TON works, how direct staking differs from liquid staking, and what to check before choosing a staking protocol.',
  },
  'hipo-ambassador-program': {
    seoTitle: 'Hipo Ambassador Program (Paused): How It Worked',
    description:
      'How the Hipo Ambassador Program worked and who it was for. The program is currently paused; follow @HipoFinance on Telegram for news.',
    // Medium's subtitle says "Hipo has just launched the Ambassador Program" — the program is paused.
    subtitle: null,
  },
  'hgram-vs-gram-liquidity-pools': {
    seoTitle: 'hGRAM vs GRAM in Liquidity Pools: Fees, Rewards and Risks',
    description:
      'Why pairing hGRAM instead of GRAM in a DEX pool adds staking rewards on top of trading fees, with a worked example and an honest look at impermanent loss.',
    // Medium's subtitle ends "Choose hTON." — the pre-rename token name.
    subtitle: null,
  },
  'what-is-liquid-staking': {
    seoTitle: 'What Is Liquid Staking? Benefits, Risks and How to Start',
    description:
      'Liquid staking explained: how liquid staking tokens work, the real benefits and risks, and examples on Ethereum, Solana, Cosmos and TON.',
  },
  'what-is-staking': {
    description:
      'Crypto staking explained: how proof-of-stake networks reward stakers, the risks involved, and how staking differs from liquid staking.',
    subtitle:
      'How proof-of-stake networks pay stakers for securing them, what the risks are, and how staking differs from liquid staking.',
  },
  'liquid-staking-token': {
    seoTitle: 'Liquid Staking Tokens (LSTs): What They Are, How They Work',
    description:
      'What a liquid staking token is, how its value tracks the staked coins and rewards, where you can use it, and the risks, with hGRAM as the example.',
  },
  'blockchain-validators': {
    seoTitle: 'Blockchain Validators: What They Do and How They Are Chosen',
    description:
      'What blockchain validators do, how proof-of-stake networks select them, and what happens when a validator goes offline or misbehaves.',
  },
  'hipo-gang-first-two-months': {
    seoTitle: "Hipo Gang's First Two Months: Growth Report (October 2024)",
    description:
      'A snapshot from October 2024: Hipo Gang reached 1.9M members, 383K connected wallets and $1.48M TVL in two months. Hipo Gang has since ended.',
  },
  'ton-vs-bitcoin': {
    seoTitle: 'TON vs Bitcoin: How the Two Blockchains Compare',
    description:
      "A 2024 comparison of TON and Bitcoin: design, speed, fees and use cases. TON's native coin is now called GRAM (formerly Toncoin).",
    subtitle: null,
  },
}

// Hand-written alt text for images Medium exported without one, keyed by `<slug>/<file>` (the file
// name the importer gives such an image, `<slug>-<n>.<ext>`). Written by looking at each image; an
// image missing both an alt here and in the export gets `TODO alt`, which the build rejects for the
// hero and the report lists for body images. Keys are checked at the end of the run: a key that
// matched no image fails the import, so a changed export can't silently orphan an alt text.
const ALT = {
  'gram-staking-benchmark-q2-2026/gram-staking-benchmark-q2-2026-1.jpeg':
    'Bar chart of GRAM staking APY: Hipo 16.7% (23.2% with HPO rewards), KTON 13.7%, Stakee 13.6%, Tonstakers 12.9%',
  'gram-staking-benchmark-q2-2026/gram-staking-benchmark-q2-2026-2.png':
    'Table of GRAM returned after 45 days from 100 staked: Hipo 101.9100, KTON 101.5850, Stakee 101.5800, Tonstakers 101.4950',
  'gram-staking-benchmark-q2-2026/gram-staking-benchmark-q2-2026-3.png':
    'Table of annualized APY: Hipo about 16.7%, KTON about 13.7%, Stakee about 13.6%, Tonstakers about 12.9%',
  'gram-staking-benchmark-q2-2026/gram-staking-benchmark-q2-2026-4.png':
    'Table: base staking reached a final value of 101.9100 (about 16.7% APY); base staking plus Level 1 HPO rewards reached 102.5901 (about 23.2% APY)',
  'gram-staking-benchmark-q2-2026/gram-staking-benchmark-q2-2026-5.png':
    'Table comparing the two benchmarks: #1 over about 6 days, Hipo 22.6% APY vs 16.3% for the best competitor; #2 over about 45 days, Hipo 16.7% vs 13.7%',
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-1.jpeg':
    'Bar chart of staking APY: Hipo 22.6% (35.7% with Level 10 HPO rewards), Tonstakers 16.3%, Stakee 15.9%, KTON 13.5%, Bemo 0.0%, Tonwhales 0.0%',
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-2.jpeg':
    'Wallet screenshot of the liquid staking tokens received: hTON (now hGRAM) 90.89, KTON 98.74, tsTON 91.06, bmTON 99.93, wsTON 91.27 and STAKED 91.61, each worth about $130',
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-3.jpeg':
    'Screenshots of the unstake screens of Hipo, Tonstakers, Stakee, KTON, Bemo and Tonwhales, each showing the amount of TON to be returned',
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-4.png':
    'Table of APY by protocol: Hipo about 22.6%, Tonstakers about 16.3%, Stakee about 15.9%, KTON about 13.5%, Bemo 0%*, TonWhales 0%*',
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-5.png':
    'Updated table of APY by protocol: Hipo about 22.6%, Tonstakers about 16.3%, Stakee about 15.9%, KTON about 13.5%, TonWhales about 9.4%, Bemo 0%*',
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-6.jpeg':
    'Updated bar chart of staking APY: Hipo 22.6% (35.7% with Level 10 HPO rewards), Tonstakers 16.3%, Stakee 15.9%, KTON 13.5%, Tonwhales 9.4%, Bemo 0.0%',
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-7.jpeg':
    "The Hipo app's Staking Rewards page for the benchmark wallet: a 1x (Level 1) reward rate, a Claim 7.7 HPO button and the daily TON and HPO rewards",
  'gram-staking-benchmark-q1-2026/gram-staking-benchmark-q1-2026-8.png':
    'Table: base staking only reached 100.3388 (about 22.6% APY); with 7.7 HPO at Level 1, 100.3725 (about 25.1%); with 77 HPO at Level 10, 100.5089 (about 35.7%)',
  'hipo-1st-anniversary-report/hipo-1st-anniversary-report-1.jpeg':
    "Hipo's first annual report in numbers: 1.52M TON ($7.69M) staked, 13.3K hTON (now hGRAM) holders, an hTON price of 1.0383 TON, over $20,000 in rewards distributed, and its products and partners",
  'hipo-1st-anniversary-report/hipo-1st-anniversary-report-2.png':
    'Telegram bot info for the Hipo App mini app, @HipoFinanceBot, showing 10,675 monthly users',
  'hipo-1st-anniversary-report/hipo-1st-anniversary-report-3.jpeg':
    'Three hippos in suits with crossed arms under a neon Hipo Gang sign',
  'hipo-1st-anniversary-report/hipo-1st-anniversary-report-4.png':
    'Hipo Finance listing on TON App, verified, rated 4.75 and badged #1 Staking in TON App',
  'hipo-1st-anniversary-report/hipo-1st-anniversary-report-5.png':
    "Hipo's NFT collections on Getgems, including Hipo x KINGY Heroes, Hipo Hard Rock, Hipo Community Champions, Hipo Early Testnet Tester, Hipo NFT Sun-Kissed and Hipo NFT Sunbathing Party",
  'hipo-2nd-anniversary-report/hipo-2nd-anniversary-report-2.jpeg':
    'Telegram Apps Center screenshots with Hipo App ranked first in both the Staking and Finance categories',
  'hipo-2nd-anniversary-report/hipo-2nd-anniversary-report-3.jpeg':
    'Three cartoon hippos playing tug of war on a beach',
  'hipo-2nd-anniversary-report/hipo-2nd-anniversary-report-4.jpeg':
    'Four cartoon hippo characters in suits, each inside a glowing colored ring',
  'hipo-2nd-anniversary-report/hipo-2nd-anniversary-report-5.jpeg':
    "The Hipo website's redesigned landing page, with a Stake Now button and a hippo piggy bank surrounded by coins",
  'hipo-2nd-anniversary-report/hipo-2nd-anniversary-report-6.jpeg':
    'An HPO coin in flames under the title HPO Tokens Burn',
  'hipo-at-token2049-dubai-2025/hipo-at-token2049-dubai-2025-1.jpeg':
    'The Hipo and Token2049 Dubai logos over the Dubai skyline at night',
  'hipo-gang-first-two-months/hipo-gang-first-two-months-1.png':
    'Hipo Gang two-month progress report, October 8, 2024: 1.9M users in 61 days, the features launched in each phase, 1.48M TON TVL, 9,001 hTON (now hGRAM) holders, 58K premium users, 383K connected wallets and community sizes',
  'hipo-gang-first-two-months/hipo-gang-first-two-months-2.png':
    'Chart of hTON (now hGRAM) holders rising from under 3,000 on September 25 to 9,041 on October 8, 2024',
  'how-ton-can-grow/how-ton-can-grow-2.jpeg':
    'Four DefiLlama charts of TVL against token price for Ethereum, Solana, Hyperliquid and TON',
  'how-ton-can-grow/how-ton-can-grow-3.jpeg':
    'Line chart of holders per TON liquid staking token, December 31 to October 14: tsTON grows from 93,294 to 111,246, hTON (now hGRAM) jumps from 3,960 to 28,253 in January and ends at 23,159, stTON slips from 19,177 to 18,016, and the others stay far lower',
  'hpo-governance-token/hpo-governance-token-1.jpeg':
    'A purple HPO coin with the title $HPO, The Hipo Governance Token',
  'hpo-governance-token/hpo-governance-token-2.jpeg':
    'Donut chart of HPO tokenomics: Community 30%, Liquidity 20%, Team 20%, Marketing 15%, Treasury 13%, Advisers 2%',
  'staking-on-ton/staking-on-ton-2.png':
    'TON blockchain benefits: high scalability, security for staked tokens, efficiency from its consensus, and a growing DeFi ecosystem',
  'staking-on-ton/staking-on-ton-3.png':
    'Advantages of the Hipo platform: competitive returns, transparency and collaboration, stake any amount, governance token rewards, community-driven evolution and decentralized validator selection',
  'ton-blockchain-features/ton-blockchain-features-1.jpeg': 'The TON logo above a diagram of four linked blocks',
  'ton-validator-penalties/ton-validator-penalties-2.jpeg':
    'Diagram of lending TON to validators on Hipo: the protocol lends TON to the validator offering the best return, the validator validates on the TON blockchain and earns staking rewards, then returns the TON plus rewards',
  'what-is-liquid-staking/what-is-liquid-staking-2.png':
    'Liquid staking benefits: flexibility, accessibility, diversification, enhanced yield opportunities, risk mitigation and decentralization',
  'what-is-staking/what-is-staking-3.png':
    '7 steps to start staking: choose your staking asset, select a staking platform, set up a wallet, deposit your tokens, initiate staking, monitor your rewards, and reinvest or withdraw them',
  'why-we-launched-hipo-club/why-we-launched-hipo-club-2.jpeg':
    'Charts of the HPO price in TON and in USDT, both rising toward the end of the period, to 0.005212 TON and 0.01739 USDT',
  'why-we-launched-hpo-and-hipo-fund/why-we-launched-hpo-and-hipo-fund-2.jpeg':
    'A money bag surrounded by Bitcoin, Tether, HPO and hTON coins above the title Hipo Fund',
}

// Copied from astro.config.mjs (DOCS_MERGE_REDIRECTS + DOCS_SECTION_REDIRECTS) — the GitBook-era
// path mapping used to check whether a docs.hipo.finance link now lives somewhere other than its
// naive /docs/<path>/ translation. Keep this in sync if that file's redirect tables change.
const DOCS_REDIRECTS = {
  '/docs/introduction/liquid-staking/why-ton/': '/docs/introduction/liquid-staking/',
  '/docs/introduction/how-does-hipo-work/stake-gram/': '/docs/introduction/how-does-hipo-work/',
  '/docs/introduction/how-does-hipo-work/get-hgram/': '/docs/hipo-tokens/hipo-staked-gram-hgram/',
  '/docs/hipo-tokens/hipo-governance-token-hpo/tokenomics/': '/docs/hipo-tokens/hipo-governance-token-hpo/',
  '/docs/introduction/': '/docs/',
  '/docs/tutorials/': '/docs/tutorials/staking/',
  '/docs/security/': '/docs/security/why-your-security-matters/',
  '/docs/legal-agreements/': '/docs/legal-agreements/terms-of-use/',
  '/docs/hipo-tokens/': '/docs/hipo-tokens/hipo-staked-gram-hgram/',
  '/docs/giveaways-and-prizes/': '/docs/giveaways-and-prizes/hipo-incentive-programs/',
  // Not in astro.config.mjs: GitBook-era paths the posts link to that predate the hTON -> hGRAM rename
  // (GitBook redirected them itself; the migrated docs only know the new paths).
  '/docs/hipo-tokens/hipo-staked-ton-hton/': '/docs/hipo-tokens/hipo-staked-gram-hgram/',
  '/docs/hipo-tokens/hipo-staked-ton-hton/hton-use-cases/': '/docs/hipo-tokens/hipo-staked-gram-hgram/hgram-use-cases/',
  '/docs/hipo-tokens/hpo/': '/docs/hipo-tokens/hipo-governance-token-hpo/',
}

// Every /docs/ link the importer writes must be a page that exists in src/content/docs/ (English is
// the root locale): a GitBook-era path that moved would otherwise ship as a 404. Checked loudly.
const DOCS_DIR = new URL('../src/content/docs/', import.meta.url)
function docsPageExists(docsPath) {
  const rel = docsPath.replace(/^\/docs\/?/, '').replace(/\/$/, '')
  if (rel === '') return existsSync(new URL('index.md', DOCS_DIR))
  return existsSync(new URL(`${rel}.md`, DOCS_DIR)) || existsSync(new URL(`${rel}/index.md`, DOCS_DIR))
}

const IMAGE_HOSTS = ['miro.medium.com', 'cdn-images-1.medium.com']
const usedAltKeys = new Set() // ALT keys that matched an image — any other key is an orphan (see main())

// ---------------------------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { exportDir: null, out: 'src/content/blog', only: null, force: false, imageCache: null }
  const rest = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--out') args.out = argv[++i]
    else if (a === '--only') args.only = argv[++i]
    else if (a === '--force') args.force = true
    else if (a === '--image-cache') args.imageCache = argv[++i]
    else rest.push(a)
  }
  args.exportDir = rest[0] ?? null
  if (!args.exportDir) {
    console.error(
      'Usage: node scripts/import-medium-posts.mjs <export-dir> [--out src/content/blog] [--only <slug>] [--force] [--image-cache <dir>]',
    )
    process.exit(1)
  }
  if (args.only && !MAPPING.some((m) => m.slug === args.only)) {
    console.error(`--only ${args.only}: not a slug in the mapping table`)
    process.exit(1)
  }
  return args
}

// ---------------------------------------------------------------------------------------------
// Field extraction (regex-based, on purpose: this is a one-time importer and the export's
// microformat markup is simple enough that a full DOM dependency isn't worth adding just for it —
// see how scripts/import-gitbook-docs.mjs does the same thing. Every extractor fails loudly with
// the file name when the structure it expects isn't there.)
// ---------------------------------------------------------------------------------------------

/** Find the first tag `<tagNames ...>` (any of tagNames) whose class attribute contains classToken,
 * and return {attrs, inner, outer}. `inner`/`outer` span to the FIRST closing tag of the same name —
 * there's no nested-same-tag awareness, which is fine for the flat elements this is used for (a, h1,
 * time, …) but wrong for <section>, which Medium nests; see extractBodySection() for that case. */
function findTagWithClass(html, tagNames, classToken) {
  const tagAlt = Array.isArray(tagNames) ? tagNames.join('|') : tagNames
  const openRe = new RegExp(`<(${tagAlt})\\b([^>]*)>`, 'gi')
  let m
  while ((m = openRe.exec(html))) {
    const attrsStr = m[2]
    const classMatch = attrsStr.match(/\bclass\s*=\s*"([^"]*)"/i)
    const classes = (classMatch?.[1] ?? '').split(/\s+/)
    if (!classes.includes(classToken)) continue
    const tag = m[1]
    const closeRe = new RegExp(`</${tag}\\s*>`, 'i')
    const closeMatch = html.slice(openRe.lastIndex).match(closeRe)
    if (!closeMatch) continue
    const inner = html.slice(openRe.lastIndex, openRe.lastIndex + closeMatch.index)
    return { attrs: parseAttrs(attrsStr), inner, outer: m[0] + inner + closeMatch[0] }
  }
  return null
}

function parseAttrs(attrsStr) {
  const attrs = {}
  const re = /([a-zA-Z0-9_-]+)\s*=\s*"([^"]*)"/g
  let m
  while ((m = re.exec(attrsStr))) attrs[m[1].toLowerCase()] = m[2]
  return attrs
}

const stripTags = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function fail(file, message) {
  throw new Error(`${file}: ${message} — refusing to guess, structure differs from the expected export markup.`)
}

function extractArticle(html, file) {
  if (!/<article\b[^>]*\bclass="[^"]*\bh-entry\b[^"]*"/i.test(html)) {
    fail(file, 'no <article class="h-entry"> found')
  }
}

function extractCanonical(html, file) {
  const found = findTagWithClass(html, 'a', 'p-canonical')
  if (!found?.attrs.href) fail(file, 'no <a class="p-canonical" href="…"> found')
  return found.attrs.href
}

// Returns the `YYYY-MM-DD` Medium published the post on, taken from the `datetime` attribute AS
// WRITTEN rather than via `new Date(...).toISOString()`. dt-published carries Medium's own offset
// (`Z` or `±HH:MM`); converting through Date and re-formatting normalizes to UTC, which can land on
// a different calendar day than the one Medium displays (e.g. a post published late in the evening
// in a timezone ahead of UTC). dt-published is always `YYYY-MM-DDTHH:MM:SS(.sss)?(Z|±HH:MM)`, so the
// date is simply its first 10 characters.
function extractPublished(html, file) {
  const found = findTagWithClass(html, 'time', 'dt-published')
  if (!found?.attrs.datetime) fail(file, 'no <time class="dt-published" datetime="…"> found')
  const datetime = found.attrs.datetime
  if (Number.isNaN(new Date(datetime).getTime())) fail(file, `dt-published datetime "${datetime}" doesn't parse`)
  const dateMatch = datetime.match(/^(\d{4}-\d{2}-\d{2})T/)
  if (!dateMatch) fail(file, `dt-published datetime "${datetime}" doesn't start with YYYY-MM-DDT…`)
  return dateMatch[1]
}

function extractTitle(html, file) {
  const h1 = findTagWithClass(html, 'h1', 'p-name')
  if (h1) return stripTags(h1.inner)
  const fallback = findTagWithClass(html, ['h1', 'h2', 'h3', 'h4', 'p'], 'graf--title')
  if (fallback) return stripTags(fallback.inner)
  fail(file, 'no <h1 class="p-name"> or *.graf--title element found for the title')
}

// Medium's own subtitle for the post: the export's `<section data-field="subtitle" class="p-summary">`.
// The real export (2026-09-29) never carries a `graf--subtitle` element in the body; this section is
// the only place a subtitle lives. It holds either the "preview subtitle" the author set in the story
// settings, or — when none was set — Medium's automatic excerpt of the body's opening, often cut off
// with "…". Only the former is a genuine subtitle, so the latter is rejected: text ending in "…", or
// text that appears verbatim in the body. Returns null when there is no genuine subtitle.
function mediumSubtitle(html, bodyHtml) {
  const m = html.match(/<section\b[^>]*\bdata-field="subtitle"[^>]*>([\s\S]*?)<\/section>/i)
  if (!m) return null
  const text = stripTags(m[1])
  if (!text || /(…|\.\.\.)$/.test(text)) return null
  const bodyText = stripTags(bodyHtml.replace(/<(p|h\d|li|blockquote|figcaption)\b/gi, ' <$1'))
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
  if (bodyText.includes(text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"'))) return null
  return text
}

// Medium wraps every "---" divider inside the body as its own nested <section class="section
// section--body">, so the outer <section data-field="body" class="e-content"> is not flat like the
// elements findTagWithClass() handles — its matching close tag has to be found by counting nested
// <section>/</section> opens and closes, not by taking the first </section>. A naive first-close
// match truncates the post at the first divider and silently drops everything after it.
function extractBodySection(html, file) {
  const openRe = /<section\b([^>]*)>/gi
  let openMatch = null
  let m
  while ((m = openRe.exec(html))) {
    const attrs = parseAttrs(m[1])
    const classes = (attrs.class ?? '').split(/\s+/)
    if (classes.includes('e-content')) {
      openMatch = m
      break
    }
  }
  if (!openMatch) fail(file, 'no <section data-field="body" class="e-content"> found')
  const attrs = parseAttrs(openMatch[1])
  if (attrs['data-field'] !== 'body') {
    fail(file, '<section class="e-content"> found but its data-field is not "body"')
  }

  const tagRe = /<(\/?)section\b[^>]*>/gi
  tagRe.lastIndex = openRe.lastIndex
  let depth = 1
  let closeStart = null
  while ((m = tagRe.exec(html))) {
    depth += m[1] === '/' ? -1 : 1
    if (depth === 0) {
      closeStart = m.index
      break
    }
  }
  if (closeStart === null) {
    fail(file, 'the body section has unbalanced <section> tags — no matching </section> for the e-content section')
  }

  const inner = html.slice(openRe.lastIndex, closeStart)
  if (!inner.trim()) fail(file, 'the body section is empty')
  return inner
}

// ---------------------------------------------------------------------------------------------
// Link rewriting
// ---------------------------------------------------------------------------------------------

/** Strip a Hipo Medium URL down to the bare path the mapping table uses, or null if it isn't one. */
function hipoMediumPath(href) {
  let m = href.match(/^https?:\/\/medium\.com\/@hipofinance\/([^/?#]+)/i)
  if (m) return m[1]
  m = href.match(/^https?:\/\/hipofinance\.medium\.com\/([^/?#]+)/i)
  if (m) return m[1]
  return null
}

/** `medium.com/p/<id>` links carry only the post id, which is the hex suffix of every mapped path. */
function hipoMediumPostId(href) {
  return href.match(/^https?:\/\/medium\.com\/p\/([0-9a-f]+)/i)?.[1]?.toLowerCase() ?? null
}

function buildLinkIndex(mapping) {
  const byPath = new Map()
  const byId = new Map()
  for (const row of mapping) {
    if (!row.path) continue
    byPath.set(row.path, row.slug)
    const id = row.path.split('-').pop()
    if (/^[0-9a-f]{8,}$/i.test(id)) byId.set(id.toLowerCase(), row.slug)
  }
  return { byPath, byId }
}

function rewriteDocsLink(href, report) {
  const m = href.match(/^https?:\/\/docs\.hipo\.finance(\/[^?#]*)?/i)
  if (!m) return null
  const rawPath = (m[1] ?? '/').replace(/\/?$/, '/')
  const naive = `/docs${rawPath}`
  const target = DOCS_REDIRECTS[naive] ?? naive
  if (!docsPageExists(target)) {
    throw new Error(`${href} -> ${target}: no such page in src/content/docs/ — add the right target to DOCS_REDIRECTS`)
  }
  report.docsLinks.push({ href, target })
  return target
}

// The old app's hash routes (`#/page/reward/` etc.) map onto the new app URLs; anything else,
// including the bare app root, is the stake page.
function rewriteAppLink(href, report) {
  if (!/^https?:\/\/app\.hipo\.finance/i.test(href)) return null
  const page = href.match(/#\/page[=/]([a-z]+)/i)?.[1]?.toLowerCase()
  const target = { reward: '/rewards/', unstake: '/unstake/', stats: '/stats/', defi: '/defi/' }[page] ?? '/stake/'
  report.appLinks.push({ href, target })
  return target
}

function rewriteLink(href, { linkIndex, report }) {
  if (!href || /^https?:\/\/t\.me\//i.test(href)) return href

  const path = hipoMediumPath(href)
  if (path) {
    const slug = linkIndex.byPath.get(path)
    if (slug) {
      report.internalLinks.push({ href, target: `/blog/${slug}/` })
      return `/blog/${slug}/`
    }
    report.unresolvedLinks.push(href)
    return href
  }

  const id = hipoMediumPostId(href)
  if (id) {
    const slug = linkIndex.byId.get(id)
    if (slug) {
      report.internalLinks.push({ href, target: `/blog/${slug}/` })
      return `/blog/${slug}/`
    }
    report.unresolvedLinks.push(href)
    return href
  }

  const docsTarget = rewriteDocsLink(href, report)
  if (docsTarget) return docsTarget

  const appTarget = rewriteAppLink(href, report)
  if (appTarget) return appTarget

  // The old HPO site 301s to /hpo/; link there directly rather than through the old subdomain.
  if (/^https?:\/\/hpo\.hipo\.finance(\/|$)/i.test(href)) {
    report.appLinks.push({ href, target: '/hpo/' })
    return '/hpo/'
  }

  return href
}

// ---------------------------------------------------------------------------------------------
// Images: download every miro.medium.com / cdn-images-1.medium.com image at full size, rewrite the
// body's <img> src to a relative path, before the body HTML is handed to turndown.
// ---------------------------------------------------------------------------------------------

const slugifyFilename = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image'

function fullSizeUrl(src) {
  // Medium serves any requested width up to the original's, so asking for something oversized gets
  // the native resolution back instead of an upscale. UNVERIFIED against a real export.
  return src.replace(/\/max\/\d+\//, '/max/2000/')
}

// The file extension comes from the response's content-type, not the URL: Medium's image ids often
// have no extension (`0*n672DtGW5DKvZWiO`), and the real export's PNGs saved under a guessed `.jpg`
// would carry a name that lies about their format.
const IMAGE_EXTENSIONS = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
function extFor(contentType, url, slug) {
  const ext = IMAGE_EXTENSIONS[contentType.split(';')[0].trim().toLowerCase()]
  if (!ext) fail(slug, `GET ${url} -> unsupported image content-type "${contentType}"`)
  return ext
}

// The page already renders `hero` above the post (see AppLayout equivalent for the blog), so the
// first image's <figure> (or the bare <img> when it isn't wrapped in one) must not also appear in
// the body — otherwise it shows twice. Find the tag enclosing [start, end) by nearest-preceding
// <figure> whose matching </figure> closes at or after `end`; same no-nesting assumption as the
// turndown 'figure' rule above (Medium doesn't nest figures).
function enclosingFigureSpan(html, start, end) {
  const figStart = html.lastIndexOf('<figure', start)
  if (figStart === -1) return null
  const closeTag = '</figure>'
  const closeIdx = html.indexOf(closeTag, figStart)
  if (closeIdx === -1 || closeIdx < end) return null
  return [figStart, closeIdx + closeTag.length]
}

function figcaptionText(figureHtml) {
  const m = figureHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)
  return m ? stripTags(m[1]) : ''
}

const IMAGE_FETCH_TIMEOUT_MS = 30000
const MAX_IMAGE_BYTES = 20 * 1024 * 1024 // 20 MB — defends against a mistaken/hostile oversized response

// Medium's CDN answers a burst of ~60 image requests with 429s. Retry those (and 5xx) a few times,
// honouring Retry-After, before giving up; any other status fails at once in the caller.
// --image-cache <dir>: keep every downloaded image as `<dir>/<Medium image id>` (plus a `.type` file
// holding its content-type) and serve re-runs from there, so re-running the import doesn't hit
// Medium's CDN again — which puts a Cloudflare challenge in front of it after a few full runs.
let imageCacheDir = null
function cachePaths(url) {
  const id = decodeURIComponent(new URL(url).pathname.split('/').pop())
  if (!/^[\w*.-]+$/.test(id)) return null
  const base = join(imageCacheDir, id.replace(/\*/g, '_'))
  return { data: base, type: `${base}.type` }
}
async function fetchImage(url) {
  const cached = imageCacheDir && cachePaths(url)
  if (cached && existsSync(cached.data) && existsSync(cached.type)) {
    const contentType = readFileSync(cached.type, 'utf8').trim()
    return new Response(readFileSync(cached.data), { headers: { 'content-type': contentType } })
  }
  const res = await fetchWithRetry(url)
  if (!cached || !res.ok) return res
  const bytes = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || ''
  writeFileSync(cached.data, bytes)
  writeFileSync(cached.type, contentType)
  return new Response(bytes, { headers: { 'content-type': contentType } })
}

async function fetchWithRetry(url, attempts = 5) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS) })
    if (i >= attempts || (res.status !== 429 && res.status < 500)) return res
    const retryAfter = Number(res.headers.get('retry-after'))
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** i
    await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 60000)))
  }
}

// Fetched once per post, before turndown runs (turndown's rule callbacks are synchronous), so the
// iframeEmbed rule below can look titles up by video id without awaiting inside it. A video whose
// oEmbed lookup fails (network error, non-200, or a response with no title) is simply absent from
// the returned map; the caller falls back to the plain "Watch on YouTube" text for it.
async function fetchYoutubeTitles(bodyHtml) {
  const iframeRe = /<iframe\b([^>]*)>/gi
  const ids = new Set()
  for (const m of bodyHtml.matchAll(iframeRe)) {
    const src = parseAttrs(m[1]).src || ''
    const youtubeId = src.match(/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/i)?.[1]
    if (youtubeId) ids.add(youtubeId)
  }
  const titles = new Map()
  for (const id of ids) {
    const watchUrl = `https://www.youtube.com/watch?v=${id}`
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`, {
        signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data.title === 'string' && data.title.trim()) titles.set(id, data.title.trim())
      }
    } catch {
      // Network error or bad JSON — leave this id out of the map; caller falls back to plain text.
    }
  }
  return titles
}

async function downloadImages(bodyHtml, { slug, postDir, report }) {
  const imgRe = /<img\b([^>]*)>/gi
  const seen = new Map() // original src -> relative path (dedupe repeated images: never download the same src twice)
  const usedNames = new Set() // filenames already claimed in this post (dedupe collisions between DIFFERENT images)
  const remoteHostsSeen = new Set() // src already reported as off-host, so it isn't reported twice
  const altFills = new Map() // original src -> hand-written alt (from ALT) to put on its <img>
  let index = 0
  let hero = null
  let heroAlt = null
  let heroSpan = null // [start, end) in bodyHtml of the hero's <figure> (or bare <img>) — removed below

  const matches = [...bodyHtml.matchAll(imgRe)]
  for (const m of matches) {
    const attrs = parseAttrs(m[1])
    const src = attrs.src
    if (!src) continue

    // Exact hostname match, not substring — `src.includes('miro.medium.com')` would also match e.g.
    // `https://evil.example/miro.medium.com/x.jpg`. Images on any other host are left as remote links
    // (never hotlinked-and-silently-dropped) and surface in the report so they're easy to spot-check.
    let hostname
    try {
      hostname = new URL(src).hostname
    } catch {
      continue // not an absolute URL — nothing we can fetch or usefully report
    }
    if (!IMAGE_HOSTS.includes(hostname)) {
      if (!remoteHostsSeen.has(src)) {
        remoteHostsSeen.add(src)
        report.remoteImages.push({ src, hostname })
      }
      continue
    }
    if (seen.has(src)) continue

    index++
    const exportAlt = (attrs.alt ?? '').trim()
    const base = exportAlt === '' ? `${slug}-${index}` : slugifyFilename(exportAlt)
    const url = fullSizeUrl(src)
    const res = await fetchImage(url)
    if (!res.ok) fail(slug, `GET ${url} -> ${res.status}`)
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.toLowerCase().startsWith('image/')) {
      fail(slug, `GET ${url} -> unexpected content-type "${contentType}" (expected an image)`)
    }
    const contentLength = Number(res.headers.get('content-length'))
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      fail(slug, `GET ${url} -> declared ${contentLength} bytes, over the ${MAX_IMAGE_BYTES}-byte cap`)
    }
    const bytes = Buffer.from(await res.arrayBuffer())
    if (bytes.length === 0) fail(slug, `empty image download: ${url}`)
    if (bytes.length > MAX_IMAGE_BYTES) {
      fail(slug, `GET ${url} -> downloaded ${bytes.length} bytes, over the ${MAX_IMAGE_BYTES}-byte cap`)
    }

    // Two different images can slugify to the same base name (same alt, or both missing alt and
    // truncated to the same prefix) — claim a `-2`, `-3`, … suffix rather than let the second
    // download silently overwrite the first.
    const ext = extFor(contentType, url, slug)
    let name = `${base}.${ext}`
    if (usedNames.has(name)) {
      let n = 2
      while (usedNames.has(`${base}-${n}.${ext}`)) n++
      name = `${base}-${n}.${ext}`
    }
    usedNames.add(name)
    writeFileSync(join(postDir, name), bytes)

    // A hand-written alt (ALT, keyed by the file name just chosen) fills in a missing one, and is
    // written into the body's <img> so the Markdown carries it.
    const altKey = `${slug}/${name}`
    const alt = exportAlt || ALT[altKey] || ''
    if (!exportAlt && ALT[altKey]) usedAltKeys.add(altKey)
    if (exportAlt && ALT[altKey]) fail(slug, `ALT has an entry for ${name}, but the export already gives it an alt`)
    const missingAlt = alt === ''
    if (!exportAlt && alt) altFills.set(src, alt)

    const relPath = `./${name}`
    seen.set(src, relPath)
    report.images.push({
      src: url,
      file: name,
      alt: missingAlt ? null : alt,
      altSource: exportAlt ? 'export' : alt ? 'ALT' : null,
    })
    if (hero === null) {
      const imgSpan = [m.index, m.index + m[0].length]
      const figureSpan = enclosingFigureSpan(bodyHtml, imgSpan[0], imgSpan[1])
      const captionText = figureSpan ? figcaptionText(bodyHtml.slice(figureSpan[0], figureSpan[1])) : ''
      hero = relPath
      heroAlt = missingAlt ? captionText || 'TODO alt' : alt
      heroSpan = figureSpan ?? imgSpan
      if (missingAlt && !captionText) report.todoAlt.push(name)
    } else if (missingAlt) {
      report.todoAlt.push(name)
    }
  }

  let rewritten = heroSpan ? bodyHtml.slice(0, heroSpan[0]) + bodyHtml.slice(heroSpan[1]) : bodyHtml
  // Put hand-written alts on their <img> tags (Medium omits the attribute when it has none).
  rewritten = rewritten.replace(imgRe, (tag, attrsStr) => {
    const src = parseAttrs(attrsStr).src
    if (!src || !altFills.has(src) || /\balt\s*=/i.test(attrsStr)) return tag
    return `<img alt="${escapeHtmlAttr(altFills.get(src))}"${attrsStr}>`
  })
  for (const [src, relPath] of seen) {
    rewritten = rewritten.split(src).join(relPath)
  }

  return { bodyHtml: rewritten, hero, heroAlt }
}

// ---------------------------------------------------------------------------------------------
// HTML -> Markdown body conversion
// ---------------------------------------------------------------------------------------------

// Class tokens that mark Medium chrome we never want in the post body. UNVERIFIED against a real
// export — the RSS feed samples used to write this script never carry any of this, so it may be
// dead code, but it's cheap insurance if a future export does include it.
const CHROME_CLASS_TOKENS = [
  'js-subscribebutton',
  'subscribebutton',
  'postactionsfooter',
  'js-postactionsfooter',
  'js-actionmultirecommend',
  'multirecommendcount',
  'js-footerbuttoncontainer',
  'metabar',
  'js-postmetalockup',
]

const PRESS_ENTER_RE = /press enter or click to view image in full size\.?/i

function hasClassToken(node, tokens) {
  const cls = (node.getAttribute?.('class') ?? '').toLowerCase().split(/\s+/)
  return tokens.some((t) => cls.includes(t))
}

// Markdown/HTML escaping for the raw syntax the custom rules below build by hand. Turndown's own
// built-in rules already escape everything they produce (see escapeLinkDestination/escapeMarkdown in
// its source) — these rules bypass that by constructing `[…](…)`/`![…](…)`/`<figcaption>` directly,
// so they need their own copies.

/** Backslash-escape the characters that would otherwise break a Markdown link/image destination
 * `(target)`, and fall back to angle brackets when the target contains a space — the same rule
 * turndown's own (unexported) escapeLinkDestination() applies to its built-in link/image rules. */
function escapeLinkDestination(destination) {
  const escaped = destination.replace(/([<>()])/g, '\\$1')
  return escaped.includes(' ') ? `<${escaped}>` : escaped
}

/** Backslash-escape the characters that would break a Markdown image's `[alt]` — `]` closes it early,
 * `\` is the escape character itself. */
function escapeAltText(alt) {
  return alt.replace(/\\/g, '\\\\').replace(/\]/g, '\\]')
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeHtmlAttr(text) {
  return escapeHtml(text).replace(/"/g, '&quot;')
}

/** Build a figure caption's inner HTML by hand instead of taking its plain textContent, which would
 * both leave the text unescaped and silently drop any <a> link inside the caption. Only text and <a>
 * are handled specially — Medium captions are plain prose, occasionally with one inline link; any
 * other inline markup falls back to its escaped text. */
function captionInnerHtml(node) {
  let out = ''
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      out += escapeHtml(child.textContent || '')
    } else if (child.nodeName === 'A') {
      const href = child.getAttribute('href') || ''
      out += `<a href="${escapeHtmlAttr(href)}">${escapeHtml(child.textContent || '')}</a>`
    } else {
      out += escapeHtml(child.textContent || '')
    }
  }
  return out.trim()
}

function buildTurndown({ linkIndex, report, youtubeTitles }) {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    // Medium's export puts emphasis right up against an emoji or an escaped bracket often enough
    // (see hipo-gang-first-two-months) that `_` delimiters silently fail to flank and render as
    // literal underscores; `*` doesn't have that intraword restriction.
    emDelimiter: '*',
  })

  // Medium's editor has exactly two heading sizes: "large" (h3.graf--h3) and "small" (h4.graf--h4).
  // They render one level below the post's own <h1>, so h3 -> ## and h4 -> ### rather than turndown's
  // tag-literal ### / ####. Any h3/h4 maps this way, not only ones carrying the graf class, since
  // Medium's body never uses h3/h4 for anything else once the duplicated title/subtitle (below) is
  // stripped.
  // A heading bolded as a whole (`<h3><strong>Conclusion</strong></h3>`, which Medium's editor lets
  // authors do) renders the same without the `**`, which only clutters the Markdown.
  const headingText = (content) => content.trim().replace(/^\*\*([^*]+)\*\*$/, '$1')
  td.addRule('mediumHeadingLarge', {
    filter: (node) => node.nodeName === 'H3',
    replacement: (content) => `\n\n## ${headingText(content)}\n\n`,
  })
  td.addRule('mediumHeadingSmall', {
    filter: (node) => node.nodeName === 'H4',
    replacement: (content) => `\n\n### ${headingText(content)}\n\n`,
  })

  // Bold/italic whose text starts or ends with whitespace or a <br> (Medium: `<strong>Methodology
  // Note:<br></strong>`) would put the delimiter next to the line break — `**Methodology Note:  \n**`
  // — where CommonMark no longer reads it as a delimiter and prints literal asterisks. Keep the
  // whitespace and the break outside the delimiters.
  const wrapInline = (delimiter) => (content) => {
    if (!content.trim()) return content
    const [, lead, inner, trail] = content.match(/^(\s*)([\s\S]*?)(\s*)$/)
    return `${lead}${delimiter}${inner}${delimiter}${trail}`
  }
  td.addRule('strong', { filter: ['strong', 'b'], replacement: wrapInline('**') })
  td.addRule('emphasis', { filter: ['em', 'i'], replacement: wrapInline('_') })

  // Every body section starts with a divider <hr>, including the first one, where Medium hides it —
  // so only the dividers BETWEEN sections are real "* * *" breaks.
  td.addRule('dropFirstSectionDivider', {
    filter: (node) => {
      if (node.nodeName !== 'HR') return false
      for (let p = node.parentNode; p; p = p.parentNode) {
        if (p.nodeName === 'SECTION') return hasClassToken(p, ['section--first'])
      }
      return false
    },
    replacement: () => '',
  })

  // Figures with a caption become a raw <figure> block: markdown image + <figcaption>. Astro's
  // Markdown renderer passes raw HTML blocks through, and figure/figcaption have no Markdown syntax.
  td.addRule('figure', {
    filter: (node) => node.nodeName === 'FIGURE',
    replacement: (_content, node) => {
      const img = node.querySelector('img')
      const caption = node.querySelector('figcaption')
      if (!img) return _content // no image in this figure — leave whatever turndown made of it
      const alt = escapeAltText(img.getAttribute('alt') || '')
      const src = escapeLinkDestination(img.getAttribute('src') || '')
      const imgMd = `![${alt}](${src})`
      const captionHtml = caption ? captionInnerHtml(caption) : ''
      if (!captionHtml) return `\n\n${imgMd}\n\n`
      return `\n\n<figure>\n\n${imgMd}\n\n<figcaption>${captionHtml}</figcaption>\n\n</figure>\n\n`
    },
  })

  // Medium appends a 1x1 view-tracking pixel (<img ... width="1" height="1">) to every exported
  // post, pointed at medium.com/_/stat. It isn't content and shouldn't ship.
  td.addRule('dropTrackingPixel', {
    filter: (node) =>
      node.nodeName === 'IMG' && node.getAttribute('width') === '1' && node.getAttribute('height') === '1',
    replacement: () => '',
  })

  // Embeds -> plain links (iframes, and Medium's mixtapeEmbed link-preview wrapper).
  td.addRule('iframeEmbed', {
    filter: (node) => node.nodeName === 'IFRAME',
    replacement: (_content, node) => {
      const src = node.getAttribute('src') || ''
      // A YouTube embed becomes a link to the video's own page rather than to the bare player,
      // labelled with the video's own title (fetched up front by fetchYoutubeTitles) when one was
      // found; otherwise the plain "Watch on YouTube" text.
      const youtubeId = src.match(/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/i)?.[1]
      if (youtubeId) {
        const title = youtubeTitles?.get(youtubeId)
        const text = title ? `Watch on YouTube: ${title}` : 'Watch on YouTube'
        return `\n\n[${text}](https://www.youtube.com/watch?v=${youtubeId})\n\n`
      }
      report.warnings.push(`embed left as a plain link, check by hand: ${src}`)
      return `\n\n[Embedded content](${escapeLinkDestination(src)})\n\n`
    },
  })
  td.addRule('mixtapeEmbed', {
    filter: (node) => hasClassToken(node, ['mixtapeembed']),
    replacement: (_content, node) => {
      const a = node.querySelector('a')
      if (!a) return ''
      const href = a.getAttribute('href') || ''
      const text = (a.textContent || href).trim()
      const target = rewriteLink(href, { linkIndex, report })
      return `\n\n[${text}](${escapeLinkDestination(target)})\n\n`
    },
  })

  // Minimal GFM-style table support (no colspan/rowspan — Medium's editor has no native table block,
  // so this is defensive rather than exercised by any known post; see the header note).
  td.addRule('table', {
    filter: (node) => node.nodeName === 'TABLE',
    replacement: (_content, node) => {
      const rows = [...node.querySelectorAll('tr')].map((tr) =>
        [...tr.querySelectorAll('th,td')].map((cell) => (cell.textContent || '').trim().replace(/\|/g, '\\|')),
      )
      if (rows.length === 0) return ''
      const width = rows[0].length
      const lines = [
        `| ${rows[0].join(' | ')} |`,
        `| ${rows[0].map(() => '---').join(' | ')} |`,
        ...rows.slice(1).map((r) => `| ${r.join(' | ')} |`),
      ]
      if (rows.some((r) => r.length !== width)) {
        report.warnings.push('a table had rows of unequal width — check its Markdown by hand')
      }
      return `\n\n${lines.join('\n')}\n\n`
    },
  })

  // Links: rewrite Hipo Medium / docs.hipo.finance / app.hipo.finance targets; everything else,
  // including t.me, passes through unchanged.
  td.addRule('links', {
    filter: 'a',
    replacement: (content, node) => {
      const href = node.getAttribute('href') || ''
      const target = rewriteLink(href, { linkIndex, report })
      return `[${content}](${escapeLinkDestination(target)})`
    },
  })

  // Drop the body's duplicated title/subtitle (Medium repeats both as the first two body elements,
  // marked with the same graf classes as the title element itself — see extractTitle()), known
  // Medium chrome by class, and the "click to view image in full size" helper text Medium inserts
  // near images. All best-effort — see the header note. These must be registered as ordinary rules
  // (not via td.remove/td.keep): turndown checks addRule()'d rules before its keep/remove lists
  // regardless of registration order, so a td.remove() filter would never get a chance to run
  // before e.g. the heading rule above already turned a duplicated *.graf--title <h3> into a "##".
  td.addRule('dropDuplicateTitle', {
    filter: (node) => hasClassToken(node, ['graf--title', 'graf--subtitle']),
    replacement: () => '',
  })
  td.addRule('dropMediumChrome', {
    filter: (node) => hasClassToken(node, CHROME_CLASS_TOKENS),
    replacement: () => '',
  })
  td.addRule('dropPressEnterHelperText', {
    filter: (node) => {
      const text = (node.textContent || '').trim()
      return text !== '' && PRESS_ENTER_RE.test(text) && text.replace(PRESS_ENTER_RE, '').trim() === ''
    },
    replacement: () => '',
  })

  // turndown's own text-node escaping (TurndownService#escape, applied to every text node it
  // processes) covers Markdown syntax characters but not `<` — so text Medium stored HTML-encoded
  // (`&lt;tag&gt;`, which the DOM parser decodes to a literal `<tag>` in the node's text) would come
  // out as live, Markdown-invisible HTML. Escape literal `<` to `&lt;` the same way the raw HTML this
  // script builds by hand (the 'figure' rule above) already escapes it — that rule never goes through
  // this escaping at all, since it returns its own string directly rather than converting children.
  const defaultEscape = td.escape.bind(td)
  td.escape = (text) => defaultEscape(text).replace(/</g, '&lt;')

  return td
}

// ---------------------------------------------------------------------------------------------
// Post assembly
// ---------------------------------------------------------------------------------------------

function frontmatterYaml({ title, publishedAt, mediumUrl, hero, heroAlt, meta, subtitle }) {
  const lines = ['---', `title: ${JSON.stringify(title)}`]
  if (meta.seoTitle) lines.push(`seoTitle: ${JSON.stringify(meta.seoTitle)}`)
  lines.push(
    meta.description
      ? `description: ${JSON.stringify(meta.description)}`
      : `description: ${JSON.stringify('TODO: owner-written description (<155 chars) — never from the post body')}`,
  )
  lines.push(`publishedAt: ${publishedAt}`)
  lines.push(`author: ${JSON.stringify('Hipo Team')}`)
  if (subtitle) lines.push(`subtitle: ${JSON.stringify(subtitle)}`)
  lines.push(`hero: ${JSON.stringify(hero ?? 'TODO: no image found in the post body')}`)
  lines.push(`heroAlt: ${JSON.stringify(heroAlt ?? 'TODO alt')}`)
  lines.push(`mediumUrl: ${JSON.stringify(mediumUrl)}`)
  lines.push('---', '')
  return lines.join('\n')
}

async function importPost(row, html, file, { outDir, force, linkIndex, report }) {
  const title = extractTitle(html, file)
  const publishedAt = extractPublished(html, file)
  const mediumUrl = extractCanonical(html, file)
  const bodyHtmlRaw = extractBodySection(html, file)

  const postDir = join(outDir, row.slug)
  if (existsSync(postDir) && !force) {
    report.skipped.push(row.slug)
    return
  }
  mkdirSync(postDir, { recursive: true })

  const postReport = {
    images: [],
    remoteImages: [],
    todoAlt: [],
    internalLinks: [],
    docsLinks: [],
    appLinks: [],
    unresolvedLinks: [],
    warnings: [],
  }
  const { bodyHtml, hero, heroAlt } = await downloadImages(bodyHtmlRaw, { slug: row.slug, postDir, report: postReport })
  const youtubeTitles = await fetchYoutubeTitles(bodyHtml)

  const td = buildTurndown({ linkIndex, report: postReport, youtubeTitles })
  const body = td.turndown(bodyHtml).trim() + '\n'

  const meta = META[row.slug] ?? {}
  let subtitle = null
  let subtitleSource = 'none'
  const fromMedium = mediumSubtitle(html, bodyHtmlRaw)
  if (typeof meta.subtitle === 'string') {
    subtitle = meta.subtitle
    subtitleSource = 'META'
  } else if (meta.subtitle === null) {
    subtitleSource = `none (META null; Medium's was: ${JSON.stringify(fromMedium)})`
  } else if (fromMedium) {
    subtitle = fromMedium
    subtitleSource = 'Medium subtitle'
  } else {
    subtitleSource = 'none (Medium has only an automatic excerpt)'
  }
  const frontmatter = frontmatterYaml({ title, publishedAt, mediumUrl, hero, heroAlt, meta, subtitle })
  writeFileSync(join(postDir, 'index.md'), frontmatter + body)

  const todos = []
  if (!meta.description) todos.push('description')
  if (postReport.todoAlt.length) todos.push(`alt text (${postReport.todoAlt.length}: ${postReport.todoAlt.join(', ')})`)
  if (!hero) todos.push('hero (no image found in body)')

  report.posts.push({
    slug: row.slug,
    title,
    publishedAt,
    subtitleSource,
    subtitle,
    todos,
    imagesDownloaded: postReport.images.length,
    remoteImages: postReport.remoteImages,
    internalLinks: postReport.internalLinks,
    docsLinks: postReport.docsLinks,
    appLinks: postReport.appLinks,
    unresolvedLinks: postReport.unresolvedLinks,
    warnings: postReport.warnings,
  })
}

// ---------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------

function canonicalToMappingPath(mediumUrl) {
  return hipoMediumPath(mediumUrl)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const postsDir = join(args.exportDir, 'posts')
  if (!existsSync(postsDir)) {
    console.error(`${postsDir}: not found — expected the export's posts/ directory`)
    process.exit(1)
  }

  const files = readdirSync(postsDir).filter((f) => f.endsWith('.html') && !f.startsWith('draft_'))
  if (files.length === 0) {
    console.error(`${postsDir}: no published *.html files (only drafts, or empty) — nothing to import`)
    process.exit(1)
  }

  mkdirSync(args.out, { recursive: true })
  if (args.imageCache) {
    mkdirSync(args.imageCache, { recursive: true })
    imageCacheDir = args.imageCache
  }
  const linkIndex = buildLinkIndex(MAPPING)
  const report = { posts: [], skipped: [], unmatchedMapping: [], unmappedStories: [] }

  const matchedSlugs = new Set()
  for (const file of files) {
    const path = join(postsDir, file)
    const html = readFileSync(path, 'utf8')
    extractArticle(html, file)

    const mediumUrl = extractCanonical(html, file)
    const mappingPath = canonicalToMappingPath(mediumUrl)
    let row = mappingPath ? MAPPING.find((m) => m.path === mappingPath) : null

    if (!row) {
      const title = extractTitle(html, file)
      row = MAPPING.find((m) => m.path === null && title.toLowerCase().includes(m.title.toLowerCase()))
    }

    if (!row) {
      report.unmappedStories.push({ file, mediumUrl })
      continue
    }
    matchedSlugs.add(row.slug)

    if (args.only && row.slug !== args.only) continue

    await importPost(row, html, file, { outDir: args.out, force: args.force, linkIndex, report })
  }

  for (const row of MAPPING) {
    if (!matchedSlugs.has(row.slug) && (!args.only || row.slug === args.only)) {
      report.unmatchedMapping.push(row)
    }
  }

  printReport(report)

  // Only meaningful for a full run: with --only, the other posts' keys are legitimately unused.
  const orphanAlts = Object.keys(ALT).filter((k) => !usedAltKeys.has(k))
  if (!args.only && !report.skipped.length && orphanAlts.length) {
    console.error(`ALT entries that matched no alt-less image (export changed?): ${orphanAlts.join(', ')}`)
    process.exit(1)
  }
}

function printReport(report) {
  console.log('\n=== Import report ===\n')

  for (const post of report.posts) {
    console.log(`[${post.slug}] ${post.title}`)
    console.log(`  Published: ${post.publishedAt}`)
    console.log(`  Subtitle: ${post.subtitleSource}${post.subtitle ? ` — ${JSON.stringify(post.subtitle)}` : ''}`)
    console.log(`  TODOs: ${post.todos.length ? post.todos.join(', ') : 'none'}`)
    console.log(`  Images downloaded: ${post.imagesDownloaded}`)
    if (post.remoteImages.length) {
      console.log(`  Images left remote (not on ${IMAGE_HOSTS.join(' or ')} — check by hand):`)
      for (const img of post.remoteImages) console.log(`    ${img.src} (${img.hostname})`)
    }
    console.log(`  Internal links rewritten: ${post.internalLinks.length}`)
    for (const l of post.internalLinks) console.log(`    ${l.href} -> ${l.target}`)
    if (post.docsLinks.length) {
      console.log(`  docs.hipo.finance links (check by hand — GitBook-era paths may have moved):`)
      for (const l of post.docsLinks) console.log(`    ${l.href} -> ${l.target}`)
    }
    if (post.appLinks.length) {
      console.log(`  app.hipo.finance links rewritten (check by hand):`)
      for (const l of post.appLinks) console.log(`    ${l.href} -> ${l.target}`)
    }
    if (post.unresolvedLinks.length) {
      console.log(`  UNRESOLVED links (left unchanged — not found in the mapping):`)
      for (const l of post.unresolvedLinks) console.log(`    ${l}`)
    }
    for (const w of post.warnings) console.log(`  WARNING: ${w}`)
    console.log('')
  }

  if (report.skipped.length) {
    console.log(`Skipped (folder exists, re-run with --force to overwrite): ${report.skipped.join(', ')}\n`)
  }
  if (report.unmatchedMapping.length) {
    console.log('Mapping rows with no matching file in the export:')
    for (const row of report.unmatchedMapping)
      console.log(`  [${row.slug}] ${row.title} (${row.path ?? 'no path yet'})`)
    console.log('')
  }
  if (report.unmappedStories.length) {
    console.log('Published stories in the export not found in the mapping table:')
    for (const s of report.unmappedStories) console.log(`  ${s.file} (${s.mediumUrl})`)
    console.log('')
  }

  console.log(`Imported ${report.posts.length} post(s).`)
}

await main()
