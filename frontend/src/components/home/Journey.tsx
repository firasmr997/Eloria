import { useRef } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/animations/gsap'
import { RevealLines } from '@/animations/RevealLines'
import { journey } from '@/data/content'

/**
 * Horizontal storytelling: the five steps of a visit slide past while the section is pinned (desktop,
 * motion allowed). Without the animation the steps sit in a five-column row on desktop and stack on
 * smaller screens. The step numbers stay because the order is the information.
 */
export function Journey() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLOListElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const section = root.current
        const el = track.current
        if (!section || !el) return
        section.dataset.pinned = 'true'
        const distance = () => el.scrollWidth - el.clientWidth
        gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        gsap.to('[data-journey-line]', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true },
        })
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
    <section ref={root} className="group section-y overflow-hidden bg-ivory lg:data-[pinned=true]:py-0" aria-labelledby="journey-title">
      <div className={`flex flex-col justify-center lg:group-data-[pinned=true]:min-h-[100svh]`}>
        <div className="shell">
          <RevealLines as="h2" text="Your visit, step by step." className="text-h2 max-w-xl text-ink" />
          <p className="mt-6 max-w-lg text-lead text-ink-muted">Nothing is decided before we have met. This is how a first visit unfolds.</p>
        </div>
        <div className="shell relative mt-16 lg:mt-20">
          <div className="absolute top-[1.35rem] right-0 left-[clamp(1rem,0.4rem+3vw,3.5rem)] hidden h-px bg-line lg:block" aria-hidden>
            <div data-journey-line className={`h-px origin-left bg-champagne lg:group-data-[pinned=true]:scale-x-0`} />
          </div>
          <ol ref={track} className={`grid gap-12 lg:grid-cols-5 lg:gap-8 lg:group-data-[pinned=true]:flex lg:group-data-[pinned=true]:gap-0 lg:group-data-[pinned=true]:pr-[20vw]`}>
            {journey.map((step, i) => (
              <li key={step.title} className={`relative lg:group-data-[pinned=true]:w-[34vw] lg:group-data-[pinned=true]:max-w-[30rem] lg:group-data-[pinned=true]:shrink-0 lg:group-data-[pinned=true]:pr-16`}>
                <span className="relative z-10 inline-flex size-11 items-center justify-center rounded-full border border-champagne bg-ivory font-display text-lg text-champagne-deep tabular">
                  {i + 1}
                </span>
                <h3 className="mt-8 text-h3 text-ink">{step.title}</h3>
                <p className="mt-4 max-w-sm text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
