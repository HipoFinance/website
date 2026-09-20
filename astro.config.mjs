import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import { existsSync, readFileSync } from 'node:fs'
import { lastmodFor } from './src/data/lastmod.mjs'
import { DEFAULT_LOCALE, LOCALES, builtLocales, indexableLocales } from './src/i18n/registry.mjs'
import remarkLocalizeLinks from './src/i18n/remark-localize-links.mjs'

// Sitemap groups: the five dApp shell pages, the docs, and everything else (home, FAQ, HPO, verify,
// vs, and any future top-level page).
const SITEMAP_GROUPS = ['site', 'app', 'docs']
const APP_SECTIONS = new Set(['stake', 'unstake', 'rewards', 'stats', 'defi'])

/**
 * The sitemap chunk a URL belongs to, `<locale>-<group>` (`en-site`, `fa-app`, `pt-br-docs`).
 * @param {string} url
 */
function sitemapSegment(url) {
  const segments = new URL(url).pathname.split('/').filter(Boolean)
  const locale = /** @type {string[]} */ (indexableLocales()).includes(segments[0]) ? segments.shift() : DEFAULT_LOCALE
  const group = segments[0] === 'docs' ? 'docs' : APP_SECTIONS.has(segments[0]) ? 'app' : 'site'
  return `${locale}-${group}`
}

/**
 * Fails the build when the sitemap was not written. On its chunked path @astrojs/sitemap catches its
 * own errors, logs them and returns, so a broken sitemap would otherwise build — and deploy — green
 * with robots.txt pointing at a 404. Must be listed after sitemap(): Astro runs `astro:build:done`
 * hooks one integration at a time, in order.
 * @returns {import('astro').AstroIntegration}
 */
function assertSitemapWritten() {
  return {
    name: 'hipo:assert-sitemap-written',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const index = new URL('sitemap-index.xml', dir)
        if (!existsSync(index)) {
          throw new Error('sitemap-index.xml was not written; see the @astrojs/sitemap error logged above')
        }
        const listed = [...readFileSync(index, 'utf8').matchAll(/<loc>https:\/\/hipo\.finance\/([^<]+)<\/loc>/g)]
        const expected = indexableLocales().length * SITEMAP_GROUPS.length
        if (listed.length !== expected) {
          throw new Error(`sitemap-index.xml lists ${listed.length} sitemaps, expected ${expected} (locales × groups)`)
        }
        const missing = listed.map((match) => match[1]).filter((file) => !existsSync(new URL(file, dir)))
        if (missing.length > 0) {
          throw new Error(`sitemap-index.xml lists sitemaps that were not written: ${missing.join(', ')}`)
        }
      },
    },
  }
}

// Sidebar order is the reader path defined in specs/docs-restructure.md (understand → use →
// tokens & governance → verify → build → fund → archive → legal → brand). Group order no longer
// mirrors file paths: entries link pages by URL, and several pages keep their GitBook-era paths
// while sitting in a different group.
const docsSidebar = [
  {
    label: '💡 Start Here',
    items: [
      { label: '🦛 What is Hipo?', link: '/docs/' },
      { label: '🚰 Liquid Staking', link: '/docs/introduction/liquid-staking/' },
      { label: '⚙️ How Hipo Works', link: '/docs/introduction/how-does-hipo-work/' },
      {
        label: '💻 Validators & the Marketplace',
        link: '/docs/introduction/how-does-hipo-work/validators/',
      },
      { label: '🔥 Why Hipo', link: '/docs/introduction/advantages-of-hipo/' },
      { label: '🎁 Rewards & APY', link: '/docs/introduction/hipo-rewards/' },
      { label: '📖 Glossary', link: '/docs/glossary/' },
    ],
  },
  {
    label: '📚 Using Hipo',
    items: [
      { label: '🔒 Stake GRAM', link: '/docs/tutorials/staking/' },
      { label: '🔓 Unstake hGRAM', link: '/docs/tutorials/unstaking/' },
      { label: '⏳ How Unstaking Works', link: '/docs/introduction/how-does-hipo-work/unstaking/' },
      { label: '✉️ Staking Without the App', link: '/docs/staking-without-the-app/' },
      { label: '⛽ Fees & Gas', link: '/docs/fees-and-gas/' },
      { label: '⚠️ Risks', link: '/docs/risks/' },
      { label: '🔄 hGRAM in DeFi', link: '/docs/hipo-tokens/hipo-staked-gram-hgram/hgram-use-cases/' },
    ],
  },
  {
    label: '🪙 Tokens & Governance',
    items: [
      { label: '💧 hGRAM', link: '/docs/hipo-tokens/hipo-staked-gram-hgram/' },
      { label: '💎 HPO', link: '/docs/hipo-tokens/hipo-governance-token-hpo/' },
      {
        label: '🥧 HPO Distribution & Wallets',
        link: '/docs/hipo-tokens/hipo-governance-token-hpo/hpo-tokens-distribution/',
      },
      { label: '🗳️ DAO', link: '/docs/dao/' },
      { label: '💲 Profit Sharing', link: '/docs/profit-sharing/' },
      { label: '⭐ Hipo Club', link: '/docs/giveaways-and-prizes/hipo-club/' },
      { label: '👛 Using Multiple Wallets', link: '/docs/wallets-and-rewards/' },
    ],
  },
  {
    label: '🛡️ Security & Transparency',
    items: [
      { label: '🔐 Security Model', link: '/docs/security/why-your-security-matters/' },
      { label: '🎣 Phishing Awareness', link: '/docs/security/phishing-awareness-and-prevention/' },
      { label: '🧾 Contracts & Audits', link: '/docs/contracts-and-audits/' },
      { label: '📈 Hipo Stats', link: '/docs/introduction/hipo-stats/' },
      { label: '📊 Hipo on Dune', link: '/docs/introduction/hipo-on-dune/' },
    ],
  },
  {
    label: '🛠️ Developers',
    items: [{ label: '🤖 Hipo MCP Server', link: '/docs/hipo-mcp-server/' }],
  },
  {
    label: '💰 Hipo Fund',
    items: [
      { label: 'Overview', link: '/docs/hipo-fund/' },
      {
        label: 'Investment Policy Statement',
        link: '/docs/hipo-fund/investment-policy-statement/',
      },
      {
        label: 'Report: August 2025',
        link: '/docs/hipo-fund/quarterly-report-august-1-2025/',
      },
      {
        label: 'Report: December 2025',
        link: '/docs/hipo-fund/quarterly-report-december-18-2025/',
      },
      {
        label: 'Report: August 2026',
        link: '/docs/hipo-fund/quarterly-report-august-24-2026/',
      },
    ],
  },
  {
    label: '🗄️ Archive: Past Programs',
    items: [
      { label: 'Programs Overview', link: '/docs/giveaways-and-prizes/hipo-incentive-programs/' },
      {
        label: '💹 TVL Milestone Rewards (ended 2024)',
        link: '/docs/giveaways-and-prizes/tvl-milestone-rewards/',
      },
      {
        label: '🎩 Hipo Gang (ended 2025)',
        items: [
          { label: 'Overview', link: '/docs/giveaways-and-prizes/hipo-gang/' },
          {
            label: 'Season 1 (2024–2025)',
            link: '/docs/giveaways-and-prizes/hipo-gang/hipo-gang-season-1/',
          },
        ],
      },
      {
        label: '🏅 Hipo Club Seasons',
        items: [
          {
            label: 'Season 2 (2025)',
            link: '/docs/giveaways-and-prizes/hipo-club/hipo-club-season-2/',
          },
          {
            label: 'Season 3 (2025)',
            link: '/docs/giveaways-and-prizes/hipo-club/hipo-club-season-3/',
          },
        ],
      },
      { label: '🖼️ Hipo NFTs (2024)', link: '/docs/giveaways-and-prizes/hipo-nfts/' },
      {
        label: '💵 $1,000,000 Rewards Program (paused)',
        link: '/docs/giveaways-and-prizes/hipo-usd1-000-000-rewards-program/',
      },
      { label: '😎 Ambassadors Program (paused)', link: '/docs/hipo-ambassadors-program/' },
    ],
  },
  {
    label: '📜 Legal',
    items: [
      { label: '📄 Terms of Use', link: '/docs/legal-agreements/terms-of-use/' },
      { label: '🔏 Privacy Policy', link: '/docs/legal-agreements/privacy-policy/' },
    ],
  },
  { label: '🎨 Brand Kit', link: '/docs/brand-kit/' },
]

// Starlight locales from the registry (specs/multi-language-site.md §G): English is the unprefixed
// root; every other locale built in this run (released, plus drafts with I18N_INCLUDE_DRAFTS=1) is
// served under /<key>/docs/ from src/content/docs/<key>/. With English alone this is a single root
// locale, which Starlight treats as monolingual — identical to having no `locales` at all. This is
// the only i18n block in the config: Starlight generates Astro's `i18n` from it, so never add one.
const starlightLocales = Object.fromEntries(
  builtLocales().map((key) =>
    key === DEFAULT_LOCALE
      ? ['root', { label: LOCALES[key].label, lang: LOCALES[key].lang }]
      : [key, { label: LOCALES[key].label, lang: LOCALES[key].lang, dir: LOCALES[key].dir }],
  ),
)

// Sidebar label translations live in src/i18n/<locale>/docs-sidebar.json: a flat object keyed by the
// entry's `link` for pages and by `group:<English label>` for groups (which have no link); keys
// starting with `_` are comments. src/i18n/en/docs-sidebar.json lists every key with its English
// label and is the file translators copy; it must stay in sync with the tree above (checked here).
// Starlight keys `translations` by BCP-47 lang, hence LOCALES[key].lang. Links themselves are
// localised by Starlight (`/docs/x/` → `/fa/docs/x/`).
function sidebarKey(item) {
  return item.link !== undefined ? item.link : 'group:' + item.label
}

function readSidebarLabels(locale) {
  const file = new URL(`./src/i18n/${locale}/docs-sidebar.json`, import.meta.url)
  if (!existsSync(file)) {
    return undefined
  }
  const json = JSON.parse(readFileSync(file, 'utf8'))
  return Object.fromEntries(Object.entries(json).filter(([key]) => !key.startsWith('_')))
}

function withSidebarTranslations(items) {
  const english = readSidebarLabels(DEFAULT_LOCALE) ?? {}
  const catalogs = builtLocales()
    .filter((key) => key !== DEFAULT_LOCALE)
    .map((key) => [LOCALES[key].lang, readSidebarLabels(key)])
    .filter(([, labels]) => labels !== undefined)
  const seen = new Set()
  const attach = (item) => {
    const key = sidebarKey(item)
    seen.add(key)
    if (english[key] !== item.label) {
      throw new Error(`src/i18n/en/docs-sidebar.json is out of sync with docsSidebar: "${key}" → "${item.label}"`)
    }
    const translations = {}
    for (const [lang, labels] of catalogs) {
      if (typeof labels[key] === 'string') {
        translations[lang] = labels[key]
      }
    }
    const out = { ...item }
    if (Object.keys(translations).length > 0) {
      out.translations = translations
    }
    if (Array.isArray(item.items)) {
      out.items = item.items.map(attach)
    }
    return out
  }
  const result = items.map(attach)
  for (const key of Object.keys(english)) {
    if (!seen.has(key)) {
      throw new Error(`src/i18n/en/docs-sidebar.json lists "${key}", which is not in docsSidebar`)
    }
  }
  return result
}

// The four docs URLs the 2026-08 restructure merged away, mapped to their successor. Expanded per
// locale in `redirects` below.
const DOCS_MERGE_REDIRECTS = {
  '/docs/introduction/liquid-staking/why-ton/': '/docs/introduction/liquid-staking/',
  '/docs/introduction/how-does-hipo-work/stake-gram/': '/docs/introduction/how-does-hipo-work/',
  '/docs/introduction/how-does-hipo-work/get-hgram/': '/docs/hipo-tokens/hipo-staked-gram-hgram/',
  '/docs/hipo-tokens/hipo-governance-token-hpo/tokenomics/': '/docs/hipo-tokens/hipo-governance-token-hpo/',
}

// The six GitBook-era group directories. GitBook made every sidebar group a page; the Starlight
// sidebar links pages by URL and its groups have no link, so these paths never became pages here
// and 404 in every locale. Nothing on the site points at them, but docs.hipo.finance 301s the
// legacy group URLs (`docs.hipo.finance/tutorials` -> `/docs/tutorials/`) straight into them, so
// each one lands on the page a reader arriving from the old docs was looking for. Expanded per
// locale in `redirects` below, alongside DOCS_MERGE_REDIRECTS.
const DOCS_SECTION_REDIRECTS = {
  '/docs/introduction/': '/docs/',
  '/docs/tutorials/': '/docs/tutorials/staking/',
  '/docs/security/': '/docs/security/why-your-security-matters/',
  '/docs/legal-agreements/': '/docs/legal-agreements/terms-of-use/',
  '/docs/hipo-tokens/': '/docs/hipo-tokens/hipo-staked-gram-hgram/',
  '/docs/giveaways-and-prizes/': '/docs/giveaways-and-prizes/hipo-incentive-programs/',
}

// The three /it/ URLs worth keeping resolvable after Italian was removed (2026-09-20, see
// specs/language-preference-and-locale-lineup.md and decision 16): the only ones Search Console
// showed with clicks or meaningful impressions. The other 23 /it/ URLs had 1-3 impressions and no
// clicks, and every /hi/ URL had none at all, so those 404 by design — there is no link equity to
// preserve and a stale URL that 404s is cheaper for the crawl budget than a stub. Each one points at
// its English equivalent. These paths only became eligible for `redirects` once `it` left the
// registry and stopped being built.
const REMOVED_LOCALE_REDIRECTS = {
  '/it/': '/',
  '/it/docs/': '/docs/',
  '/it/docs/giveaways-and-prizes/hipo-club/': '/docs/giveaways-and-prizes/hipo-club/',
}

export default defineConfig({
  site: 'https://hipo.finance',
  base: '/',
  output: 'static',

  trailingSlash: 'always',

  // Starlight sets `prefetch: { prefetchAll: true }` for the whole site if the config does not
  // (node_modules/@astrojs/starlight/index.ts), which leaves Astro's default strategy of 'hover'.
  // Astro's hover listener is `mouseenter`/`focusin` only, so on a touchscreen nothing was ever
  // prefetched: every tap on the dApp's bottom tab bar was a cold document fetch, and with
  // ClientRouter holding the paint through the view transition, that whole round trip lands in
  // the tap's INP.
  //
  // 'viewport' prefetches in-view links with `<link rel="prefetch">` after a 300 ms dwell, at low
  // priority and off the idle queue. It is self-limiting on the connections where it would hurt:
  // `canPrefetchUrl` refuses on a slow connection or when offline, and `elMatchesStrategy` turns
  // the 'tap' strategy on automatically there instead — so a 3G visitor gets the touchstart head
  // start rather than a sidebar's worth of speculative requests.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  // Meta-refresh stubs (with noindex) for the docs URLs that must keep resolving without being
  // pages: the four retired by the 2026-08 restructure (specs/docs-restructure.md § Merges) and
  // the six GitBook-era group directories. GitHub Pages has no server redirects, and
  // docs.hipo.finance 301s legacy GitBook paths here, so these URLs must keep resolving. Both
  // sides carry a trailing slash to match `trailingSlash: 'always'`. Only ever redirect a path
  // that no longer exists as a page, or the build emits a prerender conflict.
  //
  // The translated twins of those four pages were retired with the English ones, so every built
  // locale gets the same stub under its prefix (`/fa/docs/…/why-ton/`) — those URLs were indexed
  // while fa and ru were released. The removed locales' copies go with them: `/hi/docs/…/why-ton/`
  // and `/it/docs/…/why-ton/` were noindex stubs, so letting them 404 costs nothing.
  redirects: {
    ...REMOVED_LOCALE_REDIRECTS,
    ...Object.fromEntries(
      Object.entries({ ...DOCS_MERGE_REDIRECTS, ...DOCS_SECTION_REDIRECTS }).flatMap(([from, to]) => [
        [from, to],
        ...builtLocales()
          .filter((key) => key !== DEFAULT_LOCALE)
          .map((key) => [`/${key}${from}`, `/${key}${to}`]),
      ]),
    ),
  },

  markdown: {
    // Prefixes root-relative links in translated docs/prose Markdown with the entry's locale.
    remarkPlugins: [remarkLocalizeLinks],
  },

  vite: {
    plugins: [tailwind()],
  },

  integrations: [
    react(),
    sitemap({
      // /app/ is a legacy redirect stub (noindex); it has no content of its own to index. Draft
      // locales (I18N_INCLUDE_DRAFTS=1, local preview only) are built but must never appear in the
      // sitemap, so also drop any URL whose first path segment is a draft locale key.
      filter: (page) => {
        if (page.startsWith('https://hipo.finance/app/')) {
          return false
        }
        const segment = new URL(page).pathname.split('/')[1]
        return LOCALES[segment]?.status !== 'draft'
      },
      // Alternates (xhtml:link) for every indexable locale built in this run; `en` must be a key even
      // though /en/ is never built, because it names the unprefixed default (spec §H). No x-default
      // here: SEO.astro emits it. Draft locales are excluded even when built.
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: Object.fromEntries(indexableLocales().map((key) => [key, LOCALES[key].lang])),
      },
      // `<lastmod>` per URL, from the git history of that page's content inputs — see
      // src/data/lastmod.mjs for what counts as an input and why a wrong date is worse than none.
      // @astrojs/sitemap derives the sitemap index's own lastmod from the newest of these, so the
      // index gets a truthful date for free. `changefreq` and `priority` stay unset: Google has said
      // for years that it ignores both.
      serialize: (item) => {
        const lastmod = lastmodFor(new URL(item.url).pathname)
        return lastmod === undefined ? item : { ...item, lastmod }
      },
      // One sitemap per locale × group (`sitemap-fa-app-0.xml`, …), so Search Console's Page indexing
      // report, filtered by sitemap, shows how much of each locale and section is indexed — its
      // exports never list indexed URLs (specs/search-console-coverage-sitemaps.md). The plugin writes
      // a URL into every chunk whose callback keeps it, so all callbacks defer to the one classifier;
      // anything no callback keeps would land in a catch-all `sitemap-pages-0.xml`, which stays empty.
      chunks: Object.fromEntries(
        indexableLocales().flatMap((locale) =>
          SITEMAP_GROUPS.map((group) => {
            const key = `${locale}-${group}`
            return [key, (item) => (sitemapSegment(item.url) === key ? item : undefined)]
          }),
        ),
      ),
    }),
    assertSitemapWritten(),
    starlight({
      title: 'Hipo Docs',
      description: 'Documentation for Hipo, the liquid staking protocol on TON. Stake GRAM, receive hGRAM.',
      // Two marks, one per scheme: the cream-bodied hippo on the dark page, the warm-dark
      // line-art one on the light page. Starlight renders both and hides one via data-theme,
      // which src/components/starlight/ThemeProvider.astro sets from prefers-color-scheme.
      logo: { dark: './public/images/hipo.svg', light: './public/images/hipo-light.svg', alt: 'Hipo' },
      favicon: '/favicon.ico',
      // src/pages/404.astro already serves the whole site.
      disable404Route: true,
      defaultLocale: 'root',
      locales: starlightLocales,
      customCss: ['./src/styles/docs.css'],
      components: {
        // Warm Dark is single-theme (dark-only); these two remove Starlight's theme switcher and
        // pin the docs section to dark regardless of system preference. See the components for
        // details.
        ThemeProvider: './src/components/starlight/ThemeProvider.astro',
        ThemeSelect: './src/components/starlight/ThemeSelect.astro',
        // Adds the FAQ / Stats / Open app links from the design (Docs.dc.html); no config option
        // exists for extra header links in @astrojs/starlight ~0.40.
        Header: './src/components/starlight/Header.astro',
        // Drops draft-locale hreflang alternates and adds robots noindex on draft-locale pages, so
        // I18N_INCLUDE_DRAFTS=1 (local preview) never changes what crawlers see.
        Head: './src/components/starlight/Head.astro',
        // Renders nothing until a non-English locale is `public` (spec §G/§J); then lists public
        // locales only.
        LanguageSelect: './src/components/starlight/LanguageSelect.astro',
        // Adds the /verify/ link, which reaches the docs no other way: Starlight renders its own
        // footer, not src/components/SiteFooter.astro.
        Footer: './src/components/starlight/Footer.astro',
      },
      // Imported GitBook pages use h3/h4 for their section headings.
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      social: [
        { icon: 'telegram', label: 'Telegram', href: 'https://t.me/HipoFinance' },
        { icon: 'x.com', label: 'X', href: 'https://x.com/hipofinance' },
        { icon: 'github', label: 'GitHub', href: 'https://github.com/HipoFinance' },
      ],
      sidebar: withSidebarTranslations(docsSidebar),
    }),
  ],
})
