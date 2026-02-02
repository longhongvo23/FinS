import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface RangeSliderProps {
  label: string
  minValue?: number
  maxValue?: number
  onMinChange: (value: number | undefined) => void
  onMaxChange: (value: number | undefined) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  formatValue?: (value: number) => string
  parseValue?: (value: string) => number
  placeholder?: { min?: string; max?: string }
  debounceMs?: number
}

export function RangeSlider({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  prefix = '',
  suffix = '',
  formatValue = (v) => v.toLocaleString('vi-VN'),
  parseValue = (v) => parseFloat(v.replace(/[,.]/g, '')),
  placeholder = { min: 'Từ', max: 'Đến' },
  debounceMs = 300,
}: RangeSliderProps) {
  const [localMin, setLocalMin] = useState<string>(
    minValue !== undefined ? formatValue(minValue) : ''
  )
  const [localMax, setLocalMax] = useState<string>(
    maxValue !== undefined ? formatValue(maxValue) : ''
  )

  // Sync with external values
  useEffect(() => {
    setLocalMin(minValue !== undefined ? formatValue(minValue) : '')
  }, [minValue, formatValue])

  useEffect(() => {
    setLocalMax(maxValue !== undefined ? formatValue(maxValue) : '')
  }, [maxValue, formatValue])

  // Debounced handlers
  const debouncedMinChange = useCallback(
    debounce((value: string) => {
      if (value === '') {
        onMinChange(undefined)
      } else {
        const parsed = parseValue(value)
        if (!isNaN(parsed)) {
          onMinChange(parsed)
        }
      }
    }, debounceMs),
    [onMinChange, parseValue, debounceMs]
  )

  const debouncedMaxChange = useCallback(
    debounce((value: string) => {
      if (value === '') {
        onMaxChange(undefined)
      } else {
        const parsed = parseValue(value)
        if (!isNaN(parsed)) {
          onMaxChange(parsed)
        }
      }
    }, debounceMs),
    [onMaxChange, parseValue, debounceMs]
  )

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,\-]/g, '')
    setLocalMin(value)
    debouncedMinChange(value)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,\-]/g, '')
    setLocalMax(value)
    debouncedMaxChange(value)
  }

  return (
    <div className="space-y-2">
      <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-muted)]">
              {prefix}
            </span>
          )}
          <Input
            type="text"
            value={localMin}
            onChange={handleMinChange}
            placeholder={placeholder.min}
            className={cn(
              'h-8 text-[12px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]',
              'focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]/20',
              prefix && 'pl-8'
            )}
          />
          {suffix && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-muted)]">
              {suffix}
            </span>
          )}
        </div>
        <span className="text-[12px] text-[var(--color-text-muted)]">—</span>
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-muted)]">
              {prefix}
            </span>
          )}
          <Input
            type="text"
            value={localMax}
            onChange={handleMaxChange}
            placeholder={placeholder.max}
            className={cn(
              'h-8 text-[12px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]',
              'focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]/20',
              prefix && 'pl-8'
            )}
          />
          {suffix && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--color-text-muted)]">
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Debounce utility
function debounce<T extends (...args: string[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
