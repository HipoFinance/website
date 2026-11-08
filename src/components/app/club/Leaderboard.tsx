// The per-level leaderboard, a section of Overview (SPEC §5; 2b clubleaderboard). Other rows carry a
// rank, a name, a band and (when the server's switch is on) growth as a 5-point band ("+20–25%") —
// never a balance; only the member's own row has its holdings and its exact growth.
import { observer } from 'mobx-react-lite'
import { Trophy } from 'lucide-react'
import type { ClubBoardRow } from './api.ts'
import type { ClubModel } from './ClubModel.ts'
import { Card, Pill, Pills, rowSelf, tableRow, tableTd, tableTh } from './ui.tsx'

interface Props {
  club: ClubModel
}

const Leaderboard = observer(({ club }: Props) => {
  const t = club.t
  const o = club.overview
  if (o === undefined) {
    return null
  }
  const level = club.boardLevel ?? o.clubLevel
  const board = club.board
  const by = club.boardBy
  const rows = board?.clubLevel === level ? board.rows : []
  const me = board?.clubLevel === level ? board.me : undefined
  const showGrowth = rows.some((row) => row.growth !== undefined || row.growthBand !== undefined)
  const rank = o.rank
  let hidden: string | undefined
  if (level === o.clubLevel && !rank.listed) {
    hidden = t(
      'club.board.why.' +
        (rank.why === 'no_claim'
          ? 'noClaim'
          : rank.why === 'no_wallet'
            ? 'noWallet'
            : rank.why === 'not_ranked'
              ? 'notRanked'
              : 'suspended'),
      {
        level: club.level(level),
      },
    )
  }
  const band = (value?: number) => (value ? t('club.board.band', { band: club.amount(value, 0) }) : '—')
  const signed = (value: number, digits: number) => club.signed(value, digits)
  // A band's end: signed, except 0.
  const end = (value: number) => (value === 0 ? club.amount(0, 0) : signed(value, 0))
  // The own row's exact figure, or another row's band: "+20% to +25%", "+100%+", "−10% to −5%".
  const growth = (row: ClubBoardRow) => {
    if (row.growth !== undefined) {
      return signed(row.growth, 1) + '%'
    }
    const band = row.growthBand
    if (band === undefined) {
      return '—'
    }
    if (band.high === undefined) {
      return t('club.board.growthOver', { low: signed(band.low, 0) })
    }
    return t('club.board.growthBand', { low: end(band.low), high: end(band.high) })
  }
  // Positive growth reads green: an exact figure above 0, or a band that starts above 0.
  const positive = (row: ClubBoardRow) =>
    row.growth !== undefined ? row.growth > 0 : row.growthBand !== undefined && row.growthBand.low > 0
  const growthCell = (row: ClubBoardRow) =>
    tableTd + ' num text-end whitespace-nowrap' + (positive(row) ? ' text-tone-success-fg' : '')
  const top = rows.slice(0, 10)
  const last = top.at(-1)?.rank
  // A "…" row when the own row does not follow straight on from the top rows.
  const gap = me !== undefined && last !== undefined && me.rank !== undefined && me.rank > last + 1
  const thEnd = tableTh.replace('text-start', 'text-end')
  return (
    <Card>
      <div className='flex min-w-0 flex-wrap items-center justify-between gap-4'>
        <div className='flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5'>
          <h2 className='font-fredoka flex items-center gap-2.5 text-xl font-semibold'>
            <Trophy size={20} strokeWidth={1.8} className='text-text-muted shrink-0' aria-hidden='true' />
            {t('club.board.title', { level: club.level(level) })}
          </h2>
          <p className='text-text-muted text-sm leading-normal'>
            {t(by === 'growth' ? 'club.board.subtitleGrowth' : 'club.board.subtitle')}
          </p>
        </div>
        <div className='flex min-w-0 flex-wrap items-center gap-2'>
          <Pills label={t('club.board.title', { level: club.level(level) })}>
            {(['hpo', 'growth'] as const).map((value) => (
              <Pill key={value} active={by === value} onClick={() => void club.loadBoard(level, value)}>
                {t(value === 'hpo' ? 'club.board.byHpo' : 'club.board.byGrowth')}
              </Pill>
            ))}
          </Pills>
          <label className='text-text-muted flex items-center gap-2 text-[15px]'>
            {t('club.board.levelPicker')}
            <select
              className='bg-surface-raised border-border-strong text-text min-h-10 rounded-[10px] border px-2.5 py-2'
              value={level}
              onChange={(e) => void club.loadBoard(Number(e.target.value), by)}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i}>
                  {i === o.clubLevel ? t('club.board.levelYours', { level: club.level(i) }) : club.level(i)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {hidden !== undefined ? (
        <p className='text-text-secondary text-[15px] leading-normal'>{hidden}</p>
      ) : rows.length === 0 && board?.clubLevel === level ? (
        <p className='text-text-muted text-sm'>{t('club.board.empty', { level: club.level(level) })}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[300px] border-collapse'>
            <thead>
              <tr>
                <th className={tableTh + ' w-10'}>#</th>
                <th className={tableTh}>{t('club.board.colMember')}</th>
                <th className={tableTh}>{t('club.board.colBand')}</th>
                {showGrowth && <th className={thEnd}>{t('club.board.colGrowth')}</th>}
              </tr>
            </thead>
            <tbody>
              {top.map((row, i) => (
                <tr key={i} className={tableRow}>
                  <td className={tableTd + ' num'}>{club.amount(row.rank, 0)}</td>
                  <td className={tableTd + ' max-w-[12rem] truncate'}>{row.name}</td>
                  <td className={tableTd + ' whitespace-nowrap'}>{band(row.band)}</td>
                  {showGrowth && <td className={growthCell(row)}>{growth(row)}</td>}
                </tr>
              ))}
              {gap && (
                <tr className={tableRow} aria-hidden='true'>
                  <td className={tableTd + ' text-text-muted'}>…</td>
                  <td className={tableTd}></td>
                  <td className={tableTd}></td>
                  {showGrowth && <td className={tableTd}></td>}
                </tr>
              )}
              {me !== undefined && (
                <tr className={tableRow + ' ' + rowSelf}>
                  <td className={tableTd + ' num'}>{club.amount(me.rank, 0)}</td>
                  <td className={tableTd}>
                    {t('club.board.you', { name: me.name, holdings: club.whole(me.holdings) })}
                  </td>
                  <td className={tableTd + ' whitespace-nowrap'}>{band(me.band)}</td>
                  {showGrowth && <td className={growthCell(me)}>{growth(me)}</td>}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className='border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3'>
        <p className='text-text-faint min-w-0 flex-1 text-[13px] leading-normal'>{t('club.board.names')}</p>
        <label className='flex items-center gap-2 text-sm'>
          <input
            type='checkbox'
            className='size-4 accent-[var(--color-accent-fill)]'
            checked={o.settings.hideName}
            onChange={(e) => void club.setSetting({ hide_name: e.target.checked })}
          />
          {t('club.board.hideName')}
        </label>
      </div>
    </Card>
  )
})

export default Leaderboard
