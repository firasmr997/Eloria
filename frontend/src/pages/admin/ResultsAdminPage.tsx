import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { AdminPageHeader, FilterSelect, IconButton, Toolbar } from '@/components/admin/AdminUi'
import { ImageUploader, useUploadSession } from '@/components/admin/ImageUploader'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState, ErrorState, Pagination, Skeleton } from '@/components/ui/Feedback'
import { Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { resultService } from '@/services/contentService'
import { treatmentService } from '@/services/treatmentService'
import type { Result, ResultInput } from '@/types/models'
import { sized } from '@/utils/image'

export default function ResultsAdminPage() {
  const toast = useToast()
  const [treatmentId, setTreatmentId] = useState('')
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Result | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Result | null>(null)
  const [deleting, setDeleting] = useState(false)
  const options = useQuery('treatments:options:admin', (signal) => treatmentService.options(signal, true))
  const search = { treatmentId: treatmentId ? Number(treatmentId) : undefined, page, size: 12 }
  const list = useQuery(`results:admin:${JSON.stringify(search)}`, (signal) => resultService.list(search, signal), { keepPrevious: true, staleTime: 5_000 })

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await resultService.remove(toDelete.id)
      toast.success('Result deleted', toDelete.title)
      invalidateQueries('results')
      invalidateQueries('dashboard')
      setToDelete(null)
    } catch (e) {
      toast.error('Could not delete the result', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  const data = list.data
  return (
    <div>
      <AdminPageHeader
        title="Results"
        description="Before and after cases. Publish only photographs taken with the client’s written consent; the website always shows that results vary."
        actions={
          <Button size="sm" className="h-10" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            New result
          </Button>
        }
      />
      <Toolbar>
        <FilterSelect label="Treatment" value={treatmentId} onChange={(v) => { setTreatmentId(v); setPage(0) }}>
          <option value="">All treatments</option>
          {options.data?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </FilterSelect>
      </Toolbar>

      {list.error && !data ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
        </div>
      ) : data.content.length === 0 ? (
        <EmptyState title="No results available." body="Add a before and after case to show it on the Results page." action={<Button size="sm" onClick={() => setEditing('new')}>New result</Button>} />
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.content.map((r) => (
              <li key={r.id} className="overflow-hidden rounded-xs border border-line bg-porcelain">
                <div className="grid grid-cols-2 gap-px bg-line">
                  <figure className="relative">
                    <img src={sized(r.beforeImageUrl, 400)} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                    <figcaption className="absolute top-2 left-2 bg-espresso/80 px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.12em] text-cream uppercase">Before</figcaption>
                  </figure>
                  <figure className="relative">
                    <img src={sized(r.afterImageUrl, 400)} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                    <figcaption className="absolute top-2 left-2 bg-ivory/90 px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.12em] text-ink uppercase">After</figcaption>
                  </figure>
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{r.title}</p>
                    <p className="truncate text-[0.8125rem] text-ink-muted">{r.treatment?.name ?? 'No treatment linked'}</p>
                    {r.featured && (
                      <Badge tone="champagne" className="mt-2">
                        <Star className="size-3" aria-hidden /> Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex shrink-0">
                    <IconButton label={`Edit ${r.title}`} onClick={() => setEditing(r)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label={`Delete ${r.title}`} tone="danger" onClick={() => setToDelete(r)}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} label="results" onPage={setPage} />
          </div>
        </>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Edit result' : 'New result'} size="xl">
        {editing && (
          <ResultForm key={editing === 'new' ? 'new' : editing.id} result={editing === 'new' ? null : editing} options={options.data ?? []} onClose={() => setEditing(null)} />
        )}
      </Modal>
      <ConfirmDialog
        open={!!toDelete}
        title="Delete this result?"
        description={<><strong className="text-ink">{toDelete?.title}</strong> and its uploaded images will be removed. This cannot be undone.</>}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

function ResultForm({ result, options, onClose }: { result: Result | null; options: { id: number; name: string }[]; onClose: () => void }) {
  const toast = useToast()
  const uploads = useUploadSession()
  const [form, setForm] = useState<ResultInput>({
    treatmentId: result?.treatment?.id ?? null,
    beforeImageUrl: result?.beforeImageUrl ?? '',
    afterImageUrl: result?.afterImageUrl ?? '',
    title: result?.title ?? '',
    description: result?.description ?? '',
    durationLabel: result?.durationLabel ?? '',
    displayOrder: result?.displayOrder ?? 0,
    featured: result?.featured ?? false,
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = {
      title: form.title.trim() ? undefined : 'Title is required',
      beforeImageUrl: form.beforeImageUrl ? undefined : 'Upload the before image',
      afterImageUrl: form.afterImageUrl ? undefined : 'Upload the after image',
    }
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setSaving(true)
    try {
      const saved = result ? await resultService.update(result.id, form) : await resultService.create(form)
      uploads.settle([saved.beforeImageUrl, saved.afterImageUrl])
      toast.success(result ? 'Result updated' : 'Result created', saved.title)
      invalidateQueries('results')
      invalidateQueries('dashboard')
      onClose()
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.length) setErrors(e.byField)
      toast.error('The result could not be saved', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_1fr_1.2fr]">
      <ImageUploader label="Before" required folder="results" aspect="aspect-[4/5]" value={form.beforeImageUrl} onChange={(u) => setForm({ ...form, beforeImageUrl: u ?? '' })} onUploaded={uploads.register} error={errors.beforeImageUrl} />
      <ImageUploader label="After" required folder="results" aspect="aspect-[4/5]" value={form.afterImageUrl} onChange={(u) => setForm({ ...form, afterImageUrl: u ?? '' })} onUploaded={uploads.register} error={errors.afterImageUrl} />
      <div className="grid content-start gap-5">
        <Select label="Treatment" value={form.treatmentId ?? ''} onChange={(e) => setForm({ ...form, treatmentId: e.target.value ? Number(e.target.value) : null })}>
          <option value="">No treatment linked</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
        <Input label="Title" required maxLength={140} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
        <Input label="Duration" placeholder="3 sessions over 12 weeks" maxLength={120} value={form.durationLabel ?? ''} onChange={(e) => setForm({ ...form, durationLabel: e.target.value })} />
        <Textarea label="Description" rows={4} maxLength={1200} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} hint="Describe the case factually. Do not promise outcomes." />
        <Input label="Display order" type="number" min={0} max={9999} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        <Switch checked={!!form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured" description="The first featured result appears on the home page." />
      </div>
      <p className="border-l border-champagne pl-4 text-small text-ink-muted lg:col-span-3">
        Shown with every result: “Individual results vary. These images illustrate the kind of change a treatment can support and are not a promise of outcome.”
      </p>
      <div className="flex justify-end gap-3 border-t border-line pt-5 lg:col-span-3">
        <Button variant="quiet" size="sm" className="h-10" onClick={() => { uploads.discard(); onClose() }}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-10" loading={saving}>
          {result ? 'Save' : 'Create result'}
        </Button>
      </div>
    </form>
  )
}
