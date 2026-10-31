// The Club's modals (SPEC §4, board 09): Link Telegram, Change wallet (flow 1's explain step), Choose a
// wallet (flows 2 and 3), the wait for TON Connect, the switch / link / release confirm, Claim and
// Claim done, Upgrade and Upgrade done, and the "wasn't applied" notice of the payment guard.
// The confirm and the two payment modals only show; ClubModel and payments.ts decide.
import { observer } from 'mobx-react-lite'
import type { ClubModel, Modal } from './ClubModel.ts'
import { Button, ErrorLine, Row, Sheet } from './ui.tsx'

interface Props {
  club: ClubModel
}

const Actions = ({ children }: { children: React.ReactNode }) => (
  <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>{children}</div>
)

const LinkTelegram = observer(({ club, modal }: Props & { modal: Extract<Modal, { kind: 'linkTelegram' }> }) => {
  const t = club.t
  return (
    <>
      <p className='text-text-muted text-[15px] leading-relaxed'>{t('club.modal.tg.body')}</p>
      <ol className='flex flex-col gap-2'>
        <li className='border-border flex flex-wrap justify-between gap-2 rounded-xl border p-3 text-sm'>
          <span className='font-semibold'>{t('club.modal.tg.step1')}</span>
          <span className='text-text-faint'>{t('club.modal.tg.step1Note')}</span>
        </li>
        <li className='border-border flex flex-wrap justify-between gap-2 rounded-xl border p-3 text-sm'>
          <span className='font-semibold'>
            {club.connected !== undefined
              ? t('club.modal.tg.step2', { wallet: club.mask(club.connected) })
              : t('club.modal.tg.step2NoWallet')}
          </span>
          <span className='text-text-faint'>{t('club.modal.tg.step2Note')}</span>
        </li>
      </ol>
      <p className='text-text-faint text-sm leading-relaxed'>{t('club.modal.tg.note')}</p>
      <ErrorLine>
        {club.actionError !== undefined ? t(club.actionError.key, club.actionError.params) : undefined}
      </ErrorLine>
      <Actions>
        <Button onClick={() => club.closeModal()}>{t('club.common.notNow')}</Button>
        <Button kind='primary' busy={club.busy} onClick={() => void club.loginTelegram(modal.after)}>
          {t('club.modal.tg.continue')}
        </Button>
      </Actions>
    </>
  )
})

const ChangeWallet = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  const name = o?.displayName ?? ''
  return (
    <>
      <p className='text-text-muted text-[15px] leading-relaxed'>{t('club.modal.change.body')}</p>
      <div className='flex flex-col gap-1.5'>
        <Row
          label={t('club.modal.telegramAccount')}
          value={t('club.modal.accountValue', { name, level: club.level(o?.clubLevel), boost: club.boost(o?.boost) })}
        />
        <Row
          label={t('club.modal.currentWallet')}
          value={t('club.modal.walletHpo', { wallet: club.clubWalletMasked, amount: club.amount2(o?.holdings) })}
        />
        <Row label={t('club.modal.minimum')} value={t('club.common.hpoAmount', { amount: club.amount2(o?.minimum) })} />
      </div>
      <ul className='text-text-muted flex list-disc flex-col gap-1.5 ps-5 text-sm leading-relaxed'>
        <li>{t('club.modal.change.rate', { level: club.level(o?.clubLevel), boost: club.boost(o?.boost) })}</li>
        <li>{t('club.modal.change.hold', { minimum: club.amount2(o?.minimum), level: club.level(o?.clubLevel) })}</li>
        <li>{t('club.modal.change.unclaimed', { amount: club.amount2(o?.unclaimed) })}</li>
      </ul>
      <p className='text-text-faint text-sm'>{t('club.modal.change.next')}</p>
      <ErrorLine>
        {club.actionError !== undefined ? t(club.actionError.key, club.actionError.params) : undefined}
      </ErrorLine>
      <Actions>
        <Button onClick={() => club.closeModal()}>{t('club.common.cancel')}</Button>
        <Button kind='primary' busy={club.busy} onClick={() => void club.startLink(1)}>
          {t('club.modal.change.connect')}
        </Button>
      </Actions>
      <Button kind='quiet' className='self-center' onClick={() => void club.startRelease()} disabled={club.busy}>
        {t('club.modal.change.release')}
      </Button>
    </>
  )
})

const Choose = observer(({ club, modal }: Props & { modal: Extract<Modal, { kind: 'choose' }> }) => {
  const t = club.t
  const o = club.overview
  const s = club.status
  const name = o?.displayName ?? ''
  const connected = club.mask(club.connected)
  return (
    <>
      <p className='text-text-muted text-[15px] leading-relaxed'>
        {modal.flow === 2
          ? t('club.modal.choose.body2', { wallet: club.clubWalletMasked, name })
          : t(club.tma ? 'club.modal.choose.body3Tma' : 'club.modal.choose.body3', {
              wallet: club.clubWalletMasked,
              name,
            })}
      </p>
      <div className='flex flex-col gap-1.5'>
        <Row label={t('club.modal.telegramAccount')} value={name} />
        <Row
          label={t('club.modal.clubLevel')}
          value={t('club.modal.levelBoost', {
            level: club.level(s?.clubLevel ?? o?.clubLevel),
            boost: club.boost(s?.boost ?? o?.boost),
          })}
        />
        <Row label={t('club.modal.linkedWallet')} value={club.clubWalletMasked} />
        <Row
          label={t('club.modal.minimum')}
          value={t('club.common.hpoAmount', { amount: club.amount2(s?.minimum ?? o?.minimum) })}
        />
        <Row label={t('club.modal.connectedNow')} value={connected} />
      </div>
      <div className='flex flex-col gap-2'>
        <button
          type='button'
          disabled={club.busy}
          className='border-border hover:border-accent flex cursor-pointer flex-col gap-0.5 rounded-2xl border p-4 text-start'
          onClick={() => void club.startLink(modal.flow)}
        >
          <span className='font-semibold'>{t('club.modal.choose.switch')}</span>
          <span className='text-text-muted text-sm'>
            {t('club.modal.choose.switchNote', {
              wallet: connected,
              name,
              level: club.level(s?.clubLevel ?? o?.clubLevel),
            })}
          </span>
        </button>
        <button
          type='button'
          disabled={club.busy}
          className='border-border hover:border-accent flex cursor-pointer flex-col gap-0.5 rounded-2xl border p-4 text-start'
          onClick={() => void club.reconnectPrevious(modal.flow)}
        >
          <span className='font-semibold'>{t('club.modal.choose.reconnect')}</span>
          <span className='text-text-muted text-sm'>
            {t('club.modal.choose.reconnectNote', { wallet: club.clubWalletMasked })}
          </span>
        </button>
      </div>
      <ErrorLine>
        {club.actionError !== undefined ? t(club.actionError.key, club.actionError.params) : undefined}
      </ErrorLine>
      <Actions>
        <Button onClick={() => void club.cancelChange(false)}>
          {t(modal.flow === 2 ? 'club.modal.choose.cancel2' : 'club.modal.choose.later')}
        </Button>
      </Actions>
    </>
  )
})

const Connect = observer(({ club, modal }: Props & { modal: Extract<Modal, { kind: 'connect' }> }) => {
  const t = club.t
  return (
    <>
      <p className='text-text-muted text-[15px] leading-relaxed'>
        {modal.reconnect
          ? t('club.modal.connect.reconnectBody', { wallet: club.clubWalletMasked })
          : t('club.modal.connect.body')}
      </p>
      {club.busy && <p className='text-text-faint text-sm'>{t('club.modal.connect.waiting')}</p>}
      <ErrorLine>
        {club.actionError !== undefined ? t(club.actionError.key, club.actionError.params) : undefined}
      </ErrorLine>
      <Actions>
        <Button onClick={() => void club.cancelChange(false)}>{t('club.common.cancel')}</Button>
      </Actions>
    </>
  )
})

const Confirm = observer(({ club, modal }: Props & { modal: Extract<Modal, { kind: 'confirm' }> }) => {
  const t = club.t
  const p = modal.prepare
  const o = club.overview
  const name = o?.displayName ?? ''
  const expired = p.expiresAt !== undefined && club.displayNow >= p.expiresAt
  if (modal.release) {
    return (
      <>
        <p className='text-[15px] leading-relaxed'>
          {t('club.modal.release.body', { wallet: p.clubWalletMasked ?? club.clubWalletMasked, name })}
          {Number(p.minimum ?? '0') > 0 && ' ' + t('club.modal.release.grace')}
          {' ' + t('club.modal.release.after', { name })}
        </p>
        {p.claimsFromWalletVoid && <p className='text-tone-warn-fg text-sm'>{t('club.modal.confirm.void')}</p>}
        {p.claimsFromWalletVoid && club.paymentOpen && (
          <p className='text-tone-warn-fg text-sm'>{t('club.modal.confirm.voidPayment')}</p>
        )}
        <ErrorLine>
          {club.actionError !== undefined ? t(club.actionError.key, club.actionError.params) : undefined}
        </ErrorLine>
        <Actions>
          <Button onClick={() => void club.cancelChange(false)}>{t('club.common.cancel')}</Button>
          {expired ? (
            <Button kind='primary' onClick={() => void club.startRelease()}>
              {t('club.modal.confirm.again')}
            </Button>
          ) : (
            <Button kind='primary' busy={club.busy} onClick={() => void club.confirmChange()}>
              {t('club.modal.release.button', { wallet: p.clubWalletMasked ?? club.clubWalletMasked })}
            </Button>
          )}
        </Actions>
      </>
    )
  }
  const first = p.clubWalletMasked === undefined
  const level = club.level(p.clubLevel)
  const short = Number(p.minimum ?? '0') - Number(p.newWalletHpo ?? '0')
  return (
    <>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[300px] text-sm'>
          <thead className='text-text-faint'>
            <tr>
              <th className='py-1.5 text-start font-medium'></th>
              <th className='py-1.5 text-start font-medium'>{t('club.modal.confirm.now')}</th>
              <th className='py-1.5 text-start font-medium'>{t('club.modal.confirm.after')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className='border-border border-t'>
              <td className='text-text-muted py-1.5 pe-2'>{t('club.modal.confirm.wallet')}</td>
              <td className='num py-1.5 pe-3'>{p.clubWalletMasked ?? '—'}</td>
              <td className='num py-1.5 font-semibold'>{p.newWalletMasked ?? '—'}</td>
            </tr>
            <tr className='border-border border-t'>
              <td className='text-text-muted py-1.5 pe-2'>{t('club.modal.confirm.levelBoost')}</td>
              <td className='num py-1.5 pe-3'>{t('club.modal.levelBoost', { level, boost: club.boost(p.boost) })}</td>
              <td className='num py-1.5'>
                {t('club.modal.confirm.fromName', { level, boost: club.boost(p.boost), name })}
              </td>
            </tr>
            <tr className='border-border border-t'>
              <td className='text-text-muted py-1.5 pe-2'>{t('club.modal.confirm.eligible')}</td>
              <td className='num py-1.5 pe-3'>{first ? '—' : club.amount2(o?.holdings)}</td>
              <td className={'num py-1.5 ' + (p.belowMinimum ? 'text-tone-warn-fg' : 'text-tone-success-fg')}>
                {club.amount2(p.newWalletHpo)}
              </td>
            </tr>
            <tr className='border-border border-t'>
              <td className='text-text-muted py-1.5 pe-2'>{t('club.modal.minimum')}</td>
              <td className='num py-1.5'>{club.amount2(p.minimum)}</td>
              <td className='num py-1.5'>{club.amount2(p.minimum)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {p.belowMinimum ? (
        <div className='bg-tone-warn-bg border-tone-warn-border flex flex-col gap-1 rounded-2xl border p-4'>
          <p className='text-tone-warn-fg font-semibold'>
            {t('club.modal.confirm.belowTitle', { wallet: p.newWalletMasked ?? '—', short: club.amountUp(short) })}
          </p>
          <p className='text-text-muted text-sm'>{t('club.modal.confirm.belowBody', { level })}</p>
        </div>
      ) : (
        <p className='text-tone-success-fg text-sm'>
          {t('club.modal.confirm.meets', { wallet: p.newWalletMasked ?? '—', level })}
        </p>
      )}
      <p className='text-text-muted text-sm leading-relaxed'>
        {first
          ? t('club.modal.confirm.firstNote', { name })
          : t('club.modal.confirm.note', { old: p.clubWalletMasked ?? '—', amount: club.amount2(o?.unclaimed), name })}
      </p>
      {p.claimsOpenAt !== undefined && (
        <p className='text-text-muted text-sm'>
          {t('club.modal.confirm.claimsOpen', { date: club.date(p.claimsOpenAt, true) })}
        </p>
      )}
      {p.claimsFromWalletVoid && <p className='text-tone-warn-fg text-sm'>{t('club.modal.confirm.void')}</p>}
      {p.claimsFromWalletVoid && club.paymentOpen && (
        <p className='text-tone-warn-fg text-sm'>{t('club.modal.confirm.voidPayment')}</p>
      )}
      <ErrorLine>
        {club.actionError !== undefined ? t(club.actionError.key, club.actionError.params) : undefined}
      </ErrorLine>
      <Actions>
        <Button onClick={() => void club.cancelChange(false)}>
          {modal.flow === 2
            ? t('club.modal.choose.cancel2')
            : modal.flow === 3
              ? t('club.common.back')
              : first
                ? t('club.common.cancel')
                : t('club.modal.confirm.cancelKeep', { wallet: p.clubWalletMasked ?? '—' })}
        </Button>
        {expired ? (
          <Button kind='primary' onClick={() => void club.startLink(modal.flow)}>
            {t('club.modal.confirm.again')}
          </Button>
        ) : (
          <Button kind='primary' busy={club.busy} onClick={() => void club.confirmChange()}>
            {first
              ? t('club.modal.confirm.link', { wallet: p.newWalletMasked ?? '—' })
              : t('club.modal.confirm.switch', { wallet: p.newWalletMasked ?? '—' })}
          </Button>
        )}
      </Actions>
    </>
  )
})

const Claim = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  const b = Number(o?.unclaimed ?? '0')
  const minimum = Number(o?.minimum ?? '0')
  const holdings = Number(o?.holdings ?? '0')
  const next = o !== undefined && o.clubLevel < 9 ? club.level(o.clubLevel + 1) : undefined
  let effect = t('club.modal.claim.effectTop')
  if (next !== undefined) {
    effect =
      o?.state === 'grace'
        ? t('club.modal.claim.effectGrace', { level: next })
        : o?.state === 'suspended'
          ? t('club.modal.claim.effectSuspended', { level: next })
          : t('club.modal.claim.effect', { level: next })
  }
  const block = club.claimBlock
  return (
    <>
      <div className='flex flex-col gap-1.5'>
        <Row label={t('club.modal.claim.sentTo')} value={club.clubWalletMasked} />
        <Row label={t('club.modal.claim.fee')} value={t('club.modal.claim.feeValue')} />
        <Row
          label={t('club.modal.claim.receive')}
          value={t('club.common.hpoAmount', { amount: club.amount2(o?.unclaimed) })}
          strong
        />
      </div>
      <p className='font-semibold'>{t('club.modal.claim.changes')}</p>
      <div className='flex flex-col gap-1.5'>
        <Row label={t('club.modal.claim.nextSeason')} value={effect} />
        <Row label={t('club.modal.minimum')} value={`${club.amount2(minimum)} → ${club.amount2(minimum + b)} HPO`} />
        <Row
          label={t('club.modal.claim.after')}
          value={t('club.common.hpoAmount', { amount: club.amount2(holdings + b) })}
        />
      </div>
      <p className='text-text-faint text-sm leading-relaxed'>
        {t('club.modal.claim.note', { wallet: club.clubWalletMasked })}
      </p>
      <ErrorLine>
        {club.actionError !== undefined
          ? t(club.actionError.key, club.actionError.params)
          : block !== undefined
            ? t(block.key, block.params)
            : undefined}
      </ErrorLine>
      <Actions>
        <Button onClick={() => club.closeModal()} disabled={club.busy}>
          {t('club.common.cancel')}
        </Button>
        <Button kind='primary' busy={club.busy} disabled={block !== undefined} onClick={() => void club.pay('claim')}>
          {t('club.modal.confirmInWallet')}
        </Button>
      </Actions>
    </>
  )
})

const ClaimDone = observer(({ club, modal }: Props & { modal: Extract<Modal, { kind: 'claimDone' }> }) => {
  const t = club.t
  const level = modal.target !== undefined ? club.level(modal.target - 1) : ''
  return (
    <>
      <p className='text-[15px] leading-relaxed'>
        {modal.below
          ? t('club.modal.claimDone.bodyBelow', {
              amount: club.amount2(modal.amount),
              wallet: club.clubWalletMasked,
              date: club.date(club.overview?.stateUntil, true),
            })
          : modal.qualified
            ? t('club.modal.claimDone.bodyQualified', {
                amount: club.amount2(modal.amount),
                wallet: club.clubWalletMasked,
                level,
              })
            : t('club.modal.claimDone.body', { amount: club.amount2(modal.amount), wallet: club.clubWalletMasked })}
      </p>
      <Actions>
        <Button kind='primary' onClick={() => club.closeModal()}>
          {t('club.common.done')}
        </Button>
      </Actions>
    </>
  )
})

const Upgrade = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  const offer = club.upgradeOffer
  const block = club.upgradeBlock
  const fee = typeof offer?.fee === 'number' ? club.amount(offer.fee, 0) : '—'
  const suspended = o?.state === 'suspended'
  return (
    <>
      <div className='flex flex-col gap-1.5'>
        <Row
          label={t('club.modal.upgrade.now')}
          value={t('club.modal.levelBoost', { level: club.level(o?.clubLevel), boost: club.boost(o?.boost) })}
        />
        <Row
          label={t('club.modal.upgrade.after')}
          value={t('club.modal.levelBoost', {
            level: club.level(offer !== undefined ? offer.n - 1 : undefined),
            boost: club.boost(o?.nextBoost),
          })}
          strong
        />
        <Row label={t('club.levelUp.fee')} value={t('club.levelUp.feeValue', { fee })} strong />
        <Row label={t('club.modal.upgrade.paidTo')} value='hipo.ton' />
        <Row
          label={t('club.levelUp.perRound')}
          value={`~${club.amount(o?.estimateNow, 0)} → ~${club.amount(o?.estimateNext, 0)} HPO`}
        />
      </div>
      <p className='text-text-faint text-sm leading-relaxed'>
        {suspended
          ? t('club.modal.upgrade.noteSuspended', {
              level: club.level(offer !== undefined ? offer.n - 1 : undefined),
              boost: club.boost(o?.nextBoost),
            })
          : t('club.modal.upgrade.note')}
      </p>
      <ErrorLine>
        {club.actionError !== undefined
          ? t(club.actionError.key, club.actionError.params)
          : block !== undefined
            ? t(block.key, block.params)
            : undefined}
      </ErrorLine>
      <Actions>
        <Button onClick={() => club.closeModal()} disabled={club.busy}>
          {t('club.common.cancel')}
        </Button>
        <Button
          kind='primary'
          busy={club.busy}
          disabled={block !== undefined || club.levels === undefined}
          onClick={() => void club.pay('upgrade')}
        >
          {t('club.modal.upgrade.pay', { fee })}
        </Button>
      </Actions>
    </>
  )
})

const UpgradeDone = observer(({ club, modal }: Props & { modal: Extract<Modal, { kind: 'upgradeDone' }> }) => {
  const t = club.t
  return (
    <>
      <p className='text-[15px] leading-relaxed'>
        {t('club.modal.upgradeDone.body', { level: club.level(modal.level) })}
      </p>
      <Actions>
        <Button kind='primary' onClick={() => club.closeModal()}>
          {t('club.common.done')}
        </Button>
      </Actions>
    </>
  )
})

const NotApplied = observer(({ club, modal }: Props & { modal: Extract<Modal, { kind: 'notApplied' }> }) => {
  const t = club.t
  return (
    <>
      <p className='text-[15px] leading-relaxed'>{t('club.error.notApplied', { date: club.date(modal.at, true) })}</p>
      <Actions>
        <Button onClick={() => club.closeModal()}>{t('club.common.cancel')}</Button>
        <Button kind='primary' onClick={() => club.acknowledge(modal.ackKey, modal.payment)}>
          {t('club.modal.notApplied.read')}
        </Button>
      </Actions>
    </>
  )
})

const Modals = observer(({ club }: Props) => {
  const modal = club.modal
  if (modal === undefined) {
    return null
  }
  const t = club.t
  const o = club.overview
  const name = o?.displayName ?? ''
  let title = ''
  let body: React.ReactNode = null
  let locked = club.busy
  switch (modal.kind) {
    case 'linkTelegram':
      title = t('club.modal.tg.title')
      body = <LinkTelegram club={club} modal={modal} />
      break
    case 'changeWallet':
      title = t('club.modal.change.title')
      body = <ChangeWallet club={club} />
      break
    case 'choose':
      title = modal.flow === 2 ? t('club.modal.choose.title2', { name }) : t('club.modal.choose.title3')
      body = <Choose club={club} modal={modal} />
      break
    case 'connect':
      title = modal.reconnect
        ? t('club.modal.connect.reconnectTitle', { wallet: club.clubWalletMasked })
        : t('club.modal.connect.title')
      body = <Connect club={club} modal={modal} />
      locked = false
      break
    case 'confirm':
      title = modal.release
        ? t('club.modal.release.title', { wallet: modal.prepare.clubWalletMasked ?? club.clubWalletMasked })
        : modal.prepare.clubWalletMasked === undefined
          ? t('club.modal.confirm.titleFirst', { wallet: modal.prepare.newWalletMasked ?? '—', name })
          : t('club.modal.confirm.title', { wallet: modal.prepare.newWalletMasked ?? '—', name })
      body = <Confirm club={club} modal={modal} />
      break
    case 'claim':
      title = t('club.modal.claim.title', { amount: club.amount2(o?.unclaimed) })
      body = <Claim club={club} />
      break
    case 'claimDone':
      title = modal.below
        ? t('club.modal.claimDone.titleBelow', {
            level: modal.target !== undefined ? club.level(modal.target - 1) : '',
          })
        : modal.qualified && modal.target !== undefined
          ? t('club.modal.claimDone.titleQualified', { level: club.level(modal.target - 1) })
          : t('club.modal.claimDone.title')
      body = <ClaimDone club={club} modal={modal} />
      break
    case 'upgrade':
      title = t('club.modal.upgrade.title', {
        level: club.level(club.upgradeOffer !== undefined ? club.upgradeOffer.n - 1 : undefined),
      })
      body = <Upgrade club={club} />
      break
    case 'upgradeDone':
      title = t('club.modal.upgradeDone.title', { level: club.level(modal.level) })
      body = <UpgradeDone club={club} modal={modal} />
      break
    case 'notApplied':
      title = t('club.modal.notApplied.title')
      body = <NotApplied club={club} modal={modal} />
      break
  }
  return (
    <Sheet title={title} onClose={() => club.closeModal()} locked={locked} closeLabel={t('club.common.close')}>
      {body}
    </Sheet>
  )
})

export default Modals
