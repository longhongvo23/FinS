import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/stores/ui-store'

// TradingView Widget Component for Chart
function TradingViewChart({ trendColor }: { trendColor: 'green' | 'red' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useUIStore()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous content
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: 'NASDAQ:AAPL',
      width: '100%',
      height: '100%',
      locale: 'vi_VN',
      dateRange: '1D',
      colorTheme: isDark ? 'dark' : 'light',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      noTimeScale: false,
      chartOnly: true,
      trendLineColor: trendColor === 'green' ? 'rgba(0, 200, 83, 1)' : 'rgba(255, 23, 68, 1)',
      underLineColor: trendColor === 'green' ? 'rgba(0, 200, 83, 0.3)' : 'rgba(255, 23, 68, 0.3)',
      underLineBottomColor: trendColor === 'green' ? 'rgba(0, 200, 83, 0)' : 'rgba(255, 23, 68, 0)'
    })

    containerRef.current.appendChild(script)
  }, [trendColor, isDark])

  return (
    <div className="tradingview-widget-container h-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  )
}

// TradingView Technical Analysis Widget
function TradingViewAnalysis() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useUIStore()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      interval: '1D',
      width: '100%',
      isTransparent: false,
      height: '100%',
      symbol: 'NASDAQ:AAPL',
      showIntervalTabs: false,
      displayMode: 'single',
      locale: 'vi_VN',
      colorTheme: isDark ? 'dark' : 'light'
    })

    containerRef.current.appendChild(script)
  }, [isDark])

  return (
    <div className="tradingview-widget-container h-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  )
}

export function TerminalPreview() {
  const [lastUpdated, setLastUpdated] = useState(2)
  const [stockData, setStockData] = useState({
    price: 0,
    change: 0,
    changePercent: 0,
    volume: '0',
    marketCap: '0',
    pe: '0'
  })

  // Fetch real AAPL data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Using Yahoo Finance API via a proxy or direct fetch
        const response = await fetch(
          'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=1d'
        )
        const data = await response.json()
        const quote = data.chart.result[0].meta
        const indicators = data.chart.result[0].indicators.quote[0]

        const currentPrice = quote.regularMarketPrice
        const previousClose = quote.previousClose
        const change = currentPrice - previousClose
        const changePercent = (change / previousClose) * 100

        setStockData({
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: (indicators.volume[indicators.volume.length - 1] / 1000000).toFixed(1) + 'M',
          marketCap: '$3.5T',
          pe: '29.2x'
        })
      } catch (error) {
        // Fallback data if API fails
        setStockData({
          price: 242.65,
          change: 3.21,
          changePercent: 1.34,
          volume: '52.3M',
          marketCap: '$3.5T',
          pe: '29.2x'
        })
      }
    }

    fetchStockData()
    const interval = setInterval(fetchStockData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated((prev) => (prev >= 30 ? 1 : prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 px-6 bg-gray-50 dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        {/* Terminal Container */}
        <motion.div
          className="border border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] rounded-xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-[#64748B] font-mono uppercase tracking-wider">
              Terminal Trực Tiếp
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-[#64748B] font-mono">LIVE</span>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="grid grid-cols-12 divide-x divide-gray-200 dark:divide-[#1E1E1E]">
            {/* Left Panel - Stock Info */}
            <div className="col-span-12 lg:col-span-3 p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-[#64748B] uppercase tracking-wider mb-1">Mã CK</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-mono font-semibold text-gray-900 dark:text-white">AAPL</p>
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">NASDAQ</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-[#64748B] uppercase tracking-wider mb-1">Giá</p>
                <p className="text-3xl font-mono text-gray-900 dark:text-white">
                  ${stockData.price.toFixed(2)}
                </p>
                <p className={`text-sm font-mono ${stockData.changePercent >= 0 ? 'text-green-600 dark:text-[#00C853]' : 'text-red-600 dark:text-[#FF1744]'}`}>
                  {stockData.changePercent >= 0 ? '▲' : '▼'} {stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-[#1E1E1E] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-[#64748B]">Khối lượng</span>
                  <span className="font-mono text-gray-900 dark:text-white">{stockData.volume}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-[#64748B]">Vốn hóa</span>
                  <span className="font-mono text-gray-900 dark:text-white">{stockData.marketCap}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-[#64748B]">P/E</span>
                  <span className="font-mono text-gray-900 dark:text-white">{stockData.pe}</span>
                </div>
              </div>
            </div>

            {/* Middle Panel - TradingView Chart */}
            <div className="col-span-12 lg:col-span-5 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-[#64748B] uppercase tracking-wider">Biểu đồ AAPL - TradingView</p>
              </div>
              <div className="h-72">
                <TradingViewChart trendColor={stockData.changePercent >= 0 ? 'green' : 'red'} />
              </div>
            </div>

            {/* Right Panel - TradingView Technical Analysis */}
            <div className="col-span-12 lg:col-span-4 p-4 bg-white dark:bg-[#131722] rounded-r-xl">
              <p className="text-xs text-gray-500 dark:text-[#64748B] uppercase tracking-wider mb-2">Phân tích kỹ thuật - TradingView</p>
              <div className="h-72">
                <TradingViewAnalysis />
              </div>
            </div>
          </div>

          {/* Bottom Panel - Tech Stocks Overview */}
          <div className="border-t border-gray-200 dark:border-[#1E1E1E] grid grid-cols-12 divide-x divide-gray-200 dark:divide-[#1E1E1E]">
            {/* Top Tech Movers */}
            <div className="col-span-12 lg:col-span-6 p-4">
              <p className="text-xs text-gray-500 dark:text-[#64748B] uppercase tracking-wider mb-3">Top công nghệ</p>
              <div className="space-y-2">
                {[
                  { symbol: 'NVDA', change: 4.2, bar: 85 },
                  { symbol: 'MSFT', change: 1.8, bar: 55 },
                  { symbol: 'GOOGL', change: 1.2, bar: 40 },
                  { symbol: 'AMZN', change: -0.8, bar: 25 },
                ].map((stock) => (
                  <div key={stock.symbol} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-12 text-gray-900 dark:text-white">{stock.symbol}</span>
                    <span
                      className={`text-xs font-mono w-14 ${stock.change >= 0 ? 'text-green-600 dark:text-[#00C853]' : 'text-red-600 dark:text-[#FF1744]'
                        }`}
                    >
                      {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-[#1E1E1E] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stock.change >= 0 ? 'bg-green-500 dark:bg-[#00C853]' : 'bg-red-500 dark:bg-[#FF1744]'
                          }`}
                        style={{ width: `${stock.bar}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector Performance */}
            <div className="col-span-12 lg:col-span-6 p-4">
              <p className="text-xs text-gray-500 dark:text-[#64748B] uppercase tracking-wider mb-3">Chỉ số thị trường</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'S&P 500', change: 0.85 },
                  { name: 'NASDAQ', change: 1.24 },
                  { name: 'DOW', change: 0.42 },
                  { name: 'VIX', change: -2.1 },
                ].map((index) => (
                  <div key={index.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-[#64748B]">{index.name}</span>
                    <span
                      className={`font-mono ${index.change >= 0 ? 'text-green-600 dark:text-[#00C853]' : 'text-red-600 dark:text-[#FF1744]'
                        }`}
                    >
                      {index.change >= 0 ? '▲' : '▼'} {Math.abs(index.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Caption */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500 dark:text-[#64748B]">
            Dữ liệu thời gian thực từ <span className="text-gray-900 dark:text-white font-medium">TradingView & Yahoo Finance.</span>
          </p>
          <p className="text-gray-500 dark:text-[#64748B] font-mono">
            Cập nhật <span className="text-orange-500">{lastUpdated}</span> giây trước
          </p>
        </div>
      </div>
    </section>
  )
}
