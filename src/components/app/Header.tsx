import { observer } from 'mobx-react-lite'
import { Model } from './Model'

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

const Header = observer(({ model }: Props) => {
  return (
    <div className='font-body text-text mx-auto w-full max-w-[1120px]'>
      {!model.isBannerClosed && (
        <div className='bg-accent text-on-accent relative'>
          <div className='mx-auto flex max-w-[1120px] flex-row items-center justify-center gap-3 px-10 py-2.5 text-sm max-sm:pr-10'>
            <p className='text-center'>
              💰 <b className='font-bold'>Earn 100% of staking rewards</b>. Protocol fee is now 0%.
            </p>
            <a
              href='https://t.me/HipoFinanceBot/join'
              target='_blank'
              rel='noopener noreferrer'
              className='shrink-0 font-semibold underline underline-offset-2'
            >
              Earn now
            </a>
          </div>
          <button
            aria-label='Dismiss announcement'
            className='absolute top-0 right-0 flex h-full min-h-11 w-11 cursor-pointer items-center justify-center text-sm font-bold'
            onClick={() => {
              model.closeBanner()
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className='flex flex-row items-center gap-4 px-5 py-4 sm:gap-7 sm:px-10'>
        <a href='/' className='flex flex-none flex-row items-center gap-2.5'>
          <span className='bg-text flex h-[34px] w-[34px] items-center justify-center rounded-full'>
            <img src='/images/hipo.svg' alt='Hipo' className='h-[23px] w-[23px]' />
          </span>
          <span className='font-fredoka text-[22px] font-semibold'>Hipo</span>
        </a>

        {/* Bottom bar on phones, inline pill nav from sm — the same pattern as before, restyled. */}
        <nav
          aria-label='App sections'
          className='border-border bg-surface-deep fixed right-0 bottom-0 left-0 z-10 flex w-full flex-row border-t select-none sm:static sm:w-auto sm:gap-1.5 sm:border-0 sm:bg-transparent'
        >
          {pages.map(({ page, label }) => {
            const active = model.activePage === page
            return (
              <button
                key={page}
                type='button'
                aria-current={active ? 'page' : undefined}
                className={
                  'min-h-12 flex-1 cursor-pointer text-center text-[15px] font-medium sm:min-h-0 sm:flex-none sm:rounded-full sm:px-4 sm:py-2 ' +
                  (active
                    ? 'text-accent sm:border-border sm:bg-surface sm:text-text sm:border'
                    : 'text-text-muted hover:text-accent')
                }
                onClick={() => {
                  model.navigateToPage(page)
                }}
              >
                {label}
              </button>
            )
          })}
        </nav>

        <div className='ml-auto flex flex-none flex-row items-center'>
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
              className='bg-accent text-on-accent hover:bg-accent-hover min-h-11 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold'
              onClick={model.connect}
            >
              Connect wallet
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default Header
