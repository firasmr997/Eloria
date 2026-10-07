import { RevealGroup, RevealItem } from '@/animations/Reveal'
import { SpecialistCard, SpecialistCardSkeleton } from '@/components/team/SpecialistCard'
import { ButtonLink } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useQuery } from '@/hooks/useQuery'
import { specialistService } from '@/services/contentService'

export function SpecialistsPreview() {
  const { data, isLoading } = useQuery('specialists:list', (signal) => specialistService.list({ size: 24 }, signal))
  const team = data?.content.slice(0, 4) ?? []
  if (!isLoading && team.length === 0) return null

  return (
    <section className="section-y border-t border-line bg-porcelain" aria-labelledby="team-title">
      <div className="shell">
        <SectionTitle
          title="The specialists"
          intro="Physicians, nurses and skin therapists who plan your care together and follow it through."
          action={
            <ButtonLink to="/team" variant="ghost" arrow>
              Meet the team
            </ButtonLink>
          }
        />
        <RevealGroup className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => <SpecialistCardSkeleton key={i} />)
            : team.map((s, i) => (
                <RevealItem key={s.id} className={i % 2 === 1 ? 'lg:mt-16' : undefined}>
                  <SpecialistCard specialist={s} />
                </RevealItem>
              ))}
        </RevealGroup>
      </div>
    </section>
  )
}
