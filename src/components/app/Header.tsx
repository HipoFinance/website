import { useState, type MouseEvent } from 'react'
import { observer } from 'mobx-react-lite'
import { Coins, Gift, ChartLine, ArrowLeftRight, type LucideIcon } from 'lucide-react'
import { Model } from './Model'

interface Props {
  model: Model
}

type Page = 'stake' | 'reward' | 'stats' | 'defi'

// The app pages reachable from the mobile bottom tab bar. Same icons as the mini app's TmaTabs.
const pages: { page: Page; label: string; icon: LucideIcon }[] = [
  { page: 'stake', label: 'Stake', icon: Coins },
  { page: 'reward', label: 'Rewards', icon: Gift },
  { page: 'stats', label: 'Stats', icon: ChartLine },
  { page: 'defi', label: 'DeFi', icon: ArrowLeftRight },
]

// Keep in sync with src/components/SiteHeader.astro — same items in the same order with the same
// classes, so the one flat menu reads identically on the static pages and the app pages. Links
// with an appPage stay inside the app's own navigation instead of a full page load.
const siteLinks: { href: string; label: string; appPage?: Page }[] = [
  { href: '/', label: 'Home' },
  { href: '/hpo/', label: 'HPO' },
  { href: '/docs/', label: 'Docs' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/stake/', label: 'Stake', appPage: 'stake' },
  { href: '/rewards/', label: 'Rewards', appPage: 'reward' },
  { href: '/stats/', label: 'Stats', appPage: 'stats' },
  { href: '/defi/', label: 'DeFi', appPage: 'defi' },
]

const Header = observer(({ model }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false)

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
      <div className='mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-6 py-5 md:px-12'>
        <a href='/' className='flex flex-none items-center gap-2.5'>
          <img src='/images/hipo.svg' alt='Hipo' className='logo-on-dark size-9' />
          <img src='/images/hipo-light.svg' alt='Hipo' className='logo-on-light size-9' />
          <span className='font-fredoka text-2xl font-semibold'>Hipo</span>
        </a>

        <nav aria-label='Site' className='text-text-muted hidden items-center gap-6 text-[15px] font-medium lg:flex'>
          {siteLinks.map(({ href, label, appPage }) => (
            <a
              key={href}
              href={href}
              className={isActive(appPage) ? 'text-accent' : 'hover:text-accent'}
              onClick={siteLinkClick(appPage)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className='flex flex-none items-center gap-4'>
          {model.isWalletConnected ? (
            <button
              type='button'
              title='Disconnect wallet'
              className='border-border bg-surface text-text-muted hover:text-accent min-h-11 cursor-pointer rounded-full border px-5 py-2.5 text-sm font-medium'
              onClick={model.disconnect}
            >
              <span className='max-sm:hidden'>{model.connectedAddressShort} · </span>Disconnect
            </button>
          ) : (
            <button
              type='button'
              className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover min-h-11 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold'
              onClick={model.connect}
            >
              Connect wallet
            </button>
          )}

          <button
            type='button'
            className='text-text cursor-pointer lg:hidden'
            title='Toggle mobile menu'
            aria-label='Toggle mobile menu'
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className='size-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className='px-6 pb-4 lg:hidden'>
          <nav aria-label='Site' className='text-text-muted flex flex-col gap-1 text-[15px] font-medium'>
            {siteLinks.map(({ href, label, appPage }) => (
              <a
                key={href}
                href={href}
                className={`hover:bg-surface hover:text-accent rounded-lg px-3 py-2.5 ${
                  isActive(appPage) ? 'text-accent' : ''
                }`}
                onClick={siteLinkClick(appPage)}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Bottom tab bar: the app pages within thumb's reach whenever the inline menu is hidden. */}
      <nav
        aria-label='App sections'
        className='border-border bg-surface-deep fixed right-0 bottom-0 left-0 z-10 flex w-full flex-row border-t select-none lg:hidden'
      >
        {pages.map(({ page, label, icon: Icon }) => {
          const active = model.activePage === page
          return (
            <button
              key={page}
              type='button'
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={
                'flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-medium ' +
                (active ? 'text-accent' : 'text-text-muted hover:text-accent')
              }
              onClick={() => {
                model.navigateToPage(page)
              }}
            >
              <Icon className='size-[18px]' aria-hidden='true' />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
})

export default Header
