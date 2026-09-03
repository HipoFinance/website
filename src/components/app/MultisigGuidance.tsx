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
          className='bg-border text-text-muted hover:bg-border-strong ms-2 shrink-0 cursor-pointer rounded-lg p-2'
          aria-label={copied ? model.t('app.multisig.copied') : model.t('app.multisig.copy')}
          onClick={() => {
            // A payload is far too long to retype, so a silently failed copy is a dead end. The
            // text stays selectable either way; this at least keeps the icon honest.
            navigator.clipboard.writeText(value).then(
              () => {
                setCopied(true)
                setTimeout(() => {
                  setCopied(false)
                }, 2000)
              },
              () => undefined,
            )
          }}
        >
          {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
        </button>
      </div>
    </div>
  )
})

// The three values of a raw order, in the field order multisig.ton.org's "Arbitrary order" form
// asks for them. Rendered only when the snapshot produced a message — never with a guessed address.
const OrderFields = observer(({ model }: Props) => {
  const t = model.t
  const payload = model.multisigPayload
  const destination = model.multisigPayloadDestination
  const amount = model.multisigPayloadAmountAscii
  if (payload == null || destination == null || amount == null) {
    return null
  }
  return (
    <>
      <p className='text-text-muted mt-4 text-sm'>{t('app.multisig.arbitraryOrderNote')}</p>
      <CopyField model={model} label={t('app.multisig.destinationAddress')} value={destination} />
      {!model.multisigIsStake && (
        <p className='text-text-faint mt-2 text-xs'>
          {nodes(t('app.multisig.verifyDestination'), {
            link: (
              <a
                className='text-accent underline'
                href={model.multisigPayloadExplorerHref}
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('app.multisig.verifyDestinationLink')}
              </a>
            ),
          })}
        </p>
      )}
      <CopyField model={model} label={t('app.multisig.tonAmount')} value={amount} />
      <CopyField model={model} label={t('app.multisig.orderBoc')} value={payload} />
    </>
  )
})

const DeepLinkButton = observer(({ model, href }: { model: Model; href: string }) => (
  <>
    <a
      className='bg-accent-fill text-on-accent hover:bg-accent-fill-hover mt-6 block h-14 w-full rounded-2xl text-center text-lg leading-14 font-semibold'
      href={href}
    >
      {model.t('app.multisig.openInWallet')}
    </a>
    <p className='text-text-faint mt-2 text-xs'>
      {nodes(model.t('app.multisig.transferNote'), { address: <Num>{model.connectedAddressShort}</Num> })}
    </p>
  </>
))

const MultisigGuidance = observer(({ model }: Props) => {
  const t = model.t
  const stake = model.multisigIsStake

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
  const hasOrder = model.multisigPayload != null

  // Stake: the 'd' comment stays primary — it needs no payload paste and already takes any amount.
  // The raw order is offered underneath so a holder can use one mechanism for both directions.
  const stakeBody = (
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
      <CopyField model={model} label={t('app.multisig.treasuryAddress')} value={model.treasuryAddressFormatted} />
      <CopyField model={model} label={t('app.multisig.textComment')} value={model.multisigComment} />
      {model.multisigDeepLink != null && <DeepLinkButton model={model} href={model.multisigDeepLink} />}
      {hasOrder && (
        <div className='border-border mt-8 border-t pt-4'>
          <h2 className='font-fredoka text-base font-semibold'>{t('app.multisig.orderTitleStake')}</h2>
          <p className='text-text-muted mt-2 text-sm'>{t('app.multisig.orderIntroStake')}</p>
          <OrderFields model={model} />
          {model.multisigPayloadDeepLink != null && (
            <DeepLinkButton model={model} href={model.multisigPayloadDeepLink} />
          )}
        </div>
      )}
    </>
  )

  // Unstake: the raw order is primary, because it is the only thing that can unstake a part of the
  // balance. The 'w' comment drops to a secondary block for UIs that cannot paste a payload.
  const unstakeBody = (
    <>
      {hasOrder ? (
        <>
          <p className='mt-4 text-sm'>
            {nodes(t('app.multisig.orderIntroUnstake'), {
              amount: <Num className='font-medium'>{model.multisigSnapshotAmountFormatted ?? ''}</Num>,
            })}
          </p>
          <p className='text-text-muted mt-4 text-sm'>
            {nodes(t('app.multisig.orderRate'), {
              mode: (
                <span className='font-medium'>
                  {model.multisigUnstakeOption === 'instant'
                    ? t('app.multisig.modeInstant')
                    : t('app.multisig.modeBest')}
                </span>
              ),
            })}{' '}
            {model.multisigUnstakeOption === 'instant' && t('app.multisig.orderRateWarning')}
          </p>
          <OrderFields model={model} />
          <p className='text-text-faint mt-4 text-xs'>{t('app.multisig.orderSafetyNote')}</p>
          {model.multisigPayloadDeepLink != null && (
            <DeepLinkButton model={model} href={model.multisigPayloadDeepLink} />
          )}
        </>
      ) : (
        <>
          <p className='mt-4 text-sm'>{t('app.multisig.introUnstake')}</p>
          <p className='mt-4 text-sm'>{t('app.multisig.enterAmountUnstake')}</p>
        </>
      )}
      <div className='border-border mt-8 border-t pt-4'>
        <h2 className='font-fredoka text-base font-semibold'>{t('app.multisig.wholeBalanceTitle')}</h2>
        <p className='text-text-muted mt-2 text-sm'>
          {nodes(t('app.multisig.unstakeInstructions'), {
            // ASCII digits on purpose (formatAsciiNano): this is retyped into a multisig UI that takes nothing else.
            amount: (
              <Num className='font-medium'>{model.withUnit('app.model.gram', formatAsciiNano(100_000_000n))}</Num>
            ),
            comment,
            entire: <span className='font-medium'>{t('app.multisig.entire')}</span>,
          })}
        </p>
        <CopyField model={model} label={t('app.multisig.treasuryAddress')} value={model.treasuryAddressFormatted} />
        <CopyField model={model} label={t('app.multisig.textComment')} value={model.multisigComment} />
        {model.multisigDeepLink != null && <DeepLinkButton model={model} href={model.multisigDeepLink} />}
      </div>
    </>
  )

  return (
    <>
      <div className='font-body text-text fixed start-0 top-0 z-1000 flex h-full w-full overflow-y-auto bg-black/60 p-8'>
        <div className='border-border bg-surface m-auto w-96 max-w-sm rounded-[20px] border p-8 shadow-2xl'>
          <h1 className='font-fredoka text-center text-xl font-semibold'>
            {stake ? t('app.multisig.titleStake') : t('app.multisig.titleUnstake')}
          </h1>
          {stake ? stakeBody : unstakeBody}
          <button
            className='border-accent text-accent hover:bg-accent-fill hover:text-on-accent mt-4 h-14 w-full cursor-pointer rounded-2xl border text-lg font-semibold'
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
