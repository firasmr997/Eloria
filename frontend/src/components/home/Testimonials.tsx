import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { testimonialService } from '@/services/contentService'
import { cn } from '@/utils/format'

const INTERVAL = 7000

/** One quote at a time, set large. Auto-advances unless paused, hovered or focused, or motion is reduced. */
export function Testimonials() {
  const { data } = useQuery('testimonials:public', (signal) => testimonialService.list(signal))
  const items = data ?? []
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const reduce = useReducedMotion()
  const running = !paused && !hovered && !reduce && items.length > 1

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), INTERVAL)
    return () => window.clearTimeout(timer)
  }, [running, index, items.length])

  if (items.length === 0) return null
  const current = items[index % items.length]
  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length)

  return (
    <section
      className="section-y border-t border-line bg-ivory"
      aria-labelledby="testimonials-title"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <h2 id="testimonials-title" className="text-h3 text-ink">
            In their words
          </h2>
          <p className="mt-4 text-small text-ink-muted">Shared with permission. Experiences are personal and results vary.</p>
        </div>
        <div className="lg:col-span-8 lg:col-start-5">
          <div className="relative min-h-[19rem] sm:min-h-[16rem]" aria-live={running ? 'off' : 'polite'}>
            <AnimatePresence mode="wait">
              <motion.figure
                key={current.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${items.length}`}
              >
                <blockquote className="font-display text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] leading-[1.25] text-ink">
                  <span className="text-champagne" aria-hidden>
                    “
                  </span>
                  {current.quote}
                  <span className="text-champagne" aria-hidden>
                    ”
                  </span>
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold text-ink">{current.authorName}</span>
                  {current.authorDetail && <span className="text-small text-ink-muted">{current.authorDetail}</span>}
                  {current.treatmentName && <span className="text-caption text-champagne-deep">{current.treatmentName}</span>}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong transition-colors hover:border-espresso" aria-label="Previous testimonial">
                <ArrowLeft className="size-4" strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => go(1)} className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong transition-colors hover:border-espresso" aria-label="Next testimonial">
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </button>
              {!reduce && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="inline-flex size-11 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink"
                  aria-label={paused ? 'Play testimonials' : 'Pause testimonials'}
                >
                  {paused ? <Play className="size-4" strokeWidth={1.5} /> : <Pause className="size-4" strokeWidth={1.5} />}
                </button>
              )}
            </div>
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {items.map((t, i) => (
                <span key={t.id} className="relative h-px flex-1 overflow-hidden bg-line-strong">
                  <span
                    className={cn('absolute inset-0 origin-left bg-espresso', i < index ? 'scale-x-100' : 'scale-x-0')}
                    style={
                      i === index
                        ? { animation: running ? `testimonial-progress ${INTERVAL}ms linear forwards` : 'none', transform: running ? undefined : 'scaleX(1)' }
                        : undefined
                    }
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
