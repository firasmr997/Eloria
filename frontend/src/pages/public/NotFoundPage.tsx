import { Monogram } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function NotFoundPage() {
  useDocumentMeta({ title: 'Page not found', noindex: true })
  return (
    <section className="flex min-h-[90svh] items-center bg-ivory pt-32 pb-20">
      <div className="shell flex flex-col items-center text-center">
        <Monogram className="size-24" />
        <h1 className="mt-12 text-h1 text-ink">This page does not exist.</h1>
        <p className="mt-6 max-w-md text-lead text-ink-muted">The link may be out of date, or the page may have moved.</p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/" arrow>
            Back to home
          </ButtonLink>
          <ButtonLink to="/treatments" variant="secondary">
            Browse treatments
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
