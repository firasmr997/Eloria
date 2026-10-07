import { useRef, useState } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from '@/animations/gsap'
import { Lightbox } from '@/components/gallery/Lightbox'
import { ButtonLink } from '@/components/ui/Button'
import { ImageCard } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Feedback'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useQuery } from '@/hooks/useQuery'
import { galleryService } from '@/services/contentService'

/** A loose collage: five frames at different sizes drifting at different speeds as the page scrolls. */
const FRAMES = [
  { className: 'col-span-12 sm:col-span-7 aspect-[4/3]', speed: -6 },
  { className: 'col-span-6 sm:col-span-4 sm:col-start-9 aspect-[3/4] sm:mt-24', speed: 10 },
  { className: 'col-span-6 sm:col-span-3 sm:col-start-2 aspect-[4/5] sm:-mt-10', speed: 4 },
  { className: 'col-span-12 sm:col-span-4 aspect-[4/5] sm:mt-16', speed: -8 },
  { className: 'col-span-12 sm:col-span-4 aspect-[3/4] sm:mt-40', speed: 12 },
]

export function GalleryPreview() {
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const { data, isLoading } = useQuery('gallery:featured', (signal) => galleryService.list({ featured: true, size: 5 }, signal))
  const images = data?.content ?? []

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
        gsap.to(el, {
          yPercent: Number(el.dataset.speed),
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: root, dependencies: [images.length] },
  )

  if (!isLoading && images.length === 0) return null
  return (
    <section ref={root} className="section-y overflow-hidden bg-ivory" aria-labelledby="gallery-title">
      <div className="shell">
        <SectionTitle
          title="Inside Éloria"
          intro="Stone, linen and daylight. A place designed to slow you down."
          action={
            <ButtonLink to="/gallery" variant="ghost" arrow>
              View the gallery
            </ButtonLink>
          }
        />
        <ul className="mt-16 grid grid-cols-12 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-10">
          {isLoading
            ? FRAMES.map((f, i) => <Skeleton key={i} className={f.className} />)
            : images.slice(0, FRAMES.length).map((image, i) => (
                <li key={image.id} className={FRAMES[i].className} data-speed={FRAMES[i].speed}>
                  <ImageCard
                    src={image.imageUrl}
                    alt={image.description || image.title}
                    title={image.title}
                    aspect="size-full"
                    className="size-full"
                    sizes="(min-width: 640px) 45vw, 100vw"
                    onClick={() => setOpen(i)}
                  />
                </li>
              ))}
        </ul>
      </div>
      <Lightbox
        items={images.map((g) => ({ src: g.imageUrl, alt: g.description || g.title, title: g.title, description: g.description, category: g.category }))}
        index={open}
        onIndex={setOpen}
      />
    </section>
  )
}
