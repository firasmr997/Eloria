import { Mail, Phone, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { AdminPageHeader, AppointmentBadge, IconButton, SearchField, Segmented, Table, TableSkeleton, Td, Th, Toolbar } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Pagination } from '@/components/ui/Feedback'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { useDebouncedValue } from '@/hooks/useUtilities'
import { appointmentService } from '@/services/requestService'
import { APPOINTMENT_STATUSES, type Appointment, type AppointmentStatus } from '@/types/models'
import { formatDate, formatDateTime, timeAgo } from '@/utils/format'

type Filter = AppointmentStatus | 'ALL'

export default function AppointmentsAdminPage() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as Filter) || 'ALL'
  const [query, setQuery] = useState('')
  const q = useDebouncedValue(query.trim(), 300)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(12)
  const [open, setOpen] = useState<Appointment | null>(null)
  const [toDelete, setToDelete] = useState<Appointment | null>(null)
  const [deleting, setDeleting] = useState(false)

  const search = { status: status === 'ALL' ? undefined : status, q: q || undefined, from: from || undefined, to: to || undefined, page, size }
  const list = useQuery(`appointments:list:${JSON.stringify(search)}`, (signal) => appointmentService.list(search, signal), { keepPrevious: true, staleTime: 5_000 })
  const data = list.data

  const refresh = () => {
    invalidateQueries('appointments')
    invalidateQueries('dashboard')
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await appointmentService.remove(toDelete.id)
      toast.success('Request deleted', toDelete.name)
      refresh()
      setToDelete(null)
      setOpen(null)
    } catch (e) {
      toast.error('Could not delete the request', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader title="Appointments" description="Consultation requests from the website. Call or email the client, then record the outcome here." />
      <Toolbar className="flex-wrap">
        <Segmented<Filter>
          label="Filter by status"
          value={status}
          onChange={(v) => {
            setParams(v === 'ALL' ? {} : { status: v }, { replace: true })
            setPage(0)
          }}
          options={[{ value: 'ALL', label: 'All' }, ...APPOINTMENT_STATUSES.map((s) => ({ value: s as Filter, label: s.charAt(0) + s.slice(1).toLowerCase() }))]}
        />
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <SearchField value={query} onChange={(v) => { setQuery(v); setPage(0) }} placeholder="Name, email, phone, treatment" label="Search appointments" />
          <label className="flex items-center gap-2 text-small text-ink-muted">
            From
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0) }} className="h-10 rounded-xs border border-line-strong bg-porcelain px-2 text-ink" />
          </label>
          <label className="flex items-center gap-2 text-small text-ink-muted">
            To
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0) }} className="h-10 rounded-xs border border-line-strong bg-porcelain px-2 text-ink" />
          </label>
        </div>
      </Toolbar>

      {list.error && !data ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : !data ? (
        <TableSkeleton />
      ) : data.content.length === 0 ? (
        <EmptyState title="No appointments." body={status !== 'ALL' || q || from || to ? 'Nothing matches these filters.' : 'Requests sent from the website will appear here.'} />
      ) : (
        <>
          <Table label="Appointment requests">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Treatment</Th>
                <Th>Preferred</Th>
                <Th>Received</Th>
                <Th>Status</Th>
                <Th className="text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody className={list.isFetching ? 'opacity-60' : undefined}>
              {data.content.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-ivory" onClick={() => setOpen(a)}>
                  <Td>
                    <button type="button" className="text-left font-semibold text-ink hover:text-champagne-deep" onClick={(e) => { e.stopPropagation(); setOpen(a) }}>
                      {a.name}
                    </button>
                    <p className="text-[0.8125rem] text-ink-muted">{a.email}</p>
                  </Td>
                  <Td className="text-ink-muted">{a.treatmentName ?? 'First consultation'}</Td>
                  <Td className="whitespace-nowrap tabular">
                    {formatDate(a.preferredDate, { weekday: 'short', day: 'numeric', month: 'short' })} · {a.preferredTime}
                  </Td>
                  <Td className="whitespace-nowrap text-ink-muted">{timeAgo(a.createdAt)}</Td>
                  <Td>
                    <AppointmentBadge status={a.status} />
                  </Td>
                  <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <IconButton label={`Delete request from ${a.name}`} tone="danger" onClick={() => setToDelete(a)}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-6">
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} label="requests" onPage={setPage} onSize={(s) => { setSize(s); setPage(0) }} />
          </div>
        </>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `Request from ${open.name}` : ''} description={open ? `Received ${formatDateTime(open.createdAt)}` : undefined} size="lg">
        {open && <AppointmentDetail key={open.id} appointment={open} onSaved={(a) => { setOpen(a); refresh() }} onDelete={() => setToDelete(open)} />}
      </Modal>
      <ConfirmDialog
        open={!!toDelete}
        title="Delete this request?"
        description={<>The request from <strong className="text-ink">{toDelete?.name}</strong> will be permanently deleted.</>}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

function AppointmentDetail({ appointment: a, onSaved, onDelete }: { appointment: Appointment; onSaved: (a: Appointment) => void; onDelete: () => void }) {
  const toast = useToast()
  const [status, setStatus] = useState<AppointmentStatus>(a.status)
  const [notes, setNotes] = useState(a.adminNotes ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const saved = await appointmentService.update(a.id, status, notes.trim() || null)
      toast.success('Appointment updated', `${saved.name} · ${saved.status.toLowerCase()}`)
      onSaved(saved)
    } catch (e) {
      toast.error('Could not update the appointment', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <dl className="border-t border-espresso text-small">
        {[
          ['Treatment', a.treatmentName ?? 'First consultation'],
          ['Preferred date', formatDate(a.preferredDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
          ['Preferred time', a.preferredTime],
          ['Email', a.email],
          ['Phone', a.phone],
        ].map(([label, value]) => (
          <div key={label} className="grid grid-cols-[8rem_1fr] gap-3 border-b border-line py-3">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="break-words text-ink tabular">{value}</dd>
          </div>
        ))}
        {a.message && (
          <div className="border-b border-line py-3">
            <dt className="text-ink-muted">Message</dt>
            <dd className="mt-1 whitespace-pre-line text-ink">{a.message}</dd>
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-5">
          <a href={`tel:${a.phone.replace(/\s/g, '')}`} className="inline-flex h-10 items-center gap-2 rounded-xs border border-line-strong px-4 text-small hover:border-espresso">
            <Phone className="size-4" aria-hidden /> Call
          </a>
          <a href={`mailto:${a.email}?subject=${encodeURIComponent('Your consultation request at ÉLORIA AESTHETIC')}`} className="inline-flex h-10 items-center gap-2 rounded-xs border border-line-strong px-4 text-small hover:border-espresso">
            <Mail className="size-4" aria-hidden /> Email
          </a>
        </div>
      </dl>
      <div className="grid content-start gap-5">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Textarea label="Internal notes" rows={5} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} hint="Visible to staff only." />
        <Input label="Last updated" value={formatDateTime(a.updatedAt)} readOnly disabled />
        <div className="flex justify-between gap-3 pt-2">
          <Button variant="quiet" size="sm" className="h-10 text-error!" icon={<Trash2 className="size-4" />} onClick={onDelete}>
            Delete
          </Button>
          <Button size="sm" className="h-10" loading={saving} onClick={save} disabled={status === a.status && notes === (a.adminNotes ?? '')}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
