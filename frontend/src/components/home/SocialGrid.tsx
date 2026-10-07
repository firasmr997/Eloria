import { Reveal } from '@/animations/Reveal'
import { InstagramIcon } from '@/components/brand/SocialIcons'
import { SmartImage } from '@/components/ui/SmartImage'
import { useSettings } from '@/context/SettingsContext'
import { useQuery } from '@/hooks/useQuery'
import { galleryService } from '@/services/contentService'

/** A social-feed inspired strip of square frames, linking to the center's Instagram. */
export function SocialGrid() {
  const { settings } = useSettings()
  const { data } = useQuery('gallery:social', (signal) => galleryService.list({ collection: 'EDITORIAL', size: 12 }, signal))
  const images = (data?.content ?? []).filter((_, i) => i % 2 === 0).slice(0, 6)
  if (images.length < 6) return null
  const href = settings.instagramUrl ?? undefined

  return (
    <section className="bg-porcelain py-20 lg:py-28" aria-labelledby="social-title">
      <div className="shell">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 id="social-title" className="text-h3 text-ink">
              Notes from the studio
            </h2>
            <p className="mt-3 text-small text-ink-muted">Rituals, textures and quiet moments, shared on Instagram.</p>
          </div>
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-button text-ink">
              <InstagramIcon className="size-5" />
              <span className="link-underline">@eloria.paris</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </Reveal>
        <ul className="mt-12 grid grid-cols-3 gap-1.5 sm:gap-2 lg:grid-cols-6">
          {images.map((image) => (
            <li key={image.id}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden"
                aria-label={`${image.title} on Instagram (opens in a new tab)`}
              >
                <SmartImage
                  src={image.imageUrl}
                  alt=""
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  frameClassName="aspect-square"
                  className="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-espresso/45 text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <InstagramIcon className="size-6" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
