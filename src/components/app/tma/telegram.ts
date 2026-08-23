// Telegram Mini App detection and chrome bootstrap.
//
// Detection runs in two tiers on purpose:
//
//  1. A synchronous probe of the launch parameters (`probeTmaMode` below). Telegram appends its
//     `tgWebApp*` params to the mini app URL fragment when it opens the webview, and
//     telegram-web-app.js persists a copy in sessionStorage under `__telegram__initParams`; those
//     two are exactly the signals the SDK itself keys on, so probing them needs no SDK. The same
//     probe also runs — duplicated, and marked as such — as an inline script in AppLayout.astro,
//     so the static marketing shell is hidden before the first paint instead of flashing while the
//     island loads. This module trusts that script's verdict (`window.__hipoTma`) whenever it is
//     present and only re-probes when it is not.
//
//  2. The authoritative confirmation from `@twa-dev/sdk` once it has loaded: real `initData`, or a
//     `platform` other than 'unknown'. A tier-1 positive that tier 2 contradicts is revoked.
//
// The SDK is imported dynamically, and only when tier 1 says "telegram": its bundled copy of
// telegram-web-app.js is ~126 KB of side-effectful script that posts four events (each one a
// console.log) and installs resize handlers the moment it is evaluated. None of that belongs on
// hipo.finance in a normal browser, so outside Telegram it is never fetched at all.
//
// Manual override, used for visual verification in a desktop browser: `?tma=1` forces the mini-app
// chrome without loading the SDK, and is remembered for the rest of the tab's session because
// in-app navigation drops the query string. `?tma=0` clears it again.

export type TmaMode = 'off' | 'forced' | 'telegram'

// Type-only reference to the SDK's WebApp: `import type` here compiles away, so the module itself
// is still only ever pulled in by the dynamic import below.
type TelegramWebApp = (typeof import('@twa-dev/sdk'))['default']

export const tmaClass = 'tma'

const sessionKey = 'hipo.tma'

interface TmaWindow extends Window {
  __hipoTma?: TmaMode
}

function isTmaMode(value: unknown): value is TmaMode {
  return value === 'off' || value === 'forced' || value === 'telegram'
}

// Keep in sync with the inline probe in src/layouts/AppLayout.astro.
export function probeTmaMode(): TmaMode {
  try {
    const override = new URLSearchParams(window.location.search).get('tma')
    if (override === '1') {
      window.sessionStorage.setItem(sessionKey, 'forced')
      return 'forced'
    }
    if (override === '0') {
      window.sessionStorage.removeItem(sessionKey)
      return 'off'
    }

    const remembered = window.sessionStorage.getItem(sessionKey)
    if (isTmaMode(remembered) && remembered !== 'off') {
      return remembered
    }

    const hash = window.location.hash
    if (hash.includes('tgWebAppPlatform=') || hash.includes('tgWebAppData=')) {
      return 'telegram'
    }

    // Set by telegram-web-app.js on the first load inside the webview, so a reload that no longer
    // carries the fragment is still recognised.
    const initParams = window.sessionStorage.getItem('__telegram__initParams')
    if (initParams != null && initParams.includes('tgWebAppPlatform')) {
      return 'telegram'
    }
  } catch {
    // sessionStorage throws when storage is blocked; treat that as "not a mini app".
  }
  return 'off'
}

export function detectTmaMode(): TmaMode {
  if (typeof window === 'undefined') {
    return 'off'
  }
  const early = (window as TmaWindow).__hipoTma
  return isTmaMode(early) ? early : probeTmaMode()
}

// The ClientRouter replaces every attribute of <html> on swap (see swapRootAttributes), so this
// has to be re-applied on each in-app navigation. Model.keepRuntimeStyles carries the class onto
// the incoming document during astro:before-swap — which is flash-free, because the class is then
// already there when the attributes are copied — and this listener is the belt-and-braces retry.
function applyTmaClass() {
  document.documentElement.classList.add(tmaClass)
}

function forget() {
  try {
    window.sessionStorage.removeItem(sessionKey)
  } catch {
    // ignored, see probeTmaMode
  }
}

function remember(mode: TmaMode) {
  try {
    window.sessionStorage.setItem(sessionKey, mode)
  } catch {
    // ignored, see probeTmaMode
  }
}

// Every Telegram method throws (`WebAppMethodUnsupported`) on clients older than the version that
// introduced it, and a few of them throw for other reasons too, so each call is both
// version-checked and wrapped: an old client must degrade to "Telegram's own colors", never to a
// broken app.
function guard(label: string, call: () => void) {
  try {
    call()
  } catch (e) {
    console.warn('[hipo] Telegram ' + label + ' is unavailable on this client', e)
  }
}

/**
 * The user's Telegram UI language from the launch data (`initDataUnsafe.user.language_code`: an
 * IETF-style tag such as 'en', 'fa' or 'pt-br'), for the mini-app locale override (spec §D). Only a
 * real Telegram webview has launch data, so anything but mode 'telegram' resolves to undefined — the
 * `?tma=1` preview included. Call it after initTelegramChrome has confirmed the webview: the dynamic
 * import below is then already evaluated and just returns the cached module, so nothing is loaded or
 * initialised twice. Undefined when the SDK is missing or the launch data carries no user.
 */
export async function telegramLanguageCode(mode: TmaMode): Promise<string | undefined> {
  if (mode !== 'telegram') {
    return undefined
  }
  try {
    const WebApp = (await import('@twa-dev/sdk')).default
    const code: unknown = WebApp.initDataUnsafe?.user?.language_code
    return typeof code === 'string' && code !== '' ? code : undefined
  } catch {
    return undefined
  }
}

/**
 * Applies the mini-app chrome for the session: marks <html> so the static shell is hidden, and —
 * in a real Telegram webview — loads the SDK to blend Telegram's own chrome with ours.
 *
 * Resolves to false when the SDK contradicts the tier-1 detection, in which case the caller must
 * fall back to the normal web chrome.
 */
export async function initTelegramChrome(mode: TmaMode): Promise<boolean> {
  applyTmaClass()
  document.addEventListener('astro:after-swap', applyTmaClass)

  if (mode !== 'telegram') {
    return true
  }

  // Remembered before the SDK loads so a reload inside the webview keeps the chrome even if the
  // fragment is gone by then; dropped again below if this turns out not to be Telegram.
  remember('telegram')

  let WebApp: TelegramWebApp
  try {
    WebApp = (await import('@twa-dev/sdk')).default
  } catch (e) {
    // Chunk failed to load: keep the compact chrome (the launch params said this is a mini app)
    // and simply skip the Telegram-side calls.
    console.warn('[hipo] Telegram SDK failed to load', e)
    return true
  }

  if (WebApp.initData === '' && WebApp.platform === 'unknown') {
    document.removeEventListener('astro:after-swap', applyTmaClass)
    document.documentElement.classList.remove(tmaClass)
    forget()
    return false
  }

  const atLeast = (version: string) => {
    try {
      return WebApp.isVersionAtLeast(version)
    } catch {
      return false
    }
  }

  guard('ready', () => {
    WebApp.ready()
  })
  guard('expand', () => {
    WebApp.expand()
  })
  // Hex colors for setHeaderColor arrived in Bot API 6.9; setBackgroundColor took them from 6.1.
  // Below those versions Telegram keeps the user's theme colors, which is an acceptable fallback.
  if (atLeast('6.9')) {
    guard('setHeaderColor', () => {
      WebApp.setHeaderColor('#171312')
    })
  }
  if (atLeast('6.1')) {
    guard('setBackgroundColor', () => {
      WebApp.setBackgroundColor('#201b1a')
    })
  }
  // 7.10: the strip behind the home indicator, which sits under our own bottom tab row.
  if (atLeast('7.10')) {
    guard('setBottomBarColor', () => {
      WebApp.setBottomBarColor('#171312')
    })
  }
  // 7.7: without this, dragging the scrollable form downwards closes the mini app.
  if (atLeast('7.7')) {
    guard('disableVerticalSwipes', () => {
      WebApp.disableVerticalSwipes()
    })
  }

  return true
}
