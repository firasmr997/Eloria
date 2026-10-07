import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/format'

type BadgeTone = 'neutral' | 'champagne' | 'rose' | 'success' | 'warning' | 'error' | 'dark'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-travertine text-ink',
  champagne: 'bg-champagne-light/50 text-champagne-deep',
  rose: 'bg-rose-tint text-rose-deep',
  success: 'bg-success-tint text-success',
  warning: 'bg-warning-tint text-warning',
  error: 'bg-error-tint text-error',
  dark: 'bg-espresso text-cream',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase', badgeTones[tone], className)}>
      {children}
    </span>
  )
}

/** Shimmering placeholder with the exact footprint of the content it stands in for. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-xs bg-travertine/80', className)} />
}

interface EmptyStateProps {
  title: string
  body?: ReactNode
  action?: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}

/** Calm, composed empty state: a hairline monogram ring, a sentence and the next step. */
export function EmptyState({ title, body, action, tone = 'light', className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-16 text-center', className)} role="status">
      <svg viewBox="0 0 64 64" className="mb-6 size-14" aria-hidden>
        <circle cx="32" cy="32" r="30" fill="none" stroke="var(--color-champagne)" strokeWidth="1" />
        <circle cx="32" cy="32" r="22" fill="none" stroke="var(--color-champagne)" strokeWidth="0.6" strokeDasharray="2 4" />
      </svg>
      <p className={cn('text-h4', tone === 'dark' ? 'text-cream' : 'text-ink')}>{title}</p>
      {body && <p className={cn('mt-2 max-w-md text-small', tone === 'dark' ? 'text-cream-muted' : 'text-ink-muted')}>{body}</p>}
      {action && <div className="mt-7">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      title="This content could not be loaded."
      body={message}
      action={
        onRetry && (
          <button type="button" onClick={onRetry} className="text-button border-b border-current pb-1.5 text-espresso hover:text-champagne-deep">
            Try again
          </button>
        )
      }
    />
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPage: (page: number) => void
  onSize?: (size: number) => void
  sizes?: number[]
  label?: string
}

function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages = new Set([0, total - 1, current - 1, current, current + 1].filter((p) => p >= 0 && p < total))
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap')
    result.push(p)
  })
  return result
}

/** Previous / numbered pages / next, plus an optional items-per-page select. */
export function Pagination({ page, totalPages, totalElements, size, onPage, onSize, sizes = [12, 24, 48], label = 'items' }: PaginationProps) {
  if (totalElements === 0) return null
  const from = page * size + 1
  const to = Math.min(totalElements, (page + 1) * size)
  const button = 'inline-flex h-9 min-w-9 items-center justify-center rounded-xs px-2 text-small tabular transition-colors'
  return (
    <nav className="flex flex-col items-center justify-between gap-4 sm:flex-row" aria-label="Pagination">
      <p className="text-small text-ink-muted tabular">
        {from}–{to} of {totalElements} {label}
      </p>
      <div className="flex items-center gap-3">
        {onSize && (
          <label className="flex items-center gap-2 text-small text-ink-muted">
            Per page
            <select
              value={size}
              onChange={(e) => onSize(Number(e.target.value))}
              className="h-9 rounded-xs border border-line-strong bg-porcelain px-2 text-ink"
            >
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button type="button" className={cn(button, 'hover:bg-ink/5 disabled:opacity-30')} onClick={() => onPage(page - 1)} disabled={page === 0} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </button>
            {pageList(page, totalPages).map((p, i) =>
              p === 'gap' ? (
                <span key={`gap-${i}`} className="px-1 text-taupe">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={cn(button, p === page ? 'bg-espresso text-ivory' : 'text-ink hover:bg-ink/5')}
                >
                  {p + 1}
                </button>
              ),
            )}
            <button type="button" className={cn(button, 'hover:bg-ink/5 disabled:opacity-30')} onClick={() => onPage(page + 1)} disabled={page >= totalPages - 1} aria-label="Next page">
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
