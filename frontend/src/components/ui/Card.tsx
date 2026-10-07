import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/utils/format'
import { SmartImage } from './SmartImage'

/** A plain porcelain surface with a hairline border. Never nested. */
export function Card({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'article' | 'section' }) {
  return <Tag className={cn('rounded-xs border border-line bg-porcelain', className)}>{children}</Tag>
}

interface ImageCardProps {
  src: string | null | undefined
  alt: string
  title?: string
  caption?: string
  to?: string
  onClick?: () => void
  aspect?: string
  sizes?: string
  className?: string
}

/**
 * A photograph that zooms slowly on hover and reveals its caption from below. Used by the gallery,
 * the center gallery and editorial grids. Clickable either as a link or as a button (lightbox).
 */
export function ImageCard({ src, alt, title, caption, to, onClick, aspect = 'aspect-[4/5]', sizes, className }: ImageCardProps) {
  const body = (
    <>
      <SmartImage
        src={src}
        alt={alt}
        sizes={sizes}
        frameClassName={cn('size-full', aspect)}
        className="transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.045]"
      />
      {(title || caption) && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-espresso/75 via-espresso/25 to-transparent px-5 pt-16 pb-5 text-left text-cream opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-silk)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {title && <span className="block font-display text-xl leading-tight">{title}</span>}
          {caption && <span className="mt-1 block text-small text-cream/80">{caption}</span>}
        </span>
      )}
    </>
  )
  const base = cn('group relative block w-full overflow-hidden', className)
  if (to) {
    return (
      <Link to={to} className={base}>
        {body}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, 'cursor-zoom-in')} aria-label={title ? `Open ${title}` : `Open ${alt}`}>
        {body}
      </button>
    )
  }
  return <figure className={base}>{body}</figure>
}
