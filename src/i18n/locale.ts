// Locale helpers shared by layouts, pages, components and the island. The site never relies on
// `Astro.currentLocale` or `astro:i18n` (spec §A): the locale is whatever `[locale]` route param
// (or pathname prefix) says, defaulting to English, which is never prefixed.
import { DEFAULT_LOCALE, LOCALES, isLocaleKey, releasedLocales } from './registry.mjs'

export type Locale = keyof typeof LOCALES
export type Dir = 'ltr' | 'rtl'

// Reads the locale from Astro.params (`Astro.params.locale ?? 'en'`). Throws on an unknown value so a
// misrouted page fails at build time instead of rendering English under a foreign prefix.
export function localeOf(astro: { params: Record<string, string | undefined> }): Locale {
  const value = astro.params.locale ?? DEFAULT_LOCALE
  if (!isLocaleKey(value)) {
    throw new Error(`Unknown locale "${value}" in route params`)
  }
  return value
}

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i

// `/stake/` → `/fa/stake/`, `/` → `/fa/`, `/fa/stake/` → `/ru/stake/` (any existing prefix is replaced),
// and English is never prefixed. Hash-only, `mailto:`, `tel:`, `http(s)://` and protocol-relative
// URLs come back unchanged, as do relative paths (`./x`, `x/`) that are not root-relative. Whatever
// trailing slash the input had is preserved; the site uses trailingSlash: 'always', so callers pass
// `/x/`.
export function localizedPath(path: string, locale: Locale): string {
  if (path === '' || EXTERNAL.test(path) || !path.startsWith('/')) {
    return path
  }
  const { path: bare } = stripLocale(path)
  if (locale === DEFAULT_LOCALE) {
    return bare
  }
  return '/' + locale + (bare === '/' ? '/' : bare)
}

// `/fa/stake/` → { locale: 'fa', path: '/stake/' }; `/stake/` → { locale: 'en', path: '/stake/' };
// `/fa` → { locale: 'fa', path: '/' }. Query string and hash are kept on `path`.
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const match = /^\/([^/?#]+)(.*)$/.exec(pathname)
  if (match !== null && isLocaleKey(match[1])) {
    const rest = match[2]
    // `/fa` and `/fa?x` → `/` and `/?x`; `/fa/stake/` → `/stake/`.
    const path = rest === '' || rest.startsWith('?') || rest.startsWith('#') ? '/' + rest : rest
    return { locale: match[1], path }
  }
  return { locale: DEFAULT_LOCALE, path: pathname }
}

// For `export const getStaticPaths = localeParams` in `src/pages/[locale]/…` — released locales plus
// drafts when I18N_INCLUDE_DRAFTS=1, never English.
export function localeParams(): { params: { locale: string } }[] {
  return releasedLocales().map((locale) => ({ params: { locale } }))
}

// Best registry match for a language tag the environment reports — Telegram's `language_code`
// ('fa', 'pt-br', 'zh-hans') or an entry of navigator.languages ('fa-IR', 'pt-BR', 'en-US') — among
// `candidates` (e.g. the released or the public locales). Case-insensitive, `_` tolerated: the exact
// key first ('pt-br'), then the primary subtag as a key ('fa-IR' → 'fa'), then any candidate sharing
// the primary subtag ('pt' / 'pt-PT' → 'pt-br'). undefined when nothing matches. Used by the Telegram
// Mini App locale override (spec §D) and the language-suggestion banner (§J).
export function matchLocale(tag: string, candidates: readonly Locale[]): Locale | undefined {
  const normalized = tag.trim().toLowerCase().replace(/_/g, '-')
  if (normalized === '') {
    return undefined
  }
  if (isLocaleKey(normalized) && candidates.includes(normalized)) {
    return normalized
  }
  const primary = normalized.split('-')[0]
  if (isLocaleKey(primary) && candidates.includes(primary)) {
    return primary
  }
  return candidates.find((candidate) => candidate.split('-')[0] === primary)
}

// BCP-47 tag for `<html lang>` and hreflang.
export function langOf(locale: Locale): string {
  return LOCALES[locale].lang
}

// The tag handed to Intl.NumberFormat / Intl.DateTimeFormat: the registry's `intl` override when set
// (`ar` → `ar-u-nu-arab` for Arabic-Indic digits), otherwise `lang`.
export function intlOf(locale: Locale): string {
  const info: { lang: string; intl?: string } = LOCALES[locale]
  return info.intl ?? info.lang
}

export function dirOf(locale: Locale): Dir {
  return LOCALES[locale].dir
}
