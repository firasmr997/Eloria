import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { AdminPageHeader, FormSection, IconButton } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Badge, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Input, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { SETTINGS_KEY } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { authService } from '@/services/authService'
import { settingsService, testimonialService } from '@/services/contentService'
import type { CenterSettings, SettingsInput, Testimonial, TestimonialInput } from '@/types/models'

export default function SettingsAdminPage() {
  const settings = useQuery(SETTINGS_KEY, (signal) => settingsService.get(signal), { staleTime: 0 })
  return (
    <div>
      <AdminPageHeader title="Settings" description="The center’s public profile, testimonials and your account." />
      {settings.error ? (
        <ErrorState message={settings.error.message} onRetry={settings.refetch} />
      ) : !settings.data ? (
        <Skeleton className="mt-8 h-96 w-full" />
      ) : (
        <CenterForm key={settings.data.updatedAt} settings={settings.data} />
      )}
      <TestimonialsSection />
      <PasswordSection />
    </div>
  )
}

function CenterForm({ settings }: { settings: CenterSettings }) {
  const { user } = useAuth()
  const toast = useToast()
  const canEdit = user?.role === 'ADMIN'
  const [form, setForm] = useState<SettingsInput>(() => {
    const { updatedAt: _ignored, ...rest } = settings
    return rest
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.centerName.trim()) {
      setErrors({ centerName: 'Center name is required' })
      return
    }
    setSaving(true)
    try {
      await settingsService.update({ ...form, openingHours: form.openingHours.filter((h) => h.label.trim() && h.hours.trim()) })
      toast.success('Settings saved', 'The website now shows the new details.')
      invalidateQueries(SETTINGS_KEY)
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.length) setErrors(e.byField)
      toast.error('Settings could not be saved', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4">
      {!canEdit && (
        <p className="mt-6 border-l border-champagne py-1 pl-4 text-small text-ink-muted">Only administrators can change the center profile. You can view it here.</p>
      )}
      <fieldset disabled={!canEdit} className="contents">
        <FormSection title="Center" description="Name and tagline used across the website.">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Center name" required value={form.centerName} onChange={(e) => set('centerName', e.target.value)} error={errors.centerName} />
            <Input label="Tagline" value={form.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} />
          </div>
        </FormSection>
        <FormSection title="Address & contact" description="Shown in the footer, on the contact page and in search engine data.">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Street address" value={form.addressLine ?? ''} onChange={(e) => set('addressLine', e.target.value)} containerClassName="sm:col-span-2" />
            <Input label="Postal code" value={form.postalCode ?? ''} onChange={(e) => set('postalCode', e.target.value)} />
            <Input label="City" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
            <Input label="Phone" type="tel" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
            <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Map link" placeholder="https://…" value={form.mapUrl ?? ''} onChange={(e) => set('mapUrl', e.target.value)} error={errors.mapUrl} containerClassName="sm:col-span-2" />
          </div>
        </FormSection>
        <FormSection title="Opening hours" description="One row per line in the hours table.">
          <div className="grid gap-3">
            {form.openingHours.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <Input label={i === 0 ? 'Days' : ''} aria-label={`Days, row ${i + 1}`} value={h.label} onChange={(e) => set('openingHours', form.openingHours.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Monday – Friday" />
                <Input label={i === 0 ? 'Hours' : ''} aria-label={`Hours, row ${i + 1}`} value={h.hours} onChange={(e) => set('openingHours', form.openingHours.map((x, j) => (j === i ? { ...x, hours: e.target.value } : x)))} placeholder="9:00 – 20:00" />
                <IconButton label={`Remove row ${i + 1}`} tone="danger" onClick={() => set('openingHours', form.openingHours.filter((_, j) => j !== i))}>
                  <X className="size-4" />
                </IconButton>
              </div>
            ))}
            {canEdit && form.openingHours.length < 10 && (
              <Button variant="secondary" size="sm" className="h-10 justify-self-start" icon={<Plus className="size-4" />} onClick={() => set('openingHours', [...form.openingHours, { label: '', hours: '' }])}>
                Add a row
              </Button>
            )}
          </div>
        </FormSection>
        <FormSection title="Social media">
          <div className="grid gap-6 sm:grid-cols-3">
            <Input label="Instagram" placeholder="https://instagram.com/…" value={form.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} error={errors.instagramUrl} />
            <Input label="Facebook" placeholder="https://facebook.com/…" value={form.facebookUrl ?? ''} onChange={(e) => set('facebookUrl', e.target.value)} error={errors.facebookUrl} />
            <Input label="Pinterest" placeholder="https://pinterest.com/…" value={form.pinterestUrl ?? ''} onChange={(e) => set('pinterestUrl', e.target.value)} error={errors.pinterestUrl} />
          </div>
        </FormSection>
      </fieldset>
      {canEdit && (
        <div className="flex justify-end pt-6">
          <Button type="submit" size="sm" className="h-10" loading={saving}>
            Save settings
          </Button>
        </div>
      )}
    </form>
  )
}

function TestimonialsSection() {
  const toast = useToast()
  const { data, isLoading } = useQuery('testimonials:all', (signal) => testimonialService.listAll(signal), { staleTime: 5_000 })
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Testimonial | null>(null)
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await testimonialService.remove(toDelete.id)
      toast.success('Testimonial deleted')
      invalidateQueries('testimonials')
      setToDelete(null)
    } catch (e) {
      toast.error('Could not delete the testimonial', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mt-12">
      <FormSection title="Testimonials" description="Quotes shown on the home page. Publish only with the client’s permission.">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <ul className="rounded-xs border border-line bg-porcelain">
            {(data ?? []).map((t) => (
              <li key={t.id} className="flex items-start gap-4 border-b border-line p-4 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-small text-ink">“{t.quote}”</p>
                  <p className="mt-1 text-[0.75rem] text-ink-muted">
                    {t.authorName}
                    {t.treatmentName && ` · ${t.treatmentName}`}
                  </p>
                </div>
                {!t.published && <Badge tone="neutral">Hidden</Badge>}
                <IconButton label={`Edit testimonial from ${t.authorName}`} onClick={() => setEditing(t)}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton label={`Delete testimonial from ${t.authorName}`} tone="danger" onClick={() => setToDelete(t)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </li>
            ))}
            {data?.length === 0 && <li className="p-4 text-small text-ink-muted">No testimonials yet.</li>}
          </ul>
        )}
        <Button variant="secondary" size="sm" className="h-10 justify-self-start" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
          Add a testimonial
        </Button>
      </FormSection>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Edit testimonial' : 'Add a testimonial'}>
        {editing && <TestimonialForm key={editing === 'new' ? 'new' : editing.id} testimonial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog open={!!toDelete} title="Delete this testimonial?" description="It will be removed from the website." loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}

function TestimonialForm({ testimonial, onClose }: { testimonial: Testimonial | null; onClose: () => void }) {
  const toast = useToast()
  const [form, setForm] = useState<TestimonialInput>({
    authorName: testimonial?.authorName ?? '',
    authorDetail: testimonial?.authorDetail ?? '',
    quote: testimonial?.quote ?? '',
    treatmentName: testimonial?.treatmentName ?? '',
    displayOrder: testimonial?.displayOrder ?? 0,
    published: testimonial?.published ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = { authorName: form.authorName.trim() ? undefined : 'Name is required', quote: form.quote.trim() ? undefined : 'Quote is required' }
    setErrors(found)
    if (found.authorName || found.quote) return
    setSaving(true)
    try {
      if (testimonial) await testimonialService.update(testimonial.id, form)
      else await testimonialService.create(form)
      toast.success(testimonial ? 'Testimonial updated' : 'Testimonial added')
      invalidateQueries('testimonials')
      onClose()
    } catch (e) {
      toast.error('The testimonial could not be saved', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <Textarea label="Quote" required rows={4} maxLength={1200} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} error={errors.quote} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Name" required placeholder="Claire M." value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} error={errors.authorName} />
        <Input label="Detail" placeholder="Client since 2024" value={form.authorDetail ?? ''} onChange={(e) => setForm({ ...form, authorDetail: e.target.value })} />
        <Input label="Treatment" value={form.treatmentName ?? ''} onChange={(e) => setForm({ ...form, treatmentName: e.target.value })} />
        <Input label="Display order" type="number" min={0} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
      </div>
      <Switch checked={!!form.published} onChange={(v) => setForm({ ...form, published: v })} label="Published" />
      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Button variant="quiet" size="sm" className="h-10" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-10" loading={saving}>
          Save
        </Button>
      </div>
    </form>
  )
}

function PasswordSection() {
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = {
      currentPassword: current ? undefined : 'Enter your current password',
      newPassword: next.length < 10 ? 'At least 10 characters' : !/[A-Za-z]/.test(next) || !/\d/.test(next) ? 'Use at least one letter and one digit' : undefined,
      confirm: next !== confirm ? 'The passwords do not match' : undefined,
    }
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setSaving(true)
    try {
      await authService.changePassword(current, next)
      toast.success('Password updated')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.length) setErrors(e.byField)
      toast.error('Password not changed', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4">
      <FormSection title="Your password" description="At least 10 characters, with letters and digits.">
        <div className="grid max-w-md gap-5">
          <Input label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.currentPassword} />
          <Input label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.newPassword} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
          <Button type="submit" size="sm" className="h-10 justify-self-start" loading={saving}>
            Change password
          </Button>
        </div>
      </FormSection>
    </form>
  )
}
