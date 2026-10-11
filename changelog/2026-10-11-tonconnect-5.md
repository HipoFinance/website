# 2026-10-11 — TON Connect 5.0.0

TON Connect 5.0.0 shipped today with improved Gram Wallet support, and the announcement asked dApps
to update. The website goes from `@tonconnect/ui` 3.0.2 to 5.0.0 (which pulls `@tonconnect/sdk`
4.0.2 → 5.0.0).

| Commit         | Subject                   |
| -------------- | ------------------------- |
| (this session) | Take @tonconnect/ui 5.0.0 |

## Why a two-major jump was safe

There is no published 4.x of `@tonconnect/ui` — the line runs 3.1.0 → 5.0.0, renumbered to match
`@tonconnect/sdk` and `@tonconnect/ui-react`. No release notes are published and no changelog ships
in the tarball, so the API surface was diffed directly instead.

`@tonconnect/ui`'s `index.d.ts` differs by **two lines**, both additive: `WalletPreselectedEvent` and
`WalletSelectedEvent` join the `UserActionEvent` union, `SingleWalletModalState` is wrapped in
`OptionalTraceable` for an analytics trace id, and an error class gains a `static readonly
errorName`. Nothing is removed or renamed. `@tonconnect/sdk` is likewise additive — a new analytics
`url?` option, `is_restore` on `ConnectionCompletedEvent`, and new `ConnectionInitiatedEvent` /
`ConnectionLinkGeneratedEvent` types — with one removal, a constructor on an error subclass we do
not construct.

## The two things this repo pins to internals, both re-checked

`Model.ts` depends on two implementation details of the packages, and both were verified against
5.0.0 before the bump rather than after:

- **The restored-session localStorage key.** `tonConnectSessionKey =
'ton-connect-storage_bridge-connection'` is how the island decides synchronously whether to fetch
  the wallet layer on load. Still present in `@tonconnect/sdk` 5.0.0, unchanged.
- **The DOM hooks behind `keepRuntimeStyles` and `trackInputModality`.** These adopt TonConnect's
  goober stylesheet and its Solid portals across a ClientRouter swap, and track the focus-ring
  modality class. All three markers — `_goober`, `data-tc-dropdown-container` and `tc-using-mouse` —
  appear in 5.0.0 in the same files they did in 3.0.2.

## What the new modal looks like

The Gram Wallet improvement is visible: the modal now leads with "Use your Telegram wallet" and a
"Connect Telegram" button, gives **Gram Wallet** its own row, and lists the rest under "Or choose
another app" — Walt (labelled "ex. Wallet"), Keeper, My Wallet, and "View all wallets". The wallet
names match the renames this repo made on 2026-10-01, which is a coincidence of timing rather than
anything we did.

### Verification performed

- `npm run build` passes, 619 pages.
- **Code splitting intact.** The eager island is still 52.1 KB gzipped, byte-for-byte the budget
  `CLAUDE.md` records, and the TonConnect library stays in its own lazily-fetched chunk (119.7 KB
  gzipped). A static import creeping back in would have shown up here.
- Driven in a real browser against a local preview, in **both colour schemes**, with the connect
  modal opened:
  - light: `body` `rgb(250, 246, 239)`, modal surface `rgb(255, 255, 255)`
  - dark: `body` `rgb(32, 27, 26)`, modal surface `rgb(43, 36, 35)`

  so `syncTonConnectTheme` and the two `colorsSet` palettes still drive the modal under 5.0.0 —
  that was the main thing a major bump could have broken.

- The modal lists Gram Wallet, Walt, Keeper and My Wallet in both schemes. No console errors and no
  uncaught exceptions in either run.

### Follow-ups

- `club-web` (`@tonconnect/ui` ^2.3.1) and the Go proof verifier in `club-server` are handled
  separately; `club-server` has a real Gram Wallet problem that is not a version bump — see that
  repo's changelog.
- `sdk-example` is still on ^2.4.4. Left alone; it is an example, not a deployed surface.
- `vesting` loads `@tonconnect/ui@latest` from unpkg, so it took 5.0.0 in production automatically
  the moment it was published. Deliberately not changed: that repo tracks upstream and exists as a
  test deployment for them.
