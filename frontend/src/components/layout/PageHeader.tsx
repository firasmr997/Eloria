import type { ReactNode } from 'react'
import { Reveal } from '@/animations/Reveal'
import { RevealLines } from '@/animations/RevealLines'
import { cn } from '@/utils/format'

interface PageHeaderProps {
  title: string
  intro?: ReactNode
  aside?: ReactNode
  children?: ReactNode
  className?: string
}

/** Opening of every inner page: a large display title on the ivory field, with optional intro and aside. */
export function PageHeader({ title, intro, aside, children, className }: PageHeaderProps) {
  return (
    <header className={cn('bg-ivory pt-40 pb-16 lg:pt-48 lg:pb-20', className)}>
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <RevealLines as="h1" text={title} immediate delay={0.15} className="text-h1 text-ink" />
            {intro && (
              <Reveal delay={0.35}>
                <p className="mt-8 max-w-2xl text-lead text-ink-muted">{intro}</p>
              </Reveal>
            )}
          </div>
          {aside && (
            <Reveal delay={0.45} className="lg:col-span-4 lg:justify-self-end">
              {aside}
            </Reveal>
          )}
        </div>
        {children}
      </div>
    </header>
  )
}
