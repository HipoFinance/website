# 2026-08-13 — Tokenomics donut with a live, animated burn arc

Behrang asked for the burned amount to appear in the tokenomics chart itself — the chart
was a static image, so the request became: re-implement it as an SVG and give the burned
figure a dynamic, animated presence that draws the eye.

| Commit    | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `f1263d8` | Rebuild the tokenomics chart as a live SVG donut with a burn arc. |

### From image to inline SVG

`public/images/tokenomics.svg` was a Google-Sheets donut export in the Google palette —
off-brand since the Warm Dark redesign, and unreachable by script. It is deleted (nothing
else referenced it). `Hpo.astro` now renders an inline donut from the six allocations in
the tokenomics doc (Community 30, Liquidity 20, Team 20, Marketing 15, Treasury 13,
Advisers 2), each slice a `pathLength=100` circle with dasharray/dashoffset geometry
computed in the frontmatter, Community in the coral accent. A legend sits beside the
chart (below it on mobile) and the SVG carries an `aria-label` listing the allocation.

### The burned layer

Deliberately **not** a seventh slice: the category percentages are shares of the 1B
minted and always sum to 100, so carving a burned slice out of the ring would falsify
them. Instead the burned figure gets its own layer — a glowing ember arc just inside the
ring sweeping from zero to the burned share of supply (~2.22% today), and the exact
figure counting up in the donut hole ("🔥 22,211,464 / HPO burned so far", selectable so
it can be copied). `hpo-data.js` only sets the arc's dasharray; a scoped CSS transition
in `Hpo.astro` turns that into the sweep.

The reveal is gated on an IntersectionObserver (threshold 0.4) so the animation plays
when the chart is actually seen, not on page load far above the fold. Reduced-motion
users get the final number immediately (the CSS transition is also disabled). The data
path is unchanged from yesterday's hotfix — TON v4 `get_jetton_data`, burned = 1B minus
on-chain supply; on failure the hole keeps its em dash and the arc stays flat.

### Verification performed

- Build clean; built HTML carries all six slices plus the zeroed burn arc, and no
  reference to the deleted image remains.
- Browser pass against `npm run preview`: on a fresh load the reveal fired on scroll —
  counter caught mid-animation at 18.1M en route to 22,211,464, arc at 2.22%, no console
  errors. Legend, gaps, and the ember glow render as intended.
- Observed: the v4 `get_jetton_data` call can take ~15 s when the current block's CDN
  cache is cold; the scroll gate means a late arrival still animates in view.

### Follow-ups

- If the gauge ever exposes the burned figure (asked of Alireza in the hotfix entry),
  the same reveal path can consume it and drop the two v4 calls.
- The burn arc could gain a hover tooltip naming its percentage; skipped for now to keep
  the card quiet.
