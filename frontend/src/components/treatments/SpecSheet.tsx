import type { Treatment } from '@/types/models'
import { cn, formatDuration, formatPrice } from '@/utils/format'

/** The protocol's ruled fact table: what a visitor needs to plan, at a glance, in tabular figures. */
export function SpecSheet({ treatment, tone = 'light', className }: { treatment: Treatment; tone?: 'light' | 'dark'; className?: string }) {
  const rows = [
    { label: 'Duration', value: formatDuration(treatment.durationMinutes) },
    { label: treatment.priceFrom ? 'Price, from' : 'Price', value: formatPrice(treatment.price) },
    treatment.sessions && { label: 'Sessions', value: treatment.sessions },
    treatment.downtime && { label: 'Downtime', value: treatment.downtime },
    treatment.technology && { label: 'Technology', value: treatment.technology },
    { label: 'Category', value: treatment.category.name },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <dl className={cn('border-t', tone === 'dark' ? 'border-champagne/50' : 'border-espresso', className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn('grid grid-cols-[8.5rem_1fr] gap-4 border-b py-4 sm:grid-cols-[10rem_1fr]', tone === 'dark' ? 'border-line-dark' : 'border-line')}
        >
          <dt className={cn('text-caption pt-0.5', tone === 'dark' ? 'text-cream-muted' : 'text-ink-muted')}>{row.label}</dt>
          <dd className={cn('tabular', tone === 'dark' ? 'text-cream' : 'text-ink')}>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
