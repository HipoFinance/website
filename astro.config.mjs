import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import { existsSync, readFileSync } from 'node:fs'
import { DEFAULT_LOCALE, LOCALES, builtLocales, indexableLocales } from './src/i18n/registry.mjs'
import remarkLocalizeLinks from './src/i18n/remark-localize-links.mjs'

// Sidebar order and labels mirror the GitBook site this section was imported from.
// See specs/gitbook-docs-migration.md.
const docsSidebar = [
  {
    label: '💡 Introduction',
    items: [
      { label: '🦛 Hipo Liquid Staking Protocol', link: '/docs/' },
      {
        label: '🚰 Liquid Staking',
        items: [
          { label: '🚰 Liquid Staking', link: '/docs/introduction/liquid-staking/' },
          { label: '💎 Why TON?', link: '/docs/introduction/liquid-staking/why-ton/' },
        ],
      },
      {
        label: '⚙️ How Does Hipo Work?',
        items: [
          { label: '⚙️ How Does Hipo Work?', link: '/docs/introduction/how-does-hipo-work/' },
          { label: '🔒 Stake GRAM', link: '/docs/introduction/how-does-hipo-work/stake-gram/' },
          { label: '🔁 Get hGRAM', link: '/docs/introduction/how-does-hipo-work/get-hgram/' },
          { label: '🔑 Unstaking', link: '/docs/introduction/how-does-hipo-work/unstaking/' },
          { label: '💻 Validators', link: '/docs/introduction/how-does-hipo-work/validators/' },
        ],
      },
      { label: '🔥 Advantages of Hipo', link: '/docs/introduction/advantages-of-hipo/' },
      { label: '🎁 Hipo Rewards', link: '/docs/introduction/hipo-rewards/' },
      { label: '📈 Hipo Stats', link: '/docs/introduction/hipo-stats/' },
      { label: '📊 Hipo on Dune', link: '/docs/introduction/hipo-on-dune/' },
    ],
  },
  {
    label: '💰 Hipo Fund',
    items: [
      { label: '💰 Hipo Fund', link: '/docs/hipo-fund/' },
      {
        label: 'Quarterly Report: August 1, 2025',
        link: '/docs/hipo-fund/quarterly-report-august-1-2025/',
      },
      {
        label: 'Quarterly Report: December 18, 2025',
        link: '/docs/hipo-fund/quarterly-report-december-18-2025/',
      },
    ],
  },
  {
    label: '🛡️ Security',
    items: [
      { label: '🔐 Why Your Security Matters?', link: '/docs/security/why-your-security-matters/' },
      {
        label: '⚠️ Phishing Awareness and Prevention',
        link: '/docs/security/phishing-awareness-and-prevention/',
      },
    ],
  },
  {
    label: '📚 Tutorials',
    items: [
      { label: '🔐 Staking', link: '/docs/tutorials/staking/' },
      { label: '🔓 Unstaking', link: '/docs/tutorials/unstaking/' },
    ],
  },
  {
    label: '🪙 Hipo Tokens',
    items: [
      {
        label: '💧 Hipo Staked GRAM (hGRAM)',
        items: [
          {
            label: '💧 Hipo Staked GRAM (hGRAM)',
            link: '/docs/hipo-tokens/hipo-staked-gram-hgram/',
          },
          {
            label: '▶️ hGRAM Use Cases',
            link: '/docs/hipo-tokens/hipo-staked-gram-hgram/hgram-use-cases/',
          },
        ],
      },
      {
        label: '💎 Hipo Governance Token (HPO)',
        items: [
          {
            label: '💎 Hipo Governance Token (HPO)',
            link: '/docs/hipo-tokens/hipo-governance-token-hpo/',
          },
          {
            label: '🏦 Tokenomics',
            link: '/docs/hipo-tokens/hipo-governance-token-hpo/tokenomics/',
          },
          {
            label: '🚛 HPO Tokens Distribution',
            link: '/docs/hipo-tokens/hipo-governance-token-hpo/hpo-tokens-distribution/',
          },
        ],
      },
    ],
  },
  { label: '🗳️ DAO', link: '/docs/dao/' },
  { label: '💲 Profit Sharing', link: '/docs/profit-sharing/' },
  {
    label: '🎁 Giveaways & Prizes',
    items: [
      {
        label: '🛍️ Hipo Incentive Programs',
        link: '/docs/giveaways-and-prizes/hipo-incentive-programs/',
      },
      {
        label: '💹 TVL Milestone Rewards',
        link: '/docs/giveaways-and-prizes/tvl-milestone-rewards/',
      },
      {
        label: '⭐ Hipo Club',
        items: [
          { label: '⭐ Hipo Club', link: '/docs/giveaways-and-prizes/hipo-club/' },
          {
            label: 'Hipo Club: Season 2',
            link: '/docs/giveaways-and-prizes/hipo-club/hipo-club-season-2/',
          },
          {
            label: 'Hipo Club: Season 3',
            link: '/docs/giveaways-and-prizes/hipo-club/hipo-club-season-3/',
          },
        ],
      },
      {
        label: '🎩 Hipo Gang',
        items: [
          { label: '🎩 Hipo Gang', link: '/docs/giveaways-and-prizes/hipo-gang/' },
          {
            label: 'Hipo Gang: Season 1',
            link: '/docs/giveaways-and-prizes/hipo-gang/hipo-gang-season-1/',
          },
        ],
      },
      { label: '🖼️ Hipo NFTs', link: '/docs/giveaways-and-prizes/hipo-nfts/' },
      {
        label: '💲 Hipo $1,000,000 Rewards Program',
        link: '/docs/giveaways-and-prizes/hipo-usd1-000-000-rewards-program/',
      },
    ],
  },
  { label: '😎 Hipo Ambassadors Program', link: '/docs/hipo-ambassadors-program/' },
  {
    label: '📜 Legal Agreements',
    items: [
      { label: '📄 Terms of Use', link: '/docs/legal-agreements/terms-of-use/' },
      { label: '🔏 Privacy Policy', link: '/docs/legal-agreements/privacy-policy/' },
    ],
  },
  { label: '🤖 Hipo MCP Server', link: '/docs/hipo-mcp-server/' },
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

export default defineConfig({
  site: 'https://hipo.finance',
  base: '/',
  output: 'static',

  trailingSlash: 'always',

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
      logo: { src: './public/images/hipo.svg', alt: 'Hipo' },
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
