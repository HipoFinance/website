// The Club's Overview tab (specs/club-website.md §5; SPEC §4, wireframe Main.dc.html): the status
// strip, the grace/restore panel, the level and claim cards, Your HPO, Level up, the leaderboard,
// balances and the teasers. Every figure comes from the server; none is written here.
import { observer } from 'mobx-react-lite'
import { nodes, Num } from '../Interpolate'
import type { ClubModel } from './ClubModel.ts'
import { CLAIM_MIN_NANO } from './clubTx.ts'
import Leaderboard from './Leaderboard.tsx'
import StatusStrip from './StatusStrip.tsx'
import { Button, Card, CardTitle, Chip, Row, Skeleton } from './ui.tsx'
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
                : 'bg-surface-deep')
          }
        ></div>
      )
    })}
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
          <CardTitle>{t('club.level.title')}</CardTitle>
          <p className='text-text-muted text-[15px] leading-relaxed'>{t('club.level.notClubWallet')}</p>
        </Card>
      )
    }
    const status = a.status === 'at_risk' ? 'at_risk' : a.status === 'suspended' ? 'suspended' : 'active'
    return (
      <Card>
        <CardTitle
          aside={<Chip tone={chipTone[status]}>{t('club.chip.' + (status === 'at_risk' ? 'atRisk' : status))}</Chip>}
        >
          {t('club.level.title')}
        </CardTitle>
        <div className='flex flex-wrap items-baseline gap-x-3'>
          <span className='font-fredoka text-4xl font-semibold'>
            {t('club.common.levelN', { level: club.level(a.clubLevel) })}
          </span>
          <span className='text-text-muted'>{t('club.level.boost', { boost: club.boost(a.boost) })}</span>
        </div>
        <LevelLadder level={a.clubLevel ?? 0} suspended={status === 'suspended'} nextDashed={false} />
        <p className='text-text-muted text-sm leading-relaxed'>{t('club.level.walletOnly')}</p>
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
      <CardTitle aside={<Chip tone={chipTone[chip]}>{chipLabel}</Chip>}>{t('club.level.title')}</CardTitle>
      <div className='flex flex-wrap items-baseline gap-x-3'>
        <span className='font-fredoka text-4xl font-semibold'>
          {t('club.common.levelN', { level: club.level(o.clubLevel) })}
        </span>
        <span className='text-text-muted'>
          {suspended ? t('club.level.suspendedBoost') : t('club.level.boost', { boost: club.boost(o.boost) })}
        </span>
      </div>
      <LevelLadder level={o.clubLevel} suspended={suspended} nextDashed={o.claimedThisSeason && o.state === 'ok'} />
      <div className='text-text-faint flex justify-between text-xs'>
        <Num>{t('club.level.ladderLow')}</Num>
        <Num>{t('club.level.ladderHigh')}</Num>
      </div>
      <p className='text-text-muted text-sm leading-relaxed'>{line}</p>
    </Card>
  )
})

export const ClaimCard = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  if (club.session === undefined) {
    return (
      <Card>
        <CardTitle>{t('club.claim.title')}</CardTitle>
        <p className='text-text-muted text-[15px] leading-relaxed'>{t('club.claim.walletOnly')}</p>
        <Button kind='primary' onClick={() => club.openModal({ kind: 'linkTelegram', after: 'claim' })}>
          {t('club.common.linkTelegram')}
        </Button>
        <p className='text-text-faint text-xs'>{t('club.claim.terms')}</p>
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
        aside={
          <button
            type='button'
            className='text-accent cursor-pointer text-sm hover:underline'
            onClick={() => club.model.navigateToClubTab('rewards')}
          >
            {t('club.claim.history')}
          </button>
        }
      >
        {t('club.claim.title')}
      </CardTitle>
      <div className='flex flex-wrap items-baseline gap-x-2'>
        <span className='font-fredoka num text-4xl font-semibold'>{club.amount2(o.unclaimed)}</span>
        <span className='text-text-muted'>HPO</span>
      </div>
      {inProgress !== undefined ? (
        <p className='text-tone-success-fg text-sm leading-relaxed'>
          {t('club.claim.inProgress', {
            amount: club.amount2(inProgress.amount),
            wallet: club.mask(inProgress.wallet ?? club.clubWallet),
          })}
        </p>
      ) : (
        below && (
          <div className='flex flex-col gap-1.5'>
            <div className='bg-surface-deep h-2 overflow-hidden rounded-full' aria-hidden='true'>
              <div className='bg-text-faint h-full' style={{ width: percent + '%' }}></div>
            </div>
            <p className='text-text-muted text-sm'>
              {rounds !== undefined
                ? t('club.claim.toMinRounds', { left: club.amount2(left), rounds: club.amount(rounds, 0) })
                : t('club.claim.toMin', { left: club.amount2(left) })}
            </p>
          </div>
        )
      )}
      <div className='flex flex-col gap-1.5'>
        <Row
          label={t('club.claim.perRound')}
          value={t('club.claim.perRoundValue', {
            amount: club.amount(o.estimateNow, 0),
            boost: club.boost(o.state === 'suspended' ? 1 : o.boost),
          })}
        />
        <Row
          label={t('club.claim.claimedSeason')}
          value={o.claimedThisSeason ? t('club.claim.claimedYes') : t('club.claim.claimedNo')}
        />
      </div>
      <Button kind='primary' disabled={block !== undefined} onClick={() => void club.openClaim()}>
        {block === undefined
          ? t('club.claim.button', { amount: club.amount2(o.unclaimed) })
          : t(block.key, block.params)}
      </Button>
      <p className='text-text-faint text-xs'>{t('club.claim.terms')}</p>
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
        aside={
          <Chip tone={reset ? 'neutral' : below ? 'warn' : 'success'}>
            {t(reset ? 'club.hpo.chipNone' : below ? 'club.hpo.chipBelow' : 'club.hpo.chipAbove')}
          </Chip>
        }
      >
        {t('club.hpo.title')}
      </CardTitle>
      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <div className='flex flex-wrap items-baseline gap-x-2'>
          <span className='font-fredoka num text-3xl font-semibold'>{club.whole(o.holdings)}</span>
          <span className='text-text-muted'>HPO</span>
        </div>
        {rank.listed && rank.rank !== undefined && (
          <p className='text-text-muted text-sm'>
            {t(rank.band ? 'club.hpo.rankBand' : 'club.hpo.rank', {
              level: club.level(rank.clubLevel),
              rank: club.amount(rank.rank, 0),
              band: club.amount(rank.band, 0),
            })}
          </p>
        )}
      </div>
      {rank.listed && rank.growth !== undefined && (
        <p className={'text-sm ' + (rank.growth >= 0 ? 'text-tone-success-fg' : 'text-tone-warn-fg')}>
          {t('club.hpo.growth', { growth: (rank.growth >= 0 ? '+' : '−') + club.amount(Math.abs(rank.growth), 1) })}
        </p>
      )}
      {!reset && (
        <div className='flex flex-col gap-2'>
          <div className='bg-surface-deep relative h-3 rounded-full' aria-hidden='true'>
            <div
              className={
                'absolute inset-y-0 start-0 rounded-full ' + (below ? 'bg-tone-warn-fg' : 'bg-tone-success-fg')
              }
              style={{ width: ((holdings / scale) * 100).toFixed(1) + '%' }}
            ></div>
            <div
              className='bg-text absolute -top-1.5 -bottom-1.5 w-[3px] rounded'
              style={{ insetInlineStart: ((minimum / scale) * 100).toFixed(1) + '%' }}
            ></div>
          </div>
          <p className='text-text-faint text-xs'>{t('club.hpo.marker', { minimum: club.amount2(o.minimum) })}</p>
          {o.ratio !== undefined && (
            <p className='text-text-muted text-sm'>{t('club.hpo.ratio', { ratio: club.amount(o.ratio, 0) })}</p>
          )}
        </div>
      )}
      <p className='text-[15px] leading-relaxed'>{message}</p>
      {!below && rank.listed && rank.buy !== undefined && rank.buy.x !== '' && (
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-text-muted text-sm'>
            {t('club.hpo.nudge', {
              x: club.whole(rank.buy.x),
              rank: club.amount(rank.buy.rank, 0),
              level: club.level(rank.clubLevel),
            })}
          </p>
          <Button href={BUY_HPO_URL}>{t('club.common.buyHpo')}</Button>
        </div>
      )}
      <p className='text-text-faint text-xs leading-relaxed'>
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
      <div className='border-border flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm'>
        <span className={settings.alertsUnreachable ? 'text-tone-warn-fg' : 'text-text-muted'}>
          {t(
            settings.alertsUnreachable
              ? 'club.hpo.alertsUnreachable'
              : settings.alerts
                ? 'club.hpo.alertsOn'
                : 'club.hpo.alertsOff',
          )}
        </span>
        <button
          type='button'
          className='text-accent cursor-pointer hover:underline'
          onClick={() => void club.setSetting({ alerts: !settings.alerts })}
        >
          {t(settings.alerts ? 'club.hpo.alertsTurnOff' : 'club.hpo.alertsTurnOn')}
        </button>
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
  return (
    <Card>
      <CardTitle>{t('club.levelUp.title')}</CardTitle>
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='border-border flex min-w-0 flex-col gap-2 rounded-2xl border p-4'>
          <p className='text-text-faint text-xs font-semibold tracking-wide uppercase'>
            {t('club.levelUp.seasonLabel')}
          </p>
          <p className={'font-fredoka text-lg font-semibold ' + seasonTone}>{seasonTitle}</p>
          {!top && (
            <ul className='flex flex-col gap-1 text-sm'>
              <li className='flex justify-between gap-3'>
                <span className='min-w-0 flex-1'>{t('club.levelUp.checkClaim')}</span>
                <span
                  className={
                    'shrink-0 text-end ' + (o.claimedThisSeason ? 'text-tone-success-fg' : 'text-tone-warn-fg')
                  }
                >
                  {t(o.claimedThisSeason ? 'club.levelUp.done' : 'club.levelUp.notYet')}
                </span>
              </li>
              <li className='flex justify-between gap-3'>
                <span className='min-w-0 flex-1'>{t('club.levelUp.checkAbove')}</span>
                <span
                  className={'max-w-[60%] shrink-0 text-end ' + (above ? 'text-tone-success-fg' : 'text-tone-warn-fg')}
                >
                  {reset || minimum === 0
                    ? t('club.levelUp.noMinimum')
                    : above
                      ? t('club.levelUp.yesRatio', { ratio: club.amount(o.ratio, 0) })
                      : t('club.levelUp.short', { short: club.whole(o.short) })}
                </span>
              </li>
            </ul>
          )}
          <p className='text-text-muted text-sm leading-relaxed'>{seasonBody}</p>
        </div>
        <div className='border-border flex min-w-0 flex-col gap-2 rounded-2xl border p-4'>
          <p className='text-text-faint text-xs font-semibold tracking-wide uppercase'>
            {t('club.levelUp.instantLabel')}
          </p>
          <p className='font-fredoka text-lg font-semibold'>
            {top ? t('club.levelUp.topTitle') : t('club.levelUp.instantTitle', { level: nextLevel })}
          </p>
          {!top && (
            <div className='flex flex-col gap-1'>
              <Row label={t('club.levelUp.boost')} value={`${club.boost(o.boost)} → ${club.boost(o.nextBoost)}`} />
              <Row label={t('club.levelUp.fee')} value={t('club.levelUp.feeValue', { fee: feeText })} />
              <Row
                label={t('club.levelUp.perRound')}
                value={`~${club.amount(o.estimateNow, 0)} → ~${club.amount(o.estimateNext, 0)} HPO`}
              />
            </div>
          )}
          <p className='text-text-muted text-sm leading-relaxed'>
            {top
              ? t('club.levelUp.topBody')
              : suspended
                ? t('club.levelUp.noteSuspended')
                : t('club.levelUp.note', { level: club.level(Math.min(9, o.clubLevel + 2)) })}
          </p>
          {!top && (
            <Button disabled={block !== undefined} onClick={() => void club.openUpgrade()}>
              {block === undefined
                ? t('club.levelUp.button', { level: nextLevel, fee: feeText })
                : t(block.key, block.params)}
            </Button>
          )}
        </div>
      </div>
      {levels.length > 0 && (
        <details className='group'>
          <summary className='text-accent cursor-pointer text-sm'>{t('club.levelUp.table')}</summary>
          <div className='mt-3 overflow-x-auto'>
            <table className='w-full min-w-[280px] text-sm'>
              <thead className='text-text-faint text-start'>
                <tr>
                  <th className='py-1.5 text-start font-medium'>{t('club.levelUp.colLevel')}</th>
                  <th className='py-1.5 text-start font-medium'>{t('club.levelUp.colBoost')}</th>
                  <th className='py-1.5 text-end font-medium'>{t('club.levelUp.colFee')}</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level, i) => (
                  <tr
                    key={i}
                    className={'border-border border-t ' + (i === o.clubLevel ? 'text-accent font-semibold' : '')}
                  >
                    <td className='num py-1.5'>
                      {club.level(i)}
                      {i === o.clubLevel
                        ? ' · ' + t('club.levelUp.you')
                        : i === o.clubLevel + 1
                          ? ' · ' + t('club.levelUp.next')
                          : ''}
                    </td>
                    <td className='num py-1.5'>{club.boost(level.coefficient)}</td>
                    <td className='num py-1.5 text-end'>
                      {typeof level.fee === 'number' && level.fee > 0
                        ? t('club.levelUp.feeValue', { fee: club.amount(level.fee, 0) })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </Card>
  )
})

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
  const group = (title: string, total: number, wallet: number, pools: (string | number)[][]) => (
    <div className='border-border flex min-w-0 flex-col gap-1.5 rounded-2xl border p-4'>
      <Row label={<span className='text-text font-semibold'>{title}</span>} value={club.amount2(total)} strong />
      <Row label={t('club.balances.inWallet')} value={club.amount2(wallet)} />
      {pools
        .filter(([, v]) => (v as number) > 0)
        .map(([name, v]) => (
          <Row
            key={name as string}
            label={t('club.balances.inPool', { dex: name as string })}
            value={club.amount2(v as number)}
          />
        ))}
    </div>
  )
  return (
    <Card>
      <CardTitle
        aside={
          <Button
            onClick={() => !club.needTelegram('changeWallet') && club.openModal({ kind: 'changeWallet' })}
            disabled={o.frozen}
          >
            {t('club.balances.changeWallet')}
          </Button>
        }
      >
        {t('club.balances.title')}
      </CardTitle>
      <p className='text-text-muted text-sm'>
        {t(updated !== undefined ? 'club.balances.subtitle' : 'club.balances.subtitleNoTime', {
          wallet: club.clubWalletMasked,
          ago: updated ?? '',
        })}
      </p>
      {split === undefined ? (
        <p className='text-text-muted text-sm'>{t('club.balances.none')}</p>
      ) : (
        <div className='grid gap-3 md:grid-cols-2'>
          {group(t('club.balances.hton'), htonTotal, htonWallet, htonPools)}
          {group(t('club.balances.hpo'), hpoTotal, hpoWallet, hpoPools)}
        </div>
      )}
      <p className='text-text-faint text-xs'>
        {nodes(t('club.balances.note'), {
          link: (
            <a className='text-accent hover:underline' href={club.model.localizedPath(POOL_HELP)}>
              {t('club.common.learnMore')}
            </a>
          ),
        })}
      </p>
    </Card>
  )
})

export const Teasers = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  const r = club.revenueBalance
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <p className='text-text-faint text-xs font-semibold tracking-wide uppercase'>{t('club.tabs.friends')}</p>
        <p className='font-fredoka text-lg font-semibold'>
          {club.session === undefined || o === undefined
            ? t('club.teaser.friendsLink')
            : t('club.teaser.friendsTitle', {
                count: club.amount(o.friends.count ?? 0, 0),
                total: club.amount2(o.friends.referralTotal),
              })}
        </p>
        <p className='text-text-muted text-sm'>
          {t(club.session === undefined ? 'club.teaser.friendsLinkBody' : 'club.teaser.friendsBody')}
        </p>
        <Button kind='quiet' className='self-start' onClick={() => club.model.navigateToClubTab('friends')}>
          {t('club.teaser.open')}
        </Button>
      </Card>
      <Card>
        <p className='text-text-faint text-xs font-semibold tracking-wide uppercase'>{t('club.tabs.community')}</p>
        <p className='font-fredoka text-lg font-semibold'>{t('club.teaser.communityTitle')}</p>
        <p className='text-text-muted text-sm'>{t('club.teaser.communityBody')}</p>
        <Button kind='quiet' className='self-start' onClick={() => club.model.navigateToClubTab('community')}>
          {t('club.teaser.open')}
        </Button>
      </Card>
      <Card>
        <p className='text-text-faint text-xs font-semibold tracking-wide uppercase'>{t('club.revenue.title')}</p>
        <p className='font-fredoka text-lg font-semibold'>
          {r !== undefined && r > 0
            ? t('club.teaser.revenueTitle', { amount: club.amount2(r) })
            : t('club.teaser.revenueNone')}
        </p>
        <p className='text-text-muted text-sm'>{t('club.teaser.revenueBody', { min: club.amount(REVENUE_MIN, 0) })}</p>
        <Button kind='quiet' className='self-start' onClick={() => club.model.navigateToClubTab('rewards')}>
          {t('club.teaser.open')}
        </Button>
      </Card>
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
    <div className='flex flex-col gap-4'>
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
