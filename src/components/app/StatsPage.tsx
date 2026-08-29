import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
// TokenStats is an interface, so it must be a type-only import: a value import compiles but has
// no runtime binding, which breaks island hydration in dev.
import { type Model, type StatsRange, type TokenStats } from './Model'
import { ChartsStore } from './charts/ChartsStore'
import LineChart, { type ChartSeriesInput } from './charts/LineChart'
import RangeSelector from './charts/RangeSelector'
import { computeDelta, type Delta } from './charts/delta'
import type { ChartPoint } from './charts/prometheus'
import { nodes } from './Interpolate'

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
  // Already rendered for this card: `delta` is the formatted "▲ +3.2% over 1W" line (undefined when it
  // could not be computed from the history already fetched, or is flat), `exact` the "exactly …" line.
  delta?: { text: string; direction: 'up' | 'down' }
  exact?: string
}

// A delta is rendered only when it could actually be computed from the history already fetched
// for the selected range; otherwise the line is omitted rather than invented. `exact` is an
// always-shown selectable line under everything else — the precise figure behind the compact
// headline, there to be copied.
const StatCard = ({ value, label, caption, accent, delta, exact }: StatCardProps) => (
  <div className='border-border bg-surface rounded-[20px] border px-6 py-5'>
    <div className={'font-fredoka num text-[30px] font-semibold ' + (accent === true ? 'text-accent' : 'text-text')}>
      {value ?? '—'}
    </div>
    <div className='text-text-muted text-sm'>{label}</div>
    {delta != null ? (
      <div className={'pt-1 text-[13px] font-medium ' + (delta.direction === 'up' ? 'text-positive' : 'text-accent')}>
        {delta.text}
      </div>
    ) : (
      caption != null && <div className='text-text-faint pt-1 text-[13px] font-medium'>{caption}</div>
    )}
    {exact != null && <div className='text-text-faint pt-1 text-[13px]'>{exact}</div>}
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
        'num ms-auto font-medium ' +
        (accent === 'up' ? 'text-positive' : accent === 'down' ? 'text-accent' : 'text-text')
      }
    >
      {value ?? '—'}
    </p>
  </div>
)

interface SectionProps {
  model: Model
  title: string
  stats: TokenStats
  showSupply?: boolean
  showHolders?: boolean
}

const Section = observer(({ model, title, stats, showSupply, showHolders }: SectionProps) => {
  const t = model.t
  return (
    <div className='border-border bg-surface text-text-muted flex flex-col gap-2.5 rounded-[20px] border p-6 text-sm'>
      <p className='font-fredoka text-text pb-1 text-[18px] font-semibold'>{title}</p>
      <Row label={t('app.statsPage.price')} value={stats.price} />
      <Row
        label={t('app.statsPage.change24h')}
        value={stats.change24h}
        accent={stats.isChangePositive ? 'up' : 'down'}
      />
      <Row label={t('app.statsPage.marketCap')} value={stats.marketCap} />
      <Row label={t('app.statsPage.totalVolume')} value={stats.totalVolume} />
      {showHolders === true && <Row label={t('app.statsPage.holders')} value={stats.holders} />}
      {showSupply === true && <Row label={t('app.statsPage.circulatingSupply')} value={stats.supply} />}
    </div>
  )
})

const StatsPage = observer(({ model }: Props) => {
  const [chartsStore] = useState(() => new ChartsStore(model))
  const t = model.t

  // Opening the page refreshes the gauge figures; the charts store busts its cache on creation,
  // so both data sources are fresh on every visit without a manual Refresh button.
  useEffect(() => {
    model.loadHipoGauge()
    return () => chartsStore.dispose()
  }, [model, chartsStore])

  const range = model.statsRange
  const rangeLabel = chartsStore.rangeLabel

  // Every figure goes through the Model's locale-aware wrappers (spec §E), so the charts follow the
  // page locale like the rest of the island: digits, separators, percent placement, compact
  // notation, calendar and time format.
  const formatApy = (v: number) => model.formatPercent(v / 100)
  const formatCompactCount = (v: number) => model.formatCompact(v, 1)
  const formatStakedValue = (v: number) => model.withUnit('app.model.gram', model.formatCompact(v, 1))
  const formatRateValue = (v: number) => model.formatRate(v)
  const formatPrice = (v: number) => model.formatUsdPrice(v)
  const xTickFormat = (ts: number) => formatXTick(model, range, ts)
  const tooltipTimeFormat = (ts: number) => model.formatDate(ts * 1000, { dateStyle: 'medium', timeStyle: 'short' })
  // "+3.2%" / "+0.4 pp": one decimal, explicit sign, as the chart legends always showed.
  const formatDelta = (delta: Delta) => {
    const digits = { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'always' as const }
    if (delta.unit === 'pp') {
      return t('app.chart.deltaPp', { value: model.isolate(model.formatNumber(delta.value, digits)) })
    }
    return model.formatNumber(delta.value / 100, { style: 'percent', ...digits })
  }
  // The stat cards' "▲ +3.2% over 1W" line; nothing for flat or uncomputable.
  const cardDelta = (delta: Delta | undefined) => {
    if (delta == null || delta.direction === 'flat') {
      return undefined
    }
    const text = t('app.statsPage.deltaOver', {
      delta: (delta.direction === 'up' ? '▲ ' : '▼ ') + model.isolate(formatDelta(delta)),
      range: rangeLabel,
    })
    return { text, direction: delta.direction }
  }

  const stakedPoints: ChartPoint[] = chartsStore.series?.hipo_treasury_total_coins ?? []
  const holdersPoints: ChartPoint[] = chartsStore.series?.hipo_hton_holders_count ?? []
  const ratePoints: ChartPoint[] = chartsStore.series?.hipo_treasury_hton_rate ?? []
  const hasHistory = chartsStore.status === 'done' || chartsStore.status === 'refreshing'

  const apySeries: ChartSeriesInput[] = [
    {
      key: 'apy',
      name: t('app.statsPage.seriesApy'),
      color: positiveColor,
      points: chartsStore.series?.hipo_treasury_apy ?? [],
    },
  ]
  const stakedSeries: ChartSeriesInput[] = [
    { key: 'staked', name: t('app.statsPage.seriesStaked'), color: accentColor, points: stakedPoints },
  ]
  const holdersSeries: ChartSeriesInput[] = [
    { key: 'holders', name: t('app.statsPage.seriesHolders'), color: inkColor, points: holdersPoints },
  ]
  const rateSeries: ChartSeriesInput[] = [
    { key: 'rate', name: t('app.statsPage.seriesRate'), color: accentColor, points: ratePoints },
  ]
  const priceSeries: ChartSeriesInput[] = [
    { key: 'hgram', name: 'hGRAM', color: accentColor, points: chartsStore.series?.hipo_hton_current_price ?? [] },
    { key: 'gram', name: 'GRAM', color: inkColor, points: chartsStore.series?.hipo_ton_current_price ?? [] },
  ]
  const hpoSeries: ChartSeriesInput[] = [
    { key: 'hpo', name: 'HPO', color: positiveColor, points: chartsStore.series?.hipo_hpo_current_price ?? [] },
  ]

  const tvlLabel =
    model.statsTvlUsdFormatted != null
      ? t('app.statsPage.tvlLabelWithUsd', { usd: model.isolate(model.statsTvlUsdFormatted) })
      : t('app.statsPage.tvlLabel')

  const chartCommon = {
    status: chartsStore.status,
    domainStart: chartsStore.domainStart,
    domainEnd: chartsStore.domainEnd,
    maxGapSeconds: chartsStore.maxGapSeconds,
    deltaFormat: formatDelta,
    rangeLabel,
    t,
    xTickFormat,
    tooltipTimeFormat,
    hoveredTs: chartsStore.hoveredTs,
    onHover: chartsStore.setHoveredTs,
    onRetry: chartsStore.retry,
  }

  return (
    <div className='font-body text-text mx-auto w-full max-w-[1180px] px-6 pt-6 pb-8 sm:px-12'>
      <div className='flex flex-row flex-wrap items-baseline justify-between gap-3 pb-7'>
        <div>
          <h1 className='font-fredoka mb-1.5 text-3xl font-semibold sm:text-[44px]'>{t('app.statsPage.title')}</h1>
          <p className='text-text-muted text-base'>{t('app.statsPage.subtitle')}</p>
        </div>
        <RangeSelector value={model.statsRange} onChange={model.setStatsRange} t={t} />
      </div>

      <div className='grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          value={model.statsStakedCompact}
          label={tvlLabel}
          delta={cardDelta(hasHistory ? computeDelta(stakedPoints, '%') : model.seededDelta('staked'))}
          exact={
            model.statsStakedExact != null
              ? t('app.statsPage.exactly', {
                  value: model.isolate(model.withUnit('app.model.gram', model.statsStakedExact)),
                })
              : undefined
          }
        />
        <StatCard
          value={model.statsApyFormatted}
          label={t('app.statsPage.apyLastRound')}
          caption={
            model.protocolFee != null
              ? t('app.statsPage.stakingFee', { fee: model.isolate(model.protocolFee) })
              : undefined
          }
          accent
        />
        <StatCard
          value={model.statsHoldersFormatted}
          label={t('app.statsPage.activeStakers')}
          delta={cardDelta(hasHistory ? computeDelta(holdersPoints, '%') : model.seededDelta('holders'))}
        />
        <StatCard
          value={model.statsRateFormatted}
          label={t('app.statsPage.rateLabel')}
          caption={t('app.statsPage.onlyGoesUp')}
          delta={cardDelta(hasHistory ? computeDelta(ratePoints, '%') : model.seededDelta('rate'))}
        />
      </div>

      {(model.hgramStats != null || model.hpoStats != null || model.gramStats != null) && (
        <div className='grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3'>
          {model.hgramStats != null && (
            <Section model={model} title='hGRAM' stats={model.hgramStats} showSupply showHolders />
          )}
          {model.hpoStats != null && <Section model={model} title='HPO' stats={model.hpoStats} showHolders />}
          {model.gramStats != null && <Section model={model} title='GRAM' stats={model.gramStats} />}
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <LineChart
          title={t('app.statsPage.chartTvl')}
          series={stakedSeries}
          areaFill={accentAreaFill}
          valueFormat={formatStakedValue}
          axisFormat={formatCompactCount}
          deltaUnit='%'
          {...chartCommon}
        />
        <LineChart
          title={t('app.statsPage.chartApy')}
          series={apySeries}
          stepped
          valueFormat={formatApy}
          deltaUnit='pp'
          {...chartCommon}
        />
        <LineChart
          title={t('app.statsPage.activeStakers')}
          series={holdersSeries}
          valueFormat={formatCompactCount}
          deltaUnit='%'
          {...chartCommon}
        />
        <LineChart
          title={t('app.statsPage.rateLabel')}
          series={rateSeries}
          areaFill={accentAreaFill}
          valueFormat={formatRateValue}
          deltaUnit='%'
          {...chartCommon}
        />
        <LineChart
          title={t('app.statsPage.chartPrices')}
          series={priceSeries}
          valueFormat={formatPrice}
          deltaUnit='%'
          {...chartCommon}
        />
        <LineChart
          title={t('app.statsPage.chartHpoPrice')}
          series={hpoSeries}
          valueFormat={formatPrice}
          deltaUnit='%'
          {...chartCommon}
        />
      </div>

      <div className='text-text-faint flex flex-row flex-wrap gap-x-6 gap-y-2 pt-6 text-sm'>
        <span>{t('app.statsPage.refreshNote')}</span>
        <a className='text-accent hover:text-accent-hover' href={model.explorerHref} target='hipo_explorer'>
          {t('app.statsPage.treasuryOnExplorer')} <span className='inline-block rtl:-scale-x-100'>→</span>
        </a>
        <a
          className='text-accent hover:text-accent-hover'
          href='https://github.com/HipoFinance'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('app.statsPage.sourceOnGithub')} <span className='inline-block rtl:-scale-x-100'>→</span>
        </a>
        <a className='text-accent hover:text-accent-hover' href='https://stats.hipo.finance' target='hipo_stats'>
          {t('app.statsPage.moreStats')} <span className='inline-block rtl:-scale-x-100'>→</span>
        </a>
      </div>
    </div>
  )
})

// Chart x-axis ticks: time of day for 24h, weekday for a week, day+month for 1–3 months, month for
// a year — all through the locale's own calendar and digits.
function formatXTick(model: Model, range: StatsRange, ts: number): string {
  const date = ts * 1000
  if (range === '24h') {
    return model.formatDate(date, { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (range === '7d') {
    return model.formatDate(date, { weekday: 'short', day: 'numeric' })
  }
  if (range === '30d' || range === '90d') {
    return model.formatDate(date, { day: 'numeric', month: 'short' })
  }
  return model.formatDate(date, { month: 'short' })
}

export default StatsPage
