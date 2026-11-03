import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

// Shown when a Connect press got no TonConnect window (see walletPickerStuck in Model.ts). Sits above
// the mini app's bottom tabs and the safe area, centred so it reads the same in both directions.
const WalletPickerNotice = observer(({ model }: Props) => {
  if (!model.walletPickerStuck) {
    return null
  }
  return (
    <div
      role='alert'
      className='font-body bg-accent-fill text-on-accent fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex w-[min(28rem,calc(100vw-2rem))] items-center gap-2 rounded-2xl p-3 drop-shadow sm:bottom-4'
    >
      <img src='/images/app/error.svg' alt='' className='h-6 shrink-0' />
      <p className='flex-1 text-sm'>{model.t('app.wallet.pickerStuck')}</p>
      <button
        className='shrink-0 cursor-pointer rounded-xl px-3 py-1 text-sm font-semibold underline'
        onClick={model.endConnect}
      >
        {model.t('app.multisig.dismiss')}
      </button>
    </div>
  )
})

export default WalletPickerNotice
