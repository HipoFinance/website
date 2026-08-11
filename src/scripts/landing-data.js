// Fetches https://gauge.hipo.finance/data once on load and fills in the live numbers on the
// landing page: the hero APY pill, the stats row, and the HPO panel stats (#hpoMarketCap
// #hpoVolume #hpoHolders — same ids hpo-data.js fills on the HPO page). The design numbers are
// left in the markup as placeholders and only overwritten when the fetch succeeds.

let elHeroApy
let elStatStaked
let elStatStakedUsd
let elStatApy
let elStatHolders
let elHpoMarketCap
let elHpoVolume
let elHpoHolders

window.addEventListener('load', () => {
  elHeroApy = document.getElementById('heroApy')
  elStatStaked = document.getElementById('statStaked')
  elStatStakedUsd = document.getElementById('statStakedUsd')
  elStatApy = document.getElementById('statApy')
  elStatHolders = document.getElementById('statHolders')
  elHpoMarketCap = document.getElementById('hpoMarketCap')
  elHpoVolume = document.getElementById('hpoVolume')
  elHpoHolders = document.getElementById('hpoHolders')

  updateLandingData()
})

let updateLandingData = () => {
  fetch('https://gauge.hipo.finance/data')
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) {
        return
      }
      const result = res.result

      const apy = result.treasury?.current_apy
      if (apy != null) {
        const apyText = FormatPercent(apy)
        SetText(elHeroApy, apyText)
        SetText(elStatApy, apyText)
      }

      const stakedNano = result.treasury?.current_tvl
      if (stakedNano != null) {
        const staked = stakedNano / 1000000000
        SetText(elStatStaked, FormatCompact2Fraction(staked))

        const gramPrice = result.ton?.market?.current_price?.usd
        if (gramPrice != null && gramPrice > 0) {
          SetText(elStatStakedUsd, '$' + FormatCompact1Fraction(staked * gramPrice))
        }
      }

      const holders = result.hton?.holders_count
      if (holders != null && holders > 0) {
        SetText(elStatHolders, FormatHolders(holders))
      }

      const hpoMarketCap = result.hpo?.market?.market_cap?.usd
      if (hpoMarketCap != null && hpoMarketCap > 0) {
        SetText(elHpoMarketCap, '$' + FormatCompact1Fraction(hpoMarketCap))
      }

      const hpoVolume = result.hpo?.market?.total_volume?.usd
      if (hpoVolume != null && hpoVolume > 0) {
        SetText(elHpoVolume, '$' + FormatCompact1Fraction(hpoVolume))
      }

      const hpoHolders = result.hpo?.holders_count
      if (hpoHolders != null && hpoHolders > 0) {
        SetText(elHpoHolders, FormatCompact1Fraction(hpoHolders))
      }
    })
    .catch(() => {})
}

let SetText = (el, text) => {
  if (el != null) {
    el.textContent = text
  }
}

let FormatPercent = (n) => {
  return (n / 100).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 })
}

let FormatCompact1Fraction = (n) => {
  return n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })
}

let FormatCompact2Fraction = (n) => {
  return n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 2 })
}

let FormatHolders = (n) => {
  const rounded = Math.floor(n / 1000) * 1000
  return rounded.toLocaleString('en-US') + '+'
}
