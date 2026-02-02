import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercent } from '@/lib/formatters'

interface TopStocksTableProps {
  dateRange: string
}

interface TopStock {
  symbol: string
  name: string
  views: number
  trades: number
  change: number
}

// Generate demo data
function generateDemoData(): TopStock[] {
  return [
    { symbol: 'VNM', name: 'Vinamilk', views: 12450, trades: 890, change: 2.35 },
    { symbol: 'FPT', name: 'FPT Corp', views: 10230, trades: 1240, change: 3.12 },
    { symbol: 'VIC', name: 'Vingroup', views: 9870, trades: 560, change: -1.45 },
    { symbol: 'HPG', name: 'Hòa Phát', views: 8540, trades: 2100, change: 4.21 },
    { symbol: 'MWG', name: 'Mobile World', views: 7620, trades: 780, change: -2.18 },
    { symbol: 'VHM', name: 'Vinhomes', views: 6890, trades: 450, change: 1.56 },
    { symbol: 'MSN', name: 'Masan Group', views: 5430, trades: 320, change: 0.89 },
    { symbol: 'TCB', name: 'Techcombank', views: 4980, trades: 680, change: -0.67 },
    { symbol: 'VCB', name: 'Vietcombank', views: 4520, trades: 890, change: 1.23 },
    { symbol: 'VRE', name: 'Vincom Retail', views: 3890, trades: 210, change: -1.02 },
  ]
}

async function fetchTopStocks(_dateRange: string): Promise<TopStock[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return generateDemoData()
}

export function TopStocksTable({ dateRange }: TopStocksTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-top-stocks', dateRange],
    queryFn: () => fetchTopStocks(dateRange),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Viewed Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(data || []).map((stock, index) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground-muted w-5">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatNumber(stock.views, 0)} views
                      </Badge>
                    </div>
                    <span className="text-xs text-foreground-muted">{stock.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-foreground-muted">
                    {formatNumber(stock.trades, 0)} trades
                  </span>
                  <div
                    className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      stock.change >= 0 ? 'text-success' : 'text-danger'
                    )}
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatPercent(stock.change)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
