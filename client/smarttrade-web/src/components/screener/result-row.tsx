import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  useScreenerStore,
  formatNumber,
  formatMarketCap,
  formatVolume,
  type ScreenerStock,
} from '@/stores/screener-store'

interface ResultRowProps {
  stock: ScreenerStock
  onAddToWatchlist?: (symbol: string) => void
}

export function ResultRow({ stock, onAddToWatchlist }: ResultRowProps) {
  const { expandedRows, toggleRowExpanded } = useScreenerStore()
  const isExpanded = expandedRows.includes(stock.symbol)

  const isPositive = stock.changePercent >= 0

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      {/* Main Row */}
      <div
        className={cn(
          'grid grid-cols-[1fr_100px_100px_90px_100px_80px_80px_60px_40px] gap-3 px-4 py-3',
          'hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer'
        )}
        onClick={() => toggleRowExpanded(stock.symbol)}
      >
        {/* Symbol & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <Link
              to={`/stock/${stock.symbol}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-semibold text-[var(--color-brand)] hover:underline"
            >
              {stock.symbol}
            </Link>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate max-w-[180px]">
              {stock.name}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[9px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
          >
            {stock.exchange}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-end">
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
            {formatNumber(stock.price)}
          </span>
        </div>

        {/* Change */}
        <div className="flex items-center justify-end gap-1">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-[var(--color-positive)]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[var(--color-negative)]" />
          )}
          <span
            className={cn(
              'text-[13px] font-medium',
              isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
            )}
          >
            {isPositive ? '+' : ''}
            {stock.changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-end">
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            {formatVolume(stock.volume)}
          </span>
        </div>

        {/* Market Cap */}
        <div className="flex items-center justify-end">
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            {formatMarketCap(stock.marketCap)}
          </span>
        </div>

        {/* P/E */}
        <div className="flex items-center justify-end">
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            {stock.pe !== null ? stock.pe.toFixed(1) : '—'}
          </span>
        </div>

        {/* Dividend */}
        <div className="flex items-center justify-end">
          <span className="text-[12px] text-[var(--color-text-secondary)]">
            {stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(1)}%` : '—'}
          </span>
        </div>

        {/* Sparkline */}
        <div className="flex items-center justify-center">
          <Sparkline data={stock.sparklineData} isPositive={isPositive} />
        </div>

        {/* Expand Icon */}
        <div className="flex items-center justify-center">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 py-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
          <div className="grid grid-cols-4 gap-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Thông tin cơ bản
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Ngành</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">{stock.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Phân ngành</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">{stock.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Vốn hóa</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {formatMarketCap(stock.marketCap)} VND
                  </span>
                </div>
              </div>
            </div>

            {/* Trading Info */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Giao dịch
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">KL hôm nay</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {formatVolume(stock.volume)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">KL TB 20D</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {formatVolume(stock.avgVolume20D)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Biến động</span>
                  <span
                    className={cn(
                      'text-[12px]',
                      stock.volume > stock.avgVolume20D * 1.5
                        ? 'text-[var(--color-positive)]'
                        : 'text-[var(--color-text-primary)]'
                    )}
                  >
                    {((stock.volume / stock.avgVolume20D - 1) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Valuation */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Định giá
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">P/E</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {stock.pe !== null ? stock.pe.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">P/B</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {stock.pb !== null ? stock.pb.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Tỷ suất cổ tức</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(2)}%` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Kỹ thuật
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Đỉnh 52W</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {formatNumber(stock.high52W)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Đáy 52W</span>
                  <span className="text-[12px] text-[var(--color-text-primary)]">
                    {formatNumber(stock.low52W)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">RSI</span>
                  <span
                    className={cn(
                      'text-[12px]',
                      stock.rsi < 30
                        ? 'text-[var(--color-positive)]'
                        : stock.rsi > 70
                        ? 'text-[var(--color-negative)]'
                        : 'text-[var(--color-text-primary)]'
                    )}
                  >
                    {stock.rsi.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">MA50</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'h-4 px-1.5 text-[9px]',
                      stock.aboveMA50
                        ? 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]'
                        : 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]'
                    )}
                  >
                    {stock.aboveMA50 ? 'Trên' : 'Dưới'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onAddToWatchlist?.(stock.symbol)
              }}
              className="h-7 px-3 text-[11px] border-[var(--color-border)]"
            >
              <Plus className="h-3 w-3 mr-1" />
              Thêm vào Watchlist
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-7 px-3 text-[11px] border-[var(--color-border)]"
            >
              <Link to={`/stock/${stock.symbol}`}>Xem chi tiết</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Mini Sparkline component
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const width = 50
  const height = 20
  const padding = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2)
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  const color = isPositive ? 'var(--color-positive)' : 'var(--color-negative)'

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
