import { Link } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { FacebookIcon, InstagramIcon, PinterestIcon } from '@/components/brand/SocialIcons'
import { fullAddress, useSettings } from '@/context/SettingsContext'
import { disclaimer, navigation } from '@/data/content'
import { useQuery } from '@/hooks/useQuery'
import { categoryService } from '@/services/categoryService'

export function Footer() {
  const { settings } = useSettings()
  const { data: categories } = useQuery('categories:public', (signal) => categoryService.list(signal), { staleTime: 5 * 60_000 })
  const address = fullAddress(settings)
  const socials = [
    { href: settings.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { href: settings.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.pinterestUrl, label: 'Pinterest', Icon: PinterestIcon },
  ].filter((s) => s.href)

  const heading = 'mb-5 text-caption text-champagne'
  const link = 'text-cream-muted transition-colors hover:text-cream'

  return (
    <footer className="grain-dark text-cream" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="shell pt-24 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" withDescriptor className="w-56" />
            <p className="mt-8 max-w-sm text-small text-cream-muted">
              Aesthetic medicine and skin care in Paris. Every treatment begins with a consultation and is planned with a qualified specialist.
            </p>
            {socials.length > 0 && (
              <ul className="mt-8 flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} (opens in a new tab)`}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-line-dark text-cream-muted transition-colors hover:border-champagne hover:text-champagne"
                    >
                      <Icon className="size-[1.125rem]" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Treatments" className="lg:col-span-2">
            <p className={heading}>Treatments</p>
            <ul className="space-y-3 text-small">
              {(categories ?? []).map((c) => (
                <li key={c.id}>
                  <Link to={`/treatments?category=${c.slug}`} className={link}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/treatments" className={link}>
                  All treatments
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Explore" className="lg:col-span-2">
            <p className={heading}>Explore</p>
            <ul className="space-y-3 text-small">
              {navigation.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/book" className={link}>
                  Book a consultation
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <p className={heading}>Opening hours</p>
            <dl className="space-y-3 text-small">
              {settings.openingHours.map((h) => (
                <div key={h.label}>
                  <dt className="text-cream">{h.label}</dt>
                  <dd className="text-cream-muted tabular">{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <address className="not-italic lg:col-span-2">
            <p className={heading}>Visit</p>
            <div className="space-y-3 text-small">
              {address && <p className="text-cream-muted">{address}</p>}
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className={`block tabular ${link}`}>
                  {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className={`block break-all ${link}`}>
                  {settings.email}
                </a>
              )}
            </div>
          </address>
        </div>

        <p className="mt-20 max-w-3xl text-[0.8125rem] leading-relaxed text-cream-muted">{disclaimer.long}</p>

        <div className="mt-10 flex flex-col gap-4 border-t border-line-dark pt-8 text-[0.8125rem] text-cream-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ÉLORIA AESTHETIC. All rights reserved.</p>
          <ul className="flex gap-6">
            <li>
              <Link to="/privacy" className={link}>
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className={link}>
                Terms
              </Link>
            </li>
            <li>
              <Link to="/admin" className={link}>
                Staff
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
