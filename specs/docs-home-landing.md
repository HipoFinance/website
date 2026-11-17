# A landing layout for the docs home

**Status:** implemented

## Goal

`/docs/` should open like a front door, not like one more article: a short hero that says what Hipo is
and where to start, then the docs' sections as cards a reader can scan, in all eleven locales.

## In plain terms

Today the docs home is an ordinary docs page: a marketing banner, a paragraph, a YouTube video, a
yellow-green "just here to act?" box, a sentence about risks, and then six headed lists of links
("Start here", "Use Hipo", "Tokens and governance", "Verify for yourself", "For developers", "Still
have a question?"), with the full docs menu on the left. The lists are good — each link has a
one-line summary, written and translated by hand — but a reader sees a long page of bullets.

The landing keeps those words and changes how they are laid out:

1. **A hero at the top**: the page title large, the one-paragraph description beneath it, and two
   buttons — "How Hipo Works" (into the docs) and "Open app" (the staking app). On a wide screen the
   video sits beside the text; on a phone it comes below the buttons.
2. **The sections as cards**: each of the five link lists becomes a card with its heading and its
   links, each link on its own line with its summary under it in a quieter colour. Three cards across
   on a wide screen, two on a tablet, one on a phone.
3. **"Still have a question?"** becomes a closing strip across the bottom, and the risks sentence a
   short note under the hero.

The page loses the docs menu column (the cards are the map of the docs; every other docs page keeps the
menu), the marketing banner image, and the "just here to act?" box, whose links the hero buttons
replace. Nothing needs translating: the hero's text and the cards' words are already in every locale,
and the two button labels reuse strings the site already has. The page title, description and URL do
not change.

How it is built: Starlight has a "splash" page type made for a docs home. The hero comes from the page's
own settings (title, description, video), styled by our own version of Starlight's hero part. The cards
are made from the existing Markdown when the site is built: a small build step wraps each heading and
the list under it into a card, and splits each line at its dash into the link and its summary. Writers
keep editing plain Markdown.

The risk is small and visible: if a translated page used a different shape (no dash, a missing
heading), its cards would look off, which the screenshots of all eleven locales catch. Rollback is one
commit.

Decisions needed: three, in Open questions (video or banner in the hero, keeping the menu column, and
the "just here to act?" box).

## Definitions

**Concepts**

- **Docs home**: the page at `/docs/` and `/<locale>/docs/`, from `src/content/docs/index.md` and
  `src/content/docs/<locale>/index.md`.
- **Splash**: Starlight's `template: splash` page type: no docs menu and no "On this page"
  (`node_modules/@astrojs/starlight/utils/routing/data.ts:54`), and the `hero` frontmatter is drawn
  in place of the page title.
- **Hero**: Starlight's `Hero` part (`components/Hero.astro`), fed by the page's `hero` frontmatter
  (`title`, `tagline`, `image`, `actions`). We override it.
- **Section card**: one `## Heading` of the docs home with the list below it, wrapped at build time.
- **Docs bar, PageFrame**: as in `specs/docs-site-chrome.md`.

## Context

- The docs home's Markdown (`src/content/docs/index.md`, 61 lines) is a banner `<figure>`, a lead
  paragraph, a YouTube `<iframe class="docs-embed">`, a `:::tip` box, a risks paragraph, then six `##`
  sections: five lists whose items read `[Link](/docs/…) — summary.` and a closing paragraph.
- All ten translations have the same shape: six `##` headings, the same order, the `—` separator
  (checked in fa, ar, ru, de; the build step checks every locale, see Acceptance).
- Starlight wraps each heading in `div.sl-heading-wrapper.level-h2` with its anchor link
  (`integrations/heading-links.ts:43`), so the card step must find a section's heading inside that
  wrapper too.
- On a splash page `hasSidebar` is false, so our `PageFrame.astro` renders no menu column and the docs
  bar shows no "Contents" button, and `TwoColumnContent.astro` gets no "On this page".
- The site already has the button strings: the sidebar's "How Hipo Works" label in every
  `src/i18n/<locale>/docs-sidebar.json`, and `site.cta.openApp` in every `site.json`.
- The primary button style is the coral pill with the hard shadow (`.claude/rules/styling.md`); cards
  are `bg-surface border-border rounded-card` across the site.

## Approach

1. **Splash and hero frontmatter, in all eleven `index.md`.** Add `template: splash` and a `hero` with
   `tagline:` the lead paragraph (moved from the body, same words) and `image.html:` the YouTube
   `<iframe>` (moved from the body). Remove the banner `<figure>` and the `:::tip` box. The title and
   description are unchanged. This is a move and a deletion, no new words.
2. **`src/components/starlight/Hero.astro` override.** Renders the title (display face, the site's 44px
   page-title size), the tagline (`text-lead`, muted), and two actions built in the component, not from
   frontmatter, so no locale has to repeat them: "How Hipo Works" (the sidebar label of
   `/docs/introduction/how-does-hipo-work/`, primary coral pill) and "Open app" (`site.cta.openApp`,
   `/stake/`, outlined pill). Both links localized. From `lg` the text and the video sit side by side
   (video 16:9, `rounded-card`); below `lg` they stack. Only the docs home uses the hero.
3. **`src/i18n/rehype-docs-home-cards.mjs`, a rehype step on the docs home only** (matched by path:
   `src/content/docs/index.md` or `src/content/docs/<locale>/index.md`). It walks the top level of the
   page: each `h2` (bare or inside `.sl-heading-wrapper`) opens a `<section class="docs-home-card">`
   holding everything up to the next `h2`; a section without a list gets `docs-home-strip` instead.
   In each list item, the text after the first `—` goes into `<span class="docs-home-summary">` and
   the dash is dropped. Content before the first `h2` (the risks note) is left as it is. The step
   throws, failing the build, if a docs home has no `h2` or a list item has no link — the shape the
   layout relies on. Registered in `astro.config.mjs` under `markdown.rehypePlugins`.
4. **Styles in `src/styles/docs.css`** (inside `@layer starlight`, site tokens only): the hero; a
   card grid wrapping the sections (`.sl-markdown-content:has(> .docs-home-card)` as the grid, 1 / 2 /
   3 columns at phone / 640 px / 1024 px, with the strip spanning all columns); cards as the site's
   (`surface`, `border`, `rounded-card`, 24 px padding); links in `text` weight 500 turning coral on
   hover, no underline, summaries `text-muted` `text-small` on their own line; heading anchors hidden
   inside cards.
5. **Notes and log**: `.claude/rules/docs.md` gets a line on the docs home (splash, hero override, the
   card step and the shape it requires); `CHANGELOG.md` gets an entry.

Rejected:

- **MDX with Starlight's `<CardGrid>`/`<LinkCard>`.** Needs the MDX integration and rewriting eleven
  pages as components, with the summaries moved into props; translators would then edit JSX.
- **Cards generated from the sidebar config.** Always in step with the menu, but the menu has 50-odd
  entries in ten groups, and the hand-picked lists with their summaries are the better front door;
  the summaries would need new strings in every locale.

## Changes

- `src/content/docs/index.md` and the ten `src/content/docs/<locale>/index.md` — `template: splash`,
  `hero` (tagline, video); banner and tip removed.
- `src/components/starlight/Hero.astro` (new) — the hero.
- `src/i18n/rehype-docs-home-cards.mjs` (new) — the card step.
- `astro.config.mjs` — wire `Hero`; register the card step.
- `src/styles/docs.css` — hero, grid, card, strip rules.
- `.claude/rules/docs.md`, `CHANGELOG.md`.

## Acceptance criteria

Checked on `npm run build` + `npm run preview` (a free port), at 320, 390, 768, 1024 and 1440 px, dark
and light, in every built locale for the structural checks and in `en` and `fa` for the screenshots.

- [x] `/docs/` in every built locale renders the hero (title, tagline, two buttons, video) and five
      section cards plus one closing strip; the build fails on a docs home of another shape. _All 11
      checked in the browser: one h1, video, 5 cards, 1 strip, 26 summaries; the step's throw is in
      code, not exercised by a broken page._
- [x] The buttons link to `/<locale>/docs/introduction/how-does-hipo-work/` and `/<locale>/stake/`
      (no prefix in `en`), labelled with the existing translated strings.
- [x] Every link and summary of the old lists is on the new page: the set of `href`s inside `main` of
      each locale's built docs home equals the old one minus the tip's links and the banner image.
      _Only `/unstake/` and `/stats/` (localized) are gone in each locale; `/stake/` stays via the button._
- [x] Cards sit 3 across from 1024 px, 2 from 640 px, 1 below; the hero text and video are side by
      side from 1024 px and stacked below; in `fa`/`ar` the order mirrors.
- [x] No horizontal page scroll at 320 px on the docs home in any built locale.
- [x] The docs home has no menu column, no "Contents" button and no "On this page"; every other docs
      page is unchanged. _Compared with a build of the pushed commit, scope-class hashes normalised: of
      599 docs pages only the 11 homes and the Ukrainian pages (the "Документація" fix) differ._
- [x] Text in cards and hero holds 4.5:1 contrast in both schemes. _5.0–16.0:1; the strip's links
      first measured 3.1:1 in light and now use the darker accent (5.6:1)._
- [x] Search still finds the docs home by a phrase from a card summary and by the tagline. _It is
      among the results for both (6th and 4th: other pages share the phrases), first for its title._
- [x] `npm run build`, `node scripts/check-i18n.mjs` and the i18n selftest pass.

## Risks & rollback

- **A translation of another shape** gives a broken card; the build step throws instead of rendering
  it, so it is caught before deploy.
- **The video in the hero** loads a YouTube frame above the fold. It is the `youtube-nocookie` embed
  with `loading="lazy"` as today; on phones it sits below the buttons.
- **Starlight internals**: the hero override and `template: splash` behaviour are Starlight 0.40's;
  the 0.41 bump re-checks them (already noted in `.claude/rules/docs.md` for the frame).
- A push to `main` publishes at once; English is reviewed first, then the ten locales (the content
  move in step 1), then commit and push on Behrang's word.
- Rollback: revert the commit.

## Open questions

Decided by Behrang on 2026-11-17, all three as recommended: the video beside the hero text and the
banner dropped from the docs home; no menu column on the docs home (splash); the "Just here to act?"
box removed. The Ukrainian "Documentation" string fix ("Уся документація" → "Документація") ships in the
same commit.
