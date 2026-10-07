import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/Feedback'
import type { Result } from '@/types/models'
import { cn } from '@/utils/format'
import { BeforeAfterSlider } from './BeforeAfterSlider'

export function ResultCard({ result, className, hint = false }: { result: Result; className?: string; hint?: boolean }) {
  return (
    <article className={cn('flex flex-col', className)}>
      <BeforeAfterSlider before={result.beforeImageUrl} after={result.afterImageUrl} alt={result.title} hint={hint} />
      <div className="pt-6">
        {result.treatment && (
          <Link to={`/treatments/${result.treatment.slug}`} className="text-caption text-champagne-deep hover:text-espresso">
            {result.treatment.name}
          </Link>
        )}
        <h3 className="mt-2 text-h4 text-ink">{result.title}</h3>
        {result.durationLabel && <p className="mt-1 text-small text-ink-muted tabular">{result.durationLabel}</p>}
        {result.description && <p className="mt-3 text-small text-ink-muted">{result.description}</p>}
      </div>
    </article>
  )
}

export function ResultCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-6 h-3 w-28" />
      <Skeleton className="mt-3 h-6 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
    </div>
  )
}

/** Required wherever results are shown. */
export function ResultsDisclaimer({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <p
      className={cn(
        'flex gap-3 border-l border-champagne py-1 pl-4 text-small',
        tone === 'dark' ? 'text-cream-muted' : 'text-ink-muted',
        className,
      )}
    >
      Individual results vary. These images illustrate the kind of change a treatment can support and are not a promise of outcome. Suitability is always assessed in consultation with a qualified professional.
    </p>
  )
}
