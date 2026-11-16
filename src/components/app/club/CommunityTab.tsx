// The Community tab, built to the wireframe "05 · Community tab" (docs/hipo-club-redesign/wireframes/
// Community.dc.html; club-server specs/club-community-points.md §8). With `clubcommunity` setting
// 'points': three states under the week line (Telegram not linked, almost set up, earning) and the
// "How community rewards work" card. While the first read is on its way, a loading placeholder in the
// earning layout's shape; otherwise (setting 'off', a refused read) the "coming soon" card. Display only: no Limzo calls from the browser. Every HPO figure and
// the "Your share" column show "—" until the HPO payout exists (spec B).
import { useEffect, type ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import { Send } from 'lucide-react'
import type { CommunityWeek, CommunityWhy } from './api.ts'
import type { ClubModel } from './ClubModel.ts'
import { HIPO_CHAT_URL, LIMZO_URL } from './ClubModel.ts'
import { CalendarIcon, HpoIcon, TrophyIcon } from './icons.tsx'
import { Card, Chip, Eyebrow, Skeleton, tableRow, tableTd, tableTh } from './ui.tsx'
import * as fmt from '../../../i18n/format.ts'

interface Props {
  club: ClubModel
}

const DASH = '—'
const DAY_MS = 86_400_000
const bodyText = 'text-text-muted text-body leading-normal'
// The wireframe's card: fill, border, radius 20, padding 24, 14px between its parts.
const box = 'bg-surface border-border rounded-card flex min-w-0 flex-col gap-[14px] border p-6'
const boxTight = box.replace('gap-[14px]', 'gap-3')
const heading = 'text-title-sm leading-normal font-semibold'
const linkClass = 'text-accent underline'
const th = tableTh + ' leading-normal'
const thEnd = th.replace('text-start', 'text-end')
const rowSelf = 'flex justify-between gap-3 bg-row-self rounded-lg px-[10px] py-2 font-semibold'
const noticeBox = 'bg-tone-neutral-bg border-tone-neutral-border rounded-card flex flex-col gap-4 border p-6'
const primaryLook =
  'bg-accent-fill text-on-accent hover:bg-accent-fill-hover rounded-control px-[22px] py-3 font-semibold'

function ChatLinks({ club }: Props) {
  const t = club.t
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <a
        className='border-border-control text-text hover:text-accent inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2'
        href={HIPO_CHAT_URL}
        target='_blank'
        rel='noopener noreferrer'
      >
        <Send className='size-4 shrink-0' aria-hidden='true' />
        {t('club.community.chat')}
      </a>
      <a
        className='text-text-muted hover:text-accent text-label underline underline-offset-4'
        href={LIMZO_URL}
        target='_blank'
        rel='noopener noreferrer'
      >
        {t('club.community.limzo')}
      </a>
    </div>
  )
}

function ComingSoon({ club }: Props) {
  const t = club.t
  return (
    <Card>
      <h2 className='font-display text-2xl font-extrabold'>{t('club.community.title')}</h2>
      <p className={bodyText}>{t('club.community.body')}</p>
      <ChatLinks club={club} />
    </Card>
  )
}

function day(club: ClubModel, ms: number, withMonth = true): string {
  return fmt.formatDate(club.model.locale, new Date(ms), {
    ...(withMonth ? { month: 'short' } : {}),
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// "Oct 19–25" in one month, "Sep 28–Oct 4" across two; UTC.
function range(club: ClubModel, start: string, end: string): string {
  const s = Date.parse(start + 'T00:00:00Z')
  const e = Date.parse(end + 'T00:00:00Z')
  const sameMonth = new Date(s).getUTCMonth() === new Date(e).getUTCMonth()
  return club.t('club.community.weekRange', { start: day(club, s), end: day(club, e, !sameMonth) })
}

// The Thursday after a week: its end (a Sunday) plus four days.
function thursday(club: ClubModel, end: string): string {
  return day(club, Date.parse(end + 'T00:00:00Z') + 4 * DAY_MS)
}

function whyLabel(club: ClubModel, why: CommunityWhy): string {
  const t = club.t
  switch (why) {
    case 'new':
      return t('club.community.notCountedNew')
    case 'muted':
      return t('club.community.notCountedMuted')
    case 'excluded':
      return t('club.community.notCountedExcluded')
    case 'left':
      return t('club.community.notCountedLeft')
    case 'void':
      return t('club.community.notCountedVoid')
    default:
      return t('club.community.notCounted')
  }
}

// part(Wt, x, T) = ⌊Wt·√(min(x, T)/T)⌋ (spec §3), in integers as the server does it.
function part(weight: number, x: number, target: number): number {
  return target <= 0 ? 0 : Math.floor(Math.sqrt(Math.floor((weight * weight * Math.min(x, target)) / target)))
}

function PlaneIcon() {
  return (
    <svg
      aria-hidden='true'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M21 4 3 11l6 2 2 6 3-4 5 4 2-15z'></path>
    </svg>
  )
}

// The wireframe's first row: the week pill, the Hipo Chat button and "Powered by Limzo".
function WeekLine({ club, start, end }: { club: ClubModel; start: string; end: string }) {
  const t = club.t
  return (
    <div className='flex flex-wrap items-center gap-[10px] lg:justify-end'>
      <span className='bg-surface border-border rounded-full border px-4 py-2'>
        {t('club.community.weekLine', { range: range(club, start, end) })}
        <strong>{t('club.community.weekResets')}</strong>
      </span>
      <a
        className='text-text border-border-control inline-flex items-center gap-2 rounded-full border px-4 py-2'
        href={HIPO_CHAT_URL}
        target='_blank'
        rel='noopener noreferrer'
      >
        <PlaneIcon />
        {t('club.community.chat')}
      </a>
      <a className='text-text-muted text-label underline' href={LIMZO_URL} target='_blank' rel='noopener noreferrer'>
        {t('club.community.limzo')}
      </a>
    </div>
  )
}

function Notice({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-5'>
      <div className='flex min-w-0 flex-[1_1_520px] flex-col gap-1'>
        <h2 className={heading}>{title}</h2>
        <p className='text-text-secondary'>{body}</p>
      </div>
      {action}
    </div>
  )
}

function weekStatus(club: ClubModel, week: CommunityWeek) {
  const t = club.t
  let status: string
  let tone: string
  if (week.state === 'review') {
    status = t('club.community.stateReview', { date: thursday(club, week.end) })
    tone = 'text-tone-info-fg'
  } else if (week.state === 'frozen') {
    status = t('club.community.stateFrozen')
    tone = 'text-tone-warn-fg'
  } else if (week.state === 'void') {
    status = t('club.community.stateVoid')
    tone = 'text-text-faint'
  } else if (week.p === 0 && week.why === '') {
    status = t('club.community.stateNone')
    tone = 'text-text-faint'
  } else {
    status = t('club.community.stateFinal')
    tone = 'text-tone-success-fg'
  }
  return { status, tone }
}

function WeekRow({ club, week }: { club: ClubModel; week: CommunityWeek }) {
  const t = club.t
  const delta = week.p - week.baseP
  const { status, tone } = weekStatus(club, week)
  return (
    <tr className={tableRow}>
      <td className={tableTd}>{range(club, week.start, week.end)}</td>
      <td className={tableTd}>
        <span className='num'>{club.amount(week.p, 0)}</span>
        {delta !== 0 && (
          <>
            {' '}
            <span className='text-tone-warn-fg'>
              {t('club.community.adjusted', { delta: (delta < 0 ? '−' : '+') + club.amount(Math.abs(delta), 0) })}
            </span>
          </>
        )}
      </td>
      <td className={tableTd}>{DASH}</td>
      <td className={tableTd + ' text-end'}>{DASH}</td>
      <td className={tableTd + ' ' + tone}>{status}</td>
    </tr>
  )
}

// `key_one` / `key_other` (the locale's Intl.PluralRules category, else `_other`).
function plural(club: ClubModel, key: string, count: number, params: Record<string, string | number>) {
  const category = new Intl.PluralRules(club.model.locale).select(count)
  const has = club.translator.has(`${key}_${category}`)
  return club.t(`${key}_${has ? category : 'other'}`, params)
}

function pts(club: ClubModel, value: number) {
  return plural(club, 'club.community.pts', value, { points: club.amount(value, 0) })
}

function youLabel(club: ClubModel, rank: number, name: string) {
  const rankText = club.amount(rank, 0)
  return name === ''
    ? club.t('club.community.boardYouBare', { rank: rankText })
    : club.t('club.community.boardYou', { rank: rankText, name })
}

function HowItWorks({ club }: Props) {
  const t = club.t
  const steps = [
    ['step1Label', 'step1Title', 'step1Body'],
    ['step2Label', 'step2Title', 'step2Body'],
    ['step3Label', 'step3Title', 'step3Body'],
    ['step4Label', 'step4Title', 'step4Body'],
  ] as const
  const list = 'text-text-secondary flex list-disc flex-col gap-1 ps-[18px]'
  return (
    <section className={box.replace('gap-[14px]', 'gap-[18px]')}>
      <h2 className={heading}>{t('club.community.howTitle')}</h2>
      <ol className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3'>
        {steps.map(([label, title, body]) => (
          <li key={label} className='bg-surface-raised rounded-tile flex flex-col gap-1.5 p-4'>
            <span className='text-text-faint text-label'>{t(`club.community.${label}`)}</span>
            <strong>{t(`club.community.${title}`)}</strong>
            <span className='text-text-muted text-small'>{t(`club.community.${body}`)}</span>
          </li>
        ))}
      </ol>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4'>
        <div className='flex flex-col gap-1.5'>
          <strong className='text-tone-success-fg'>{t('club.community.countsTitle')}</strong>
          <ul className={list}>
            <li>{t('club.community.counts1')}</li>
            <li>{t('club.community.counts2')}</li>
            <li>{t('club.community.counts3')}</li>
          </ul>
        </div>
        <div className='flex flex-col gap-1.5'>
          <strong className='text-tone-warn-fg'>{t('club.community.doesntTitle')}</strong>
          <ul className={list}>
            <li>{t('club.community.doesnt1')}</li>
            <li>{t('club.community.doesnt2')}</li>
            <li>{t('club.community.doesnt3')}</li>
            <li>{t('club.community.doesnt4')}</li>
            <li>{t('club.community.doesnt5')}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

const CommunityTab = observer(({ club }: Props) => {
  const t = club.t
  const loaded = club.community !== undefined
  // Load when the tab opens; while nothing has loaded (a failed read), try again every 30 s.
  useEffect(() => {
    if (club.session === undefined || loaded) {
      return
    }
    void club.loadCommunity()
    const timer = setInterval(() => void club.loadCommunity(), 30_000)
    return () => clearInterval(timer)
  }, [club, club.session, loaded])
  const c = club.community
  const nowMs = (club.serverNow() ?? Date.now() / 1000) * 1000
  const e = c?.estimate
  // The current UTC week: the estimate's, else the Monday on or before now.
  const todayDay = Math.floor(nowMs / DAY_MS)
  const monday = (todayDay - ((todayDay + 3) % 7)) * DAY_MS
  const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
  const weekStart = e?.start || iso(monday)
  const weekEnd = e?.end || iso(monday + 6 * DAY_MS)

  if (club.session === undefined) {
    // No Club reply is readable without a session, so the setting is unknown: coming soon, plus the link
    // card. "How it works" waits until the setting is known to be 'points'.
    return (
      <div className='text-body flex min-w-0 flex-col gap-6 leading-normal tabular-nums'>
        <ComingSoon club={club} />
        <section className={noticeBox}>
          <Notice
            title={t('club.community.notLinkedTitle')}
            body={t('club.community.notLinkedBody')}
            action={
              <button
                type='button'
                className={primaryLook + ' min-h-11 cursor-pointer'}
                onClick={() => club.openModal({ kind: 'linkTelegram', after: 'community' })}
              >
                {t('club.common.linkTelegram')}
              </button>
            }
          />
        </section>
      </div>
    )
  }
  if (c === undefined) {
    // Loading (or retrying a failed read): the earning layout's shape, not "coming soon".
    return (
      <div className='flex min-w-0 flex-col gap-6' aria-busy='true'>
        <Skeleton className='h-10 w-full max-w-md rounded-full' />
        <div className='grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4'>
          <Skeleton className='h-[425px] rounded-[20px]' />
          <Skeleton className='h-[425px] rounded-[20px]' />
        </div>
        <Skeleton className='h-[455px] rounded-[20px]' />
      </div>
    )
  }
  if (c.setting !== 'points') {
    return <ComingSoon club={club} />
  }

  // Community HPO credited this season: none until the HPO payout exists (spec B), so the card shows a dash.
  const seasonHpo: number | undefined = undefined
  const isNew = c.nowWhy === 'new' || e?.why === 'new'
  const { weights: w, targets: g } = c.params
  const n = (v: number) => club.amount(v, 0)
  const unseen = (v: number | undefined) => (v === undefined ? DASH : n(v))
  const dayNo =
    e === undefined || Number.isNaN(Date.parse(e.start + 'T00:00:00Z'))
      ? undefined
      : Math.min(7, Math.max(1, Math.floor((nowMs - Date.parse(e.start + 'T00:00:00Z')) / DAY_MS) + 1))
  const last = c.weeks[0]
  // A member with no line this week (no activity, so not in Limzo's copy) sees the three parts at zero.
  const pe = e ?? { a2: 0, h: 0, d: 0, reactors: 0 }
  const parts = [
    {
      name: t('club.community.partAppreciation'),
      pts: part(w.appreciation, pe.a2, 2 * g.appreciation),
      max: w.appreciation,
      color: 'bg-tone-success-fg',
      detail: plural(club, 'club.community.detailAppreciation', Math.floor(pe.a2 / 2), {
        count: n(Math.floor(pe.a2 / 2)),
        members:
          pe.reactors === undefined
            ? DASH
            : plural(club, 'club.community.members', pe.reactors, { count: n(pe.reactors) }),
      }),
    },
    {
      name: t('club.community.partReplies'),
      pts: part(w.replies, pe.h, g.replies),
      max: w.replies,
      color: 'bg-tone-info-fg',
      detail: plural(club, 'club.community.detailReplies', pe.h, { count: n(pe.h) }),
    },
    {
      name: t('club.community.partDays'),
      pts: part(w.days, pe.d, g.days),
      max: w.days,
      color: 'bg-accent-fill',
      detail: plural(club, 'club.community.detailDays', pe.d, { count: n(pe.d) }),
    },
  ]
  const stickers = e?.stickers ?? 0
  const footnote = [
    stickers > 0 ? plural(club, 'club.community.notCountedStickers', stickers, { count: n(stickers) }) : '',
    t('club.community.weeklyCap', { max: n(c.params.maxPoints) }),
    last === undefined ? '' : t('club.community.lastWeek', { points: n(last.p) }),
  ]
    .filter((s) => s !== '')
    .join(' ')
  const adjusted = c.weeks.filter((week) => week.p !== week.baseP)
  const ranked = e?.rank !== undefined && e.rank > 0
  // Excluded, new, muted or without a Club account: the server sends P = 0 but each part as computed.
  const notCounted = e !== undefined && e.why !== ''
  const own = c.top.find((row) => row.you)
  const ownName = own?.name ?? club.overview?.displayName ?? ''
  const profile = c.profile

  return (
    <div className='text-body flex min-w-0 flex-col gap-6 leading-normal tabular-nums'>
      <WeekLine club={club} start={weekStart} end={weekEnd} />

      {isNew ? (
        <section className={noticeBox}>
          <Notice
            title={t('club.community.setupTitle')}
            body={t('club.community.setupBody')}
            action={
              <a className={primaryLook} href={HIPO_CHAT_URL} target='_blank' rel='noopener noreferrer'>
                {t('club.community.openChat')}
              </a>
            }
          />
          <ul className='grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3'>
            {[
              {
                tone: 'text-tone-success-fg',
                label: t('club.community.setupDone'),
                text: t('club.community.setupLinked'),
              },
              {
                tone: 'text-tone-success-fg',
                label: t('club.community.setupDone'),
                text: t('club.community.setupJoined'),
              },
              {
                tone: 'text-tone-warn-fg',
                label: t('club.community.setupDays', { days: c.daysInChat === undefined ? DASH : n(c.daysInChat) }),
                text: t('club.community.setupMember'),
              },
            ].map((item) => (
              <li key={item.text} className='bg-surface-raised rounded-control flex flex-col gap-0.5 px-4 py-3.5'>
                <span className={item.tone + ' text-label font-semibold'}>{item.label}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className='flex flex-col gap-6'>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4'>
            <section className={box}>
              <Eyebrow icon={HpoIcon}>{t('club.community.hpoTitle')}</Eyebrow>
              <div className='flex items-baseline gap-2'>
                {/* No HPO is credited until spec B: the dash takes the label's size, in bold; a real
                    amount keeps the wireframe's large figure. */}
                {seasonHpo === undefined ? (
                  <span className='text-lead font-bold'>{DASH}</span>
                ) : (
                  <span className='font-display num text-display-lg leading-none font-extrabold'>
                    {club.amount(seasonHpo, 0)}
                  </span>
                )}
                <span className='text-text-secondary text-lead'>{t('club.community.hpoCredited')}</span>
              </div>
              <div className='border-border flex flex-col gap-2 border-t pt-[14px]'>
                {last !== undefined && (
                  <div className='flex justify-between gap-3'>
                    <span className='text-text-muted'>
                      {last.state === 'review'
                        ? t('club.community.hpoInReview', { range: range(club, last.start, last.end) })
                        : t('club.community.hpoWeekLabel', {
                            status: weekStatus(club, last).status,
                            range: range(club, last.start, last.end),
                          })}
                    </span>
                    <span>
                      {last.state === 'review'
                        ? t('club.community.hpoReview', { hpo: DASH, date: thursday(club, last.end) })
                        : t('club.community.hpoPlain', { hpo: DASH })}
                    </span>
                  </div>
                )}
                <div className='flex justify-between gap-3'>
                  <span className='text-text-muted'>{t('club.community.hpoSoFar')}</span>
                  <span>{t('club.community.hpoEst', { hpo: DASH })}</span>
                </div>
              </div>
              <span className='text-text-faint text-label'>{t('club.community.hpoNote')}</span>
              <a
                className={linkClass + ' self-start'}
                href={club.model.localizedPath('/club/')}
                onClick={(ev) => {
                  ev.preventDefault()
                  club.model.navigateToClubTab('overview')
                }}
              >
                {t('club.community.goClaim')}
              </a>
            </section>

            <section className={box}>
              <div className='flex items-center justify-between gap-3'>
                <Eyebrow icon={CalendarIcon}>
                  {t('club.community.weekTitle', { day: dayNo === undefined ? DASH : n(dayNo) })}
                </Eyebrow>
                {ranked && (
                  <Chip tone='success'>{t('club.community.rank', { rank: unseen(e?.rank), of: unseen(e?.of) })}</Chip>
                )}
              </div>
              {e !== undefined && e.why !== '' && <p className='text-text-muted text-label'>{whyLabel(club, e.why)}</p>}
              <div className='flex items-baseline gap-2'>
                {/* With no estimate, or a member this week does not count, the dash takes the label's size, in
                    bold, as on the HPO card. */}
                {e === undefined || notCounted ? (
                  <span className='text-lead font-bold'>{DASH}</span>
                ) : (
                  <span className='font-display num text-display-lg leading-none font-extrabold'>{n(e.p)}</span>
                )}
                <span className='text-text-secondary text-lead'>{t('club.community.pointsSoFar')}</span>
              </div>
              {/* A member this week does not count still sees their activity, greyed: the parts are what
                  it would be worth, not points earned. */}
              {notCounted && <p className='text-text-muted text-label -mb-2'>{t('club.community.wouldCount')}</p>}
              <div className={'flex flex-col gap-3' + (notCounted ? ' opacity-60 grayscale' : '')}>
                {parts.map((p) => (
                  <div key={p.name} className='flex flex-col gap-1'>
                    <div className='flex justify-between gap-3'>
                      <span className='font-semibold'>{p.name}</span>
                      <span>{pts(club, p.pts)}</span>
                    </div>
                    <div className='bg-border h-2 overflow-hidden rounded-full'>
                      <div className={'h-full ' + p.color} style={{ width: (100 * p.pts) / p.max + '%' }}></div>
                    </div>
                    <span className='text-text-muted text-label'>{p.detail}</span>
                  </div>
                ))}
              </div>
              <div className='bg-surface-raised text-text-muted text-label rounded-input px-[14px] py-2.5'>
                {footnote}
              </div>
            </section>
          </div>

          <section className={box}>
            <h2 className={heading}>{t('club.community.historyTitle')}</h2>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[640px] border-collapse'>
                <thead>
                  <tr>
                    <th className={th}>{t('club.community.colWeek')}</th>
                    <th className={th}>{t('club.community.colPoints')}</th>
                    <th className={th}>{t('club.community.colShare')}</th>
                    <th className={thEnd}>{t('club.community.colHpo')}</th>
                    <th className={th}>{t('club.community.colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.weeks.length === 0 ? (
                    <tr className={tableRow}>
                      <td className={tableTd + ' text-text-muted'} colSpan={5}>
                        {t('club.community.noWeeks')}
                      </td>
                    </tr>
                  ) : (
                    c.weeks.map((week) => <WeekRow key={week.week} club={club} week={week} />)
                  )}
                </tbody>
              </table>
            </div>
            {adjusted.length > 0 && (
              <p className='text-text-faint text-small'>
                {adjusted
                  .filter((week) => week.note !== '')
                  .map((week) =>
                    t('club.community.adjustedWeek', { range: range(club, week.start, week.end), note: week.note }),
                  )
                  .join(' ')}{' '}
                <a className={linkClass} href={HIPO_CHAT_URL} target='_blank' rel='noopener noreferrer'>
                  {t('club.community.askChat')}
                </a>
              </p>
            )}
          </section>

          <div className='grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4'>
            <section className={boxTight}>
              <div className='flex flex-wrap items-baseline justify-between gap-3'>
                <h2 className={heading + ' flex items-center gap-[10px]'}>
                  <TrophyIcon size={20} className='text-text-muted' />
                  {t('club.community.boardTitle')}
                </h2>
                <span className='text-text-faint text-label'>{t('club.community.boardLevels')}</span>
              </div>
              <div className='flex flex-col gap-1.5'>
                {c.top.length === 0 && <div className='text-text-faint py-0.5'>{DASH}</div>}
                {c.top.map((row, i) =>
                  row.you ? (
                    <div key={i} className={rowSelf}>
                      <span className='min-w-0 wrap-anywhere'>{youLabel(club, row.rank, row.name)}</span>
                      <span className='shrink-0'>{pts(club, row.p)}</span>
                    </div>
                  ) : (
                    <div key={i} className='border-border flex justify-between gap-3 border-t pt-2'>
                      <span className='min-w-0 wrap-anywhere'>
                        {t('club.community.boardRow', { rank: n(row.rank), name: row.name })}
                      </span>
                      <span className='shrink-0'>{pts(club, row.p)}</span>
                    </div>
                  ),
                )}
                {own === undefined && ranked && e !== undefined && (
                  <>
                    <div className='text-text-faint py-0.5'>…</div>
                    <div className={rowSelf}>
                      <span className='min-w-0 wrap-anywhere'>{youLabel(club, e.rank ?? 0, ownName)}</span>
                      <span className='shrink-0'>{pts(club, e.p)}</span>
                    </div>
                  </>
                )}
              </div>
              <span className='text-text-faint text-label'>{t('club.community.boardNote')}</span>
            </section>

            <section className={boxTight}>
              <div className='flex flex-wrap items-baseline justify-between gap-3'>
                <h2 className={heading}>{t('club.community.profileTitle')}</h2>
                <span className='text-text-faint text-label'>{t('club.community.profileSource')}</span>
              </div>
              <div className='grid grid-cols-3 gap-[10px]'>
                {[
                  {
                    label: t('club.community.profileLevel'),
                    value:
                      profile?.level === undefined || profile.level === 0
                        ? DASH
                        : t('club.community.profileLevelValue', { level: n(profile.level) }),
                  },
                  {
                    label: t('club.community.profileStreak'),
                    value:
                      profile?.streak === undefined || profile.level === 0
                        ? DASH
                        : plural(club, 'club.community.profileStreakValue', profile.streak, {
                            days: n(profile.streak),
                          }),
                  },
                  { label: t('club.community.profileActive'), value: DASH },
                ].map((tile) => (
                  <div key={tile.label} className='bg-surface-raised rounded-input flex flex-col p-3'>
                    <span className='text-text-muted text-label'>{tile.label}</span>
                    <strong className='num'>{tile.value}</strong>
                  </div>
                ))}
              </div>
              {profile !== undefined && profile.badges.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {profile.badges.map((badge) => (
                    <span key={badge} className='border-border-control text-label rounded-full border px-3 py-1'>
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              <a className={linkClass + ' text-small'} href={LIMZO_URL} target='_blank' rel='noopener noreferrer'>
                {t('club.community.profileStats')}
              </a>
            </section>
          </div>
        </div>
      )}

      <HowItWorks club={club} />
    </div>
  )
})

export default CommunityTab
