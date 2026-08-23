import { observer } from 'mobx-react-lite'
import { Model } from './Model'

interface Props {
  model: Model
}

interface TileProps {
  label: string
  tooltip: string
  value?: string
  accent?: boolean
}

// Compact echo of the Stats page's cards, shown under the stake form. The explanatory copy that
// used to sit behind a question-mark bubble is carried by the title attribute here; the full
// tooltips live on the Stats page.
const Tile = ({ label, tooltip, value, accent }: TileProps) => (
  <div className='border-border bg-surface rounded-[20px] border px-5 py-4'>
    <p className={'font-fredoka num text-2xl font-semibold ' + (accent === true ? 'text-accent' : 'text-text')}>
      {value ?? '—'}
    </p>
    <p className='text-text-muted text-sm' title={tooltip}>
      {label}
    </p>
  </div>
)

const Stats = observer(({ model }: Props) => {
  const t = model.t
  return (
    <div className='font-body text-text mx-auto w-full max-w-[1120px] px-6 pb-12'>
      <div className='mx-auto w-full max-w-[480px]'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <Tile
            label={t('app.stats.apyLastRound')}
            tooltip={t('app.stats.apyTooltip')}
            value={model.statsApyFormatted}
            accent
          />
          <Tile
            label={t('app.stats.gramStaked')}
            tooltip={t('app.stats.gramStakedTooltip')}
            value={model.statsStakedCompact}
          />
          <Tile
            label={t('app.stats.hgramHolders')}
            tooltip={t('app.stats.hgramHoldersTooltip')}
            value={model.statsHoldersFormatted}
          />
        </div>

        <div className='mt-4 flex flex-row justify-center'>
          <button
            className='text-text-faint hover:text-accent cursor-pointer text-[13px]'
            onClick={() => {
              model.navigateToPage('stats')
            }}
          >
            {t('app.stats.moreStats')} <span className='inline-block rtl:-scale-x-100'>→</span>
          </button>
        </div>
      </div>
    </div>
  )
})

export default Stats
