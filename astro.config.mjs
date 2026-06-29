import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://hipo.finance',
  base: '/',
  output: 'static',

  trailingSlash: 'always',

  vite: {
    plugins: [tailwind()],
  },

  integrations: [react(), sitemap()],
})
