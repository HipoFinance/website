import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'

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

export default defineConfig({
  site: 'https://hipo.finance',
  base: '/',
  output: 'static',

  trailingSlash: 'always',

  vite: {
    plugins: [tailwind()],
  },

  integrations: [
    react(),
    sitemap(),
    starlight({
      title: 'Hipo Docs',
      description: 'Documentation for Hipo, the liquid staking protocol on TON. Stake GRAM, receive hGRAM.',
      logo: { src: './public/images/hipo.svg', alt: 'Hipo' },
      favicon: '/favicon.ico',
      // src/pages/404.astro already serves the whole site.
      disable404Route: true,
      customCss: ['./src/styles/docs.css'],
      // Imported GitBook pages use h3/h4 for their section headings.
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      social: [
        { icon: 'telegram', label: 'Telegram', href: 'https://t.me/HipoFinance' },
        { icon: 'x.com', label: 'X', href: 'https://x.com/hipofinance' },
        { icon: 'github', label: 'GitHub', href: 'https://github.com/HipoFinance' },
      ],
      sidebar: docsSidebar,
    }),
  ],
})
