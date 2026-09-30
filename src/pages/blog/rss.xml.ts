// /blog/rss.xml — every listed post, newest first (specs/blog-migration.md). `noindex` posts are left
// out, like everywhere else a post is advertised.
import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { listedPosts, postPath } from '../../blog/posts.ts'
import { getT } from '../../i18n/t.ts'

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const GET: APIRoute = async ({ site }) => {
  const { t } = getT('en', ['blog'])
  const posts = await listedPosts()
  return rss({
    title: t('blog.rss.title'),
    description: t('blog.rss.description'),
    site: new URL('/blog/', site).href,
    xmlns: { atom: 'http://www.w3.org/2005/Atom', dc: 'http://purl.org/dc/elements/1.1/' },
    // atom:link rel=self is what feed validators ask a feed to name itself with.
    customData: `<language>en</language><atom:link href="${new URL('/blog/rss.xml', site).href}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: postPath(post),
      pubDate: post.data.publishedAt,
      // RSS 2.0's <author> must be an email address; a name goes in Dublin Core's creator instead.
      customData: `<dc:creator>${escapeXml(post.data.author)}</dc:creator>`,
    })),
  })
}
