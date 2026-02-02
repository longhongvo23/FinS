import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  trend,
  size = 'md',
  className,
}: StatCardProps) {
  const sizeStyles = {
    sm: {
      padding: 'p-4',
      label: 'text-[9px]',
      value: 'text-lg',
      change: 'text-[11px]',
    },
    md: {
      padding: 'p-5',
      label: 'text-[10px]',
      value: 'text-xl',
      change: 'text-[12px]',
    },
    lg: {
      padding: 'p-6',
      label: 'text-[11px]',
      value: 'text-2xl',
      change: 'text-[13px]',
    },
  }

  const styles = sizeStyles[size]

  return (
    <div
      className={cn(
        'rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]',
        'transition-colors hover:border-[var(--color-border-strong)]',
        styles.padding,
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            'font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)]',
            styles.label
          )}
        >
          {label}
        </span>
        {icon && (
          <div className="text-[var(--color-text-muted)]">{icon}</div>
        )}
      </div>

      <div
        className={cn(
          'font-bold font-mono tabular-nums text-[var(--color-text-primary)]',
          styles.value
        )}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {change !== undefined && (
        <div
          className={cn(
            'flex items-center gap-1.5 mt-2',
            styles.change,
            trend === 'up' && 'text-[var(--color-positive)]',
            trend === 'down' && 'text-[var(--color-negative)]',
            trend === 'neutral' && 'text-[var(--color-text-tertiary)]'
          )}
        >
          {trend === 'up' && <TrendingUp className="h-3 w-3" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3" />}
          {trend === 'neutral' && <Minus className="h-3 w-3" />}
          <span className="font-medium font-mono tabular-nums">
            {change > 0 ? '+' : ''}
            {change.toFixed(2)}%
          </span>
          {changeLabel && (
            <span className="text-[var(--color-text-muted)]">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Compact horizontal stat for inline display
interface StatItemProps {
  label: string
  value: string | number
  positive?: boolean
  mono?: boolean
  className?: string
}

export function StatItem({ label, value, positive, mono = true, className }: StatItemProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-[9px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)]">
        {label}
      </span>
      <span
        className={cn(
          'text-[13px] mt-0.5',
          mono && 'font-mono tabular-nums',
          positive === true && 'text-[var(--color-positive)]',
          positive === false && 'text-[var(--color-negative)]',
          positive === undefined && 'text-[var(--color-text-secondary)]'
        )}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  )
}

// Index Card for market indices
interface IndexCardProps {
  name: string
  value: number
  change: number
  changePercent: number
  className?: string
}

export function IndexCard({ name, value, change, changePercent, className }: IndexCardProps) {
  const isPositive = change >= 0

  return (
    <div
      className={cn(
        'p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]',
        'transition-colors hover:border-[var(--color-border-strong)]',
        className
      )}
    >
      <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-2">
        {name}
      </div>
      <div className="text-lg font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
        {value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
      <div
        className={cn(
          'flex items-center gap-1 text-[12px] font-medium font-mono mt-1',
          isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
        )}
      >
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="tabular-nums">
          {isPositive ? '+' : ''}
          {changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
