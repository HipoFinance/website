// Fetches https://gauge.hipo.finance/data once, immediately on evaluation (this module script is
// deferred by the browser, so the DOM is already parsed by the time it runs — no need to wait for
// window 'load', which would also block on images), and fills in the live numbers on the landing
// page: the hero APY pill, the hero holders count, the stats row, and the HPO panel stats
// (#hpoMarketCap #hpoVolume #hpoHolders — same ids hpo-data.js fills on the HPO page). Every value
// starts as an em dash ("—") in the markup and is only overwritten when the fetch succeeds — a
// failed or slow fetch must never leave a fake/stale number on screen.
//
// Numbers follow the page's locale (spec §E): `<html lang>` is mapped back to its registry key and
// every value goes through src/i18n/format.ts, so `/fa/` gets Persian digits without any change here.

import { LOCALES } from '../i18n/registry.mjs'
import { formatCompact, formatNumber, formatPercent, formatUsd } from '../i18n/format.ts'

const locale = pageLocale()

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

        // The compact figure is what renders; the exact amount rides along as a hover tooltip
        // (the Stats page shows it as selectable text for copying).
        const exact = formatNumber(locale, staked, { maximumFractionDigits: 0 }) + ' GRAM'
        SetTitle(elStatStaked, exact)
        SetTitle(elStatStakedUsd, exact)

        const gramPrice = result.ton?.market?.current_price?.usd
        if (gramPrice != null && gramPrice > 0) {
          SetText(elStatStakedUsd, FormatCompactUsd(staked * gramPrice))
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
        SetText(elHpoMarketCap, FormatCompactUsd(hpoMarketCap))
      }

      const hpoVolume = result.hpo?.market?.total_volume?.usd
      if (hpoVolume != null && hpoVolume > 0) {
        SetText(elHpoVolume, FormatCompactUsd(hpoVolume))
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

let SetTitle = (el, text) => {
  if (el != null) {
    el.title = text
  }
}

// The registry key whose `lang` matches <html lang> (e.g. lang="pt-BR" → 'pt-br'); English otherwise.
function pageLocale() {
  const lang = document.documentElement.lang
  const match = Object.entries(LOCALES).find(([, info]) => info.lang === lang)
  return match === undefined ? 'en' : match[0]
}

// Percent like current_apy is given as a plain percentage number (4.32 → "4.32%").
let FormatPercent = (n) => {
  return formatPercent(locale, n / 100, 2)
}

let FormatCompact1Fraction = (n) => {
  return formatCompact(locale, n, 1)
}

let FormatCompact2Fraction = (n) => {
  return formatCompact(locale, n, 2)
}

// "$1.2M" in English; the currency sign goes wherever the locale puts it.
let FormatCompactUsd = (n) => {
  return formatUsd(locale, n, { notation: 'compact', maximumFractionDigits: 1 })
}

let FormatHolders = (n) => {
  // The real count, not a rounded "23,000+" — team feedback prefers exact numbers.
  return formatNumber(locale, n)
}

updateLandingData()
