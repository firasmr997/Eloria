import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/context/ToastContext'
import { timeSlots } from '@/data/content'
import { useQuery } from '@/hooks/useQuery'
import { appointmentService } from '@/services/requestService'
import { treatmentService } from '@/services/treatmentService'
import type { AppointmentReceipt } from '@/types/models'
import { formatDate, todayInParis } from '@/utils/format'
import { hasErrors, patterns, required, type Errors } from '@/utils/validation'

interface FormState {
  name: string
  email: string
  phone: string
  treatmentId: string
  preferredDate: string
  preferredTime: string
  message: string
  website: string
  consent: boolean
}

interface AppointmentFormProps {
  /** Treatment preselected from the URL (?treatment=slug) or the hero bar. */
  initialTreatment?: string | null
  initialDate?: string | null
}

function validate(form: FormState): Errors<FormState> {
  const errors: Errors<FormState> = {
    name: required(form.name, 'Your name') ?? (form.name.trim().length < 2 ? 'Please enter your full name' : undefined),
    email: required(form.email, 'Email') ?? (patterns.email.test(form.email.trim()) ? undefined : 'Enter a valid email address'),
    phone: required(form.phone, 'Phone') ?? (patterns.phone.test(form.phone.trim()) ? undefined : 'Enter a valid phone number, e.g. +33 6 12 34 56 78'),
    preferredDate: required(form.preferredDate, 'Preferred date'),
    preferredTime: required(form.preferredTime, 'Preferred time'),
    consent: form.consent ? undefined : 'Please confirm we may use these details to contact you',
  }
  if (!errors.preferredDate && form.preferredDate < todayInParis()) errors.preferredDate = 'Please choose a date from today onwards'
  return errors
}

/** The consultation request: stored as PENDING; the team confirms by phone or email. */
export function AppointmentForm({ initialTreatment, initialDate }: AppointmentFormProps) {
  const toast = useToast()
  const { data: options, isLoading: optionsLoading } = useQuery('treatments:options', (signal) => treatmentService.options(signal), { staleTime: 5 * 60_000 })
  const initialId = useMemo(() => {
    if (!initialTreatment || !options) return ''
    const match = options.find((o) => o.slug === initialTreatment || String(o.id) === initialTreatment)
    return match ? String(match.id) : ''
  }, [initialTreatment, options])

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    treatmentId: '',
    preferredDate: initialDate && initialDate >= todayInParis() ? initialDate : '',
    preferredTime: '',
    message: '',
    website: '',
    consent: false,
  })
  const [touchedTreatment, setTouchedTreatment] = useState(false)
  const [errors, setErrors] = useState<Errors<FormState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<AppointmentReceipt | null>(null)

  const treatmentId = touchedTreatment ? form.treatmentId : form.treatmentId || initialId
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const groups = useMemo(() => {
    const map = new Map<string, typeof options>()
    options?.forEach((o) => map.set(o.categoryName, [...(map.get(o.categoryName) ?? []), o]))
    return [...map.entries()]
  }, [options])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (hasErrors(found)) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setSubmitting(true)
    try {
      const result = await appointmentService.request({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        treatmentId: treatmentId ? Number(treatmentId) : null,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        message: form.message.trim() || undefined,
        website: form.website,
      })
      setReceipt(result)
      toast.success('Request received', 'We will contact you shortly to confirm your appointment.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      if (apiError?.fieldErrors.length) setErrors(apiError.byField)
      toast.error('Your request could not be sent', apiError?.message ?? 'Please try again or call us.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {receipt ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-line bg-porcelain px-6 py-12 text-center sm:px-12"
          role="status"
        >
          <CalendarCheck className="mx-auto size-10 text-champagne-deep" strokeWidth={1} aria-hidden />
          <h2 className="mt-6 text-h3">Thank you, {receipt.name.split(' ')[0]}.</h2>
          <p className="mx-auto mt-4 max-w-md text-ink-muted">
            Your request for {receipt.treatmentName ? <strong className="font-semibold text-ink">{receipt.treatmentName}</strong> : 'a consultation'} on{' '}
            <span className="tabular">{formatDate(receipt.preferredDate, { weekday: 'long', day: 'numeric', month: 'long' })}</span> at{' '}
            <span className="tabular">{receipt.preferredTime}</span> has been received. A member of our team will call or email you to confirm, usually within one working day.
          </p>
          <p className="mx-auto mt-6 max-w-md text-small text-ink-muted">This is a request, not a confirmed booking.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <Link to="/treatments" className="text-button border-b border-current pb-1.5">
              Explore treatments
            </Link>
            <Link to="/" className="text-button border-b border-current pb-1.5">
              Back to home
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="grid gap-x-6 gap-y-7 sm:grid-cols-2" aria-label="Request a consultation">
          <Input label="Full name" required autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} containerClassName="sm:col-span-2" />
          <Input label="Email" type="email" required autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
          <Input label="Phone" type="tel" required autoComplete="tel" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
          <Select
            label="Treatment"
            value={treatmentId}
            onChange={(e) => {
              setTouchedTreatment(true)
              set('treatmentId', e.target.value)
            }}
            error={errors.treatmentId}
            hint={optionsLoading ? 'Loading treatments…' : 'Not sure yet? Leave “First consultation” selected.'}
            containerClassName="sm:col-span-2"
          >
            <option value="">First consultation (no specific treatment)</option>
            {groups.map(([category, list]) => (
              <optgroup key={category} label={category}>
                {list?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          <Input
            label="Preferred date"
            type="date"
            required
            min={todayInParis()}
            max={todayInParis(365)}
            value={form.preferredDate}
            onChange={(e) => set('preferredDate', e.target.value)}
            error={errors.preferredDate}
          />
          <Select label="Preferred time" required value={form.preferredTime} onChange={(e) => set('preferredTime', e.target.value)} error={errors.preferredTime}>
            <option value="">Choose a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
          <Textarea
            label="Message"
            value={form.message}
            maxLength={2000}
            onChange={(e) => set('message', e.target.value)}
            hint="Anything we should know: your concerns, recent treatments, questions."
            containerClassName="sm:col-span-2"
          />
          {/* Honeypot: hidden from people and assistive technology. */}
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 text-small text-ink-muted">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => set('consent', e.target.checked)}
                aria-invalid={!!errors.consent || undefined}
                className="mt-0.5 size-4 shrink-0 accent-[var(--color-espresso)]"
              />
              <span>
                I agree that ÉLORIA AESTHETIC may use these details to contact me about this request. See our{' '}
                <Link to="/privacy" className="underline">
                  privacy notice
                </Link>
                .
              </span>
            </label>
            {errors.consent && (
              <p className="mt-2 text-small font-medium text-error" role="alert">
                {errors.consent}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-small text-ink-muted">This sends a request. We confirm every appointment personally by phone or email.</p>
            <Button type="submit" size="lg" arrow loading={submitting}>
              Send request
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
