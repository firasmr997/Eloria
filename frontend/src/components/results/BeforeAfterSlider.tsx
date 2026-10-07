import { useReducedMotion } from 'framer-motion'
import { ChevronsLeftRight } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '@/utils/format'

interface BeforeAfterSliderProps {
  before: string
  after: string
  alt: string
  /** Initial divider position, percent from the left. */
  initial?: number
  className?: string
  /** Plays a short sweep the first time the slider scrolls into view, to show it can be dragged. */
  hint?: boolean
}

const clamp = (v: number) => Math.min(100, Math.max(0, v))

/**
 * The signature interaction: a champagne hairline with a round loupe handle divides the before and after
 * images. Drag with mouse or touch anywhere on the image, or use the keyboard (arrows, Page Up/Down,
 * Home/End) on the handle, which is an ARIA slider.
 */
export function BeforeAfterSlider({ before, after, alt, initial = 50, className, hint = true }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initial)
  const [dragging, setDragging] = useState(false)
  const [animating, setAnimating] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const hintTimers = useRef<number[]>([])
  const labelId = useId()
  const reduce = useReducedMotion()

  /** The visitor's own input always wins over the introductory sweep. */
  const cancelHint = () => {
    hintTimers.current.forEach(window.clearTimeout)
    hintTimers.current = []
  }

  const fromPointer = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100))
  }, [])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    cancelHint()
    setAnimating(false)
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    fromPointer(event.clientX)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging) fromPointer(event.clientX)
  }

  const stop = () => setDragging(false)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowLeft: -2, ArrowDown: -2, ArrowRight: 2, ArrowUp: 2, PageDown: -10, PageUp: 10 }
    if (event.key in steps || event.key === 'Home' || event.key === 'End') cancelHint()
    if (event.key in steps) {
      event.preventDefault()
      setAnimating(true)
      setPosition((p) => clamp(p + steps[event.key]))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setAnimating(true)
      setPosition(event.key === 'Home' ? 0 : 100)
    }
  }

  // One gentle sweep on first view, so visitors understand the divider moves.
  useEffect(() => {
    if (!hint || reduce || !frame.current || typeof IntersectionObserver === 'undefined') return
    const el = frame.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setAnimating(true)
        hintTimers.current = [
          window.setTimeout(() => setPosition(initial - 14), 300),
          window.setTimeout(() => setPosition(initial + 10), 1100),
          window.setTimeout(() => setPosition(initial), 1900),
          window.setTimeout(() => setAnimating(false), 2700),
        ]
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      hintTimers.current.forEach(window.clearTimeout)
    }
  }, [hint, reduce, initial])

  const transition = animating && !dragging ? 'transition-[clip-path,left] duration-700 ease-[var(--ease-silk)]' : ''

  return (
    <div
      ref={frame}
      className={cn('relative aspect-[4/5] touch-pan-y overflow-hidden bg-travertine select-none', dragging ? 'cursor-grabbing' : 'cursor-ew-resize', className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <img src={after} alt={`${alt}, after`} className="absolute inset-0 size-full object-cover" draggable={false} loading="lazy" />
      <img
        src={before}
        alt={`${alt}, before`}
        className={cn('absolute inset-0 size-full object-cover', transition)}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
        loading="lazy"
      />

      <span className="pointer-events-none absolute top-4 left-4 bg-espresso/80 px-2.5 py-1 text-caption text-cream" id={labelId}>
        Before
      </span>
      <span className="pointer-events-none absolute top-4 right-4 bg-ivory/90 px-2.5 py-1 text-caption text-ink">After</span>

      <div className={cn('pointer-events-none absolute inset-y-0', transition)} style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -left-px w-px bg-champagne-light shadow-[0_0_0_0.5px_rgb(36_27_23/0.15)]" />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% before image shown`}
          onKeyDown={onKeyDown}
          className={cn(
            'pointer-events-auto absolute top-1/2 left-0 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
            'border border-champagne-light bg-ivory/85 text-espresso shadow-soft backdrop-blur-sm transition-transform duration-300',
            dragging ? 'scale-95' : 'hover:scale-105',
            'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne-light',
          )}
        >
          <span className="absolute inset-1.5 rounded-full border border-champagne/60" aria-hidden />
          <ChevronsLeftRight className="size-5" strokeWidth={1.25} aria-hidden />
        </div>
      </div>
    </div>
  )
}
