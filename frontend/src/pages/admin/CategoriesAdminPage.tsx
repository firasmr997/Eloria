import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { AdminPageHeader, IconButton, Table, TableSkeleton, Td, Th } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState, ErrorState } from '@/components/ui/Feedback'
import { Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { categoryService } from '@/services/categoryService'
import type { Category, CategoryInput } from '@/types/models'

export default function CategoriesAdminPage() {
  const toast = useToast()
  const { data, error, isLoading, refetch } = useQuery('categories:all', (signal) => categoryService.listAll(signal), { staleTime: 5_000 })
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [reassignTo, setReassignTo] = useState('')
  const [deleting, setDeleting] = useState(false)

  const refresh = () => {
    invalidateQueries('categories')
    invalidateQueries('treatments')
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    if (toDelete.treatmentCount > 0 && !reassignTo) {
      toast.error('Choose where to move the treatments first')
      return
    }
    setDeleting(true)
    try {
      await categoryService.remove(toDelete.id, toDelete.treatmentCount > 0 ? Number(reassignTo) : undefined)
      toast.success('Category deleted', toDelete.name)
      refresh()
      setToDelete(null)
    } catch (e) {
      toast.error('Could not delete the category', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Group treatments on the website. Hidden categories and their treatments are not shown to visitors."
        actions={
          <Button size="sm" className="h-10" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            New category
          </Button>
        }
      />
      <div className="mt-8">
        {error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : isLoading || !data ? (
          <TableSkeleton rows={6} cols={4} />
        ) : data.length === 0 ? (
          <EmptyState title="No categories yet." action={<Button size="sm" onClick={() => setEditing('new')}>Create a category</Button>} />
        ) : (
          <Table label="Categories">
            <thead>
              <tr>
                <Th className="w-16">Order</Th>
                <Th>Category</Th>
                <Th className="text-right">Treatments</Th>
                <Th>Visibility</Th>
                <Th className="text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-ivory">
                  <Td className="tabular text-ink-muted">{c.displayOrder}</Td>
                  <Td>
                    <p className="font-semibold">{c.name}</p>
                    {c.description && <p className="max-w-md truncate text-[0.8125rem] text-ink-muted">{c.description}</p>}
                  </Td>
                  <Td className="text-right tabular">{c.treatmentCount}</Td>
                  <Td>{c.active ? <Badge tone="success">Visible</Badge> : <Badge tone="neutral">Hidden</Badge>}</Td>
                  <Td className="text-right whitespace-nowrap">
                    <IconButton label={`Edit ${c.name}`} onClick={() => setEditing(c)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label={`Delete ${c.name}`} tone="danger" onClick={() => { setReassignTo(''); setToDelete(c) }}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <CategoryDialog category={editing} onClose={() => setEditing(null)} onSaved={refresh} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this category?"
        description={
          toDelete && toDelete.treatmentCount > 0 ? (
            <>
              <strong className="text-ink">{toDelete.name}</strong> still has {toDelete.treatmentCount} {toDelete.treatmentCount === 1 ? 'treatment' : 'treatments'}. Choose a category to move {toDelete.treatmentCount === 1 ? 'it' : 'them'} to before deleting.
            </>
          ) : (
            <>
              <strong className="text-ink">{toDelete?.name}</strong> has no treatments and will be removed. This cannot be undone.
            </>
          )
        }
        confirmLabel={toDelete && toDelete.treatmentCount > 0 ? 'Move and delete' : 'Delete'}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        {toDelete && toDelete.treatmentCount > 0 && (
          <Select label="Move treatments to" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} required>
            <option value="">Choose a category</option>
            {data
              ?.filter((c) => c.id !== toDelete.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>
        )}
      </ConfirmDialog>
    </div>
  )
}

function CategoryDialog({ category, onClose, onSaved }: { category: Category | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const existing = category && category !== 'new' ? category : null
  return (
    <Modal open={!!category} onClose={onClose} title={existing ? `Edit ${existing.name}` : 'New category'} size="md">
      {category && <CategoryForm key={existing?.id ?? 'new'} category={existing} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}

function CategoryForm({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast()
  const [form, setForm] = useState<CategoryInput>({
    name: category?.name ?? '',
    description: category?.description ?? '',
    displayOrder: category?.displayOrder ?? 0,
    active: category?.active ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }
    setSaving(true)
    try {
      const saved = category ? await categoryService.update(category.id, form) : await categoryService.create(form)
      toast.success(category ? 'Category updated' : 'Category created', saved.name)
      onSaved()
      onClose()
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.length) setErrors(e.byField)
      toast.error('The category could not be saved', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <Input label="Name" required value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} data-autofocus />
      <Textarea label="Description" rows={3} maxLength={600} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} hint="Shown above the treatments when this category is selected." />
      <Input label="Display order" type="number" min={0} max={9999} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} hint="Lower numbers appear first." />
      <Switch checked={form.active ?? true} onChange={(v) => setForm({ ...form, active: v })} label="Visible on the website" />
      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Button variant="quiet" size="sm" className="h-10" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-10" loading={saving}>
          {category ? 'Save' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
