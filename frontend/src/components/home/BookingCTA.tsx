import { Reveal } from '@/animations/Reveal'
import { RevealLines } from '@/animations/RevealLines'
import { useParallax } from '@/animations/useParallax'
import { ButtonLink } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { useSettings } from '@/context/SettingsContext'
import { media } from '@/data/media'

/** The closing call to action: a full-bleed photograph under an espresso veil. */
export function BookingCTA() {
  const parallax = useParallax<HTMLDivElement>(16)
  const { settings } = useSettings()
  return (
    <section className="relative isolate overflow-hidden bg-espresso text-cream" aria-labelledby="cta-title">
      <div ref={parallax} className="absolute inset-0 -z-10">
        <SmartImage src={media.bookingCta.src} alt="" sizes="100vw" frameClassName="size-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-espresso/72" aria-hidden />
      <div className="shell flex min-h-[80svh] flex-col items-center justify-center py-28 text-center">
        <RevealLines as="h2" text="Begin with a conversation." className="text-h1 max-w-3xl text-cream" />
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-xl text-lead text-cream-muted">
            A first consultation is the time to ask every question. We will tell you what we would recommend, and what we would not.
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink to="/book" variant="light" size="lg" arrow>
            Book a consultation
          </ButtonLink>
          {settings.phone && (
            <ButtonLink href={`tel:${settings.phone.replace(/\s/g, '')}`} variant="outline-light" size="lg">
              Call {settings.phone}
            </ButtonLink>
          )}
        </Reveal>
      </div>
    </section>
  )
}
