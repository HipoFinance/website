// The glob-free half of the translator: `makeT` builds a Translator from two flat catalogs (the
// locale's and the English fallback), with `{name}` interpolation and href localisation for the
// restricted inline-HTML values. The React island imports from here so its chunk carries only its own
// English app.json; `t.ts` adds the build-time `import.meta.glob` over every catalog for Astro code and
// re-exports everything below, so either import path works.
import { DEFAULT_LOCALE } from './registry.mjs'
import { localizedPath, type Locale } from './locale.ts'

export type Catalog = Record<string, string>
export type Params = Record<string, string | number>

export interface Translator {
  locale: Locale
  // Plain text lookup with `{name}` interpolation.
  t(key: string, params?: Params): string
  // Same, for values that carry the restricted inline-HTML subset (a strong em code br); root-relative
  // href="/…" attributes are prefixed with the locale. Render with set:html / dangerouslySetInnerHTML.
  tHtml(key: string, params?: Params): string
  // True when the key exists in this locale's catalog or the English fallback.
  has(key: string): boolean
}

const isDev = Boolean(import.meta.env?.DEV)
const warned = new Set<string>()

function warnOnce(message: string): void {
  if (isDev && !warned.has(message)) {
    warned.add(message)
    console.warn('[i18n] ' + message)
  }
}

export function interpolate(template: string, params?: Params): string {
  if (params === undefined) {
    return template
  }
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : whole,
  )
}

// Rewrites root-relative href="/…" (double or single quotes, not protocol-relative) through localizedPath.
const HREF = /(href\s*=\s*)(["'])(\/(?!\/)[^"']*)\2/g
export function localizeHrefs(html: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) {
    return html
  }
  return html.replace(HREF, (_whole, attr: string, quote: string, href: string) => {
    return attr + quote + localizedPath(href, locale) + quote
  })
}

// Lookup order: catalog → fallback → the key itself. Never throws; warns once per key in dev.
export function makeT(locale: Locale, catalog: Catalog, fallback: Catalog): Translator {
  const lookup = (key: string): string => {
    if (Object.prototype.hasOwnProperty.call(catalog, key)) {
      return catalog[key]
    }
    if (Object.prototype.hasOwnProperty.call(fallback, key)) {
      if (locale !== DEFAULT_LOCALE) {
        warnOnce(`"${key}" is missing from the ${locale} catalog; using English`)
      }
      return fallback[key]
    }
    warnOnce(`"${key}" is missing from every catalog (locale ${locale})`)
    return key
  }
  return {
    locale,
    t: (key, params) => interpolate(lookup(key), params),
    tHtml: (key, params) => localizeHrefs(interpolate(lookup(key), params), locale),
    has: (key) =>
      Object.prototype.hasOwnProperty.call(catalog, key) || Object.prototype.hasOwnProperty.call(fallback, key),
  }
}
