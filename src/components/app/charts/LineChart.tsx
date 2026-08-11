import { RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, TouchEvent } from 'react'
import type { ChartPoint } from './prometheus'
import { computeDelta } from './delta'

// Presentational only — no Model import, so it stays swappable for a real chart library later
// (see specs/app-stats-charts.md) without dragging the dApp store along.

export interface ChartSeriesInput {
  key: string
  name: string
  color: string
  points: ChartPoint[]
}

export type ChartStatus = 'loading' | 'refreshing' | 'error' | 'empty' | 'done'

export interface LineChartProps {
  title: string
  series: ChartSeriesInput[]
  status: ChartStatus
  domainStart: number
  domainEnd: number
  maxGapSeconds: number
  stepped?: boolean
  // Fill under the first series, per the design's TVL card. Omitted elsewhere.
  areaFill?: string
  valueFormat: (v: number) => string
  axisFormat?: (v: number) => string
  deltaUnit: 'pp' | '%'
  rangeLabel: string
  xTickFormat: (t: number) => string
  tooltipTimeFormat: (t: number) => string
  hoveredTs: number | null
  onHover: (ts: number | null) => void
  onRetry: () => void
}

interface Size {
  width: number
  height: number
}

const padding = { top: 12, right: 60, bottom: 24, left: 4 }

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

// D3-style "nice numbers" so gridlines land on round values instead of raw fractions.
function niceNum(range: number, round: boolean): number {
  if (range === 0) {
    return 1
  }
  const exponent = Math.floor(Math.log10(range))
  const fraction = range / Math.pow(10, exponent)
  let niceFraction: number
  if (round) {
    if (fraction < 1.5) niceFraction = 1
    else if (fraction < 3) niceFraction = 2
    else if (fraction < 7) niceFraction = 5
    else niceFraction = 10
  } else {
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10
  }
  return niceFraction * Math.pow(10, exponent)
}

function niceTicks(min: number, max: number, count: number): number[] {
  if (min === max) {
    const step = niceNum(Math.abs(min) || 1, true)
    return [min - step, min, min + step]
  }
  const range = niceNum(max - min, false)
  const step = niceNum(range / (count - 1), true)
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(v)
  }
  return ticks
}

function buildPath(
  points: ChartPoint[],
  xScale: (t: number) => number,
  yScale: (v: number) => number,
  stepped: boolean,
  maxGapSeconds: number,
): string {
  let d = ''
  let prev: ChartPoint | null = null
  for (const p of points) {
    if (!Number.isFinite(p.v)) {
      continue
    }
    const x = xScale(p.t)
    const y = yScale(p.v)
    if (prev == null || p.t - prev.t > maxGapSeconds) {
      d += `M${x.toFixed(2)},${y.toFixed(2)} `
    } else if (stepped) {
      d += `H${x.toFixed(2)} V${y.toFixed(2)} `
    } else {
      d += `L${x.toFixed(2)},${y.toFixed(2)} `
    }
    prev = p
  }
  return d.trim()
}

// Area under the line, built per contiguous run so a data gap leaves a hole in the fill instead
// of a wedge spanning it. Each run is closed down to the plot's baseline.
function buildAreaPath(
  points: ChartPoint[],
  xScale: (t: number) => number,
  yScale: (v: number) => number,
  stepped: boolean,
  maxGapSeconds: number,
  baseline: number,
): string {
  let d = ''
  let run: ChartPoint[] = []

  const flush = () => {
    if (run.length < 2) {
      run = []
      return
    }
    const firstX = xScale(run[0].t)
    d += `M${firstX.toFixed(2)},${baseline.toFixed(2)} L${firstX.toFixed(2)},${yScale(run[0].v).toFixed(2)} `
    for (let i = 1; i < run.length; i++) {
      const x = xScale(run[i].t)
      const y = yScale(run[i].v)
      d += stepped ? `H${x.toFixed(2)} V${y.toFixed(2)} ` : `L${x.toFixed(2)},${y.toFixed(2)} `
    }
    d += `L${xScale(run[run.length - 1].t).toFixed(2)},${baseline.toFixed(2)} Z `
    run = []
  }

  for (const p of points) {
    if (!Number.isFinite(p.v)) {
      continue
    }
    const prev = run[run.length - 1]
    if (prev != null && p.t - prev.t > maxGapSeconds) {
      flush()
    }
    run.push(p)
  }
  flush()

  return d.trim()
}

function nearestPoint(points: ChartPoint[], ts: number): ChartPoint | undefined {
  const finite = points.filter((p) => Number.isFinite(p.v))
  if (finite.length === 0) {
    return undefined
  }
  let lo = 0
  let hi = finite.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (finite[mid].t < ts) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  let best = finite[lo]
  if (lo > 0 && Math.abs(finite[lo - 1].t - ts) < Math.abs(best.t - ts)) {
    best = finite[lo - 1]
  }
  return best
}

const LineChart = ({
  title,
  series,
  status,
  domainStart,
  domainEnd,
  maxGapSeconds,
  stepped = false,
  areaFill,
  valueFormat,
  axisFormat,
  deltaUnit,
  rangeLabel,
  xTickFormat,
  tooltipTimeFormat,
  hoveredTs,
  onHover,
  onRetry,
}: LineChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const touchStateRef = useRef<{ x: number; y: number; decided: boolean; horizontal: boolean } | null>(null)
  const touchDismissTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [pointerKind, setPointerKind] = useState<'mouse' | 'touch' | null>(null)
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (el == null) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry != null) {
        const box = entry.contentRect
        setSize({ width: box.width, height: box.height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => clearTimeout(touchDismissTimer.current), [])

  const plotWidth = Math.max(1, size.width - padding.left - padding.right)
  const plotHeight = Math.max(1, size.height - padding.top - padding.bottom)
  const domainSpan = domainEnd - domainStart || 1

  const xScale = (t: number) => padding.left + ((t - domainStart) / domainSpan) * plotWidth
  const xInvert = (px: number) => domainStart + ((px - padding.left) / plotWidth) * domainSpan

  const allValues = series.flatMap((s) => s.points.map((p) => p.v)).filter((v) => Number.isFinite(v))
  const rawMin = allValues.length > 0 ? Math.min(...allValues) : 0
  const rawMax = allValues.length > 0 ? Math.max(...allValues) : 1
  const ticks = niceTicks(rawMin, rawMax, 4)
  const tickMin = ticks[0]
  const tickMax = ticks[ticks.length - 1]
  const tickSpan = tickMax - tickMin || Math.abs(tickMax) || 1
  const yPad = tickSpan * 0.08
  const yMin = tickMin - yPad
  const yMax = tickMax + yPad
  const yScale = (v: number) => padding.top + (1 - (v - yMin) / (yMax - yMin || 1)) * plotHeight

  const xTickCount = size.width < 400 ? 3 : 5
  const xTicks = useMemo(() => {
    const result: number[] = []
    for (let i = 0; i < xTickCount; i++) {
      result.push(domainStart + (domainSpan * i) / (xTickCount - 1))
    }
    return result
  }, [domainStart, domainSpan, xTickCount])

  const primaryPoints = series[0]?.points ?? []
  const finitePrimary = primaryPoints.filter((p) => Number.isFinite(p.v))

  const ariaLabel = useMemo(() => {
    if (finitePrimary.length === 0) {
      return `${title}, ${rangeLabel}, no data`
    }
    const values = finitePrimary.map((p) => p.v)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const first = finitePrimary[0]
    const last = finitePrimary[finitePrimary.length - 1]
    return (
      `${title}, ${rangeLabel}, first ${valueFormat(first.v)}, last ${valueFormat(last.v)}, ` +
      `min ${valueFormat(min)}, max ${valueFormat(max)}`
    )
  }, [finitePrimary, title, rangeLabel, valueFormat])

  const handleHoverAt = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left
    const ts = clamp(xInvert(px), domainStart, domainEnd)
    onHover(ts)
    return ts
  }

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') {
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setPointerKind('mouse')
    setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    handleHoverAt(e.clientX, rect)
  }

  const handlePointerLeave = () => {
    setPointerKind(null)
    setPointerPos(null)
    onHover(null)
  }

  const handleTouchStart = (e: TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0]
    if (touch == null) {
      return
    }
    touchStateRef.current = { x: touch.clientX, y: touch.clientY, decided: false, horizontal: false }
    clearTimeout(touchDismissTimer.current)
  }

  const handleTouchMove = (e: TouchEvent<SVGSVGElement>) => {
    const state = touchStateRef.current
    const touch = e.touches[0]
    if (state == null || touch == null) {
      return
    }
    if (!state.decided) {
      const dx = touch.clientX - state.x
      const dy = touch.clientY - state.y
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        state.decided = true
        state.horizontal = Math.abs(dx) > Math.abs(dy)
      }
    }
    if (state.horizontal) {
      // Only block scroll once the gesture is clearly horizontal — vertical page scroll must
      // survive over the chart.
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      setPointerKind('touch')
      setPointerPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top })
      handleHoverAt(touch.clientX, rect)
    }
  }

  const handleTouchEnd = () => {
    touchStateRef.current = null
    touchDismissTimer.current = setTimeout(() => {
      onHover(null)
      setPointerKind(null)
      setPointerPos(null)
    }, 2000)
  }

  const handleKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (finitePrimary.length === 0) {
      return
    }
    if (e.key === 'Home') {
      e.preventDefault()
      onHover(finitePrimary[0].t)
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      onHover(finitePrimary[finitePrimary.length - 1].t)
      return
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return
    }
    e.preventDefault()
    const currentTs = hoveredTs ?? finitePrimary[finitePrimary.length - 1].t
    let index = finitePrimary.findIndex((p) => p.t >= currentTs)
    if (index === -1) {
      index = finitePrimary.length - 1
    }
    if (e.key === 'ArrowLeft') {
      index = Math.max(0, index - 1)
    } else {
      index = Math.min(finitePrimary.length - 1, index + 1)
    }
    onHover(finitePrimary[index].t)
  }

  const showHairline = hoveredTs != null && hoveredTs >= domainStart && hoveredTs <= domainEnd
  const hairlineX = showHairline ? xScale(hoveredTs as number) : 0

  const tableRows = useMemo(() => {
    const tsSet = new Set<number>()
    const maps = series.map((s) => {
      const m = new Map<number, number>()
      for (const p of s.points) {
        if (Number.isFinite(p.v)) {
          m.set(p.t, p.v)
          tsSet.add(p.t)
        }
      }
      return m
    })
    const timestamps = Array.from(tsSet).sort((a, b) => a - b)
    return timestamps.map((t) => ({ t, values: maps.map((m) => m.get(t)) }))
  }, [series])

  const showChart = status === 'done' || status === 'refreshing'

  return (
    <div className='border-border bg-surface text-text rounded-[20px] border p-6'>
      <div className='flex flex-row items-baseline'>
        <p className='font-fredoka text-[18px] font-semibold'>{title}</p>
        {status === 'refreshing' && <RefreshCw className='text-text-faint ml-2 size-4 animate-spin' />}
        {series.length === 1 &&
          (() => {
            const delta = computeDelta(series[0].points, deltaUnit)
            if (delta == null) {
              return <p className='text-text-faint ml-auto text-[13px]'>{rangeLabel}</p>
            }
            return (
              <p className='ml-auto text-[13px]'>
                <span
                  className={
                    delta.direction === 'up' ? 'text-positive' : delta.direction === 'down' ? 'text-accent' : ''
                  }
                >
                  {delta.text}
                </span>{' '}
                <span className='text-text-faint font-normal'>· {rangeLabel}</span>
              </p>
            )
          })()}
      </div>

      {series.length > 1 && (
        <div className='mt-2 flex flex-row flex-wrap gap-4 text-xs'>
          {series.map((s) => {
            const delta = computeDelta(s.points, deltaUnit)
            return (
              <div key={s.key} className='text-text-muted flex flex-row items-center gap-1.5'>
                <span className='inline-block h-0.5 w-3' style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
                {delta != null && (
                  <span className={delta.direction === 'up' ? 'text-positive' : 'text-accent'}>{delta.text}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div ref={containerRef} className='relative mt-3 h-[200px] sm:h-[220px]'>
        {status === 'loading' && <div className='bg-surface-deep absolute inset-0 animate-pulse rounded-xl' />}

        {status === 'error' && (
          <div className='text-text-muted flex h-full flex-col items-center justify-center gap-2 text-sm'>
            <p>Couldn&apos;t load history</p>
            <button
              type='button'
              className='border-border hover:text-accent cursor-pointer rounded-lg border px-3 py-1'
              onClick={onRetry}
            >
              Retry
            </button>
          </div>
        )}

        {status === 'empty' && (
          <div className='text-text-muted flex h-full items-center justify-center text-sm'>No data for this range</div>
        )}

        {showChart && size.width > 0 && (
          <svg
            width={size.width}
            height={size.height}
            viewBox={`0 0 ${size.width} ${size.height}`}
            className={'touch-pan-y outline-none select-none' + (status === 'refreshing' ? ' opacity-60' : '')}
            tabIndex={0}
            role='img'
            aria-label={ariaLabel}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            {ticks.map((tick) => {
              const y = yScale(tick)
              // Tick labels share the right-hand band with the last-point value labels; drop any
              // tick label that would collide rather than letting the two overprint.
              const collides = series.some((s) => {
                const finite = s.points.filter((p) => Number.isFinite(p.v))
                const last = finite[finite.length - 1]
                return last != null && Math.abs(yScale(last.v) - y) < 14
              })
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    x2={size.width - padding.right}
                    y1={y}
                    y2={y}
                    stroke='var(--chart-grid)'
                    strokeWidth={1}
                  />
                  {collides ? null : (
                    <text
                      x={size.width - padding.right + 6}
                      y={y}
                      dy='0.32em'
                      fontSize={12}
                      className='tabular-nums'
                      fill='var(--chart-ink)'
                    >
                      {axisFormat != null ? axisFormat(tick) : valueFormat(tick)}
                    </text>
                  )}
                </g>
              )
            })}

            {xTicks.map((t) => (
              <text
                key={t}
                x={clamp(xScale(t), padding.left + 16, size.width - padding.right - 16)}
                y={size.height - 6}
                fontSize={12}
                textAnchor='middle'
                className='tabular-nums'
                fill='var(--chart-ink)'
              >
                {xTickFormat(t)}
              </text>
            ))}

            {areaFill != null && series[0] != null && (
              <path
                d={buildAreaPath(
                  series[0].points,
                  xScale,
                  yScale,
                  stepped,
                  maxGapSeconds,
                  size.height - padding.bottom,
                )}
                fill={areaFill}
                stroke='none'
              />
            )}

            {series.map((s) => (
              <path
                key={s.key}
                d={buildPath(s.points, xScale, yScale, stepped, maxGapSeconds)}
                fill='none'
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin='round'
              />
            ))}

            {series.map((s) => {
              const finite = s.points.filter((p) => Number.isFinite(p.v))
              const last = finite[finite.length - 1]
              if (last == null) {
                return null
              }
              const x = xScale(last.t)
              const y = yScale(last.v)
              return (
                <g key={s.key + '-last'}>
                  <circle cx={x} cy={y} r={5} className='fill-surface' />
                  <circle cx={x} cy={y} r={3} fill={s.color} />
                  <text
                    x={Math.min(x + 8, size.width - padding.right + 6)}
                    y={y}
                    dy='0.32em'
                    fontSize={12}
                    className='tabular-nums'
                    fill='var(--chart-ink)'
                  >
                    {valueFormat(last.v)}
                  </text>
                </g>
              )
            })}

            {showHairline && (
              <g>
                <line
                  x1={hairlineX}
                  x2={hairlineX}
                  y1={padding.top}
                  y2={size.height - padding.bottom}
                  stroke='var(--chart-ink)'
                  strokeWidth={1}
                  opacity={0.5}
                />
                {series.map((s) => {
                  const near = nearestPoint(s.points, hoveredTs as number)
                  if (near == null || Math.abs(near.t - (hoveredTs as number)) > maxGapSeconds) {
                    return null
                  }
                  const x = xScale(near.t)
                  const y = yScale(near.v)
                  return (
                    <g key={s.key + '-hover'}>
                      <circle cx={x} cy={y} r={5} className='fill-surface' />
                      <circle cx={x} cy={y} r={3} fill={s.color} />
                    </g>
                  )
                })}
              </g>
            )}
          </svg>
        )}

        {/* The hairline is synced across charts via hoveredTs, but the tooltip only follows the
            chart the user is actually pointing at (or keyboard-focused on) — five tooltips at
            once would be noise. */}
        {showChart && showHairline && size.width > 0 && (pointerPos != null || focused) && (
          <div
            className='border-border bg-surface-deep text-text pointer-events-none absolute z-10 rounded-xl border px-3 py-2 text-xs shadow-xl'
            style={{
              left: clamp(pointerPos?.x ?? hairlineX, 72, size.width - 72),
              top: pointerKind === 'touch' ? clamp((pointerPos?.y ?? 0) - 48, 0, size.height - 24) : padding.top,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className='mb-1 font-medium'>{tooltipTimeFormat(hoveredTs as number)}</p>
            {series.map((s) => {
              const near = nearestPoint(s.points, hoveredTs as number)
              if (near == null || Math.abs(near.t - (hoveredTs as number)) > maxGapSeconds) {
                return null
              }
              return (
                <div key={s.key} className='flex flex-row items-center gap-1.5 tabular-nums'>
                  <span className='inline-block h-2 w-2 rounded-full' style={{ backgroundColor: s.color }} />
                  <span className='mr-auto'>{s.name}</span>
                  <span className='ml-2'>{valueFormat(near.v)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <details className='text-text-muted mt-2 text-xs'>
        <summary className='text-text-faint hover:text-accent cursor-pointer'>Show table</summary>
        <div className='mt-2 max-h-64 overflow-auto'>
          <table className='w-full text-left tabular-nums'>
            <thead>
              <tr>
                <th className='pr-4'>Time</th>
                {series.map((s) => (
                  <th key={s.key} className='pr-4'>
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.t}>
                  <td className='pr-4'>{tooltipTimeFormat(row.t)}</td>
                  {row.values.map((v, i) => (
                    <td key={series[i].key} className='pr-4'>
                      {v != null ? valueFormat(v) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

export default LineChart
