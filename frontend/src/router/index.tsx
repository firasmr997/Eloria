import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { PublicLayout } from '@/layouts/PublicLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { RequireAuth } from './RequireAuth'
import { RouteError } from './RouteError'

/** Code-split pages: each route downloads its own chunk on first visit. */
const page = (loader: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await loader()).default })

const publicPages: RouteObject[] = [
  { index: true, lazy: page(() => import('@/pages/public/HomePage')) },
  { path: 'treatments', lazy: page(() => import('@/pages/public/TreatmentsPage')) },
  { path: 'treatments/:id', lazy: page(() => import('@/pages/public/TreatmentDetailPage')) },
  { path: 'results', lazy: page(() => import('@/pages/public/ResultsPage')) },
  { path: 'gallery', lazy: page(() => import('@/pages/public/GalleryPage')) },
  { path: 'gallery/center', lazy: page(() => import('@/pages/public/GalleryPage')) },
  { path: 'about', lazy: page(() => import('@/pages/public/AboutPage')) },
  { path: 'team', lazy: page(() => import('@/pages/public/TeamPage')) },
  { path: 'team/:slug', lazy: page(() => import('@/pages/public/TeamPage')) },
  { path: 'contact', lazy: page(() => import('@/pages/public/ContactPage')) },
  { path: 'book', lazy: page(() => import('@/pages/public/BookPage')) },
  { path: 'privacy', lazy: page(() => import('@/pages/public/PrivacyPage')) },
  { path: 'terms', lazy: page(() => import('@/pages/public/TermsPage')) },
  { path: '*', lazy: page(() => import('@/pages/public/NotFoundPage')) },
]

const adminPages: RouteObject[] = [
  { index: true, lazy: page(() => import('@/pages/admin/DashboardPage')) },
  { path: 'treatments', lazy: page(() => import('@/pages/admin/TreatmentsAdminPage')) },
  { path: 'treatments/new', lazy: page(() => import('@/pages/admin/TreatmentEditPage')) },
  { path: 'treatments/:id', lazy: page(() => import('@/pages/admin/TreatmentEditPage')) },
  { path: 'categories', lazy: page(() => import('@/pages/admin/CategoriesAdminPage')) },
  { path: 'gallery', lazy: page(() => import('@/pages/admin/GalleryAdminPage')) },
  { path: 'results', lazy: page(() => import('@/pages/admin/ResultsAdminPage')) },
  { path: 'team', lazy: page(() => import('@/pages/admin/TeamAdminPage')) },
  { path: 'appointments', lazy: page(() => import('@/pages/admin/AppointmentsAdminPage')) },
  { path: 'messages', lazy: page(() => import('@/pages/admin/MessagesAdminPage')) },
  { path: 'settings', lazy: page(() => import('@/pages/admin/SettingsAdminPage')) },
  { path: '*', lazy: page(() => import('@/pages/admin/AdminNotFoundPage')) },
]

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/admin/login', lazy: page(() => import('@/pages/admin/LoginPage')) },
      {
        path: '/admin',
        lazy: async () => {
          const { AdminLayout } = await import('@/layouts/AdminLayout')
          return {
            Component: () => (
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            ),
          }
        },
        children: adminPages,
      },
      { path: '/', element: <PublicLayout />, children: publicPages },
    ],
  },
]

export function createRouter() {
  return createBrowserRouter(routes)
}
