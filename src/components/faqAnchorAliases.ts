// Retired `/faq/` anchors → the answer that now carries their content (the "Old → new anchor map"
// in specs/faq-restructure.md). Question anchors are prose file names, section anchors are section
// ids; both are the same in every locale. Consumed by src/scripts/faq-anchors.ts, which rewrites a
// stale fragment on load and on `hashchange` so external deep links and Google's FAQ jump links
// still land on the right answer. Nothing in src/ or public/ links to these — keep the map as the
// one place they are recorded, and add to it whenever an anchor is removed.
export const FAQ_ANCHOR_ALIASES: Readonly<Record<string, string>> = {
  // Getting started
  'what-happens-behind-the-scenes': 'how-does-hipo-work',
  'what-is-the-difference-between-staking-and-liquid-staking': 'what-is-liquid-staking',
  'what-is-a-liquid-staking-token-lst': 'what-is-liquid-staking',
  'is-liquid-staking-better-than-traditional-staking': 'what-is-liquid-staking',
  // Validators & Staking Marketplace
  'how-does-hipo-choose-validators': 'how-does-hipo-select-validators',
  'can-any-validator-participate-in-hipo': 'how-does-hipo-select-validators',
  'how-does-the-validator-auction-work': 'how-does-hipo-select-validators',
  'what-makes-hipo-different-from-traditional-staking-protocols': 'how-does-hipo-select-validators',
  'what-collateral-do-validators-provide': 'what-happens-if-a-validator-underperforms',
  'why-does-hipo-often-offer-higher-apy-than-other-staking-protocols-on-ton':
    'why-can-hipo-offer-competitive-staking-rewards',
  // Staking
  'can-i-stake-directly-from-my-wallet': 'how-do-i-stake-gram',
  'can-i-stake-more-after-my-initial-deposit': 'how-do-i-stake-gram',
  'can-institutions-use-hipo': 'can-i-stake-with-a-multisig-or-cold-wallet',
  'does-hipo-charge-a-staking-fee': 'what-does-it-cost-to-stake',
  'where-can-i-see-current-fees': 'what-does-it-cost-to-stake',
  // Rewards & APY
  'do-i-receive-rewards-immediately': 'when-do-my-rewards-start',
  'is-apy-fixed': 'what-apy-does-hipo-offer',
  'what-affects-staking-apy': 'what-apy-does-hipo-offer',
  'why-does-apy-change-over-time': 'what-apy-does-hipo-offer',
  'does-hgram-earn-rewards': 'do-i-need-to-claim-rewards',
  'does-hipo-charge-a-management-fee': 'does-hipo-take-a-cut-of-my-rewards',
  // hGRAM
  'why-do-i-receive-hgram': 'what-is-hgram',
  'how-is-the-value-of-hgram-determined': 'is-1-hgram-always-equal-to-1-gram',
  'can-i-transfer-hgram': 'can-i-use-hgram-in-defi',
  'can-i-earn-rewards-and-use-defi-at-the-same-time': 'can-i-use-hgram-in-defi',
  // Unstaking
  'does-hipo-support-instant-unstaking': 'what-is-the-difference-between-full-and-instant-unstaking',
  // Security & risks
  'what-risks-should-i-consider': 'can-i-lose-my-funds',
  // HPO & Hipo Club
  'why-was-hpo-created': 'what-is-hpo',
  'does-hpo-generate-revenue-for-holders': 'what-benefits-do-hpo-holders-receive',
  'how-is-protocol-revenue-generated': 'what-benefits-do-hpo-holders-receive',
  // Retired sections
  general: 'getting-started',
  'ton-and-liquid-staking': 'getting-started',
  fees: 'what-does-it-cost-to-stake',
}
