import { Fragment, type ReactNode } from 'react'

// Renders a catalog template whose `{name}` placeholders stand for React nodes — a link, an
// emphasised span, a <bdi className='num'> around a formatted value — so a sentence stays one
// translatable string instead of being split into English fragments in JSX. Placeholders without
// a matching node are left as-is (same as make-t's interpolate).
export function nodes(template: string, parts: Record<string, ReactNode>): ReactNode {
  const out: ReactNode[] = []
  const pattern = /\{([a-zA-Z0-9_]+)\}/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(template)) !== null) {
    if (match.index > last) {
      out.push(template.slice(last, match.index))
    }
    const name = match[1]
    out.push(
      Object.prototype.hasOwnProperty.call(parts, name) ? (
        <Fragment key={match.index}>{parts[name]}</Fragment>
      ) : (
        match[0]
      ),
    )
    last = match.index + match[0].length
  }
  if (last < template.length) {
    out.push(template.slice(last))
  }
  return <>{out}</>
}

// A formatted number / amount / address inside running text: bidi-isolated and tabular.
export function Num({ children, className }: { children: ReactNode; className?: string }) {
  return <bdi className={className == null ? 'num' : 'num ' + className}>{children}</bdi>
}
