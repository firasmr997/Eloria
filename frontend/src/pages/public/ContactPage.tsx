import { Mail, MapPin, Phone } from 'lucide-react'
import { Reveal } from '@/animations/Reveal'
import { FacebookIcon, InstagramIcon, PinterestIcon } from '@/components/brand/SocialIcons'
import { ContactForm } from '@/components/forms/ContactForm'
import { MapPlaceholder } from '@/components/home/LocationSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { ButtonLink } from '@/components/ui/Button'
import { fullAddress, useSettings } from '@/context/SettingsContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function ContactPage() {
  const { settings } = useSettings()
  const address = fullAddress(settings)
  useDocumentMeta({ title: 'Contact', description: `Contact ÉLORIA AESTHETIC in Paris: address, phone, email, opening hours and a contact form.` })

  const socials = [
    { href: settings.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { href: settings.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.pinterestUrl, label: 'Pinterest', Icon: PinterestIcon },
  ].filter((s) => s.href)

  return (
    <>
      <PageHeader
        title="We’d be glad to hear from you."
        intro="A question about a treatment, a price or a first visit: write to us, or call during opening hours. To request an appointment, use the booking form."
        aside={
          <ButtonLink to="/book" arrow>
            Book a consultation
          </ButtonLink>
        }
      />

      <section className="bg-ivory pb-28" aria-label="Contact details and form">
        <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <ul className="border-t border-espresso">
                {address && (
                  <li className="flex gap-5 border-b border-line py-6">
                    <MapPin className="mt-1 size-5 shrink-0 text-champagne-deep" strokeWidth={1.25} aria-hidden />
                    <div>
                      <p className="text-caption text-ink-muted">Address</p>
                      <address className="mt-1 not-italic text-ink">{address}</address>
                    </div>
                  </li>
                )}
                {settings.phone && (
                  <li className="flex gap-5 border-b border-line py-6">
                    <Phone className="mt-1 size-5 shrink-0 text-champagne-deep" strokeWidth={1.25} aria-hidden />
                    <div>
                      <p className="text-caption text-ink-muted">Phone</p>
                      <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="link-underline mt-1 inline-block tabular text-ink">
                        {settings.phone}
                      </a>
                    </div>
                  </li>
                )}
                {settings.email && (
                  <li className="flex gap-5 border-b border-line py-6">
                    <Mail className="mt-1 size-5 shrink-0 text-champagne-deep" strokeWidth={1.25} aria-hidden />
                    <div>
                      <p className="text-caption text-ink-muted">Email</p>
                      <a href={`mailto:${settings.email}`} className="link-underline mt-1 inline-block break-all text-ink">
                        {settings.email}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
              <h2 className="mt-12 text-h4 text-ink">Opening hours</h2>
              <dl className="mt-4">
                {settings.openingHours.map((h) => (
                  <div key={h.label} className="flex justify-between gap-6 border-b border-line py-3">
                    <dt className="text-ink">{h.label}</dt>
                    <dd className="text-ink-muted tabular">{h.hours}</dd>
                  </div>
                ))}
              </dl>
              {socials.length > 0 && (
                <ul className="mt-10 flex gap-2">
                  {socials.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${label} (opens in a new tab)`}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-espresso"
                      >
                        <Icon className="size-[1.125rem]" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.1}>
              <div className="border border-line bg-porcelain p-6 sm:p-10">
                <h2 className="text-h3 text-ink">Send us a message</h2>
                <p className="mt-2 mb-10 text-small text-ink-muted">We usually reply within one working day. Please do not include medical records in this form.</p>
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
        <div className="shell mt-24">
          <Reveal>
            <MapPlaceholder address={address} href={settings.mapUrl} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
