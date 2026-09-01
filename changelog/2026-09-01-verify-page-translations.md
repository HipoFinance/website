# `/verify/` in every released locale

`/verify/` shipped on 2026-08-29 and grew its raw wallet addresses and a site-wide footer link on
2026-08-31, both times as a deliberately English-only page: the copy lived inline in
`src/pages/verify.astro`, the layout was passed `localized={false}` so `hreflang` would not advertise
twins that did not exist, and `site.footer.verify` carried the literal English string "Verify" in all
ten catalogs. This session removed that exception. The page is now a shared route with a catalog
namespace of its own, has a `[locale]` twin, and is translated into all nine released locales — as is
the footer link that leads to it, in both the site footer and the docs footer.

The reason to translate this page before any other English-only page is who reads it and when. A
reader arrives at `/verify/` because a stranger has just messaged them claiming to be Hipo, and they
have a decision to make in the next minute. Everything else on the site can afford an English
fallback; a list of things Hipo will never ask you to do cannot. The impersonation message itself is
written in the reader's language, and until now our rebuttal was not.

| Commit    | Description                                             |
| --------- | ------------------------------------------------------- |
| `3bf2c61` | Translate `/verify/` into every released locale         |
| (this)    | Record the verify-translation commit hash in the report |

## What changed

### The page became a shared route

`src/pages/verify.astro` is now a four-line wrapper around the new
`src/components/routes/VerifyRoute.astro`, and `src/pages/[locale]/verify.astro` is its twin with
`export const getStaticPaths = localeParams` — the same pair `/faq/` has had since the multi-language
work. `localized={false}` is gone from the layout call, so the page picks up the full `hreflang` set
and `og:locale:alternate` list like every other localized route, and `src/components/SEO.astro`'s
comment about it was corrected: `/vs/` is now the only English-only page.

The structural data on the page — the two wallet entries, the three contract addresses, the Telegram
channels, the team handles, the four social accounts — stays in the component. Only the prose moved
into the catalog. Addresses are still derived at build time from the single `UQ…` string with
`@ton/core`, which is the property that matters most here: there is exactly one hand-copied address
per account in the repository, in one locale, and the other nine cannot drift from it because they do
not contain it.

### A new `verify` catalog namespace

`src/i18n/<locale>/verify.json` holds the 31 translatable strings. The namespace had to be registered
in `src/i18n/t.ts` (`NAMESPACES` and the `CatalogKey` union); `scripts/check-i18n.mjs` needed no
change at all, because it discovers namespaces from the files on disk, and it immediately started
failing with 297 missing-key errors across the nine locales (33 items × 9) — which is exactly the behaviour the gate
exists for, and which is how the translation work was scoped.

The page title and meta description went into the existing `seo` namespace as `seo.verify.title` and
`seo.verify.description`, next to every other page's pair, rather than into `verify.json`. That is
consistency with the other eight routes rather than a fresh judgement; the cost is that `seo.json` is
excluded from the sitemap's content inputs, so an SEO-only copy change on this page will not move its
`lastmod`. That is the safe direction, and the same trade every other page already makes.

Four keys were drafted and then dropped before translation: `verify.web.x`, `.github`, `.medium` and
`.youtube`. They are platform names, not descriptions, and putting them in a catalog would have
invited nine translators to render "GitHub" nine ways. They are literals in the component with a
comment saying why.

### Bidi

Every Latin token that sits inside translated prose on this page carries `dir='ltr'`: the wallet DNS
names, both address forms, the contract names and their Tonviewer links, the Telegram handles, the
team handles and the social hostnames — 21 elements on the Persian page. Without it, an address
ending in a hyphen or an underscore reorders against the surrounding Arabic or Persian text and a
reader comparing it character by character against what their wallet shows is being asked to do the
one thing this page exists to make easy. The `dir` attribute rather than the `num` utility, because
these are strings, not formatted numbers, and `dir` gives the isolation and the direction in one.

### The footer link

`SiteFooter.astro` and the Starlight `Footer.astro` override both now build the href through
`localizedPath('/verify/', locale)`, so a Persian reader on `/fa/docs/security/…` gets `/fa/verify/`
rather than being dropped into English at the moment they are least able to cope with it. The label
`site.footer.verify` was translated in all nine locales; English keeps "Verify", so no `meta.json`
source hash moved for it.

### Sitemap

`src/data/lastmod.mjs` gained `verify: { catalogs: ['verify.json'], prose: [] }` in `ROUTES` and lost
its `ENGLISH_ONLY` entry, so all ten `/verify/` URLs are dated by the git history of their own
catalogs. `vs` is the only remaining `ENGLISH_ONLY` page.

## Translation notes

The nine locales were translated in parallel against `src/i18n/GLOSSARY.md`, each locale's existing
`site.json`/`faq.json` for register, and — deliberately — that locale's own
`src/content/docs/<locale>/security/phishing-awareness-and-prevention.md`, so that "scam",
"impersonator", "seed phrase" and "wallet" read the same on the page and in the docs page it links
to. Terminology decisions flagged by translators for a native reviewer are recorded per locale in the
`meta.json` review flags, which are all `reviewed: false` as usual.

### Verification performed

- `npm run build` — the `check-i18n` prebuild gate passes, 523 pages built.
- All ten `/verify/` URLs are emitted, appear in `sitemap-0.xml` with their full `xhtml:link`
  alternate set, and the English page carries all ten `hreflang` links plus `x-default`.
- `/fa/`, `/fa/docs/` and the other localized footers link `/<locale>/verify/`.
- `dir='ltr'` is present on all 21 Latin tokens of the Persian page.
- `npx prettier --check` on every file touched.

### Follow-ups

- None of the nine translations has had a native review; that is this repo's normal state and the
  review flags say so.
- `/vs/` is still English-only. It is an outreach landing page whose figures are baked in at build
  time, and its audience arrives from a wallet message that we sent — a different case from
  `/verify/`, whose audience arrives from a message we did not send. Left as it is on purpose.
