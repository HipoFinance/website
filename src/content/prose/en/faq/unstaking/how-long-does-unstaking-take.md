---
order: 3
section: 'unstaking'
question: 'How long does unstaking take?'
---

That depends on which of the two options you pick.

**Instant** is what its name says: if it succeeds, your GRAM arrives in the same chain of messages, normally within seconds. If Hipo is not holding enough free GRAM at that moment, the option is unavailable and you use Full instead.

**Full** is settled after the current validation round ends, so there is a wait. The app shows you how long is left before your GRAM arrives.

That wait comes from TON’s validation cycle rather than from a fixed Hipo lock-up: a round runs for roughly 18 hours, and stakes stay frozen for about 9 more hours afterwards before they can be recovered. Hipo spreads its stake across consecutive rounds, so a recovery window opens roughly every 18 hours.

A Full unstake lands somewhere in that cycle, so a typical wait is around 9 hours and a single-round wait tops out near 18. In some cases you may have to wait up to 36 hours, if all of Hipo’s smart contract funds are locked during the staking rewards process — that is the worst case, where a request just misses one window and has to wait for the one after it.
