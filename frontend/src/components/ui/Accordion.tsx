import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '@/utils/format'

interface AccordionItem {
  id: string | number
  title: string
  body: string
}

/** Disclosure list (FAQ). Each row is a button with aria-expanded controlling its panel. */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<string | number | null>(items[0]?.id ?? null)
  const base = useId()
  return (
    <div className={cn('border-t border-espresso', className)}>
      {items.map((item) => {
        const expanded = open === item.id
        const panelId = `${base}-${item.id}`
        return (
          <div key={item.id} className="border-b border-line">
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : item.id)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-xl leading-snug text-ink">{item.title}</span>
                <Plus
                  className={cn('size-5 shrink-0 text-champagne-deep transition-transform duration-500 ease-[var(--ease-out-expo)]', expanded && 'rotate-45')}
                  strokeWidth={1.25}
                  aria-hidden
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={panelId}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 text-ink-muted">{item.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
