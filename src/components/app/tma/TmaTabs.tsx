import { observer } from 'mobx-react-lite'
import { Coins, Gift, ChartLine, ArrowLeftRight, type LucideIcon } from 'lucide-react'
import { Model } from '../Model'

interface Props {
  model: Model
}

type Page = 'stake' | 'reward' | 'stats' | 'defi'

// Labels are catalog keys, resolved through model.t at render time.
const pages: { page: Page; label: string; icon: LucideIcon }[] = [
  { page: 'stake', label: 'app.nav.stake', icon: Coins },
  { page: 'reward', label: 'app.nav.rewards', icon: Gift },
  { page: 'stats', label: 'app.nav.stats', icon: ChartLine },
  { page: 'defi', label: 'app.nav.defi', icon: ArrowLeftRight },
]

// Last row of the shell's flex column rather than a fixed overlay: the shell is exactly one
// viewport tall, so the row is pinned to the bottom without ever covering the content, and the
// safe-area padding keeps it clear of the home indicator.
const TmaTabs = observer(({ model }: Props) => {
  return (
    <nav
      aria-label={model.t('app.header.appSections')}
      className='border-border bg-surface-deep flex shrink-0 flex-row border-t pb-[env(safe-area-inset-bottom)] select-none'
    >
      {pages.map(({ page, label, icon: Icon }) => {
        const active = model.activePage === page
        return (
          <button
            key={page}
            type='button'
            aria-label={model.t(label)}
            aria-current={active ? 'page' : undefined}
            className={
              'flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1.5 text-xs ' +
              (active ? 'text-accent font-medium' : 'text-text-faint')
            }
            onClick={() => {
              model.navigateToPage(page)
            }}
          >
            <Icon className='size-[18px]' aria-hidden='true' />
            <span>{model.t(label)}</span>
          </button>
        )
      })}
    </nav>
  )
})

export default TmaTabs
