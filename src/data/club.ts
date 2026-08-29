// Build-time seed for the Hipo Club figures on /vs/: how much HPO a stake earns in a year, and
// what that is worth next to the GRAM staking reward.
//
// Everything here mirrors Model.ts's `profitAfterOneYear` / `profitAfterOneYearOnLastLevel`, which
// is the app's own arithmetic:
//
//   HPO per round = GRAM staked x hton_hpo_reward_rate x rewardCoefficients[clubLevel]
//   HPO per year  = that, times however many validation rounds fit in a year
//
// The two protocol inputs come from the same api.hipogang.io endpoint the app reads, so a
// governance change to the rate or to the level curve reaches this page on the next build instead
// of being frozen into the markup. The endpoint is per-wallet, but `hton_hpo_reward_rate` and
// `reward_coefficients` are protocol-wide and come back for any address — hence the zero address
// as a neutral probe. Nothing wallet-specific is read from the response.
const REWARDS_URL = 'https://api.hipogang.io/wallet-rewards?address=EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'

const FETCH_TIMEOUT_MS = 10000

// The values the endpoint returned on 2026-08-29, used when it is unreachable. A stale rate is
// worth more here than a blank table: /vs/ exists to put real figures in the static HTML, and both
// numbers move rarely (the coefficients only by a governance vote).
const FALLBACK_REWARD_RATE = 0.0021902
const FALLBACK_COEFFICIENTS = [1, 1.2, 1.6, 2.2, 3, 4, 5.2, 6.6, 8.2, 10]

// TON's validation round, and so Hipo's reward interval. Model.ts reads the live round boundaries
// and falls back to this same constant; a marketing page that rebuilds on every deploy does not
// need the extra fetch, but the number has changed before (rounds used to run ~36h) — check it
// against get_round_timing if the HPO figures ever look off by a factor.
const ROUND_SECONDS = 65536
const YEAR_SECONDS = 365 * 24 * 60 * 60

export interface ClubRewards {
  // HPO per GRAM staked, per round, at Level 1.
  rewardRate: number
  // Level 1..10 multipliers, in order. Not linear: 1, 1.2, 1.6, … , 10.
  coefficients: number[]
  roundsPerYear: number
}

// One fetch per build, shared by every page that asks. Never rejects.
let pending: Promise<ClubRewards> | undefined

export function fetchClubRewards(): Promise<ClubRewards> {
  if (pending === undefined) {
    pending = loadClubRewards()
  }
  return pending
}

async function loadClubRewards(): Promise<ClubRewards> {
  const roundsPerYear = YEAR_SECONDS / ROUND_SECONDS
  try {
    const res = await fetch(REWARDS_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: 'application/json', 'user-agent': 'hipo-website-build (+https://hipo.finance)' },
    })
    if (!res.ok) {
      throw new Error('HTTP ' + res.status)
    }
    const body = (await res.json()) as {
      ok?: boolean
      result?: { hton_hpo_reward_rate?: number; reward_coefficients?: number[] }
    }
    if (body.ok !== true || body.result === undefined) {
      throw new Error('payload not ok')
    }

    const rate = body.result.hton_hpo_reward_rate
    const coefficients = body.result.reward_coefficients
    return {
      rewardRate: typeof rate === 'number' && rate > 0 ? rate : FALLBACK_REWARD_RATE,
      coefficients:
        Array.isArray(coefficients) && coefficients.length > 0 && coefficients.every((c) => typeof c === 'number')
          ? coefficients
          : FALLBACK_COEFFICIENTS,
      roundsPerYear,
    }
  } catch (e) {
    console.warn('[club] reward parameters unavailable, using the last known values:', (e as Error).message)
    return { rewardRate: FALLBACK_REWARD_RATE, coefficients: FALLBACK_COEFFICIENTS, roundsPerYear }
  }
}

// HPO earned in a year on `gram` staked, at the given 1-based Club level.
export function hpoPerYear(rewards: ClubRewards, gram: number, level: number): number {
  const coefficient = rewards.coefficients[level - 1] ?? rewards.coefficients[0]
  return gram * rewards.rewardRate * coefficient * rewards.roundsPerYear
}

// What that HPO is worth as an addition to the staking APY, in percentage points: a year of HPO on
// one GRAM, priced in USD, over the USD price of that GRAM. Undefined when either price is missing,
// so the page can drop the sentence rather than print a made-up number.
export function hpoBoostPoints(
  rewards: ClubRewards,
  level: number,
  hpoUsd: number | undefined,
  gramUsd: number | undefined,
): number | undefined {
  if (hpoUsd == null || gramUsd == null || hpoUsd <= 0 || gramUsd <= 0) {
    return undefined
  }
  return (hpoPerYear(rewards, 1, level) * hpoUsd * 100) / gramUsd
}
