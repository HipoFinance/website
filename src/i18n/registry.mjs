// The locale registry: the single source of truth for which languages the site is built in.
// Plain ESM (not TypeScript) so astro.config.mjs, the node scripts under scripts/ and the TypeScript
// sources can all import it. See specs/multi-language-site.md §A and §L.
//
// The key is the URL segment (`/fa/stake/`), `lang` the BCP-47 tag used for `<html lang>` and
// `hreflang`. `Intl` uses `intl` when set and `lang` otherwise: plain `ar` formats with Latin digits
// in current ICU, so `ar` pins the Arabic-Indic numbering system (`ar-u-nu-arab`, decision 10).
// `status` drives the rollout:
//   'draft'   — built only when I18N_INCLUDE_DRAFTS=1 (local preview); never linked or indexed
//   'indexed' — built and linked for crawlers only (hreflang, sitemap); no visible language UI
//   'public'  — also listed in the language dropdown
// "Released" means indexed or public.

/**
 * @typedef {'draft' | 'indexed' | 'public'} LocaleStatus
 * @typedef {{ lang: string, dir: 'ltr' | 'rtl', label: string, tonconnect: string, status: LocaleStatus, intl?: string }} LocaleInfo
 */

export const DEFAULT_LOCALE = 'en'

/** @satisfies {Record<string, LocaleInfo>} */
export const LOCALES = {
  en: { lang: 'en', dir: 'ltr', label: 'English', tonconnect: 'en', status: 'public' },
  fa: { lang: 'fa', dir: 'rtl', label: 'فارسی', tonconnect: 'en', status: 'draft' },
  ru: { lang: 'ru', dir: 'ltr', label: 'Русский', tonconnect: 'ru', status: 'draft' },
  ar: { lang: 'ar', dir: 'rtl', label: 'العربية', tonconnect: 'en', status: 'draft', intl: 'ar-u-nu-arab' },
  de: { lang: 'de', dir: 'ltr', label: 'Deutsch', tonconnect: 'en', status: 'draft' },
  hi: { lang: 'hi', dir: 'ltr', label: 'हिन्दी', tonconnect: 'en', status: 'draft' },
  tr: { lang: 'tr', dir: 'ltr', label: 'Türkçe', tonconnect: 'en', status: 'draft' },
  it: { lang: 'it', dir: 'ltr', label: 'Italiano', tonconnect: 'en', status: 'draft' },
  id: { lang: 'id', dir: 'ltr', label: 'Bahasa Indonesia', tonconnect: 'en', status: 'draft' },
  'pt-br': { lang: 'pt-BR', dir: 'ltr', label: 'Português (Brasil)', tonconnect: 'en', status: 'draft' },
}

// Top-level route segments a locale key may never collide with.
export const RESERVED_SEGMENTS = [
  'docs',
  'faq',
  'stake',
  'unstake',
  'rewards',
  'stats',
  'defi',
  'hpo',
  'app',
  'i18n',
  'og',
  'images',
  'pagefind',
  '_astro',
]

const STATUSES = ['draft', 'indexed', 'public']

// Import-time assertions: a broken registry must fail the build, not produce odd URLs.
for (const [key, info] of Object.entries(LOCALES)) {
  if (RESERVED_SEGMENTS.includes(key)) {
    throw new Error(`i18n registry: locale key "${key}" collides with a reserved route segment`)
  }
  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(key)) {
    throw new Error(`i18n registry: locale key "${key}" must be lowercase BCP-47-like (e.g. "fa", "pt-br")`)
  }
  if (!STATUSES.includes(info.status)) {
    throw new Error(`i18n registry: locale "${key}" has unknown status "${info.status}"`)
  }
  if (info.dir !== 'ltr' && info.dir !== 'rtl') {
    throw new Error(`i18n registry: locale "${key}" has unknown dir "${info.dir}"`)
  }
}
if (LOCALES[DEFAULT_LOCALE]?.status !== 'public') {
  throw new Error(`i18n registry: the default locale "${DEFAULT_LOCALE}" must have status "public"`)
}

/** @returns {boolean} true when draft locales are included in this build (I18N_INCLUDE_DRAFTS=1). */
export function includeDrafts() {
  return typeof process !== 'undefined' && process.env?.I18N_INCLUDE_DRAFTS === '1'
}

/** @param {string} key @returns {boolean} status indexed|public */
export function isReleased(key) {
  const status = LOCALES[/** @type {keyof typeof LOCALES} */ (key)]?.status
  return status === 'indexed' || status === 'public'
}

/** @param {string} s @returns {s is keyof typeof LOCALES} */
export function isLocaleKey(s) {
  return Object.prototype.hasOwnProperty.call(LOCALES, s)
}

/**
 * Every locale built in this build: en first, then released locales (and drafts when
 * I18N_INCLUDE_DRAFTS=1) in registry order.
 * @returns {(keyof typeof LOCALES)[]}
 */
export function builtLocales() {
  const drafts = includeDrafts()
  const keys = /** @type {(keyof typeof LOCALES)[]} */ (Object.keys(LOCALES))
  return keys.filter((key) => key === DEFAULT_LOCALE || isReleased(key) || (drafts && LOCALES[key].status === 'draft'))
}

/** builtLocales() minus en — for getStaticPaths, hreflang and the sitemap. @returns {(keyof typeof LOCALES)[]} */
export function releasedLocales() {
  return builtLocales().filter((key) => key !== DEFAULT_LOCALE)
}

/** Locales with status 'public' (en included) — the language dropdown list. @returns {(keyof typeof LOCALES)[]} */
export function publicLocales() {
  const keys = /** @type {(keyof typeof LOCALES)[]} */ (Object.keys(LOCALES))
  return keys.filter((key) => LOCALES[key].status === 'public')
}

/**
 * Locales safe to show to crawlers: status indexed|public (en included). Unlike builtLocales(),
 * never includes drafts, even when I18N_INCLUDE_DRAFTS=1 — drives hreflang, og:locale:alternate and
 * the sitemap, which must stay identical whether or not drafts are built. getStaticPaths still uses
 * builtLocales()/releasedLocales().
 * @returns {(keyof typeof LOCALES)[]}
 */
export function indexableLocales() {
  const keys = /** @type {(keyof typeof LOCALES)[]} */ (Object.keys(LOCALES))
  return keys.filter((key) => key === DEFAULT_LOCALE || isReleased(key))
}
