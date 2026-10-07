import { motion, useReducedMotion } from 'framer-motion'
import { ImageCard } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Feedback'
import type { GalleryImage } from '@/types/models'
import { cn } from '@/utils/format'

/**
 * Editorial composition instead of a uniform grid: a repeating seven-beat layout of large and small
 * frames, offsets and generous white space on desktop; two columns on tablets; one on phones.
 */
const BEATS = [
  'lg:col-span-7 aspect-[4/3]',
  'lg:col-span-4 lg:col-start-9 aspect-[4/5] lg:mt-24',
  'lg:col-span-4 aspect-[3/4]',
  'lg:col-span-4 aspect-[3/4] lg:mt-32',
  'lg:col-span-4 aspect-[3/4] lg:-mt-10',
  'lg:col-span-5 lg:col-start-2 aspect-[4/5]',
  'lg:col-span-6 aspect-[3/2] lg:mt-40',
]

interface EditorialGridProps {
  images: GalleryImage[]
  onOpen: (index: number) => void
  className?: string
}

export function EditorialGrid({ images, onOpen, className }: EditorialGridProps) {
  const reduce = useReducedMotion()
  return (
    <ul className={cn('grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16', className)}>
      {images.map((image, i) => {
        const beat = BEATS[i % BEATS.length]
        const aspect = beat.split(' ').find((c) => c.startsWith('aspect-')) ?? 'aspect-[4/5]'
        const layout = beat.replace(aspect, '').trim()
        return (
          <motion.li
            key={image.id}
            className={layout}
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <ImageCard
              src={image.imageUrl}
              alt={image.description || image.title}
              title={image.title}
              caption={image.description ?? undefined}
              aspect={aspect}
              sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
              onClick={() => onOpen(i)}
            />
          </motion.li>
        )
      })}
    </ul>
  )
}

export function EditorialGridSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const beat = BEATS[i % BEATS.length]
        return <Skeleton key={i} className={cn('w-full', beat)} />
      })}
    </div>
  )
}
