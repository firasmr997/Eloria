import { useRef } from 'react'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from './gsap'

/**
 * Scroll-scrubbed parallax for an image inside a clipping frame: the image is scaled up slightly and
 * travels `distance` percent while its frame crosses the viewport. Disabled under reduced motion.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(distance = 12) {
  const ref = useRef<T>(null)
  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      const target = el.querySelector('img') ?? el
      gsap.fromTo(
        target,
        { yPercent: -distance / 2, scale: 1 + distance / 100 },
        {
          yPercent: distance / 2,
          scale: 1 + distance / 100,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    },
    { scope: ref },
  )
  return ref
}

/** Image-reveal on scroll: the frame opens from the bottom like a lifting veil. */
export function useClipReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      gsap.fromTo(
        el,
        { clipPath: 'inset(18% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      )
    },
    { scope: ref },
  )
  return ref
}

/** Recalculate trigger positions after content that changes layout (images, async data) settles. */
export function refreshScrollTriggers() {
  requestAnimationFrame(() => ScrollTrigger.refresh())
}
