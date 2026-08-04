import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
// TokenStats is an interface, so it must be a type-only import: a value import compiles but has
// no runtime binding, which breaks island hydration in dev.
import { formatCompact1Fraction, formatUsdPrice, type Model, type StatsRange, type TokenStats } from './Model'
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

const SectionHeading = ({ title }: { title: string }) => (
  <div className='mx-auto mt-8 flex max-w-5xl flex-row items-center gap-4 px-4'>
    <div className='bg-c1 dark:bg-c2 h-px grow' />
    <p className='text-lg font-bold'>{title}</p>
    <div className='bg-c1 dark:bg-c2 h-px grow' />
  </div>
)

interface TileProps {
  label: string
  tooltip: string
  value?: string
}

const Tile = ({ label, tooltip, value }: TileProps) => (
  <div className='my-4 flex flex-col items-center gap-2'>
    <div className='relative flex flex-row items-center'>
      <p>{label}</p>
      <img src='/images/app/question.svg' tabIndex={0} className='peer ml-1 w-4 dark:hidden' />
      <img src='/images/app/question-dark.svg' tabIndex={0} className='peer ml-1 hidden w-4 dark:block' />
      <p className='bg-lightblue text-blue absolute top-6 left-1/2 z-10 hidden w-52 -translate-x-1/2 rounded-lg p-4 text-xs font-normal shadow-xl peer-hover:block peer-focus:block'>
        {tooltip}
      </p>
    </div>
    <p className='text-xl font-bold'>{value}</p>
  </div>
)

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
    <div className='mx-auto mt-6 flex max-w-lg flex-row items-center justify-start px-4 lg:justify-center'>
      <p className='text-lg font-bold'>{title}</p>
    </div>
    <div className='dark:bg-dark-800 m-4 rounded-2xl bg-white p-6 shadow-sm'>
      <Row label='Price' value={stats.price} />
      <Row label='24h change' value={stats.change24h} accent={stats.isChangePositive ? 'up' : 'down'} />
      <Row label='Market cap' value={stats.marketCap} />
      <Row label='Total volume' value={stats.totalVolume} />
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

  // Opening the page refreshes the gauge figures; the charts store busts its cache on creation,
  // so both data sources are fresh on every visit without a manual Refresh button.
  useEffect(() => {
    model.loadHipoGauge()
    return () => chartsStore.dispose()
  }, [model, chartsStore])

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
      <p className='mt-4 px-8 text-center text-3xl font-bold'>Statistics</p>
      <p className='mt-2 mb-4 px-2 text-center'>Live protocol and market figures.</p>

      <SectionHeading title='Protocol' />

      <div className='mx-auto max-w-5xl text-sm font-medium'>
        <div className='dark:bg-dark-800 m-4 rounded-2xl bg-white p-6 shadow-sm'>
          <div className={'grid grid-cols-1 ' + (model.isMainnet ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
            <Tile
              label='APY'
              tooltip='Your yearly earnings based on recent staking rewards.'
              value={model.statsApyFormatted}
            />
            <Tile label='Staked' tooltip='Total GRAM currently staked in Hipo.' value={model.statsStakedFormatted} />
            {/* Holders comes only from the gauge, which serves mainnet — there is no contract
                getter to fall back to, so the tile is dropped rather than shown as mainnet data
                under a testnet badge. */}
            {model.isMainnet && (
              <Tile
                label='Holders'
                tooltip='The number of wallets holding the hGRAM token.'
                value={model.statsHoldersFormatted}
              />
            )}
          </div>
        </div>
      </div>

      {model.isMainnet && (
        <>
          <SectionHeading title='Market' />

          {/* 3-across only from lg — at md the thirds are ~245px and the label/value pairs
              inside the cards end up nearly touching. */}
          <div className='grid grid-cols-1 lg:grid-cols-3'>
            {model.hgramStats != null && <Section title='hGRAM' stats={model.hgramStats} showSupply showHolders />}
            {model.hpoStats != null && <Section title='HPO' stats={model.hpoStats} showHolders />}
            {model.gramStats != null && <Section title='GRAM' stats={model.gramStats} />}
          </div>

          <SectionHeading title='History' />

          <div className='mx-auto mt-4 flex max-w-5xl flex-row justify-center px-4'>
            <RangeSelector value={model.statsRange} onChange={model.setStatsRange} />
          </div>

          <div className='mx-auto max-w-5xl'>
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

      <div className='mt-8 flex flex-row justify-center'>
        <a href='https://stats.hipo.finance' target='hipo_stats' className='text-blue text-sm'>
          More Stats
        </a>
      </div>
    </div>
  )
})

export default StatsPage
