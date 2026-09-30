// Queries and derived values for the blog pages (specs/blog-migration.md). Build-time only: it reads the
// `blog` content collection.
import { getCollection, type CollectionEntry } from 'astro:content'
import { stripMarkdown } from '../components/pages/jsonLd.ts'
import { formatDate } from '../i18n/format.ts'

export type Post = CollectionEntry<'blog'>

const RELATED_COUNT = 3
// A common reading-speed figure for online prose; the byline rounds up, so a short post reads "1 min".
const WORDS_PER_MINUTE = 230

// Every post, newest first; ties (two posts on one day) fall back to the slug so the order is stable.
export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection('blog')
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || a.id.localeCompare(b.id))
}

// The posts a listing may show: the index, the RSS feed and the related-posts fallback. A `noindex`
// post is still built and reachable by its URL, but nothing on the site advertises it.
export async function listedPosts(): Promise<Post[]> {
  return (await allPosts()).filter((post) => !post.data.noindex)
}

export function postPath(post: Post): string {
  return `/blog/${post.id}/`
}

// Up to three posts for the end of `post`: its `related` slugs in the order given (a repeated slug
// counted once; an unknown or noindex slug skipped with a console.warn — naming the post and the slug —
// so a typo cannot silently break the build of an unrelated post, but is still visible), topped up with
// the newest posts.
export function relatedPosts(post: Post, listed: readonly Post[]): Post[] {
  const others = listed.filter((other) => other.id !== post.id)
  const seenSlugs = new Set<string>()
  const picked: Post[] = []
  for (const slug of post.data.related ?? []) {
    if (seenSlugs.has(slug)) {
      continue
    }
    seenSlugs.add(slug)
    const other = others.find((candidate) => candidate.id === slug)
    if (other === undefined) {
      console.warn(`Blog post "${post.id}": related slug "${slug}" does not exist or is noindex`)
      continue
    }
    picked.push(other)
  }
  for (const other of others) {
    if (picked.length >= RELATED_COUNT) {
      break
    }
    if (!picked.includes(other)) {
      picked.push(other)
    }
  }
  return picked.slice(0, RELATED_COUNT)
}

export function readingMinutes(post: Post): number {
  // Images carry alt text, not reading: drop them before stripMarkdown turns them into words.
  const text = stripMarkdown((post.body ?? '').replace(/!\[[^\]]*\]\([^)]*\)/g, ''))
  const words = text === '' ? 0 : text.split(' ').length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

// Dates are calendar days (frontmatter `2026-07-23` parses as UTC midnight), so they are formatted in
// UTC: a build machine west of Greenwich would otherwise print the day before.
export function formatPostDate(date: Date): string {
  return formatDate('en', date, { dateStyle: 'medium', timeZone: 'UTC' })
}
