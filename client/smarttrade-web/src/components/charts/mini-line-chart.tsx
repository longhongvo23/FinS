import { useRef, useEffect, useMemo } from 'react'
import { createChart, LineData, IChartApi } from 'lightweight-charts'
import { cn } from '@/lib/utils'
import { getMiniChartColor } from '@/lib/chart-colors'

interface MiniLineChartProps {
  data: { time: string; value: number }[]
  color?: 'success' | 'danger' | 'brand'
  height?: number
  className?: string
}

export function MiniLineChart({
  data,
  color = 'brand',
  height = 40,
  className,
}: MiniLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  // Ensure data is sorted and deduplicated
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Sort by time ascending
    const sorted = [...data].sort((a, b) => a.time.localeCompare(b.time))

    // Remove duplicates (keep last value for each time)
    const uniqueMap = new Map<string, number>()
    sorted.forEach(item => uniqueMap.set(item.time, item.value))

    return Array.from(uniqueMap.entries()).map(([time, value]) => ({ time, value }))
  }, [data])

  useEffect(() => {
    if (!containerRef.current || processedData.length === 0) return

    const lineColor = getMiniChartColor(color)

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
      handleScale: false,
      handleScroll: false,
    })

    const lineSeries = chart.addLineSeries({
      color: lineColor,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    lineSeries.setData(processedData as LineData[])
    chart.timeScale().fitContent()

    chartRef.current = chart
    let isDisposed = false

    const handleResize = () => {
      if (containerRef.current && !isDisposed && chartRef.current) {
        chart.resize(containerRef.current.clientWidth, height)
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
  }, [processedData, color, height])

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{ height }}
    />
  )
}
