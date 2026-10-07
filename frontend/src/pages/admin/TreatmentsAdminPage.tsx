import { ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AdminPageHeader, FilterSelect, IconButton, SearchField, Table, TableSkeleton, Td, Th, Toolbar } from '@/components/admin/AdminUi'
import { ButtonLink } from '@/components/ui/Button'
import { Badge, EmptyState, ErrorState, Pagination } from '@/components/ui/Feedback'
import { ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { useDebouncedValue } from '@/hooks/useUtilities'
import { categoryService } from '@/services/categoryService'
import { treatmentService } from '@/services/treatmentService'
import type { TreatmentSummary } from '@/types/models'
import { formatDuration, formatPrice } from '@/utils/format'
import { sized } from '@/utils/image'

export default function TreatmentsAdminPage() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const q = useDebouncedValue(query.trim(), 300)
  const categoryId = params.get('categoryId') ?? ''
  const featured = params.get('featured') ?? ''
  const available = params.get('available') ?? ''
  const page = Number(params.get('page') ?? 0) || 0
  const size = Number(params.get('size') ?? 12) || 12
  const [toDelete, setToDelete] = useState<TreatmentSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  const categories = useQuery('categories:all', (signal) => categoryService.listAll(signal))
  const search = {
    q: q || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    featured: featured ? featured === 'true' : undefined,
    available: available ? available === 'true' : undefined,
    sort: 'updated' as const,
    page,
    size,
  }
  const list = useQuery(`treatments:admin:${JSON.stringify(search)}`, (signal) => treatmentService.search(search, signal, true), { keepPrevious: true, staleTime: 5_000 })

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await treatmentService.remove(toDelete.id)
      toast.success('Treatment deleted', toDelete.name)
      invalidateQueries('treatments')
      invalidateQueries('categories')
      invalidateQueries('dashboard')
      setToDelete(null)
    } catch (e) {
      toast.error('Could not delete the treatment', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  const data = list.data
  return (
    <div>
      <AdminPageHeader
        title="Treatments"
        description="The catalogue shown on the website. Unavailable treatments stay visible but cannot be requested."
        actions={
          <ButtonLink to="/admin/treatments/new" size="sm" className="h-10" icon={<Plus className="size-4" />}>
            New treatment
          </ButtonLink>
        }
      />
      <Toolbar>
        <SearchField value={query} onChange={(v) => { setQuery(v); set('q', v.trim()) }} placeholder="Search treatments" label="Search treatments" />
        <div className="flex flex-wrap gap-3 lg:ml-auto">
          <FilterSelect label="Category" value={categoryId} onChange={(v) => set('categoryId', v)}>
            <option value="">All</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Featured" value={featured} onChange={(v) => set('featured', v)}>
            <option value="">Any</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </FilterSelect>
          <FilterSelect label="Status" value={available} onChange={(v) => set('available', v)}>
            <option value="">Any</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </FilterSelect>
        </div>
      </Toolbar>

      {list.error && !data ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : !data ? (
        <TableSkeleton />
      ) : data.content.length === 0 ? (
        <EmptyState
          title="No treatments found."
          body={q || categoryId || featured || available ? 'Try other filters.' : 'Create the first treatment of the catalogue.'}
          action={<ButtonLink to="/admin/treatments/new" size="sm" arrow>New treatment</ButtonLink>}
        />
      ) : (
        <>
          <Table label="Treatments">
            <thead>
              <tr>
                <Th>Treatment</Th>
                <Th>Category</Th>
                <Th className="text-right">Duration</Th>
                <Th className="text-right">Price</Th>
                <Th>Status</Th>
                <Th className="text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody className={list.isFetching ? 'opacity-60' : undefined}>
              {data.content.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-ivory">
                  <Td>
                    <div className="flex items-center gap-3">
                      {t.mainImageUrl ? (
                        <img src={sized(t.mainImageUrl, 120)} alt="" className="size-11 shrink-0 rounded-xs object-cover" loading="lazy" />
                      ) : (
                        <span className="size-11 shrink-0 rounded-xs bg-travertine" />
                      )}
                      <div className="min-w-0">
                        <Link to={`/admin/treatments/${t.id}`} className="font-semibold text-ink hover:text-champagne-deep">
                          {t.name}
                        </Link>
                        <p className="max-w-xs truncate text-[0.8125rem] text-ink-muted">{t.shortDescription}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-ink-muted">{t.category.name}</Td>
                  <Td className="text-right tabular">{formatDuration(t.durationMinutes)}</Td>
                  <Td className="text-right tabular">{formatPrice(t.price, t.priceFrom)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      {t.available ? <Badge tone="success">Available</Badge> : <Badge tone="neutral">Unavailable</Badge>}
                      {t.featured && (
                        <Badge tone="champagne">
                          <Star className="size-3" aria-hidden /> Featured
                        </Badge>
                      )}
                    </div>
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    <a href={`/treatments/${t.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex size-9 items-center justify-center rounded-xs text-ink-muted hover:bg-ink/5 hover:text-ink" aria-label={`View ${t.name} on the website (opens in a new tab)`} title="View on website">
                      <ExternalLink className="size-4" />
                    </a>
                    <Link to={`/admin/treatments/${t.id}`} className="inline-flex size-9 items-center justify-center rounded-xs text-ink-muted hover:bg-ink/5 hover:text-ink" aria-label={`Edit ${t.name}`} title="Edit">
                      <Pencil className="size-4" />
                    </Link>
                    <IconButton label={`Delete ${t.name}`} tone="danger" onClick={() => setToDelete(t)}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-6">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              size={data.size}
              label="treatments"
              onPage={(p) => set('page', p ? String(p) : '')}
              onSize={(s) => set('size', String(s))}
            />
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this treatment?"
        description={
          <>
            <strong className="text-ink">{toDelete?.name}</strong> will be removed from the website. Its before/after results stay but are unlinked, and past requests keep the treatment name. This cannot be undone.
          </>
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
