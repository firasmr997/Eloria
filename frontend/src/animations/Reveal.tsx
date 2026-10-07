import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: ReactNode
  delay?: number
  /** Travel distance in px. */
  y?: number
  as?: 'div' | 'li' | 'section' | 'figure'
}

/**
 * Scroll reveal: rises, sharpens and fades in once, the first time it enters the viewport.
 * Content is laid out immediately (no layout shift) and appears instantly under reduced motion.
 */
export function Reveal({ children, delay = 0, y = 28, as = 'div', ...rest }: RevealProps) {
  const reduce = useReducedMotion()
  // Same props for every tag we allow; typed as div to keep one prop surface.
  const Component = motion[as] as typeof motion.div
  return (
    <Component
      initial={reduce ? false : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, delay, ease: [0.22, 0.61, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Component>
  )
}

/** Staggers its direct <RevealItem> children. */
export function RevealGroup({ children, className, stagger = 0.09 }: { children: ReactNode; className?: string; stagger?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26, filter: 'blur(5px)' },
        shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.22, 0.61, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}
