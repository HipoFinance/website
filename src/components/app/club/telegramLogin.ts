// "Log in with Telegram" on the website (specs/club-website.md §3; spec 2 §2): Telegram's login popup
// for @HipoFinanceBot with request_access=write, opened from our own button. Its callback's fields
// go unchanged to `clubauth {widget}`.
//
// The popup is Telegram's telegram-widget.js (`Telegram.Login.auth`), loaded on the first press: it
// is the only third-party script on the Club pages. The popup only works on the domain set for the
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

function loadWidget(): Promise<TelegramLogin> {
  loading ??= new Promise<TelegramLogin>((resolve, reject) => {
    const existing = (window as unknown as { Telegram?: { Login?: TelegramLogin } }).Telegram?.Login
    if (existing !== undefined) {
      resolve(existing)
      return
    }
    const script = document.createElement('script')
    script.src = WIDGET_SRC
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
  }).catch((e) => {
    loading = undefined
    throw e
  })
  return loading
}

/** Opens Telegram's login popup; resolves to the widget fields, or undefined when it was closed. */
export async function telegramLogin(lang?: string): Promise<WidgetData | undefined> {
  if (!/^[0-9]+$/.test(TELEGRAM_BOT_ID)) {
    throw new Error('the Telegram bot id is not set (CLUB_TG_BOT_ID)')
  }
  const login = await loadWidget()
  return new Promise((resolve) => {
    login.auth({ bot_id: TELEGRAM_BOT_ID, request_access: 'write', lang }, (data) => {
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
    })
  })
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
