// The Overview's status message — one sentence and one action, picked in the order of
// specs/club-website.md §5 — and the grace/restore panel shown while below the Level minimum.
import { observer } from 'mobx-react-lite'
import type { ClubModel, Tone } from './ClubModel.ts'
import { BUY_HPO_URL, HIPO_CHAT_URL } from './ClubModel.ts'
import { CLAIM_MIN_NANO } from './clubTx.ts'
import { Button, Card, ErrorLine, Strip } from './ui.tsx'

interface Props {
  club: ClubModel
}

const HOUR = 3600

export const GracePanel = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  if (o === undefined || (o.state !== 'grace' && o.state !== 'suspended')) {
    return null
  }
  const now = club.displayNow
  const until = o.stateUntil ?? now
  const left = club.duration(until - now)
  const short = club.amountUp(o.short)
  const minimum = club.amount2(o.minimum)
  const holdings = club.amount2(o.holdings)
  const level = club.level(o.clubLevel)
  const grace = o.state === 'grace'
  const since = o.stateSince
  const steps = grace
    ? [
        { when: club.date(since, true), text: t('club.panel.fellBelow', { minimum }) },
        {
          when: t('club.panel.now'),
          text: t('club.panel.nowGrace', { holdings, short, level, boost: club.boost(o.boost) }),
          current: true,
        },
        { when: club.date(until, true), text: t('club.panel.ifStillBelow'), future: true },
      ]
    : [
        {
          when: club.date(since !== undefined ? since - 24 * HOUR : undefined, true),
          text: t('club.panel.fellBelow', { minimum }),
        },
        { when: club.date(since, true), text: t('club.panel.graceEnded') },
        { when: t('club.panel.now'), text: t('club.panel.nowSuspended', { holdings, short }), current: true },
        { when: club.date(until, true), text: t('club.panel.deadline'), future: true },
      ]
  return (
    <Card>
      <div className='flex flex-col gap-1'>
        <h2 className='font-fredoka text-xl font-semibold'>
          {grace ? t('club.panel.graceTitle') : t('club.panel.restoreTitle', { level })}
        </h2>
        <p className='text-tone-warn-fg text-sm font-medium'>
          {grace
            ? t('club.panel.graceDeadline', { date: club.date(until, true), left })
            : t('club.panel.restoreDeadline', { date: club.date(until, true), left })}
        </p>
      </div>
      <ol className='grid gap-3 sm:auto-cols-fr sm:grid-flow-col'>
        {steps.map((step, i) => (
          <li
            key={i}
            className={
              'flex min-w-0 flex-col gap-0.5 border-t-[3px] pt-2.5 ' +
              (step.future
                ? 'border-border-strong border-dashed'
                : step.current
                  ? 'border-tone-warn-fg'
                  : 'border-border-strong')
            }
          >
            <span className={'num text-[13px] ' + (step.current ? 'text-tone-warn-fg' : 'text-text-faint')}>
              {step.when}
            </span>
            <span className='text-sm'>{step.text}</span>
          </li>
        ))}
      </ol>
      <div className='bg-surface-deep flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-text-muted text-sm'>{t('club.panel.buyHint', { wallet: club.clubWalletMasked })}</p>
        <Button kind='primary' href={BUY_HPO_URL} className='shrink-0'>
          {t('club.common.buyAmount', { amount: short })}
        </Button>
      </div>
      <p className='text-text-faint text-sm leading-relaxed'>
        {grace
          ? t(o.settings.alerts ? 'club.panel.graceNote' : 'club.panel.graceNoteNoAlerts')
          : t('club.panel.restoreNote', { minimum })}
      </p>
    </Card>
  )
})

const StatusStrip = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  const view = club.view
  const notice = club.notice
  const level = club.level(o?.clubLevel)
  const nextLevel = o !== undefined && o.clubLevel < 9 ? club.level(o.clubLevel + 1) : undefined
  let tone: Tone = 'info'
  let title = ''
  let body: string | undefined
  let action: React.ReactNode = null

  const connectButton = (
    <Button kind='primary' onClick={club.model.connect}>
      {t('club.common.connectWallet')}
    </Button>
  )
  const linkButton = (
    <Button kind='primary' onClick={() => club.openModal({ kind: 'linkTelegram' })}>
      {t('club.common.linkTelegram')}
    </Button>
  )
  const buyButton = (amount: string) => (
    <Button kind='primary' href={BUY_HPO_URL}>
      {t('club.common.buyAmount', { amount })}
    </Button>
  )

  switch (view) {
    case 'error':
      tone = 'warn'
      title = t('club.status.errorTitle')
      body = t('club.status.errorBody')
      action = (
        <Button kind='primary' onClick={() => void club.load()}>
          {t('club.common.retry')}
        </Button>
      )
      break
    case 'launching':
      title = t('club.status.launchingTitle')
      body = t('club.status.launchingBody')
      break
    case 'connect':
      title = t('club.status.connectTitle')
      body = t('club.status.connectBody')
      action = connectButton
      break
    case 'A':
      title = t('club.status.aTitle')
      body = t('club.status.aBody', {
        wallet: club.mask(club.connected),
        level: club.level(club.walletRewards?.club?.clubLevel),
      })
      action = club.tma ? null : linkButton
      break
    case 'A0':
      title = t('club.status.a0Title', { wallet: club.mask(club.connected) })
      body = t('club.status.a0Body')
      action = club.tma ? null : linkButton
      break
    case 'frozen':
      tone = 'warn'
      title = t('club.status.frozenTitle')
      body = t('club.status.frozenBody')
      action = <Button href={HIPO_CHAT_URL}>{t('club.common.contactSupport')}</Button>
      break
    case 'paused':
      tone = 'warn'
      title = t('club.status.pausedTitle', { wallet: club.clubWalletMasked })
      body = t('club.status.pausedBody', { connected: club.mask(club.connected), wallet: club.clubWalletMasked })
      action = (
        <Button kind='primary' onClick={() => club.openModal({ kind: 'choose', flow: 3 })}>
          {t('club.status.chooseWallet')}
        </Button>
      )
      break
    case 'nolink':
      title = t('club.status.nolinkTitle')
      body =
        club.connected === undefined
          ? t('club.status.nolinkBodyConnect')
          : t('club.status.nolinkBody', { wallet: club.mask(club.connected) })
      action =
        club.connected === undefined ? (
          connectButton
        ) : (
          <Button kind='primary' busy={club.busy} onClick={() => void club.startLink(0)}>
            {t('club.status.nolinkButton', { wallet: club.mask(club.connected) })}
          </Button>
        )
      break
    case 'connectClub':
      title = t('club.connectClub.title', { wallet: club.clubWalletMasked })
      body = t('club.connectClub.body')
      action = connectButton
      break
    case 'E':
      tone = 'warn'
      title = t('club.status.eTitle', { level, date: club.date(o?.stateUntil, true) })
      body = t('club.status.eBody', { short: club.amountUp(o?.short), level })
      action = buyButton(club.amountUp(o?.short))
      break
    case 'D':
      tone = 'warn'
      title = t('club.status.dTitle', { left: club.duration((o?.stateUntil ?? club.displayNow) - club.displayNow) })
      body = t('club.status.dBody', {
        short: club.amountUp(o?.short),
        minimum: club.amount2(o?.minimum),
        date: club.date(o?.stateUntil, true),
        level,
      })
      action = buyButton(club.amountUp(o?.short))
      break
    case 'D2':
      tone = 'warn'
      title = t('club.status.d2Title')
      body = t('club.status.d2Body', { short: club.amountUp(o?.short), date: club.date(o?.stateUntil, true), level })
      action = buyButton(club.amountUp(o?.short))
      break
    case 'G':
      tone = 'neutral'
      title = t('club.status.gTitle')
      body = t('club.status.gBody', { from: club.level(o?.resetFromLevel), date: club.date(o?.resetAt) })
      action =
        club.upgradeOffer !== undefined && typeof club.upgradeOffer.fee === 'number' ? (
          <Button kind='primary' disabled={club.upgradeBlock !== undefined} onClick={() => void club.openUpgrade()}>
            {t('club.levelUp.button', { level: club.level(1), fee: club.amount(club.upgradeOffer.fee, 0) })}
          </Button>
        ) : null
      break
    case 'F':
      tone = 'success'
      title = t('club.status.fTitle', { level })
      body =
        t('club.status.fBody', { holdings: club.amount2(o?.holdings), boost: club.boost(o?.boost) }) +
        (o?.claimedThisSeason || nextLevel === undefined ? '' : ' ' + t('club.status.fBodyNext', { next: nextLevel }))
      break
    case 'onItsWay': {
      tone = 'success'
      const amount = o?.claimInProgress?.amount
      title = t('club.status.onItsWayTitle')
      body =
        amount !== undefined
          ? t('club.status.onItsWayBody', { amount: club.amount2(amount), wallet: club.clubWalletMasked })
          : t('club.status.onItsWayBodyNoAmount', { wallet: club.clubWalletMasked })
      break
    }
    case 'upgradeOnItsWay': {
      tone = 'success'
      // The intent's level is the upgrade's n (1-based); club.level takes the 0-based level.
      const n = o?.payInProgress?.level
      title = t('club.status.upgradeOnItsWayTitle')
      body =
        n !== undefined
          ? t('club.status.upgradeOnItsWayBody', { level: club.level(n - 1) })
          : t('club.status.upgradeOnItsWayBodyNoLevel')
      break
    }
    case 'C':
      tone = 'success'
      title = nextLevel === undefined ? t('club.status.cTopTitle') : t('club.status.cTitle', { next: nextLevel })
      body = nextLevel === undefined ? t('club.status.cTopBody') : t('club.status.cBody')
      break
    case 'B':
      title = nextLevel === undefined ? t('club.status.bTopTitle') : t('club.status.bTitle', { next: nextLevel })
      body = t(nextLevel === undefined ? 'club.status.bTopBody' : 'club.status.bBody', {
        amount: club.amount2(o?.unclaimed),
      })
      action =
        club.claimBlock === undefined ? (
          <Button kind='primary' onClick={() => void club.openClaim()}>
            {t('club.claim.button', { amount: club.amount2(o?.unclaimed) })}
          </Button>
        ) : null
      break
    case 'belowMin': {
      title = nextLevel === undefined ? t('club.status.bTopTitle') : t('club.status.bTitle', { next: nextLevel })
      const b = club.unclaimedNano
      const estimate = Number(o?.estimateNow ?? '0')
      const left = b === undefined ? undefined : Number(CLAIM_MIN_NANO - b) / 1e9
      const rounds = left !== undefined && left > 0 && estimate > 0 ? Math.ceil(left / estimate) : undefined
      body =
        rounds !== undefined
          ? t('club.status.belowMinBody', { rounds: club.amount(rounds, 0) })
          : t('club.status.belowMinBodyNoEstimate')
      break
    }
    case 'gate': {
      const gate = club.gateError(o?.claim.reason ?? 'unknown')
      title = nextLevel === undefined ? t('club.status.bTopTitle') : t('club.status.bTitle', { next: nextLevel })
      body = t(gate.key, gate.params)
      break
    }
    default:
      break
  }

  return (
    <>
      {notice !== undefined && (
        <Strip tone={notice.tone} title={notice.title} body={notice.body}>
          {notice.action === 'buy' && (
            <Button kind='primary' href={BUY_HPO_URL}>
              {t('club.common.buyHpo')}
            </Button>
          )}
          {notice.action === 'connect' && connectButton}
          <Button kind='quiet' onClick={() => club.setNotice(undefined)}>
            {t('club.common.dismiss')}
          </Button>
        </Strip>
      )}
      {title !== '' && (
        <Strip tone={tone} title={title} body={body}>
          {action}
        </Strip>
      )}
      {club.actionError !== undefined && club.modal === undefined && (
        <ErrorLine>{t(club.actionError.key, club.actionError.params)}</ErrorLine>
      )}
      <GracePanel club={club} />
    </>
  )
})

export default StatusStrip
