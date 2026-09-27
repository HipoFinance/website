# 2026-09-27 — Publish the Hipo Fund IPS as ratified

HPO holders ratified the Hipo Fund Investment Policy Statement by DAO vote on 18 September 2026. The docs still called
it a draft, and the Hipo Fund overview still described a single-signature wallet that the policy forbids. This session
marks the IPS as in force and rewrites the overview's custody description to match the fund's current wallets, in
English first and then in all ten other released locales. The work spanned two sessions (the brief and a first spec
were written on 2026-09-26); this report covers both.

| Commit         | Subject                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| (this session) | Publish the Hipo Fund Investment Policy Statement as ratified, with the new wallets |

## Investment Policy Statement page

- The "draft under community review, not yet in force" caution became a `:::note[Ratified]` aside with the vote result
  (7.8M HPO for, 0 against, 37 wallets), a link to the proposal on ton.vote, and what now needs a further DAO vote.
- The version line is now `v1.0 · In force since 18 September 2026`, and a ratification footer closes the page.
- A new meta description. The title tag already read `Hipo Fund Investment Policy Statement | Hipo Docs`, and the
  sidebar entry was already in place.
- **The policy text itself is byte-identical** in every locale: the text people voted on is the text in force.
  "Draft v1.5" is the version that was ratified, published as v1.0.

## Hipo Fund overview page

- The Wallets section is now a table of three 2-of-3 multisigs (Chain | Holds | Address):
  - TON `hipofund.ton`;
  - an Ethereum Safe holding USDC supplied on Aave, with a note that the same Safe also exists on Base;
  - Bitcoin.
- The old single-signature TON wallet is described as it is on-chain: empty at rest and not a custody location, but
  still the TON multisig's proposer, and usable as a brief transit hop for cross-chain moves under IPS §4.1.
- The Bitcoin wallet was replaced on 27 September, after one of the previous wallet's three keys turned out to be
  incorrect. The page gives the new address and lists the old ones as empty.
- Four other sentences on the page were rewritten because they contradicted the ratified status or the new custody:
  - "published as a draft";
  - "the two wallets above";
  - "going to a binding vote";
  - "part of the fund sits in a single-signature wallet".
- The Current status table gained an "Investment Policy Statement — Ratified by DAO vote" row.

## Decisions

- **Ethereum, not Base, for the USDC row.** The plan was Aave on Base, but the position ended up on Ethereum mainnet.
  We published what is true now rather than moving the funds back first.
- **One published Bitcoin address.** While the old wallet was in use, listing every address was considered. That was
  dropped once all the BTC sat at a single address in the new wallet.
- **"At rest" wording.** On 26 September the multisig routed USDT through the old single-key wallet to exchanges on
  its way to the Safe and the BTC wallet. The overview therefore says every asset _at rest_ is in a multisig, rather
  than claiming funds never leave one.
- **No test spend to prove the new Bitcoin address is 2-of-3** (declined). A P2WSH address reveals its script only
  when it first spends. The proof is left to the first ordinary spend, when it will be checked. Until then the claim
  rests on the team, as the "same three signers on every chain" claim does, which no chain can link.
- **Out of scope:** a 301 redirect of the old GitBook Hipo Fund pages (`docs.hipo.finance`, hosted on GitBook), and
  any change to the IPS custody table. That table lists no USDT on the TON multisig; the multisig currently holds some.

### Verification performed

- **On-chain audit** (read-only public APIs, via the money-auditor, run 2026-09-26 and again 2026-09-27):
  - every published address, checksum and explorer link;
  - the multisig thresholds and signer sets on TON, Ethereum and Base;
  - the old wallet's balance and proposer role;
  - the new Bitcoin address's balance;
  - the ton.vote result, recounted from the vote messages and HPO balances at the snapshot block.
- **English:** the dev server showed no horizontal page scroll at 390 px and 1280 px, and the rendered `<title>` and
  meta description were correct.
- **Locales:**
  - A script confirmed that every address and URL in each locale matches the English.
  - Each IPS diff touches only the description, the aside, the version line and the footer.
  - In the built output, each locale's overview links to its own IPS, and its §4.1 anchor resolves.
- **Build and checks:**
  - `node scripts/check-i18n.mjs` reports ok, 0 warnings.
  - `npm run build` builds 596 pages.
  - `scripts/i18n-selftest.mjs` passes.
  - The Persian overview on the preview at 390 px had no page scroll.

### Follow-ups

- The December quarterly report should publish both legs of the 26 September cross-chain transfers, with transaction
  hashes, as IPS §4.1 requires, and explain the small Bitcoin test transfers made while the new wallet was set up.
- Check the new Bitcoin address's revealed script after its first spend.
- Native review of the new translated passages, especially the rendering of "at rest" in ar, fa and id.
- In ar and fa, a shortened address such as `bc1qqz9m…g3jp` can split across two lines. This comes from the site-wide
  address-wrapping rule.
