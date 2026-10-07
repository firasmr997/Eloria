import { ArrowRight } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { gsap, prefersReducedMotion, useGSAP } from '@/animations/gsap'
import { splashDelay } from '@/components/layout/SplashScreen'
import { Pearl } from '@/components/three/Pearl'
import { ButtonLink } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { hero } from '@/data/content'
import { media } from '@/data/media'
import { useQuery } from '@/hooks/useQuery'
import { treatmentService } from '@/services/treatmentService'
import { todayInParis } from '@/utils/format'

/**
 * First viewport: the headline on the ivory field, a full-height portrait plate bleeding off the right
 * edge, the glass pearl on the seam between them, and a working consultation bar.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // Everything readable within ~1.5 s: the action must never wait on the choreography.
      const tl = gsap.timeline({ delay: splashDelay(), defaults: { ease: 'power3.out' } })
      tl.from('[data-hero-plate]', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0)
        .from('[data-hero-image]', { scale: 1.15, duration: 1.9, ease: 'expo.out' }, 0.15)
        .from('[data-hero-word]', { yPercent: 115, duration: 1, stagger: 0.06 }, 0.1)
        .from('[data-hero-rule]', { scaleX: 0, duration: 0.9, ease: 'expo.out' }, 0.7)
        .from('[data-hero-fade]', { opacity: 0, y: 14, duration: 0.8, stagger: 0.07 }, 0.45)
        .from('[data-hero-frame]', { opacity: 0, duration: 1 }, 0.8)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative flex flex-col overflow-hidden bg-ivory lg:block" aria-labelledby="hero-title">
      {/* Portrait plate: full height, bleeding off the top and right edges of the viewport on desktop. */}
      <div
        data-hero-plate
        className="relative order-last h-[64svh] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[40vw]"
      >
        <div data-hero-image className="size-full">
          <SmartImage
            src={media.hero.src}
            alt={media.hero.alt}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            frameClassName="size-full"
            // A warm grade pulls placeholder photography into the travertine palette.
            className="object-[50%_30%] [filter:sepia(0.22)_saturate(0.92)_contrast(1.02)]"
          />
        </div>
      </div>
      <div data-hero-frame className="pointer-events-none absolute top-32 bottom-12 right-[calc(40vw+1.75rem)] hidden w-px bg-champagne lg:block" aria-hidden />
      <div data-hero-pearl className="pointer-events-none absolute top-[60%] right-[40vw] z-20 hidden size-[min(28vw,28rem)] translate-x-1/2 -translate-y-1/2 lg:block">
        <Pearl className="size-full" deferMs={(splashDelay() + 1.4) * 1000} />
      </div>

      <div className="shell relative grid grid-cols-1 lg:min-h-[100svh] lg:grid-cols-12">
        {/* Copy column */}
        <div className="relative z-10 flex flex-col justify-end pt-36 pb-12 lg:col-span-7 lg:justify-center lg:pt-32 lg:pr-10">
          <h1 id="hero-title" className="text-display text-ink" aria-label={`${hero.lines.join(' ')} ${hero.accent}`}>
            {hero.lines.map((line, l) => (
              <span key={l}>
                {line.split(' ').map((word, i) => (
                  <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] align-top">
                    <span data-hero-word className="inline-block">
                      {word}&nbsp;
                    </span>
                  </span>
                ))}
                {l === 0 && <br />}
              </span>
            ))}
            <span aria-hidden className="relative inline-block overflow-hidden pb-[0.12em] align-top">
              <span data-hero-word className="inline-block">
                {hero.accent}
              </span>
              <span data-hero-rule className="absolute right-[0.4em] bottom-[0.08em] left-0 h-px origin-left bg-champagne" />
            </span>
          </h1>

          <p data-hero-fade className="mt-8 max-w-[34rem] text-lead text-ink-muted">
            {hero.body}
          </p>

          <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink to="/book" size="lg" arrow>
              Book a consultation
            </ButtonLink>
            <ButtonLink to="/treatments" variant="ghost">
              Explore treatments
            </ButtonLink>
          </div>

          <div data-hero-fade className="mt-14 lg:mt-20">
            <ConsultationBar />
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  )
}

/** The working form of the page's primary action: choose a treatment and date, continue to /book prefilled. */
function ConsultationBar() {
  const navigate = useNavigate()
  const { data: options } = useQuery('treatments:options', (signal) => treatmentService.options(signal), { staleTime: 5 * 60_000 })
  const [treatment, setTreatment] = useState('')
  const [date, setDate] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (treatment) params.set('treatment', treatment)
    if (date) params.set('date', date)
    navigate(`/book${params.size ? `?${params}` : ''}`)
  }

  const label = 'text-[0.6875rem] font-semibold tracking-[0.14em] uppercase text-ink-muted'
  const field = 'w-full bg-transparent text-[0.9375rem] text-ink focus:outline-none'
  return (
    <form onSubmit={submit} className="grid max-w-2xl grid-cols-1 border border-line-strong bg-porcelain/70 sm:grid-cols-[1.4fr_1fr_auto]" aria-label="Start a consultation request">
      <label className="flex flex-col gap-1 border-b border-line px-5 py-3.5 sm:border-r sm:border-b-0">
        <span className={label}>Treatment</span>
        <select value={treatment} onChange={(e) => setTreatment(e.target.value)} className={`${field} cursor-pointer appearance-none`}>
          <option value="">First consultation</option>
          {options?.map((o) => (
            <option key={o.id} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 border-b border-line px-5 py-3.5 sm:border-b-0">
        <span className={label}>Preferred date</span>
        <input type="date" value={date} min={todayInParis()} max={todayInParis(365)} onChange={(e) => setDate(e.target.value)} className={`${field} tabular`} />
      </label>
      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-3 bg-espresso px-7 py-4 text-button text-ivory transition-colors duration-300 hover:bg-espresso-raised"
      >
        Request
        <ArrowRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
      </button>
    </form>
  )
}

function ScrollCue() {
  return (
    <div className="pointer-events-none absolute right-[clamp(1rem,0.4rem+3vw,3.5rem)] bottom-8 z-20 hidden flex-col items-center gap-3 lg:flex" aria-hidden>
      <span className="text-[0.625rem] font-semibold tracking-[0.3em] text-ivory uppercase [writing-mode:vertical-rl]">Scroll</span>
      <span className="relative h-16 w-px overflow-hidden bg-ivory/40">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_2.2s_cubic-bezier(.76,0,.24,1)_infinite] bg-ivory" />
      </span>
    </div>
  )
}
