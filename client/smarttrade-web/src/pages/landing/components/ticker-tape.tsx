import { useEffect, useState } from 'react'

interface TickerItem {
  symbol: string
  price: string
  change: number
  changePercent: number
}

// 7 stocks being tracked by the system
const TRACKED_SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'TSLA', 'META', 'GOOGL']

// Fallback data if API fails
const fallbackTickers: TickerItem[] = [
  { symbol: 'AAPL', price: '$242.65', change: 3.21, changePercent: 1.34 },
  { symbol: 'NVDA', price: '$148.32', change: 5.45, changePercent: 3.81 },
  { symbol: 'MSFT', price: '$438.50', change: 2.15, changePercent: 0.49 },
  { symbol: 'AMZN', price: '$225.18', change: -1.82, changePercent: -0.80 },
  { symbol: 'TSLA', price: '$412.85', change: 8.90, changePercent: 2.20 },
  { symbol: 'META', price: '$612.40', change: 4.20, changePercent: 0.69 },
  { symbol: 'GOOGL', price: '$196.75', change: -0.85, changePercent: -0.43 },
]

export function TickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>(fallbackTickers)
  const [updatedIndex, setUpdatedIndex] = useState<number | null>(null)

  // Fetch real stock data from Yahoo Finance
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const promises = TRACKED_SYMBOLS.map(async (symbol) => {
          const response = await fetch(
            `/yahoo-api/v8/finance/chart/${symbol}?interval=1d&range=1d`
          )
          const data = await response.json()
          const quote = data.chart.result[0].meta

          const currentPrice = quote.regularMarketPrice
          const previousClose = quote.previousClose || quote.chartPreviousClose
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100

          return {
            symbol,
            price: `$${currentPrice.toFixed(2)}`,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
          }
        })

        const results = await Promise.all(promises)
        setTickers(results)
      } catch (error) {
        console.error('Failed to fetch stock data:', error)
        // Keep fallback data
      }
    }

    fetchStockData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchStockData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Highlight effect when data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * tickers.length)
      setUpdatedIndex(randomIndex)
      setTimeout(() => setUpdatedIndex(null), 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [tickers.length])

  return (
    <div className="border-b border-gray-200 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#0A0A0A] overflow-hidden">
      <div className="flex animate-ticker">
        {/* Duplicate for seamless loop */}
        {[...tickers, ...tickers].map((ticker, index) => (
          <div
            key={`${ticker.symbol}-${index}`}
            className={`flex items-center gap-3 px-6 py-2 border-r border-gray-200 dark:border-[#1E1E1E] whitespace-nowrap transition-colors duration-300 ${updatedIndex === index % tickers.length ? 'bg-gray-100 dark:bg-white/5' : ''
              }`}
          >
            <span className="text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider">
              {ticker.symbol}
            </span>
            <span className="text-sm font-mono text-gray-900 dark:text-white">{ticker.price}</span>
            <span
              className={`text-xs font-mono ${ticker.change >= 0 ? 'text-green-600 dark:text-[#00C853]' : 'text-red-600 dark:text-[#FF1744]'
                }`}
            >
              {ticker.change >= 0 ? '▲' : '▼'} {ticker.change >= 0 ? '+' : ''}
              {ticker.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
