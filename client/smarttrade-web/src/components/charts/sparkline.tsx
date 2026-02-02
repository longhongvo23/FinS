import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
  strokeWidth?: number
  showArea?: boolean
  /** Override color based on external value (e.g., changePercent >= 0) */
  isPositive?: boolean
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  className,
  strokeWidth = 1.5,
  showArea = true,
  isPositive: isPositiveProp,
}: SparklineProps) {
  const { path, areaPath, autoIsPositive } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', autoIsPositive: true }
    }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + (1 - (value - min) / range) * chartHeight
      return { x, y }
    })

    // Create path
    const pathD = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ')

    // Create area path
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(2)} ${height - padding} L ${padding} ${height - padding} Z`

    // Auto-detect if trend is positive (last > first)
    const positive = data[data.length - 1] >= data[0]

    return { path: pathD, areaPath: areaD, autoIsPositive: positive }
  }, [data, width, height])

  // Use prop if provided, otherwise use auto-detected value
  const isPositive = isPositiveProp !== undefined ? isPositiveProp : autoIsPositive

  if (!data || data.length < 2) {
    return <div className={cn('flex items-center justify-center text-foreground-muted text-xs', className)}>-</div>
  }

  const strokeColor = isPositive ? '#22c55e' : '#ef4444'
  const fillColor = isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'

  return (
    <svg
      width={width}
      height={height}
      className={cn('flex-shrink-0', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {showArea && (
        <path
          d={areaPath}
          fill={fillColor}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
