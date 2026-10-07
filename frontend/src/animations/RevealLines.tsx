import { useRef } from 'react'
import { gsap, prefersReducedMotion, SILK, useGSAP } from './gsap'

interface RevealLinesProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  /** Start immediately instead of on scroll (hero headlines). */
  immediate?: boolean
  delay?: number
}

/**
 * Editorial heading reveal: each word rises out of a mask, staggered, the first time the heading
 * scrolls into view. The accessible name is the plain text; the animated spans are hidden from AT.
 */
export function RevealLines({ text, as: Tag = 'h2', className, immediate, delay = 0 }: RevealLinesProps) {
  const ref = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      const words = ref.current.querySelectorAll<HTMLElement>('[data-word]')
      gsap.set(words, { yPercent: 110 })
      gsap.to(words, {
        yPercent: 0,
        duration: 1.15,
        ease: SILK,
        stagger: 0.06,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: 'top 88%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-top">
          <span data-word className="inline-block will-change-transform">
            {word}
            {i < text.split(' ').length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </Tag>
  )
}
