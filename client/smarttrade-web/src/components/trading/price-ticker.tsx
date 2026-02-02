import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceTickerProps {
  symbol: string
  price: number
  change: number
  changePercent: number
  size?: 'sm' | 'md' | 'lg'
  showSymbol?: boolean
}

export function PriceTicker({
  symbol,
  price,
  change,
  changePercent,
  size = 'md',
  showSymbol = true,
}: PriceTickerProps) {
  const isPositive = change >= 0

  const sizeClasses = {
    sm: {
      price: 'text-lg',
      change: 'text-xs',
      icon: 'h-3 w-3',
      symbol: 'text-xs',
    },
    md: {
      price: 'text-2xl',
      change: 'text-sm',
      icon: 'h-4 w-4',
      symbol: 'text-sm',
    },
    lg: {
      price: 'text-4xl',
      change: 'text-base',
      icon: 'h-5 w-5',
      symbol: 'text-lg',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className="space-y-1">
      {showSymbol && (
        <p className={cn('font-semibold text-foreground-muted', classes.symbol)}>
          {symbol}
        </p>
      )}

      <p
        className={cn(
          'font-mono font-bold',
          classes.price,
          isPositive ? 'text-success' : 'text-danger'
        )}
      >
        {price.toLocaleString()}
      </p>

      <div
        className={cn(
          'flex items-center gap-1',
          classes.change,
          isPositive ? 'text-success' : 'text-danger'
        )}
      >
        {isPositive ? (
          <TrendingUp className={classes.icon} />
        ) : (
          <TrendingDown className={classes.icon} />
        )}
        <span className="font-mono">
          {isPositive ? '+' : ''}
          {change.toLocaleString()} ({isPositive ? '+' : ''}
          {changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  )
}
