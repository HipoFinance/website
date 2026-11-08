// The Club's Friends tab (specs/club-website.md §9; wireframe Friends.dc.html, 2b clubfriends): the
// invite link as the server returns it, with copy and share-to-Telegram; the count and referral
// total; the rows, 50 at a time, with the All / Earning / Not staking yet filters. Needs Telegram.
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import type { ClubModel } from './ClubModel.ts'
import type { FriendsFilter } from './api.ts'
import { FriendsIcon } from './icons.tsx'
import {
  Button,
  Card,
  CardTitle,
  Eyebrow,
  figure,
  footnote,
  Pill,
  Pills,
  Row,
  Skeleton,
  tableRow,
  tableTd,
  tableTh,
} from './ui.tsx'

const thEnd = tableTh.replace('text-start', 'text-end')

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
        <p className='text-text-muted text-body leading-normal'>{t('club.friends.body')}</p>
        <p className='text-text-muted text-body leading-normal'>{t('club.friends.needsTelegram')}</p>
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
  // F4: only the decimals a figure needs (up to 2): "3,900", "0.65". A tiny non-zero value keeps
  // amountFixed's 2 significant digits rather than showing as 0. Display only.
  const trimmed = (value: string | number | undefined): string => {
    const n = typeof value === 'string' ? Number(value) : value
    return n !== undefined && n !== 0 && Math.abs(n) < 0.01 ? club.amountFixed(n, 2) : club.amount(n, 2)
  }
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
    <div className='flex flex-col gap-6'>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardTitle large>{t('club.friends.title')}</CardTitle>
          <p className='text-text-secondary text-body leading-normal'>{t('club.friends.body')}</p>
          {link !== undefined && (
            <div className='flex flex-col gap-3.5'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='club-invite-link' className='text-text-muted text-sm'>
                  {t('club.friends.linkLabel')}
                </label>
                <div className='flex flex-wrap gap-2'>
                  <input
                    id='club-invite-link'
                    type='text'
                    readOnly
                    value={link}
                    onFocus={(e) => e.currentTarget.select()}
                    className='bg-bg border-border-strong text-text num text-body min-h-11 min-w-0 flex-[1_1_260px] rounded-xl border px-3.5 py-3'
                  />
                  {/* The board's Copy button: radius 12, padding 10px 18px. */}
                  <Button size='sm' className='!rounded-input !px-[18px] !py-2.5' onClick={() => void copy()}>
                    {t(copied ? 'club.friends.copied' : 'club.friends.copy')}
                  </Button>
                </div>
              </div>
              <Button kind='primary' size='sm' className='self-start' href={club.shareUrl(link)}>
                {t('club.friends.share')}
              </Button>
            </div>
          )}
        </Card>
        <Card>
          <div className='flex min-w-0 flex-col gap-3.5'>
            <Eyebrow icon={FriendsIcon}>{t('club.friends.earned')}</Eyebrow>
            <p className={figure.replace('leading-[1.1]', 'leading-none')}>
              {t('club.common.hpoAmount', { amount: club.amount2(meta.referralTotal) })}
            </p>
          </div>
          <div className='border-border flex flex-col gap-2 border-t pt-3.5'>
            <Row label={t('club.friends.joined')} value={club.amount(meta.count ?? 0, 0)} />
          </div>
          <p className={footnote}>{t('club.friends.note')}</p>
        </Card>
      </div>
      <Card>
        <CardTitle
          aside={
            <Pills label={t('club.friends.listTitle')}>
              {(['all', 'earning', 'not_staking'] as FriendsFilter[]).map((value) => (
                <Pill
                  key={value}
                  active={club.friendsFilter === value}
                  onClick={() => void club.loadFriends(value, true)}
                >
                  {value === 'all'
                    ? t('club.friends.filterAll', { count: club.amount(meta.count ?? 0, 0) })
                    : t(value === 'earning' ? 'club.friends.filterEarning' : 'club.friends.filterNotStaking')}
                </Pill>
              ))}
            </Pills>
          }
        >
          {t('club.friends.listTitle')}
        </CardTitle>
        {club.friendsRows.length === 0 ? (
          <p className='text-text-muted text-body leading-normal'>
            {t(club.friendsFilter === 'all' ? 'club.friends.empty' : 'club.friends.emptyFilter')}
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[300px]'>
              <thead>
                <tr>
                  <th className={tableTh}>{t('club.friends.colFriend')}</th>
                  <th className={thEnd}>{t('club.friends.colTheirs')}</th>
                  <th className={thEnd}>{t('club.friends.colYours')}</th>
                </tr>
              </thead>
              <tbody>
                {club.friendsRows.map((row, i) => (
                  <tr key={i} className={tableRow}>
                    <td className={tableTd + ' max-w-[10rem] truncate'}>{row.name}</td>
                    <td className={tableTd + ' num text-end'}>{trimmed(row.friendHpo)}</td>
                    <td className={tableTd + ' num text-end'}>{trimmed(row.yourHpo)}</td>
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
        <p className={footnote}>{t('club.friends.notStakingNote')}</p>
      </Card>
    </div>
  )
})

export default FriendsTab
