// Catalog lookup: `t('site.nav.stake')`. Catalogs are flat JSON files at src/i18n/<locale>/<ns>.json
// (namespaces site, landing, hpo, faq, seo, app — see the contract in specs/multi-language-site.md §C).
// English is the source of truth and the fallback for every other locale; a key missing everywhere
// comes back as the key itself (never throws) with a console warning in dev.
//
// This module statically imports EVERY catalog (import.meta.glob below), so it is for Astro/build-time
// code only. The React island must import `makeT` and the types from ./make-t.ts instead, otherwise all
// the English landing/site/hpo/faq/seo JSON ends up in the island chunk.
import { DEFAULT_LOCALE } from './registry.mjs'
import { type Locale } from './locale.ts'
import { makeT, type Catalog, type Translator } from './make-t.ts'

export { interpolate, localizeHrefs, makeT } from './make-t.ts'
export type { Catalog, Params, Translator } from './make-t.ts'

// Every key of the English catalogs, for autocomplete. Empty files contribute nothing (keyof {} is never).
export type CatalogKey =
  | keyof typeof import('./en/site.json')
  | keyof typeof import('./en/landing.json')
  | keyof typeof import('./en/hpo.json')
  | keyof typeof import('./en/faq.json')
  | keyof typeof import('./en/seo.json')
  | keyof typeof import('./en/app.json')

export const NAMESPACES = ['site', 'landing', 'hpo', 'faq', 'seo', 'app'] as const
export type Namespace = (typeof NAMESPACES)[number]

// All catalogs, statically imported at build time. meta.json (review sidecar) and docs-sidebar.json are
// not catalogs and are excluded. Keyed `<locale>/<namespace>`.
const modules = import.meta.glob<{ default: Catalog }>(['./*/*.json', '!./*/meta.json', '!./*/docs-sidebar.json'], {
  eager: true,
})
const catalogs = new Map<string, Catalog>()
for (const [file, mod] of Object.entries(modules)) {
  const match = /^\.\/([^/]+)\/([^/]+)\.json$/.exec(file)
  if (match !== null && (NAMESPACES as readonly string[]).includes(match[2])) {
    catalogs.set(match[1] + '/' + match[2], mod.default ?? (mod as unknown as Catalog))
  }
}

function merged(locale: string, namespaces: readonly string[]): Catalog {
  const result: Catalog = {}
  for (const namespace of namespaces) {
    Object.assign(result, catalogs.get(locale + '/' + namespace))
  }
  return result
}

const translators = new Map<string, Translator>()

// Astro/build-time translator. Default namespaces: everything except 'app' (the island gets its
// catalog through getAppCatalog). English is always merged in as the fallback.
export function getT(
  locale: Locale,
  namespaces: readonly string[] = NAMESPACES.filter((n) => n !== 'app'),
): Translator {
  const cacheKey = locale + ':' + namespaces.join(',')
  let translator = translators.get(cacheKey)
  if (translator === undefined) {
    translator = makeT(locale, merged(locale, namespaces), merged(DEFAULT_LOCALE, namespaces))
    translators.set(cacheKey, translator)
  }
  return translator
}

// The merged 'app' namespace for a locale (English keys overlaid by the locale's), for the inline JSON
// in AppLayout and as the island's catalog.
export function getAppCatalog(locale: Locale): Catalog {
  return { ...merged(DEFAULT_LOCALE, ['app']), ...merged(locale, ['app']) }
}
