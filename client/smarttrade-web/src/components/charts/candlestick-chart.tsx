import { useRef, useEffect, useState } from 'react'
import {
  createChart,
  IChartApi,
  CandlestickData,
  HistogramData,
  ISeriesApi,
  LineStyle,
  CrosshairMode,
} from 'lightweight-charts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getChartColors } from '@/lib/chart-colors'

export interface OHLCData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CandlestickChartProps {
  data: OHLCData[]
  height?: number
  showMA?: boolean
  showBB?: boolean
  className?: string
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

const timeframes: { value: Timeframe; label: string }[] = [
  { value: '1D', label: '1 ngày' },
  { value: '1W', label: '1 tuần' },
  { value: '1M', label: '1 tháng' },
  { value: '3M', label: '3 tháng' },
  { value: '1Y', label: '1 năm' },
  { value: 'ALL', label: 'Tất cả' },
]

export function CandlestickChart({
  data,
  height = 400,
  showMA: initialShowMA = true,
  showBB: initialShowBB = false,
  className,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const ma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null)
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null)

  const [timeframe, setTimeframe] = useState<Timeframe>('1M')
  const [showMA, setShowMA] = useState(initialShowMA)
  const [showBB, setShowBB] = useState(initialShowBB)

  // Calculate MA
  const calculateMA = (data: OHLCData[], period: number) => {
    const result = []
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close
      }
      result.push({
        time: data[i].time,
        value: sum / period,
      })
    }
    return result
  }

  // Calculate Bollinger Bands
  const calculateBB = (data: OHLCData[], period: number = 20, stdDev: number = 2) => {
    const ma = calculateMA(data, period)
    const upper = []
    const lower = []

    for (let i = 0; i < ma.length; i++) {
      const dataIndex = i + period - 1
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += Math.pow(data[dataIndex - j].close - ma[i].value, 2)
      }
      const std = Math.sqrt(sum / period)

      upper.push({ time: ma[i].time, value: ma[i].value + stdDev * std })
      lower.push({ time: ma[i].time, value: ma[i].value - stdDev * std })
    }

    return { upper, lower }
  }

  // Filter data by timeframe
  const filterDataByTimeframe = (data: OHLCData[], tf: Timeframe) => {
    if (tf === 'ALL') return data

    const now = new Date()
    let startDate: Date

    switch (tf) {
      case '1D':
        startDate = new Date(now.setDate(now.getDate() - 1))
        break
      case '1W':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case '1M':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case '3M':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case '1Y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        return data
    }

    return data.filter((d) => new Date(d.time) >= startDate)
  }

  useEffect(() => {
    if (!containerRef.current) return

    const colors = getChartColors()

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: colors.crosshair,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: colors.crosshair,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: colors.grid,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: colors.up,
      downColor: colors.down,
      borderDownColor: colors.down,
      borderUpColor: colors.up,
      wickDownColor: colors.down,
      wickUpColor: colors.up,
    })

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    // MA lines
    const ma20Series = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    const ma50Series = chart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    // Bollinger Bands
    const bbUpper = chart.addLineSeries({
      color: '#64748b',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    const bbLower = chart.addLineSeries({
      color: '#64748b',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries
    ma20SeriesRef.current = ma20Series
    ma50SeriesRef.current = ma50Series
    bbUpperRef.current = bbUpper
    bbLowerRef.current = bbLower

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
  }, [height])

  // Update data when timeframe or data changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return

    const filteredData = filterDataByTimeframe(data, timeframe)

    // Set candlestick data
    const candleData: CandlestickData[] = filteredData.map((d) => ({
      time: d.time as CandlestickData['time'],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))
    candleSeriesRef.current.setData(candleData)

    // Set volume data
    const volumeData: HistogramData[] = filteredData.map((d) => ({
      time: d.time as HistogramData['time'],
      value: d.volume,
      color: d.close >= d.open ? '#22c55e50' : '#ef444450',
    }))
    volumeSeriesRef.current.setData(volumeData)

    // Update MA
    if (ma20SeriesRef.current && ma50SeriesRef.current) {
      if (showMA && filteredData.length >= 50) {
        ma20SeriesRef.current.setData(calculateMA(filteredData, 20) as never)
        ma50SeriesRef.current.setData(calculateMA(filteredData, 50) as never)
        ma20SeriesRef.current.applyOptions({ visible: true })
        ma50SeriesRef.current.applyOptions({ visible: true })
      } else {
        ma20SeriesRef.current.applyOptions({ visible: false })
        ma50SeriesRef.current.applyOptions({ visible: false })
      }
    }

    // Update BB
    if (bbUpperRef.current && bbLowerRef.current) {
      if (showBB && filteredData.length >= 20) {
        const bb = calculateBB(filteredData)
        bbUpperRef.current.setData(bb.upper as never)
        bbLowerRef.current.setData(bb.lower as never)
        bbUpperRef.current.applyOptions({ visible: true })
        bbLowerRef.current.applyOptions({ visible: true })
      } else {
        bbUpperRef.current.applyOptions({ visible: false })
        bbLowerRef.current.applyOptions({ visible: false })
      }
    }

    chartRef.current?.timeScale().fitContent()
  }, [data, timeframe, showMA, showBB])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Timeframe */}
        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setTimeframe(tf.value)}
            >
              {tf.value}
            </Button>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          <Button
            variant={showMA ? 'secondary' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowMA(!showMA)}
          >
            MA
          </Button>
          <Button
            variant={showBB ? 'secondary' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowBB(!showBB)}
          >
            BB
          </Button>
        </div>
      </div>

      {/* Legend */}
      {showMA && (
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-amber-500" />
            <span className="text-foreground-muted">MA20</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-violet-500" />
            <span className="text-foreground-muted">MA50</span>
          </div>
          {showBB && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-slate-500" style={{ borderStyle: 'dashed' }} />
              <span className="text-foreground-muted">BB(20,2)</span>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  )
}
