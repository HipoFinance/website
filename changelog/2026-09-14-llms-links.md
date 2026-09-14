# Listing /vs/ and the missing pages in llms.txt

`/vs/` went live without an entry in `public/llms.txt`. While adding it, I checked the file against every
English page route and every docs sidebar link, and found that most of the app pages and about 20 docs
pages had never been listed either. Spec: [`specs/llms-robots-links.md`](../specs/llms-robots-links.md).

| Commit | Summary |
| ------ | ------- |
| `7bcaab7` | Link `/vs/` and the missing site and docs pages from `llms.txt` |

## What changed in llms.txt

- **Header block:** added a `/vs/` line. Fixed `HPO page: https://hipo.finance/hpo`, which lacked the trailing
  slash the site's `trailingSlash: 'always'` requires. Set `Last reviewed` to 2026-09-14.
- **Rewards and APY:** added one paragraph that sends protocol-comparison questions to `/vs/`. It explains
  that the page's realized figure (what stakers actually earned, read from each protocol's contracts) is not
  the same number as the current APY. The paragraph quotes no figures, following the file's existing
  "do not hardcode APY" rule.
- **Important links for LLMs:** added `/unstake/`, `/rewards/`, `/stats/`, `/defi/`, `/vs/`, `/hpo/` and
  `/faq/`, and every sidebar doc that was missing:
  - liquid staking, validators, rewards & APY, how unstaking works, hGRAM use cases;
  - HPO distribution, Hipo Club, multiple wallets, the two security pages;
  - the five Hipo Fund pages, the programs overview, TVL milestone rewards, Hipo Gang;
  - the two legal pages and the brand kit.

## Declined

- **Any edit to `robots.txt`.** It is `Allow: /` plus the sitemap URL, and the sitemap already lists `/vs/`
  (`src/data/lastmod.mjs` has its route). A per-page `Allow` does nothing for crawlers.
  `Disallow: /app/` was also rejected: that stub relies on its `noindex` tag, and a crawler blocked by
  robots.txt never reads the tag.
- **Past and paused programs**, by the user's decision: Hipo Gang season 1, Hipo Club seasons 2–3, Hipo NFTs
  (2024), the $1M rewards program and the paused Ambassadors program are left out, so no LLM presents them
  as current. Their overview pages are still listed.
- **Listing locale twins one by one.** The existing "Languages and localized URLs" section already gives the
  prefix rule.

### Verification performed

- `public/robots.txt` is identical to `HEAD`.
- A script diffed the English page routes plus every sidebar `link:` in `astro.config.mjs` (minus the six
  excluded pages) against the hipo.finance URLs in llms.txt. Nothing is missing, and none of the excluded
  URLs appear.
- Each of the 53 distinct hipo.finance paths in llms.txt returned HTTP 200 from `npm run dev`, except
  `/sitemap-index.xml`. That path was already in the file before this change, and the dev server does not
  generate it (it exists only in a build). It is present in the last build (`dist/sitemap-index.xml`), and
  `dist/sitemap-0.xml` contains `https://hipo.finance/vs/`.
- The dev server serves `/llms.txt` byte-identical to the edited file.

### Follow-ups

- None.
