// Shared pieces of the Club's UI: cards, buttons, chips, strips, the modal (a bottom sheet on phones)
// and the skeleton. Semantic tokens only (styling.md); the strip tones are the `tone-*` tokens of
// app.css, never `bg-accent`. The look follows specs/club-wireframe-match.md (G1–G11).
import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react'
import type { Glyph } from './icons.tsx'
import type { Tone } from './ClubModel.ts'

// M1: inside the Telegram Mini App cards are tighter (radius 18px, padding 16px). ClubPage provides
// `club.tma` here, so Card, Strip and the other card-like boxes need no prop for it.
export const TmaContext = createContext(false)

// The card box (border, fill, radius, padding) for the Mini App or the web; `useCardBox` reads the context.
export function useCardBox() {
  return useContext(TmaContext) ? 'rounded-mini p-4' : 'rounded-card p-5 sm:p-6'
}

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  const box = useCardBox()
  // A `gap-*` in className replaces the default 16px gap (two gap utilities would race in the CSS).
  const gap = /(^|\s)gap-/.test(className) ? '' : 'gap-4 '
  return (
    <section id={id} className={'border-border bg-surface flex min-w-0 flex-col border ' + gap + box + ' ' + className}>
      {children}
    </section>
  )
}

// G7: a card heading as a small uppercase label with a 16px icon. `Eyebrow` is the bare label (a
// span, for use inside other markup); CardTitle's `variant='eyebrow'` renders the same look as the
// card's <h2>, so the heading outline stays. The default variant is the wireframe's card heading:
// IBM Plex Sans 600 at 20px (`large`: 22px, the Friends invite title).
const eyebrowLook = 'text-text-muted inline-flex min-w-0 items-center gap-2 text-label tracking-[0.06em] uppercase'

export function Eyebrow({ icon: Icon, children }: { icon?: Glyph; children: ReactNode }) {
  return (
    <span className={eyebrowLook}>
      {Icon && <Icon size={16} className='text-text-faint' />}
      {children}
    </span>
  )
}

export function CardTitle({
  children,
  aside,
  variant = 'heading',
  icon: Icon,
  large,
}: {
  children: ReactNode
  aside?: ReactNode
  variant?: 'heading' | 'eyebrow'
  icon?: Glyph
  large?: boolean
}) {
  return (
    <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
      {variant === 'eyebrow' ? (
        <h2 className={eyebrowLook + ' font-normal'}>
          {Icon && <Icon size={16} className='text-text-faint' />}
          {children}
        </h2>
      ) : (
        <h2 className={'font-body leading-normal font-semibold ' + (large ? 'text-title' : 'text-title-sm')}>
          {children}
        </h2>
      )}
      {aside}
    </div>
  )
}

type ButtonKind = 'primary' | 'secondary' | 'quiet'
export type ButtonSize = 'md' | 'sm'

// Disabled (the wireframe's claim button): the raised fill, a border, faint text at weight 400.
// G3: card buttons are 48px ('md'); buttons in a strip, the header or a dialog are 44px ('sm').
// Strip and Sheet set 'sm' for every Button inside them through this context, so their callers do
// not pass `size`; an explicit `size` prop wins.
const ButtonSizeContext = createContext<ButtonSize>('md')

export function Button({
  children,
  kind = 'secondary',
  size,
  onClick,
  disabled,
  busy,
  href,
  className = '',
}: {
  children: ReactNode
  kind?: ButtonKind
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
  busy?: boolean
  href?: string
  className?: string
}) {
  const contextSize = useContext(ButtonSizeContext)
  // The quiet kind is a text link with a 44px hit area at either size.
  const box =
    kind === 'quiet'
      ? 'min-h-11 px-2 py-2 '
      : (size ?? contextSize) === 'sm'
        ? 'min-h-11 px-[22px] py-3 '
        : 'min-h-12 px-[22px] py-3.5 '
  const base =
    'inline-flex items-center justify-center gap-2 rounded-control text-center text-body leading-normal cursor-pointer disabled:cursor-not-allowed ' +
    box
  const look = {
    primary:
      'bg-accent-fill text-on-accent hover:bg-accent-fill-hover font-semibold disabled:bg-surface-raised disabled:hover:bg-surface-raised disabled:border disabled:border-border disabled:text-text-faint disabled:font-normal',
    secondary:
      'border-border-control text-text hover:text-accent border font-normal disabled:bg-surface-raised disabled:border-border disabled:text-text-muted disabled:hover:text-text-muted',
    quiet: 'text-text-muted hover:text-accent font-medium underline underline-offset-4',
  }[kind]
  if (href !== undefined) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel='noopener noreferrer'
        className={base + look + ' ' + className}
      >
        {children}
      </a>
    )
  }
  return (
    <button
      type='button'
      className={base + look + ' ' + className}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy}
    >
      {busy && (
        <span
          className='size-4 animate-spin rounded-full border-2 border-current border-e-transparent'
          aria-hidden='true'
        ></span>
      )}
      {children}
    </button>
  )
}

// G9: filter / sort pills — separate pills, the active one filled with the text colour. Wrap them in
// `Pills` (a labelled group); each `Pill` is a toggle button (aria-pressed).
export function Pills({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role='group' aria-label={label} className={'flex min-w-0 flex-wrap items-center gap-2 ' + className}>
      {children}
    </div>
  )
}

export function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type='button'
      aria-pressed={active}
      onClick={onClick}
      className={
        'text-body inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border px-3.5 py-2 leading-normal ' +
        (active
          ? 'bg-text text-bg border-transparent'
          : 'border-border-strong text-text hover:text-accent bg-transparent')
      }
    >
      {children}
    </button>
  )
}

// G8: table cells. Put `tableRow` on each body <tr> (header row: no border), `tableTh` on <th>,
// `tableTd` on <td>; add `rowSelf` (G10) to the viewer's own <tr>.
export const tableTh = 'px-3 py-2.5 text-sm font-medium text-text-muted text-start'
export const tableTd = 'p-3 text-body'
// Denser cells, as the wireframe draws them: the levels table (8px 12px) and the leaderboard (10px 12px).
export const tableTdTight = 'px-3 py-2 text-body'
export const tableTdBoard = 'px-3 py-2.5 text-body'
export const tableRow = 'border-t border-border'
export const rowSelf = 'bg-row-self font-semibold'

// G11: a headline figure (Nunito 800, the wireframe's display weight) and a footnote. `bigNumber` is the
// Overview's 48px figure (line-height 1); `figure` is the Rewards and Friends 44px one (line-height 1.1).
export const bigNumber = 'font-display num text-display sm:text-display-lg font-extrabold leading-none wrap-anywhere'
export const figure = 'font-display num text-display font-extrabold leading-[1.1] wrap-anywhere'
export const footnote = 'text-text-faint text-sm leading-normal'

// G5: an inset tile inside a card (the grace panel's buy box, Rewards' "Stake more"): radius 16, padding
// 16px 20px as the Rewards board draws it (the grace board's 18px 20px is within 2px; one value kept).
export const inset = 'bg-surface-raised rounded-tile px-5 py-4'

export function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  const look = {
    info: 'text-tone-info-fg border-tone-info-fg',
    success: 'text-tone-success-fg border-tone-success-fg',
    warn: 'text-tone-warn-fg border-tone-warn-fg',
    neutral: 'text-tone-neutral-fg border-tone-neutral-fg',
  }[tone]
  // The wireframe's chip: the border in the text colour, padding 3px 10px (28px tall).
  return (
    <span
      className={
        'text-label rounded-full border px-2.5 py-[3px] leading-normal font-semibold whitespace-nowrap ' + look
      }
    >
      {children}
    </span>
  )
}

// O1: the tone icons of the status strip, drawn as the wireframe's (24px, stroke 2, round caps).
function ToneIcon({ tone }: { tone: Tone }) {
  const colour = {
    info: 'text-tone-info-fg',
    success: 'text-tone-success-fg',
    warn: 'text-tone-warn-fg',
    neutral: 'text-tone-neutral-fg',
  }[tone]
  return (
    <svg
      aria-hidden='true'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={'mt-0.5 shrink-0 ' + colour}
    >
      {tone === 'warn' ? (
        <>
          <path d='M12 3 2 21h20L12 3z'></path>
          <path d='M12 10v4'></path>
          <path d='M12 17.5v.5'></path>
        </>
      ) : (
        <>
          <circle cx='12' cy='12' r='9'></circle>
          {tone === 'success' && <path d='m8 12 3 3 5-6'></path>}
          {tone === 'info' && (
            <>
              <path d='M12 11v5'></path>
              <path d='M12 7.5v.5'></path>
            </>
          )}
          {tone === 'neutral' && <path d='M8 12h8'></path>}
        </>
      )}
    </svg>
  )
}

export function Strip({
  tone,
  title,
  body,
  children,
}: {
  tone: Tone
  title: ReactNode
  body?: ReactNode
  children?: ReactNode
}) {
  const look = {
    info: 'bg-tone-info-bg border-tone-info-border',
    success: 'bg-tone-success-bg border-tone-success-border',
    warn: 'bg-tone-warn-bg border-tone-warn-border',
    neutral: 'bg-tone-neutral-bg border-tone-neutral-border',
  }[tone]
  const tma = useContext(TmaContext)
  return (
    <div
      role='status'
      className={
        'flex min-w-0 flex-wrap items-center justify-between border ' +
        (tma ? 'rounded-mini gap-4 p-4 ' : 'rounded-card gap-5 px-6 py-5 ') +
        look
      }
    >
      <div className='flex min-w-0 flex-[1_1_20rem] items-start gap-3.5'>
        <ToneIcon tone={tone} />
        <div className='flex min-w-0 flex-col gap-1'>
          <p className='font-body text-text text-[19px] leading-normal font-semibold'>{title}</p>
          {body !== undefined && <p className='text-text-secondary text-body leading-normal'>{body}</p>}
        </div>
      </div>
      {children !== undefined && (
        <ButtonSizeContext.Provider value='sm'>
          <div className='flex min-w-0 flex-wrap gap-2.5'>{children}</div>
        </ButtonSizeContext.Provider>
      )}
    </div>
  )
}

export function Row({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    // One line at any width: the label wraps, the value keeps its end of the row (up to 60% of it).
    <div className='text-body flex min-w-0 items-baseline justify-between gap-x-4'>
      <span className='text-text-muted min-w-0 flex-1'>{label}</span>
      <span
        className={
          'num max-w-[60%] min-w-0 shrink-0 text-end wrap-anywhere ' +
          (strong ? 'text-text font-semibold' : 'text-text')
        }
      >
        {value}
      </span>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={'bg-surface-deep animate-pulse rounded-xl ' + className} aria-hidden='true'></div>
}

export function ErrorLine({ children }: { children?: ReactNode }) {
  if (children === undefined || children === null || children === '') {
    return null
  }
  return (
    <p role='alert' className='text-tone-warn-fg text-sm leading-normal'>
      {children}
    </p>
  )
}

// The modal: top-aligned 120px from the top on wide screens (the boards' dialogs hang from the top),
// a bottom sheet on phones (§11). Escape and the backdrop close
// it unless `locked` (a request is in flight).
export function Sheet({
  title,
  children,
  onClose,
  locked,
  closeLabel,
}: {
  title: ReactNode
  children: ReactNode
  onClose: () => void
  locked?: boolean
  closeLabel: string
}) {
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) {
        onClose()
      }
    }
    document.addEventListener('keydown', key)
    panel.current?.focus()
    return () => document.removeEventListener('keydown', key)
  }, [onClose, locked])
  return (
    <div className='fixed inset-0 z-40 flex items-end justify-center sm:items-start sm:px-6 sm:pt-[120px] sm:pb-6'>
      <div className='bg-scrim absolute inset-0' onClick={() => !locked && onClose()} aria-hidden='true'></div>
      <div
        ref={panel}
        role='dialog'
        aria-modal='true'
        tabIndex={-1}
        aria-labelledby={titleId}
        className='bg-surface border-border-strong rounded-t-sheet sm:rounded-sheet relative flex max-h-[90dvh] w-full max-w-[600px] min-w-0 flex-col gap-[18px] overflow-y-auto border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:max-h-[calc(100dvh-144px)] sm:p-7'
      >
        <div className='flex items-start justify-between gap-4'>
          <h2 id={titleId} className='font-display text-section min-w-0 leading-tight font-extrabold'>
            {title}
          </h2>
          {!locked && (
            <button
              type='button'
              onClick={onClose}
              className='text-text-muted hover:text-accent -m-2 cursor-pointer p-2 text-xl leading-none'
              aria-label={closeLabel}
            >
              ×
            </button>
          )}
        </div>
        <ButtonSizeContext.Provider value='sm'>{children}</ButtonSizeContext.Provider>
      </div>
    </div>
  )
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className='text-accent hover:underline' href={href} target='_blank' rel='noopener noreferrer'>
      {children}
    </a>
  )
}
