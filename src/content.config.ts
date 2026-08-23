import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { builtLocales, isLocaleKey } from './i18n/registry.mjs'

// Files live at src/content/docs/<gitbook path>.md but are served under /docs/, so every entry id is
// prefixed: `x.md` → `docs/x` (→ /docs/x/), `index.md` → `docs/index` (→ /docs/). A translation lives
// under a registry-locale directory and gets a locale-first id so Starlight recognises the language
// from the first segment: `fa/x.md` → `fa/docs/x` (→ /fa/docs/x/), `fa/index.md` → `fa/docs/index`
// (→ /fa/docs/). Only registry keys count as locale directories. See specs/gitbook-docs-migration.md
// and specs/multi-language-site.md §G.
function docsEntryId({ entry }: { entry: string }): string {
  const path = entry.replace(/\.mdx?$/, '')
  const slash = path.indexOf('/')
  const first = slash === -1 ? '' : path.slice(0, slash)
  if (isLocaleKey(first)) {
    return first + '/docs/' + path.slice(slash + 1)
  }
  return 'docs/' + path
}

// Translations of locales that are not built in this run (status `draft` without I18N_INCLUDE_DRAFTS=1)
// must not reach Starlight at all: their files exist on disk, and with the locale absent from Starlight's
// `locales` the entries would be served as root-locale (English) pages under /<locale>/docs/ — no
// `lang`, no `noindex`, wrong hreflang. Filter them out of the store after the stock loader has run.
const starlightDocsLoader = docsLoader({ generateId: docsEntryId })
const built = new Set<string>(builtLocales())
const filteredDocsLoader: typeof starlightDocsLoader = {
  ...starlightDocsLoader,
  async load(context) {
    await starlightDocsLoader.load(context)
    for (const id of context.store.keys()) {
      const first = id.slice(0, id.indexOf('/'))
      if (isLocaleKey(first) && !built.has(first)) {
        context.store.delete(id)
      }
    }
  },
}

export const collections = {
  docs: defineCollection({
    loader: filteredDocsLoader,
    schema: docsSchema(),
  }),

  // Starlight UI strings per language (src/content/i18n/<lang>.json, keyed by BCP-47 lang): the
  // built-in Starlight keys may be overridden here, and `hipo.*` are the keys our component
  // overrides under src/components/starlight/ read through `Astro.locals.t()`.
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema({
      extend: z
        .object({
          'hipo.header.faq': z.string(),
          'hipo.header.stats': z.string(),
          'hipo.header.openApp': z.string(),
        })
        .partial(),
    }),
  }),

  // Long-form copy rendered into designed pages, one Markdown file per block, keyed by locale:
  //   <locale>/faq/<section>/<anchor-id>   (the /faq/ page; `section` + `question`, answer as body)
  //   <locale>/hpo-faq/<nn>-<slug>         (the FAQ on /hpo/; `question`, answer as body)
  //   <locale>/shell/<page>/cards/<nn>-<slug>  (explainer cards under the dApp; `title`, prose as body)
  //   <locale>/shell/<page>/faq/<nn>-<slug>    (Q&As feeding the FAQPage JSON-LD; plain-text body)
  // See specs/multi-language-site.md (C.2). Anchor ids stay the English slugs in every locale.
  prose: defineCollection({
    loader: glob({ base: './src/content/prose', pattern: '**/*.md' }),
    schema: z.object({
      order: z.number(),
      title: z.string().optional(),
      question: z.string().optional(),
      section: z.string().optional(),
    }),
  }),
}
