// "Log in with Telegram" on the website (specs/club-website.md §3; spec 2 §2): Telegram's login popup
// for @HipoFinanceBot with request_access=write, opened from our own button. Its callback's fields
// go unchanged to `clubauth {widget}`.
//
// The popup is Telegram's telegram-widget.js (`Telegram.Login.auth`), loaded when the Link Telegram
// window opens (ClubModel.prepareTelegramLogin): it is the only third-party script on the Club pages. The popup only works on the domain set for the
// bot in BotFather (hipo.finance), so it cannot be tried on localhost; the mock stands in there.
//
// The bot's numeric id is public (it is the part of the bot token before the colon, and Telegram
// shows it in the popup URL). It is CLUB_TG_BOT_ID in src/data/club-flag.mjs; PUBLIC_CLUB_TG_BOT_ID
// overrides it, so a dev bot (spec Open question 3) can be used without a code change. A build with
// the Club fails when the id in use is empty or not all digits (clubBuildProblems).
import { CLUB_TG_BOT_ID } from '../../../data/club-flag.mjs'

const WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22'

export const TELEGRAM_BOT_ID = (import.meta.env.PUBLIC_CLUB_TG_BOT_ID as string | undefined) || CLUB_TG_BOT_ID

// The fields spec 2 accepts from the widget; anything else Telegram adds is left out.
const WIDGET_FIELDS = ['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash'] as const

export type WidgetData = Partial<Record<(typeof WIDGET_FIELDS)[number], string | number>>

interface TelegramLogin {
  auth(options: { bot_id: string; request_access?: 'write'; lang?: string }, callback: (data: unknown) => void): void
}

let loading: Promise<TelegramLogin> | undefined
// The widget once loaded, so that a press can open the popup with nothing awaited before it.
let loaded: TelegramLogin | undefined
let pendingScript: HTMLScriptElement | undefined
// Loads given up on; a retry's URL carries it, because the browser joins a script with the same URL
// to the request that is still hanging.
let abandoned = 0

interface LoginInFlight {
  promise: Promise<WidgetData | undefined>
  popup?: Window | null
}
// The login under way, until the widget answers.
let inFlight: LoginInFlight | undefined
// How long a closed popup's answer is waited for (the widget's /auth/get request to Telegram).
const CLOSED_ANSWER_TIMEOUT = 15_000

function loadWidget(): Promise<TelegramLogin> {
  loading ??= new Promise<TelegramLogin>((resolve, reject) => {
    const existing = (window as unknown as { Telegram?: { Login?: TelegramLogin } }).Telegram?.Login
    if (existing !== undefined) {
      resolve(existing)
      return
    }
    const script = document.createElement('script')
    pendingScript = script
    script.src = abandoned === 0 ? WIDGET_SRC : `${WIDGET_SRC}&retry=${abandoned}`
    script.async = true
    script.onload = () => {
      const login = (window as unknown as { Telegram?: { Login?: TelegramLogin } }).Telegram?.Login
      if (login === undefined) {
        reject(new Error('Telegram login unavailable'))
      } else {
        resolve(login)
      }
    }
    script.onerror = () => reject(new Error('Telegram login script failed'))
    document.head.appendChild(script)
  }).then(
    (login) => {
      loaded = login
      pendingScript = undefined
      return login
    },
    (e) => {
      loading = undefined
      pendingScript = undefined
      throw e
    },
  )
  return loading
}

/** Loads Telegram's login script ahead of the click that opens it. */
export function preloadTelegramLogin(): Promise<void> {
  return loadWidget().then(() => undefined)
}

/** Gives up on a load that hangs (telegram.org unreachable), so that the next try fetches afresh, for
 * example once a VPN is on, instead of waiting on the same stalled request. */
export function abandonTelegramLogin() {
  if (pendingScript === undefined) {
    return
  }
  pendingScript.onload = null
  pendingScript.onerror = null
  pendingScript.remove()
  pendingScript = undefined
  loading = undefined
  abandoned++
}

/** Thrown when the browser blocked Telegram's login popup. */
export class PopupBlockedError extends Error {
  // Read as a name by ClubModel, which only imports this module lazily.
  override name = 'PopupBlockedError'
}

/** Opens Telegram's login popup; resolves to the widget fields, or undefined when it was closed. The
 * popup opens in this call, before it returns: call it straight from the press, after
 * preloadTelegramLogin, with nothing awaited first, or the browser (Safari above all) may no longer
 * count the press and block the popup. */
export function telegramLogin(lang?: string): Promise<WidgetData | undefined> {
  if (!/^[0-9]+$/.test(TELEGRAM_BOT_ID)) {
    return Promise.reject(new Error('the Telegram bot id is not set (CLUB_TG_BOT_ID)'))
  }
  const login = loaded
  if (login === undefined) {
    return Promise.reject(new Error('Telegram login not loaded yet'))
  }
  // A press while the last login is unanswered joins it: the widget answers only one callback per
  // bot, so a second auth call can wait forever (Not now, then the window reopened while the popup
  // is open, or while the widget is still asking Telegram about a closed one).
  if (inFlight !== undefined) {
    if (inFlight.popup != null && !inFlight.popup.closed) {
      inFlight.popup.focus()
    }
    return inFlight.promise
  }
  const current: { promise?: Promise<WidgetData | undefined>; popup?: Window | null } = {}
  const promise = new Promise<WidgetData | undefined>((resolve, reject) => {
    // When the browser blocks the popup, window.open returns null and the widget never calls back,
    // so the press would wait forever. The widget keeps the popup to itself, so window.open is
    // watched for the length of the (synchronous) auth call.
    const open = window.open
    let opened = false
    let popup: Window | null | undefined
    window.open = (...args: Parameters<typeof window.open>) => {
      opened = true
      return (popup = current.popup = open.apply(window, args))
    }
    try {
      login.auth({ bot_id: TELEGRAM_BOT_ID, request_access: 'write', lang }, onAuth)
    } finally {
      window.open = open
    }
    // null from the browser; some blockers return undefined instead
    if (opened && !popup) {
      reject(new PopupBlockedError('the Telegram login popup was blocked'))
    }

    // Once the popup is closed the widget asks Telegram for the result; if that never answers, give
    // up after a while so that the next press opens a fresh popup instead of joining this one.
    const watch = setInterval(() => {
      if (popup == null || popup.closed) {
        clearInterval(watch)
        setTimeout(() => resolve(undefined), CLOSED_ANSWER_TIMEOUT)
      }
    }, 500)

    function onAuth(data: unknown) {
      if (data == null || typeof data !== 'object') {
        resolve(undefined)
        return
      }
      const picked: WidgetData = {}
      for (const field of WIDGET_FIELDS) {
        const value = (data as Record<string, unknown>)[field]
        if (typeof value === 'string' || typeof value === 'number') {
          picked[field] = value
        }
      }
      resolve(picked)
    }
  })
  current.promise = promise
  inFlight = current as LoginInFlight
  const clear = () => {
    if (inFlight === current) {
      inFlight = undefined
    }
  }
  promise.then(clear, clear)
  return promise
}

/** The Mini App's launch data, for `clubauth {init_data}`; undefined outside a real Telegram webview. */
export async function telegramInitData(): Promise<string | undefined> {
  try {
    const WebApp = (await import('@twa-dev/sdk')).default
    return WebApp.initData === '' ? undefined : WebApp.initData
  } catch {
    return undefined
  }
}
