import { Archive, ArchiveRestore, ArrowLeft, Mail, MailOpen, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AdminPageHeader, MessageBadge, SearchField, Segmented, Toolbar } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, Pagination, Skeleton } from '@/components/ui/Feedback'
import { ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/context/ToastContext'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { useDebouncedValue } from '@/hooks/useUtilities'
import { messageService } from '@/services/requestService'
import type { ContactMessage, MessageStatus } from '@/types/models'
import { cn, formatDateTime, timeAgo } from '@/utils/format'

type Filter = MessageStatus | 'INBOX'

/** Two-pane inbox: list on the left, reading pane on the right (stacked on phones). */
export default function MessagesAdminPage() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('INBOX')
  const [query, setQuery] = useState('')
  const q = useDebouncedValue(query.trim(), 300)
  const [page, setPage] = useState(0)
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const openId = params.get('open') ? Number(params.get('open')) : null

  // Inbox = everything not archived.
  const search = { status: filter === 'INBOX' ? undefined : filter, inbox: filter === 'INBOX' || undefined, q: q || undefined, page, size: 20 }
  const list = useQuery(`messages:list:${JSON.stringify(search)}`, (signal) => messageService.list(search, signal), { keepPrevious: true, staleTime: 5_000 })
  const messages = list.data?.content ?? []
  const selected = messages.find((m) => m.id === openId) ?? null

  const refresh = () => {
    invalidateQueries('messages')
    invalidateQueries('dashboard')
  }

  const setStatus = async (message: ContactMessage, status: MessageStatus, quiet = false) => {
    try {
      await messageService.update(message.id, status)
      if (!quiet) toast.success(status === 'ARCHIVED' ? 'Message archived' : status === 'READ' ? 'Marked as read' : 'Marked as unread')
      refresh()
    } catch (e) {
      toast.error('Could not update the message', e instanceof Error ? e.message : undefined)
    }
  }

  // Opening a new message marks it as read.
  useEffect(() => {
    if (selected?.status === 'NEW') setStatus(selected, 'READ', true)
  }, [selected?.id]) // once per opened message, not on every status change

  const open = (id: number | null) => setParams(id ? { open: String(id) } : {}, { replace: true })

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await messageService.remove(toDelete.id)
      toast.success('Message deleted')
      if (openId === toDelete.id) open(null)
      refresh()
      setToDelete(null)
    } catch (e) {
      toast.error('Could not delete the message', e instanceof Error ? e.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader title="Messages" description="Questions sent through the contact form. Reply by email; archive what is handled." />
      <Toolbar>
        <Segmented<Filter>
          label="Filter messages"
          value={filter}
          onChange={(v) => { setFilter(v); setPage(0); open(null) }}
          options={[
            { value: 'INBOX', label: 'Inbox' },
            { value: 'NEW', label: 'Unread' },
            { value: 'READ', label: 'Read' },
            { value: 'ARCHIVED', label: 'Archived' },
          ]}
        />
        <div className="lg:ml-auto">
          <SearchField value={query} onChange={(v) => { setQuery(v); setPage(0) }} placeholder="Name, email or text" label="Search messages" />
        </div>
      </Toolbar>

      {list.error && !list.data ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : (
        <div className="grid min-h-[32rem] overflow-hidden rounded-xs border border-line bg-porcelain lg:grid-cols-[22rem_1fr]">
          <div className={cn('border-line lg:border-r', selected && 'hidden lg:block')}>
            {!list.data ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <EmptyState title="No messages." body={q ? 'Nothing matches this search.' : 'Messages from the contact form appear here.'} />
            ) : (
              <ul aria-label="Messages">
                {messages.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => open(m.id)}
                      aria-current={m.id === openId || undefined}
                      className={cn('block w-full border-b border-line px-4 py-3.5 text-left transition-colors', m.id === openId ? 'bg-ivory' : 'hover:bg-ivory/60')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn('truncate text-small', m.status === 'NEW' ? 'font-semibold text-ink' : 'text-ink')}>
                          {m.status === 'NEW' && <span className="mr-2 inline-block size-1.5 rounded-full bg-champagne-deep align-middle" aria-label="Unread" />}
                          {m.name}
                        </span>
                        <span className="shrink-0 text-[0.75rem] text-ink-muted">{timeAgo(m.createdAt)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[0.8125rem] text-ink-muted">{m.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {list.data && list.data.totalPages > 1 && (
              <div className="p-4">
                <Pagination page={list.data.page} totalPages={list.data.totalPages} totalElements={list.data.totalElements} size={list.data.size} label="messages" onPage={setPage} />
              </div>
            )}
          </div>

          <div className={cn(!selected && 'hidden lg:block')}>
            {selected ? (
              <article className="flex h-full flex-col">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6">
                  <div>
                    <button type="button" onClick={() => open(null)} className="mb-3 inline-flex items-center gap-1.5 text-small text-ink-muted hover:text-ink lg:hidden">
                      <ArrowLeft className="size-4" aria-hidden /> Back
                    </button>
                    <h2 className="font-display text-2xl text-ink">{selected.name}</h2>
                    <p className="mt-1 text-small text-ink-muted">
                      <a href={`mailto:${selected.email}`} className="link-underline">
                        {selected.email}
                      </a>
                      {selected.phone && <span className="tabular"> · {selected.phone}</span>}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-ink-muted">{formatDateTime(selected.createdAt)}</p>
                  </div>
                  <MessageBadge status={selected.status} />
                </header>
                <p className="flex-1 p-6 leading-relaxed whitespace-pre-line text-ink">{selected.message}</p>
                <footer className="flex flex-wrap gap-2 border-t border-line p-4">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: your message to ÉLORIA AESTHETIC')}`}
                    className="inline-flex h-10 items-center gap-2 rounded-xs bg-espresso px-4 text-small text-ivory hover:bg-espresso-raised"
                  >
                    <Mail className="size-4" aria-hidden /> Reply by email
                  </a>
                  {selected.status === 'ARCHIVED' ? (
                    <Button variant="secondary" size="sm" className="h-10" icon={<ArchiveRestore className="size-4" />} onClick={() => setStatus(selected, 'READ')}>
                      Restore
                    </Button>
                  ) : (
                    <>
                      <Button variant="secondary" size="sm" className="h-10" icon={<MailOpen className="size-4" />} onClick={() => setStatus(selected, selected.status === 'NEW' ? 'READ' : 'NEW')}>
                        {selected.status === 'NEW' ? 'Mark as read' : 'Mark as unread'}
                      </Button>
                      <Button variant="secondary" size="sm" className="h-10" icon={<Archive className="size-4" />} onClick={() => { setStatus(selected, 'ARCHIVED'); if (filter === 'INBOX') open(null) }}>
                        Archive
                      </Button>
                    </>
                  )}
                  <Button variant="quiet" size="sm" className="ml-auto h-10 text-error!" icon={<Trash2 className="size-4" />} onClick={() => setToDelete(selected)}>
                    Delete
                  </Button>
                </footer>
              </article>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center text-small text-ink-muted">Select a message to read it.</div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this message?"
        description={<>The message from <strong className="text-ink">{toDelete?.name}</strong> will be permanently deleted. Archive it instead to keep a record.</>}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
