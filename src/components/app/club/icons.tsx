// The Club wireframe's own glyphs (Main, Rewards and Friends boards), copied path for path so the
// cards carry the boards' icons rather than lucide's look-alikes. Each is a 24 viewBox outline in
// currentColor at the board's stroke width; `size` and `strokeWidth` take the same props as a lucide
// icon, so Eyebrow and CardTitle accept either.
import type { ReactNode } from 'react'

export interface GlyphProps {
  size?: number
  strokeWidth?: number
  className?: string
}

export type Glyph = (props: GlyphProps) => ReactNode

function glyph(paths: ReactNode, stroke = 1.8, join = true): Glyph {
  const Icon = ({ size = 16, strokeWidth = stroke, className = '' }: GlyphProps) => (
    <svg
      aria-hidden='true'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin={join ? 'round' : undefined}
      className={'shrink-0 ' + className}
    >
      {paths}
    </svg>
  )
  return Icon
}

// "Your HPO": two rings.
export const HpoIcon = glyph(
  <>
    <circle cx='12' cy='12' r='8.5'></circle>
    <circle cx='12' cy='12' r='4.5'></circle>
  </>,
)

// "Balances": a card.
export const BalancesIcon = glyph(
  <>
    <rect x='3' y='6' width='18' height='13' rx='2'></rect>
    <path d='M3 10h18'></path>
    <circle cx='16.5' cy='14.5' r='1'></circle>
  </>,
)

// "Your level": the shield.
export const ShieldIcon = glyph(<path d='M12 3 5 6v5c0 4.4 3 7.9 7 10 4-2.1 7-5.6 7-10V6l-7-3z'></path>)

// Boosted HPO: the bolt.
export const BoltIcon = glyph(<path d='M13 3 5 14h6l-1 7 8-11h-6l1-7z'></path>)

// The leaderboard's trophy.
export const TrophyIcon = glyph(
  <>
    <path d='M8 4h8v5a4 4 0 0 1-8 0V4z'></path>
    <path d='M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6'></path>
  </>,
)

// Friends: two people.
export const FriendsIcon = glyph(
  <>
    <circle cx='9' cy='9' r='3.5'></circle>
    <path d='M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5'></path>
    <path d='M16 5.5a3.5 3.5 0 0 1 0 7M18 14.8c1.7.7 2.8 2.5 3 5.2'></path>
  </>,
)

// Community: a speech bubble.
export const CommunityIcon = glyph(<path d='M5 18 3 21V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5z'></path>)

// The seasonal upgrade: a calendar.
export const CalendarIcon = glyph(
  <>
    <rect x='4' y='5' width='16' height='15' rx='2'></rect>
    <path d='M4 10h16M9 3v4M15 3v4'></path>
  </>,
)

// Revenue sharing, paused.
export const PauseIcon = glyph(
  <>
    <circle cx='12' cy='12' r='8.5'></circle>
    <path d='M10 9v6M14 9v6'></path>
  </>,
)

// The season pill's clock (stroke 2, round caps only, as on the board).
export const ClockIcon = glyph(
  <>
    <circle cx='12' cy='12' r='9'></circle>
    <path d='M12 7v5l3 2'></path>
  </>,
  2,
  false,
)

// Level up: two chevrons.
export const ChevronsIcon = glyph(
  <>
    <path d='m7 13 5-5 5 5'></path>
    <path d='m7 18 5-5 5 5'></path>
  </>,
)
