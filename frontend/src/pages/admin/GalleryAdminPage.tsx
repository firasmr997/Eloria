import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { AdminPageHeader, FilterSelect, IconButton, SearchField, Toolbar } from '@/components/admin/AdminUi'
import { ImageUploader, useUploadSession } from '@/components/admin/ImageUploader'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState, ErrorState, Pagination, Skeleton } from '@/components/ui/Feedback'
import { Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { useDebouncedValue } from '@/hooks/useUtilities'
import { galleryService } from '@/services/contentService'
import { CENTER_CATEGORIES, EDITORIAL_CATEGORIES, type GalleryCategory, type GalleryCollection, type GalleryImage, type GalleryImageInput } from '@/types/models'
import { humanize } from '@/utils/format'
import { sized } from '@/utils/image'

export default function GalleryAdminPage() {
  const toast = useToast()
  const [collection, setCollection] = useState<GalleryCollection | ''>('')
  const [category, setCategory] = useState<GalleryCategory | ''>('')
  const [featured, setFeatured] = useState('')
  const [query, setQuery] = useState('')
  const q = useDebouncedValue(query.trim(), 300)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(24)
  const [editing, setEditing] = useState<GalleryImage | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const search = { collection: collection || undefined, category: category || undefined, featured: featured ? featured === 'true' : undefined, q: q || undefined, page, size }
  const list = useQuery(`gallery:admin:${JSON.stringify(search)}`, (signal) => galleryService.list(search, signal), { keepPrevious: true, staleTime: 5_000 })
  const reset = () => setPage(0)

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await galleryService.remove(toDelete.id)
      toast.success('Image deleted', toDelete.title)
      invalidateQueries('gallery')
      invalidateQueries('dashboard')
      setToDelete(null)
    } catch (e) {
      toast.error('Could not delete the image', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  const categoryOptions = collection === 'CENTER' ? CENTER_CATEGORIES : collection === 'EDITORIAL' ? EDITORIAL_CATEGORIES : [...EDITORIAL_CATEGORIES, ...CENTER_CATEGORIES]
  const data = list.data
  return (
    <div>
      <AdminPageHeader
        title="Gallery"
        description="Editorial photography feeds the main gallery; center photography feeds “The center” tour. Featured images appear on the home page."
        actions={
          <Button size="sm" className="h-10" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Upload image
          </Button>
        }
      />
      <Toolbar>
        <SearchField value={query} onChange={(v) => { setQuery(v); reset() }} placeholder="Search titles" label="Search gallery" />
        <div className="flex flex-wrap gap-3 lg:ml-auto">
          <FilterSelect label="Collection" value={collection} onChange={(v) => { setCollection(v as GalleryCollection | ''); setCategory(''); reset() }}>
            <option value="">All</option>
            <option value="EDITORIAL">Editorial</option>
            <option value="CENTER">The center</option>
          </FilterSelect>
          <FilterSelect label="Category" value={category} onChange={(v) => { setCategory(v as GalleryCategory | ''); reset() }}>
            <option value="">All</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {humanize(c)}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Featured" value={featured} onChange={(v) => { setFeatured(v); reset() }}>
            <option value="">Any</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </FilterSelect>
        </div>
      </Toolbar>

      {list.error && !data ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : !data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : data.content.length === 0 ? (
        <EmptyState title="No gallery images." body="Upload a photograph to start the gallery." action={<Button size="sm" onClick={() => setEditing('new')}>Upload image</Button>} />
      ) : (
        <>
          <ul className={`grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 ${list.isFetching ? 'opacity-60' : ''}`}>
            {data.content.map((image) => (
              <li key={image.id} className="overflow-hidden rounded-xs border border-line bg-porcelain">
                <button type="button" onClick={() => setEditing(image)} className="group relative block w-full" aria-label={`Edit ${image.title}`}>
                  <img src={sized(image.imageUrl, 600)} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  {image.featured && (
                    <span className="absolute top-2 left-2">
                      <Badge tone="dark">
                        <Star className="size-3" aria-hidden /> Featured
                      </Badge>
                    </span>
                  )}
                </button>
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-small font-semibold text-ink">{image.title}</p>
                    <p className="text-[0.75rem] text-ink-muted">
                      {humanize(image.category)} · {image.collection === 'CENTER' ? 'Center' : 'Editorial'} · #{image.displayOrder}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <IconButton label={`Edit ${image.title}`} onClick={() => setEditing(image)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label={`Delete ${image.title}`} tone="danger" onClick={() => setToDelete(image)}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} label="images" onPage={setPage} onSize={(s) => { setSize(s); reset() }} sizes={[12, 24, 48]} />
          </div>
        </>
      )}

      <GalleryDialog image={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete this image?"
        description={<><strong className="text-ink">{toDelete?.title}</strong> will be removed from the gallery and its uploaded file deleted. This cannot be undone.</>}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

function GalleryDialog({ image, onClose }: { image: GalleryImage | 'new' | null; onClose: () => void }) {
  const existing = image && image !== 'new' ? image : null
  return (
    <Modal open={!!image} onClose={onClose} title={existing ? 'Edit image' : 'Upload image'} size="lg">
      {image && <GalleryForm key={existing?.id ?? 'new'} image={existing} onClose={onClose} />}
    </Modal>
  )
}

function GalleryForm({ image, onClose }: { image: GalleryImage | null; onClose: () => void }) {
  const toast = useToast()
  const uploads = useUploadSession()
  const [form, setForm] = useState<GalleryImageInput>({
    title: image?.title ?? '',
    description: image?.description ?? '',
    imageUrl: image?.imageUrl ?? '',
    category: image?.category ?? 'TREATMENTS',
    displayOrder: image?.displayOrder ?? 0,
    featured: image?.featured ?? false,
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)

  const cancel = () => {
    uploads.discard()
    onClose()
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = { title: form.title.trim() ? undefined : 'Title is required', imageUrl: form.imageUrl ? undefined : 'Upload an image' }
    setErrors(found)
    if (found.title || found.imageUrl) return
    setSaving(true)
    try {
      const saved = image ? await galleryService.update(image.id, form) : await galleryService.create(form)
      uploads.settle([saved.imageUrl])
      toast.success(image ? 'Image updated' : 'Image added', saved.title)
      invalidateQueries('gallery')
      invalidateQueries('dashboard')
      onClose()
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.length) setErrors(e.byField)
      toast.error('The image could not be saved', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-2">
      <ImageUploader
        label="Image"
        required
        folder="gallery"
        value={form.imageUrl}
        onChange={(url) => setForm({ ...form, imageUrl: url ?? '' })}
        onUploaded={uploads.register}
        error={errors.imageUrl}
        hint={image ? 'Replacing the photo deletes the previous upload when you save.' : undefined}
      />
      <div className="grid content-start gap-5">
        <Input label="Title" required value={form.title} maxLength={140} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
        <Textarea label="Description" rows={3} maxLength={600} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} hint="Also used as the image’s alt text." />
        <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GalleryCategory })}>
          <optgroup label="Editorial gallery">
            {EDITORIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {humanize(c)}
              </option>
            ))}
          </optgroup>
          <optgroup label="The center">
            {CENTER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {humanize(c)}
              </option>
            ))}
          </optgroup>
        </Select>
        <Input label="Display order" type="number" min={0} max={9999} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        <Switch checked={!!form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured" description="Shown on the home page." />
      </div>
      <div className="flex justify-end gap-3 border-t border-line pt-5 md:col-span-2">
        <Button variant="quiet" size="sm" className="h-10" onClick={cancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-10" loading={saving}>
          {image ? 'Save' : 'Add to gallery'}
        </Button>
      </div>
    </form>
  )
}
