import { useSearchParams } from 'react-router'
import { Reveal } from '@/animations/Reveal'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSettings } from '@/context/SettingsContext'
import { disclaimer, journey } from '@/data/content'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function BookPage() {
  const [params] = useSearchParams()
  const { settings } = useSettings()
  useDocumentMeta({
    title: 'Book a consultation',
    description: 'Request a consultation or treatment at ÉLORIA AESTHETIC in Paris. Our team confirms every appointment personally.',
  })

  return (
    <>
      <PageHeader
        title="Request a consultation"
        intro="Tell us when suits you and what you are interested in. This is a request: a member of our team will call or email you to confirm the time with the right specialist."
      />
      <section className="bg-ivory pb-28" aria-label="Booking form">
        <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="border border-line bg-porcelain p-6 sm:p-10">
                <AppointmentForm initialTreatment={params.get('treatment')} initialDate={params.get('date')} />
              </div>
            </Reveal>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9" aria-label="What happens next">
            <Reveal delay={0.15}>
              <div className="lg:sticky lg:top-28">
                <h2 className="text-h4 text-ink">What happens next</h2>
                <ol className="mt-6 border-t border-espresso">
                  {journey.slice(0, 3).map((step, i) => (
                    <li key={step.title} className="flex gap-5 border-b border-line py-5">
                      <span className="font-display text-lg text-champagne-deep tabular">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-ink">{step.title}</p>
                        <p className="mt-1 text-small text-ink-muted">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                {settings.phone && (
                  <p className="mt-8 text-small text-ink-muted">
                    Prefer to talk?{' '}
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="link-underline tabular text-ink">
                      {settings.phone}
                    </a>
                  </p>
                )}
                <p className="mt-6 text-small text-ink-muted">{disclaimer.short}</p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  )
}
