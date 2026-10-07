import { useSearchParams } from 'react-router'
import { RevealGroup, RevealItem } from '@/animations/Reveal'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultCard, ResultCardSkeleton, ResultsDisclaimer } from '@/components/results/ResultCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, ErrorState, Pagination } from '@/components/ui/Feedback'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useQuery } from '@/hooks/useQuery'
import { resultService } from '@/services/contentService'
import { cn } from '@/utils/format'

const PAGE_SIZE = 6

export default function ResultsPage() {
  useDocumentMeta({
    title: 'Before & after results',
    description: 'Before and after cases from treatments at ÉLORIA AESTHETIC. Individual results vary; suitability is assessed in consultation.',
  })
  const [params, setParams] = useSearchParams()
  const treatmentId = params.get('treatment') ? Number(params.get('treatment')) : undefined
  const page = Number(params.get('page') ?? 0) || 0

  // All results once (small set) to build the treatment filter from what actually has results.
  const all = useQuery('results:all', (signal) => resultService.list({ size: 100 }, signal))
  const filterOptions = [...new Map((all.data?.content ?? []).filter((r) => r.treatment).map((r) => [r.treatment!.id, r.treatment!])).values()]
  const list = useQuery(`results:list:${treatmentId ?? 'all'}:${page}`, (signal) => resultService.list({ treatmentId, page, size: PAGE_SIZE }, signal), {
    keepPrevious: true,
  })

  const select = (id?: number) => setParams(id ? { treatment: String(id) } : {}, { replace: true, preventScrollReset: true })

  return (
    <>
      <PageHeader
        title="Results, shown honestly"
        intro="Drag the divider on each image to compare. These cases show the kind of progressive change a well-planned course can support. They are not a promise: every skin responds differently."
      >
        <ResultsDisclaimer className="mt-10 max-w-2xl" />
      </PageHeader>

      <section className="bg-ivory pb-28" aria-label="Results">
        <div className="shell">
          {filterOptions.length > 1 && (
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by treatment">
              <ul className="flex min-w-max gap-2 border-y border-line-strong py-3">
                {[{ id: undefined as number | undefined, name: 'All treatments' }, ...filterOptions].map((o) => (
                  <li key={o.id ?? 'all'}>
                    <button
                      type="button"
                      onClick={() => select(o.id)}
                      aria-pressed={treatmentId === o.id}
                      className={cn(
                        'h-9 rounded-full border px-4 text-small transition-colors',
                        treatmentId === o.id ? 'border-espresso bg-espresso text-ivory' : 'border-line-strong text-ink hover:border-espresso',
                      )}
                    >
                      {o.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-14">
            {list.error && !list.data ? (
              <ErrorState message={list.error.message} onRetry={list.refetch} />
            ) : !list.data ? (
              <div className="grid gap-x-10 gap-y-20 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <ResultCardSkeleton key={i} />
                ))}
              </div>
            ) : list.data.content.length === 0 ? (
              <EmptyState
                title="No results available."
                body="There are no before and after cases for this treatment yet."
                action={<ButtonLink to="/treatments" variant="ghost" arrow>Explore treatments</ButtonLink>}
              />
            ) : (
              <>
                <RevealGroup key={`${treatmentId}-${page}`} className="grid gap-x-10 gap-y-20 md:grid-cols-2">
                  {list.data.content.map((r, i) => (
                    <RevealItem key={r.id} className={i % 2 === 1 ? 'md:mt-24' : undefined}>
                      <ResultCard result={r} hint={i === 0} />
                    </RevealItem>
                  ))}
                </RevealGroup>
                <div className="mt-20 border-t border-line pt-8">
                  <Pagination
                    page={list.data.page}
                    totalPages={list.data.totalPages}
                    totalElements={list.data.totalElements}
                    size={list.data.size}
                    label="cases"
                    onPage={(p) => {
                      const next = new URLSearchParams(params)
                      if (p) next.set('page', String(p))
                      else next.delete('page')
                      setParams(next, { replace: true })
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
