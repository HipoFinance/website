import { BANNER_KEY, HIDDEN_CODE, OFF_CLASS } from './banner-constants.js'

// The visitor's language choice (spec §J): the locale key they picked from the suggestion, or 'en' when
// they dismissed it. Any value means "asked and answered" — the suggestion never shows again.
const LOCALE_KEY = 'hipo.locale'

function readStorage(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage blocked: the banner simply shows again next time.
  }
}

// Which of `targets` (public locales, keyed by registry key) the browser prefers: the first entry of
// navigator.languages that matches any public locale decides — exact key ('pt-br'), then primary subtag
// ('fa-IR' → 'fa'), then a key sharing the primary subtag ('pt' → 'pt-br'). Stops at the first match
// so ['en-US', 'fa'] means "English first": no suggestion. Mirrors matchLocale in src/i18n/locale.ts.
function preferredLocale(targets) {
  const keys = Object.keys(targets)
  const languages = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language]
  for (const language of languages) {
    if (typeof language !== 'string') {
      continue
    }
    const tag = language.trim().toLowerCase().replace(/_/g, '-')
    if (tag === '') {
      continue
    }
    if (keys.includes(tag)) {
      return tag
    }
    const primary = tag.split('-')[0]
    if (keys.includes(primary)) {
      return primary
    }
    const shared = keys.find((key) => key.split('-')[0] === primary)
    if (shared != null) {
      return shared
    }
  }
  return undefined
}

// Language suggestion (spec §J). The element exists only on English pages when at least two locales are
// public (see Banner.astro), so on today's site this is a no-op. Returns true when the suggestion is
// shown, in which case the promo banner stays hidden for this view.
function initLanguageSuggestion() {
  const suggest = document.getElementById('lang-suggest')
  if (suggest == null || readStorage(LOCALE_KEY) != null) {
    return false
  }
  let targets
  try {
    targets = JSON.parse(suggest.dataset.targets ?? '{}')
  } catch {
    return false
  }
  const locale = preferredLocale(targets)
  const target = locale == null ? undefined : targets[locale]
  if (locale == null || locale === suggest.dataset.pageLocale || target == null) {
    return false
  }

  // "Read this page in {language}?" — in the target language, with the language label as the link.
  const textNode = document.getElementById('lang-suggest-text')
  const text = target.text ?? suggest.dataset.text ?? '{language}'
  if (target.lang) {
    suggest.lang = target.lang
  }
  if (target.dir) {
    suggest.dir = target.dir
  }
  const [before, after = ''] = text.split('{language}')
  const link = document.createElement('a')
  link.href = target.href
  link.hreflang = target.lang
  link.lang = target.lang
  link.className = 'text-accent font-bold underline underline-offset-2'
  link.textContent = target.label
  link.addEventListener('click', () => {
    writeStorage(LOCALE_KEY, locale)
  })
  textNode?.append(before, link, after)

  const dismiss = document.getElementById('lang-suggest-dismiss')
  if (dismiss != null && target.dismiss) {
    dismiss.setAttribute('aria-label', target.dismiss)
  }
  dismiss?.addEventListener('click', () => {
    suggest.classList.add('hidden')
    writeStorage(LOCALE_KEY, suggest.dataset.pageLocale ?? 'en')
  })

  suggest.classList.remove('hidden')
  return true
}

// The banner's visibility on a normal page load is settled before paint by the inline script in
// Banner.astro; this only has to keep that true across ClientRouter swaps, which is why it runs on
// astro:after-swap rather than astro:page-load. Astro rebuilds <html>'s attributes from the
// incoming document during a swap, dropping the class the inline script set — and after-swap is
// the last moment before the new page is painted, so re-applying here shifts nothing. (This is the
// same hook a theme class would use.)
let applyBannerState = () => {
  document.documentElement.classList.toggle(OFF_CLASS, readStorage(BANNER_KEY) === HIDDEN_CODE)
}

// Listener wiring, which can safely wait until the page is interactive. Re-runs per swap because
// each swapped-in page carries a fresh #close-banner.
let initBanner = () => {
  const suggested = initLanguageSuggestion()

  const banner = document.getElementById('site-banner')
  if (banner == null) {
    return
  }

  // The language suggestion takes precedence: one bar at a time. This path can still shift the
  // page, because whether the suggestion applies depends on navigator.languages and cannot be
  // decided from storage alone — but #lang-suggest only renders once a second locale is `public`,
  // so today it never runs. See the follow-up in changelog/2026-08-25-banner-cls.md.
  if (suggested) {
    document.documentElement.classList.add(OFF_CLASS)
  }

  document.getElementById('close-banner')?.addEventListener('click', () => {
    document.documentElement.classList.add(OFF_CLASS)
    writeStorage(BANNER_KEY, HIDDEN_CODE)
  })
}

initBanner()
document.addEventListener('astro:after-swap', applyBannerState)
document.addEventListener('astro:page-load', initBanner)
