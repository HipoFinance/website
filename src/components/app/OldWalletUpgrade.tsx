import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

const OldWalletUpgrade = observer(({ model }: Props) => {
  return (
    <div
      className={
        'font-body text-text mx-auto flex w-full max-w-[1120px] flex-col items-center overflow-hidden px-6 transition-all duration-700 motion-reduce:transition-none' +
        (model.oldWalletTokens != null && model.oldWalletTokens > 0n ? ' max-h-[100rem]' : ' max-h-0')
      }
    >
      <div className='border-accent bg-surface mt-6 flex max-w-2xl flex-col items-center rounded-[20px] border p-6 text-center'>
        <h2 className='font-fredoka mb-3 text-xl font-semibold'>Upgrade to Hipo version 2</h2>
        <p className='text-text-muted max-w-xl py-1 text-sm'>
          Press &quot;Upgrade&quot; below to switch automatically from the old to the new version.
        </p>
        <p className='text-text-muted max-w-xl py-1 text-sm'>
          You have <b className='text-text font-medium'>{model.oldWalletTokensFormatted}</b> in the old version. After
          the upgrade, you&apos;ll get <b className='text-text font-medium'>{model.newWalletTokensFormatted}</b> in the
          new version.
        </p>
        <p className='text-text-muted max-w-xl py-1 text-sm'>
          After confirming, it may take a few minutes to receive the new hGRAM. Don&apos;t worry!
        </p>
        <button
          className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover mt-5 cursor-pointer rounded-2xl px-16 py-3 text-lg font-semibold'
          onClick={model.upgradeOldWallet}
        >
          Upgrade
        </button>
      </div>
    </div>
  )
})

export default OldWalletUpgrade
