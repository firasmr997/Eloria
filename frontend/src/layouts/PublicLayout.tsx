import { motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ScrollTrigger } from '@/animations/gsap'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { SplashScreen } from '@/components/layout/SplashScreen'

/** Public website frame: splash (first visit), header, a soft page transition, footer. */
export function PublicLayout() {
  const location = useLocation()
  const reduce = useReducedMotion()

  // New page, new scroll geometry: let pinned and scrubbed sections recompute.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => window.clearTimeout(id)
  }, [location.pathname])

  return (
    <>
      <SplashScreen />
      <Navbar />
      <motion.main
        id="main"
        // Opening a specialist profile (/team/:slug) is a dialog over the same page, not a new page.
        key={location.pathname.startsWith('/team') ? '/team' : location.pathname}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        className="min-h-dvh"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </>
  )
}
