import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { observer } from 'mobx-react-lite'
import { Coins, Gift, ChartLine, ArrowLeftRight, type LucideIcon } from 'lucide-react'
import { CLUB_ON, Model } from './Model'
import LanguageSwitcher from './LanguageSwitcher'
import HpoIcon from './HpoIcon'

interface Props {
  model: Model
}

type Page = 'stake' | 'reward' | 'club' | 'stats' | 'defi'

// The five main items, in the order of the inline nav (the bottom tab bar leaves out HPO): Stake, the Club slot,
// Stats, DeFi, HPO. Same list as SiteHeader.astro and shell/ShellHeader.astro — keep the three in
// sync. The tab icons are the mini app's (TmaTabs), HPO is the one-colour coin. Labels are catalog
// keys, resolved through model.t at render time; hrefs are bare paths, model.localizedPath prefixes
// the current locale. Items with an appPage stay inside the app's own navigation (no page load);
// HPO is a plain link, a full page load.
// The second slot is Rewards before the launch commit and the Club after it (CLUB_ON).
const mainItems: { href: string; label: string; appPage?: Page; icon?: LucideIcon }[] = [
  { href: '/stake/', label: 'app.nav.stake', appPage: 'stake', icon: Coins },
  CLUB_ON
    ? { href: '/club/', label: 'app.nav.club', appPage: 'club', icon: Gift }
    : { href: '/rewards/', label: 'app.nav.rewards', appPage: 'reward', icon: Gift },
  { href: '/stats/', label: 'app.nav.stats', appPage: 'stats', icon: ChartLine },
  { href: '/defi/', label: 'app.nav.defi', appPage: 'defi', icon: ArrowLeftRight },
  { href: '/hpo/', label: 'app.nav.hpo' },
]

// Secondary links: only in the hamburger menu, under the main items. The blog is English-only
// (hreflang on other locales, as in SiteFooter.astro) and has no locale prefix.
const secondaryLinks: { href: string; label: string; blog?: boolean }[] = [
  // HPO is in the inline nav on wide screens; below lg it is left out of the bottom tab bar (the app
  // sections only, as in the Mini App's TmaTabs) and listed here instead.
  { href: '/hpo/', label: 'app.nav.hpo' },
  { href: '/docs/', label: 'app.nav.docs' },
  { href: '/faq/', label: 'app.nav.faq' },
  { href: '/blog/', label: 'app.nav.blog', blog: true },
]

const Header = observer(({ model }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false)

  // Turns off pull-to-refresh while the menu is open: Firefox mobile was reading a tap on a lower
  // menu item as the refresh gesture, because the gesture is armed whenever the document is at
  // scroll top. The rule is html.menu-open in global.css, which the app pages also load, and
  // SiteHeader.astro's script sets the same class on the static pages.
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', menuOpen)
    return () => document.documentElement.classList.remove('menu-open')
  }, [menuOpen])

  // A click anywhere outside the menu and its toggle button closes the menu, as does Escape. The
  // toggle is left out so its own onClick does the toggling; links inside close it in siteLinkClick.
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!menuOpen) {
      return
    }
    const onClick = (e: globalThis.MouseEvent) => {
      const target = e.target as Node
      if (!menuRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const isActive = (appPage?: Page) => appPage != null && model.activePage === appPage

  const siteLinkClick = (appPage?: Page) => (e: MouseEvent) => {
    setMenuOpen(false)
    if (appPage != null) {
      e.preventDefault()
      model.navigateToPage(appPage)
    }
  }

  return (
    <div className='font-body text-text w-full'>
      {/* Below sm the row wraps into two: logo · language · menu, then Connect/Disconnect full width on
          its own line — Connect's label is too long in most locales to share a phone-width row
          with the language switcher. The action group dissolves (`contents`) so its children flow
          as items of this row; ShellHeader.astro mirrors this exactly. */}
      <div className='mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-5 max-sm:flex-wrap md:px-10'>
        <a href={model.localizedPath('/')} className='flex flex-none items-center gap-2.5'>
          <img src='/images/hipo.svg' alt='Hipo' className='logo-on-dark size-9' />
          <img src='/images/hipo-light.svg' alt='Hipo' className='logo-on-light size-9' />
          <span className='font-wordmark text-2xl font-semibold'>Hipo</span>
        </a>

        <nav
          aria-label={model.t('app.header.siteNav')}
          className='text-text-muted text-body hidden items-center gap-6 font-medium lg:flex'
        >
          {mainItems.map(({ href, label, appPage }) => (
            <a
              key={href}
              href={model.localizedPath(href)}
              className={isActive(appPage) ? 'text-accent' : 'hover:text-accent'}
              onClick={siteLinkClick(appPage)}
            >
              {model.t(label)}
            </a>
          ))}
        </nav>

        <div className='flex min-w-0 items-center gap-4 max-sm:contents'>
          <LanguageSwitcher model={model} className='max-sm:ms-auto' />

          <div className='max-sm:order-last max-sm:flex max-sm:basis-full sm:contents'>
            {model.isWalletConnected ? (
              <button
                type='button'
                title={model.t('app.header.disconnectWallet')}
                className='border-border bg-surface text-text-muted hover:text-accent min-h-11 cursor-pointer rounded-full border px-5 py-2.5 text-sm font-medium whitespace-nowrap max-sm:w-full'
                onClick={model.disconnect}
              >
                <span>
                  <bdi className='num'>{model.connectedAddressShort}</bdi> ·{' '}
                </span>
                {model.t('app.header.disconnect')}
              </button>
            ) : (
              // Pressing Connect fetches the wallet layer before the modal can open, and a stored
              // session is restored on open, which can take a while on a slow network; meanwhile the
              // button dims, says "Connecting…" and stops taking presses.
              <button
                type='button'
                disabled={model.isConnectBusy}
                aria-busy={model.isConnectBusy}
                className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover min-h-11 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap disabled:cursor-progress disabled:opacity-70 max-sm:w-full'
                onClick={model.connect}
              >
                {model.isConnectBusy ? model.t('app.common.connecting') : model.t('app.common.connectWallet')}
              </button>
            )}
          </div>

          <button
            ref={toggleRef}
            type='button'
            className='text-text cursor-pointer lg:hidden'
            title={model.t('app.header.toggleMenu')}
            aria-label={model.t('app.header.toggleMenu')}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className='size-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div ref={menuRef} className='px-6 pb-4 lg:hidden'>
          <nav
            aria-label={model.t('app.header.siteNav')}
            className='text-text-muted text-body flex flex-col gap-1 font-medium'
          >
            {secondaryLinks.map(({ href, label, blog }) => (
              <a
                key={href}
                href={blog ? href : model.localizedPath(href)}
                hrefLang={blog && model.locale !== 'en' ? 'en' : undefined}
                className='hover:bg-surface hover:text-accent rounded-lg px-3 py-2.5'
                onClick={siteLinkClick()}
              >
                {model.t(label)}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Bottom tab bar: the four app sections within thumb's reach below lg, where the inline nav is
          hidden. The hamburger (also below lg only) carries HPO and the secondary links. */}
      <nav
        aria-label={model.t('app.header.appSections')}
        className='border-border bg-surface-deep fixed start-0 end-0 bottom-0 z-10 flex w-full flex-row border-t select-none lg:hidden'
      >
        {mainItems
          .filter((item) => item.appPage != null)
          .map(({ href, label, appPage, icon: Icon }) => {
            const active = isActive(appPage)
            const className =
              'flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-medium ' +
              (active ? 'text-accent' : 'text-text-muted hover:text-accent')
            const content = (
              <>
                {Icon ? <Icon className='size-[18px]' aria-hidden='true' /> : <HpoIcon className='size-[18px]' />}
                <span>{model.t(label)}</span>
              </>
            )
            return appPage != null ? (
              <button
                key={href}
                type='button'
                aria-label={model.t(label)}
                aria-current={active ? 'page' : undefined}
                className={className}
                onClick={() => {
                  model.navigateToPage(appPage)
                }}
              >
                {content}
              </button>
            ) : (
              <a key={href} href={model.localizedPath(href)} aria-label={model.t(label)} className={className}>
                {content}
              </a>
            )
          })}
      </nav>
    </div>
  )
})

export default Header
