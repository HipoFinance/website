import { observer } from 'mobx-react-lite'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
// TokenStats is an interface, so it must be a type-only import: a value import compiles but has
// no runtime binding, which breaks island hydration in dev.
import { formatCompact1Fraction, formatUsdPrice, type Model, type StatsRange, type TokenStats } from './Model'
import Stats from './Stats.tsx'
import { ChartsStore } from './charts/ChartsStore'
import LineChart, { type ChartSeriesInput } from './charts/LineChart'
import RangeSelector from './charts/RangeSelector'

interface Props {
  model: Model
}

interface RowProps {
  label: string
  value?: string
  accent?: 'up' | 'down'
}

const Row = ({ label, value, accent }: RowProps) => (
  <div className='my-4 flex flex-row'>
    <p>{label}</p>
    <p className={'ml-auto' + (accent === 'up' ? ' text-green-600' : '') + (accent === 'down' ? ' text-orange' : '')}>
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
  <div className='mx-auto w-full max-w-lg text-sm font-medium'>
    <div className='mx-auto flex max-w-lg flex-row items-center px-4'>
      <p className='text-lg font-bold'>{title}</p>
    </div>
    <div className='dark:bg-dark-800 m-4 rounded-2xl bg-white p-6 shadow-sm'>
      <Row label='Price' value={stats.price} />
      <Row label='24h change' value={stats.change24h} accent={stats.isChangePositive ? 'up' : 'down'} />
      <Row label='Market cap' value={stats.marketCap} />
      <Row label='24h volume' value={stats.volume24h} />
      {showHolders && <Row label='Holders' value={stats.holders} />}
      {showSupply && <Row label='Circulating supply' value={stats.supply} />}
    </div>
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

  useEffect(() => {
    return () => chartsStore.dispose()
  }, [chartsStore])

  const range = model.statsRange
  const xTickFormat = (ts: number) => formatXTick(range, ts)

  const apySeries: ChartSeriesInput[] = [
    { key: 'apy', name: 'APY', color: 'var(--chart-hgram)', points: chartsStore.series?.hipo_treasury_apy ?? [] },
  ]
  const stakedSeries: ChartSeriesInput[] = [
    {
      key: 'staked',
      name: 'Staked',
      color: 'var(--chart-hgram)',
      points: chartsStore.series?.hipo_treasury_total_coins ?? [],
    },
  ]
  const holdersSeries: ChartSeriesInput[] = [
    {
      key: 'holders',
      name: 'hGRAM holders',
      color: 'var(--chart-hgram)',
      points: chartsStore.series?.hipo_hton_holders_count ?? [],
    },
  ]
  const priceSeries: ChartSeriesInput[] = [
    {
      key: 'hgram',
      name: 'hGRAM',
      color: 'var(--chart-hgram)',
      points: chartsStore.series?.hipo_hton_current_price ?? [],
    },
    { key: 'gram', name: 'GRAM', color: 'var(--chart-gram)', points: chartsStore.series?.hipo_ton_current_price ?? [] },
  ]
  const hpoSeries: ChartSeriesInput[] = [
    { key: 'hpo', name: 'HPO', color: 'var(--chart-hpo)', points: chartsStore.series?.hipo_hpo_current_price ?? [] },
  ]

  return (
    <div className='font-body text-brown dark:text-dark-50 mx-auto w-full max-w-5xl p-4 pb-32'>
      <p className='px-8 pt-4 text-center text-3xl font-bold'>Statistics</p>
      <p className='mt-2 mb-4 px-8 text-center'>Live protocol and market figures.</p>

      <div className='mx-auto mb-4 flex max-w-3xl flex-row flex-wrap items-center justify-between gap-4 px-4'>
        <RangeSelector value={model.statsRange} onChange={model.setStatsRange} />
        <button
          className='border-c1 dark:border-c2 flex cursor-pointer flex-row items-center gap-2 rounded-xl border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60'
          disabled={model.isGaugeRefreshing}
          onClick={() => {
            model.loadHipoGauge()
            chartsStore.refresh()
          }}
        >
          <RefreshCw className={'size-4' + (model.isGaugeRefreshing ? ' animate-spin' : '')} />
          {model.isGaugeRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className='mx-auto max-w-3xl px-4'>
        <p className='text-lg font-bold'>Protocol</p>
      </div>

      <Stats model={model} />

      {model.isMainnet && (
        <div className='mx-auto max-w-3xl'>
          <LineChart
            title='APY'
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
            title='Staked'
            series={stakedSeries}
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
            title='hGRAM holders'
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
        </div>
      )}

      {model.isMainnet && (
        <>
          <div className='mx-auto mt-8 max-w-3xl px-4'>
            <p className='text-lg font-bold'>Market</p>
          </div>

          <div className='mx-auto max-w-3xl'>
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

          {/* 3-across only from lg — at md the thirds are ~245px and the label/value pairs
              inside the cards end up nearly touching. */}
          <div className='mt-8 grid grid-cols-1 lg:grid-cols-3'>
            {model.hgramStats != null && <Section title='hGRAM' stats={model.hgramStats} showSupply showHolders />}
            {model.hpoStats != null && <Section title='HPO' stats={model.hpoStats} showHolders />}
            {model.gramStats != null && <Section title='GRAM' stats={model.gramStats} />}
          </div>
        </>
      )}

      {/* The gauge endpoint takes no network parameter and serves mainnet figures, so there is
          nothing truthful to show here on testnet — same reason charts are mainnet-only, since
          Prometheus only scrapes the mainnet gauge. */}
      {!model.isMainnet && (
        <p className='mx-auto max-w-lg px-8 text-center text-sm'>
          Market data and history charts are available on mainnet only. The figures above are read from the testnet
          contract.
        </p>
      )}
    </div>
  )
})

export default StatsPage
