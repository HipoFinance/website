import { observer } from 'mobx-react-lite'
import { Model } from './Model'
import { Num, nodes } from './Interpolate'

interface Props {
  model: Model
}

const OldWalletUpgrade = observer(({ model }: Props) => {
  const t = model.t
  return (
    <div
      className={
        'font-body text-text mx-auto flex w-full max-w-[1120px] flex-col items-center overflow-hidden px-6 transition-all duration-700 motion-reduce:transition-none' +
        (model.oldWalletTokens != null && model.oldWalletTokens > 0n ? ' max-h-[100rem]' : ' max-h-0')
      }
    >
      <div className='border-accent bg-surface mt-6 flex max-w-2xl flex-col items-center rounded-[20px] border p-6 text-center'>
        <h2 className='font-fredoka mb-3 text-xl font-semibold'>{t('app.oldWallet.title')}</h2>
        <p className='text-text-muted max-w-xl py-1 text-sm'>{t('app.oldWallet.pressUpgrade')}</p>
        <p className='text-text-muted max-w-xl py-1 text-sm'>
          {nodes(t('app.oldWallet.balances'), {
            old: <Num className='text-text font-medium'>{model.oldWalletTokensFormatted}</Num>,
            new: <Num className='text-text font-medium'>{model.newWalletTokensFormatted}</Num>,
          })}
        </p>
        <p className='text-text-muted max-w-xl py-1 text-sm'>{t('app.oldWallet.patience')}</p>
        <button
          className='bg-accent text-on-accent hover:bg-accent-hover mt-5 cursor-pointer rounded-2xl px-16 py-3 text-lg font-semibold'
          onClick={model.upgradeOldWallet}
        >
          {t('app.oldWallet.upgrade')}
        </button>
      </div>
    </div>
  )
})

export default OldWalletUpgrade
