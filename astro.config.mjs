import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import react from '@astrojs/react'

export default defineConfig({
  site: 'https://hipo.finance',
  base: '/',
  output: 'static',

  vite: {
    plugins: [tailwind()],
  },

  integrations: [react()],
})
