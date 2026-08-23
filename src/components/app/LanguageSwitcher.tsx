import { observer } from 'mobx-react-lite'
import { LOCALES, publicLocales } from '../../i18n/registry.mjs'
import { langOf, localizedPath } from '../../i18n/locale.ts'
import { Model } from './Model'

// Spec §J: a picked language is remembered so the one-time "Read this in …?" suggestion (banner.js,
// same key) never re-asks. Storage may be blocked; the link works regardless.
function rememberLocale(locale: string) {
  try {
    localStorage.setItem('hipo.locale', locale)
  } catch {
    // ignore
  }
}

interface Props {
  model: Model
  className?: string
}

// The island's language dropdown (spec §J): the React twin of src/components/LanguageSwitcher.astro.
// Lists `public` locales only and renders nothing until at least two are public, so exposing a
// language is a registry edit, not a code change. Plain <details>/<summary>, real <a href> per
// locale built from localizedPath(model.activePath, locale) so it round-trips `/fa/stake/` ↔ `/stake/`
// — activePath is MobX state, so the hrefs follow in-app navigation (location.pathname would not).
const LanguageSwitcher = observer(({ model, className }: Props) => {
  const locales = publicLocales()
  if (locales.length < 2) {
    return null
  }
  const path = model.activePath
  const label = model.t('app.header.language')
  return (
    <details data-i18n-switcher className={'group relative' + (className == null ? '' : ' ' + className)}>
      <summary
        className='border-border bg-surface text-text-muted hover:text-accent flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden'
        title={label}
      >
        <span className='sr-only'>{label}: </span>
        <svg className='size-4 shrink-0' fill='none' stroke='currentColor' strokeWidth='1.8' viewBox='0 0 24 24'>
          <circle cx='12' cy='12' r='9' />
          <path strokeLinecap='round' d='M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18' />
        </svg>
        <span>{LOCALES[model.locale].label}</span>
        <svg
          className='size-3 shrink-0 transition-transform group-open:rotate-180'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='m6 9 6 6 6-6' />
        </svg>
      </summary>
      <ul className='border-border bg-surface absolute end-0 top-full z-20 mt-2 min-w-40 rounded-xl border py-1.5 shadow-lg'>
        {locales.map((l) => {
          const current = l === model.locale
          return (
            <li key={l}>
              <a
                href={localizedPath(path, l)}
                hrefLang={langOf(l)}
                lang={langOf(l)}
                aria-current={current ? 'page' : undefined}
                onClick={() => {
                  rememberLocale(l)
                }}
                className={
                  'hover:bg-surface-deep hover:text-accent block px-4 py-2 text-sm ' +
                  (current ? 'text-accent' : 'text-text-muted')
                }
              >
                {LOCALES[l].label}
              </a>
            </li>
          )
        })}
      </ul>
    </details>
  )
})

export default LanguageSwitcher
