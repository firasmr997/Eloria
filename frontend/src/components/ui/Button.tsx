import { ArrowRight, LoaderCircle } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/utils/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-light' | 'danger' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: Variant
  size?: Size
  /** Shows the travelling arrow used on calls to action. */
  arrow?: boolean
  icon?: ReactNode
  loading?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }
type LinkProps = CommonProps & { to: string; href?: undefined; onClick?: () => void; 'aria-label'?: string }
type AnchorProps = CommonProps & { href: string; to?: undefined; target?: string; rel?: string; 'aria-label'?: string }

const variants: Record<Variant, string> = {
  primary: 'bg-espresso text-ivory hover:bg-espresso-raised border border-espresso',
  secondary: 'border border-espresso/70 text-espresso hover:border-espresso hover:bg-espresso hover:text-ivory',
  ghost: 'text-espresso hover:text-champagne-deep px-0! border-b border-current rounded-none',
  light: 'bg-ivory text-espresso border border-ivory hover:bg-porcelain',
  'outline-light': 'border border-cream/50 text-cream hover:border-cream hover:bg-cream hover:text-espresso',
  danger: 'bg-error text-ivory border border-error hover:brightness-110',
  quiet: 'text-ink-muted hover:text-ink hover:bg-ink/5 border border-transparent',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 gap-2',
  md: 'h-12 px-6 gap-3',
  lg: 'h-14 px-8 gap-3.5',
}

function classes({ variant = 'primary', size = 'md', className }: CommonProps) {
  return cn(
    'group relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-xs text-button',
    'transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-silk)]',
    'active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    variant === 'ghost' ? 'h-auto pb-1.5' : sizes[size],
    className,
  )
}

function Content({ arrow, icon, loading, children }: CommonProps) {
  return (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
          strokeWidth={1.5}
          aria-hidden
        />
      )}
    </>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant, size, arrow, icon, loading, className, children, type = 'button', disabled, ...rest } = props
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes({ variant, size, className, children })}
      {...rest}
    >
      <Content arrow={arrow} icon={icon} loading={loading}>
        {children}
      </Content>
    </button>
  )
})

export function ButtonLink(props: LinkProps | AnchorProps) {
  const { variant, size, arrow, icon, className, children } = props
  const content = (
    <Content arrow={arrow} icon={icon}>
      {children}
    </Content>
  )
  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} onClick={props.onClick} aria-label={props['aria-label']} className={classes({ variant, size, className, children })}>
        {content}
      </Link>
    )
  }
  const anchor = props as AnchorProps
  return (
    <a href={anchor.href} target={anchor.target} rel={anchor.rel} aria-label={anchor['aria-label']} className={classes({ variant, size, className, children })}>
      {content}
    </a>
  )
}
