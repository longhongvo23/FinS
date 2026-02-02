import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MarketIndex } from '@/types/stock'

interface MarketIndicesProps {
  indices: MarketIndex[]
  isLoading?: boolean
}

export function MarketIndices({ indices, isLoading }: MarketIndicesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-20 bg-surface-2 rounded" />
                <div className="h-8 w-32 bg-surface-2 rounded" />
                <div className="h-4 w-24 bg-surface-2 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {indices.map((index) => {
        const isPositive = index.change >= 0

        return (
          <Card key={index.symbol} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground-muted">
                    {index.name}
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-mono font-bold mt-1',
                      isPositive ? 'text-success' : 'text-danger'
                    )}
                  >
                    {index.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    isPositive
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="font-mono">
                    {isPositive ? '+' : ''}
                    {index.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                <span>
                  {isPositive ? '+' : ''}
                  {index.change.toFixed(2)}
                </span>
                <span>
                  KL: {(index.volume / 1000000000).toFixed(2)}B
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
