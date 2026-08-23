import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Model } from './Model'
import { Copy, Check, X } from 'lucide-react'
import { Num, nodes } from './Interpolate'
import { formatAsciiNano } from '../../i18n/format.ts'

interface Props {
  model: Model
}

const CopyField = observer(({ model, label, value }: { model: Model; label: string; value: string }) => {
  const [copied, setCopied] = useState(false)
  return (
    <div className='mt-4'>
      <p className='text-text-faint text-xs'>{label}</p>
      <div className='border-border bg-surface-deep mt-1 flex flex-row items-center rounded-xl border p-2'>
        <p className='num min-w-0 flex-1 text-sm break-all'>{value}</p>
        <button
          className='bg-border text-text-muted ms-2 shrink-0 cursor-pointer rounded-lg p-2 hover:bg-[#4a3f3c]'
          aria-label={copied ? model.t('app.multisig.copied') : model.t('app.multisig.copy')}
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
})

const MultisigGuidance = observer(({ model }: Props) => {
  const t = model.t
  const stake = model.isStakeTabActive

  const hint = model.multisigHint && (
    <div className='font-body border-border bg-surface-deep text-text-muted fixed start-6 bottom-20 z-50 flex max-w-screen-sm items-start rounded-2xl border p-3 drop-shadow sm:bottom-2'>
      <p className='mx-1 text-sm'>
        {stake ? t('app.multisig.hintStake') : t('app.multisig.hintUnstake')}{' '}
        <button className='text-accent cursor-pointer font-medium underline' onClick={model.openMultisigGuidance}>
          {t('app.multisig.showInstructions')}
        </button>
      </p>
      <button
        className='ms-1 shrink-0 cursor-pointer'
        aria-label={t('app.multisig.dismiss')}
        onClick={model.hideMultisigHint}
      >
        <X className='size-4' />
      </button>
    </div>
  )

  if (!model.showMultisigGuidance) {
    return hint
  }

  const comment = <span className='font-medium'>{model.multisigComment}</span>
  const message = stake ? (
    <>
      <p className='mt-4 text-sm'>{t('app.multisig.introStake')}</p>
      <p className='mt-4 text-sm'>
        {model.multisigTransferAmountFormatted != null
          ? nodes(t('app.multisig.stakeInstructions'), {
              amount: <Num className='font-medium'>{model.multisigTransferAmountFormatted}</Num>,
              comment,
            })
          : nodes(t('app.multisig.stakeInstructionsNoAmount'), {
              amount: <span className='font-medium'>{t('app.multisig.amountYouWantToStake')}</span>,
              comment,
            })}
      </p>
    </>
  ) : (
    <>
      <p className='mt-4 text-sm'>{t('app.multisig.introUnstake')}</p>
      <p className='mt-4 text-sm'>
        {nodes(t('app.multisig.unstakeInstructions'), {
          // ASCII digits on purpose (formatAsciiNano): this is retyped into a multisig UI that takes nothing else.
          amount: <Num className='font-medium'>{model.withUnit('app.model.gram', formatAsciiNano(100_000_000n))}</Num>,
          comment,
          entire: <span className='font-medium'>{t('app.multisig.entire')}</span>,
        })}
      </p>
    </>
  )

  return (
    <>
      <div className='font-body text-text fixed start-0 top-0 z-1000 flex h-full w-full overflow-y-auto bg-black/60 p-8'>
        <div className='border-border bg-surface m-auto w-96 max-w-sm rounded-[20px] border p-8 shadow-2xl'>
          <h1 className='font-fredoka text-center text-xl font-semibold'>
            {stake ? t('app.multisig.titleStake') : t('app.multisig.titleUnstake')}
          </h1>
          {message}
          <CopyField model={model} label={t('app.multisig.treasuryAddress')} value={model.treasuryAddressFormatted} />
          <CopyField model={model} label={t('app.multisig.textComment')} value={model.multisigComment} />
          {model.multisigDeepLink != null && (
            <>
              <a
                className='bg-accent text-on-accent hover:bg-accent-hover mt-6 block h-14 w-full rounded-2xl text-center text-lg leading-14 font-semibold'
                href={model.multisigDeepLink}
              >
                {t('app.multisig.openInWallet')}
              </a>
              <p className='text-text-faint mt-2 text-xs'>
                {nodes(t('app.multisig.transferNote'), { address: <Num>{model.connectedAddressShort}</Num> })}
              </p>
            </>
          )}
          <button
            className='border-accent text-accent hover:bg-accent hover:text-on-accent mt-4 h-14 w-full cursor-pointer rounded-2xl border text-lg font-semibold'
            onClick={model.closeMultisigGuidance}
            onKeyDown={(e) => {
              if (e.key == 'Escape') {
                const button = e.target as HTMLButtonElement
                button.click()
              }
            }}
            autoFocus
          >
            {t('app.common.close')}
          </button>
        </div>
      </div>
      {hint}
    </>
  )
})

export default MultisigGuidance
