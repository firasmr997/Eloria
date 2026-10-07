import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useUtilities'
import { humanize } from '@/utils/format'
import { sized } from '@/utils/image'

export interface LightboxItem {
  src: string
  alt: string
  title?: string
  description?: string | null
  category?: string
}

interface LightboxProps {
  items: LightboxItem[]
  index: number | null
  onIndex: (index: number | null) => void
}

/** Fullscreen viewer: arrows, Escape, swipe; focus moves in and returns to the thumbnail on close. */
export function Lightbox({ items, index, onIndex }: LightboxProps) {
  const open = index !== null && index >= 0 && index < items.length
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onIndex(null)
      if (event.key === 'ArrowRight') onIndex(((index ?? 0) + 1) % items.length)
      if (event.key === 'ArrowLeft') onIndex(((index ?? 0) - 1 + items.length) % items.length)
      if (event.key === 'Tab') {
        // Keep focus inside the viewer.
        const focusable = [...document.querySelectorAll<HTMLElement>('[data-lightbox] button')]
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (!document.querySelector('[data-lightbox]')) previouslyFocused?.focus?.()
    }
  }, [open, index, items.length, onIndex])

  const item = open ? items[index!] : null
  const step = (delta: number) => onIndex(((index ?? 0) + delta + items.length) % items.length)

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div
          data-lightbox
          role="dialog"
          aria-modal="true"
          aria-label={item.title ?? item.alt}
          className="fixed inset-0 z-[90] flex flex-col bg-espresso/97 text-cream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-8">
            <p className="text-small tabular text-cream-muted">
              {index! + 1} / {items.length}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => onIndex(null)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line-dark text-cream transition-colors hover:border-champagne hover:text-champagne"
              aria-label="Close viewer"
            >
              <X className="size-5" strokeWidth={1.25} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-24">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={item.src}
                src={sized(item.src, 2000)}
                alt={item.alt}
                className="max-h-full max-w-full object-contain"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              />
            </AnimatePresence>
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute left-3 inline-flex size-12 items-center justify-center rounded-full border border-line-dark bg-espresso/60 transition-colors hover:border-champagne sm:left-8"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="size-5" strokeWidth={1.25} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute right-3 inline-flex size-12 items-center justify-center rounded-full border border-line-dark bg-espresso/60 transition-colors hover:border-champagne sm:right-8"
                  aria-label="Next image"
                >
                  <ArrowRight className="size-5" strokeWidth={1.25} />
                </button>
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-3xl px-6 py-6 text-center">
            {item.category && <p className="text-caption text-champagne">{humanize(item.category)}</p>}
            {item.title && <p className="mt-2 font-display text-2xl">{item.title}</p>}
            {item.description && <p className="mt-2 text-small text-cream-muted">{item.description}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
