import { Reveal, RevealGroup, RevealItem } from '@/animations/Reveal'
import { RevealLines } from '@/animations/RevealLines'
import { useClipReveal, useParallax } from '@/animations/useParallax'
import { BookingCTA } from '@/components/home/BookingCTA'
import { PageHeader } from '@/components/layout/PageHeader'
import { ButtonLink } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { about } from '@/data/content'
import { media } from '@/data/media'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

/** Scroll storytelling in six chapters, alternating stone, ivory and espresso grounds. */
export default function AboutPage() {
  useDocumentMeta({
    title: 'About',
    description: 'The story, philosophy and approach of ÉLORIA AESTHETIC, an aesthetic medicine and skin care center in Paris.',
  })
  const storyImage = useParallax<HTMLDivElement>(12)
  const approachImage = useClipReveal<HTMLDivElement>()
  const expertiseImage = useParallax<HTMLDivElement>(10)

  return (
    <>
      <PageHeader title="A third place between medicine and care." intro="Why Éloria exists, how we work, and the commitments we hold ourselves to." />

      {/* Our story */}
      <section className="bg-ivory pb-28" aria-labelledby="story">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div ref={storyImage} className="relative aspect-[4/5] overflow-hidden lg:col-span-5">
            <SmartImage src={media.about.story.src} alt={media.about.story.alt} sizes="(min-width: 1024px) 40vw, 100vw" frameClassName="size-full" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-24">
            <RevealLines as="h2" text={about.story.title} className="text-h2 text-ink" />
            <div className="mt-10 space-y-6">
              {about.story.body.map((p, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <p className="text-lead text-ink-muted measure">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our philosophy */}
      <section className="grain-dark section-y text-cream" aria-labelledby="about-philosophy">
        <div className="shell">
          <h2 id="about-philosophy" className="sr-only">
            {about.philosophy.title}
          </h2>
          <RevealLines as="p" text={about.philosophy.body} className="mx-auto max-w-5xl text-center font-display text-[clamp(1.75rem,1.2rem+2.2vw,3.25rem)] leading-[1.22] text-cream" />
          <Reveal delay={0.3} className="mx-auto mt-12 h-px w-24 bg-champagne" />
        </div>
      </section>

      {/* Our approach */}
      <section className="stone section-y" aria-labelledby="approach">
        <div className="shell">
          <RevealLines as="h2" text={about.approach.title} className="text-h2 text-ink" />
          <div ref={approachImage} className="mt-14 aspect-[16/9] overflow-hidden lg:aspect-[21/9]">
            <SmartImage src={media.about.approach.src} alt={media.about.approach.alt} sizes="100vw" frameClassName="size-full" />
          </div>
          <RevealGroup className="mt-14 grid gap-10 border-t border-line-strong pt-10 md:grid-cols-3 md:gap-8">
            {about.approach.points.map((point) => (
              <RevealItem key={point.title}>
                <h3 className="text-h4 text-ink">{point.title}</h3>
                <p className="mt-3 text-ink-muted">{point.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Our expertise */}
      <section className="section-y bg-ivory" aria-labelledby="expertise">
        <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <RevealLines as="h2" text={about.expertise.title} className="text-h2 text-ink" />
            <Reveal delay={0.1}>
              <p className="mt-8 text-lead text-ink-muted measure">{about.expertise.body}</p>
              <ButtonLink to="/team" variant="ghost" arrow className="mt-10">
                Meet the team
              </ButtonLink>
            </Reveal>
          </div>
          <div ref={expertiseImage} className="relative aspect-[4/5] overflow-hidden lg:col-span-5 lg:col-start-8">
            <SmartImage src={media.about.expertise.src} alt={media.about.expertise.alt} sizes="(min-width: 1024px) 40vw, 100vw" frameClassName="size-full" />
          </div>
        </div>
      </section>

      {/* Our environment */}
      <section className="section-y border-t border-line bg-porcelain" aria-labelledby="environment">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-12">
            <RevealLines as="h2" text={about.environment.title} className="text-h2 text-ink lg:col-span-5" />
            <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
              <p className="text-lead text-ink-muted">{about.environment.body}</p>
              <ButtonLink to="/gallery/center" variant="ghost" arrow className="mt-8">
                Tour the center
              </ButtonLink>
            </Reveal>
          </div>
          <RevealGroup className="mt-16 grid grid-cols-12 gap-4 sm:gap-8">
            {media.about.environment.map((image, i) => (
              <RevealItem
                key={image.src}
                className={i === 0 ? 'col-span-12 lg:col-span-6' : i === 1 ? 'col-span-6 lg:col-span-3 lg:mt-24' : 'col-span-6 lg:col-span-3'}
              >
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  sizes="(min-width: 1024px) 40vw, 50vw"
                  frameClassName={i === 0 ? 'aspect-[4/3]' : 'aspect-[3/4]'}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Our commitment */}
      <section className="section-y bg-ivory" aria-labelledby="commitment">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <RevealLines as="h2" text={about.commitment.title} className="text-h2 text-ink" />
            <Reveal delay={0.1} className="mt-10 aspect-square max-w-sm overflow-hidden">
              <SmartImage src={media.about.commitment.src} alt={media.about.commitment.alt} frameClassName="size-full" sizes="24rem" />
            </Reveal>
          </div>
          <ol className="border-t border-espresso lg:col-span-6 lg:col-start-7">
            {about.commitment.points.map((point, i) => (
              <Reveal as="li" key={point} delay={i * 0.06} className="flex gap-6 border-b border-line py-7">
                <span className="font-display text-xl text-champagne-deep tabular">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[1.6rem] leading-snug text-ink">{point}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
