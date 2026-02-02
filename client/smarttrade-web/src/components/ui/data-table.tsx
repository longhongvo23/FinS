import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  header: string
  align?: 'left' | 'center' | 'right'
  width?: string
  render?: (value: T[keyof T], row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  className?: string
  compact?: boolean
  striped?: boolean
  hoverable?: boolean
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  className,
  compact = false,
  striped = false,
  hoverable = true,
}: DataTableProps<T>) {
  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part]
      }
      return undefined
    }, obj)
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--color-text-muted)]',
                  compact ? 'py-2 px-3' : 'py-3 px-4',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-[var(--color-border-subtle)] last:border-b-0',
                'transition-colors duration-100',
                onRowClick && 'cursor-pointer',
                hoverable && 'hover:bg-[var(--color-bg-secondary)]',
                striped && rowIndex % 2 === 1 && 'bg-[var(--color-bg-secondary)]/50'
              )}
            >
              {columns.map((col) => {
                const value = getNestedValue(row, String(col.key)) as T[keyof T]
                return (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'text-[13px] text-[var(--color-text-primary)]',
                      compact ? 'py-2 px-3' : 'py-3 px-4',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {col.render ? col.render(value, row) : String(value ?? '-')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Utility components for common cell types

interface PriceCellProps {
  value: number
  currency?: string
}

export function PriceCell({ value, currency = '' }: PriceCellProps) {
  return (
    <span className="font-mono tabular-nums text-[var(--color-text-primary)]">
      {value.toLocaleString()}{currency && ` ${currency}`}
    </span>
  )
}

interface ChangeCellProps {
  value: number
  percent?: number
  showIcon?: boolean
}

export function ChangeCell({ value, percent, showIcon = true }: ChangeCellProps) {
  const isPositive = value >= 0

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
      )}
    >
      {showIcon && (
        isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )
      )}
      <span className="font-mono tabular-nums text-[12px] font-medium">
        {isPositive ? '+' : ''}{value.toLocaleString()}
        {percent !== undefined && ` (${isPositive ? '+' : ''}${percent.toFixed(2)}%)`}
      </span>
    </div>
  )
}

interface PercentCellProps {
  value: number
  colored?: boolean
}

export function PercentCell({ value, colored = true }: PercentCellProps) {
  const isPositive = value >= 0

  return (
    <span
      className={cn(
        'font-mono tabular-nums text-[12px] font-medium',
        colored
          ? isPositive
            ? 'text-[var(--color-positive)]'
            : 'text-[var(--color-negative)]'
          : 'text-[var(--color-text-primary)]'
      )}
    >
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

interface VolumeCellProps {
  value: number
}

export function VolumeCell({ value }: VolumeCellProps) {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`
    return vol.toString()
  }

  return (
    <span className="font-mono tabular-nums text-[12px] text-[var(--color-text-secondary)]">
      {formatVolume(value)}
    </span>
  )
}

interface SymbolCellProps {
  symbol: string
  name?: string
  exchange?: string
}

export function SymbolCell({ symbol, name, exchange }: SymbolCellProps) {
  return (
    <div className="flex items-center gap-2">
      <div>
        <span className="font-semibold text-[var(--color-text-primary)]">{symbol}</span>
        {exchange && (
          <span className="text-[9px] tracking-wider text-[var(--color-text-muted)] uppercase ml-1.5">
            {exchange}
          </span>
        )}
        {name && (
          <p className="text-[11px] text-[var(--color-text-tertiary)] truncate max-w-[150px]">
            {name}
          </p>
        )}
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'neutral'
  label: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = {
    success: 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]',
    warning: 'bg-amber-500/10 text-amber-500',
    danger: 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]',
    neutral: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  }

  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded',
        colors[status]
      )}
    >
      {label}
    </span>
  )
}
