# Bring llms.txt and robots.txt up to date with the site's pages

**Status:** implemented

## Goal

`/vs/` shipped without an entry in `public/llms.txt`, and several other site pages and docs pages were never
listed there either. LLM crawlers should find every public, indexable page from that one file.
`robots.txt` is checked too: it has to let crawlers reach `/vs/`.

## Definitions

**Concepts**

- **llms.txt**: `public/llms.txt`, a hand-maintained English description of the protocol for LLMs, served at
  `https://hipo.finance/llms.txt`. It has two kinds of link: a header block near the top and the
  `## Important links for LLMs` list at the bottom.
- **Indexable page**: a route that is in the sitemap and has no `noindex` tag. `/app/` (legacy redirect stub,
  `noindex`) and `/404` are not indexable.
- **Locale twin**: the same page under `/<locale>/`. llms.txt already explains the prefix rule
  (`## Languages and localized URLs`), so twins are not listed one by one.

**Formula parameters**

None.

## Context

- `public/robots.txt` is three lines: `User-Agent: *`, `Allow: /`, and `Sitemap: https://hipo.finance/sitemap-index.xml`.
  It lists no individual pages.
- `/vs/` is in the sitemap: `src/data/lastmod.mjs:48` gives it a `ROUTES` entry.
- The site's page routes are `src/pages/{index,faq,verify,vs}.astro` and `src/pages/{stake,unstake,rewards,stats,defi,hpo,app}/index.astro`.
- About `/vs/`, from `src/i18n/en/vs.json` and `seo.json:8-11`: it covers Hipo's 0% protocol fee, a
  realized-yield comparison ("what stakers actually received", read from each protocol's contracts over
  two years and shown in GRAM), HPO rewards through Hipo Club, how to exit, and trust points.
- llms.txt today:
  - Header: `HPO page: https://hipo.finance/hpo` is missing its trailing slash (the site uses `trailingSlash: 'always'`).
    `Last reviewed: 2026-08-29`.
  - Site pages it never links: `/vs/`, `/faq/`, `/unstake/`, `/rewards/`, `/stats/`. `/defi/` and `/hpo/`
    only appear inline, not in the links list.
  - Docs in the sidebar (`astro.config.mjs:19-140`) that are missing from the links list:
    - Introduction: liquid-staking, how-does-hipo-work/validators, hipo-rewards.
    - Guides: how-does-hipo-work/unstaking, hipo-staked-gram-hgram/hgram-use-cases.
    - Tokens & governance: hpo-tokens-distribution, giveaways-and-prizes/hipo-club, wallets-and-rewards.
    - Security: why-your-security-matters, phishing-awareness-and-prevention.
    - Hipo Fund: overview, investment-policy-statement, and 3 quarterly reports.
    - Programs: incentive-programs, tvl-milestone-rewards, hipo-gang plus season 1, hipo-club seasons 2 and 3,
      hipo-nfts, the $1M rewards program, ambassadors.
    - Legal: terms-of-use, privacy-policy.
    - Brand kit.

## Approach

1. **robots.txt: no edit.** `Allow: /` already covers `/vs/`, and the sitemap it points to already lists
   `/vs/`. Adding a per-page `Allow: /vs/` does nothing for crawlers.
   - Rejected: `Disallow: /app/`. That page relies on its `noindex` tag, and a crawler blocked by robots.txt
     never gets to read that tag.
2. **llms.txt, header block:** add a `Hipo vs other liquid staking (0% fee, realized yield): https://hipo.finance/vs/`
   line, fix the `/hpo` slash, and set `Last reviewed: 2026-09-14`.
3. **llms.txt, `## Rewards and APY`:** add one short paragraph that sends comparison questions to `/vs/`.
   It says the page compares what stakers actually earned, in GRAM, across TON liquid staking protocols,
   measured from each protocol's contracts. It also says this realized figure differs from the current APY.
   It quotes no numbers, following the file's own "do not hardcode APY" rule.
4. **llms.txt, `## Important links for LLMs`:** keep every existing line and add the missing ones:
   - The seven site pages (`/vs/`, `/faq/`, `/unstake/`, `/rewards/`, `/stats/`, `/defi/`, `/hpo/`).
   - Every missing sidebar doc from Context, in sidebar order, next to related existing entries.
   - **Excluded (your decision):** six past or paused program pages:
     - the per-season pages `hipo-gang/hipo-gang-season-1/`, `hipo-club/hipo-club-season-2/` and `hipo-club/hipo-club-season-3/`;
     - `hipo-nfts/`, `hipo-usd1-000-000-rewards-program/` and `hipo-ambassadors-program/`.
     The Hipo Gang and Hipo Club overview pages, the programs overview and the TVL milestone rewards page are still listed.
   - Rejected: listing locale twins one by one. That would add about 10× the lines, and the prefix rule already covers them.

About 45 lines added or changed, all in `public/llms.txt`. No code changes. llms.txt is English-only
(it says so itself), so there is no locale step.

## Changes

- `public/llms.txt`: header block, one paragraph in `## Rewards and APY`, and additions to `## Important links for LLMs`.
- `CHANGELOG.md` + `changelog/2026-09-14-llms-links.md`: session entry (project convention). Includes the robots.txt no-change decision.

## Acceptance criteria

- [x] `public/robots.txt` is byte-identical to `HEAD`.
- [x] `https://hipo.finance/vs/` appears in both the header block and `## Important links for LLMs`.
- [x] Every indexable English page route (index, faq, verify, vs, stake, unstake, rewards, stats, defi, hpo)
      and every `link:` in the `astro.config.mjs` docs sidebar, except the six excluded program pages, appears in llms.txt.
      Checked by a script that diffs the two sets.
- [x] None of the six excluded URLs appears in llms.txt.
- [ ] Every `https://hipo.finance/...` URL in llms.txt returns HTTP 200 from `npm run dev` on localhost
      (same path), and each ends with `/` or `.txt`.
      _Partly met: 52 of 53 paths return 200. `/sitemap-index.xml`, which was already in the file, returns 404 in
      dev because it is generated only at build time. It is present in `dist/`._
- [x] `grep -n 'hipo.finance/hpo[^/]' public/llms.txt` returns nothing.
- [x] The new `/vs/` paragraph contains no percentage, APY or GRAM figure.
- [x] `http://localhost:<port>/llms.txt` serves the updated file.

## Risks & rollback

The only risk is inaccurate prose about `/vs/`, which LLMs might repeat. The paragraph uses only wording
backed by `vs.json`. Rollback: revert the commit. llms.txt is a static file with no dependents.

## Open questions

None.
