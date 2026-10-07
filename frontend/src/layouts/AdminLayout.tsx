import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarClock,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Sparkles,
  SplitSquareHorizontal,
  Tags,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useQuery } from '@/hooks/useQuery'
import { useLockBodyScroll } from '@/hooks/useUtilities'
import { appointmentService, messageService } from '@/services/requestService'
import { cn } from '@/utils/format'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: 'appointments' | 'messages'
}

const NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/treatments', label: 'Treatments', icon: Sparkles },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/results', label: 'Results', icon: SplitSquareHorizontal },
  { to: '/admin/team', label: 'Team', icon: Users },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarClock, badge: 'appointments' },
  { to: '/admin/messages', label: 'Messages', icon: Mail, badge: 'messages' },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

/** Pending requests and unread messages, refreshed every minute. Key prefixes let mutations refresh them. */
function useInboxCounts() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000)
    return () => window.clearInterval(id)
  }, [])
  const pending = useQuery(`appointments:count:${tick}`, (signal) => appointmentService.list({ status: 'PENDING', size: 1 }, signal), { staleTime: 30_000 })
  const unread = useQuery(`messages:count:${tick}`, (signal) => messageService.unreadCount(signal), { staleTime: 30_000 })
  return { appointments: pending.data?.totalElements ?? 0, messages: unread.data?.count ?? 0 }
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const counts = useInboxCounts()
  useLockBodyScroll(open)
  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    document.title = 'Admin · ÉLORIA AESTHETIC'
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'noindex, nofollow'
  }, [location.pathname])

  const signOut = () => {
    logout('manual')
    toast.info('Signed out', 'See you soon.')
    navigate('/admin/login', { replace: true })
  }

  const current = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))

  const sidebar = (
    <div className="grain-dark flex h-full flex-col text-cream">
      <div className="flex h-20 items-center justify-between px-6">
        <Link to="/admin" aria-label="Dashboard">
          <Logo tone="light" withDescriptor className="w-32" />
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="p-2 text-cream-muted hover:text-cream lg:hidden" aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const count = item.badge ? counts[item.badge] : 0
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-11 items-center gap-3 rounded-xs px-3 text-small transition-colors',
                      isActive ? 'bg-espresso-raised text-cream' : 'text-cream-muted hover:bg-espresso-raised/60 hover:text-cream',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute inset-y-2 left-0 w-px bg-champagne" aria-hidden />}
                      <item.icon className={cn('size-[1.125rem]', isActive ? 'text-champagne' : '')} strokeWidth={1.5} aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      {count > 0 && (
                        <span className="min-w-6 rounded-full bg-champagne px-1.5 py-0.5 text-center text-[0.6875rem] font-semibold text-espresso tabular" aria-label={`${count} ${item.badge === 'messages' ? 'unread' : 'pending'}`}>
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t border-line-dark p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-3 rounded-xs px-3 text-small text-cream-muted hover:bg-espresso-raised/60 hover:text-cream">
          <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden /> View website
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <button type="button" onClick={signOut} className="flex h-10 w-full items-center gap-3 rounded-xs px-3 text-small text-cream-muted hover:bg-espresso-raised/60 hover:text-cream">
          <LogOut className="size-4" strokeWidth={1.5} aria-hidden /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-ivory">
      <a href="#admin-main" className="absolute top-2 left-4 z-[70] -translate-y-20 rounded-xs bg-espresso px-4 py-2 text-small text-ivory focus:translate-y-0">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-espresso/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-ivory/95 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="-ml-2 p-2 text-ink lg:hidden" aria-label="Open menu" aria-expanded={open}>
              <Menu className="size-5" />
            </button>
            <p className="text-small text-ink-muted">
              Admin <span className="mx-1.5 text-taupe">/</span>
              <span className="text-ink">{current?.label ?? 'Page'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-small font-semibold text-ink">{user?.name}</p>
              <p className="text-[0.75rem] text-ink-muted">{user?.role === 'ADMIN' ? 'Administrator' : 'Editor'}</p>
            </div>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-espresso font-display text-ivory" aria-hidden>
              {user?.name?.charAt(0) ?? 'É'}
            </span>
          </div>
        </header>
        <main id="admin-main" className="px-4 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
