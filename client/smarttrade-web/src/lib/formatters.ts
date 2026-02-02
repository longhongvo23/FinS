// Format number with Vietnamese locale
export function formatNumber(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value == null) return '-'

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Format currency (VND)
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

// Format percentage
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '-'

  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// Format large numbers (e.g., 1.5M, 2.3B)
export function formatCompact(value: number | null | undefined): string {
  if (value == null) return '-'

  const absValue = Math.abs(value)

  if (absValue >= 1e12) {
    return `${(value / 1e12).toFixed(1)}T`
  }
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`
  }
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  }
  if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`
  }

  return formatNumber(value, 0)
}

// Format volume
export function formatVolume(value: number | null | undefined): string {
  if (value == null) return '-'
  return formatCompact(value)
}

// Format date
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  if (!date) return '-'

  const d = new Date(date)

  const optionsMap: Record<'short' | 'long' | 'time', Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
  }

  return new Intl.DateTimeFormat('vi-VN', optionsMap[format]).format(d)
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`

  return formatDate(date, 'short')
}

// Get price color class
export function getPriceColorClass(change: number): string {
  if (change > 0) return 'text-success'
  if (change < 0) return 'text-danger'
  return 'text-warning'
}

// Get price background class
export function getPriceBgClass(change: number): string {
  if (change > 0) return 'bg-success/10'
  if (change < 0) return 'bg-danger/10'
  return 'bg-warning/10'
}
