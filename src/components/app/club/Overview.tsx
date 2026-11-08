// The Club's Overview tab (specs/club-website.md §5; SPEC §4, wireframe Main.dc.html): the status
// strip, the grace/restore panel, the level and claim cards, Your HPO, Level up, the leaderboard,
// balances and the teasers. Every figure comes from the server; none is written here.
import type { MouseEvent, ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import { nodes, Num } from '../Interpolate'
import type { ClubModel } from './ClubModel.ts'
import type { ClubTab } from '../Model.ts'
import { CLAIM_MIN_NANO } from './clubTx.ts'
import Leaderboard from './Leaderboard.tsx'
import {
  BalancesIcon,
  BoltIcon,
  CalendarIcon,
  ChevronsIcon,
  CommunityIcon,
  FriendsIcon,
  HpoIcon,
  PauseIcon,
  ShieldIcon,
} from './icons.tsx'
import StatusStrip from './StatusStrip.tsx'
import {
  bigNumber,
  Button,
  Card,
  CardTitle,
  Chip,
  Eyebrow,
  footnote,
  Row,
  rowSelf,
  Skeleton,
  tableRow,
  tableTdTight,
  tableTh,
} from './ui.tsx'
import { BUY_HPO_URL, REVENUE_MIN } from './ClubModel.ts'

interface Props {
  club: ClubModel
}

const POOL_HELP = '/defi/'

export const LevelLadder = ({
  level,
  suspended,
  nextDashed,
}: {
  level: number
  suspended: boolean
  nextDashed: boolean
}) => (
  <div className='grid grid-cols-10 gap-1' aria-hidden='true'>
    {Array.from({ length: 10 }, (_, i) => {
      const filled = i <= level
      const dashed = nextDashed && i === level + 1
      return (
        <div
          key={i}
          className={
            'h-2.5 rounded ' +
            (filled
              ? suspended
                ? 'bg-tone-warn-border'
                : 'bg-accent-fill'
              : dashed
                ? 'border-tone-success-fg border border-dashed'
                : 'bg-border')
          }
        ></div>
      )
    })}
  </div>
)

// The ladder's end labels, "1 · 1.0×" and "10 · 10×" (static, so the wallet-only card has them too).
const LadderEnds = ({ club }: Props) => (
  <div className='text-text-faint text-caption flex justify-between leading-[18px]'>
    <Num>{club.t('club.level.ladderLow')}</Num>
    <Num>{club.t('club.level.ladderHigh')}</Num>
  </div>
)

const chipTone = {
  active: 'success',
  at_risk: 'warn',
  suspended: 'warn',
  restored: 'success',
  reset: 'neutral',
} as const

export const LevelCard = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  if (club.session === undefined) {
    const a = club.walletRewards?.club
    if (a?.clubWallet !== true) {
      return (
        <Card>
          <CardTitle variant='eyebrow' icon={ShieldIcon}>
            {t('club.level.title')}
          </CardTitle>
          <p className='text-text-muted text-body leading-normal'>{t('club.level.notClubWallet')}</p>
        </Card>
      )
    }
    const status = a.status === 'at_risk' ? 'at_risk' : a.status === 'suspended' ? 'suspended' : 'active'
    return (
      <Card>
        <CardTitle
          variant='eyebrow'
          icon={ShieldIcon}
          aside={<Chip tone={chipTone[status]}>{t('club.chip.' + (status === 'at_risk' ? 'atRisk' : status))}</Chip>}
        >
          {t('club.level.title')}
        </CardTitle>
        <div className='flex flex-wrap items-baseline gap-x-3'>
          <span className={bigNumber}>{t('club.common.levelN', { level: club.level(a.clubLevel) })}</span>
          <span className='text-text-secondary text-lead'>{t('club.level.boost', { boost: club.boost(a.boost) })}</span>
        </div>
        <LevelLadder level={a.clubLevel ?? 0} suspended={status === 'suspended'} nextDashed={false} />
        <LadderEnds club={club} />
        <p className='text-text-secondary text-body leading-normal'>{t('club.level.walletOnly')}</p>
      </Card>
    )
  }
  if (o === undefined) {
    return <Skeleton className='h-56' />
  }
  const suspended = o.state === 'suspended'
  const chip = o.chip in chipTone ? (o.chip as keyof typeof chipTone) : 'active'
  const chipLabel =
    chip === 'reset'
      ? t('club.chip.resetOn', { date: club.date(o.resetAt) })
      : t('club.chip.' + (chip === 'at_risk' ? 'atRisk' : chip))
  let line = nodes(t('club.level.line'), {
    link: (
      <a className='text-accent hover:underline' href={club.model.localizedPath(POOL_HELP)}>
        {t('club.level.lineLink')}
      </a>
    ),
  })
  if (suspended) {
    line = <>{t('club.level.lineSuspended', { level: club.level(o.clubLevel), boost: club.boost(o.boost) })}</>
  } else if (o.state === 'grace') {
    line = <>{t('club.level.lineGrace', { boost: club.boost(o.boost), date: club.date(o.stateUntil, true) })}</>
  } else if (chip === 'reset') {
    line = <>{t('club.level.lineReset')}</>
  }
  return (
    <Card>
      <CardTitle variant='eyebrow' icon={ShieldIcon} aside={<Chip tone={chipTone[chip]}>{chipLabel}</Chip>}>
        {t('club.level.title')}
      </CardTitle>
      <div className='flex flex-wrap items-baseline gap-x-3'>
        <span className={bigNumber}>{t('club.common.levelN', { level: club.level(o.clubLevel) })}</span>
        <span className='text-text-secondary text-lead'>
          {suspended ? t('club.level.suspendedBoost') : t('club.level.boost', { boost: club.boost(o.boost) })}
        </span>
      </div>
      <LevelLadder level={o.clubLevel} suspended={suspended} nextDashed={o.claimedThisSeason && o.state === 'ok'} />
      <LadderEnds club={club} />
      <p className='text-text-secondary text-body leading-normal'>{line}</p>
    </Card>
  )
})

export const ClaimCard = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  if (club.session === undefined) {
    return (
      <Card>
        <CardTitle variant='eyebrow' icon={BoltIcon}>
          {t('club.claim.title')}
        </CardTitle>
        <p className='text-text-muted text-body leading-normal'>{t('club.claim.walletOnly')}</p>
        <div className='mt-auto flex flex-col gap-1.5'>
          <Button kind='primary' onClick={() => club.openModal({ kind: 'linkTelegram', after: 'claim' })}>
            {t('club.common.linkTelegram')}
          </Button>
          <p className='text-text-faint text-label leading-normal'>{t('club.claim.terms')}</p>
        </div>
      </Card>
    )
  }
  if (o === undefined) {
    return <Skeleton className='h-56' />
  }
  const b = club.unclaimedNano
  const below = b !== undefined && b < CLAIM_MIN_NANO
  const percent = b === undefined ? 0 : Math.min(100, Number((b * 100n) / CLAIM_MIN_NANO))
  const left = b === undefined ? undefined : Number(CLAIM_MIN_NANO - b) / 1e9
  const estimate = Number(o.estimateNow ?? '0')
  const rounds = left !== undefined && left > 0 && estimate > 0 ? Math.ceil(left / estimate) : undefined
  const block = club.claimBlock
  const inProgress = o.claimInProgress
  return (
    <Card>
      <CardTitle
        variant='eyebrow'
        icon={BoltIcon}
        aside={
          <button
            type='button'
            className='text-accent cursor-pointer text-sm underline underline-offset-2'
            onClick={() => club.model.navigateToClubTab('rewards')}
          >
            {t('club.claim.history')}
          </button>
        }
      >
        {t('club.claim.title')}
      </CardTitle>
      <div className='flex flex-wrap items-baseline gap-x-2'>
        <span className={bigNumber}>{club.amount2(o.unclaimed)}</span>
        <span className='text-text-secondary text-lead'>HPO</span>
      </div>
      {inProgress !== undefined ? (
        <p className='text-tone-success-fg text-sm leading-normal'>
          {t('club.claim.inProgress', {
            amount: club.amount2(inProgress.amount),
            wallet: club.mask(inProgress.wallet ?? club.clubWallet),
          })}
        </p>
      ) : (
        below && (
          <div className='flex flex-col gap-1.5'>
            <div className='bg-border h-2 overflow-hidden rounded-full' aria-hidden='true'>
              <div className='bg-text-muted h-full' style={{ width: percent + '%' }}></div>
            </div>
            <p className='text-text-muted text-sm'>
              {rounds !== undefined
                ? t('club.claim.toMinRounds', { left: club.amount2(left), rounds: club.amount(rounds, 0) })
                : t('club.claim.toMin', { left: club.amount2(left) })}
            </p>
          </div>
        )
      )}
      <div className='border-border flex flex-col gap-2 border-t pt-4'>
        <Row
          label={t('club.claim.perRound')}
          value={t('club.claim.perRoundValue', {
            amount: club.amount2(o.estimateNow),
            boost: club.boost(o.state === 'suspended' ? 1 : o.boost),
          })}
        />
        <Row
          label={t('club.claim.claimedSeason')}
          value={o.claimedThisSeason ? t('club.claim.claimedYes') : t('club.claim.claimedNo')}
        />
      </div>
      <div className='mt-auto flex flex-col gap-1.5'>
        <Button kind='primary' disabled={block !== undefined} onClick={() => void club.openClaim()}>
          {block === undefined
            ? t('club.claim.button', { amount: club.amount2(o.unclaimed) })
            : t(block.key, block.params)}
        </Button>
        <p className='text-text-faint text-label leading-normal'>{t('club.claim.terms')}</p>
      </div>
    </Card>
  )
})

export const YourHpo = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  if (club.session === undefined || o === undefined || o.clubWallet === undefined) {
    return null
  }
  const minimum = Number(o.minimum ?? '0')
  const holdings = Number(o.holdings ?? '0')
  const reset = o.chip === 'reset' || minimum === 0
  const below = !reset && holdings < minimum
  const scale = Math.max(holdings, minimum) * 1.08 || 1
  const rank = o.rank
  let message = t('club.hpo.above')
  if (reset) {
    message = t('club.hpo.noMinimum')
  } else if (below) {
    message = t('club.hpo.add', { short: club.amountUp(o.short ?? minimum - holdings) })
  } else if (o.chip === 'restored') {
    message = t('club.hpo.restored')
  }
  const settings = o.settings
  const updated = o.holdingsAt !== undefined ? club.duration(club.displayNow - o.holdingsAt) : undefined
  return (
    <Card>
      <CardTitle
        variant='eyebrow'
        icon={HpoIcon}
        aside={
          <Chip tone={reset ? 'neutral' : below ? 'warn' : 'success'}>
            {t(reset ? 'club.hpo.chipNone' : below ? 'club.hpo.chipBelow' : 'club.hpo.chipAbove')}
          </Chip>
        }
      >
        {t('club.hpo.title')}
      </CardTitle>
      <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <div className='flex min-w-0 flex-col gap-1'>
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <span className={bigNumber}>{club.amountDown(o.holdings)}</span>
            <span className='text-text-secondary text-lead'>HPO</span>
          </div>
          {rank.listed && rank.growth !== undefined && (
            <p
              className={
                'text-body leading-normal ' + (rank.growth >= 0 ? 'text-tone-success-fg' : 'text-tone-warn-fg')
              }
            >
              {t('club.hpo.growth', {
                growth: (rank.growth >= 0 ? '+' : '−') + club.amount(Math.abs(rank.growth), 1),
              })}
            </p>
          )}
        </div>
        {rank.listed && rank.rank !== undefined && (
          // The wireframe's two lines: the leaderboard's name over the rank (and band).
          <p className='flex min-w-0 flex-col text-end leading-normal'>
            <span className='text-text-muted text-sm'>
              {t('club.board.title', { level: club.level(rank.clubLevel) })}
            </span>
            <span className='text-xl font-semibold'>
              {t(rank.band ? 'club.hpo.rankBandValue' : 'club.hpo.rankValue', {
                rank: club.amount(rank.rank, 0),
                band: club.amount(rank.band, 0),
              })}
            </span>
          </p>
        )}
      </div>
      {!reset && (
        <div className='flex flex-col gap-2'>
          <div className='bg-border relative h-3.5 rounded-full' aria-hidden='true'>
            <div
              className={
                'absolute inset-y-0 start-0 rounded-full ' + (below ? 'bg-tone-warn-fg' : 'bg-tone-success-fg')
              }
              style={{ width: ((holdings / scale) * 100).toFixed(1) + '%' }}
            ></div>
            <div
              className='bg-text absolute -top-1.5 -bottom-1.5 w-[3px] rounded-xs'
              style={{ insetInlineStart: ((minimum / scale) * 100).toFixed(1) + '%' }}
            ></div>
          </div>
          <div className='text-text-muted text-label flex flex-wrap justify-between gap-x-3 gap-y-1 leading-normal'>
            <span className='min-w-0'>{t('club.hpo.marker', { minimum: club.amount2(o.minimum) })}</span>
            {o.ratio !== undefined && (
              <span className='min-w-0'>
                {o.ratio > 1000 ? t('club.hpo.ratioOver') : t('club.hpo.ratio', { ratio: club.amount(o.ratio, 0) })}
              </span>
            )}
          </div>
        </div>
      )}
      <p className='text-body leading-normal'>{message}</p>
      {!below && rank.listed && rank.buy !== undefined && rank.buy.x !== '' && (
        <div className='bg-surface-raised rounded-control flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3.5'>
          <p className='text-body min-w-0 flex-1 leading-normal'>
            {t('club.hpo.nudge', {
              x: club.whole(rank.buy.x),
              rank: club.amount(rank.buy.rank, 0),
              level: club.level(rank.clubLevel),
            })}
          </p>
          <a
            className='text-accent text-body underline underline-offset-2'
            href={BUY_HPO_URL}
            target={BUY_HPO_URL.startsWith('http') ? '_blank' : undefined}
            rel='noopener noreferrer'
          >
            {t('club.common.buyHpo')}
          </a>
        </div>
      )}
      <div className='border-border text-label flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5 border-t pt-3.5 leading-normal'>
        <p className='text-text-faint min-w-0'>
          {nodes(
            t(updated !== undefined ? 'club.hpo.footer' : 'club.hpo.footerNoTime', {
              wallet: club.clubWalletMasked,
              ago: updated ?? '',
            }),
            {
              link: (
                <a className='text-accent hover:underline' href={club.model.localizedPath(POOL_HELP)}>
                  {t('club.common.learnMore')}
                </a>
              ),
            },
          )}
        </p>
        <p className='text-text-faint min-w-0'>
          <span className={settings.alertsUnreachable ? 'text-tone-warn-fg' : ''}>
            {t(
              settings.alertsUnreachable
                ? 'club.hpo.alertsUnreachable'
                : settings.alerts
                  ? 'club.hpo.alertsOn'
                  : 'club.hpo.alertsOff',
            )}
          </span>{' '}
          ·{' '}
          <button
            type='button'
            className='text-accent cursor-pointer hover:underline'
            onClick={() => void club.setSetting({ alerts: !settings.alerts })}
          >
            {t(settings.alerts ? 'club.hpo.alertsTurnOff' : 'club.hpo.alertsTurnOn')}
          </button>
        </p>
      </div>
    </Card>
  )
})

export const LevelUp = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  if (club.session === undefined || o === undefined) {
    return null
  }
  const suspended = o.state === 'suspended'
  const reset = o.chip === 'reset'
  const top = o.clubLevel >= 9
  const nextLevel = club.level(Math.min(9, o.clubLevel + 1))
  const minimum = Number(o.minimum ?? '0')
  const holdings = Number(o.holdings ?? '0')
  const above = reset || minimum === 0 || holdings >= minimum
  let seasonTitle = t('club.levelUp.seasonTitle', { level: nextLevel })
  let seasonBody = t('club.levelUp.seasonBody')
  let seasonTone = 'text-text'
  if (top) {
    seasonTitle = t('club.levelUp.seasonTop')
    seasonBody = t('club.levelUp.seasonTopBody')
  } else if (reset) {
    seasonBody = t('club.levelUp.seasonResetBody')
  } else if (suspended) {
    seasonTitle = t('club.levelUp.seasonHold', { level: nextLevel })
    seasonBody = t('club.levelUp.seasonHoldBody', { date: club.date(o.stateUntil, true) })
    seasonTone = 'text-tone-warn-fg'
  } else if (o.claimedThisSeason && above) {
    seasonTitle = t('club.levelUp.seasonQualified', { level: nextLevel })
    seasonBody = t('club.levelUp.seasonQualifiedBody')
    seasonTone = 'text-tone-success-fg'
  }
  const offer = club.upgradeOffer
  const block = club.upgradeBlock
  const fee = offer?.fee
  const feeText = typeof fee === 'number' ? club.amount(fee, 0) : '—'
  const levels = club.levels?.levels ?? []
  const aboveText =
    reset || minimum === 0
      ? t('club.levelUp.noMinimum')
      : above
        ? o.ratio !== undefined && o.ratio > 1000
          ? t('club.levelUp.yesRatioOver')
          : t('club.levelUp.yesRatio', { ratio: club.amount(o.ratio, 0) })
        : t('club.levelUp.short', { short: club.whole(o.short) })
  const checks = [
    {
      text: t('club.levelUp.checkClaim'),
      done: o.claimedThisSeason,
      status: t(o.claimedThisSeason ? 'club.levelUp.done' : 'club.levelUp.notYet'),
    },
    { text: t('club.levelUp.checkAbove'), done: above, status: aboveText },
  ]
  const thTight = tableTh.replace('py-2.5', 'py-2')
  return (
    <section aria-labelledby='club-level-up' className='flex min-w-0 flex-col gap-4'>
      <h2 id='club-level-up' className='font-body text-title flex items-center gap-2.5 leading-normal font-semibold'>
        <ChevronsIcon size={22} className='text-text-muted' />
        {t('club.levelUp.title')}
      </h2>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <Eyebrow icon={CalendarIcon}>{t('club.levelUp.seasonLabel')}</Eyebrow>
          <h3 className={'font-body text-title-sm leading-normal font-semibold ' + seasonTone}>{seasonTitle}</h3>
          {!top && (
            <ul className='text-body flex flex-col gap-2.5 leading-normal'>
              {checks.map((check, i) => (
                <li key={i} className='flex min-w-0 items-start gap-2.5'>
                  {check.done ? (
                    <CheckMark done className='text-tone-success-fg' />
                  ) : (
                    <CheckMark done={false} className='text-text-faint' />
                  )}
                  <span className='min-w-0'>
                    {check.text}{' '}
                    <span className={check.done ? 'text-tone-success-fg' : 'text-tone-warn-fg'}>· {check.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className={footnote}>{seasonBody}</p>
        </Card>
        <Card>
          <Eyebrow icon={ChevronsIcon}>{t('club.levelUp.instantLabel')}</Eyebrow>
          <h3 className='font-body text-title-sm leading-normal font-semibold'>
            {top ? t('club.levelUp.topTitle') : t('club.levelUp.instantTitle', { level: nextLevel })}
          </h3>
          {!top && (
            <div className='flex flex-col gap-2'>
              <Row label={t('club.levelUp.boost')} value={`${club.boost(o.boost)} → ${club.boost(o.nextBoost)}`} />
              <Row label={t('club.levelUp.fee')} value={t('club.levelUp.feeValue', { fee: feeText })} strong />
              <Row
                label={t('club.levelUp.perRound')}
                value={`~${club.amount2(o.estimateNow)} → ~${club.amount2(o.estimateNext)} HPO`}
              />
            </div>
          )}
          <p className={footnote}>
            {top
              ? t('club.levelUp.topBody')
              : suspended
                ? t('club.levelUp.noteSuspended')
                : t('club.levelUp.note', { level: club.level(Math.min(9, o.clubLevel + 2)) })}
          </p>
          {!top && (
            <Button className='mt-auto' disabled={block !== undefined} onClick={() => void club.openUpgrade()}>
              {block === undefined
                ? t('club.levelUp.button', { level: nextLevel, fee: feeText })
                : t(block.key, block.params)}
            </Button>
          )}
        </Card>
      </div>
      {levels.length > 0 && (
        <details className='border-border bg-surface rounded-card min-w-0 border px-5 py-[18px] sm:px-6'>
          <summary className='text-body cursor-pointer leading-normal font-semibold'>{t('club.levelUp.table')}</summary>
          <div className='mt-3 overflow-x-auto'>
            <table className='w-full min-w-[280px] border-collapse'>
              <thead>
                <tr>
                  <th className={thTight}>{t('club.levelUp.colLevel')}</th>
                  <th className={thTight}>{t('club.levelUp.colBoost')}</th>
                  <th className={thTight}>{t('club.levelUp.colFee')}</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level, i) => (
                  <tr key={i} className={tableRow + (i === o.clubLevel ? ' ' + rowSelf : '')}>
                    <td className={tableTdTight + ' num'}>
                      {club.level(i)}
                      {i === o.clubLevel
                        ? ' · ' + t('club.levelUp.you')
                        : i === o.clubLevel + 1
                          ? ' · ' + t('club.levelUp.next')
                          : ''}
                    </td>
                    <td className={tableTdTight + ' num'}>{club.boost(level.coefficient)}</td>
                    <td className={tableTdTight + ' num'}>
                      {typeof level.fee === 'number' && level.fee > 0
                        ? t('club.common.gramAmount', { amount: club.amount(level.fee, 0) })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  )
})

// The Level up checklist mark, drawn as the wireframe draws it: a circle of radius 9 with its tick at
// stroke 2 (the owner chose the wireframe's tick over the earlier bold one), or the empty circle.
function CheckMark({ done, className }: { done: boolean; className: string }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={'shrink-0 ' + className}
      aria-hidden='true'
    >
      <circle cx='12' cy='12' r='9' />
      {done && <path d='m8 12 3 3 5-6' />}
    </svg>
  )
}

function nano(value: string | undefined): number {
  const n = Number(value ?? '0')
  return Number.isFinite(n) ? n / 1e9 : 0
}

function dec(value: string | undefined): number {
  const n = Number(value ?? '0')
  return Number.isFinite(n) ? n : 0
}

export const Balances = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  const split = o?.split
  if (club.session === undefined || o === undefined || o.clubWallet === undefined) {
    return null
  }
  // The wallet's own balances are decimal; the pool fields are nano (2b ClubWalletSplit).
  // The DEX alone ("DeDust pool"): each field sums every allowlisted pool of that DEX (club-server
  // lpjobs.go), so naming one pair, as the wireframe's sample does, would be wrong.
  const htonPools = split
    ? [
        ['DeDust', nano(split.balanceHtonDedust)],
        ['STON.fi', nano(split.balanceHtonStonfi)],
        ['TONCO', nano(split.balanceHtonTonco)],
      ]
    : []
  const hpoPools = split
    ? [
        ['DeDust', nano(split.balanceHpoDedust)],
        ['STON.fi', nano(split.balanceHpoStonfi)],
        ['TONCO', nano(split.balanceHpoTonco)],
      ]
    : []
  const htonWallet = dec(split?.balanceHton)
  const hpoWallet = dec(split?.balanceHpo)
  const htonTotal = htonWallet + htonPools.reduce((sum, [, v]) => sum + (v as number), 0)
  const hpoTotal = hpoWallet + hpoPools.reduce((sum, [, v]) => sum + (v as number), 0)
  const updated = split?.balancesAt !== undefined ? club.duration(club.displayNow - split.balancesAt) : undefined
  const note = (
    <p className='text-text-faint text-label leading-normal'>
      {nodes(t('club.balances.note'), {
        link: (
          <a className='text-accent hover:underline' href={club.model.localizedPath(POOL_HELP)}>
            {t('club.common.learnMore')}
          </a>
        ),
      })}
    </p>
  )
  const group = (title: string, total: number, wallet: number, pools: (string | number)[][], footer?: ReactNode) => (
    <div className='flex min-w-0 flex-col gap-2.5'>
      <Row label={<span className='text-text font-semibold'>{title}</span>} value={club.amount2(total)} strong />
      <Row
        label={<span className='text-text-secondary'>{t('club.balances.inWallet')}</span>}
        value={<span className='text-text-secondary'>{club.amount2(wallet)}</span>}
      />
      {pools
        .filter(([, v]) => (v as number) > 0)
        .map(([name, v]) => (
          <Row
            key={name as string}
            label={<span className='text-text-secondary'>{t('club.balances.inPool', { dex: name as string })}</span>}
            value={<span className='text-text-secondary'>{club.amount2(v as number)}</span>}
          />
        ))}
      {footer}
    </div>
  )
  return (
    <Card className='gap-5'>
      <div className='flex min-w-0 flex-wrap items-center justify-between gap-4'>
        <div className='flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5'>
          <h2 className='font-body text-title-sm flex items-center gap-2.5 leading-normal font-semibold'>
            <BalancesIcon size={20} className='text-text-muted' />
            {t('club.balances.title')}
          </h2>
          <p className='text-text-faint text-label leading-normal'>
            {t(updated !== undefined ? 'club.balances.subtitle' : 'club.balances.subtitleNoTime', {
              wallet: club.clubWalletMasked,
              ago: updated ?? '',
            })}
          </p>
        </div>
        {/* The wireframe's outlined button (border-control, radius 14, 10px 18px, 44px tall). */}
        <button
          type='button'
          className='border-border-control text-text hover:text-accent disabled:text-text-faint rounded-control text-body disabled:hover:text-text-faint min-h-11 cursor-pointer border px-[18px] py-2.5 leading-normal disabled:cursor-not-allowed'
          onClick={() => !club.needTelegram('changeWallet') && club.openModal({ kind: 'changeWallet' })}
          disabled={o.frozen}
        >
          {t('club.balances.changeWallet')}
        </button>
      </div>
      {split === undefined ? (
        <p className='text-text-muted text-sm'>{t('club.balances.none')}</p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2'>
          {group(t('club.balances.hton'), htonTotal, htonWallet, htonPools)}
          {group(t('club.balances.hpo'), hpoTotal, hpoWallet, hpoPools, note)}
        </div>
      )}
    </Card>
  )
})

// The teaser cards are links as a whole (wireframe); a plain click navigates in-app, a modified
// click (new tab) is left to the browser.
const teaserLook =
  'flex min-w-0 flex-col gap-1.5 rounded-card border px-6 py-5 text-text no-underline transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const teaserTitle = 'font-body text-lg leading-normal font-semibold'

export const Teasers = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  const r = club.revenueBalance
  const link = (tab: ClubTab) => ({
    href: club.model.localizedPath('/club/' + (tab === 'overview' ? '' : tab + '/')),
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      e.preventDefault()
      club.model.navigateToClubTab(tab)
    },
  })
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <a {...link('friends')} className={teaserLook + ' border-border bg-surface'}>
        <Eyebrow icon={FriendsIcon}>{t('club.tabs.friends')}</Eyebrow>
        <span className={teaserTitle}>
          {club.session === undefined || o === undefined
            ? t('club.teaser.friendsLink')
            : t('club.teaser.friendsTitle', {
                count: club.amount(o.friends.count ?? 0, 0),
                total: club.amount2(o.friends.referralTotal),
              })}
        </span>
        <span className='text-text-muted text-sm leading-normal'>
          {t(club.session === undefined ? 'club.teaser.friendsLinkBody' : 'club.teaser.friendsBody')}
        </span>
      </a>
      <a {...link('community')} className={teaserLook + ' border-border bg-surface'}>
        <Eyebrow icon={CommunityIcon}>{t('club.tabs.community')}</Eyebrow>
        <span className={teaserTitle}>{t('club.teaser.communityTitle')}</span>
        <span className='text-text-muted text-sm leading-normal'>{t('club.teaser.communityBody')}</span>
      </a>
      <a {...link('rewards')} className={teaserLook + ' border-border-strong border-dashed bg-transparent'}>
        <span className='text-text-faint text-label inline-flex min-w-0 items-center gap-2 tracking-[0.06em] uppercase'>
          <PauseIcon size={16} />
          {t('club.revenue.title')}
        </span>
        <span className='text-base font-normal'>
          {r !== undefined && r > 0
            ? t('club.teaser.revenueTitle', { amount: club.amount2(r) })
            : t('club.teaser.revenueNone')}
        </span>
        <span className='text-text-faint text-sm leading-normal'>
          {t('club.teaser.revenueBody', { min: club.amount(REVENUE_MIN, 0) })}
        </span>
      </a>
    </div>
  )
})

const Overview = observer(({ club }: Props) => {
  const view = club.view
  if (view === 'loading') {
    return (
      <div className='flex flex-col gap-4' aria-busy='true'>
        <Skeleton className='h-24' />
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-60' />
          <Skeleton className='h-60' />
        </div>
        <Skeleton className='h-72' />
      </div>
    )
  }
  const bare = view === 'error' || view === 'launching' || view === 'connect'
  return (
    <div className='flex flex-col gap-6'>
      <StatusStrip club={club} />
      {!bare && (
        <>
          <div className='grid gap-4 md:grid-cols-2'>
            <LevelCard club={club} />
            <ClaimCard club={club} />
          </div>
          <YourHpo club={club} />
          <LevelUp club={club} />
          {club.session !== undefined && club.overview !== undefined && <Leaderboard club={club} />}
          <Balances club={club} />
          <Teasers club={club} />
        </>
      )}
    </div>
  )
})

export default Overview
