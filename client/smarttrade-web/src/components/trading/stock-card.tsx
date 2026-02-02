import { TrendingUp, TrendingDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Stock } from '@/types/stock'

interface StockCardProps {
  stock: Stock
  isWatchlisted?: boolean
  onToggleWatchlist?: (symbol: string) => void
  onClick?: () => void
  compact?: boolean
}

export function StockCard({
  stock,
  isWatchlisted = false,
  onToggleWatchlist,
  onClick,
  compact = false,
}: StockCardProps) {
  const isPositive = stock.change >= 0

  // Format volume
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`
    return vol.toString()
  }

  if (compact) {
    return (
      <div
        className={cn(
          'group flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer',
          'bg-[var(--color-surface)] border border-[var(--color-border)]',
          'hover:border-[var(--color-border-strong)] transition-all duration-150'
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              {stock.symbol}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5 uppercase tracking-wide">
              {stock.exchange}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[13px] font-medium text-[var(--color-text-primary)] tabular-nums">
            {stock.price.toLocaleString()}
          </span>
          <span
            className={cn(
              'font-mono text-[12px] font-medium tabular-nums min-w-[60px] text-right',
              isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
            )}
          >
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group p-4 rounded-xl cursor-pointer',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'hover:border-[var(--color-border-strong)] transition-all duration-150'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
              {stock.symbol}
            </h3>
            <span className="text-[9px] font-medium tracking-wider text-[var(--color-text-muted)] uppercase px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded">
              {stock.exchange}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-tertiary)] truncate max-w-[140px] mt-0.5">
            {stock.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand)]/5"
          onClick={(e) => {
            e.stopPropagation()
            onToggleWatchlist?.(stock.symbol)
          }}
        >
          <Star
            className={cn(
              'h-3.5 w-3.5',
              isWatchlisted && 'text-[var(--color-brand)] fill-[var(--color-brand)]'
            )}
          />
        </Button>
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <p className="text-xl font-mono font-semibold text-[var(--color-text-primary)] tabular-nums">
          {stock.price.toLocaleString()}
        </p>

        <div
          className={cn(
            'flex items-center gap-1.5',
            isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span className="font-mono text-[12px] font-medium tabular-nums">
            {isPositive ? '+' : ''}{stock.change.toLocaleString()}
          </span>
          <span className="font-mono text-[12px] font-medium tabular-nums">
            ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
        <div>
          <span className="text-[9px] font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
            KLGD
          </span>
          <p className="text-[12px] font-mono text-[var(--color-text-secondary)] tabular-nums mt-0.5">
            {formatVolume(stock.volume)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
            Cao/Thấp
          </span>
          <p className="text-[12px] font-mono text-[var(--color-text-secondary)] tabular-nums mt-0.5">
            {stock.high?.toLocaleString() || '-'} / {stock.low?.toLocaleString() || '-'}
          </p>
        </div>
      </div>
    </div>
  )
}
