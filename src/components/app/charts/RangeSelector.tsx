import { type StatsRange } from '../Model'
import { RANGE_LABELS, STATS_RANGES } from './prometheus'

interface Props {
  value: StatsRange
  onChange: (range: StatsRange) => void
}

const RangeSelector = ({ value, onChange }: Props) => (
  <div
    className='border-border bg-surface inline-flex flex-row gap-1.5 rounded-full border p-1 text-[13px] font-semibold'
    role='group'
    aria-label='Chart range'
  >
    {STATS_RANGES.map((range) => (
      <button
        key={range}
        type='button'
        aria-pressed={range === value}
        className={
          'cursor-pointer rounded-full px-3.5 py-1.5 ' +
          (range === value ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-accent')
        }
        onClick={() => onChange(range)}
      >
        {RANGE_LABELS[range]}
      </button>
    ))}
  </div>
)

export default RangeSelector
