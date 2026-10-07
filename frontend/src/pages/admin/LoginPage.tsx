import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '@/api/client'
import { Logo, Monogram } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { SmartImage } from '@/components/ui/SmartImage'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { media } from '@/data/media'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { patterns } from '@/utils/validation'

export default function LoginPage() {
  useDocumentMeta({ title: 'Staff sign-in', noindex: true })
  const { login, isAuthenticated, sessionExpired } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={from} replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = {
      email: !email.trim() ? 'Email is required' : !patterns.email.test(email.trim()) ? 'Enter a valid email address' : undefined,
      password: !password ? 'Password is required' : undefined,
    }
    setErrors(found)
    if (found.email || found.password) return
    setSubmitting(true)
    try {
      const user = await login(email.trim(), password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`)
      navigate(from, { replace: true })
    } catch (error) {
      setErrors({ form: error instanceof ApiError ? error.message : 'Sign-in failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh bg-ivory lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <SmartImage src={media.login.src} alt="" frameClassName="absolute inset-0" sizes="50vw" priority />
        <div className="absolute inset-0 bg-espresso/55" aria-hidden />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-cream">
          <Logo tone="light" withDescriptor className="w-44" />
          <p className="max-w-sm font-display text-3xl leading-snug">The back office of the center: treatments, gallery, team and every request.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Monogram className="size-16 lg:hidden" />
          <h1 className="mt-8 font-display text-[2.5rem] leading-tight text-ink lg:mt-0">Staff sign-in</h1>
          <p className="mt-2 text-small text-ink-muted">Sign in with your Éloria staff account.</p>

          {sessionExpired && !errors.form && (
            <p className="mt-6 border-l border-champagne py-1 pl-4 text-small text-ink" role="status">
              Your session has expired. Please sign in again.
            </p>
          )}
          {errors.form && (
            <p className="mt-6 border-l border-error py-1 pl-4 text-small font-medium text-error" role="alert">
              {errors.form}
            </p>
          )}

          <form onSubmit={submit} noValidate className="mt-8 space-y-6">
            <Input label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
            <div className="relative">
              <Input
                label="Password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute top-[2.15rem] right-2 p-2 text-taupe hover:text-ink"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button type="submit" size="lg" loading={submitting} arrow className="w-full">
              Sign in
            </Button>
          </form>

          {import.meta.env.DEV && (
            <p className="mt-8 rounded-xs border border-dashed border-line-strong p-4 text-small text-ink-muted">
              Development account: <span className="text-ink">admin@eloria.local</span> / <span className="text-ink">Admin123!</span>. Not available in production builds.
            </p>
          )}
          <Link to="/" className="link-underline mt-10 inline-block text-small text-ink-muted">
            Back to the website
          </Link>
        </div>
      </div>
    </main>
  )
}
