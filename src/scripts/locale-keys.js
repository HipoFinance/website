// The three storage keys the language preference is built from, and their canonical spelling. Shared
// so the switchers, the suggestion bar and the pre-paint redirect (src/components/LocalePreference.astro)
// cannot drift apart; same pattern as banner-constants.js. See specs/language-preference-and-locale-lineup.md.
//
// Two consumers spell the keys out instead of importing them, deliberately, because importing anything
// makes Astro bundle a hoisted script into its own request rather than inlining it: the client script in
// src/components/LanguageSwitcher.astro, and the inline string in starlight/LanguageSelect.astro (which
// interpolates these constants at build time). Change a key here and grep for the literal.

// localStorage. "The suggestion bar has been answered, never ask again" — written by every explicit
// pick AND by dismissing the bar. Read only by banner.js.
export const LOCALE_KEY = 'hipo.locale'

// localStorage. The locale the visitor actively chose. Written ONLY by an explicit pick in a
// switcher or in the suggestion bar's link — never by a dismissal, which is why it is a second key
// rather than a second meaning for the one above: a dismissal must not turn into a redirect.
export const PREF_KEY = 'hipo.locale.pref'

// sessionStorage. Set the one time the preference redirect fires in a browsing session, so a link
// deliberately opened in another language stays readable after the first bounce.
export const REDIRECT_GUARD_KEY = 'hipo.locale.redirected'
