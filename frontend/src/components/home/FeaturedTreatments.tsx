import { RevealGroup, RevealItem } from '@/animations/Reveal'
import { TreatmentCard, TreatmentCardSkeleton } from '@/components/treatments/TreatmentCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useQuery } from '@/hooks/useQuery'
import { treatmentService } from '@/services/treatmentService'

/** One large protocol and four companions: an editorial spread rather than a row of equal cards. */
export function FeaturedTreatments() {
  const { data, isLoading, error, refetch } = useQuery('treatments:featured', (signal) =>
    treatmentService.search({ featured: true, size: 5, sort: 'curated' }, signal),
  )
  const items = data?.content ?? []

  return (
    <section className="section-y bg-ivory" aria-labelledby="featured-title">
      <div className="shell">
        <SectionTitle
          title="Signature treatments"
          intro="A selection of the protocols our clients return for. Each one starts with a consultation and is adapted to your skin."
          action={
            <ButtonLink to="/treatments" variant="ghost" arrow>
              All treatments
            </ButtonLink>
          }
        />
        <div className="mt-16 lg:mt-20">
          {error ? (
            <ErrorState message={error.message} onRetry={refetch} />
          ) : isLoading ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <TreatmentCardSkeleton />
              </div>
              <div className="grid gap-x-8 gap-y-14 sm:col-span-2 sm:grid-cols-2 lg:col-span-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <TreatmentCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="No featured treatments yet." body="Featured treatments chosen in the admin appear here." />
          ) : (
            <RevealGroup className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
              <RevealItem className="sm:col-span-2 lg:col-span-6 lg:row-span-2">
                <div className="lg:sticky lg:top-28">
                  <TreatmentCard treatment={items[0]} large />
                </div>
              </RevealItem>
              {items.slice(1).map((t) => (
                <RevealItem key={t.id} className="lg:col-span-3">
                  <TreatmentCard treatment={t} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </section>
  )
}
