import { Search, X } from 'lucide-react'
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { Badge, Skeleton } from '@/components/ui/Feedback'
import type { AppointmentStatus, MessageStatus } from '@/types/models'
import { cn } from '@/utils/format'

export function AdminPageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[2.25rem] leading-tight text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-small text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-3 py-6 lg:flex-row lg:items-center', className)}>{children}</div>
}

export function SearchField({ value, onChange, placeholder, label = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string }) {
  return (
    <div className="relative w-full lg:max-w-xs">
      <label className="sr-only" htmlFor={`search-${label}`}>
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-taupe" aria-hidden />
      <input
        id={`search-${label}`}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xs border border-line-strong bg-porcelain pr-9 pl-9 text-small text-ink placeholder:text-taupe focus:border-champagne-deep focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-taupe hover:text-ink" aria-label="Clear search">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-small text-ink-muted">
      <span className="shrink-0">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 cursor-pointer rounded-xs border border-line-strong bg-porcelain px-3 text-ink focus:border-champagne-deep focus:outline-none"
      >
        {children}
      </select>
    </label>
  )
}

/** Segmented status filter (appointments, messages). */
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1" role="group" aria-label={label}>
      <div className="inline-flex min-w-max rounded-xs border border-line-strong bg-porcelain p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-[1px] px-3.5 text-small transition-colors',
              value === o.value ? 'bg-espresso text-ivory' : 'text-ink-muted hover:text-ink',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn('tabular text-[0.75rem]', value === o.value ? 'text-champagne-light' : 'text-taupe')}>{o.count}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Table that scrolls horizontally inside its frame on narrow screens rather than overflowing the page. */
export function Table({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="overflow-x-auto rounded-xs border border-line bg-porcelain">
      <table className="w-full min-w-[44rem] border-collapse text-left text-small" aria-label={label}>
        {children}
      </table>
    </div>
  )
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn('border-b border-line bg-ivory px-4 py-3 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-muted uppercase', className)} {...rest} />
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('border-b border-line px-4 py-3.5 align-middle text-ink', className)} {...rest} />
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xs border border-line bg-porcelain" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-6 border-b border-line px-4 py-4 last:border-b-0">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className={cn('h-4', c === 0 ? 'w-1/4' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}

const appointmentTones: Record<AppointmentStatus, 'warning' | 'success' | 'neutral' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'error',
}

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge tone={appointmentTones[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status.toLowerCase()}
    </Badge>
  )
}

export function MessageBadge({ status }: { status: MessageStatus }) {
  const tone = status === 'NEW' ? 'champagne' : status === 'READ' ? 'neutral' : 'dark'
  return <Badge tone={tone}>{status.toLowerCase()}</Badge>
}

/** A titled group of fields in an edit form. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-line py-10 first:pt-2 lg:grid-cols-[16rem_1fr] lg:gap-12">
      <div>
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {description && <p className="mt-2 text-small text-ink-muted">{description}</p>}
      </div>
      <div className="grid gap-6">{children}</div>
    </section>
  )
}

export function IconButton({ label, onClick, children, tone = 'default', disabled }: { label: string; onClick: () => void; children: ReactNode; tone?: 'default' | 'danger'; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-xs transition-colors disabled:opacity-40',
        tone === 'danger' ? 'text-ink-muted hover:bg-error-tint hover:text-error' : 'text-ink-muted hover:bg-ink/5 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
