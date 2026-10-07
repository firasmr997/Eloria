import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { AdminPageHeader, AppointmentBadge, MessageBadge } from '@/components/admin/AdminUi'
import { RankedBars, RequestsChart } from '@/components/admin/Charts'
import { ButtonLink } from '@/components/ui/Button'
import { ErrorState, Skeleton } from '@/components/ui/Feedback'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@/hooks/useQuery'
import { dashboardService } from '@/services/requestService'
import { APPOINTMENT_STATUSES } from '@/types/models'
import { formatDate, timeAgo } from '@/utils/format'

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }).format(new Date()))
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, error, isLoading, refetch } = useQuery('dashboard', (signal) => dashboardService.get(signal), { staleTime: 15_000 })

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const stats = data
    ? [
        { label: 'Pending appointments', value: data.pendingAppointments, to: '/admin/appointments?status=PENDING', emphasis: data.pendingAppointments > 0 },
        { label: 'Unread messages', value: data.unreadMessages, to: '/admin/messages', emphasis: data.unreadMessages > 0 },
        { label: 'Treatments', value: data.totalTreatments, detail: `${data.availableTreatments} available`, to: '/admin/treatments' },
        { label: 'Featured treatments', value: data.featuredTreatments, to: '/admin/treatments?featured=true' },
        { label: 'Gallery images', value: data.galleryImages, to: '/admin/gallery' },
        { label: 'Team members', value: data.teamMembers, detail: `${data.results} results published`, to: '/admin/team' },
      ]
    : []

  return (
    <div>
      <AdminPageHeader
        title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}`}
        description="Today’s requests, the inbox and the state of the website at a glance."
        actions={
          <ButtonLink to="/admin/treatments/new" size="sm" className="h-10" arrow>
            New treatment
          </ButtonLink>
        }
      />

      <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xs border border-line bg-line lg:grid-cols-3 xl:grid-cols-6">
        {isLoading || !data
          ? Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="bg-porcelain p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-4 h-9 w-12" />
              </li>
            ))
          : stats.map((s) => (
              <li key={s.label} className="bg-porcelain">
                <Link to={s.to} className="group flex h-full flex-col p-5 transition-colors hover:bg-ivory">
                  <span className="flex items-center justify-between text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-muted uppercase">
                    {s.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </span>
                  <span className={`mt-3 font-display text-[2.5rem] leading-none tabular ${s.emphasis ? 'text-champagne-deep' : 'text-ink'}`}>{s.value}</span>
                  {s.detail && <span className="mt-2 text-[0.75rem] text-ink-muted">{s.detail}</span>}
                </Link>
              </li>
            ))}
      </ul>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-xs border border-line bg-porcelain p-6 xl:col-span-2" aria-label="Requests trend">
          {data ? <RequestsChart data={data.requestsLast30Days} /> : <Skeleton className="h-64 w-full" />}
        </section>
        <section className="grid gap-8 rounded-xs border border-line bg-porcelain p-6" aria-label="Breakdown">
          {data ? (
            <>
              <RankedBars title="Requests by status" rows={APPOINTMENT_STATUSES.map((s) => ({ label: s.charAt(0) + s.slice(1).toLowerCase(), value: data.appointmentsByStatus[s] ?? 0 }))} />
              <RankedBars title="Most requested" rows={data.mostRequestedTreatments.map((t) => ({ label: t.name, value: t.count }))} empty="No requests yet." />
            </>
          ) : (
            <Skeleton className="h-64 w-full" />
          )}
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <section className="rounded-xs border border-line bg-porcelain xl:col-span-3" aria-labelledby="recent-appointments">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 id="recent-appointments" className="font-display text-xl text-ink">
              Recent appointment requests
            </h2>
            <Link to="/admin/appointments" className="link-underline text-small text-ink-muted hover:text-ink">
              View all
            </Link>
          </div>
          {!data ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data.recentAppointments.length === 0 ? (
            <p className="p-6 text-small text-ink-muted">No appointments yet. Requests from the website appear here.</p>
          ) : (
            <ul>
              {data.recentAppointments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-3.5 last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-small font-semibold text-ink">{a.name}</p>
                    <p className="truncate text-[0.8125rem] text-ink-muted">
                      {a.treatmentName ?? 'First consultation'} · <span className="tabular">{formatDate(a.preferredDate, { day: 'numeric', month: 'short' })} {a.preferredTime}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden text-[0.75rem] text-ink-muted sm:inline">{timeAgo(a.createdAt)}</span>
                    <AppointmentBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xs border border-line bg-porcelain xl:col-span-2" aria-labelledby="recent-messages">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 id="recent-messages" className="font-display text-xl text-ink">
              Latest messages
            </h2>
            <Link to="/admin/messages" className="link-underline text-small text-ink-muted hover:text-ink">
              Inbox
            </Link>
          </div>
          {!data ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data.recentMessages.length === 0 ? (
            <p className="p-6 text-small text-ink-muted">No messages yet.</p>
          ) : (
            <ul>
              {data.recentMessages.map((m) => (
                <li key={m.id}>
                  <Link to={`/admin/messages?open=${m.id}`} className="block border-b border-line px-6 py-3.5 transition-colors last:border-b-0 hover:bg-ivory">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-small font-semibold text-ink">{m.name}</p>
                      <MessageBadge status={m.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-[0.8125rem] text-ink-muted">{m.message}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
