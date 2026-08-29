import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import { existsSync, readFileSync } from 'node:fs'
import { DEFAULT_LOCALE, LOCALES, builtLocales, indexableLocales } from './src/i18n/registry.mjs'
import remarkLocalizeLinks from './src/i18n/remark-localize-links.mjs'

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
        label: 'Quarterly Report: August 1, 2025',
        link: '/docs/hipo-fund/quarterly-report-august-1-2025/',
      },
      {
        label: 'Quarterly Report: December 18, 2025',
        link: '/docs/hipo-fund/quarterly-report-december-18-2025/',
      },
      {
        label: 'Quarterly Report: August 24, 2026',
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

  // Meta-refresh stubs (with noindex) for the four docs URLs retired by the 2026-08 restructure
  // (specs/docs-restructure.md § Merges). GitHub Pages has no server redirects, and
  // docs.hipo.finance 301s legacy GitBook paths here, so these URLs must keep resolving. Both
  // sides carry a trailing slash to match `trailingSlash: 'always'`. Only ever redirect a path
  // that no longer exists as a page, or the build emits a prerender conflict.
  //
  // The translated twins of those four pages were retired with the English ones, so every built
  // locale gets the same stub under its prefix (`/fa/docs/…/why-ton/`) — those URLs were indexed
  // while fa/ru/hi were released.
  redirects: Object.fromEntries(
    Object.entries(DOCS_MERGE_REDIRECTS).flatMap(([from, to]) => [
      [from, to],
      ...builtLocales()
        .filter((key) => key !== DEFAULT_LOCALE)
        .map((key) => [`/${key}${from}`, `/${key}${to}`]),
    ]),
  ),

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
    }),
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
