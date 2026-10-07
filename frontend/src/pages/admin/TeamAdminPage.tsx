import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { AdminPageHeader, IconButton } from '@/components/admin/AdminUi'
import { ImageUploader, useUploadSession } from '@/components/admin/ImageUploader'
import { ListEditor } from '@/components/admin/ListEditor'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Input, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { specialistService } from '@/services/contentService'
import type { Specialist, SpecialistInput } from '@/types/models'
import { sized } from '@/utils/image'

export default function TeamAdminPage() {
  const toast = useToast()
  const { data, error, isLoading, refetch } = useQuery('specialists:admin', (signal) => specialistService.list({ size: 100 }, signal), { staleTime: 5_000 })
  const [editing, setEditing] = useState<Specialist | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Specialist | null>(null)
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await specialistService.remove(toDelete.id)
      toast.success('Specialist removed', toDelete.name)
      invalidateQueries('specialists')
      invalidateQueries('dashboard')
      setToDelete(null)
    } catch (e) {
      toast.error('Could not remove the specialist', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Team"
        description="Specialists shown on the Team page and the home page, in display order."
        actions={
          <Button size="sm" className="h-10" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Add specialist
          </Button>
        }
      />
      <div className="mt-8">
        {error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : isLoading || !data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : data.content.length === 0 ? (
          <EmptyState title="No specialists yet." action={<Button size="sm" onClick={() => setEditing('new')}>Add specialist</Button>} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.content.map((s) => (
              <li key={s.id} className="flex gap-4 rounded-xs border border-line bg-porcelain p-4">
                {s.photo ? <img src={sized(s.photo, 240)} alt="" className="h-28 w-22 shrink-0 rounded-xs object-cover" /> : <span className="h-28 w-22 shrink-0 rounded-xs bg-travertine" />}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="font-display text-lg leading-tight text-ink">{s.name}</p>
                  <p className="text-[0.8125rem] text-ink-muted">{s.role}</p>
                  <p className="mt-2 line-clamp-2 text-[0.75rem] text-ink-muted">{s.specialties.join(' · ')}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-[0.75rem] text-taupe tabular">Order {s.displayOrder}</span>
                    <div className="flex">
                      <IconButton label={`Edit ${s.name}`} onClick={() => setEditing(s)}>
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton label={`Remove ${s.name}`} tone="danger" onClick={() => setToDelete(s)}>
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? `Edit ${editing.name}` : 'Add specialist'} size="lg">
        {editing && <SpecialistForm key={editing === 'new' ? 'new' : editing.id} specialist={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={!!toDelete}
        title="Remove this specialist?"
        description={<><strong className="text-ink">{toDelete?.name}</strong> will no longer appear on the website, and their portrait upload will be deleted. This cannot be undone.</>}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

function SpecialistForm({ specialist, onClose }: { specialist: Specialist | null; onClose: () => void }) {
  const toast = useToast()
  const uploads = useUploadSession()
  const [form, setForm] = useState<SpecialistInput>({
    name: specialist?.name ?? '',
    role: specialist?.role ?? '',
    bio: specialist?.bio ?? '',
    photo: specialist?.photo ?? null,
    experience: specialist?.experience ?? '',
    specialties: specialist?.specialties ?? [],
    instagramUrl: specialist?.socialLinks.instagram ?? '',
    linkedinUrl: specialist?.socialLinks.linkedin ?? '',
    displayOrder: specialist?.displayOrder ?? 0,
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const url = (v?: string | null) => (v && !/^https:\/\//.test(v) ? 'Must start with https://' : undefined)
    const found = {
      name: form.name.trim() ? undefined : 'Name is required',
      role: form.role.trim() ? undefined : 'Role is required',
      bio: form.bio.trim() ? undefined : 'Biography is required',
      instagramUrl: url(form.instagramUrl),
      linkedinUrl: url(form.linkedinUrl),
    }
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setSaving(true)
    try {
      const saved = specialist ? await specialistService.update(specialist.id, form) : await specialistService.create(form)
      uploads.settle([saved.photo])
      toast.success(specialist ? 'Specialist updated' : 'Specialist added', saved.name)
      invalidateQueries('specialists')
      invalidateQueries('dashboard')
      onClose()
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.length) setErrors(e.byField)
      toast.error('The specialist could not be saved', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-[14rem_1fr]">
      <ImageUploader label="Portrait" folder="team" aspect="aspect-[4/5]" value={form.photo} onChange={(u) => setForm({ ...form, photo: u })} onUploaded={uploads.register} hint="Portrait format, at least 900 px wide." />
      <div className="grid content-start gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Name" required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Role" required maxLength={140} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} error={errors.role} />
          <Input label="Experience" placeholder="12 years in aesthetic medicine" maxLength={80} value={form.experience ?? ''} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          <Input label="Display order" type="number" min={0} max={9999} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        </div>
        <Textarea label="Biography" required rows={5} maxLength={4000} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} error={errors.bio} />
        <ListEditor label="Specialties" items={form.specialties} max={12} onChange={(v) => setForm({ ...form, specialties: v })} placeholder="Add a specialty and press Enter" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Instagram URL" placeholder="https://instagram.com/…" value={form.instagramUrl ?? ''} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} error={errors.instagramUrl} />
          <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/…" value={form.linkedinUrl ?? ''} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} error={errors.linkedinUrl} />
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-line pt-5 md:col-span-2">
        <Button variant="quiet" size="sm" className="h-10" onClick={() => { uploads.discard(); onClose() }}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-10" loading={saving}>
          {specialist ? 'Save' : 'Add specialist'}
        </Button>
      </div>
    </form>
  )
}
