// The Club's Rewards tab (specs/club-website.md §9; wireframe Rewards.dc.html, 2b clubrewards): boosted
// HPO ready to claim with its split by stream, per-round history (staking and referral rows, with
// filters), past claims; base GRAM rewards; and revenue sharing (§8), collapsed at the bottom.
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import type { ClubModel } from './ClubModel.ts'
import { REVENUE_FEE } from './ClubModel.ts'
import { Button, Card, CardTitle, ErrorLine, Row, Skeleton } from './ui.tsx'

interface Props {
  club: ClubModel
}

type Stream = 'all' | 'staking' | 'referral'

const TONVIEWER = 'https://tonviewer.com/transaction/'

const Boosted = observer(({ club }: Props) => {
  const t = club.t
  const [filter, setFilter] = useState<Stream>('all')
  const r = club.rewards
  const o = club.overview
  if (club.session === undefined) {
    return (
      <Card>
        <CardTitle>{t('club.rewards.boostedTitle')}</CardTitle>
        <p className='text-text-muted text-[15px]'>{t('club.rewards.needsTelegram')}</p>
        {!club.tma && (
          <Button kind='primary' className='self-start' onClick={() => club.openModal({ kind: 'linkTelegram' })}>
            {t('club.common.linkTelegram')}
          </Button>
        )}
      </Card>
    )
  }
  if (r === undefined) {
    return <Skeleton className='h-72' />
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
    <Card>
      <CardTitle aside={<span className='text-text-faint text-sm'>{t('club.rewards.boostedSub')}</span>}>
        {t('club.rewards.boostedTitle')}
      </CardTitle>
      <div className='border-border flex flex-col gap-2 rounded-2xl border p-4'>
        <p className='text-text-muted text-sm'>{t('club.rewards.ready')}</p>
        <p className='font-fredoka num text-3xl font-semibold'>
          {t('club.common.hpoAmount', { amount: club.amount2(r.unclaimed) })}
        </p>
        {streams !== undefined && (
          <p className='text-text-muted text-sm'>
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
        <Button
          kind='primary'
          className='self-start'
          disabled={block !== undefined}
          onClick={() => void club.openClaim()}
        >
          {block === undefined
            ? t('club.claim.button', { amount: club.amount2(r.unclaimed) })
            : t(block.key, block.params)}
        </Button>
      </div>
      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='border-border flex flex-col gap-1 rounded-2xl border p-4'>
          <p className='text-text-muted text-sm'>{t('club.rewards.perRound')}</p>
          <p className='font-semibold'>
            {t('club.claim.perRoundValue', {
              amount: club.amount(o?.estimateNow, 0),
              boost: club.boost(o?.state === 'suspended' ? 1 : o?.boost),
            })}
          </p>
        </div>
        <div className='border-border flex flex-col gap-1 rounded-2xl border p-4'>
          <p className='text-text-muted text-sm'>{t('club.rewards.lifetime')}</p>
          <p className='text-sm'>
            {t('club.rewards.lifetimeValue', {
              staking: club.amount2(r.totals.staking),
              referral: club.amount2(r.totals.referral),
            })}
          </p>
        </div>
      </div>

      <h3 className='font-fredoka mt-2 text-lg font-semibold'>{t('club.rewards.historyTitle')}</h3>
      <div className='flex flex-wrap gap-2' role='group'>
        {(['all', 'staking', 'referral'] as const).map((value) => (
          <button
            key={value}
            type='button'
            aria-pressed={filter === value}
            className={
              'min-h-9 cursor-pointer rounded-full border px-3 text-sm ' +
              (filter === value ? 'border-accent text-accent font-semibold' : 'border-border text-text-muted')
            }
            onClick={() => setFilter(value)}
          >
            {t('club.rewards.filter.' + value)}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className='text-text-muted text-sm'>{t('club.rewards.historyEmpty')}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[300px] text-sm'>
            <thead className='text-text-faint'>
              <tr>
                <th className='py-1.5 text-start font-medium'>{t('club.rewards.colRound')}</th>
                <th className='py-1.5 text-start font-medium'>{t('club.rewards.colStream')}</th>
                <th className='py-1.5 text-end font-medium'>HPO</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className='border-border border-t'>
                  <td className='num py-1.5'>{club.date(row.time)}</td>
                  <td className='py-1.5'>
                    {t(row.stream === 'staking' ? 'club.rewards.streamStaking' : 'club.rewards.streamReferral')}
                  </td>
                  <td className='num text-tone-success-fg py-1.5 text-end'>{club.signed(row.hpo, 2, true)}</td>
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

      <h3 className='font-fredoka mt-2 text-lg font-semibold'>{t('club.rewards.claimsTitle')}</h3>
      {r.claims.length === 0 ? (
        <p className='text-text-muted text-sm'>{t('club.rewards.claimsEmpty')}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[300px] text-sm'>
            <thead className='text-text-faint'>
              <tr>
                <th className='py-1.5 text-start font-medium'>{t('club.rewards.colDate')}</th>
                <th className='py-1.5 text-start font-medium'>{t('club.rewards.colWallet')}</th>
                <th className='py-1.5 text-end font-medium'>{t('club.rewards.colClaimed')}</th>
              </tr>
            </thead>
            <tbody>
              {r.claims.map((claim, i) => (
                <tr key={i} className='border-border border-t'>
                  <td className='num py-1.5'>{club.date(claim.claimTime || claim.requestTime)}</td>
                  <td className='num py-1.5'>{club.mask(claim.wallet)}</td>
                  <td className='num py-1.5 text-end'>
                    {club.amount2(claim.amount)}
                    {claim.txHash !== undefined && (
                      <>
                        {' · '}
                        <a
                          className='text-accent hover:underline'
                          href={TONVIEWER + claim.txHash}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {t('club.rewards.tx')}
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className='text-text-faint text-xs'>{t('club.rewards.claimsNote')}</p>
    </Card>
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
  return (
    <Card>
      <CardTitle aside={<span className='text-text-faint text-sm'>{t('club.rewards.baseSub')}</span>}>
        {t('club.rewards.baseTitle')}
      </CardTitle>
      <p className='text-text-muted text-sm leading-relaxed'>{t('club.rewards.baseBody')}</p>
      {sum !== undefined && (
        <Row
          label={
            since !== undefined
              ? t('club.rewards.earnedSince', { date: club.date(since) })
              : t('club.rewards.earnedTotal')
          }
          value={t('club.common.gramAmount', { amount: club.amount2(sum) })}
          strong
        />
      )}
      {rounds.length === 0 ? (
        <p className='text-text-muted text-sm'>
          {t(club.connected === undefined ? 'club.rewards.baseConnect' : 'club.rewards.historyEmpty')}
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[260px] text-sm'>
            <thead className='text-text-faint'>
              <tr>
                <th className='py-1.5 text-start font-medium'>{t('club.rewards.colRound')}</th>
                <th className='py-1.5 text-end font-medium'>GRAM</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((row, i) => (
                <tr key={i} className='border-border border-t'>
                  <td className='num py-1.5'>{club.date(row.time)}</td>
                  <td className='num text-tone-success-fg py-1.5 text-end'>{club.signed(row.gram, 4, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className='bg-surface-deep flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-0.5'>
          <p className='font-semibold'>{t('club.rewards.stakeMoreTitle')}</p>
          <p className='text-text-muted text-sm'>{t('club.rewards.stakeMoreBody')}</p>
        </div>
        <Button kind='primary' onClick={() => club.model.navigateToTab('stake')}>
          {t('club.rewards.stakeMore')}
        </Button>
      </div>
    </Card>
  )
})

export const Revenue = observer(({ club }: Props) => {
  const t = club.t
  const r = club.revenueBalance
  const block = club.withdrawBlock
  const history = club.walletRewards?.hpoWithdrawals ?? []
  return (
    <details className='border-border bg-surface rounded-[20px] border p-5 sm:p-6'>
      <summary className='font-fredoka cursor-pointer text-lg font-semibold'>{t('club.revenue.title')}</summary>
      <div className='mt-3 flex flex-col gap-3'>
        <p className='text-text-muted text-sm leading-relaxed'>{t('club.revenue.body')}</p>
        <Row
          label={t('club.revenue.withdrawable')}
          value={t('club.common.gramAmount', { amount: club.amount2(r) })}
          strong
        />
        <Row label={t('club.revenue.fee')} value={t('club.revenue.feeValue', { fee: club.amount(REVENUE_FEE, 1) })} />
        {r !== undefined && r > REVENUE_FEE && (
          <p className='text-text-muted text-sm'>
            {t('club.revenue.receive', { amount: club.amount2(r - REVENUE_FEE), fee: club.amount(REVENUE_FEE, 1) })}
          </p>
        )}
        <p className='text-text-faint text-xs'>{t('club.revenue.rules')}</p>
        {history.length > 0 && (
          <p className='text-text-faint text-xs'>
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
    <div className='flex flex-col gap-4'>
      <Boosted club={club} />
      <BaseGram club={club} />
      <Revenue club={club} />
    </div>
  )
})

export default RewardsTab
