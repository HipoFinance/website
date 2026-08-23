// /i18n/<locale>.json — the island's merged app catalog for one locale, as a static, cacheable file.
//
// The normal delivery path is the #i18n-app JSON tag that AppLayout inlines into each localized page
// (spec §D). Inside the Telegram Mini App the URL is fixed by BotFather and never carries a locale, so
// the island picks the user's Telegram language itself (Model.applyTelegramLocale) and fetches the
// catalog from here. One file per non-English locale built in this run (released, plus drafts with
// I18N_INCLUDE_DRAFTS=1); English is bundled in the island and needs no file.
import type { APIRoute } from 'astro'
import { localeParams, type Locale } from '../../i18n/locale.ts'
import { getAppCatalog } from '../../i18n/t.ts'

export const getStaticPaths = localeParams

export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale
  return new Response(JSON.stringify(getAppCatalog(locale)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
