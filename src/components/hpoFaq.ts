// Anchor ids for the /hpo/ FAQ, shared by the page (Hpo.astro) and its FAQPage JSON-LD
// (HpoRoute.astro) so both name the same fragment.
//
// The id is the prose file name minus its `NN-` order prefix — the prefix only fixes the display
// order, so dropping it keeps a deep link alive when items are renumbered. Translated prose keeps
// the English file names (the i18n gate requires the same relative paths in every locale), so the
// anchors are the same English slugs on `/fa/hpo/` as on `/hpo/`, exactly like the /faq/ anchors.
export function hpoFaqAnchor(entryId: string): string {
  return entryId.slice(entryId.lastIndexOf('/') + 1).replace(/^\d+-/, '')
}
