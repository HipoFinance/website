import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
// TokenStats is an interface, so it must be a type-only import: a value import compiles but has
// no runtime binding, which breaks island hydration in dev.
import { formatCompact1Fraction, formatUsdPrice, type Model, type StatsRange, type TokenStats } from './Model'
import { ChartsStore } from './charts/ChartsStore'
import LineChart, { type ChartSeriesInput } from './charts/LineChart'
import RangeSelector from './charts/RangeSelector'
import { computeDelta, type Delta } from './charts/delta'
import type { ChartPoint } from './charts/prometheus'

interface Props {
  model: Model
}

// Line colors come from the @theme tokens so the charts stay in step with the rest of the app.
const accentColor = 'var(--color-accent)'
const positiveColor = 'var(--color-positive)'
const inkColor = 'var(--color-text)'
const accentAreaFill = 'rgba(255,126,115,.12)'

interface StatCardProps {
  value?: string
  label: string
  caption?: string
  accent?: boolean
  delta?: Delta
  rangeLabel: string
}

// A delta is rendered only when it could actually be computed from the history already fetched
// for the selected range; otherwise the line is omitted rather than invented.
const StatCard = ({ value, label, caption, accent, delta, rangeLabel }: StatCardProps) => (
  <div className='border-border bg-surface rounded-[20px] border px-6 py-5'>
    <div className={'font-fredoka text-[30px] font-semibold ' + (accent === true ? 'text-accent' : 'text-text')}>
      {value ?? '—'}
    </div>
    <div className='text-text-muted text-sm'>{label}</div>
    {delta != null && delta.direction !== 'flat' ? (
      <div className={'pt-1 text-[13px] font-medium ' + (delta.direction === 'up' ? 'text-positive' : 'text-accent')}>
        {(delta.direction === 'up' ? '▲ ' : '▼ ') + delta.text} over {rangeLabel}
      </div>
    ) : (
      caption != null && <div className='text-text-faint pt-1 text-[13px] font-medium'>{caption}</div>
    )}
  </div>
)

interface RowProps {
  label: string
  value?: string
  accent?: 'up' | 'down'
}

const Row = ({ label, value, accent }: RowProps) => (
  <div className='flex flex-row'>
    <p>{label}</p>
    <p
      className={
        'ml-auto font-medium ' + (accent === 'up' ? 'text-positive' : accent === 'down' ? 'text-accent' : 'text-text')
      }
    >
      {value ?? '—'}
    </p>
  </div>
)

interface SectionProps {
  title: string
  stats: TokenStats
  showSupply?: boolean
  showHolders?: boolean
}

const Section = ({ title, stats, showSupply, showHolders }: SectionProps) => (
  <div className='border-border bg-surface text-text-muted flex flex-col gap-2.5 rounded-[20px] border p-6 text-sm'>
    <p className='font-fredoka text-text pb-1 text-[18px] font-semibold'>{title}</p>
    <Row label='Price' value={stats.price} />
    <Row label='24h change' value={stats.change24h} accent={stats.isChangePositive ? 'up' : 'down'} />
    <Row label='Market cap' value={stats.marketCap} />
    <Row label='Total volume' value={stats.totalVolume} />
    {showHolders === true && <Row label='Holders' value={stats.holders} />}
    {showSupply === true && <Row label='Circulating supply' value={stats.supply} />}
  </div>
)

function formatApy(v: number): string {
  return (v / 100).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 })
}

function formatCompactCount(v: number): string {
  return formatCompact1Fraction(v)
}

function formatStakedValue(v: number): string {
  return formatCompact1Fraction(v) + ' GRAM'
}

function formatXTick(range: StatsRange, ts: number): string {
  const date = new Date(ts * 1000)
  if (range === '24h') {
    return date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (range === '7d') {
    return date.toLocaleDateString(navigator.language, { weekday: 'short', day: 'numeric' })
  }
  if (range === '30d' || range === '90d') {
    return date.toLocaleDateString(navigator.language, { day: 'numeric', month: 'short' })
  }
  return date.toLocaleDateString(navigator.language, { month: 'short' })
}

function formatTooltipTime(ts: number): string {
  return new Date(ts * 1000).toLocaleString(navigator.language, { dateStyle: 'medium', timeStyle: 'short' })
}

const StatsPage = observer(({ model }: Props) => {
  const [chartsStore] = useState(() => new ChartsStore(model))

  // Opening the page refreshes the gauge figures; the charts store busts its cache on creation,
  // so both data sources are fresh on every visit without a manual Refresh button.
  useEffect(() => {
    model.loadHipoGauge()
    return () => chartsStore.dispose()
  }, [model, chartsStore])

  const range = model.statsRange
  const xTickFormat = (ts: number) => formatXTick(range, ts)

  const stakedPoints: ChartPoint[] = chartsStore.series?.hipo_treasury_total_coins ?? []
  const holdersPoints: ChartPoint[] = chartsStore.series?.hipo_hton_holders_count ?? []
  const hasHistory = chartsStore.status === 'done' || chartsStore.status === 'refreshing'

  const apySeries: ChartSeriesInput[] = [
    { key: 'apy', name: 'APY', color: positiveColor, points: chartsStore.series?.hipo_treasury_apy ?? [] },
  ]
  const stakedSeries: ChartSeriesInput[] = [{ key: 'staked', name: 'Staked', color: accentColor, points: stakedPoints }]
  const holdersSeries: ChartSeriesInput[] = [
    { key: 'holders', name: 'hGRAM holders', color: inkColor, points: holdersPoints },
  ]
  const priceSeries: ChartSeriesInput[] = [
    { key: 'hgram', name: 'hGRAM', color: accentColor, points: chartsStore.series?.hipo_hton_current_price ?? [] },
    { key: 'gram', name: 'GRAM', color: inkColor, points: chartsStore.series?.hipo_ton_current_price ?? [] },
  ]
  const hpoSeries: ChartSeriesInput[] = [
    { key: 'hpo', name: 'HPO', color: positiveColor, points: chartsStore.series?.hipo_hpo_current_price ?? [] },
  ]

  const tvlLabel =
    model.statsTvlUsdFormatted != null ? 'GRAM staked (TVL) · ' + model.statsTvlUsdFormatted : 'GRAM staked (TVL)'

  return (
    <div className='font-body text-text mx-auto w-full max-w-[1180px] px-6 pt-6 pb-8 sm:px-12'>
      <div className='flex flex-row flex-wrap items-baseline justify-between gap-3 pb-7'>
        <div>
          <h1 className='font-fredoka mb-1.5 text-3xl font-semibold sm:text-[44px]'>Hipo stats</h1>
          <p className='text-text-muted text-base'>Live protocol metrics, straight from the chain.</p>
        </div>
        <RangeSelector value={model.statsRange} onChange={model.setStatsRange} />
      </div>

      <div className='grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          value={model.statsStakedCompact}
          label={tvlLabel}
          delta={hasHistory ? computeDelta(stakedPoints, '%') : undefined}
          rangeLabel={chartsStore.rangeLabel}
        />
        <StatCard
          value={model.statsApyFormatted}
          label='APY, last round'
          caption={model.protocolFee != null ? 'Protocol fee ' + model.protocolFee : undefined}
          accent
          rangeLabel={chartsStore.rangeLabel}
        />
        <StatCard
          value={model.statsHoldersFormatted}
          label='Active stakers'
          delta={hasHistory ? computeDelta(holdersPoints, '%') : undefined}
          rangeLabel={chartsStore.rangeLabel}
        />
        <StatCard
          value={model.statsRateFormatted}
          label='hGRAM / GRAM rate'
          caption='only goes up'
          rangeLabel={chartsStore.rangeLabel}
        />
      </div>

      {(model.hgramStats != null || model.hpoStats != null || model.gramStats != null) && (
        <div className='grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3'>
          {model.hgramStats != null && <Section title='hGRAM' stats={model.hgramStats} showSupply showHolders />}
          {model.hpoStats != null && <Section title='HPO' stats={model.hpoStats} showHolders />}
          {model.gramStats != null && <Section title='GRAM' stats={model.gramStats} />}
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <LineChart
          title='Total value locked'
          series={stakedSeries}
          areaFill={accentAreaFill}
          status={chartsStore.status}
          domainStart={chartsStore.domainStart}
          domainEnd={chartsStore.domainEnd}
          maxGapSeconds={chartsStore.maxGapSeconds}
          valueFormat={formatStakedValue}
          axisFormat={formatCompactCount}
          deltaUnit='%'
          rangeLabel={chartsStore.rangeLabel}
          xTickFormat={xTickFormat}
          tooltipTimeFormat={formatTooltipTime}
          hoveredTs={chartsStore.hoveredTs}
          onHover={chartsStore.setHoveredTs}
          onRetry={chartsStore.retry}
        />
        <LineChart
          title='APY per round'
          series={apySeries}
          status={chartsStore.status}
          domainStart={chartsStore.domainStart}
          domainEnd={chartsStore.domainEnd}
          maxGapSeconds={chartsStore.maxGapSeconds}
          stepped
          valueFormat={formatApy}
          deltaUnit='pp'
          rangeLabel={chartsStore.rangeLabel}
          xTickFormat={xTickFormat}
          tooltipTimeFormat={formatTooltipTime}
          hoveredTs={chartsStore.hoveredTs}
          onHover={chartsStore.setHoveredTs}
          onRetry={chartsStore.retry}
        />
        <LineChart
          title='Active stakers'
          series={holdersSeries}
          status={chartsStore.status}
          domainStart={chartsStore.domainStart}
          domainEnd={chartsStore.domainEnd}
          maxGapSeconds={chartsStore.maxGapSeconds}
          valueFormat={formatCompactCount}
          deltaUnit='%'
          rangeLabel={chartsStore.rangeLabel}
          xTickFormat={xTickFormat}
          tooltipTimeFormat={formatTooltipTime}
          hoveredTs={chartsStore.hoveredTs}
          onHover={chartsStore.setHoveredTs}
          onRetry={chartsStore.retry}
        />
        <LineChart
          title='hGRAM & GRAM price'
          series={priceSeries}
          status={chartsStore.status}
          domainStart={chartsStore.domainStart}
          domainEnd={chartsStore.domainEnd}
          maxGapSeconds={chartsStore.maxGapSeconds}
          valueFormat={formatUsdPrice}
          deltaUnit='%'
          rangeLabel={chartsStore.rangeLabel}
          xTickFormat={xTickFormat}
          tooltipTimeFormat={formatTooltipTime}
          hoveredTs={chartsStore.hoveredTs}
          onHover={chartsStore.setHoveredTs}
          onRetry={chartsStore.retry}
        />
        <LineChart
          title='HPO price'
          series={hpoSeries}
          status={chartsStore.status}
          domainStart={chartsStore.domainStart}
          domainEnd={chartsStore.domainEnd}
          maxGapSeconds={chartsStore.maxGapSeconds}
          valueFormat={formatUsdPrice}
          deltaUnit='%'
          rangeLabel={chartsStore.rangeLabel}
          xTickFormat={xTickFormat}
          tooltipTimeFormat={formatTooltipTime}
          hoveredTs={chartsStore.hoveredTs}
          onHover={chartsStore.setHoveredTs}
          onRetry={chartsStore.retry}
        />
      </div>

      <div className='text-text-faint flex flex-row flex-wrap gap-x-6 gap-y-2 pt-6 text-sm'>
        <span>Data refreshes every 5 minutes.</span>
        <a className='text-accent hover:text-accent-hover' href={model.explorerHref} target='hipo_explorer'>
          Treasury on explorer →
        </a>
        <a
          className='text-accent hover:text-accent-hover'
          href='https://github.com/HipoFinance'
          target='_blank'
          rel='noopener noreferrer'
        >
          Source on GitHub →
        </a>
        <a className='text-accent hover:text-accent-hover' href='https://stats.hipo.finance' target='hipo_stats'>
          More stats →
        </a>
      </div>
    </div>
  )
})

export default StatsPage
