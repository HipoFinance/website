// The Club page (specs/club-website.md §1): its header (season, the Telegram pill), the four tabs as a
// segmented row — the same row on the web and in the Mini App (§10) — the active tab, and the modals.
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import type { Model, ClubTab } from '../Model'
import { clubModelFor, type ClubModel } from './ClubModel.ts'
import Overview from './Overview.tsx'
import RewardsTab from './RewardsTab.tsx'
import FriendsTab from './FriendsTab.tsx'
import CommunityTab from './CommunityTab.tsx'
import Modals from './Modals.tsx'
import { Skeleton } from './ui.tsx'

interface Props {
  model: Model
}

const TABS: ClubTab[] = ['overview', 'rewards', 'friends', 'community']

const Header = observer(({ club }: { club: ClubModel }) => {
  const t = club.t
  const o = club.overview
  const season = o?.season
  let seasonLine: string | undefined
  if (season?.number !== undefined) {
    if (season.end === undefined) {
      seasonLine = t('club.header.seasonOpen', { number: club.amount(season.number, 0) })
    } else {
      const days = Math.max(0, Math.ceil((season.end - club.displayNow) / 86400))
      seasonLine = t('club.header.seasonEnds', {
        number: club.amount(season.number, 0),
        date: club.date(season.end),
        days: club.amount(days, 0),
      })
    }
  }
  return (
    <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
      <div className='flex min-w-0 flex-col gap-1'>
        <h1 className='font-fredoka text-3xl font-semibold'>{t('club.header.title')}</h1>
        <p className='text-text-muted text-[15px]'>{t('club.header.subtitle')}</p>
        {seasonLine !== undefined && <p className='text-text-faint text-sm'>{seasonLine}</p>}
      </div>
      {!club.tma &&
        (!club.sessionKnown ? (
          <Skeleton className='h-9 w-48 self-start rounded-full sm:self-auto' />
        ) : club.session !== undefined ? (
          <div className='border-border bg-surface flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 self-start rounded-full border px-4 py-2 text-sm sm:self-auto'>
            <span className='text-tone-success-fg min-w-0 truncate'>
              {o?.displayName ? t('club.header.linkedAs', { name: o.displayName }) : t('club.header.linked')}
            </span>
            <button
              type='button'
              className='text-text-muted hover:text-accent cursor-pointer'
              onClick={() => void club.logout()}
            >
              {t('club.header.logout')}
            </button>
          </div>
        ) : (
          <button
            type='button'
            className='border-border bg-surface text-text-muted hover:text-accent cursor-pointer self-start rounded-full border px-4 py-2 text-sm sm:self-auto'
            onClick={() => club.openModal({ kind: 'linkTelegram' })}
          >
            {t('club.header.notLinked')} · <span className='text-accent'>{t('club.header.link')}</span>
          </button>
        ))}
    </div>
  )
})

export const ClubTabs = observer(({ club }: { club: ClubModel }) => {
  const t = club.t
  const active = club.model.clubTab
  return (
    <nav aria-label={t('club.tabs.label')} className='bg-surface-deep border-border flex gap-1 rounded-full border p-1'>
      {TABS.map((tab) => (
        <a
          key={tab}
          href={club.model.localizedPath(tab === 'overview' ? '/club/' : `/club/${tab}/`)}
          aria-current={active === tab ? 'page' : undefined}
          className={
            'flex min-h-10 min-w-0 flex-auto items-center justify-center rounded-full px-1.5 text-center text-[13px] leading-tight font-medium hyphens-auto sm:px-2 sm:text-sm ' +
            (active === tab ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-accent')
          }
          onClick={(e) => {
            e.preventDefault()
            club.model.navigateToClubTab(tab)
          }}
        >
          {t('club.tabs.' + tab)}
        </a>
      ))}
    </nav>
  )
})

const ClubPage = observer(({ model }: Props) => {
  const [club, setClub] = useState<ClubModel | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let live = true
    clubModelFor(model)
      .then((value) => live && setClub(value))
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [model])

  if (club === undefined) {
    return (
      <div className='mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 pt-2 pb-28 sm:px-6' aria-busy={!failed}>
        {failed ? (
          <p className='text-text-muted'>{model.t('app.reward.tryAgain')}</p>
        ) : (
          <>
            <Skeleton className='h-11 max-w-md rounded-full' />
            <Skeleton className='h-24' />
          </>
        )}
      </div>
    )
  }

  const tab = model.clubTab
  return (
    <div className='font-body text-text mx-auto flex w-full max-w-[1120px] min-w-0 flex-col gap-5 px-4 pt-2 pb-28 sm:px-6 lg:pb-12'>
      {club.tma ? <ClubTabs club={club} /> : <Header club={club} />}
      {!club.tma && <ClubTabs club={club} />}
      {tab === 'overview' && <Overview club={club} />}
      {tab === 'rewards' && <RewardsTab club={club} />}
      {tab === 'friends' && <FriendsTab club={club} />}
      {tab === 'community' && <CommunityTab club={club} />}
      <Modals club={club} />
    </div>
  )
})

export default ClubPage
