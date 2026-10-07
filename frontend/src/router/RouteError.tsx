import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Monogram } from '@/components/brand/Logo'

/** Last-resort screen for errors thrown while rendering or loading a route chunk (e.g. after a deploy). */
export function RouteError() {
  const error = useRouteError()
  const chunkFailed = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message)
  const status = isRouteErrorResponse(error) ? error.status : null
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-6 text-center">
      <Monogram className="size-20" />
      <h1 className="mt-10 text-h2">{status === 404 ? 'This page does not exist.' : 'Something went wrong.'}</h1>
      <p className="mt-4 max-w-md text-ink-muted">
        {chunkFailed
          ? 'The site has just been updated. Reload the page to continue.'
          : 'Please reload the page. If the problem continues, contact us by phone.'}
      </p>
      <div className="mt-10 flex gap-6">
        <button type="button" onClick={() => window.location.reload()} className="text-button border-b border-current pb-1.5">
          Reload
        </button>
        <Link to="/" className="text-button border-b border-current pb-1.5">
          Home
        </Link>
      </div>
    </main>
  )
}
