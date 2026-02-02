import { TrendingUp, TrendingDown, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Stock } from '@/types/stock'

interface StockTableProps {
  stocks: Stock[]
  title?: string
  watchlist?: string[]
  onToggleWatchlist?: (symbol: string) => void
  onRowClick?: (stock: Stock) => void
  isLoading?: boolean
}

export function StockTable({
  stocks,
  title,
  watchlist = [],
  onToggleWatchlist,
  onRowClick,
  isLoading,
}: StockTableProps) {
  if (isLoading) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-3">
                <div className="h-6 w-16 bg-surface-2 rounded" />
                <div className="h-4 w-32 bg-surface-2 rounded" />
                <div className="flex-1" />
                <div className="h-6 w-24 bg-surface-2 rounded" />
                <div className="h-4 w-16 bg-surface-2 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Badge variant="secondary">{stocks.length} mã</Badge>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-foreground-muted">
                <th className="pb-3 font-medium w-8"></th>
                <th className="pb-3 font-medium">Mã CK</th>
                <th className="pb-3 font-medium text-right">Giá</th>
                <th className="pb-3 font-medium text-right">+/-</th>
                <th className="pb-3 font-medium text-right">%</th>
                <th className="pb-3 font-medium text-right">KL</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const isPositive = stock.change >= 0
                const isWatchlisted = watchlist.includes(stock.symbol)

                return (
                  <tr
                    key={stock.symbol}
                    className="border-b border-border hover:bg-surface-2 cursor-pointer transition-colors"
                    onClick={() => onRowClick?.(stock)}
                  >
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleWatchlist?.(stock.symbol)
                        }}
                      >
                        <Star
                          className={cn(
                            'h-4 w-4',
                            isWatchlisted && 'text-warning fill-warning'
                          )}
                        />
                      </Button>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{stock.symbol}</p>
                        <p className="text-xs text-foreground-muted truncate max-w-[150px]">
                          {stock.name}
                        </p>
                      </div>
                    </td>
                    <td
                      className={cn(
                        'py-3 text-right font-mono font-semibold',
                        isPositive ? 'text-success' : 'text-danger'
                      )}
                    >
                      {stock.price.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        'py-3 text-right font-mono',
                        isPositive ? 'text-success' : 'text-danger'
                      )}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isPositive ? '+' : ''}
                        {stock.change.toLocaleString()}
                      </div>
                    </td>
                    <td
                      className={cn(
                        'py-3 text-right font-mono',
                        isPositive ? 'text-success' : 'text-danger'
                      )}
                    >
                      {isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 text-right font-mono text-foreground-muted">
                      {(stock.volume / 1000).toFixed(0)}K
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
