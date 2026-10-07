import { useNavigate, useParams } from 'react-router'
import { RevealGroup, RevealItem } from '@/animations/Reveal'
import { PageHeader } from '@/components/layout/PageHeader'
import { SpecialistCard, SpecialistCardSkeleton, SpecialistProfile } from '@/components/team/SpecialistCard'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useQuery } from '@/hooks/useQuery'
import { specialistService } from '@/services/contentService'

export default function TeamPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data, error, isLoading, refetch } = useQuery('specialists:list', (signal) => specialistService.list({ size: 24 }, signal))
  const team = data?.content ?? []
  const selected = slug ? (team.find((s) => s.slug === slug) ?? null) : null

  useDocumentMeta({
    title: selected ? `${selected.name}, ${selected.role}` : 'Our team',
    description: selected ? selected.bio.slice(0, 155) : 'Meet the aesthetic physicians, nurses and skin therapists of ÉLORIA AESTHETIC in Paris.',
    image: selected?.photo,
  })

  return (
    <>
      <PageHeader
        title="The people behind your care"
        intro="Every plan at Éloria is built by a team: a physician for medical decisions, a nurse for clinical treatments, a therapist who knows your skin. Select a specialist to read their profile."
      />
      <section className="bg-ivory pb-32" aria-label="Specialists">
        <div className="shell">
          {error ? (
            <ErrorState message={error.message} onRetry={refetch} />
          ) : isLoading ? (
            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <SpecialistCardSkeleton key={i} />
              ))}
            </div>
          ) : team.length === 0 ? (
            <EmptyState title="Our team will be introduced here soon." />
          ) : (
            <RevealGroup className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((s, i) => (
                <RevealItem key={s.id} className={i % 3 === 1 ? 'lg:mt-20' : undefined}>
                  <SpecialistCard specialist={s} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>
      <SpecialistProfile specialist={selected} onClose={() => navigate('/team', { preventScrollReset: true })} />
    </>
  )
}
