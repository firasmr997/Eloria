import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useUtilities'
import { cn } from '@/utils/format'

const PearlScene = lazy(() => import('./PearlScene'))

/** WebGL can be unavailable (old devices, blocked GPU): the pearl is decorative, so fail silently. */
class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

interface PearlProps {
  className?: string
  /**
   * Milliseconds to wait before downloading and parsing the 3D chunk. Three.js parsing blocks the main
   * thread; deferring it keeps the splash and the hero entrance smooth, then the pearl fades in.
   */
  deferMs?: number
}

/**
 * The glass pearl, the site's one 3D object. Loads its chunk late and lazily, renders only while on
 * screen, uses lighter geometry on small screens and holds a single still frame under reduced motion.
 */
export function Pearl({ className, deferMs = 0 }: PearlProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [armed, setArmed] = useState(deferMs === 0)
  const [ready, setReady] = useState(false)
  const [supported] = useState(() => typeof document !== 'undefined' && webglAvailable())
  const reduce = usePrefersReducedMotion()
  const small = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    if (armed) return
    const timer = window.setTimeout(() => {
      // Prefer an idle moment after the delay, but never wait more than another second.
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => setArmed(true), { timeout: 1000 })
      else setArmed(true)
    }, deferMs)
    return () => window.clearTimeout(timer)
  }, [armed, deferMs])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '120px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('pointer-events-none transition-[opacity,transform] duration-[1400ms] ease-[var(--ease-out-expo)]', ready ? 'scale-100 opacity-100' : 'scale-90 opacity-0', className)}
      aria-hidden
    >
      {supported && armed && (
        <SilentBoundary>
          <Suspense fallback={null}>
            <PearlScene frameloop={reduce ? 'demand' : visible ? 'always' : 'never'} lite={small} still={reduce} onReady={() => setReady(true)} />
          </Suspense>
        </SilentBoundary>
      )}
    </div>
  )
}
