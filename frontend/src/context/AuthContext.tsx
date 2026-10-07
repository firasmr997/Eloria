import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { onUnauthorized } from '@/api/client'
import { authService } from '@/services/authService'
import type { AuthSession, User } from '@/types/models'
import { tokenStorage } from '@/utils/tokenStorage'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  logout: (reason?: 'expired' | 'manual') => void
  /** Set when the last sign-out happened because the session expired. */
  sessionExpired: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => tokenStorage.get())
  const [sessionExpired, setSessionExpired] = useState(false)

  const logout = useCallback((reason: 'expired' | 'manual' = 'manual') => {
    tokenStorage.clear()
    setSession(null)
    setSessionExpired(reason === 'expired')
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const next = await authService.login(email, password)
    tokenStorage.set(next)
    setSession(next)
    setSessionExpired(false)
    return next.user
  }, [])

  // Sign out when the API rejects the token, and when the token reaches its expiry time.
  useEffect(() => onUnauthorized(() => logout('expired')), [logout])
  useEffect(() => {
    if (!session) return
    const remaining = new Date(session.expiresAt).getTime() - Date.now()
    const timer = window.setTimeout(() => logout('expired'), Math.max(0, Math.min(remaining, 2 ** 31 - 1)))
    return () => window.clearTimeout(timer)
  }, [session, logout])

  const value = useMemo<AuthContextValue>(
    () => ({ user: session?.user ?? null, isAuthenticated: !!session, login, logout, sessionExpired }),
    [session, login, logout, sessionExpired],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
