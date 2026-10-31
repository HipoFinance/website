// The per-level leaderboard, a section of Overview (SPEC §5; 2b clubleaderboard). Other rows carry a
// rank, a name, a band and (when the server's switch is on) growth as a 5-point band ("+20–25%") —
// never a balance; only the member's own row has its holdings and its exact growth.
import { observer } from 'mobx-react-lite'
import type { ClubBoardRow } from './api.ts'
import type { ClubModel } from './ClubModel.ts'
import { Card, CardTitle } from './ui.tsx'

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
  return (
    <Card>
      <CardTitle>{t('club.board.title', { level: club.level(level) })}</CardTitle>
      <p className='text-text-muted text-sm'>
        {t(by === 'growth' ? 'club.board.subtitleGrowth' : 'club.board.subtitle')}
      </p>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='bg-surface-deep flex rounded-full p-1 text-sm' role='group'>
          {(['hpo', 'growth'] as const).map((value) => (
            <button
              key={value}
              type='button'
              aria-pressed={by === value}
              className={
                'min-h-9 cursor-pointer rounded-full px-3 ' +
                (by === value ? 'bg-surface text-text font-semibold' : 'text-text-muted')
              }
              onClick={() => void club.loadBoard(level, value)}
            >
              {t(value === 'hpo' ? 'club.board.byHpo' : 'club.board.byGrowth')}
            </button>
          ))}
        </div>
        <label className='text-text-muted flex items-center gap-2 text-sm'>
          {t('club.board.levelPicker')}
          <select
            className='bg-surface-deep border-border text-text min-h-9 rounded-lg border px-2'
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
      {rows.length === 0 && board?.clubLevel === level ? (
        <p className='text-text-muted text-sm'>{t('club.board.empty', { level: club.level(level) })}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[300px] text-sm'>
            <thead className='text-text-faint'>
              <tr>
                <th className='w-10 py-1.5 text-start font-medium'>#</th>
                <th className='py-1.5 text-start font-medium'>{t('club.board.colMember')}</th>
                <th className='py-1.5 text-start font-medium'>{t('club.board.colBand')}</th>
                {showGrowth && <th className='py-1.5 text-end font-medium'>{t('club.board.colGrowth')}</th>}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row, i) => (
                <tr key={i} className='border-border border-t'>
                  <td className='num py-1.5'>{club.amount(row.rank, 0)}</td>
                  <td className='max-w-[12rem] truncate py-1.5 pe-3'>{row.name}</td>
                  <td className='py-1.5 pe-3 whitespace-nowrap'>{band(row.band)}</td>
                  {showGrowth && <td className='num py-1.5 text-end whitespace-nowrap'>{growth(row)}</td>}
                </tr>
              ))}
              {me !== undefined && (
                <tr className='border-border text-accent border-t font-semibold'>
                  <td className='num py-1.5'>{club.amount(me.rank, 0)}</td>
                  <td className='py-1.5 pe-3'>
                    {t('club.board.you', { name: me.name, holdings: club.whole(me.holdings) })}
                  </td>
                  <td className='py-1.5 pe-3 whitespace-nowrap'>{band(me.band)}</td>
                  {showGrowth && <td className='num py-1.5 text-end whitespace-nowrap'>{growth(me)}</td>}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {hidden !== undefined && <p className='text-text-muted text-sm'>{hidden}</p>}
      <div className='border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3'>
        <p className='text-text-faint min-w-0 flex-1 text-xs'>{t('club.board.names')}</p>
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
