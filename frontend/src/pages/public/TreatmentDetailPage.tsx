import { ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Reveal } from '@/animations/Reveal'
import { RevealLines } from '@/animations/RevealLines'
import { useParallax } from '@/animations/useParallax'
import { Lightbox } from '@/components/gallery/Lightbox'
import { ResultCard, ResultsDisclaimer } from '@/components/results/ResultCard'
import { SpecSheet } from '@/components/treatments/SpecSheet'
import { reference, TreatmentCard } from '@/components/treatments/TreatmentCard'
import { Accordion } from '@/components/ui/Accordion'
import { ButtonLink } from '@/components/ui/Button'
import { ImageCard } from '@/components/ui/Card'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { SmartImage } from '@/components/ui/SmartImage'
import { disclaimer } from '@/data/content'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useQuery } from '@/hooks/useQuery'
import { resultService } from '@/services/contentService'
import { treatmentService } from '@/services/treatmentService'
import type { Treatment } from '@/types/models'

export default function TreatmentDetailPage() {
  const { id: slug = '' } = useParams()
  const { data: treatment, error, isLoading, refetch } = useQuery(`treatment:${slug}`, (signal) => treatmentService.bySlug(slug, signal))

  useDocumentMeta({
    title: treatment?.name ?? (error?.status === 404 ? 'Treatment not found' : 'Treatment'),
    description: treatment?.shortDescription,
    image: treatment?.mainImageUrl,
    type: 'article',
    noindex: error?.status === 404,
    structuredData: treatment
      ? {
          '@context': 'https://schema.org',
          '@type': 'MedicalProcedure',
          name: treatment.name,
          description: treatment.shortDescription,
          procedureType: 'https://schema.org/NoninvasiveProcedure',
          howPerformed: treatment.technology ?? undefined,
          preparation: treatment.preparation.join(' '),
          followup: treatment.aftercare.join(' '),
          image: treatment.mainImageUrl ?? undefined,
          offers: { '@type': 'Offer', price: treatment.price, priceCurrency: 'EUR' },
        }
      : undefined,
  })

  if (error) {
    return (
      <div className="shell pt-48 pb-32">
        {error.status === 404 ? (
          <EmptyState
            title="This treatment could not be found."
            body="It may have been renamed or retired. Browse the catalogue to find what you were looking for."
            action={<ButtonLink to="/treatments" arrow>All treatments</ButtonLink>}
          />
        ) : (
          <ErrorState message={error.message} onRetry={refetch} />
        )}
      </div>
    )
  }
  if (isLoading || !treatment) return <DetailSkeleton />
  return <TreatmentDetail treatment={treatment} />
}

function TreatmentDetail({ treatment: t }: { treatment: Treatment }) {
  const parallax = useParallax<HTMLDivElement>(12)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const results = useQuery(`results:treatment:${t.id}`, (signal) => resultService.list({ treatmentId: t.id, size: 2 }, signal))
  const related = useQuery(`treatments:related:${t.category.slug}`, (signal) => treatmentService.search({ category: t.category.slug, size: 4 }, signal))
  const relatedItems = (related.data?.content ?? []).filter((r) => r.id !== t.id).slice(0, 3)
  const gallery = [
    ...(t.mainImageUrl ? [{ src: t.mainImageUrl, alt: t.mainImageAlt || t.name }] : []),
    ...t.additionalImages.map((i) => ({ src: i.imageUrl, alt: i.altText || t.name })),
  ]

  const lists = [
    { title: 'Benefits', items: t.benefits },
    { title: 'Before your appointment', items: t.preparation },
    { title: 'Aftercare', items: t.aftercare },
  ].filter((l) => l.items.length > 0)

  return (
    <article>
      <header className="bg-ivory pt-36 pb-14 lg:pt-44">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="text-small text-ink-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/treatments" className="link-underline hover:text-ink">
                  Treatments
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link to={`/treatments?category=${t.category.slug}`} className="link-underline hover:text-ink">
                  {t.category.name}
                </Link>
              </li>
            </ol>
          </nav>
          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="font-display text-xl text-champagne-deep tabular">{reference(t.id)}</p>
              <RevealLines as="h1" text={t.name} immediate delay={0.1} className="mt-4 text-h1 text-ink" />
              <Reveal delay={0.3}>
                <p className="mt-8 max-w-xl text-lead text-ink-muted">{t.shortDescription}</p>
              </Reveal>
              <Reveal delay={0.4} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {t.available ? (
                  <ButtonLink to={`/book?treatment=${t.slug}`} size="lg" arrow>
                    Book a consultation
                  </ButtonLink>
                ) : (
                  <p className="border-l border-champagne pl-4 text-small text-ink-muted">
                    This treatment is currently unavailable. Contact us to be told when it returns.
                  </p>
                )}
                <ButtonLink to="/contact" variant="ghost">
                  Ask a question
                </ButtonLink>
              </Reveal>
            </div>
            <Reveal delay={0.35} className="lg:col-span-4 lg:col-start-9">
              <SpecSheet treatment={t} />
            </Reveal>
          </div>
        </div>
      </header>

      <div ref={parallax} className="relative h-[60svh] overflow-hidden lg:h-[86svh]">
        <SmartImage src={t.mainImageUrl} alt={t.mainImageAlt || t.name} priority sizes="100vw" frameClassName="size-full" />
      </div>

      <div className="section-y bg-ivory">
        <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-display text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] leading-[1.45] text-ink">{t.description}</p>
            </Reveal>

            <div className="mt-20 space-y-16">
              {lists.map((list) => (
                <Reveal key={list.title}>
                  <h2 className="text-h3 text-ink">{list.title}</h2>
                  <ul className="mt-6 border-t border-line">
                    {list.items.map((item) => (
                      <li key={item} className="flex gap-5 border-b border-line py-4 text-ink">
                        <span className="mt-[0.7em] h-px w-5 shrink-0 bg-champagne" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}

              {t.contraindications.length > 0 && (
                <Reveal>
                  <section className="stone border border-line p-8" aria-labelledby="cautions">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="size-5 text-champagne-deep" strokeWidth={1.25} aria-hidden />
                      <h2 id="cautions" className="text-h4 text-ink">
                        When this treatment may not be suitable
                      </h2>
                    </div>
                    <ul className="mt-5 space-y-2 text-ink-muted">
                      {t.contraindications.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <p className="mt-6 text-small text-ink-muted">
                      This list is not exhaustive. Your practitioner reviews your health history at consultation and may advise against or postpone treatment.
                    </p>
                  </section>
                </Reveal>
              )}

              {t.faqs.length > 0 && (
                <Reveal>
                  <h2 className="text-h3 text-ink">Questions</h2>
                  <Accordion className="mt-6" items={t.faqs.map((f) => ({ id: f.id, title: f.question, body: f.answer }))} />
                </Reveal>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9" aria-label="Book this treatment">
            <div className="lg:sticky lg:top-28">
              <div className="grain-dark p-8 text-cream">
                <p className="font-display text-2xl">{t.name}</p>
                <SpecSheet treatment={t} tone="dark" className="mt-6" />
                {t.available && (
                  <ButtonLink to={`/book?treatment=${t.slug}`} variant="light" arrow className="mt-8 w-full">
                    Book a consultation
                  </ButtonLink>
                )}
              </div>
              <p className="mt-6 text-small text-ink-muted">{disclaimer.short}</p>
            </div>
          </aside>
        </div>
      </div>

      {gallery.length > 1 && (
        <section className="border-t border-line bg-porcelain py-20" aria-labelledby="treatment-gallery">
          <div className="shell">
            <h2 id="treatment-gallery" className="text-h3 text-ink">
              In pictures
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {gallery.map((image, i) => (
                <li key={image.src}>
                  <ImageCard src={image.src} alt={image.alt} aspect="aspect-[4/5]" sizes="(min-width: 1024px) 25vw, 50vw" onClick={() => setLightbox(i)} />
                </li>
              ))}
            </ul>
          </div>
          <Lightbox items={gallery} index={lightbox} onIndex={setLightbox} />
        </section>
      )}

      {(results.data?.content.length ?? 0) > 0 && (
        <section className="stone section-y" aria-labelledby="treatment-results">
          <div className="shell">
            <h2 id="treatment-results" className="text-h2 text-ink">
              Results with {t.name}
            </h2>
            <ResultsDisclaimer className="mt-6 max-w-2xl" />
            <div className="mt-14 grid gap-12 md:grid-cols-2">
              {results.data!.content.map((r) => (
                <ResultCard key={r.id} result={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedItems.length > 0 && (
        <section className="section-y bg-ivory" aria-labelledby="related">
          <div className="shell">
            <h2 id="related" className="text-h2 text-ink">
              Also in {t.category.name}
            </h2>
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((r) => (
                <TreatmentCard key={r.id} treatment={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

function DetailSkeleton() {
  return (
    <div className="shell pt-44 pb-24" aria-busy="true" aria-label="Loading treatment">
      <Skeleton className="h-4 w-48" />
      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-6 h-20 w-4/5" />
          <Skeleton className="mt-8 h-5 w-3/5" />
        </div>
        <Skeleton className="h-64 lg:col-span-4 lg:col-start-9" />
      </div>
      <Skeleton className="mt-16 h-[50vh] w-full" />
    </div>
  )
}
