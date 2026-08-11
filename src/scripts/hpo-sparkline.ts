// Draws the HPO hero sparkline from real price history. This reuses queryRange from the Stats
// page's Prometheus client (src/components/app/charts/prometheus.ts) so the query string sent to
// https://gauge.hipo.finance/prometheus/api/v1/query_range stays byte-identical to the one the
// nginx allowlist actually permits — building a second, slightly different query here would just
// get rejected. See prometheus.ts for why the query is one fixed combined string across all
// metrics and ranges.
//
// Until the fetch resolves — and if it fails — the <svg id="hpoSparkline"> stays empty. The
// viewBox/class already reserve its height, so no fake line or shape is ever drawn.
import { queryRange } from '../components/app/charts/prometheus'

const svgNs = 'http://www.w3.org/2000/svg'
const viewWidth = 400
const viewTop = 8
const viewBottom = 112

const svg = document.getElementById('hpoSparkline')

if (svg != null) {
  queryRange('30d')
    .then((result) => {
      const points = result.series.hipo_hpo_current_price ?? []
      if (points.length < 2) {
        return
      }

      const spanT = result.end - result.start || 1
      const values = points.map((p) => p.v)
      const minV = Math.min(...values)
      const maxV = Math.max(...values)
      const spanV = maxV - minV
      const height = viewBottom - viewTop

      const coords = points.map((p) => {
        const x = ((p.t - result.start) / spanT) * viewWidth
        const y = spanV > 0 ? viewBottom - ((p.v - minV) / spanV) * height : (viewTop + viewBottom) / 2
        return x.toFixed(1) + ',' + y.toFixed(1)
      })

      const linePoints = coords.join(' ')
      const areaPoints = linePoints + ' ' + viewWidth + ',120 0,120'

      const polyline = document.createElementNS(svgNs, 'polyline')
      polyline.setAttribute('points', linePoints)
      polyline.setAttribute('fill', 'none')
      polyline.setAttribute('stroke', 'var(--color-accent)')
      polyline.setAttribute('stroke-width', '2.5')

      const polygon = document.createElementNS(svgNs, 'polygon')
      polygon.setAttribute('points', areaPoints)
      polygon.setAttribute('fill', 'rgba(255,126,115,.12)')

      svg.appendChild(polyline)
      svg.appendChild(polygon)
    })
    .catch(() => {})
}
