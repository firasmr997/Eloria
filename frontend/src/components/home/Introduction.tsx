import { Reveal, RevealGroup, RevealItem } from '@/animations/Reveal'
import { RevealLines } from '@/animations/RevealLines'
import { useParallax } from '@/animations/useParallax'
import { SmartImage } from '@/components/ui/SmartImage'
import { introduction } from '@/data/content'
import { media } from '@/data/media'

/** A short presentation of Éloria on the travertine field. */
export function Introduction() {
  const parallax = useParallax<HTMLDivElement>(14)
  return (
    <section className="stone section-y" aria-labelledby="intro-title">
      <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div ref={parallax} className="relative aspect-[4/5] overflow-hidden">
            <SmartImage src={media.introduction.src} alt={media.introduction.alt} sizes="(min-width: 1024px) 40vw, 100vw" frameClassName="size-full" />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <RevealLines as="h2" text={introduction.title} className="text-h2 text-ink" />
          <div className="mt-10 space-y-5">
            {introduction.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.1 + i * 0.1}>
                <p className="text-lead text-ink-muted measure">{p}</p>
              </Reveal>
            ))}
          </div>
          <RevealGroup className="mt-14 grid gap-px border-y border-line-strong sm:grid-cols-3">
            {introduction.facts.map((fact) => (
              <RevealItem key={fact.value} className="py-6 sm:pr-6">
                <p className="font-display text-xl text-ink">{fact.value}</p>
                <p className="mt-1 text-small text-ink-muted">{fact.label}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
