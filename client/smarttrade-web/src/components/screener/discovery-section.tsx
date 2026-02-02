import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Star, Sparkles, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatNumber, type ScreenerStock } from '@/stores/screener-store'
import {
  trendingStocks,
  popularStocks,
  getSimilarStocks,
} from '@/lib/mock-stocks-data'

interface DiscoverySectionProps {
  selectedSymbol?: string
}

export function DiscoverySection({ selectedSymbol }: DiscoverySectionProps) {
  const [activeTab, setActiveTab] = useState('trending')
  const [similarStocks, setSimilarStocks] = useState<ScreenerStock[]>([])

  useEffect(() => {
    if (selectedSymbol) {
      setSimilarStocks(getSimilarStocks(selectedSymbol, 5))
      if (getSimilarStocks(selectedSymbol, 1).length > 0) {
        setActiveTab('similar')
      }
    }
  }, [selectedSymbol])

  return (
    <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-brand)]" />
          Khám phá
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--color-bg-secondary)] p-1 mb-4">
            <TabsTrigger value="trending" className="text-[11px] flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="popular" className="text-[11px] flex items-center gap-1.5">
              <Star className="h-3 w-3" />
              Phổ biến
            </TabsTrigger>
            {selectedSymbol && similarStocks.length > 0 && (
              <TabsTrigger value="similar" className="text-[11px]">
                Tương tự {selectedSymbol}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="trending" className="mt-0">
            <div className="space-y-1">
              <p className="text-[11px] text-[var(--color-text-muted)] mb-3">
                Khối lượng tăng đột biến tuần này
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {trendingStocks.map((stock) => (
                  <DiscoveryCard key={stock.symbol} stock={stock} showVolumeSpike />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <div className="space-y-1">
              <p className="text-[11px] text-[var(--color-text-muted)] mb-3">
                Được thêm nhiều vào Watchlist
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {popularStocks.map((stock) => (
                  <DiscoveryCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            </div>
          </TabsContent>

          {selectedSymbol && similarStocks.length > 0 && (
            <TabsContent value="similar" className="mt-0">
              <div className="space-y-1">
                <p className="text-[11px] text-[var(--color-text-muted)] mb-3">
                  Cổ phiếu cùng ngành với {selectedSymbol}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {similarStocks.map((stock) => (
                    <DiscoveryCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface DiscoveryCardProps {
  stock: ScreenerStock
  showVolumeSpike?: boolean
}

function DiscoveryCard({ stock, showVolumeSpike }: DiscoveryCardProps) {
  const isPositive = stock.changePercent >= 0
  const volumeSpike = ((stock.volume / stock.avgVolume20D - 1) * 100).toFixed(0)

  return (
    <Link
      to={`/stock/${stock.symbol}`}
      className={cn(
        'block p-3 rounded-lg border border-[var(--color-border)]',
        'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]',
        'transition-colors group'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-brand)] group-hover:underline">
            {stock.symbol}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[80px]">
            {stock.name}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="h-4 px-1 text-[8px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
        >
          {stock.exchange}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[var(--color-text-primary)]">
          {formatNumber(stock.price)}
        </span>
        <span
          className={cn(
            'text-[11px] font-medium',
            isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
          )}
        >
          {isPositive ? '+' : ''}
          {stock.changePercent.toFixed(1)}%
        </span>
      </div>

      {showVolumeSpike && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-[var(--color-positive)]" />
            <span className="text-[10px] text-[var(--color-positive)]">
              +{volumeSpike}% KL
            </span>
          </div>
        </div>
      )}
    </Link>
  )
}

// Compact discovery widget for sidebar or small spaces
export function DiscoveryWidget() {
  return (
    <Card className="bg-[var(--color-surface)] border-[var(--color-border)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-brand)]" />
            Trending
          </CardTitle>
          <Link
            to="/screener"
            className="text-[11px] text-[var(--color-brand)] hover:underline flex items-center gap-0.5"
          >
            Xem tất cả
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {trendingStocks.slice(0, 5).map((stock) => {
            const isPositive = stock.changePercent >= 0
            return (
              <Link
                key={stock.symbol}
                to={`/stock/${stock.symbol}`}
                className="flex items-center justify-between py-1.5 hover:bg-[var(--color-bg-tertiary)] rounded px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[var(--color-brand)]">
                    {stock.symbol}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    {formatNumber(stock.price)}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium',
                    isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
                  )}
                >
                  {isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(1)}%
                </span>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
