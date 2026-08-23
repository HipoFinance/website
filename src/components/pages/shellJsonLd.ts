import { getCollection } from 'astro:content'
import type { Locale } from '../../i18n/locale.ts'
import { faqPageJsonLd } from './jsonLd.ts'

export type ShellPage = 'stake' | 'unstake' | 'rewards' | 'stats' | 'defi'

interface Options {
  page: ShellPage
  title: string
  description: string
  locale: Locale
}

// Builds the JSON-LD for a dApp shell page: a WebPage node plus, when the `prose` collection has
// <locale>/shell/<page>/faq/ entries, a FAQPage whose Q&As come from those entries. URLs are the
// locale's own (`/stake/` for English, `/fa/stake/` for Persian). The shell FAQ bodies are plain
// text by convention; stripMarkdown (in jsonLd.ts) only guards against light Markdown slipping in.
export async function shellJsonLd({ page, title, description, locale }: Options) {
  const prefix = `${locale}/shell/${page}/faq/`
  const faq = (await getCollection('prose', (entry) => entry.id.startsWith(prefix))).sort(
    (a, b) => a.data.order - b.data.order,
  )
  return faqPageJsonLd(
    faq.map((entry) => ({ question: entry.data.question ?? '', body: entry.body ?? '' })),
    { path: `/${page}/`, title, description, locale },
  )
}
