import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/utils/format'
import { srcSet } from '@/utils/image'

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined
  alt: string
  /** CSS sizes hint for the browser's srcset choice. */
  sizes?: string
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean
  /** Classes for the wrapper that holds the placeholder ground. */
  frameClassName?: string
}

/**
 * Lazy, responsive image on a travertine placeholder ground. Fades in once decoded; a broken or missing
 * source falls back to the ground with the monogram ring rather than a browser broken-image icon.
 */
export function SmartImage({ src, alt, sizes = '100vw', priority, className, frameClassName, ...rest }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn('relative overflow-hidden bg-travertine', frameClassName)}>
      {src && !failed ? (
        <img
          src={src}
          srcSet={srcSet(src)}
          sizes={srcSet(src) ? sizes : undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'size-full object-cover transition-[opacity,filter] duration-1000 ease-[var(--ease-silk)]',
            loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
            className,
          )}
          {...rest}
        />
      ) : (
        <div className="flex size-full items-center justify-center" role="img" aria-label={alt}>
          <svg viewBox="0 0 64 64" className="size-12 opacity-60" aria-hidden>
            <circle cx="32" cy="32" r="30" fill="none" stroke="var(--color-champagne)" strokeWidth="1" />
          </svg>
        </div>
      )}
    </div>
  )
}
