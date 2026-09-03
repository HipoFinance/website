import { observer } from 'mobx-react-lite'
import { useState, type ReactNode } from 'react'
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

// A bottom-left note rather than a dialog: both of these say something about an app that is either
// already open or about to be, so neither may stand in front of it.
const Toast = ({ model, children, onDismiss }: { model: Model; children: ReactNode; onDismiss: () => void }) => (
  <div className='font-body border-border bg-surface-deep text-text-muted fixed start-6 bottom-20 z-50 flex max-w-screen-sm items-start rounded-2xl border p-3 drop-shadow sm:bottom-2'>
    <p className='mx-1 text-sm'>{children}</p>
    <button className='ms-1 shrink-0 cursor-pointer' aria-label={model.t('app.multisig.dismiss')} onClick={onDismiss}>
      <X className='size-4' />
    </button>
  </div>
)

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
      {!model.multisigIsStake && (
        <>
          <p className='text-text-faint mt-4 text-xs'>{t('app.multisig.orderSafetyNote')}</p>
          {model.multisigUnstakeOption === 'instant' && (
            <p className='text-text-faint mt-2 text-xs'>{t('app.multisig.orderRateWarning')}</p>
          )}
        </>
      )}
    </>
  )
})

// The text-comment protocol, kept for wallets that neither handle a ton:// link nor accept a pasted
// payload. It is the only method here that cannot express a partial amount.
const CommentFallback = observer(({ model }: Props) => {
  const t = model.t
  const comment = <span className='font-medium'>{model.multisigComment}</span>
  return (
    <>
      <p className='text-text-muted mt-4 text-sm'>
        {model.multisigIsStake
          ? model.multisigTransferAmountFormatted != null
            ? nodes(t('app.multisig.stakeInstructions'), {
                amount: <Num className='font-medium'>{model.multisigTransferAmountFormatted}</Num>,
                comment,
              })
            : nodes(t('app.multisig.stakeInstructionsNoAmount'), {
                amount: <span className='font-medium'>{t('app.multisig.amountYouWantToStake')}</span>,
                comment,
              })
          : nodes(t('app.multisig.unstakeInstructions'), {
              // ASCII digits on purpose (formatAsciiNano): retyped into a multisig UI that takes nothing else.
              amount: (
                <Num className='font-medium'>{model.withUnit('app.model.gram', formatAsciiNano(100_000_000n))}</Num>
              ),
              comment,
              entire: <span className='font-medium'>{t('app.multisig.entire')}</span>,
            })}
      </p>
      <CopyField model={model} label={t('app.multisig.treasuryAddress')} value={model.treasuryAddressFormatted} />
      <CopyField model={model} label={t('app.multisig.textComment')} value={model.multisigComment} />
    </>
  )
})

const OpenWalletButton = observer(({ model, href }: { model: Model; href: string }) => (
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

  // Raised after a link was handed over, because ton://transfer carries no sender and Tonkeeper
  // does not preselect the connected multisig.
  const walletHint = model.multisigWalletHint && (
    <Toast model={model} onDismiss={model.hideMultisigWalletHint}>
      {nodes(t('app.multisig.transferNote'), { address: <Num>{model.connectedAddressShort}</Num> })}
    </Toast>
  )

  // Raised when a wallet we could not identify as a multisig rejected the transaction, since the
  // symptom is identical and the manual route is the same.
  const hint = model.multisigHint && (
    <Toast model={model} onDismiss={model.hideMultisigHint}>
      {model.isStakeTabActive ? t('app.multisig.hintStake') : t('app.multisig.hintUnstake')}{' '}
      <button className='text-accent cursor-pointer font-medium underline' onClick={model.openMultisigGuidance}>
        {t('app.multisig.showInstructions')}
      </button>
    </Toast>
  )

  if (!model.showMultisigGuidance) {
    return (
      <>
        {walletHint}
        {hint}
      </>
    )
  }

  return (
    <>
      <div className='font-body text-text fixed start-0 top-0 z-1000 flex h-full w-full overflow-y-auto bg-black/60 p-8'>
        <div className='border-border bg-surface m-auto w-96 max-w-sm rounded-[20px] border p-8 shadow-2xl'>
          <h1 className='font-fredoka text-center text-xl font-semibold'>{t('app.multisig.titleFallback')}</h1>
          <p className='mt-4 text-sm'>{t('app.multisig.introFallback')}</p>
          {model.multisigPayloadDeepLink != null && (
            <OpenWalletButton model={model} href={model.multisigPayloadDeepLink} />
          )}
          <OrderFields model={model} />
          <div className='border-border mt-8 border-t pt-4'>
            <CommentFallback model={model} />
          </div>
          <button
            className='border-accent text-accent hover:bg-accent-fill hover:text-on-accent mt-6 h-14 w-full cursor-pointer rounded-2xl border text-lg font-semibold'
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
    </>
  )
})

export default MultisigGuidance
