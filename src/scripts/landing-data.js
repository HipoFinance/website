// Fetches https://gauge.hipo.finance/data once, immediately on evaluation (this module script is
// deferred by the browser, so the DOM is already parsed by the time it runs — no need to wait for
// window 'load', which would also block on images), and fills in the live numbers on the landing
// page: the hero APY pill, the hero holders count, the stats row, and the HPO panel stats
// (#hpoMarketCap #hpoVolume #hpoHolders — same ids hpo-data.js fills on the HPO page). Every value
// starts as an em dash ("—") in the markup and is only overwritten when the fetch succeeds — a
// failed or slow fetch must never leave a fake/stale number on screen.

let elHeroApy = document.getElementById('heroApy')
let elHeroFee = document.getElementById('heroFee')
let elHeroHolders = document.getElementById('heroHolders')
let elStatStaked = document.getElementById('statStaked')
let elStatStakedUsd = document.getElementById('statStakedUsd')
let elStatApy = document.getElementById('statApy')
let elStatFee = document.getElementById('statFee')
let elStatHolders = document.getElementById('statHolders')
let elHpoMarketCap = document.getElementById('hpoMarketCap')
let elHpoVolume = document.getElementById('hpoVolume')
let elHpoHolders = document.getElementById('hpoHolders')

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

      // Percent like current_apy (GovernanceFee/65535*100); 0 is a real value, so no > 0 guard.
      const fee = result.treasury?.protocol_fee
      if (fee != null) {
        const feeText = FormatPercent(fee)
        SetText(elHeroFee, feeText)
        SetText(elStatFee, feeText)
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
        const holdersText = FormatHolders(holders)
        SetText(elStatHolders, holdersText)
        SetText(elHeroHolders, holdersText)
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

updateLandingData()
