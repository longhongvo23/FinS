import { useEffect, useRef, useMemo, useState } from 'react'
import { createChart, IChartApi, LineData, Time, LineStyle } from 'lightweight-charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/lib/formatters'
import { getChartColors } from '@/lib/chart-colors'

export interface PerformanceData {
  time: string
  portfolio: number
  benchmark: number
}

interface PerformanceChartProps {
  data: PerformanceData[]
  benchmarkName?: string
  height?: number
}

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '1W', value: '1W' },
  { label: '1T', value: '1M' },
  { label: '3T', value: '3M' },
  { label: '6T', value: '6M' },
  { label: '1N', value: '1Y' },
  { label: 'YTD', value: 'YTD' },
  { label: 'Tất cả', value: 'ALL' },
]

export function PerformanceChart({
  data,
  benchmarkName = 'VN-Index',
  height = 300,
}: PerformanceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3M')

  // Filter data based on selected range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    const now = new Date()
    let startDate: Date

    switch (selectedRange) {
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '1M':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case '3M':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case '6M':
        startDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case '1Y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'ALL':
      default:
        return data
    }

    return data.filter((d) => new Date(d.time) >= startDate)
  }, [data, selectedRange])

  // Calculate performance stats
  const stats = useMemo(() => {
    if (filteredData.length < 2) {
      return { portfolioReturn: 0, benchmarkReturn: 0, alpha: 0 }
    }

    const first = filteredData[0]
    const last = filteredData[filteredData.length - 1]

    const portfolioReturn = ((last.portfolio - first.portfolio) / first.portfolio) * 100
    const benchmarkReturn = ((last.benchmark - first.benchmark) / first.benchmark) * 100
    const alpha = portfolioReturn - benchmarkReturn

    return { portfolioReturn, benchmarkReturn, alpha }
  }, [filteredData])

  useEffect(() => {
    if (!chartContainerRef.current || filteredData.length === 0) return

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    let isDisposed = false
    const colors = getChartColors()

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: colors.text,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: {
        borderColor: colors.grid,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: colors.crosshair,
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: colors.crosshair,
          width: 1,
          style: LineStyle.Dashed,
        },
      },
    })

    // Normalize data to percentage change from start
    const firstPortfolio = filteredData[0].portfolio
    const firstBenchmark = filteredData[0].benchmark

    // Portfolio line
    const portfolioSeries = chart.addLineSeries({
      color: '#6366F1',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price >= 0 ? '+' : ''}${price.toFixed(2)}%`,
      },
    })

    const portfolioData: LineData[] = filteredData.map((d) => ({
      time: d.time as Time,
      value: ((d.portfolio - firstPortfolio) / firstPortfolio) * 100,
    }))

    portfolioSeries.setData(portfolioData)

    // Benchmark line
    const benchmarkSeries = chart.addLineSeries({
      color: '#71717A',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price >= 0 ? '+' : ''}${price.toFixed(2)}%`,
      },
    })

    const benchmarkData: LineData[] = filteredData.map((d) => ({
      time: d.time as Time,
      value: ((d.benchmark - firstBenchmark) / firstBenchmark) * 100,
    }))

    benchmarkSeries.setData(benchmarkData)

    // Zero line
    const zeroLine = chart.addLineSeries({
      color: colors.grid,
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    zeroLine.setData(
      filteredData.map((d) => ({
        time: d.time as Time,
        value: 0,
      }))
    )

    chart.timeScale().fitContent()
    chartRef.current = chart

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && !isDisposed) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      isDisposed = true
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [filteredData, height])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Hiệu suất danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-foreground-muted">
            Chưa có dữ liệu hiệu suất
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Hiệu suất danh mục
          </CardTitle>
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-xs text-foreground-muted">Danh mục</span>
            </div>
            <p
              className={cn(
                'text-lg font-bold font-mono',
                stats.portfolioReturn >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {stats.portfolioReturn >= 0 ? '+' : ''}
              {formatPercent(stats.portfolioReturn)}
            </p>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-foreground-muted" />
              <span className="text-xs text-foreground-muted">{benchmarkName}</span>
            </div>
            <p
              className={cn(
                'text-lg font-bold font-mono',
                stats.benchmarkReturn >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {stats.benchmarkReturn >= 0 ? '+' : ''}
              {formatPercent(stats.benchmarkReturn)}
            </p>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {stats.alpha >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-danger" />
              )}
              <span className="text-xs text-foreground-muted">Alpha</span>
            </div>
            <p
              className={cn(
                'text-lg font-bold font-mono',
                stats.alpha >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {stats.alpha >= 0 ? '+' : ''}
              {formatPercent(stats.alpha)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div ref={chartContainerRef} className="w-full" />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-brand rounded" />
            <span className="text-sm text-foreground-muted">Danh mục</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-foreground-muted rounded border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-sm text-foreground-muted">{benchmarkName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
