import { Link } from 'react-router'
import { LinkedinIcon, InstagramIcon } from '@/components/brand/SocialIcons'
import { Skeleton } from '@/components/ui/Feedback'
import { Modal } from '@/components/ui/Modal'
import { SmartImage } from '@/components/ui/SmartImage'
import { ButtonLink } from '@/components/ui/Button'
import type { Specialist } from '@/types/models'
import { cn } from '@/utils/format'

/** Portrait, name, position and expertise. Opens the specialist's profile. */
export function SpecialistCard({ specialist, className }: { specialist: Specialist; className?: string }) {
  const s = specialist
  return (
    <article className={cn('group relative', className)}>
      <div className="overflow-hidden">
        <SmartImage
          src={s.photo}
          alt={`Portrait of ${s.name}`}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          frameClassName="aspect-[4/5]"
          className="grayscale-[35%] transition-[transform,filter] duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:grayscale-0"
        />
      </div>
      <h3 className="mt-5 font-display text-2xl leading-tight text-ink">
        <Link to={`/team/${s.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none" preventScrollReset>
          {s.name}
        </Link>
      </h3>
      <p className="mt-1 text-small text-ink-muted">{s.role}</p>
      {s.specialties.length > 0 && <p className="mt-3 text-caption text-champagne-deep">{s.specialties.slice(0, 2).join(' · ')}</p>}
      <span className="pointer-events-none absolute -inset-2 rounded-xs ring-champagne-deep ring-offset-2 group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  )
}

export function SpecialistCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-5 h-6 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  )
}

/** Full profile in a dialog: portrait, biography, experience, specialties and links. */
export function SpecialistProfile({ specialist, onClose }: { specialist: Specialist | null; onClose: () => void }) {
  const s = specialist
  return (
    <Modal open={!!s} onClose={onClose} title={s?.name ?? ''} description={s?.role} size="lg">
      {s && (
        <div className="grid gap-8 sm:grid-cols-[minmax(0,15rem)_1fr]">
          <SmartImage src={s.photo} alt={`Portrait of ${s.name}`} frameClassName="aspect-[4/5]" sizes="15rem" />
          <div>
            {s.experience && <p className="text-caption text-champagne-deep">{s.experience}</p>}
            <p className="mt-4 leading-relaxed text-ink">{s.bio}</p>
            {s.specialties.length > 0 && (
              <>
                <p className="mt-8 text-caption text-ink-muted">Specialties</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {s.specialties.map((sp) => (
                    <li key={sp} className="border border-line-strong px-3 py-1.5 text-small">
                      {sp}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink to="/book" arrow size="sm" className="h-10">
                Book a consultation
              </ButtonLink>
              {s.socialLinks.instagram && (
                <a href={s.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${s.name} on Instagram (opens in a new tab)`} className="text-ink-muted hover:text-ink">
                  <InstagramIcon className="size-5" />
                </a>
              )}
              {s.socialLinks.linkedin && (
                <a href={s.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${s.name} on LinkedIn (opens in a new tab)`} className="text-ink-muted hover:text-ink">
                  <LinkedinIcon className="size-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
