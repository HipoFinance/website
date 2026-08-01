import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Model } from './Model'
import { Copy, Check, X } from 'lucide-react'

interface Props {
  model: Model
}

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false)
  return (
    <div className='mt-4'>
      <p className='text-xs font-light'>{label}</p>
      <div className='dark:bg-dark-900 mt-1 flex flex-row items-center rounded-lg bg-white p-2'>
        <p className='min-w-0 flex-1 text-sm break-all'>{value}</p>
        <button
          className='bg-milky dark:text-dark-600 ml-2 shrink-0 cursor-pointer rounded-lg p-2 hover:bg-gray-200 active:bg-gray-300'
          onClick={() => {
            void navigator.clipboard.writeText(value).then(() => {
              setCopied(true)
              setTimeout(() => {
                setCopied(false)
              }, 2000)
            })
          }}
        >
          {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
        </button>
      </div>
    </div>
  )
}

const MultisigGuidance = observer(({ model }: Props) => {
  const hint = model.multisigHint && (
    <div className='bg-blue fixed bottom-20 left-6 flex max-w-screen-sm items-start rounded-2xl p-3 text-white drop-shadow sm:bottom-2'>
      <p className='mx-1 text-sm'>
        Using a multisig or cold wallet that can’t sign dapp transactions? You can stake with a plain transfer.{' '}
        <button className='cursor-pointer font-medium underline' onClick={model.openMultisigGuidance}>
          Show instructions
        </button>
      </p>
      <button className='ml-1 shrink-0 cursor-pointer' onClick={model.hideMultisigHint}>
        <X className='size-4' />
      </button>
    </div>
  )

  if (!model.showMultisigGuidance) {
    return hint
  }

  const stake = model.isStakeTabActive
  const message = stake ? (
    <>
      <p className='mt-4 text-sm'>
        Multisig wallets can’t sign dapp transactions, but you can stake by sending a plain transfer from your multisig
        instead:
      </p>
      <p className='mt-4 text-sm'>
        Send{' '}
        <span className='font-medium'>{model.multisigTransferAmountFormatted ?? 'the amount you want to stake'}</span>{' '}
        {model.multisigTransferAmountFormatted == null ? 'plus 0.1 GRAM for fees ' : ''}to the treasury address below
        with the text comment <span className='font-medium'>d</span>. Unused fees are refunded, and hGRAM will be minted
        to your multisig.
      </p>
    </>
  ) : (
    <>
      <p className='mt-4 text-sm'>
        Multisig wallets can’t sign dapp transactions, but you can unstake by sending a plain transfer from your
        multisig instead:
      </p>
      <p className='mt-4 text-sm'>
        Send <span className='font-medium'>0.1 GRAM</span> to the treasury address below with the text comment{' '}
        <span className='font-medium'>w</span>. This unstakes your <span className='font-medium'>entire</span> hGRAM
        balance; unused fees are refunded. Unstaking only a part of your balance is not available with this method.
      </p>
    </>
  )

  return (
    <>
      <div className='text-brown dark:text-dark-50 fixed top-0 left-0 z-1000 flex h-full w-full overflow-y-auto bg-black/40 p-8'>
        <div className='bg-milky dark:bg-dark-700 m-auto w-96 max-w-sm rounded-3xl p-8 shadow-2xl'>
          <h1 className='text-center text-xl font-bold'>{stake ? 'Stake' : 'Unstake'} with your multisig</h1>
          {message}
          <CopyField label='Treasury address' value={model.treasuryAddressFormatted} />
          <CopyField label='Text comment' value={model.multisigComment} />
          {model.multisigDeepLink != null && (
            <a
              className='bg-orange dark:text-dark-600 mt-6 block h-14 w-full rounded-2xl text-center text-lg leading-14 font-medium text-white'
              href={model.multisigDeepLink}
            >
              Open in wallet app
            </a>
          )}
          <button
            className='border-orange text-orange mt-4 h-14 w-full cursor-pointer rounded-2xl border text-lg font-medium'
            onClick={model.closeMultisigGuidance}
            onKeyDown={(e) => {
              if (e.key == 'Escape') {
                const button = e.target as HTMLButtonElement
                button.click()
              }
            }}
            autoFocus
          >
            Close
          </button>
        </div>
      </div>
      {hint}
    </>
  )
})

export default MultisigGuidance
