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
let elBurned = document.getElementById('hpoBurned')
let elBurnArc = document.getElementById('hpoBurnArc')
let elBurnChart = document.getElementById('hpoTokenomicsChart')

// "Burned so far" in the middle of the tokenomics donut: 1B HPO were minted; burns shrink the
// on-chain total supply, so the difference IS the burned amount — a real number, not marketing
// copy. Read via the TON v4 API's get_jetton_data run (same API the dApp's TonClient4 speaks;
// block-keyed and CDN-cached, unlike tonapi's free tier which 429s under load). Only queried on
// the HPO page (the element exists nowhere else); a failure leaves the dash and a flat arc.
const TON_V4 = 'https://mainnet-v4.tonhubapi.com'
const HPO_JETTON = 'EQDQEUr0LPi8m6D6F0Wrvuok7tZbAcr0yn2Y7hK291MMzMjM'
const HPO_MINTED = 1000000000

// Sweep the ember arc to the burned share of the minted supply (the CSS transition in Hpo.astro
// animates the dasharray change) and count the exact figure up from zero. Deferred until the
// chart scrolls into view so the animation is actually seen, and skipped entirely for
// reduced-motion users, who get the final number at once.
let revealBurned = (burned) => {
  const run = () => {
    if (elBurnArc != null) {
      const pct = (burned / HPO_MINTED) * 100
      elBurnArc.setAttribute('stroke-dasharray', pct + ' ' + (100 - pct))
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      SetText(elBurned, burned.toLocaleString('en-US'))
      return
    }
    const duration = 1400
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      SetText(elBurned, Math.round(burned * eased).toLocaleString('en-US'))
      if (p < 1) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  }
  if (elBurnChart != null && typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(elBurnChart)
  } else {
    run()
  }
}

let updateBurned = () => {
  if (elBurned == null) {
    return
  }
  fetch(TON_V4 + '/block/latest')
    .then((res) => res.json())
    .then((res) => fetch(TON_V4 + '/block/' + res.last.seqno + '/' + HPO_JETTON + '/run/get_jetton_data'))
    .then((res) => res.json())
    .then((res) => {
      // get_jetton_data's first stack item is the total supply in nano.
      const item = res.exitCode === 0 ? res.result?.[0] : undefined
      const supply = item?.type === 'int' ? Number(item.value) / 1000000000 : NaN
      if (Number.isFinite(supply) && supply > 0 && supply <= HPO_MINTED) {
        revealBurned(Math.round(HPO_MINTED - supply))
      }
    })
    .catch(() => {})
}

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
updateBurned()
