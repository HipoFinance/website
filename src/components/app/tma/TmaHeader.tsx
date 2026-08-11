import { observer } from 'mobx-react-lite'
import { Model } from '../Model'

interface Props {
  model: Model
}

// Telegram draws its own bar above this one ("Close · Hipo · ⋯"), so this row carries no logo
// wordmark and no navigation — just where you are, the two live numbers that matter, and the
// wallet.
const TmaHeader = observer(({ model }: Props) => {
  let title = model.isStakeTabActive ? 'Stake GRAM' : 'Unstake hGRAM'
  if (model.activePage === 'reward') {
    title = 'Rewards'
  } else if (model.activePage === 'stats') {
    title = 'Stats'
  } else if (model.activePage === 'defi') {
    title = 'DeFi'
  }

  return (
    <header className='flex shrink-0 flex-row items-center gap-2.5 px-4 pt-3.5 pb-2'>
      <span className='bg-text flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full'>
        <img src='/images/hipo.svg' alt='Hipo' className='h-[23px] w-[23px]' />
      </span>

      <div className='min-w-0'>
        <div className='font-fredoka truncate text-[17px] leading-tight font-semibold'>{title}</div>
        {/* statsApyFormatted prefers the gauge, so the subline fills without waiting for the
            slower on-chain treasury state (which protocolFee still needs). */}
        <div className='text-text-muted truncate text-xs'>
          APY {model.statsApyFormatted ?? '—'} · fee {model.protocolFee ?? '—'}
        </div>
      </div>

      {model.isWalletConnected ? (
        <button
          type='button'
          title='Disconnect wallet'
          aria-label={'Disconnect wallet ' + model.connectedAddressShort}
          className='border-border bg-surface text-text-muted ml-auto flex min-h-[34px] shrink-0 cursor-pointer items-center rounded-full border px-3 py-[7px] text-xs font-medium'
          onClick={model.disconnect}
        >
          {model.connectedAddressShort}
        </button>
      ) : (
        <button
          type='button'
          className='border-border bg-surface text-accent ml-auto flex min-h-[34px] shrink-0 cursor-pointer items-center rounded-full border px-3 py-[7px] text-xs font-semibold'
          onClick={model.connect}
        >
          Connect
        </button>
      )}
    </header>
  )
})

export default TmaHeader
