let elMarketCap
let elHpoVolume
let elHpoHolders

window.addEventListener('load', () => {
  elMarketCap = document.getElementById('hpoMarketCap')
  elHpoVolume = document.getElementById('hpoVolume')
  elHpoHolders = document.getElementById('hpoHolders')

  updateHpoData()
})

let updateHpoData = () => {
  let timer = setTimeout(updateHpoData, 300000)

  fetch('https://gauge.hipo.finance/data')
    .then((res) => res.json())
    .then((res) => {
      SetMarketCap(res.ok && res.result.hpo.market.market_cap.usd > 0 ? res.result.hpo.market.market_cap.usd : -1)

      SetHpoVolume(res.ok && res.result.hpo.market.total_volume.usd > 0 ? res.result.hpo.market.total_volume.usd : -1)

      SetHpoHolders(res.ok && res.result.hpo.holders_count > 0 ? res.result.hpo.holders_count : -1)
    })
    .catch(() => {
      clearTimeout(timer)
      timer = setTimeout(updateHpoData, 5000)
    })
}

let SetMarketCap = (value) => {
  elMarketCap.innerText = '$' + FormatCompact1Fraction(value)
}

let SetHpoVolume = (value) => {
  elHpoVolume.innerText = '$' + FormatCompact1Fraction(value)
}

let SetHpoHolders = (value) => {
  elHpoHolders.innerText = FormatCompact1Fraction(value)
}

let FormatCompact1Fraction = (n) => {
  return n.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
}
