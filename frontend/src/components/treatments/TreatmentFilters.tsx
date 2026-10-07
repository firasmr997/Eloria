import { Search, X } from 'lucide-react'
import type { Category } from '@/types/models'
import type { TreatmentSort } from '@/services/treatmentService'
import { cn } from '@/utils/format'

export function TreatmentSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full lg:max-w-sm">
      <label htmlFor="treatment-search" className="sr-only">
        Search treatments
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-0 size-5 -translate-y-1/2 text-taupe" strokeWidth={1.25} aria-hidden />
      <input
        id="treatment-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, concern or technology"
        className="h-12 w-full border-b border-line-strong bg-transparent pr-10 pl-9 text-base text-ink placeholder:text-taupe focus:border-espresso focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute top-1/2 right-0 -translate-y-1/2 p-2 text-taupe hover:text-ink" aria-label="Clear search">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

/** Category filter as ruled cells: the active cell fills with espresso. Scrolls horizontally on phones. */
export function CategoryFilter({ categories, value, onChange }: { categories: Category[]; value: string; onChange: (slug: string) => void }) {
  const all = [{ slug: '', name: 'All', treatmentCount: categories.reduce((n, c) => n + c.treatmentCount, 0) }, ...categories]
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
      <ul className="flex min-w-max border-y border-line-strong">
        {all.map((c) => {
          const active = value === c.slug
          return (
            <li key={c.slug || 'all'} className="border-r border-line last:border-r-0">
              <button
                type="button"
                onClick={() => onChange(c.slug)}
                aria-pressed={active}
                className={cn(
                  'flex h-12 items-center gap-2.5 px-5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase transition-colors duration-300',
                  active ? 'bg-espresso text-ivory' : 'text-ink hover:bg-travertine/60',
                )}
              >
                {c.name}
                <span className={cn('tabular text-[0.75rem]', active ? 'text-champagne-light' : 'text-taupe')}>{c.treatmentCount}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const sorts: { value: TreatmentSort; label: string }[] = [
  { value: 'curated', label: 'Recommended' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'duration', label: 'Duration' },
]

interface RefineProps {
  featured: boolean
  available: boolean
  sort: TreatmentSort
  onFeatured: (v: boolean) => void
  onAvailable: (v: boolean) => void
  onSort: (v: TreatmentSort) => void
}

export function RefineBar({ featured, available, sort, onFeatured, onAvailable, onSort }: RefineProps) {
  const toggle = (active: boolean) =>
    cn(
      'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-small transition-colors',
      active ? 'border-espresso bg-espresso text-ivory' : 'border-line-strong text-ink hover:border-espresso',
    )
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={toggle(featured)} aria-pressed={featured} onClick={() => onFeatured(!featured)}>
        Signature only
      </button>
      <button type="button" className={toggle(available)} aria-pressed={available} onClick={() => onAvailable(!available)}>
        Available now
      </button>
      <label className="ml-auto flex items-center gap-2 text-small text-ink-muted">
        Sort
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as TreatmentSort)}
          className="h-9 cursor-pointer rounded-xs border border-line-strong bg-porcelain px-3 text-ink focus:border-espresso focus:outline-none"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
