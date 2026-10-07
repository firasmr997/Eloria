import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { RevealGroup, RevealItem } from '@/animations/Reveal'
import { PageHeader } from '@/components/layout/PageHeader'
import { CategoryFilter, RefineBar, TreatmentSearch } from '@/components/treatments/TreatmentFilters'
import { TreatmentCard, TreatmentCardSkeleton } from '@/components/treatments/TreatmentCard'
import { EmptyState, ErrorState, Pagination, Skeleton } from '@/components/ui/Feedback'
import { disclaimer } from '@/data/content'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useQuery } from '@/hooks/useQuery'
import { useDebouncedValue } from '@/hooks/useUtilities'
import { categoryService } from '@/services/categoryService'
import { treatmentService, type TreatmentSort } from '@/services/treatmentService'

const PAGE_SIZE = 12

export default function TreatmentsPage() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const featured = params.get('featured') === 'true'
  const available = params.get('available') === 'true'
  const sort = (params.get('sort') as TreatmentSort) || 'curated'
  const page = Math.max(0, Number(params.get('page') ?? 0) || 0)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const debounced = useDebouncedValue(query.trim(), 300)

  const update = (changes: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    if (resetPage) next.delete('page')
    setParams(next, { replace: true, preventScrollReset: true })
  }

  useEffect(() => {
    if ((params.get('q') ?? '') !== debounced) update({ q: debounced || null })
  }, [debounced])

  const categories = useQuery('categories:public', (signal) => categoryService.list(signal), { staleTime: 5 * 60_000 })
  const search = { q: debounced || undefined, category: category || undefined, featured: featured || undefined, available: available || undefined, sort, page, size: PAGE_SIZE }
  const results = useQuery(`treatments:search:${JSON.stringify(search)}`, (signal) => treatmentService.search(search, signal), { keepPrevious: true })

  const activeCategory = categories.data?.find((c) => c.slug === category)
  useDocumentMeta({
    title: activeCategory ? `${activeCategory.name} treatments` : 'Treatments',
    description: activeCategory?.description ?? 'Facial, advanced skin, laser, body and anti-aging treatments at ÉLORIA AESTHETIC in Paris. Every treatment begins with a consultation.',
  })

  const goToPage = (p: number) => {
    update({ page: p ? String(p) : null }, false)
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const data = results.data
  return (
    <>
      <PageHeader
        title="The treatment catalogue"
        intro="Every protocol we offer, with its duration, price and what to expect. Your specialist will confirm what is suitable for you at consultation."
      />

      <section id="catalogue" className="scroll-mt-24 bg-ivory pb-28" aria-label="Treatments">
        <div className="shell">
          <div className="sticky top-[4.5rem] z-30 -mx-4 bg-ivory/97 px-4 pt-4 pb-5 sm:mx-0 sm:px-0">
            {categories.data ? (
              <CategoryFilter categories={categories.data} value={category} onChange={(slug) => update({ category: slug || null })} />
            ) : (
              <Skeleton className="h-12 w-full" />
            )}
          </div>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <TreatmentSearch value={query} onChange={setQuery} />
            <RefineBar
              featured={featured}
              available={available}
              sort={sort}
              onFeatured={(v) => update({ featured: v ? 'true' : null })}
              onAvailable={(v) => update({ available: v ? 'true' : null })}
              onSort={(v) => update({ sort: v === 'curated' ? null : v })}
            />
          </div>

          {activeCategory?.description && <p className="mt-10 max-w-2xl text-ink-muted">{activeCategory.description}</p>}

          <div className="mt-12" aria-live="polite" aria-busy={results.isFetching}>
            {results.error && !data ? (
              <ErrorState message={results.error.message} onRetry={results.refetch} />
            ) : !data ? (
              <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <TreatmentCardSkeleton key={i} />
                ))}
              </div>
            ) : data.content.length === 0 ? (
              <EmptyState
                title="No treatments found."
                body={debounced ? `Nothing matches “${debounced}”. Try another word, or browse all treatments.` : 'No treatment matches these filters.'}
                action={
                  <button type="button" onClick={() => { setQuery(''); setParams({}, { replace: true }) }} className="text-button border-b border-current pb-1.5">
                    Clear filters
                  </button>
                }
              />
            ) : (
              <>
                <p className="mb-8 text-small text-ink-muted tabular">
                  {data.totalElements} {data.totalElements === 1 ? 'treatment' : 'treatments'}
                </p>
                <RevealGroup key={JSON.stringify(search)} className={results.isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                  <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                    {data.content.map((t) => (
                      <li key={t.id}>
                        <RevealItem>
                          <TreatmentCard treatment={t} />
                        </RevealItem>
                      </li>
                    ))}
                  </ul>
                </RevealGroup>
                <div className="mt-20 border-t border-line pt-8">
                  <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} onPage={goToPage} label="treatments" />
                </div>
              </>
            )}
          </div>
          <p className="mt-16 max-w-2xl text-small text-ink-muted">{disclaimer.long}</p>
        </div>
      </section>
    </>
  )
}
