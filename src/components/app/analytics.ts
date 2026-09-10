// GA4 events for the dApp, to the spec handed over on 2026-08-25:
//
//   wallet_connect      TonConnect returns a wallet the visitor just connected  wallet_name
//   stake_initiated     the stake form is submitted                            amount_gram
//   stake_confirmed     the deposit lands on-chain                             amount_gram, wallet_name, settlement
//   unstake_confirmed   the burn lands on-chain                                amount_gram, unstake_type, settlement
//
// The point of the pair is the drop-off between `stake_initiated` and `stake_confirmed`: everyone
// in the gap opened their wallet and did not sign.
//
// `settlement` was added on 2026-09-10 and is 'instant' or 'queued'. A Full unstake is answered by
// a bill -- accepted now, paid when the round settles -- and until then every one of those counted
// as a completed unstake here, which is most of them. An instant unstake that rolled back for want
// of liquidity now sends no event at all, because nothing happened.
//
// The tag itself is src/components/Analytics.astro, which only initialises on hipo.finance — so
// `window.gtag` is simply absent in dev, in `npm run preview`, and for the many crypto-native
// visitors whose blocker drops it. Every call here is then a no-op. Nothing in this file may ever
// throw into a transaction flow, which is why the send path calls it and ignores the result.

interface GtagWindow extends Window {
  gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void
}

export type StakeEvent = 'stake_initiated' | 'stake_confirmed' | 'unstake_confirmed'
export type AnalyticsEvent = 'wallet_connect' | StakeEvent

/** Fire-and-forget. Undefined parameters are dropped so GA never records an empty dimension. */
export const track = (event: AnalyticsEvent, params: Record<string, string | number | undefined> = {}) => {
  try {
    const gtag = (window as GtagWindow).gtag
    if (gtag == null) {
      return
    }
    const defined: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        defined[key] = value
      }
    }
    gtag('event', event, defined)
  } catch {
    // Analytics must never break staking.
  }
}
