import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  badge?: string
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger'
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  badge,
  badgeVariant = 'default',
  actions,
  className,
}: PageHeaderProps) {
  const badgeColors = {
    default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
    success: 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]',
    warning: 'bg-amber-500/10 text-amber-500',
    danger: 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]',
  }

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {title}
            </h1>
            {badge && (
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded',
                  badgeColors[badgeVariant]
                )}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-[13px] text-[var(--color-text-tertiary)]">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

interface PageSectionProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)]',
        className
      )}
    >
      {children}
    </span>
  )
}
