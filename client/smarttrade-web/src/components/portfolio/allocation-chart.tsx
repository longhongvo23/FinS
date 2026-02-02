import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { isDarkTheme } from '@/lib/chart-colors'

export interface AllocationItem {
  name: string
  value: number
  percent: number
  color: string
}

interface AllocationChartProps {
  title: string
  data: AllocationItem[]
  type?: 'sector' | 'stock'
}

// Color palette for chart segments
export const CHART_COLORS = [
  '#6366F1', // brand purple
  '#22c55e', // success green
  '#f59e0b', // warning amber
  '#ef4444', // danger red
  '#3b82f6', // info blue
  '#4f92d3', // light blue
  '#9c5cc9', // purple
  '#e68a3a', // orange
  '#d94f68', // pink
  '#3a9986', // teal
]

export function AllocationChart({ title, data, type = 'sector' }: AllocationChartProps) {
  const [bgColor, setBgColor] = useState('#09090B')

  // Update colors when theme changes
  useEffect(() => {
    const updateColor = () => {
      setBgColor(isDarkTheme() ? '#09090B' : '#FFFFFF')
    }
    updateColor()

    // Listen for theme changes via class mutations on documentElement
    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // Calculate pie chart segments
  const segments = useMemo(() => {
    let currentAngle = -90 // Start from top
    return data.map((item, index) => {
      const angle = (item.percent / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      // Calculate SVG arc path
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = 50 + 40 * Math.cos(startRad)
      const y1 = 50 + 40 * Math.sin(startRad)
      const x2 = 50 + 40 * Math.cos(endRad)
      const y2 = 50 + 40 * Math.sin(endRad)

      const largeArc = angle > 180 ? 1 : 0

      return {
        ...item,
        path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      }
    })
  }, [data])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {type === 'sector' ? (
              <BarChart3 className="h-4 w-4" />
            ) : (
              <PieChart className="h-4 w-4" />
            )}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-foreground-muted">
            Chưa có dữ liệu
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {type === 'sector' ? (
            <BarChart3 className="h-4 w-4" />
          ) : (
            <PieChart className="h-4 w-4" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Pie Chart SVG */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-0">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                  stroke={bgColor}
                  strokeWidth="0.5"
                />
              ))}
              {/* Center circle for donut effect */}
              <circle
                cx="50"
                cy="50"
                r="25"
                fill={bgColor}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{data.length}</span>
              <span className="text-xs text-foreground-muted">
                {type === 'sector' ? 'Ngành' : 'Mã'}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {segments.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-foreground-muted">
                    {formatCurrency(item.value)}
                  </span>
                  <Badge variant="secondary" className="font-mono min-w-[50px] justify-center">
                    {item.percent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Bar chart version for sector allocation
export function AllocationBar({ title, data }: { title: string; data: AllocationItem[] }) {
  const maxPercent = Math.max(...data.map((d) => d.percent), 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground-muted font-mono">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-sm font-mono font-semibold w-14 text-right">
                    {item.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.percent / maxPercent) * 100}%`,
                    backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
