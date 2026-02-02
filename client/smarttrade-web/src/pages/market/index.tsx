import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Filter,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { MiniChartWidget } from '@/components/tradingview/mini-chart'
import { StockQuotesTable } from '@/components/market/stock-quotes-table'

// Live data from TradingView
export function MarketPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Thị trường"
        description={`Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN')}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/market/screener">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[13px] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
              >
                <Filter className="h-3.5 w-3.5 mr-2" />
                Bộ lọc
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        }
      />

      {/* Mini Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          'NASDAQ:AAPL',
          'NASDAQ:NVDA',
          'NASDAQ:MSFT',
          'NASDAQ:AMZN',
          'NASDAQ:TSLA',
          'NASDAQ:META',
          'NASDAQ:GOOGL'
        ].map((symbol) => (
          <div key={symbol} className="h-[220px] rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] relative shadow-sm hover:shadow-md transition-shadow">
            <MiniChartWidget symbol={symbol} height={220} />
          </div>
        ))}
      </div>

      {/* Market Quotes List */}
      <StockQuotesTable />
    </div>
  )
}
