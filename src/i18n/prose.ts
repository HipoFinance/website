// Long-form copy (FAQ answers, HPO FAQ, app-shell explainer cards and their JSON-LD Q&As) lives in the
// Markdown `prose` content collection at src/content/prose/<locale>/… (spec §C, decision 7). Entry ids
// are `<locale>/faq/<section>/<anchor-id>`, `<locale>/hpo-faq/<nn>-<slug>`,
// `<locale>/shell/<page>/cards/<nn>-<slug>` and `<locale>/shell/<page>/faq/<nn>-<slug>`.
import { getCollection, type CollectionEntry } from 'astro:content'
import type { Locale } from './locale.ts'

export type ProseEntry = CollectionEntry<'prose'>

// All prose entries under `<locale>/<prefix>/`, sorted by frontmatter `order`. No fallback to English:
// a released locale must carry every entry (decision 4); the check script enforces it.
export async function getProse(locale: Locale, prefix: string): Promise<ProseEntry[]> {
  const start = `${locale}/${prefix.replace(/^\/+|\/+$/g, '')}/`
  const entries = await getCollection('prose', (entry) => entry.id.startsWith(start))
  return entries.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
}
