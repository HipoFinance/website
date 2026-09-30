// /blog/<slug>/og.png — the post's share card: its hero cropped to 1200×630, the size Open Graph and X
// render without letterboxing (specs/blog-migration.md, Pages and head). Static, like every route here:
// one PNG per post, written at build time. sharp is the same devDependency Astro's image service uses.
import type { APIRoute, GetStaticPaths } from 'astro'
import sharp from 'sharp'
import { allPosts, type Post } from '../../../blog/posts.ts'

export const getStaticPaths = (async () => {
  return (await allPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }))
}) satisfies GetStaticPaths

export const GET: APIRoute<{ post: Post }> = async ({ props }) => {
  // `fsPath` is the source file behind an image() field: Astro exposes it on the metadata object (it
  // is not enumerable), and it is the only way to get at the original pixels rather than a URL.
  const source = (props.post.data.hero as { fsPath?: string }).fsPath
  if (typeof source !== 'string') {
    throw new Error(`blog/${props.post.id}: hero has no source path to render og.png from`)
  }
  // `attention` centres the crop on the most detailed region rather than the geometric middle, which
  // keeps a chart's title or a face in frame when the hero is taller than 1200:630.
  const png = await sharp(source)
    .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
    .png()
    .toBuffer()
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
}
