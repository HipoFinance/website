// Builds public/docs/images/brand-kit-file-1.zip — the ZIP linked from the Brand Kit docs page.
//
// The kit is assembled, never hand-curated: every mark in it is either a live site asset under
// public/ or one of the two lockups in brand/, and every raster is produced from those SVGs here.
// That is what keeps the downloadable kit from drifting away from what the site actually renders
// (the old kit still shipped hTON as the staking token, three years after it became hGRAM).
//
// Everything derived from a source file asserts the shape it expects and throws when it stops
// matching. A build that stops is cheap; a kit that quietly ships a blank logotype or a
// half-drawn coin to a listing site is not, and both of those already happened once while this
// script was being written.
//
// Run: npm run brand-kit   (needs the `zip` CLI, which macOS and CI both have)

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const staging = join(root, 'node_modules/.cache/brand-kit')
const kitName = 'Hipo Brand Kit'
const kit = join(staging, kitName)
const zipPath = join(root, 'public/docs/images/brand-kit-file-1.zip')

/** Palette — the subset of src/styles/global.css a partner actually needs. Keep in sync by hand:
 *  these are brand constants, not the full token set, and the kit should not churn on every
 *  surface-color tweak.
 *
 *  There are two creams and they are not interchangeable. #efebe5 is the mascot's body in every
 *  piece of artwork (public/images/hipo.svg, both lockups); #f5efe8 is --color-text, the cream
 *  the site sets copy in. Listing only the text one — which this file did at first — hands a
 *  partner the wrong fill for the one thing the README tells them not to get wrong. */
const PALETTE = [
  ['Coral', '#ff7e73', 'The brand accent. Buttons, highlights, the logotype.'],
  ['Coral (on light)', '#e0574b', 'Coral as text or an icon on a light ground, where #ff7e73 loses contrast.'],
  ['Coral shadow', '#c1544a', 'The hard offset shadow under coral buttons.'],
  ['Logo cream', '#efebe5', "The mascot's body in the dark-background logo."],
  ['Text cream', '#f5efe8', 'Body text on dark grounds.'],
  ['Ink', '#291f20', 'Body text on light grounds, and the label inside coral buttons.'],
  ['Linework', '#0e0e0e', 'The mascot outline in the dark-background logo.'],
  ['Warm dark', '#201b1a', 'Page background, dark scheme.'],
  ['Warm dark surface', '#2b2423', 'Cards and panels, dark scheme.'],
  ['Warm cream', '#faf6ef', 'Page background, light scheme.'],
  ['hGRAM brown', '#776464', 'The hGRAM coin face.'],
  ['HPO purple', '#7e22ce', 'The HPO coin face.'],
]

const file = (p) => readFileSync(join(root, p), 'utf8')

/** Internal notes — how to regenerate a file, which script recolors it — are useful in `brand/`
 *  and meaningless to a designer who has neither the repo nor the script. Strip them on the way
 *  into the kit. */
const publicSvg = (svg) => svg.replace(/^\s*<!--[\s\S]*?-->\s*\n/gm, '').replace(/^﻿/, '')

const out = (rel, data) => {
  const dest = join(kit, rel)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, typeof data === 'string' && rel.endsWith('.svg') ? publicSvg(data) : data)
}

/** Rasterize an SVG string. Pass a box for square art, a width alone for wide art. */
async function png(svg, rel, { width, height } = {}) {
  const buf = await sharp(Buffer.from(svg), { density: 600 })
    .resize({ width, height, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
  out(rel, buf)
}

/** The light-background recolor, by the same recipe that produced public/images/hipo-light.svg:
 *  drop the cream body fill so the mark sits on cream, white or a photo, and warm the linework
 *  from #0e0e0e to the palette ink. Coral moves to its on-light value for contrast.
 *
 *  These are exact-substring replacements against the hand-normalized style blocks in brand/, so
 *  they are whitespace-sensitive: run the sources through a formatter or re-export them from
 *  Illustrator and every replacement becomes a no-op. That failure is invisible — the output is a
 *  byte-identical copy of the dark file under a light name — so the post-condition below checks
 *  that no dark-scheme color survived rather than trusting the replacements to have fired. */
function toLight(svg) {
  const light = svg
    .replace('.body { fill: #efebe5; }', '.body { fill: none; }')
    .replaceAll('#0e0e0e', '#291f20')
    .replace('.word { fill: #ff7e73; }', '.word { fill: #e0574b; }')
    .replace('.word { fill: #efebe5; }', '.word { fill: #291f20; }')
  for (const dark of ['#efebe5', '#0e0e0e', '#ff7e73']) {
    if (light.includes(dark)) {
      throw new Error(`toLight: ${dark} survived the recolor — the style block in brand/ no longer matches this recipe`)
    }
  }
  return light
}

/** Pull the four logotype paths out of a lockup and fit a tight viewBox around them, measured by
 *  rasterizing and trimming — there is no path-geometry library in this repo and the letterforms
 *  are pure curves, so the pixels are the cheapest reliable ruler. */
async function logotype(lockup, fill) {
  const viewBox = lockup
    .match(/viewBox="([\d.\s-]+)"/)[1]
    .split(/\s+/)
    .map(Number)
  const paths = [...lockup.matchAll(/<path class="word"[^>]*\/>/g)].map((m) => m[0])
  // H, i, p, o. Without this the matcher failing leaves `words` empty, and an empty probe raster
  // trims to nothing — sharp reports zero offsets and the full size, so the viewBox falls back to
  // the whole lockup and three blank logotypes ship without the build so much as warning.
  if (paths.length !== 4) {
    throw new Error(`logotype: expected 4 .word paths in the lockup, found ${paths.length}`)
  }
  const words = paths.join('\n  ')
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(' ')}"><style>.word{fill:#000}</style>\n  ${words}\n</svg>`

  // Two passes on purpose: sharp runs trim ahead of resize inside a single pipeline, so the
  // offsets it reports would be measured against the raw SVG raster rather than the grid we
  // scaled to. Rasterize first, trim the finished bitmap second.
  const scale = 4
  const raster = await sharp(Buffer.from(probe), { density: 600 })
    .resize({
      width: viewBox[2] * scale,
      height: viewBox[3] * scale,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
  const { info } = await sharp(raster).trim({ threshold: 0 }).png().toBuffer({ resolveWithObject: true })

  // sharp reports the trim offsets as negative — how far the content moved, not where it starts.
  // Pin the convention: if a future sharp flips the sign, the viewBox becomes a window on empty
  // space and the logotype ships blank.
  if (info.trimOffsetLeft > 0 || info.trimOffsetTop > 0) {
    throw new Error('logotype: sharp reported positive trim offsets — the sign convention changed')
  }
  if (info.width >= viewBox[2] * scale || info.height >= viewBox[3] * scale) {
    throw new Error('logotype: the probe raster did not trim — the .word paths rendered empty')
  }

  const box = [
    viewBox[0] + -info.trimOffsetLeft / scale,
    viewBox[1] + -info.trimOffsetTop / scale,
    info.width / scale,
    info.height / scale,
  ].map((n) => Math.round(n * 100) / 100)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}">
  <style>.word { fill: ${fill}; }</style>
  ${words}
</svg>
`
}

/** HPO has no flat mark anywhere on the site — the coin is drawn dimensional in every place it
 *  appears, so `public/hpo.svg` and `public/images/app/hpo.svg` are the same artwork and shipping
 *  both as "HPO" and "HPO 3D" put the identical file in the kit twice. hGRAM ships flat and 3D
 *  because small sizes, listing sites and jetton metadata want the flat one, and HPO needs the
 *  same pair. Derive it: keep the face circle, the mascot body and its linework, drop the offset
 *  edge disc and the inner bevel, and square the viewBox on the face — which is exactly how
 *  public/hgram.svg is drawn next to public/images/hgram-3d.svg, hairline ring included. */
function flatCoin(svg) {
  const face = svg.match(/<circle class="cls-1" cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"\/>/)
  const edge = svg.match(/<path class="cls-5"[^>]*\/>\s*/)
  const bevel = svg.match(/<path class="cls-4"[^>]*\/>\s*/)
  const dead = svg.match(/<g class="cls-7">[\s\S]*?<\/g>\s*/)
  if (!face || !edge || !bevel) throw new Error('flatCoin: hpo.svg no longer has the face, edge and bevel this expects')
  if (!/class="cls-3"/.test(svg)) throw new Error('flatCoin: hpo.svg no longer has the mascot body this expects')

  const [cx, cy, r] = [face[1], face[2], face[3]].map(Number)
  let flat = svg.replace(edge[0], '').replace(bevel[0], '')
  if (dead) flat = flat.replace(dead[0], '')
  const round = (n) => Math.round(n * 1000) / 1000
  return flat
    .replace(/viewBox="[^"]*"/, `viewBox="${round(cx - r)} ${round(cy - r)} ${2 * r} ${2 * r}"`)
    .replace(
      face[0],
      `${face[0]}\n  <circle cx="${cx}" cy="${cy}" r="${r - 0.5}" fill="none" stroke="#000" stroke-opacity=".06"/>`,
    )
}

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Greedy wrap at `max` characters. A word longer than the column is left long rather than cut —
 *  `lastIndexOf(' ', max)` returning -1 used to slice the description's last character off and
 *  then repeat the whole string on the next line. */
function wrap(text, max) {
  const lines = ['']
  for (const word of text.split(' ')) {
    const line = lines.at(-1)
    if (line && (line + ' ' + word).length > max) lines.push(word)
    else lines[lines.length - 1] = line ? `${line} ${word}` : word
  }
  return lines
}

function paletteSheet() {
  const cols = 3
  const cw = 300
  const ch = 140
  const rows = Math.ceil(PALETTE.length / cols)
  const w = cols * cw + 60
  const h = rows * ch + 90
  const cells = PALETTE.map(([name, hex, use], i) => {
    const x = 30 + (i % cols) * cw
    const y = 100 + Math.floor(i / cols) * ch
    const lines = wrap(use, 40)
      .slice(0, 3)
      .map((line, n) => `<text x="${x + 86}" y="${y + 62 + n * 15}" font-size="11" fill="#8d7f76">${xml(line)}</text>`)
      .join('')
    // The near-black swatches (Ink, Linework, Warm dark, Warm dark surface) vanish against the
    // sheet's own warm-dark ground, so every swatch sits on a light plate and shows its edge.
    return `<rect x="${x - 4}" y="${y - 4}" width="78" height="78" rx="18" fill="#f5efe8"/>
    <rect x="${x}" y="${y}" width="70" height="70" rx="14" fill="${hex}"/>
    <text x="${x + 86}" y="${y + 24}" font-size="15" font-weight="600" fill="#f5efe8">${xml(name)}</text>
    <text x="${x + 86}" y="${y + 44}" font-size="13" fill="#ff7e73" font-family="monospace">${hex.toUpperCase()}</text>
    ${lines}`
  }).join('\n    ')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" font-family="Helvetica, Arial, sans-serif">
    <rect width="${w}" height="${h}" fill="#201b1a"/>
    <text x="30" y="52" font-size="26" font-weight="700" fill="#f5efe8">Hipo colors</text>
    <text x="30" y="76" font-size="13" fill="#c2b5ac">Hex values as used on hipo.finance. Full list in hipo-colors.css.</text>
    ${cells}
  </svg>`
  return { svg, width: w }
}

const colorsCss = () => `/* Hipo brand colors — the values used on hipo.finance.
   Coral has two roles: --hipo-coral is the fill (buttons, the banner) and stays #ff7e73 on any
   ground; --hipo-coral-on-light is the same coral as text or an icon on a light ground, darkened
   so it keeps its contrast. Do not use the fill value as a foreground on cream.
   The two creams are not interchangeable either: --hipo-logo-cream fills the mascot's body,
   --hipo-text-cream sets copy on a dark ground. */
:root {
${PALETTE.map(
  ([name, hex, use]) =>
    `  /* ${use} */\n  --hipo-${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}: ${hex};`,
).join('\n')}
}
`

const colorsTxt = () =>
  `Hipo brand colors\n\n` +
  PALETTE.map(([name, hex, use]) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return `${name.padEnd(20)} ${hex.toUpperCase()}   rgb(${r}, ${g}, ${b})\n${' '.repeat(20)} ${use}`
  }).join('\n\n') +
  '\n'

/** A minimal multi-size .ico, so the favicon in the kit is the same drawing as the PNGs beside it.
 *  `public/favicon.ico` is not: its linework is #776464, the pre-redesign brown, while everything
 *  rasterized from hipo.svg is #0e0e0e — copying it in would hand a partner two icons that don't
 *  match. (The site's own favicon being stale is a separate fix, on the site.)
 *
 *  ICO is a 6-byte header, one 16-byte directory entry per image, then the payloads. Every
 *  decoder since Vista reads a PNG payload, which is what sharp gives us. */
async function ico(svg, sizes) {
  const images = []
  for (const size of sizes) {
    images.push(
      await sharp(Buffer.from(svg), { density: 600 })
        .resize({ width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    )
  }
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(sizes.length, 4)

  let offset = 6 + 16 * sizes.length
  const entries = sizes.map((size, i) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0) // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette size: not paletted
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // color planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(images[i].length, 8)
    e.writeUInt32LE(offset, 12)
    offset += images[i].length
    return e
  })
  return Buffer.concat([header, ...entries, ...images])
}

/** Sorted, fixed-mtime, no directory entries — so rebuilding from unchanged inputs produces a
 *  byte-identical archive. The ZIP is tracked in git; without this every rebuild churns 2 MB of
 *  binary and a real change is indistinguishable from a re-run. */
function writeZip() {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
    )
  const files = walk(kit).sort()
  const epoch = Date.UTC(2026, 0, 1) / 1000
  for (const f of files) utimesSync(f, epoch, epoch)

  const list = files.map((f) => relative(staging, f).split(sep).join('/')).join('\n')
  const built = join(staging, 'kit.zip')
  // Build beside the staging tree and move it into place only on success: `zip` missing or
  // failing partway must not leave the tracked artifact deleted.
  execFileSync('zip', ['-9', '-X', '-q', '-@', built], { cwd: staging, input: list, env: { ...process.env, TZ: 'UTC' } })
  renameSync(built, zipPath)
  return files.length
}

async function main() {
  rmSync(staging, { recursive: true, force: true })
  mkdirSync(kit, { recursive: true })

  const horizontal = file('brand/horizontal-lockup.svg')
  const square = file('brand/square-lockup.svg')
  const mark = file('public/images/hipo.svg')
  const markLight = file('public/images/hipo-light.svg')

  // ---- Logo -------------------------------------------------------------------------------
  const logos = [
    ['Hipo Logo', mark, [256, 512, 1024], true],
    ['Hipo Logo (light backgrounds)', markLight, [256, 512, 1024], true],
    ['Hipo Horizontal Lockup', horizontal, [1024, 2048], false],
    ['Hipo Horizontal Lockup (light backgrounds)', toLight(horizontal), [1024, 2048], false],
    ['Hipo Square Lockup', square, [1024, 2048], true],
    ['Hipo Square Lockup (light backgrounds)', toLight(square), [1024, 2048], true],
  ]
  for (const [name, svg, sizes, squareArt] of logos) {
    out(`Logo/SVG/${name}.svg`, svg)
    for (const s of sizes)
      await png(svg, `Logo/PNG/${name} ${s}.png`, squareArt ? { width: s, height: s } : { width: s })
  }

  const wordmarks = [
    ['Hipo Logotype (coral)', '#ff7e73'],
    ['Hipo Logotype (cream, for dark backgrounds)', '#efebe5'],
    ['Hipo Logotype (ink, for light backgrounds)', '#291f20'],
  ]
  for (const [name, fill] of wordmarks) {
    const svg = await logotype(horizontal, fill)
    out(`Logo/SVG/${name}.svg`, svg)
    for (const s of [1024, 2048]) await png(svg, `Logo/PNG/${name} ${s}.png`, { width: s })
  }

  // The one composed asset: the mark on the brand background with its coral glow, for partners
  // who need a ready-made tile rather than a transparent mark. SVG has no style scoping, so the
  // nested mark's CSS classes are document-global here — fine for one mark, a trap if a future
  // tile ever composes two (public/hpo.svg uses the same .cls-1/.cls-2 names).
  if (mark.split('</svg>').length !== 2) {
    throw new Error('tile: hipo.svg has a nested <svg> — slicing its inner markup would truncate it')
  }
  const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
    <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff7e73" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ff7e73" stop-opacity="0"/>
    </radialGradient></defs>
    <rect width="1000" height="1000" fill="#201b1a"/>
    <circle cx="500" cy="500" r="420" fill="url(#g)"/>
    <svg x="230" y="215" width="540" height="570" viewBox="0 0 258.688 276.729">${mark.slice(mark.indexOf('>', mark.indexOf('<svg')) + 1).replace('</svg>', '')}</svg>
  </svg>`
  await png(tile, 'Logo/PNG/Hipo Logo on Dark Background 1000.png', { width: 1000, height: 1000 })

  // ---- Token marks ------------------------------------------------------------------------
  const tokens = [
    ['hGRAM', 'hGRAM', () => file('public/hgram.svg')],
    ['hGRAM', 'hGRAM 3D', () => file('public/images/hgram-3d.svg')],
    ['HPO', 'HPO', () => flatCoin(file('public/hpo.svg'))],
    ['HPO', 'HPO 3D', () => file('public/hpo.svg')],
    ['hTON (legacy)', 'hTON', () => file('public/images/hton.svg')],
  ]
  for (const [folder, name, source] of tokens) {
    const svg = source()
    out(`Token Marks/${folder}/SVG/${name}.svg`, svg)
    for (const s of [256, 512, 1024])
      await png(svg, `Token Marks/${folder}/PNG/${name} ${s}.png`, { width: s, height: s })
  }

  // ---- App icons --------------------------------------------------------------------------
  out('App Icons/favicon.ico', await ico(mark, [16, 32, 48]))
  for (const s of [32, 64, 128, 180, 192, 512]) await png(mark, `App Icons/Hipo Icon ${s}.png`, { width: s, height: s })

  // ---- Colors ----------------------------------------------------------------------------
  const sheet = paletteSheet()
  await png(sheet.svg, 'Colors/Hipo Colors.png', { width: sheet.width * 2 })
  out('Colors/hipo-colors.css', colorsCss())
  out('Colors/hipo-colors.txt', colorsTxt())

  out('README.md', file('brand/README.md'))

  const count = writeZip()
  console.log(`built ${zipPath}\n${count} files, ${(statSync(zipPath).size / 1e6).toFixed(2)} MB`)
}

await main()
