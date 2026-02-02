import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Star,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SymbolInfoWidget } from '@/components/tradingview/symbol-info'
import AdvancedChart from '@/components/tradingview/advanced-chart'
import { SymbolProfileWidget } from '@/components/tradingview/symbol-profile'
import { FundamentalDataWidget } from '@/components/tradingview/fundamental-data'
import { SymbolNewsWidget } from '@/components/tradingview/symbol-news'
import { ProphetForecastChart } from '@/components/stock/prophet-forecast-chart'
import { watchlistService } from '@/services/watchlist-service'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

// Common US NASDAQ stocks for auto-detecting exchange
const NASDAQ_STOCKS = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'TSLA', 'META', 'GOOGL', 'GOOG', 'NFLX', 'AMD', 'INTC', 'PYPL', 'ADBE', 'CSCO', 'CMCSA', 'PEP', 'COST', 'AVGO', 'TXN', 'QCOM']

// Get exchange for TradingView symbol format
const getExchange = (sym: string): string => {
  const upperSym = sym.toUpperCase()
  if (NASDAQ_STOCKS.includes(upperSym)) return 'NASDAQ'
  // Default to NASDAQ for unknown US-style symbols
  return 'NASDAQ'
}

export function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [togglingWatchlist, setTogglingWatchlist] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const actualSymbol = symbol?.toUpperCase() || 'AAPL'
  const tvSymbol = `${getExchange(actualSymbol)}:${actualSymbol}`

  // Load watchlist status from backend
  const checkWatchlistStatus = useCallback(async () => {
    if (!isAuthenticated || !symbol) return
    try {
      const inWatchlist = await watchlistService.isInWatchlist(symbol.toUpperCase())
      setIsInWatchlist(inWatchlist)
    } catch (error) {
      console.error('Failed to check watchlist status:', error)
    }
  }, [isAuthenticated, symbol])

  useEffect(() => {
    checkWatchlistStatus()
  }, [checkWatchlistStatus])

  // Toggle watchlist with backend API
  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng chức năng này')
      return
    }
    if (!symbol || togglingWatchlist) return

    setTogglingWatchlist(true)
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(symbol.toUpperCase())
        setIsInWatchlist(false)
        toast.success(`Đã xóa ${symbol.toUpperCase()} khỏi danh sách theo dõi`)
      } else {
        await watchlistService.addToWatchlist(symbol.toUpperCase())
        setIsInWatchlist(true)
        toast.success(`Đã thêm ${symbol.toUpperCase()} vào danh sách theo dõi`)
      }
    } catch (error) {
      console.error('Failed to toggle watchlist:', error)
      toast.error('Không thể cập nhật danh sách theo dõi')
    } finally {
      setTogglingWatchlist(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/market">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              Chi tiết {actualSymbol}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Watchlist Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleWatchlist}
            disabled={togglingWatchlist}
            className={cn(
              'transition-colors',
              isInWatchlist && 'border-yellow-500/50 bg-yellow-500/10'
            )}
          >
            <Star
              className={cn(
                'h-4 w-4 mr-2',
                isInWatchlist ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--color-text-secondary)]'
              )}
            />
            {togglingWatchlist ? 'Đang xử lý...' : isInWatchlist ? 'Đã theo dõi' : 'Theo dõi'}
          </Button>

          {/* Notification Bell - color changes based on watchlist status */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'transition-colors',
              isInWatchlist && 'border-blue-500/50 bg-blue-500/10'
            )}
          >
            <Bell
              className={cn(
                'h-4 w-4',
                isInWatchlist ? 'text-blue-500' : 'text-[var(--color-text-secondary)]'
              )}
            />
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Symbol Info & Chart (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TradingView Symbol Info Widget */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="min-h-[120px]">
                <SymbolInfoWidget symbol={tvSymbol} />
              </div>
            </CardContent>
          </Card>

          {/* TradingView Advanced Chart */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[500px]">
                <AdvancedChart symbol={tvSymbol} height={500} />
              </div>
            </CardContent>
          </Card>

          {/* Symbol News Widget */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[500px]">
                <SymbolNewsWidget symbol={tvSymbol} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Symbol Profile & Fundamental Data (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Symbol Profile Widget */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[300px]">
                <SymbolProfileWidget symbol={tvSymbol} />
              </div>
            </CardContent>
          </Card>

          {/* Prophet AI Forecast Chart */}
          <ProphetForecastChart symbol={actualSymbol} forecastDays={30} historyDays={90} />

          {/* Fundamental Data Widget */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[700px]">
                <FundamentalDataWidget symbol={tvSymbol} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

