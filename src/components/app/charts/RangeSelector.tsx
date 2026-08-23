import { type StatsRange } from '../Model'
import { RANGE_LABEL_KEYS, STATS_RANGES } from './prometheus'

interface Props {
  value: StatsRange
  onChange: (range: StatsRange) => void
  // Catalog lookup (model.t); the observer parent re-renders this on a locale change.
  t: (key: string) => string
}

const RangeSelector = ({ value, onChange, t }: Props) => (
  <div
    className='border-border bg-surface inline-flex flex-row gap-1.5 rounded-full border p-1 text-[13px] font-semibold'
    role='group'
    aria-label={t('app.chart.rangeGroup')}
  >
    {STATS_RANGES.map((range) => (
      <button
        key={range}
        type='button'
        aria-pressed={range === value}
        className={
          'num cursor-pointer rounded-full px-3.5 py-1.5 ' +
          (range === value ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-accent')
        }
        onClick={() => onChange(range)}
      >
        {t(RANGE_LABEL_KEYS[range])}
      </button>
    ))}
  </div>
)

export default RangeSelector
