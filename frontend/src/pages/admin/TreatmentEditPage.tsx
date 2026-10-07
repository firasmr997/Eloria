import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ApiError } from '@/api/client'
import { AdminPageHeader, FormSection } from '@/components/admin/AdminUi'
import { ImageUploader, useUploadSession } from '@/components/admin/ImageUploader'
import { ListEditor } from '@/components/admin/ListEditor'
import { Button } from '@/components/ui/Button'
import { ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { categoryService } from '@/services/categoryService'
import { treatmentService } from '@/services/treatmentService'
import type { Treatment, TreatmentInput } from '@/types/models'
import { hasErrors, type Errors } from '@/utils/validation'

const EMPTY: TreatmentInput = {
  name: '',
  categoryId: 0,
  shortDescription: '',
  description: '',
  durationMinutes: 60,
  sessions: '',
  downtime: '',
  price: 0,
  priceFrom: false,
  benefits: [],
  preparation: [],
  aftercare: [],
  contraindications: [],
  technology: '',
  mainImageUrl: null,
  mainImageAlt: '',
  additionalImages: [],
  faqs: [],
  available: true,
  featured: false,
}

function fromTreatment(t: Treatment): TreatmentInput {
  return {
    name: t.name,
    categoryId: t.category.id,
    shortDescription: t.shortDescription,
    description: t.description,
    durationMinutes: t.durationMinutes,
    sessions: t.sessions ?? '',
    downtime: t.downtime ?? '',
    price: t.price,
    priceFrom: t.priceFrom,
    benefits: t.benefits,
    preparation: t.preparation,
    aftercare: t.aftercare,
    contraindications: t.contraindications,
    technology: t.technology ?? '',
    mainImageUrl: t.mainImageUrl,
    mainImageAlt: t.mainImageAlt ?? '',
    additionalImages: t.additionalImages.map((i) => ({ imageUrl: i.imageUrl, altText: i.altText ?? '' })),
    faqs: t.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    available: t.available,
    featured: t.featured,
  }
}

function validate(f: TreatmentInput): Errors<TreatmentInput> {
  return {
    name: !f.name.trim() ? 'Name is required' : f.name.length > 120 ? 'At most 120 characters' : undefined,
    categoryId: !f.categoryId ? 'Choose a category' : undefined,
    shortDescription: !f.shortDescription.trim() ? 'Short description is required' : f.shortDescription.length > 280 ? 'At most 280 characters' : undefined,
    description: !f.description.trim() ? 'Description is required' : undefined,
    durationMinutes: !(f.durationMinutes >= 5 && f.durationMinutes <= 600) ? 'Between 5 and 600 minutes' : undefined,
    price: !(f.price >= 0) ? 'Enter a price of 0 or more' : undefined,
    faqs: f.faqs.some((q) => !q.question.trim() || !q.answer.trim()) ? 'Every question needs an answer' : undefined,
  }
}

export default function TreatmentEditPage() {
  const { id } = useParams()
  const isNew = !id
  const existing = useQuery(isNew ? null : `treatment:admin:${id}`, (signal) => treatmentService.byId(Number(id), signal))
  if (!isNew && existing.error) return <ErrorState message={existing.error.message} onRetry={existing.refetch} />
  if (!isNew && !existing.data) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }
  return <TreatmentForm key={id ?? 'new'} treatment={existing.data ?? null} />
}

function TreatmentForm({ treatment }: { treatment: Treatment | null }) {
  const toast = useToast()
  const navigate = useNavigate()
  const uploads = useUploadSession()
  const categories = useQuery('categories:all', (signal) => categoryService.listAll(signal))
  const [form, setForm] = useState<TreatmentInput>(() => (treatment ? fromTreatment(treatment) : EMPTY))
  const [errors, setErrors] = useState<Errors<TreatmentInput>>({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof TreatmentInput>(key: K, value: TreatmentInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (hasErrors(found)) {
      toast.error('Please review the highlighted fields')
      return
    }
    setSaving(true)
    const payload: TreatmentInput = {
      ...form,
      additionalImages: form.additionalImages.filter((i) => i.imageUrl),
      sessions: form.sessions || null,
      downtime: form.downtime || null,
      technology: form.technology || null,
      mainImageAlt: form.mainImageAlt || null,
    }
    try {
      const saved = treatment ? await treatmentService.update(treatment.id, payload) : await treatmentService.create(payload)
      uploads.settle([saved.mainImageUrl, ...saved.additionalImages.map((i) => i.imageUrl)])
      invalidateQueries('treatment')
      invalidateQueries('categories')
      invalidateQueries('dashboard')
      setDirty(false)
      toast.success(treatment ? 'Treatment updated' : 'Treatment created', saved.name)
      navigate('/admin/treatments')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.length) setErrors(error.byField)
      toast.error('The treatment could not be saved', error instanceof Error ? error.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!treatment) return
    setDeleting(true)
    try {
      await treatmentService.remove(treatment.id)
      invalidateQueries('treatment')
      invalidateQueries('categories')
      invalidateQueries('dashboard')
      toast.success('Treatment deleted', treatment.name)
      navigate('/admin/treatments')
    } catch (error) {
      toast.error('Could not delete the treatment', error instanceof Error ? error.message : undefined)
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Link to="/admin/treatments" className="mb-6 inline-flex items-center gap-2 text-small text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All treatments
      </Link>
      <AdminPageHeader
        title={treatment ? treatment.name : 'New treatment'}
        description={treatment ? 'Changes appear on the website as soon as you save.' : 'Fill in the essentials; everything can be edited later.'}
        actions={
          <>
            {treatment && (
              <Button variant="quiet" size="sm" className="h-10" icon={<Trash2 className="size-4" />} onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )}
            <Button type="submit" size="sm" className="h-10" loading={saving}>
              {treatment ? 'Save changes' : 'Create treatment'}
            </Button>
          </>
        }
      />

      <FormSection title="Essentials" description="Name, category and how the treatment is introduced on cards and search results.">
        <Input label="Name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} maxLength={120} />
        <Select label="Category" required value={form.categoryId || ''} onChange={(e) => set('categoryId', Number(e.target.value))} error={errors.categoryId}>
          <option value="">Choose a category</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.active ? '' : ' (hidden)'}
            </option>
          ))}
        </Select>
        <Textarea
          label="Short description"
          required
          rows={2}
          maxLength={280}
          value={form.shortDescription}
          onChange={(e) => set('shortDescription', e.target.value)}
          error={errors.shortDescription}
          hint={`${form.shortDescription.length}/280 · shown on cards and in search engines`}
        />
        <Textarea label="Description" required rows={6} value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} hint="Avoid guaranteed outcomes: describe what the treatment can support." />
      </FormSection>

      <FormSection title="Practical details" description="Shown in the treatment’s spec sheet.">
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Duration (minutes)" type="number" min={5} max={600} required value={form.durationMinutes} onChange={(e) => set('durationMinutes', Number(e.target.value))} error={errors.durationMinutes} />
          <Input label="Price (EUR)" type="number" min={0} step="0.01" required value={form.price} onChange={(e) => set('price', Number(e.target.value))} error={errors.price} />
          <Input label="Sessions" placeholder="Course of 3 to 6, 4 weeks apart" value={form.sessions ?? ''} onChange={(e) => set('sessions', e.target.value)} />
          <Input label="Downtime" placeholder="None" value={form.downtime ?? ''} onChange={(e) => set('downtime', e.target.value)} />
          <Input label="Technology" placeholder="e.g. Medical diode laser" value={form.technology ?? ''} onChange={(e) => set('technology', e.target.value)} containerClassName="sm:col-span-2" />
        </div>
        <Switch checked={form.priceFrom} onChange={(v) => set('priceFrom', v)} label="Starting price" description="Shows “from €…” when the final price depends on the area or number of sessions." />
      </FormSection>

      <FormSection title="Content" description="One idea per line. Use clear, cautious language.">
        <ListEditor label="Benefits" items={form.benefits} onChange={(v) => set('benefits', v)} placeholder="Add a benefit and press Enter" />
        <ListEditor label="Preparation" items={form.preparation} onChange={(v) => set('preparation', v)} placeholder="Add a preparation step" />
        <ListEditor label="Aftercare" items={form.aftercare} onChange={(v) => set('aftercare', v)} placeholder="Add an aftercare instruction" />
        <ListEditor label="Contraindications" items={form.contraindications} onChange={(v) => set('contraindications', v)} placeholder="Add a contraindication" hint="Shown under “When this treatment may not be suitable”." />
      </FormSection>

      <FormSection title="Images" description="The main image is used on cards, the treatment page and social previews.">
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUploader label="Main image" folder="treatments" value={form.mainImageUrl} onChange={(url) => set('mainImageUrl', url)} onUploaded={uploads.register} aspect="aspect-[4/5]" />
          <div className="flex flex-col gap-6">
            <Input label="Main image description (alt text)" value={form.mainImageAlt ?? ''} onChange={(e) => set('mainImageAlt', e.target.value)} hint="Describe the photo for people using screen readers." />
          </div>
        </div>
        <div>
          <p className="text-caption text-ink-muted">Additional images</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {form.additionalImages.map((image, i) => (
              <div key={i} className="relative">
                <ImageUploader
                  label={`Image ${i + 1}`}
                  folder="treatments"
                  value={image.imageUrl || null}
                  onUploaded={uploads.register}
                  onChange={(url) => set('additionalImages', url ? form.additionalImages.map((im, j) => (j === i ? { ...im, imageUrl: url } : im)) : form.additionalImages.filter((_, j) => j !== i))}
                  aspect="aspect-square"
                />
                <input
                  value={image.altText ?? ''}
                  onChange={(e) => set('additionalImages', form.additionalImages.map((im, j) => (j === i ? { ...im, altText: e.target.value } : im)))}
                  placeholder="Alt text"
                  aria-label={`Alt text for image ${i + 1}`}
                  className="mt-2 h-9 w-full rounded-xs border border-line-strong bg-porcelain px-3 text-small focus:border-champagne-deep focus:outline-none"
                />
              </div>
            ))}
            {form.additionalImages.length < 12 && (
              <button
                type="button"
                onClick={() => set('additionalImages', [...form.additionalImages, { imageUrl: '', altText: '' }])}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xs border border-dashed border-line-strong text-small text-ink-muted hover:border-espresso hover:text-ink sm:mt-[1.6rem]"
              >
                <Plus className="size-5" aria-hidden /> Add an image
              </button>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Questions" description="Frequently asked questions shown on the treatment page.">
        {form.faqs.map((faq, i) => (
          <div key={i} className="relative rounded-xs border border-line bg-porcelain p-5">
            <button type="button" onClick={() => set('faqs', form.faqs.filter((_, j) => j !== i))} className="absolute top-3 right-3 p-1.5 text-taupe hover:text-error" aria-label={`Remove question ${i + 1}`}>
              <X className="size-4" />
            </button>
            <div className="grid gap-4">
              <Input label={`Question ${i + 1}`} value={faq.question} onChange={(e) => set('faqs', form.faqs.map((f, j) => (j === i ? { ...f, question: e.target.value } : f)))} />
              <Textarea label="Answer" rows={3} value={faq.answer} onChange={(e) => set('faqs', form.faqs.map((f, j) => (j === i ? { ...f, answer: e.target.value } : f)))} />
            </div>
          </div>
        ))}
        {errors.faqs && (
          <p className="text-small font-medium text-error" role="alert">
            {errors.faqs}
          </p>
        )}
        {form.faqs.length < 12 && (
          <Button variant="secondary" size="sm" className="h-10 justify-self-start" icon={<Plus className="size-4" />} onClick={() => set('faqs', [...form.faqs, { question: '', answer: '' }])}>
            Add a question
          </Button>
        )}
      </FormSection>

      <FormSection title="Visibility">
        <Switch checked={form.available} onChange={(v) => set('available', v)} label="Available" description="Unavailable treatments stay on the website but cannot be requested." />
        <Switch checked={form.featured} onChange={(v) => set('featured', v)} label="Featured" description="Featured treatments appear on the home page." />
      </FormSection>

      <div className="sticky bottom-0 z-20 -mx-4 mt-2 flex items-center justify-end gap-3 border-t border-line bg-ivory/95 px-4 py-4 sm:-mx-8 sm:px-8">
        {dirty && <span className="mr-auto text-small text-ink-muted">Unsaved changes</span>}
        <Link to="/admin/treatments" className="inline-flex h-10 items-center rounded-xs px-4 text-button text-ink-muted hover:bg-ink/5 hover:text-ink">
          Cancel
        </Link>
        <Button type="submit" size="sm" className="h-10" loading={saving}>
          {treatment ? 'Save changes' : 'Create treatment'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this treatment?"
        description={<><strong className="text-ink">{treatment?.name}</strong> will be removed from the website. This cannot be undone.</>}
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </form>
  )
}
