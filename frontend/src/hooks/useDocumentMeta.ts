import { useEffect } from 'react'

const SITE = 'ÉLORIA AESTHETIC'
const DEFAULT_DESCRIPTION =
  'Aesthetic medicine and skin care in Paris 8e. Consultation-first facials, laser, body and anti-aging treatments, planned with a qualified specialist.'

interface Meta {
  title?: string
  description?: string
  image?: string | null
  /** Treatment pages describe a service; everything else is a website page. */
  type?: 'website' | 'article'
  noindex?: boolean
  /** JSON-LD object for structured data. */
  structuredData?: object
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function absolute(url: string) {
  try {
    return new URL(url, window.location.origin).href
  } catch {
    return url
  }
}

/** Dynamic title, description, Open Graph, canonical URL and optional JSON-LD for each route. */
export function useDocumentMeta({ title, description, image, type = 'website', noindex, structuredData }: Meta) {
  // Compared by value so callers can pass object literals.
  const jsonLd = structuredData ? JSON.stringify(structuredData) : null
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE}` : `${SITE} · Aesthetic medicine & skin care in Paris`
    const desc = description || DEFAULT_DESCRIPTION
    const url = window.location.origin + window.location.pathname
    const ogImage = absolute(image || '/brand/og-image.jpg')

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', ogImage)
    setMeta('property', 'og:site_name', SITE)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', ogImage)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.route = 'true'
      script.textContent = jsonLd
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, image, type, noindex, jsonLd])
}
