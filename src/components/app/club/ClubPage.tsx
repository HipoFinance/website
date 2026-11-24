// The Club page (specs/club-website.md §1): its header (season, the Telegram pill), the four tabs as a
// segmented row — the same row on the web and in the Mini App (§10) — the active tab, and the modals.
import { useEffect, useState, type ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import type { Model, ClubTab } from '../Model'
import { clubModelFor, type ClubModel } from './ClubModel.ts'
import Overview from './Overview.tsx'
import RewardsTab from './RewardsTab.tsx'
import FriendsTab from './FriendsTab.tsx'
import CommunityTab from './CommunityTab.tsx'
import Modals from './Modals.tsx'
import { ClockIcon } from './icons.tsx'
import { Button, Card, ErrorLine, Skeleton, TmaContext } from './ui.tsx'

interface Props {
  model: Model
}

const TABS: ClubTab[] = ['overview', 'rewards', 'friends', 'community']

// Marks where the day count goes in the season line, so the "D days left" part can be set in bold
// whatever the locale's word order (H1). A private-use character never appears in a catalog.
const DAYS_MARK = '\uE000'

const Header = observer(({ club }: { club: ClubModel }) => {
  const t = club.t
  const o = club.overview
  // In a break the season line is the break card's job.
  const season = club.paused ? undefined : o?.season
  // H1: the season pill — "Season N ends <date> · **D days left**", the part after the last " · "
  // that holds the day count in bold (just the number if a locale has no such part).
  let seasonPill: ReactNode
  if (season?.number !== undefined) {
    if (season.end === undefined) {
      seasonPill = t('club.header.seasonOpen', { number: club.amount(season.number, 0) })
    } else {
      const days = club.amount(Math.max(0, Math.ceil((season.end - club.displayNow) / 86400)), 0)
      const line = t('club.header.seasonEnds', {
        number: club.amount(season.number, 0),
        date: club.date(season.end),
        days: DAYS_MARK,
      })
      const cut = line.lastIndexOf(' · ')
      if (cut >= 0 && line.indexOf(DAYS_MARK, cut) >= 0) {
        seasonPill = (
          <>
            {line.slice(0, cut + 3)}
            <strong className='font-semibold'>{line.slice(cut + 3).replace(DAYS_MARK, days)}</strong>
          </>
        )
      } else {
        const [before, after = ''] = line.split(DAYS_MARK)
        seasonPill = (
          <>
            {before}
            <strong className='font-semibold'>{days}</strong>
            {after}
          </>
        )
      }
    }
  }
  const chip = 'flex min-w-0 items-center gap-2 rounded-full border px-4 py-2 text-body leading-normal'
  return (
    <div className='flex min-w-0 flex-wrap items-end justify-between gap-x-6 gap-y-4'>
      <div className='flex min-w-0 flex-col gap-1.5'>
        <h1 className='font-display text-display leading-[1.1] font-extrabold'>{t('club.header.title')}</h1>
        {/* Each tab has its own line under the title, as in its wireframe. */}
        <p className='text-text-muted text-lead leading-normal'>
          {t(
            {
              overview: 'club.header.subtitle',
              rewards: 'club.header.subtitleRewards',
              friends: 'club.header.subtitleFriends',
              community: 'club.header.subtitleCommunity',
            }[club.model.clubTab] ?? 'club.header.subtitle',
          )}
        </p>
      </div>
      <div className='ms-auto flex min-w-0 flex-wrap items-center justify-end gap-2.5'>
        {seasonPill !== undefined && (
          <div className={chip + ' border-border bg-surface'}>
            <ClockIcon size={16} className='text-text-muted' />
            <span className='min-w-0'>{seasonPill}</span>
          </div>
        )}
        {!club.sessionKnown ? (
          <Skeleton className='h-10 w-48 rounded-full' />
        ) : club.session !== undefined ? (
          // H3: linked — a green dot, the name in the ordinary text colour, and the Log out link.
          <div className={chip + ' border-border bg-surface flex-wrap gap-x-3 gap-y-1'}>
            <span className='flex min-w-0 items-center gap-2'>
              <span className='bg-tone-success-fg size-2 shrink-0 rounded-full' aria-hidden='true'></span>
              <span className='min-w-0 truncate'>
                {o?.displayName ? t('club.header.linkedAs', { name: o.displayName }) : t('club.header.linked')}
              </span>
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
          // H3: not linked — a dashed outline and a grey dot.
          <button
            type='button'
            className={chip + ' border-border-control text-text hover:text-accent cursor-pointer border-dashed'}
            onClick={() => club.openModal({ kind: 'linkTelegram' })}
          >
            <span className='bg-text-faint size-2 shrink-0 rounded-full' aria-hidden='true'></span>
            <span>
              {t('club.header.notLinked')} · <span className='text-accent'>{t('club.header.link')}</span>
            </span>
          </button>
        )}
      </div>
    </div>
  )
})

// The md-and-up overrides that turn the segmented switch into the wireframe's underline tabs.
const DESK_NAV = 'md:gap-2 md:rounded-none md:border-0 md:border-b md:bg-transparent md:p-0'
const DESK_TAB =
  'md:-mb-px md:min-h-11 md:flex-none md:rounded-none md:border-b-2 md:bg-transparent md:px-4 md:py-2.5 md:text-body md:shadow-none'
const DESK_TAB_ON = 'md:border-accent md:font-semibold'
const DESK_TAB_OFF = 'md:border-transparent md:font-normal'

// The browser's note that the member has opened the Community tab: the "live" dot then stops pulsing.
const COMMUNITY_SEEN_KEY = 'hipo.club.communitySeen'

function readCommunitySeen(): boolean {
  try {
    return window.localStorage.getItem(COMMUNITY_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

// The "live" mark on the Community tab: a green dot that pulses until the member has opened the tab,
// and from md up on the web a "Live" pill after it. Hidden once the server says Community is off.
const LiveMark = ({ label, seen, pill }: { label: string; seen: boolean; pill: boolean }) => (
  <span className='inline-flex shrink-0 items-center gap-1.5' aria-label={label} title={label}>
    <span className='relative inline-flex h-2 w-2' aria-hidden='true'>
      {!seen && (
        <span className='bg-tone-success-fg absolute inline-flex h-full w-full animate-ping rounded-full opacity-75'></span>
      )}
      <span className='bg-tone-success-fg relative inline-flex h-2 w-2 rounded-full'></span>
    </span>
    {pill && (
      <span
        className='text-tone-success-fg border-tone-success-fg hidden rounded-full border px-1.5 text-[11px] leading-4 font-semibold md:inline'
        aria-hidden='true'
      >
        {label}
      </span>
    )}
  </span>
)

export const ClubTabs = observer(({ club }: { club: ClubModel }) => {
  const t = club.t
  const active = club.model.clubTab
  // The Mini App keeps the switch at every width.
  const desk = !club.tma
  const [communitySeen, setCommunitySeen] = useState(readCommunitySeen)
  useEffect(() => {
    if (active !== 'community' || communitySeen) {
      return
    }
    setCommunitySeen(true)
    try {
      window.localStorage.setItem(COMMUNITY_SEEN_KEY, '1')
    } catch {
      // No storage (private window): the dot pulses again next visit, which is harmless.
    }
  }, [active, communitySeen])
  const communityLive = club.community?.setting !== 'off'
  return (
    // A segmented switch on phones and in the Mini App; from md up on the web, the wireframe's
    // underline tabs (left-aligned links over a bottom rule, the active one underlined in coral).
    <nav
      aria-label={t('club.tabs.label')}
      className={'bg-surface-deep border-border flex gap-1 rounded-full border p-1' + (desk ? ' ' + DESK_NAV : '')}
    >
      {TABS.map((tab) => (
        <a
          key={tab}
          href={club.model.localizedPath(tab === 'overview' ? '/club/' : `/club/${tab}/`)}
          aria-current={active === tab ? 'page' : undefined}
          className={
            'text-label flex min-h-10 min-w-0 flex-auto items-center justify-center rounded-full px-1.5 text-center leading-tight font-medium hyphens-auto sm:px-2 sm:text-sm ' +
            (active === tab ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-accent') +
            (desk ? ' ' + DESK_TAB + ' ' + (active === tab ? DESK_TAB_ON : DESK_TAB_OFF) : '')
          }
          onClick={(e) => {
            e.preventDefault()
            club.model.navigateToClubTab(tab)
          }}
        >
          {tab === 'community' && communityLive ? (
            <span className='inline-flex min-w-0 items-center gap-1.5'>
              <span className='min-w-0'>{t('club.tabs.' + tab)}</span>
              <LiveMark label={t('club.tabs.live')} seen={communitySeen} pill={desk} />
            </span>
          ) : (
            t('club.tabs.' + tab)
          )}
        </a>
      ))}
    </nav>
  )
})

// The season break (specs/season-break-pause.md): the one card that replaces the tabs while the season
// is paused, for every visitor. The member's withdraw runs through the Rewards tab's own flow.
const BreakCard = observer(({ club }: { club: ClubModel }) => {
  const t = club.t
  const season = club.season
  const number = season?.number
  const prev = club.amount(number === undefined ? undefined : number - 1, 0)
  const params = {
    prev,
    number: club.amount(number, 0),
    end: club.dateZone(season?.prevEnd),
    start: club.dateZone(season?.start),
  }
  const held = club.heldPayment
  const rewards = club.revenueBalance
  const block = club.withdrawBlock
  return (
    <Card>
      <h2 className='font-body text-title leading-normal font-semibold'>{t('club.break.title', params)}</h2>
      <p className='text-body leading-normal'>
        {t(season?.prevEnd === undefined ? 'club.break.datesNoEnd' : 'club.break.dates', params)}
      </p>
      <p className='text-body leading-normal font-semibold'>{club.breakCountdown}</p>
      <p className='text-text-secondary text-body leading-normal'>{t('club.break.stake')}</p>
      {held !== undefined && (
        <p className='text-tone-success-fg text-body leading-normal'>
          {t(held.target === 'upgrade' ? 'club.break.heldUpgrade' : 'club.break.heldClaim', {
            ...params,
            date: club.dateZone(held.sentAt),
          })}
        </p>
      )}
      {club.session !== undefined && ((rewards !== undefined && rewards > 0) || club.withdrawResult !== undefined) && (
        <div className='border-border flex flex-col gap-2 border-t pt-4'>
          <p className='num text-lead font-semibold'>{t('club.break.rewards', { amount: club.amount2(rewards) })}</p>
          <Button
            kind='secondary'
            size='sm'
            className='self-start'
            disabled={block !== undefined}
            busy={club.withdrawing}
            onClick={() => void club.withdraw()}
          >
            {block === undefined
              ? t('club.revenue.button', { amount: club.amount2(rewards) })
              : t(block.key, block.params)}
          </Button>
          {club.withdrawResult === 'done' && <p className='text-tone-success-fg text-sm'>{t('club.revenue.done')}</p>}
          {club.withdrawResult === 'failed' && <ErrorLine>{t('club.revenue.failed')}</ErrorLine>}
        </div>
      )}
      {club.actionError !== undefined && club.modal === undefined && (
        <ErrorLine>{t(club.actionError.key, club.actionError.params)}</ErrorLine>
      )}
    </Card>
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
      <div className='mx-auto flex w-full max-w-[1232px] flex-col gap-4 px-4 pt-2 pb-28 sm:px-6' aria-busy={!failed}>
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
    // M1: in the Mini App the cards are tighter and 14px apart (TmaContext tells Card and Strip).
    <TmaContext.Provider value={club.tma}>
      <div
        className={
          'font-body text-text mx-auto flex w-full max-w-[1232px] min-w-0 flex-col px-4 pt-2 pb-28 sm:px-6 lg:pb-12 ' +
          (club.tma ? 'gap-3.5' : 'gap-6')
        }
      >
        {club.tma ? !club.paused && <ClubTabs club={club} /> : <Header club={club} />}
        {!club.tma && !club.paused && <ClubTabs club={club} />}
        {club.paused && <BreakCard club={club} />}
        {!club.paused && tab === 'overview' && <Overview club={club} />}
        {!club.paused && tab === 'rewards' && <RewardsTab club={club} />}
        {!club.paused && tab === 'friends' && <FriendsTab club={club} />}
        {!club.paused && tab === 'community' && <CommunityTab club={club} />}
        <Modals club={club} />
      </div>
    </TmaContext.Provider>
  )
})

export default ClubPage
