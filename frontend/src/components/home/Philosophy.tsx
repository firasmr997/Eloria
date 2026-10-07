import { useRef } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/animations/gsap'
import { SmartImage } from '@/components/ui/SmartImage'
import { philosophy } from '@/data/content'
import { media } from '@/data/media'

/**
 * Sticky storytelling on the espresso field. On desktop with motion allowed, the section pins while three
 * principles replace one another and their photographs cross-fade and scale. Otherwise (small screens,
 * reduced motion) it is a plain stacked sequence: the pinned layout only exists while `data-pinned` is set.
 */
export function Philosophy() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const section = root.current
        if (!section) return
        section.dataset.pinned = 'true'
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
        const images = gsap.utils.toArray<HTMLElement>('[data-step-image]')
        const bar = section.querySelector('[data-progress]')
        gsap.set(steps.slice(1), { autoAlpha: 0, y: 40 })
        gsap.set(images.slice(1), { autoAlpha: 0, scale: 1.12 })
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * (steps.length - 0.4)}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        steps.forEach((step, i) => {
          if (i === 0) return
          tl.to(steps[i - 1], { autoAlpha: 0, y: -40 }, `s${i}`)
            .to(images[i - 1], { autoAlpha: 0, scale: 0.96 }, `s${i}`)
            .to(step, { autoAlpha: 1, y: 0 }, `s${i}+=0.15`)
            .to(images[i], { autoAlpha: 1, scale: 1 }, `s${i}`)
        })
        if (bar) tl.fromTo(bar, { scaleY: 1 / steps.length }, { scaleY: 1, ease: 'none', duration: tl.duration() }, 0)
        ScrollTrigger.refresh()
        return () => {
          delete section.dataset.pinned
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="group grain-dark overflow-hidden text-cream" aria-labelledby="philosophy-title">
      <div className={`shell grid items-center gap-14 py-24 lg:grid-cols-12 lg:gap-8 lg:group-data-[pinned=true]:min-h-[100svh] lg:group-data-[pinned=true]:py-0`}>
        <div className={`lg:col-span-6 lg:group-data-[pinned=true]:col-span-5`}>
          <h2 id="philosophy-title" className="sr-only">
            Our philosophy
          </h2>
          <div className={`relative lg:group-data-[pinned=true]:min-h-[22rem]`}>
            <span className={`absolute top-0 bottom-0 -left-6 hidden w-px bg-line-dark lg:group-data-[pinned=true]:block`} aria-hidden>
              <span data-progress className="block h-full w-px origin-top bg-champagne" />
            </span>
            {philosophy.map((step, i) => (
              <div key={step.title} data-step className={`mb-16 last:mb-0 lg:group-data-[pinned=true]:absolute lg:group-data-[pinned=true]:inset-x-0 lg:group-data-[pinned=true]:top-0 lg:group-data-[pinned=true]:mb-0`}>
                <p className="font-display text-lg text-champagne tabular">{String(i + 1).padStart(2, '0')} / 03</p>
                <h3 className="mt-5 text-h1 text-cream">{step.title}</h3>
                <p className="mt-6 max-w-md text-lead text-cream-muted">{step.body}</p>
                <div className={`mt-8 aspect-[4/3] max-w-xl overflow-hidden lg:group-data-[pinned=true]:hidden`}>
                  <SmartImage src={media.philosophy[i].src} alt={media.philosophy[i].alt} frameClassName="size-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`relative hidden aspect-[4/5] max-h-[78svh] w-full overflow-hidden lg:group-data-[pinned=true]:col-span-6 lg:group-data-[pinned=true]:col-start-7 lg:group-data-[pinned=true]:block`}>
          {media.philosophy.map((image) => (
            <div key={image.src} data-step-image className="absolute inset-0">
              <SmartImage src={image.src} alt={image.alt} sizes="45vw" frameClassName="size-full" />
            </div>
          ))}
          <div className="pointer-events-none absolute inset-4 border border-champagne/40" aria-hidden />
        </div>
      </div>
    </section>
  )
}
