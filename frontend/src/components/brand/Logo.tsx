import { logoPaths } from './logoPaths'
import { cn } from '@/utils/format'

type Tone = 'dark' | 'light'

const INK: Record<Tone, string> = { dark: 'var(--color-espresso)', light: 'var(--color-ivory)' }
const ACCENT = 'var(--color-champagne)'

const { wordmark, descriptor, monogram } = logoPaths
const WORD_HEIGHT = wordmark.baseline - wordmark.top
const DESCRIPTOR_GAP = 30

interface LogoProps {
  tone?: Tone
  /** Adds the AESTHETIC descriptor under the wordmark (primary lockup). */
  withDescriptor?: boolean
  className?: string
  title?: string
}

/** The ÉLORIA wordmark, optionally with its descriptor. Outlines come from brand/build_logo.py. */
export function Logo({ tone = 'dark', withDescriptor = false, className, title = 'ÉLORIA AESTHETIC' }: LogoProps) {
  const height = withDescriptor ? WORD_HEIGHT + DESCRIPTOR_GAP + descriptor.capHeight : WORD_HEIGHT
  return (
    <svg
      viewBox={`0 ${wordmark.top} ${wordmark.width} ${height}`}
      className={cn('block h-auto', className)}
      role="img"
      aria-label={title}
    >
      <path d={wordmark.main} fill={INK[tone]} />
      <path d={wordmark.accent} fill={ACCENT} />
      {withDescriptor && (
        <path d={descriptor.path} fill={INK[tone]} transform={`translate(0 ${wordmark.baseline + DESCRIPTOR_GAP})`} />
      )}
    </svg>
  )
}

interface MonogramProps {
  tone?: Tone
  ring?: boolean
  className?: string
  title?: string
}

/** The É monogram with its champagne drop accent, optionally inside the hairline ring. */
export function Monogram({ tone = 'dark', ring = true, className, title = 'ÉLORIA' }: MonogramProps) {
  return (
    <svg viewBox={`0 0 ${monogram.size} ${monogram.size}`} className={cn('block', className)} role="img" aria-label={title}>
      {ring && <circle cx="100" cy="100" r="96" fill="none" stroke={ACCENT} strokeWidth="2.4" />}
      <path d={monogram.main} fill={INK[tone]} />
      <path d={monogram.accent} fill={ACCENT} />
    </svg>
  )
}
