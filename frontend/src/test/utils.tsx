import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, Outlet, RouterProvider, type RouteObject } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import type { Page } from '@/types/api'

/** Renders a page inside a memory router with the app's providers. */
interface RenderRouteOptions {
  path?: string
  url?: string
  extra?: RouteObject[]
}

export function renderRoute(element: ReactElement, { path = '/', url, extra = [] }: RenderRouteOptions = {}) {
  const router = createMemoryRouter(
    [
      {
        element: (
          <AuthProvider>
            <ToastProvider>
              <OutletShim />
            </ToastProvider>
          </AuthProvider>
        ),
        children: [{ path, element }, ...extra],
      },
    ],
    { initialEntries: [url ?? path] },
  )
  return { router, ...render(<RouterProvider router={router} />) }
}

function OutletShim() {
  return <Outlet />
}

export function page<T>(content: T[], overrides: Partial<Page<T>> = {}): Page<T> {
  return { content, page: 0, size: 12, totalElements: content.length, totalPages: 1, first: true, last: true, ...overrides }
}
