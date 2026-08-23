// Shared JSON-LD building blocks for the static pages (specs/faq-restructure.md, "FAQPage JSON-LD").
// The dApp shell (shellJsonLd.ts) and the /faq/ and /hpo/ routes emit the same WebPage + FAQPage
// shape from the `prose` collection; the layouts pass the result to SEO.astro as `jsonLd`.
import { langOf, localizedPath, type Locale } from '../../i18n/locale.ts'

export const SITE = 'https://hipo.finance'

// Reduces a Markdown answer to the plain text schema.org wants in `acceptedAnswer.text`: tags,
// links (keeping their label), emphasis, code, backslash escapes and block markers out, whitespace
// collapsed. Lines are handled first (list bullets, ordered-list numbers, heading marks, block
// quotes) because those markers are only markers at the start of a line.
export function stripMarkdown(body: string): string {
  return body
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)]|#{1,6}|>)\s+/, ''))
    .join('\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|[.,;:!?]|$)/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!<>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface PageOptions {
  /** The page's root-relative English path, e.g. `/faq/`; localised for the locale's own URL. */
  path: string
  title: string
  description: string
  locale: Locale
}

/** The WebPage node every static page carries: its own localised URL, language and the site it belongs to. */
export function webPageNode({ path, title, description, locale }: PageOptions) {
  return {
    '@type': 'WebPage',
    name: title,
    description,
    url: new URL(localizedPath(path, locale), SITE).href,
    inLanguage: langOf(locale),
    isPartOf: { '@type': 'WebSite', name: 'Hipo', url: new URL(localizedPath('/', locale), SITE).href },
  }
}

export interface FaqQuestion {
  question: string
  /** The Markdown answer body; stripped to plain text, never truncated. */
  body: string
  /** The in-page anchor of this Q&A, when the page has one, so the Question node can point at it. */
  anchor?: string
}

// `@graph: [WebPage, FAQPage]` for a page whose Q&As are `questions`, already in visible order.
// With no questions (a locale whose prose is not there yet) only the WebPage node is emitted.
export function faqPageJsonLd(questions: readonly FaqQuestion[], page: PageOptions) {
  const webPage = webPageNode(page)
  if (questions.length === 0) return { '@context': 'https://schema.org', ...webPage }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      webPage,
      {
        '@type': 'FAQPage',
        inLanguage: webPage.inLanguage,
        mainEntity: questions.map(({ question, body, anchor }) => ({
          '@type': 'Question',
          name: question,
          ...(anchor === undefined ? {} : { url: `${webPage.url}#${anchor}` }),
          acceptedAnswer: { '@type': 'Answer', text: stripMarkdown(body) },
        })),
      },
    ],
  }
}
