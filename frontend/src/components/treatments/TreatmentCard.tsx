import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { SmartImage } from '@/components/ui/SmartImage'
import { Skeleton } from '@/components/ui/Feedback'
import type { TreatmentSummary } from '@/types/models'
import { cn, formatDuration, formatPrice } from '@/utils/format'

/** Catalogue reference shown on cards and detail pages: stable per treatment. */
export const reference = (id: number) => `Nº ${String(id).padStart(2, '0')}`

interface TreatmentCardProps {
  treatment: TreatmentSummary
  /** Larger editorial variant used for the first featured protocol. */
  large?: boolean
  className?: string
}

export function TreatmentCard({ treatment, large, className }: TreatmentCardProps) {
  const t = treatment
  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className="relative overflow-hidden">
        <SmartImage
          src={t.mainImageUrl}
          alt={t.mainImageAlt || t.name}
          sizes={large ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'}
          frameClassName={large ? 'aspect-[4/5] lg:aspect-[5/6]' : 'aspect-[4/5]'}
          className="transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
        />
        <span className="absolute top-4 left-4 bg-ivory/92 px-2.5 py-1 font-display text-sm tabular text-ink">{reference(t.id)}</span>
        {!t.available && (
          <span className="absolute top-4 right-4 bg-espresso/85 px-2.5 py-1 text-caption text-cream">Currently unavailable</span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-6">
        <p className="text-caption text-champagne-deep">{t.category.name}</p>
        <h3 className={cn('mt-3 font-display leading-[1.12] text-ink transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-1', large ? 'text-h3' : 'text-2xl')}>
          <Link to={`/treatments/${t.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {t.name}
          </Link>
        </h3>
        <p className="mt-3 mb-6 line-clamp-2 text-small text-ink-muted">{t.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4">
          <p className="text-small text-ink tabular">
            <span>{formatDuration(t.durationMinutes)}</span>
            <span className="mx-2.5 text-champagne" aria-hidden>
              ·
            </span>
            <span>{formatPrice(t.price, t.priceFrom)}</span>
          </p>
          <ArrowUpRight
            className="size-5 text-taupe transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-espresso"
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      </div>
      {/* Focus ring for the whole card, drawn by the stretched link. */}
      <span className="pointer-events-none absolute -inset-2 rounded-xs ring-champagne-deep ring-offset-2 group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  )
}

export function TreatmentCardSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-6 h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-3/4" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-8 h-4 w-1/2" />
    </div>
  )
}
