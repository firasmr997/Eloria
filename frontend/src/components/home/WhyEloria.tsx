import { RevealGroup, RevealItem } from '@/animations/Reveal'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { whyEloria } from '@/data/content'

/** Four reasons set as a ruled editorial list, not as icon cards. */
export function WhyEloria() {
  return (
    <section className="section-y bg-ivory" aria-labelledby="why-title">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionTitle title="Why Éloria" intro="What clients tell us makes the difference, and what we work hardest to protect." />
          </div>
        </div>
        <RevealGroup className="lg:col-span-7 lg:col-start-6">
          <dl className="border-t border-espresso">
            {whyEloria.map((item) => (
              <RevealItem key={item.title}>
                <div className="group grid gap-3 border-b border-line py-9 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-10">
                  <dt className="font-display text-[1.75rem] leading-tight text-ink transition-transform duration-500 ease-[var(--ease-silk)] group-hover:translate-x-1.5">
                    {item.title}
                  </dt>
                  <dd className="text-ink-muted sm:pt-1.5">{item.body}</dd>
                </div>
              </RevealItem>
            ))}
          </dl>
        </RevealGroup>
      </div>
    </section>
  )
}
