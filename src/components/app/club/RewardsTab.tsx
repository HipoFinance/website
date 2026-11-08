// The Club's Rewards tab (specs/club-website.md §9; wireframe Rewards.dc.html, 2b clubrewards): boosted
// HPO ready to claim with its split by stream, per-round history (staking and referral rows, with
// filters), past claims; base GRAM rewards; and revenue sharing (§8), collapsed at the bottom.
import { useEffect, useState, type ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import type { ClubModel } from './ClubModel.ts'
import { REVENUE_FEE } from './ClubModel.ts'
import { BoltIcon } from './icons.tsx'
import {
  Button,
  Card,
  CardTitle,
  ErrorLine,
  Eyebrow,
  figure,
  footnote,
  inset,
  Pill,
  Pills,
  Row,
  Skeleton,
  tableRow,
  tableTd,
  tableTh,
} from './ui.tsx'

interface Props {
  club: ClubModel
}

type Stream = 'all' | 'staking' | 'referral'

const TONVIEWER = 'https://tonviewer.com/transaction/'
// R1: a section is a heading row (coloured dot, display heading, outlined tag) followed by sibling
// cards, not one card with boxes nested inside.
function SectionHeading({ dot, title, tag }: { dot: string; title: ReactNode; tag: ReactNode }) {
  return (
    <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2'>
      <span className={'size-7 shrink-0 rounded-full ' + dot} aria-hidden='true'></span>
      <h2 className='font-display text-section min-w-0 leading-normal font-extrabold'>{title}</h2>
      <span className='border-border-control text-text-secondary text-label rounded-full border px-2.5 py-[3px] leading-normal font-semibold'>
        {tag}
      </span>
    </div>
  )
}

const statGrid = 'grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]'
const statValue = 'font-display num text-stat leading-tight font-extrabold wrap-anywhere'
const thEnd = tableTh.replace('text-start', 'text-end')

function StatCard({
  label,
  value,
  valueClass = statValue,
  children,
}: {
  label: ReactNode
  value: ReactNode
  valueClass?: string
  children?: ReactNode
}) {
  return (
    <Card className='sm:px-6 sm:py-5'>
      <div className='flex min-w-0 flex-col gap-1'>
        <p className='text-text-muted text-sm'>{label}</p>
        <p className={valueClass}>{value}</p>
      </div>
      {children}
    </Card>
  )
}

const Boosted = observer(({ club }: Props) => {
  const t = club.t
  const [filter, setFilter] = useState<Stream>('all')
  const r = club.rewards
  const o = club.overview
  const heading = (
    <SectionHeading dot='bg-club-boosted' title={t('club.rewards.boostedTitle')} tag={t('club.rewards.boostedSub')} />
  )
  if (club.session === undefined) {
    return (
      <div className='flex flex-col gap-6'>
        {heading}
        <Card>
          <p className='text-text-muted text-body leading-normal'>{t('club.rewards.needsTelegram')}</p>
          {!club.tma && (
            <Button kind='primary' className='self-start' onClick={() => club.openModal({ kind: 'linkTelegram' })}>
              {t('club.common.linkTelegram')}
            </Button>
          )}
        </Card>
      </div>
    )
  }
  if (r === undefined) {
    return (
      <div className='flex flex-col gap-6'>
        {heading}
        <Skeleton className='h-72' />
      </div>
    )
  }
  const streams = r.unclaimedByStream
  const rows = [
    ...r.rounds.map((round) => ({ time: round.time, stream: 'staking' as const, hpo: round.hpo })),
    ...r.referralRounds.map((round) => ({ time: round.time, stream: 'referral' as const, hpo: round.hpo })),
  ]
    .filter((row) => filter === 'all' || row.stream === filter)
    .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
  const block = club.claimBlock
  return (
    <div className='flex flex-col gap-6'>
      {heading}
      <Card className='sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6'>
        <div className='flex min-w-0 flex-col gap-1'>
          <Eyebrow icon={BoltIcon}>{t('club.rewards.ready')}</Eyebrow>
          <p className={figure}>{t('club.common.hpoAmount', { amount: club.amount2(r.unclaimed) })}</p>
          {streams !== undefined && (
            <p className='text-text-faint text-sm leading-normal'>
              {t(club.clubWallet === undefined ? 'club.rewards.readySplitNoWallet' : 'club.rewards.readySplit', {
                // The community part shows once there is one (Rewards.dc.html shows staking + referral).
                split: t(Number(streams.community ?? '0') > 0 ? 'club.claim.splitCommunity' : 'club.claim.split', {
                  staking: club.amount2(streams.staking),
                  referral: club.amount2(streams.referral),
                  community: club.amount2(streams.community),
                }),
                wallet: club.clubWalletMasked,
              })}
            </p>
          )}
        </div>
        <Button
          kind='primary'
          className='self-start sm:self-center'
          disabled={block !== undefined}
          onClick={() => void club.openClaim()}
        >
          {block === undefined
            ? t('club.claim.button', { amount: club.amount2(r.unclaimed) })
            : t(block.key, block.params)}
        </Button>
      </Card>
      <div className={statGrid}>
        <StatCard
          label={t('club.rewards.perRound')}
          value={t('club.claim.perRoundValue', {
            amount: club.amount2(o?.estimateNow),
            boost: club.boost(o?.state === 'suspended' ? 1 : o?.boost),
          })}
        />
        {/* The value is a sentence (two streams), so it takes a smaller size than a single figure. */}
        <StatCard
          label={t('club.rewards.lifetime')}
          valueClass='font-display num text-xl leading-snug font-extrabold wrap-anywhere'
          value={t('club.rewards.lifetimeValue', {
            staking: club.amount2(r.totals.staking),
            referral: club.amount2(r.totals.referral),
          })}
        />
      </div>

      <Card>
        <CardTitle
          aside={
            <Pills label={t('club.rewards.colStream')}>
              {(['all', 'staking', 'referral'] as const).map((value) => (
                <Pill key={value} active={filter === value} onClick={() => setFilter(value)}>
                  {t('club.rewards.filter.' + value)}
                </Pill>
              ))}
            </Pills>
          }
        >
          {t('club.rewards.historyTitle')}
        </CardTitle>
        {rows.length === 0 ? (
          <p className='text-text-muted text-body leading-normal'>{t('club.rewards.historyEmpty')}</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[300px]'>
              <thead>
                <tr>
                  <th className={tableTh}>{t('club.rewards.colRound')}</th>
                  <th className={tableTh}>{t('club.rewards.colStream')}</th>
                  <th className={thEnd}>HPO</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={tableRow}>
                    <td className={tableTd + ' num'}>{club.date(row.time)}</td>
                    <td className={tableTd}>
                      {t(row.stream === 'staking' ? 'club.rewards.streamStaking' : 'club.rewards.streamReferral')}
                    </td>
                    <td className={tableTd + ' num text-tone-success-fg text-end'}>{club.signed(row.hpo, 2, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {r.referralBeforeLaunch !== undefined && (
          <Row
            label={t('club.rewards.referralBefore')}
            value={t('club.common.hpoAmount', { amount: club.amount2(r.referralBeforeLaunch) })}
          />
        )}
      </Card>

      <Card className='gap-3'>
        <CardTitle>{t('club.rewards.claimsTitle')}</CardTitle>
        {r.claims.length === 0 ? (
          <p className='text-text-muted text-body leading-normal'>{t('club.rewards.claimsEmpty')}</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[360px]'>
              <thead>
                <tr>
                  <th className={tableTh}>{t('club.rewards.colDate')}</th>
                  <th className={tableTh}>{t('club.rewards.colWallet')}</th>
                  <th className={thEnd}>{t('club.rewards.colClaimed')}</th>
                  <th className={thEnd}>
                    <span className='sr-only'>{t('club.rewards.tx')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.claims.map((claim, i) => (
                  <tr key={i} className={tableRow}>
                    <td className={tableTd + ' num'}>{club.date(claim.claimTime || claim.requestTime)}</td>
                    <td className={tableTd + ' num'}>{club.mask(claim.wallet)}</td>
                    <td className={tableTd + ' num text-end'}>{club.amount2(claim.amount)}</td>
                    <td className={tableTd + ' text-end'}>
                      {claim.txHash !== undefined && (
                        <a
                          className='text-accent hover:underline'
                          href={TONVIEWER + claim.txHash}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {t('club.rewards.tx')}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className={footnote}>{t('club.rewards.claimsNote')}</p>
      </Card>
    </div>
  )
})

const BaseGram = observer(({ club }: Props) => {
  const t = club.t
  const r = club.rewards
  const w = club.walletRewards
  const rounds =
    r !== undefined
      ? r.rounds.map((round) => ({ time: round.time, gram: Number(round.stakeReward ?? '0') }))
      : (w?.earnedRewards ?? []).map((round) => ({ time: round.time, gram: round.stakeReward ?? 0 }))
  const sum = r?.stakeSumRewards ?? w?.stakeSumRewards
  const since = r?.stakeRewardsSince ?? w?.stakeRewardsSince
  const m = club.model
  const split = club.overview?.split
  const state = m.treasuryState
  const poolNano = split
    ? [split.balanceHtonDedust, split.balanceHtonStonfi, split.balanceHtonTonco].reduce((acc, v) => {
        const n = Number(v ?? '0')
        return acc + (Number.isFinite(n) ? n : 0)
      }, 0)
    : 0
  const rate = state != null ? Number(state.totalCoins) / Number(state.totalTokens) || 1 : 1
  // tonBalance is set with walletState once the connected wallet is read; before that htonBalance reads 0
  // and the total would count the pools alone.
  const showPools = club.clubWalletConnected && poolNano > 0 && state != null && m.tonBalance != null
  const gramOf = (nanoValue: number) => m.withUnit('app.model.approxGram', m.formatNano(nanoValue * rate))
  const hasStats = m.htonBalanceInTon != null || sum !== undefined
  return (
    <div className='border-border mt-6 flex flex-col gap-6 border-t pt-8'>
      <SectionHeading dot='bg-club-base' title={t('club.rewards.baseTitle')} tag={t('club.rewards.baseSub')} />
      <p className='text-text-muted text-body -mt-2 leading-normal'>{t('club.rewards.baseBody')}</p>
      {hasStats && (
        <div className={statGrid}>
          {m.htonBalanceInTon != null && (
            <StatCard label={m.t('app.reward.stakedBalance')} value={m.htonBalanceFormatted}>
              <div className='border-border flex flex-col gap-2 border-t pt-3.5'>
                <Row label={m.t('app.reward.valueInGram')} value={m.htonBalanceInTon} strong={!showPools} />
                {showPools && (
                  <>
                    <Row label={t('club.rewards.inPoolsGram')} value={gramOf(poolNano)} />
                    <Row label={t('club.rewards.totalGram')} value={gramOf(Number(m.htonBalance) + poolNano)} strong />
                  </>
                )}
              </div>
            </StatCard>
          )}
          {sum !== undefined && (
            <StatCard
              label={
                since !== undefined
                  ? t('club.rewards.earnedSince', { date: club.date(since) })
                  : t('club.rewards.earnedTotal')
              }
              value={t('club.common.gramAmount', { amount: club.amount2(sum) })}
            />
          )}
        </div>
      )}
      <Card>
        <CardTitle>{t('club.rewards.gramTitle')}</CardTitle>
        {rounds.length === 0 ? (
          <p className='text-text-muted text-body leading-normal'>
            {t(club.connected === undefined ? 'club.rewards.baseConnect' : 'club.rewards.historyEmpty')}
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[260px]'>
              <thead>
                <tr>
                  <th className={tableTh}>{t('club.rewards.colRound')}</th>
                  <th className={thEnd}>GRAM</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((row, i) => (
                  <tr key={i} className={tableRow}>
                    <td className={tableTd + ' num'}>{club.date(row.time)}</td>
                    <td className={tableTd + ' num text-tone-success-fg text-end'}>{club.signed(row.gram, 4, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className={inset + ' flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <p className='text-body font-bold'>{t('club.rewards.stakeMoreTitle')}</p>
            <p className='text-text-muted text-sm leading-normal'>{t('club.rewards.stakeMoreBody')}</p>
          </div>
          <Button
            kind='primary'
            size='sm'
            className='self-start sm:self-center'
            onClick={() => club.model.navigateToTab('stake')}
          >
            {t('club.rewards.stakeMore')}
          </Button>
        </div>
      </Card>
    </div>
  )
})

export const Revenue = observer(({ club }: Props) => {
  const t = club.t
  const r = club.revenueBalance
  const block = club.withdrawBlock
  const history = club.walletRewards?.hpoWithdrawals ?? []
  return (
    <details className='border-border-strong rounded-card border border-dashed bg-transparent px-5 py-5 sm:px-6'>
      <summary className='font-body text-lead cursor-pointer leading-normal font-semibold'>
        {t('club.revenue.title')}
      </summary>
      <div className='mt-3.5 flex flex-col gap-3.5'>
        <p className='text-text-secondary text-body leading-normal'>{t('club.revenue.body')}</p>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-text-muted text-sm'>{t('club.revenue.withdrawable')}</span>
            <span className='num text-xl font-semibold wrap-anywhere'>
              {t('club.common.gramAmount', { amount: club.amount2(r) })}
            </span>
          </div>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-text-muted text-sm'>{t('club.revenue.fee')}</span>
            <span className='num'>{t('club.revenue.feeValue', { fee: club.amount(REVENUE_FEE, 1) })}</span>
          </div>
          {r !== undefined && r > REVENUE_FEE && (
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='text-text-muted text-sm'>{t('club.revenue.paidAs')}</span>
              <span className='leading-normal'>
                {t('club.revenue.paidAsValue', { amount: club.amount2(r - REVENUE_FEE) })}
              </span>
            </div>
          )}
        </div>
        <p className='text-text-faint text-sm leading-normal'>{t('club.revenue.rules')}</p>
        {history.length > 0 && (
          <p className='text-text-faint text-sm leading-normal'>
            {t('club.revenue.past', {
              list: history
                .slice(0, 3)
                .map(
                  (h) =>
                    `${club.date(h.requestTime)} · ${t('club.common.gramAmount', { amount: club.amount2(h.sent) })}`,
                )
                .join(', '),
            })}
          </p>
        )}
        <Button
          kind='secondary'
          size='sm'
          className='self-start'
          disabled={block !== undefined}
          busy={club.withdrawing}
          onClick={() => void club.withdraw()}
        >
          {block === undefined ? t('club.revenue.button', { amount: club.amount2(r) }) : t(block.key)}
        </Button>
        {club.withdrawResult === 'done' && <p className='text-tone-success-fg text-sm'>{t('club.revenue.done')}</p>}
        {club.withdrawResult === 'failed' && <ErrorLine>{t('club.revenue.failed')}</ErrorLine>}
      </div>
    </details>
  )
})

const RewardsTab = observer(({ club }: Props) => {
  useEffect(() => {
    void club.loadRewards()
  }, [club, club.session])
  return (
    <div className='flex flex-col gap-6'>
      <Boosted club={club} />
      <BaseGram club={club} />
      <Revenue club={club} />
    </div>
  )
})

export default RewardsTab
