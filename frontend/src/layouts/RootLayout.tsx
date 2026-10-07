import { Outlet, ScrollRestoration } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ToastProvider } from '@/context/ToastContext'

/** Providers shared by the public site and the admin dashboard. */
export function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <Outlet />
          <ScrollRestoration getKey={(location) => location.pathname} />
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}
