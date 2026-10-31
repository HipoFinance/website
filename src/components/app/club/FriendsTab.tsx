// The Club's Friends tab (specs/club-website.md §9; wireframe Friends.dc.html, 2b clubfriends): the
// invite link as the server returns it, with copy and share-to-Telegram; the count and referral
// total; the rows, 50 at a time, with the All / Earning / Not staking yet filters. Needs Telegram.
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import type { ClubModel } from './ClubModel.ts'
import type { FriendsFilter } from './api.ts'
import { Button, Card, CardTitle, Row, Skeleton } from './ui.tsx'

interface Props {
  club: ClubModel
}

const FriendsTab = observer(({ club }: Props) => {
  const t = club.t
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (club.session !== undefined && club.friendsMeta === undefined) {
      void club.loadFriends('all', true)
    }
  }, [club, club.session])
  if (club.session === undefined) {
    return (
      <Card>
        <CardTitle>{t('club.friends.title')}</CardTitle>
        <p className='text-text-muted text-[15px]'>{t('club.friends.body')}</p>
        <p className='text-text-muted text-[15px]'>{t('club.friends.needsTelegram')}</p>
        {!club.tma && (
          <Button
            kind='primary'
            className='self-start'
            onClick={() => club.openModal({ kind: 'linkTelegram', after: 'friends' })}
          >
            {t('club.common.linkTelegram')}
          </Button>
        )}
      </Card>
    )
  }
  const meta = club.friendsMeta
  if (meta === undefined) {
    return <Skeleton className='h-80' />
  }
  const link = meta.inviteLink
  const copy = async () => {
    if (link === undefined) {
      return
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardTitle>{t('club.friends.title')}</CardTitle>
        <p className='text-text-muted text-[15px]'>{t('club.friends.body')}</p>
        {link !== undefined && (
          <div className='flex flex-col gap-2'>
            <p className='text-text-muted text-sm'>{t('club.friends.linkLabel')}</p>
            <p className='bg-surface-deep num min-w-0 rounded-xl px-3 py-2.5 text-sm break-all'>{link}</p>
            <div className='flex flex-wrap gap-2'>
              <Button onClick={() => void copy()}>{t(copied ? 'club.friends.copied' : 'club.friends.copy')}</Button>
              <Button kind='primary' href={club.shareUrl(link)}>
                {t('club.friends.share')}
              </Button>
            </div>
          </div>
        )}
        <div className='flex flex-col gap-1.5'>
          <Row
            label={t('club.friends.earned')}
            value={t('club.common.hpoAmount', { amount: club.amount2(meta.referralTotal) })}
            strong
          />
          <Row label={t('club.friends.joined')} value={club.amount(meta.count ?? 0, 0)} />
        </div>
        <p className='text-text-faint text-xs'>{t('club.friends.note')}</p>
      </Card>
      <Card>
        <CardTitle>{t('club.friends.listTitle')}</CardTitle>
        <div className='flex flex-wrap gap-2' role='group'>
          {(['all', 'earning', 'not_staking'] as FriendsFilter[]).map((value) => (
            <button
              key={value}
              type='button'
              aria-pressed={club.friendsFilter === value}
              className={
                'min-h-9 cursor-pointer rounded-full border px-3 text-sm ' +
                (club.friendsFilter === value
                  ? 'border-accent text-accent font-semibold'
                  : 'border-border text-text-muted')
              }
              onClick={() => void club.loadFriends(value, true)}
            >
              {value === 'all'
                ? t('club.friends.filterAll', { count: club.amount(meta.count ?? 0, 0) })
                : t(value === 'earning' ? 'club.friends.filterEarning' : 'club.friends.filterNotStaking')}
            </button>
          ))}
        </div>
        {club.friendsRows.length === 0 ? (
          <div className='flex flex-col gap-2'>
            <p className='text-text-muted text-sm'>
              {t(club.friendsFilter === 'all' ? 'club.friends.empty' : 'club.friends.emptyFilter')}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[300px] text-sm'>
              <thead className='text-text-faint'>
                <tr>
                  <th className='py-1.5 text-start font-medium'>{t('club.friends.colFriend')}</th>
                  <th className='py-1.5 text-end font-medium'>{t('club.friends.colTheirs')}</th>
                  <th className='py-1.5 text-end font-medium'>{t('club.friends.colYours')}</th>
                </tr>
              </thead>
              <tbody>
                {club.friendsRows.map((row, i) => (
                  <tr key={i} className='border-border border-t'>
                    <td className='max-w-[10rem] truncate py-1.5'>{row.name}</td>
                    <td className='num py-1.5 text-end'>{club.amountFixed(row.friendHpo, 2)}</td>
                    <td className='num py-1.5 text-end'>{club.amountFixed(row.yourHpo, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!club.friendsDone && club.friendsRows.length > 0 && (
          <Button
            className='self-start'
            busy={club.friendsLoading}
            onClick={() => void club.loadFriends(club.friendsFilter, false)}
          >
            {t('club.friends.more')}
          </Button>
        )}
        <p className='text-text-faint text-xs'>{t('club.friends.notStakingNote')}</p>
      </Card>
    </div>
  )
})

export default FriendsTab
