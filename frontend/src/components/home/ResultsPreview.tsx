import { Reveal } from '@/animations/Reveal'
import { RevealLines } from '@/animations/RevealLines'
import { BeforeAfterSlider } from '@/components/results/BeforeAfterSlider'
import { ResultsDisclaimer } from '@/components/results/ResultCard'
import { ButtonLink } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Feedback'
import { useQuery } from '@/hooks/useQuery'
import { resultService } from '@/services/contentService'

/** One featured before/after case with the draggable comparison, and an honest frame around it. */
export function ResultsPreview() {
  const { data, isLoading } = useQuery('results:featured', (signal) => resultService.list({ featured: true, size: 3 }, signal))
  const result = data?.content[0]
  if (!isLoading && !result) return null

  return (
    <section className="stone section-y" aria-labelledby="results-title">
      <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          {result ? (
            <Reveal>
              <BeforeAfterSlider before={result.beforeImageUrl} after={result.afterImageUrl} alt={result.title} className="lg:aspect-[5/6]" />
            </Reveal>
          ) : (
            <Skeleton className="aspect-[4/5] w-full" />
          )}
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <RevealLines as="h2" text="Progress you can see, at your skin’s pace." className="text-h2 text-ink" />
          <Reveal delay={0.1}>
            <p className="mt-8 text-lead text-ink-muted">
              Drag the divider to compare. Real change is usually gradual: it comes from a well-planned course of treatment and good daily care, not from a single session.
            </p>
          </Reveal>
          {result && (
            <Reveal delay={0.2}>
              <div className="mt-10 border-t border-line-strong pt-6">
                <p className="font-display text-xl text-ink">{result.title}</p>
                <p className="mt-1 text-small text-ink-muted tabular">
                  {[result.treatment?.name, result.durationLabel].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Reveal>
          )}
          <Reveal delay={0.25}>
            <ResultsDisclaimer className="mt-8" />
            <ButtonLink to="/results" variant="ghost" arrow className="mt-10">
              See all results
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
