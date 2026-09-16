// Refreshes the live protocol numbers on /vs/ in the visitor's browser: the hero APY, fee and
// staked total, the APY quoted in two sentences, the per-year GRAM column of the reward table, and
// the fee repeated down that table's third column.
//
// Why this page needs it. Every figure on /vs/ is baked at build time — that is the point of the
// page, which is written for link-preview crawlers — but the gauge's APY moves with every
// validation round and has run between 12% and 34% inside one month. The landing page corrects
// itself on load (src/scripts/landing-data.js) and the dApp reads the chain directly, so a /vs/
// frozen at its last deploy was the only surface on the site still quoting a rate the protocol had
// moved away from, next to a hero that calls it the "Current APY".
//
// Same contract as landing-data.js: the values are formatted by the SAME vsValues() the markup was
// rendered with, so the write is character-identical whenever the number has not moved — no flash.
// A field the gauge omits is skipped rather than written, so a partial payload can never blank out
// a good baked figure, and a failed fetch leaves the page exactly as it was built.
//
// This is a deferred module script, so the DOM is parsed by the time it runs.
import { LOCALES } from '../i18n/registry.mjs'
import { vsValues } from '../data/gauge.ts'

const locale = pageLocale()

fetch('https://gauge.hipo.finance/data')
  .then((res) => res.json())
  .then((res) => {
    if (!res.ok) {
      return
    }
    const values = vsValues(locale, res.result)
    // A key can name more than one node — the fee is in the hero card and in every row of the
    // table, the APY in the hero card and in two sentences — so every match is written, not the
    // first.
    for (const node of document.querySelectorAll('[data-vs-live]')) {
      const text = values[node.dataset.vsLive]
      if (text !== undefined) {
        node.textContent = text
      }
    }
  })
  .catch(() => {})

// The registry key whose `lang` matches <html lang> (e.g. lang="pt-BR" → 'pt-br'); English otherwise.
function pageLocale() {
  const lang = document.documentElement.lang
  const match = Object.entries(LOCALES).find(([, info]) => info.lang === lang)
  return match === undefined ? 'en' : match[0]
}
