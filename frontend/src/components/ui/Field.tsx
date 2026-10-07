import { ChevronDown } from 'lucide-react'
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/utils/format'

interface FieldShellProps {
  label: string
  error?: string
  hint?: ReactNode
  required?: boolean
  /** Visual surface the field sits on. */
  tone?: 'light' | 'dark'
  className?: string
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}

/** Label, control, hint and error with correct ARIA wiring. */
export function FieldShell({ label, error, hint, required, tone = 'light', className, children }: FieldShellProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className={cn('text-caption', tone === 'dark' ? 'text-cream-muted' : 'text-ink-muted')}>
        {label}
        {required && (
          <span className="text-champagne-deep" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error && (
        <p id={hintId} className={cn('text-small', tone === 'dark' ? 'text-cream-muted' : 'text-ink-muted')}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={cn('text-small font-medium', tone === 'dark' ? 'text-rose' : 'text-error')} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const control = (tone: 'light' | 'dark', invalid: boolean) =>
  cn(
    'w-full rounded-xs border bg-transparent px-4 text-base transition-[border-color,box-shadow,background-color] duration-300',
    'placeholder:text-taupe focus:outline-none',
    tone === 'dark'
      ? 'border-line-dark text-cream placeholder:text-cream-muted/70 focus:border-champagne focus:bg-espresso-raised'
      : 'border-line-strong bg-porcelain/60 text-ink focus:border-champagne-deep focus:bg-porcelain focus:shadow-[0_0_0_3px_rgb(184_151_106/0.18)]',
    invalid && (tone === 'dark' ? 'border-rose' : 'border-error'),
  )

type BaseProps = { label: string; error?: string; hint?: ReactNode; tone?: 'light' | 'dark'; containerClassName?: string }

export const Input = forwardRef<HTMLInputElement, BaseProps & InputHTMLAttributes<HTMLInputElement>>(function Input(
  { label, error, hint, tone = 'light', containerClassName, className, required, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} tone={tone} className={containerClassName}>
      {({ id, describedBy, invalid }) => (
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(control(tone, invalid), 'h-12', className)}
          {...rest}
        />
      )}
    </FieldShell>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ label, error, hint, tone = 'light', containerClassName, className, required, rows = 5, ...rest }, ref) {
    return (
      <FieldShell label={label} error={error} hint={hint} required={required} tone={tone} className={containerClassName}>
        {({ id, describedBy, invalid }) => (
          <textarea
            ref={ref}
            id={id}
            rows={rows}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(control(tone, invalid), 'resize-y py-3 leading-relaxed', className)}
            {...rest}
          />
        )}
      </FieldShell>
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, BaseProps & SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { label, error, hint, tone = 'light', containerClassName, className, required, children, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} tone={tone} className={containerClassName}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            ref={ref}
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(control(tone, invalid), 'h-12 cursor-pointer appearance-none pr-11', className)}
            {...rest}
          >
            {children}
          </select>
          <ChevronDown
            className={cn('pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2', tone === 'dark' ? 'text-cream-muted' : 'text-taupe')}
            aria-hidden
          />
        </div>
      )}
    </FieldShell>
  )
})

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <label htmlFor={id} className="text-small font-semibold text-ink">
          {label}
        </label>
        {description && <p className="text-small text-ink-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300 disabled:opacity-50',
          checked ? 'border-espresso bg-espresso' : 'border-line-strong bg-travertine',
        )}
      >
        <span
          className={cn(
            'inline-block size-4 rounded-full shadow-sm transition-transform duration-300 ease-[var(--ease-out-expo)]',
            checked ? 'translate-x-6 bg-champagne-light' : 'translate-x-1 bg-porcelain',
          )}
        />
      </button>
    </div>
  )
}
