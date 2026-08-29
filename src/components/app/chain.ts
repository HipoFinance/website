// The TON blockchain layer, split out of Model.ts so it can be fetched on demand.
//
// @ton/core, @ton/ton, @ton/crypto and @hipo-finance/sdk — plus the zod, axios, tweetnacl and
// jssha they pull in — are about two thirds of what the app island used to ship on every page
// load, and none of it is needed to paint the app shell. Model.ts keeps only `import type` for
// these packages and reaches every value through here, behind a dynamic import.
//
// The Buffer polyfill must be installed before the TON libraries evaluate, which is why it is a
// static import at the top of THIS module rather than the island's entry: Rollup keeps
// side-effectful imports in source order within a chunk, so importing chain.ts is enough to get
// the polyfill first. (It used to be the island's first import — see AppIsland.tsx.)
import './pollyfills.ts'

export { Address, Dictionary, TonClient4, fromNano, toNano } from '@ton/ton'
export {
  ParticipationState,
  Treasury,
  Wallet,
  Parent,
  maxAmountToStake,
  feeStake,
  feeUnstake,
  createDepositMessage,
  createUnstakeMessage,
} from '@hipo-finance/sdk'

import { treasuryAddresses } from '@hipo-finance/sdk'

// Mainnet only; testnet support was removed 2026-08-10. Resolved here rather than at Model's
// module scope, which would have dragged the sdk back into the eager chunk.
export const treasuryAddress = treasuryAddresses.get('mainnet')
