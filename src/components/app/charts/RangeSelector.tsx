import { type StatsRange } from '../Model'
import { STATS_RANGES } from './prometheus'

interface Props {
  value: StatsRange
  onChange: (range: StatsRange) => void
}

const RangeSelector = ({ value, onChange }: Props) => (
  <div
    className='border-c1 dark:border-c2 inline-flex flex-row rounded-xl border p-1 text-sm'
    role='group'
    aria-label='Chart range'
  >
    {STATS_RANGES.map((range) => (
      <button
        key={range}
        type='button'
        aria-pressed={range === value}
        className={
          'cursor-pointer rounded-lg px-3 py-1 ' +
          (range === value ? 'bg-orange text-white' : 'text-brown dark:text-dark-50')
        }
        onClick={() => onChange(range)}
      >
        {range}
      </button>
    ))}
  </div>
)

export default RangeSelector
