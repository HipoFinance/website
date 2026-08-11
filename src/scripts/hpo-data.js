// Fetches https://gauge.hipo.finance/data and fills in the live numbers on the HPO page: the
// hero market card (#hpoMarketCap #hpoVolume #hpoHolders) and the "Impressive metrics" card
// (#hpoTvlGram #hpoTvlUsd #hpoStakers). Every value starts as an em dash ("—") in the markup and
// is only overwritten when the fetch succeeds — a missing field or a failed fetch must never
// write a fake or stale number, it just leaves the dash in place.

let elMarketCap = document.getElementById('hpoMarketCap')
let elHpoVolume = document.getElementById('hpoVolume')
let elHpoHolders = document.getElementById('hpoHolders')
let elTvlGram = document.getElementById('hpoTvlGram')
let elTvlUsd = document.getElementById('hpoTvlUsd')
let elStakers = document.getElementById('hpoStakers')

let updateHpoData = () => {
  let timer = setTimeout(updateHpoData, 300000)

  fetch('https://gauge.hipo.finance/data')
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) {
        return
      }
      const result = res.result

      const marketCap = result.hpo?.market?.market_cap?.usd
      if (marketCap != null && marketCap > 0) {
        SetText(elMarketCap, '$' + FormatCompact1Fraction(marketCap))
      }

      const volume = result.hpo?.market?.total_volume?.usd
      if (volume != null && volume > 0) {
        SetText(elHpoVolume, '$' + FormatCompact1Fraction(volume))
      }

      const holders = result.hpo?.holders_count
      if (holders != null && holders > 0) {
        SetText(elHpoHolders, FormatCompact1Fraction(holders))
      }

      const stakedNano = result.treasury?.current_tvl
      if (stakedNano != null) {
        const staked = stakedNano / 1000000000
        SetText(elTvlGram, FormatCompact2Fraction(staked))

        const gramPrice = result.ton?.market?.current_price?.usd
        if (gramPrice != null && gramPrice > 0) {
          SetText(elTvlUsd, '$' + FormatCompact1Fraction(staked * gramPrice))
        }
      }

      const stakers = result.hton?.holders_count
      if (stakers != null && stakers > 0) {
        SetText(elStakers, FormatCompact1Fraction(stakers))
      }
    })
    .catch(() => {
      clearTimeout(timer)
      timer = setTimeout(updateHpoData, 5000)
    })
}

let SetText = (el, text) => {
  if (el != null) {
    el.textContent = text
  }
}

let FormatCompact1Fraction = (n) => {
  return n.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
}

let FormatCompact2Fraction = (n) => {
  return n.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  })
}

updateHpoData()
