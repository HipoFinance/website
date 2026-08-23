// The site FAQ's sections, in page order (specs/faq-restructure.md, "Site FAQ"). `id` is the
// `<section id>` deep-link anchor and the prose directory (src/content/prose/<locale>/faq/<id>/),
// identical in every locale; `key` selects the translated heading and nav label in
// src/i18n/<locale>/faq.json (`faq.section.<key>.heading` / `.nav`). FAQ.astro renders in this
// order and the FAQPage JSON-LD (src/components/pages/jsonLd.ts) sorts its questions by it, so the
// structured data always matches the visible page.
export const FAQ_SECTIONS = [
  { id: 'getting-started', key: 'gettingStarted' },
  { id: 'staking', key: 'staking' },
  { id: 'rewards', key: 'rewards' },
  { id: 'hgram', key: 'hgram' },
  { id: 'unstaking', key: 'unstaking' },
  { id: 'security', key: 'security' },
  { id: 'validators-and-staking-marketplace', key: 'validators' },
  { id: 'hpo-token', key: 'hpoToken' },
  { id: 'support', key: 'support' },
] as const

export type FaqSectionId = (typeof FAQ_SECTIONS)[number]['id']

/** Position of a section id in page order; -1 for an unknown (e.g. retired) section. */
export function faqSectionIndex(id: string | undefined): number {
  return FAQ_SECTIONS.findIndex((section) => section.id === id)
}
