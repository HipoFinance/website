import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles.css'
import '@fontsource/heebo/latin-400.css'
import '@fontsource/heebo/latin-500.css'
import '@fontsource/heebo/latin-700.css'
import '@fontsource/eczar/latin-700.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/poppins/latin-900.css'

updateHpoData()

function updateHpoData() {
    let timer = setTimeout(updateHpoData, 300_000)

    const marketCapEl: HTMLElement | null = document.querySelector('#hpoMarketCap')
    const volumeEl: HTMLElement | null = document.querySelector('#hpoVolume')
    const holdersEl: HTMLElement | null = document.querySelector('#hpoHolders')
    if (marketCapEl == null || volumeEl == null || holdersEl == null) {
        return
    }

    fetch('https://gauge.hipo.finance/data')
        .then((res) => res.json())
        .then(
            (res: {
                ok: boolean
                result: {
                    hpo: {
                        holders_count: number
                        market: {
                            market_cap: { usd: number }
                            total_volume: { usd: number }
                        }
                    }
                }
            }) => {
                if (res.ok && res.result.hpo.market.market_cap.usd > 0) {
                    marketCapEl.innerText = '$' + formatCompact1Fraction(res.result.hpo.market.market_cap.usd)
                } else {
                    marketCapEl.innerText = '-'
                }

                if (res.ok && res.result.hpo.market.total_volume.usd > 0) {
                    volumeEl.innerText = '$' + formatCompact1Fraction(res.result.hpo.market.total_volume.usd)
                } else {
                    volumeEl.innerText = '-'
                }

                if (res.ok && res.result.hpo.holders_count > 0) {
                    holdersEl.innerText = formatCompact1Fraction(res.result.hpo.holders_count)
                } else {
                    holdersEl.innerText = '-'
                }
            },
        )
        .catch(() => {
            clearTimeout(timer)
            timer = setTimeout(updateHpoData, 5000)
        })
}

function formatCompact1Fraction(n: number): string {
    return n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
