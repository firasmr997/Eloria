import type { AuthSession } from '@/types/models'

const KEY = 'eloria.session'

/**
 * The staff session lives in sessionStorage: it survives reloads but not closing the tab, which suits a
 * shared reception computer. Reads are defensive because storage can be unavailable (private mode).
 */
export const tokenStorage = {
  get(): AuthSession | null {
    try {
      const raw = window.sessionStorage.getItem(KEY)
      if (!raw) return null
      const session = JSON.parse(raw) as AuthSession
      if (!session.token || new Date(session.expiresAt).getTime() <= Date.now()) {
        window.sessionStorage.removeItem(KEY)
        return null
      }
      return session
    } catch {
      return null
    }
  },
  set(session: AuthSession) {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(session))
    } catch {
      // Storage unavailable: the session lasts for this page view only.
    }
  },
  clear() {
    try {
      window.sessionStorage.removeItem(KEY)
    } catch {
      // ignore
    }
  },
}
