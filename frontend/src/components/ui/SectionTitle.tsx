import type { ReactNode } from 'react'
import { RevealLines } from '@/animations/RevealLines'
import { Reveal } from '@/animations/Reveal'
import { cn } from '@/utils/format'

interface SectionTitleProps {
  title: string
  intro?: ReactNode
  /** Heading level; the visual size follows `size`. */
  as?: 'h1' | 'h2' | 'h3'
  size?: 'h1' | 'h2' | 'h3'
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  action?: ReactNode
  className?: string
}

/** Heading with an optional intro paragraph and action. No eyebrow labels: the heading carries itself. */
export function SectionTitle({ title, intro, as = 'h2', size = 'h2', align = 'left', tone = 'light', action, className }: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        <RevealLines as={as} text={title} className={cn(size === 'h1' ? 'text-h1' : size === 'h3' ? 'text-h3' : 'text-h2', tone === 'dark' ? 'text-cream' : 'text-ink')} />
        {intro && (
          <Reveal delay={0.15}>
            <p className={cn('mt-6 text-lead measure', tone === 'dark' ? 'text-cream-muted' : 'text-ink-muted', align === 'center' && 'mx-auto')}>{intro}</p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.2} className="shrink-0">{action}</Reveal>}
    </div>
  )
}
