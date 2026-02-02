/**
 * Chart color utilities that work with both light and dark themes
 */

export function getChartColors() {
  if (typeof window === 'undefined') {
    // Default dark theme colors for SSR
    return {
      up: '#26A69A',
      down: '#EF5350',
      grid: '#363A45',
      text: '#787B86',
      crosshair: '#758696',
      background: 'transparent',
      border: '#2A2E39',
    }
  }

  const root = document.documentElement
  const computedStyle = getComputedStyle(root)

  return {
    up: computedStyle.getPropertyValue('--chart-up').trim() || '#26A69A',
    down: computedStyle.getPropertyValue('--chart-down').trim() || '#EF5350',
    grid: computedStyle.getPropertyValue('--chart-grid').trim() || '#363A45',
    text: computedStyle.getPropertyValue('--chart-text').trim() || '#787B86',
    crosshair: computedStyle.getPropertyValue('--chart-crosshair').trim() || '#758696',
    background: 'transparent',
    border: getComputedHSL('--border'),
  }
}

export function getComputedHSL(variable: string): string {
  if (typeof window === 'undefined') return '#2A2E39'

  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  const value = computedStyle.getPropertyValue(variable).trim()

  if (!value) return '#2A2E39'

  // Value is in "h s% l%" format, convert to hsl()
  return `hsl(${value})`
}

export function isDarkTheme(): boolean {
  if (typeof window === 'undefined') return true
  return document.documentElement.classList.contains('dark')
}

// Mini chart colors (for MiniLineChart)
export function getMiniChartColor(type: 'success' | 'danger' | 'brand'): string {
  const colors = getChartColors()

  switch (type) {
    case 'success':
      return colors.up
    case 'danger':
      return colors.down
    case 'brand':
      return isDarkTheme() ? '#6366F1' : '#2563EB'
    default:
      return colors.up
  }
}
