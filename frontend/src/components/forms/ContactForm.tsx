import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/context/ToastContext'
import { messageService } from '@/services/requestService'
import { hasErrors, patterns, required, type Errors } from '@/utils/validation'

interface FormState {
  name: string
  email: string
  phone: string
  message: string
  website: string
}

const EMPTY: FormState = { name: '', email: '', phone: '', message: '', website: '' }

function validate(form: FormState): Errors<FormState> {
  return {
    name: required(form.name, 'Your name') ?? (form.name.trim().length < 2 ? 'Please enter your full name' : undefined),
    email: required(form.email, 'Email') ?? (patterns.email.test(form.email.trim()) ? undefined : 'Enter a valid email address'),
    phone: form.phone.trim() && !patterns.phone.test(form.phone.trim()) ? 'Enter a valid phone number' : undefined,
    message:
      required(form.message, 'Message') ?? (form.message.trim().length < 10 ? 'Please write at least a sentence (10 characters)' : undefined),
  }
}

export function ContactForm({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const toast = useToast()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors<FormState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (hasErrors(found)) return
    setSubmitting(true)
    try {
      await messageService.send({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        message: form.message.trim(),
        website: form.website,
      })
      toast.success('Message sent', 'Thank you. We usually reply within one working day.')
      setForm(EMPTY)
      setSent(true)
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      if (apiError?.fieldErrors.length) setErrors(apiError.byField)
      toast.error('Your message could not be sent', apiError?.message ?? 'Please try again or call us.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-x-6 gap-y-7 sm:grid-cols-2" aria-label="Contact form">
      {sent && (
        <p className="border-l border-champagne pl-4 text-small sm:col-span-2" role="status">
          Thank you, your message has been sent. You can write again below if you need to.
        </p>
      )}
      <Input tone={tone} label="Full name" required autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} containerClassName="sm:col-span-2" />
      <Input tone={tone} label="Email" type="email" required autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
      <Input tone={tone} label="Phone" type="tel" autoComplete="tel" hint="Optional" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
      <Textarea
        tone={tone}
        label="Message"
        required
        maxLength={4000}
        rows={6}
        value={form.message}
        onChange={(e) => set('message', e.target.value)}
        error={errors.message}
        containerClassName="sm:col-span-2"
      />
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant={tone === 'dark' ? 'light' : 'primary'} size="lg" arrow loading={submitting}>
          Send message
        </Button>
      </div>
    </form>
  )
}
