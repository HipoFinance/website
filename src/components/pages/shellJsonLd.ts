import { getCollection } from 'astro:content'
import { langOf, localizedPath, type Locale } from '../../i18n/locale.ts'

export type ShellPage = 'stake' | 'unstake' | 'rewards' | 'stats' | 'defi'

interface Options {
  page: ShellPage
  title: string
  description: string
  locale: Locale
}

const SITE = 'https://hipo.finance'

// The shell FAQ bodies are plain text by convention; this only guards against light Markdown
// slipping in (emphasis, links, inline HTML, backslash escapes) so JSON-LD answers stay text.
function stripMarkdown(body: string): string {
  return body
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|[.,;:!?]|$)/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!<>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

// Builds the JSON-LD for a dApp shell page: a WebPage node plus, when the `prose` collection has
// <locale>/shell/<page>/faq/ entries, a FAQPage whose Q&As come from those entries. URLs are the
// locale's own (`/stake/` for English, `/fa/stake/` for Persian).
export async function shellJsonLd({ page, title, description, locale }: Options) {
  const inLanguage = langOf(locale)
  const webPage = {
    '@type': 'WebPage',
    name: title,
    description,
    url: new URL(localizedPath(`/${page}/`, locale), SITE).href,
    inLanguage,
    isPartOf: { '@type': 'WebSite', name: 'Hipo', url: new URL(localizedPath('/', locale), SITE).href },
  }
  const prefix = `${locale}/shell/${page}/faq/`
  const faq = (await getCollection('prose', (entry) => entry.id.startsWith(prefix))).sort(
    (a, b) => a.data.order - b.data.order,
  )
  if (faq.length === 0) return { '@context': 'https://schema.org', ...webPage }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      webPage,
      {
        '@type': 'FAQPage',
        inLanguage,
        mainEntity: faq.map((entry) => ({
          '@type': 'Question',
          name: entry.data.question,
          acceptedAnswer: { '@type': 'Answer', text: stripMarkdown(entry.body ?? '') },
        })),
      },
    ],
  }
}
