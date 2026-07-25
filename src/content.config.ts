import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders'
import { docsSchema } from '@astrojs/starlight/schema'

export const collections = {
  // Files live at src/content/docs/<gitbook path>.md but are served under /docs/, so every entry id
  // is prefixed. `docs/index` resolves to the route /docs/. See specs/gitbook-docs-migration.md.
  docs: defineCollection({
    loader: docsLoader({
      generateId: ({ entry }) => 'docs/' + entry.replace(/\.mdx?$/, ''),
    }),
    schema: docsSchema(),
  }),
}
