import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { logoPaths } from '@/components/brand/logoPaths'
import { Logo } from '@/components/brand/Logo'
import { gsap, prefersReducedMotion } from '@/animations/gsap'

const SEEN_KEY = 'eloria.splash'
const SPLASH_SECONDS = 1.75

function alreadySeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

/** When the splash started in this page load (null when it is not shown). */
let splashStartedAt: number | null = null

/** Seconds the hero should wait so its entrance plays while the veil lifts (it overlaps by 0.35 s). */
export function splashDelay(): number {
  if (splashStartedAt === null || prefersReducedMotion()) return 0
  return Math.max(0, SPLASH_SECONDS - 0.35 - (performance.now() - splashStartedAt) / 1000)
}

/**
 * Opening sequence (about 1.6 s, once per browser session):
 * ivory ground → the monogram ring draws → the É settles and its champagne drop falls into place →
 * the wordmark appears → the ivory veil lifts to reveal the site. Reduced motion: a short fade.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    const show = !alreadySeen()
    if (show) splashStartedAt = performance.now()
    return show
  })
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // ignore
    }
    if (prefersReducedMotion()) {
      const timer = window.setTimeout(() => setVisible(false), 450)
      return () => window.clearTimeout(timer)
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setVisible(false) })
      tl.fromTo('[data-ring]', { strokeDashoffset: 604 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' })
        .fromTo('[data-letter]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.25)
        .fromTo('[data-drop]', { opacity: 0, y: -26 }, { opacity: 1, y: 0, duration: 0.45, ease: 'bounce.out' }, 0.55)
        .fromTo('[data-mark]', { scale: 1 }, { scale: 0.62, y: -36, duration: 0.5, ease: 'power3.inOut' }, 0.95)
        .fromTo('[data-word]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 1.05)
        .to({}, { duration: 0.15 })
    }, root)
    return () => ctx.revert()
  }, [visible])

  const { monogram } = logoPaths
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={root}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ivory"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="relative flex flex-col items-center">
            <svg data-mark viewBox={`0 0 ${monogram.size} ${monogram.size}`} className="size-28 sm:size-32">
              <circle
                data-ring
                cx="100"
                cy="100"
                r="96"
                fill="none"
                stroke="var(--color-champagne)"
                strokeWidth="1.6"
                strokeDasharray="604"
                transform="rotate(-90 100 100)"
              />
              <path data-letter d={monogram.main} fill="var(--color-espresso)" />
              <path data-drop d={monogram.accent} fill="var(--color-champagne)" />
            </svg>
            <div data-word className="absolute top-full mt-1 opacity-0">
              <Logo withDescriptor className="w-44" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
