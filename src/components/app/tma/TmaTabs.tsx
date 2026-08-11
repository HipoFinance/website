import { observer } from 'mobx-react-lite'
import { Model } from '../Model'

interface Props {
  model: Model
}

type Page = 'stake' | 'reward' | 'stats' | 'defi'

const pages: { page: Page; label: string }[] = [
  { page: 'stake', label: 'Stake' },
  { page: 'reward', label: 'Reward' },
  { page: 'stats', label: 'Stats' },
  { page: 'defi', label: 'DeFi' },
]

// Last row of the shell's flex column rather than a fixed overlay: the shell is exactly one
// viewport tall, so the row is pinned to the bottom without ever covering the content, and the
// safe-area padding keeps it clear of the home indicator.
const TmaTabs = observer(({ model }: Props) => {
  return (
    <nav
      aria-label='App sections'
      className='border-border bg-surface-deep flex shrink-0 flex-row border-t pb-[env(safe-area-inset-bottom)] select-none'
    >
      {pages.map(({ page, label }) => {
        const active = model.activePage === page
        return (
          <button
            key={page}
            type='button'
            // The active marker is a second, text-less span, so the label is spelled out here
            // rather than left to name-from-contents.
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={
              'flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-1.5 text-xs ' +
              (active ? 'text-accent font-medium' : 'text-text-faint')
            }
            onClick={() => {
              model.navigateToPage(page)
            }}
          >
            <span>{label}</span>
            <span className={'h-1 w-1 rounded-full ' + (active ? 'bg-accent' : 'bg-transparent')}></span>
          </button>
        )
      })}
    </nav>
  )
})

export default TmaTabs
