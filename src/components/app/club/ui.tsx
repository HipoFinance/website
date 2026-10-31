// Shared pieces of the Club's UI: cards, buttons, chips, strips, the modal (a bottom sheet on phones)
// and the skeleton. Semantic tokens only (styling.md); the strip tones are the `tone-*` tokens of
// app.css, never `bg-accent`.
import { useEffect, useRef, type ReactNode } from 'react'
import type { Tone } from './ClubModel.ts'

export function Card({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section
      id={id}
      className={'border-border bg-surface flex min-w-0 flex-col gap-3 rounded-[20px] border p-5 sm:p-6 ' + className}
    >
      {children}
    </section>
  )
}

export function CardTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className='flex min-w-0 flex-wrap items-center justify-between gap-2'>
      <h2 className='font-fredoka text-xl font-semibold'>{children}</h2>
      {aside}
    </div>
  )
}

type ButtonKind = 'primary' | 'secondary' | 'quiet'

export function Button({
  children,
  kind = 'secondary',
  onClick,
  disabled,
  busy,
  href,
  className = '',
}: {
  children: ReactNode
  kind?: ButtonKind
  onClick?: () => void
  disabled?: boolean
  busy?: boolean
  href?: string
  className?: string
}) {
  const base =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-center text-[15px] font-semibold cursor-pointer disabled:cursor-not-allowed '
  const look = {
    primary:
      'bg-accent-fill text-on-accent hover:bg-accent-fill-hover shadow-[0_4px_0_var(--color-accent-shadow)] disabled:shadow-none disabled:bg-surface-deep disabled:text-text-faint',
    secondary:
      'border-border-strong text-text hover:text-accent border disabled:text-text-faint disabled:hover:text-text-faint',
    quiet: 'text-text-muted hover:text-accent min-h-11 px-2 py-2 font-medium underline underline-offset-4',
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

export function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  const look = {
    info: 'text-tone-info-fg border-tone-info-border',
    success: 'text-tone-success-fg border-tone-success-border',
    warn: 'text-tone-warn-fg border-tone-warn-border',
    neutral: 'text-tone-neutral-fg border-tone-neutral-border',
  }[tone]
  return (
    <span className={'rounded-full border px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ' + look}>
      {children}
    </span>
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
  const titleTone = {
    info: 'text-text',
    success: 'text-tone-success-fg',
    warn: 'text-tone-warn-fg',
    neutral: 'text-text',
  }[tone]
  return (
    <div
      role='status'
      className={
        'flex min-w-0 flex-col gap-4 rounded-[20px] border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ' +
        look
      }
    >
      <div className='flex min-w-0 flex-col gap-1'>
        <p className={'font-fredoka text-lg font-semibold ' + titleTone}>{title}</p>
        {body !== undefined && <p className='text-text-muted text-[15px] leading-relaxed'>{body}</p>}
      </div>
      {children !== undefined && <div className='flex shrink-0 flex-col gap-2 sm:items-end'>{children}</div>}
    </div>
  )
}

export function Row({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    // One line at any width: the label wraps, the value keeps its end of the row (up to 60% of it).
    <div className='flex min-w-0 items-baseline justify-between gap-x-4 text-[15px]'>
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
    <p role='alert' className='text-tone-warn-fg text-sm leading-relaxed'>
      {children}
    </p>
  )
}

// The modal: centred on wide screens, a bottom sheet on phones (§11). Escape and the backdrop close
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
    <div className='fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6'>
      <div className='absolute inset-0 bg-black/60' onClick={() => !locked && onClose()} aria-hidden='true'></div>
      <div
        ref={panel}
        role='dialog'
        aria-modal='true'
        tabIndex={-1}
        className='bg-surface border-border relative flex max-h-[90dvh] w-full max-w-lg min-w-0 flex-col gap-4 overflow-y-auto rounded-t-[24px] border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:rounded-[24px] sm:p-6'
      >
        <div className='flex items-start justify-between gap-4'>
          <h2 className='font-fredoka text-xl font-semibold'>{title}</h2>
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
        {children}
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
