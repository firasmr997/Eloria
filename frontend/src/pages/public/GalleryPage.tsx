import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { EditorialGrid, EditorialGridSkeleton } from '@/components/gallery/EditorialGrid'
import { Lightbox } from '@/components/gallery/Lightbox'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useQuery } from '@/hooks/useQuery'
import { galleryService } from '@/services/contentService'
import { CENTER_CATEGORIES, EDITORIAL_CATEGORIES, type GalleryCategory, type GalleryCollection } from '@/types/models'
import { cn, humanize } from '@/utils/format'

const COPY: Record<GalleryCollection, { title: string; intro: string; meta: string }> = {
  EDITORIAL: {
    title: 'The gallery',
    intro: 'Treatments, textures and the quiet moments in between. Select any image to see it in full.',
    meta: 'Photography of treatments, skin and atmosphere at ÉLORIA AESTHETIC.',
  },
  CENTER: {
    title: 'The center',
    intro: 'Reception, treatment suites, the lounge and the details. A tour of where your care takes place.',
    meta: 'A tour of the ÉLORIA AESTHETIC center in Paris: reception, treatment rooms, lounge and interiors.',
  },
}

export default function GalleryPage() {
  const location = useLocation()
  const collection: GalleryCollection = location.pathname.endsWith('/center') ? 'CENTER' : 'EDITORIAL'
  const [params, setParams] = useSearchParams()
  const category = (params.get('category') as GalleryCategory | null) ?? undefined
  const categories = collection === 'CENTER' ? CENTER_CATEGORIES : EDITORIAL_CATEGORIES
  const [open, setOpen] = useState<number | null>(null)
  useDocumentMeta({ title: COPY[collection].title.replace('The ', '').replace(/^./, (c) => c.toUpperCase()), description: COPY[collection].meta })

  const { data, error, isLoading, refetch } = useQuery(`gallery:${collection}:${category ?? 'all'}`, (signal) =>
    galleryService.list({ collection, category, size: 100 }, signal),
  )
  const images = data?.content ?? []

  const tab = (active: boolean) =>
    cn('font-display text-2xl transition-colors sm:text-3xl', active ? 'text-ink' : 'text-taupe hover:text-ink')

  return (
    <>
      <PageHeader title={COPY[collection].title} intro={COPY[collection].intro}>
        <nav className="mt-14 flex items-baseline gap-8 border-b border-line pb-5" aria-label="Gallery collections">
          <Link to="/gallery" className={tab(collection === 'EDITORIAL')} aria-current={collection === 'EDITORIAL' ? 'page' : undefined}>
            Editorial
          </Link>
          <Link to="/gallery/center" className={tab(collection === 'CENTER')} aria-current={collection === 'CENTER' ? 'page' : undefined}>
            The center
          </Link>
        </nav>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {[undefined, ...categories].map((c) => (
            <button
              key={c ?? 'all'}
              type="button"
              aria-pressed={category === c}
              onClick={() => setParams(c ? { category: c } : {}, { replace: true, preventScrollReset: true })}
              className={cn(
                'h-9 rounded-full border px-4 text-small transition-colors',
                category === c ? 'border-espresso bg-espresso text-ivory' : 'border-line-strong text-ink hover:border-espresso',
              )}
            >
              {c ? humanize(c) : 'All'}
            </button>
          ))}
        </div>
      </PageHeader>

      <section className="bg-ivory pb-32" aria-label={COPY[collection].title}>
        <div className="shell">
          {error ? (
            <ErrorState message={error.message} onRetry={refetch} />
          ) : isLoading ? (
            <EditorialGridSkeleton />
          ) : images.length === 0 ? (
            <EmptyState title="No gallery images." body="There are no photographs in this category yet." />
          ) : (
            <EditorialGrid key={`${collection}-${category}`} images={images} onOpen={setOpen} />
          )}
        </div>
      </section>

      <Lightbox
        items={images.map((g) => ({ src: g.imageUrl, alt: g.description || g.title, title: g.title, description: g.description, category: g.category }))}
        index={open}
        onIndex={setOpen}
      />
    </>
  )
}
