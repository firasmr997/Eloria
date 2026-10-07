/**
 * Responsive image helpers. Unsplash placeholders are resized by URL; uploads and local files are served as-is.
 * Replacing placeholder photography never requires touching components: change the URL in the admin or in
 * src/data/media.ts and these helpers adapt.
 */
const UNSPLASH = 'images.unsplash.com'

function withWidth(url: string, width: number): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('w', String(width))
    const h = parsed.searchParams.get('h')
    const w0 = Number(new URL(url).searchParams.get('w'))
    if (h && w0) parsed.searchParams.set('h', String(Math.round((Number(h) * width) / w0)))
    parsed.searchParams.set('auto', 'format')
    return parsed.href
  } catch {
    return url
  }
}

export function isResizable(url: string | null | undefined): url is string {
  return !!url && url.includes(UNSPLASH)
}

/** A srcset across sensible widths for resizable sources, or undefined. */
export function srcSet(url: string | null | undefined, widths = [480, 800, 1200, 1600, 2000]): string | undefined {
  if (!isResizable(url)) return undefined
  return widths.map((w) => `${withWidth(url, w)} ${w}w`).join(', ')
}

/** The source at a given width (thumbnails in the admin, lightbox full size). */
export function sized(url: string | null | undefined, width: number): string {
  if (!url) return ''
  return isResizable(url) ? withWidth(url, width) : url
}
