import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface OrderBookLevel {
  price: number
  volume: number
  orders?: number
}

interface OrderBookProps {
  symbol?: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  lastPrice?: number
  showHeader?: boolean
  compact?: boolean
  className?: string
}

export function OrderBook({
  symbol,
  bids,
  asks,
  lastPrice,
  showHeader = true,
  compact = false,
  className,
}: OrderBookProps) {
  const maxBidVolume = useMemo(
    () => Math.max(...bids.map((b) => b.volume), 0),
    [bids]
  )
  const maxAskVolume = useMemo(
    () => Math.max(...asks.map((a) => a.volume), 0),
    [asks]
  )
  const maxVolume = Math.max(maxBidVolume, maxAskVolume)

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`
    return vol.toLocaleString()
  }

  const totalBidVolume = useMemo(() => bids.reduce((sum, b) => sum + b.volume, 0), [bids])
  const totalAskVolume = useMemo(() => asks.reduce((sum, a) => sum + a.volume, 0), [asks])
  const bidPercent = totalBidVolume + totalAskVolume > 0
    ? (totalBidVolume / (totalBidVolume + totalAskVolume)) * 100
    : 50

  const spread = asks.length > 0 && bids.length > 0
    ? asks[0].price - bids[0].price
    : 0
  const spreadPercent = bids.length > 0 && bids[0].price > 0
    ? (spread / bids[0].price) * 100
    : 0

  if (compact) {
    // Compact view for sidebar
    return (
      <div className={cn('space-y-2', className)}>
        {/* Column Headers */}
        <div className="grid grid-cols-3 text-xs text-foreground-muted font-medium px-1">
          <span>Giá</span>
          <span className="text-right">KL</span>
          <span className="text-right">Lệnh</span>
        </div>

        {/* Asks (reversed) */}
        <div className="space-y-0.5">
          {[...asks].reverse().slice(0, 5).map((level, i) => (
            <div
              key={`ask-${i}`}
              className="relative grid grid-cols-3 text-xs py-0.5 px-1 hover:bg-danger/5 transition-colors cursor-pointer"
            >
              <div
                className="absolute inset-y-0 right-0 bg-danger/10"
                style={{ width: `${maxVolume > 0 ? (level.volume / maxVolume) * 100 : 0}%` }}
              />
              <span className="relative text-danger font-mono">
                {level.price.toLocaleString()}
              </span>
              <span className="relative text-right font-mono text-foreground-muted">
                {formatVolume(level.volume)}
              </span>
              <span className="relative text-right text-foreground-muted">
                {level.orders || '-'}
              </span>
            </div>
          ))}
        </div>

        {/* Last Price */}
        {lastPrice && (
          <div className="flex items-center justify-center py-1 border-y border-border">
            <span className="text-sm font-mono font-bold">
              {lastPrice.toLocaleString()}
            </span>
          </div>
        )}

        {/* Bids */}
        <div className="space-y-0.5">
          {bids.slice(0, 5).map((level, i) => (
            <div
              key={`bid-${i}`}
              className="relative grid grid-cols-3 text-xs py-0.5 px-1 hover:bg-success/5 transition-colors cursor-pointer"
            >
              <div
                className="absolute inset-y-0 right-0 bg-success/10"
                style={{ width: `${maxVolume > 0 ? (level.volume / maxVolume) * 100 : 0}%` }}
              />
              <span className="relative text-success font-mono">
                {level.price.toLocaleString()}
              </span>
              <span className="relative text-right font-mono text-foreground-muted">
                {formatVolume(level.volume)}
              </span>
              <span className="relative text-right text-foreground-muted">
                {level.orders || '-'}
              </span>
            </div>
          ))}
        </div>

        {/* Ratio Bar */}
        <div className="space-y-1">
          <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-2">
            <div className="bg-success transition-all" style={{ width: `${bidPercent}%` }} />
            <div className="bg-danger transition-all" style={{ width: `${100 - bidPercent}%` }} />
          </div>
          <div className="flex justify-between text-xs text-foreground-muted">
            <span className="text-success">{bidPercent.toFixed(0)}%</span>
            <span className="text-danger">{(100 - bidPercent).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    )
  }

  // Full view
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <span className="font-medium">Sổ lệnh {symbol}</span>
          {spread > 0 && (
            <span className="text-xs text-foreground-muted">
              Spread: {spread.toLocaleString()} ({spreadPercent.toFixed(2)}%)
            </span>
          )}
        </div>
      )}

      {/* Column Headers */}
      <div className="grid grid-cols-3 text-xs text-foreground-muted font-medium px-2">
        <span>Giá</span>
        <span className="text-right">Khối lượng</span>
        <span className="text-right">Số lệnh</span>
      </div>

      {/* Asks (Sell orders) - Reversed to show highest at top */}
      <div className="space-y-0.5">
        {[...asks].reverse().map((level, i) => (
          <div
            key={`ask-${i}`}
            className="relative grid grid-cols-3 text-sm py-1.5 px-2 hover:bg-danger/5 transition-colors cursor-pointer"
          >
            <div
              className="absolute inset-y-0 right-0 bg-danger/10"
              style={{ width: `${maxVolume > 0 ? (level.volume / maxVolume) * 100 : 0}%` }}
            />
            <span className="relative text-danger font-mono font-medium">
              {level.price.toLocaleString()}
            </span>
            <span className="relative text-right font-mono">
              {formatVolume(level.volume)}
            </span>
            <span className="relative text-right text-foreground-muted">
              {level.orders || '-'}
            </span>
          </div>
        ))}
      </div>

      {/* Last Price / Spread */}
      {lastPrice && (
        <div className="flex items-center justify-center py-2 border-y border-border bg-surface-2/50">
          <span className="text-xl font-mono font-bold">
            {lastPrice.toLocaleString()}
          </span>
        </div>
      )}

      {/* Bids (Buy orders) */}
      <div className="space-y-0.5">
        {bids.map((level, i) => (
          <div
            key={`bid-${i}`}
            className="relative grid grid-cols-3 text-sm py-1.5 px-2 hover:bg-success/5 transition-colors cursor-pointer"
          >
            <div
              className="absolute inset-y-0 right-0 bg-success/10"
              style={{ width: `${maxVolume > 0 ? (level.volume / maxVolume) * 100 : 0}%` }}
            />
            <span className="relative text-success font-mono font-medium">
              {level.price.toLocaleString()}
            </span>
            <span className="relative text-right font-mono">
              {formatVolume(level.volume)}
            </span>
            <span className="relative text-right text-foreground-muted">
              {level.orders || '-'}
            </span>
          </div>
        ))}
      </div>

      {/* Bid/Ask Ratio Bar */}
      <div className="px-2 space-y-1">
        <div className="flex h-2 rounded-full overflow-hidden bg-surface-2">
          <div
            className="bg-success transition-all"
            style={{ width: `${bidPercent}%` }}
          />
          <div
            className="bg-danger transition-all"
            style={{ width: `${100 - bidPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-success">
            Mua: {formatVolume(totalBidVolume)} ({bidPercent.toFixed(1)}%)
          </span>
          <span className="text-danger">
            Bán: {formatVolume(totalAskVolume)} ({(100 - bidPercent).toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  )
}
