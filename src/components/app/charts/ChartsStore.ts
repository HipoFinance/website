import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { type Model } from '../Model'
import { bustCache, queryRange, stepFor, type SeriesMap } from './prometheus'

export type ChartFetchStatus = 'loading' | 'refreshing' | 'error' | 'empty' | 'done'

const autoRefreshDelay = 300 * 1000

// Page-scoped store: created once per StatsPage mount (see StatsPage.tsx) and disposed on
// unmount. Fetching, chart state, and the crosshair all live here rather than on Model, which
// only holds the range that's part of app navigation state.
export class ChartsStore {
  status: ChartFetchStatus = 'loading'
  series?: SeriesMap
  domainStart = 0
  domainEnd = 0
  hoveredTs: number | null = null

  private readonly model: Model
  private abortController?: AbortController
  private seq = 0
  private refreshTimer?: ReturnType<typeof setInterval>
  private readonly disposeReaction: () => void

  constructor(model: Model) {
    this.model = model

    makeAutoObservable<ChartsStore, 'model' | 'abortController' | 'seq' | 'refreshTimer' | 'disposeReaction'>(this, {
      model: false,
      abortController: false,
      seq: false,
      refreshTimer: false,
      disposeReaction: false,
    })

    this.disposeReaction = reaction(
      () => [this.model.statsRange, this.model.isMainnet] as const,
      () => this.load(),
    )

    // Opening the Stats page constructs a fresh store, so this first load busts the module-level
    // cache: every visit shows fresh data. Range switches (the reaction above) still use the
    // cache to keep toggling back and forth cheap.
    this.load({ bustCache: true })

    this.refreshTimer = setInterval(() => {
      if (this.model.isMainnet && !document.hidden) {
        this.load()
      }
    }, autoRefreshDelay)
  }

  get step(): number {
    return stepFor(this.model.statsRange)
  }

  // Line paths break when a gap exceeds this many seconds, so an outage reads as a gap rather
  // than an interpolated straight line.
  get maxGapSeconds(): number {
    return this.step * 2.5
  }

  get rangeLabel(): string {
    return this.model.statsRange
  }

  setHoveredTs = (ts: number | null) => {
    this.hoveredTs = ts
  }

  load = (opts: { bustCache?: boolean } = {}) => {
    if (!this.model.isMainnet) {
      return
    }
    const range = this.model.statsRange
    const seq = ++this.seq

    this.abortController?.abort()
    const controller = new AbortController()
    this.abortController = controller

    if (opts.bustCache === true) {
      bustCache(range)
    }
    // Keep any existing chart on screen (opacity-60 + spinner, handled by LineChart) rather than
    // flashing a skeleton over it — only a genuinely first load shows the skeleton.
    this.status = this.series == null ? 'loading' : 'refreshing'

    queryRange(range, controller.signal, opts)
      .then((result) => {
        if (seq !== this.seq) {
          return
        }
        runInAction(() => {
          this.series = result.series
          this.domainStart = result.start
          this.domainEnd = result.end
          const hasData = Object.values(result.series).some((points) => (points?.length ?? 0) > 0)
          this.status = hasData ? 'done' : 'empty'
        })
      })
      .catch(() => {
        if (seq !== this.seq || controller.signal.aborted) {
          return
        }
        runInAction(() => {
          // Same rule as the gauge figures: a failed refresh keeps the last good data on screen.
          // The error card is only for having nothing to show at all.
          this.status = this.series == null ? 'error' : 'done'
        })
      })
  }

  retry = () => {
    this.load({ bustCache: true })
  }

  dispose = () => {
    this.abortController?.abort()
    if (this.refreshTimer != null) {
      clearInterval(this.refreshTimer)
    }
    this.disposeReaction()
  }
}
