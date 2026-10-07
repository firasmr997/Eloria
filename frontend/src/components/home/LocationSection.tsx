import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/animations/Reveal'
import { RevealLines } from '@/animations/RevealLines'
import { fullAddress, useSettings } from '@/context/SettingsContext'
import { cn } from '@/utils/format'

/** Address, hours and a drawn plan of the neighbourhood standing in for an interactive map. */
export function LocationSection({ className }: { className?: string }) {
  const { settings } = useSettings()
  const address = fullAddress(settings)
  return (
    <section className={cn('section-y bg-ivory', className)} aria-labelledby="location-title">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <RevealLines as="h2" text="Visit us in Paris" className="text-h2 text-ink" />
          <Reveal delay={0.1}>
            <address className="mt-10 text-lead not-italic text-ink">
              {settings.addressLine && <span className="block">{settings.addressLine}</span>}
              <span className="block">{[settings.postalCode, settings.city].filter(Boolean).join(' ')}</span>
            </address>
            <p className="mt-3 text-small text-ink-muted">Metro Franklin D. Roosevelt or George V, a five-minute walk.</p>
            <dl className="mt-10 border-t border-espresso">
              {settings.openingHours.map((h) => (
                <div key={h.label} className="flex justify-between gap-6 border-b border-line py-4">
                  <dt className="text-ink">{h.label}</dt>
                  <dd className="text-ink-muted tabular">{h.hours}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="link-underline tabular text-ink">
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="link-underline text-ink">
                  {settings.email}
                </a>
              )}
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7">
          <MapPlaceholder address={address} href={settings.mapUrl} />
        </Reveal>
      </div>
    </section>
  )
}

/**
 * A drawn plan (not a real map) of a Haussmann grid with the center marked. Replace it with an embedded
 * map provider once one is chosen; `href` opens the real location in a new tab.
 */
export function MapPlaceholder({ address, href }: { address: string; href: string | null }) {
  return (
    <figure className="stone relative aspect-[4/3] overflow-hidden border border-line">
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden>
        <g stroke="var(--color-line-strong)" strokeWidth="1" fill="none">
          <path d="M-20 70 L420 20" />
          <path d="M-20 160 L420 120" strokeWidth="5" stroke="var(--color-porcelain)" />
          <path d="M-20 160 L420 120" />
          <path d="M-20 250 L420 215" />
          <path d="M60 -20 L110 320" />
          <path d="M170 -20 L205 320" strokeWidth="5" stroke="var(--color-porcelain)" />
          <path d="M170 -20 L205 320" />
          <path d="M300 -20 L310 320" />
          <path d="M-20 300 L250 -20" strokeDasharray="2 5" />
          <circle cx="330" cy="250" r="34" />
        </g>
        <g fill="var(--color-taupe)" fontFamily="var(--font-sans)" fontSize="8" letterSpacing="1.5">
          <text x="18" y="150" transform="rotate(-5 18 150)">AVENUE DES CHAMPS-ÉLYSÉES</text>
          <text x="214" y="300" transform="rotate(-84 214 300)">AVENUE MONTAIGNE</text>
        </g>
        <circle cx="236" cy="152" r="22" fill="var(--color-champagne)" opacity="0.18" />
        <circle cx="236" cy="152" r="7" fill="var(--color-espresso)" />
        <circle cx="236" cy="152" r="12" fill="none" stroke="var(--color-champagne)" />
      </svg>
      <figcaption className="absolute right-4 bottom-4 left-4 flex flex-col items-start gap-3 bg-porcelain/95 p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-small text-ink">
          <span className="font-display text-base">ÉLORIA</span> · {address || 'Paris 8e'}
        </span>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-button text-ink hover:text-champagne-deep">
            Open map
            <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </figcaption>
    </figure>
  )
}
