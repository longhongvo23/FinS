import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Price Display - Monospace formatted price
interface PriceDisplayProps {
  value: number
  currency?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

export function PriceDisplay({
  value,
  currency = '₫',
  size = 'md',
  className,
}: PriceDisplayProps) {
  const sizeClasses = {
    xs: 'text-[11px]',
    sm: 'text-[12px]',
    md: 'text-[14px]',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }

  return (
    <span
      className={cn(
        'font-mono font-semibold tabular-nums text-[var(--color-text-primary)]',
        sizeClasses[size],
        className
      )}
    >
      {currency}
      {value.toLocaleString()}
    </span>
  )
}

// Change Display - Shows price/percent change with color
interface ChangeDisplayProps {
  value?: number
  percent: number
  showIcon?: boolean
  showValue?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function ChangeDisplay({
  value,
  percent,
  showIcon = true,
  showValue = true,
  size = 'md',
  className,
}: ChangeDisplayProps) {
  const isPositive = percent >= 0
  const isZero = percent === 0

  const sizeClasses = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-[12px]',
    lg: 'text-[14px]',
  }

  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 font-medium font-mono tabular-nums',
        isZero
          ? 'text-[var(--color-text-tertiary)]'
          : isPositive
          ? 'text-[var(--color-positive)]'
          : 'text-[var(--color-negative)]',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && !isZero && (
        isPositive ? (
          <TrendingUp className={iconSizes[size]} />
        ) : (
          <TrendingDown className={iconSizes[size]} />
        )
      )}
      <span>
        {isPositive && percent !== 0 ? '+' : ''}
        {percent.toFixed(2)}%
      </span>
      {showValue && value !== undefined && (
        <span className="text-[var(--color-text-muted)]">
          ({isPositive && value !== 0 ? '+' : ''}₫{Math.abs(value).toLocaleString()})
        </span>
      )}
    </div>
  )
}

// Compact Change Badge - For table cells
interface ChangeBadgeProps {
  percent: number
  size?: 'sm' | 'md'
  className?: string
}

export function ChangeBadge({ percent, size = 'md', className }: ChangeBadgeProps) {
  const isPositive = percent >= 0
  const isZero = percent === 0

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-[11px]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold font-mono tabular-nums rounded',
        isZero
          ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
          : isPositive
          ? 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]'
          : 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]',
        sizeClasses[size],
        className
      )}
    >
      {isPositive && percent !== 0 ? '+' : ''}
      {percent.toFixed(2)}%
    </span>
  )
}

// Volume Display - Formatted volume with K/M/B suffix
interface VolumeDisplayProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function VolumeDisplay({ value, size = 'md', className }: VolumeDisplayProps) {
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`
    return vol.toString()
  }

  const sizeClasses = {
    sm: 'text-[11px]',
    md: 'text-[12px]',
    lg: 'text-[14px]',
  }

  return (
    <span
      className={cn(
        'font-mono tabular-nums text-[var(--color-text-secondary)]',
        sizeClasses[size],
        className
      )}
    >
      {formatVolume(value)}
    </span>
  )
}

// Value Display - Formatted currency value with K/M/B suffix
interface ValueDisplayProps {
  value: number
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ValueDisplay({ value, currency = '₫', size = 'md', className }: ValueDisplayProps) {
  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1e9) return `${(val / 1e9).toFixed(1)}B`
    if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(0)}M`
    if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(0)}K`
    return val.toLocaleString()
  }

  const sizeClasses = {
    sm: 'text-[11px]',
    md: 'text-[12px]',
    lg: 'text-[14px]',
  }

  return (
    <span
      className={cn(
        'font-mono tabular-nums text-[var(--color-text-primary)]',
        sizeClasses[size],
        className
      )}
    >
      {currency}
      {formatValue(value)}
    </span>
  )
}
