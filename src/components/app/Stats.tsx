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
    <p className={'font-fredoka text-2xl font-semibold ' + (accent === true ? 'text-accent' : 'text-text')}>
      {value ?? '—'}
    </p>
    <p className='text-text-muted text-sm' title={tooltip}>
      {label}
    </p>
  </div>
)

const Stats = observer(({ model }: Props) => {
  return (
    <div className='font-body text-text mx-auto w-full max-w-[1120px] px-6 pb-12'>
      <div className='mx-auto w-full max-w-[480px]'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <Tile
            label='APY, last round'
            tooltip='Your yearly earnings based on recent staking rewards.'
            value={model.statsApyFormatted}
            accent
          />
          <Tile label='GRAM staked' tooltip='Total GRAM currently staked in Hipo.' value={model.statsStakedCompact} />
          <Tile
            label='hGRAM holders'
            tooltip='The number of wallets holding the hGRAM token.'
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
            More stats →
          </button>
        </div>
      </div>
    </div>
  )
})

export default Stats
