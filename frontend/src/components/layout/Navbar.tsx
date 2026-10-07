import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { fullAddress, useSettings } from '@/context/SettingsContext'
import { navigation } from '@/data/content'
import { useLockBodyScroll } from '@/hooks/useUtilities'
import { cn } from '@/utils/format'

/**
 * Fixed header. Transparent and tall at the top of the page, then a solid ivory bar with a hairline once
 * the visitor scrolls. On dark heroes (`overDark`) it starts in ivory ink.
 */
export function Navbar({ overDark = false }: { overDark?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  const light = overDark && !scrolled && !open
  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,height] duration-500 ease-[var(--ease-silk)]',
          scrolled ? 'border-b border-line bg-ivory/95' : 'border-b border-transparent bg-transparent',
        )}
      >
        <a
          href="#main"
          className="absolute top-2 left-4 z-10 -translate-y-20 rounded-xs bg-espresso px-4 py-2 text-small text-ivory focus:translate-y-0"
        >
          Skip to content
        </a>
        <div className={cn('shell flex items-center justify-between gap-8 transition-[height] duration-500', scrolled ? 'h-[4.5rem]' : 'h-24')}>
          <Link to="/" className="relative z-[61] shrink-0" aria-label="ÉLORIA AESTHETIC, home">
            {/* Wordmark only: the descriptor would be illegible at header size. */}
            <Logo tone={light || open ? 'light' : 'dark'} className={cn('transition-[width] duration-500', scrolled ? 'w-[7rem]' : 'w-[8.25rem]')} />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={cn('link-underline text-[0.8125rem] font-medium tracking-[0.08em] uppercase transition-colors', light ? 'text-cream' : 'text-ink')}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block">
              <ButtonLink to="/book" variant={light ? 'outline-light' : 'primary'} size="sm" className="h-10" arrow>
                Book consultation
              </ButtonLink>
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                'relative z-[61] inline-flex size-11 items-center justify-center rounded-xs transition-colors lg:hidden',
                light || open ? 'text-cream hover:bg-cream/10' : 'text-ink hover:bg-ink/5',
              )}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="size-6" strokeWidth={1.25} /> : <Menu className="size-6" strokeWidth={1.25} />}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion()
  const { settings } = useSettings()
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          className="grain-dark fixed inset-0 z-[60] flex flex-col overflow-y-auto text-cream lg:hidden"
          initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
          exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center pt-28 pb-10">
            <ul className="flex flex-col gap-2">
              {[{ to: '/', label: 'Home' }, ...navigation].map((item, i) => (
                <motion.li
                  key={item.to}
                  initial={reduce ? false : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn('flex items-baseline gap-4 py-1 font-display text-[2.6rem] leading-tight transition-colors', isActive ? 'text-champagne' : 'text-cream hover:text-champagne-light')
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="mt-10 flex flex-col gap-6 border-t border-line-dark pt-8"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              <ButtonLink to="/book" variant="light" arrow className="w-full sm:w-auto">
                Book a consultation
              </ButtonLink>
              <div className="text-small text-cream-muted">
                {fullAddress(settings) && <p>{fullAddress(settings)}</p>}
                {settings.phone && (
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="mt-1 block text-cream">
                    {settings.phone}
                  </a>
                )}
              </div>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
