import { observer } from 'mobx-react-lite'
import { Model } from '../Model'
import { nodes } from '../Interpolate'

interface Props {
  model: Model
}

// Telegram draws its own bar above this one ("Close · Hipo · ⋯"), so this row carries no logo
// wordmark and no navigation — just where you are, the two live numbers that matter, and the
// wallet. (No language dropdown here either: the row is already full on a phone, and the mini
// app's locale comes from Telegram — spec §D, phase 5.)
const TmaHeader = observer(({ model }: Props) => {
  const t = model.t
  let title = model.isStakeTabActive ? t('app.stake.titleStake') : t('app.stake.titleUnstake')
  if (model.activePage === 'reward') {
    title = t('app.nav.rewards')
  } else if (model.activePage === 'stats') {
    title = t('app.nav.stats')
  } else if (model.activePage === 'defi') {
    title = t('app.nav.defi')
  }

  return (
    <header className='flex shrink-0 flex-row items-center gap-2.5 px-4 pt-3.5 pb-2'>
      <img src='/images/hipo.svg' alt='Hipo' className='h-[34px] w-[34px] shrink-0' />

      <div className='min-w-0'>
        <div className='font-fredoka truncate text-[17px] leading-tight font-semibold'>{title}</div>
        {/* statsApyFormatted falls back to the gauge while the slower on-chain treasury state
            (which protocolFee still needs) is loading, so the subline fills fast either way. */}
        <div className='text-text-muted truncate text-xs'>
          {nodes(t('app.tma.subline'), {
            apy: <bdi className='num'>{model.statsApyFormatted ?? '—'}</bdi>,
            fee: <bdi className='num'>{model.protocolFee ?? '—'}</bdi>,
          })}
        </div>
      </div>

      {model.isWalletConnected ? (
        <button
          type='button'
          title={t('app.header.disconnectWallet')}
          aria-label={t('app.tma.disconnectWalletAddress', { address: model.isolate(model.connectedAddressShort) })}
          className='border-border bg-surface text-text-muted num ms-auto flex min-h-[34px] shrink-0 cursor-pointer items-center rounded-full border px-3 py-[7px] text-xs font-medium'
          onClick={model.disconnect}
        >
          {model.connectedAddressShort}
        </button>
      ) : (
        <button
          type='button'
          className='border-border bg-surface text-accent ms-auto flex min-h-[34px] shrink-0 cursor-pointer items-center rounded-full border px-3 py-[7px] text-xs font-semibold'
          onClick={model.connect}
        >
          {t('app.tma.connect')}
        </button>
      )}
    </header>
  )
})

export default TmaHeader
