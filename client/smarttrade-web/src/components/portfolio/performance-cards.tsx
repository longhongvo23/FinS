import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { PortfolioHolding, PortfolioSummary } from '@/stores/portfolio-store'

interface PerformanceCardsProps {
  summary: PortfolioSummary
  bestPerformer: PortfolioHolding | null
  worstPerformer: PortfolioHolding | null
}

interface MetricCardProps {
  title: string
  value: string
  subValue?: string
  change?: number
  icon: React.ReactNode
  iconBg: string
}

function MetricCard({
  title,
  value,
  subValue,
  change,
  icon,
  iconBg,
}: MetricCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            {title}
          </p>
          <p className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
            {value}
          </p>
          {(subValue || change !== undefined) && (
            <div className="flex items-center gap-2 mt-1">
              {change !== undefined && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-[12px] font-medium font-mono',
                    change >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
                  )}
                >
                  {change >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {change >= 0 ? '+' : ''}
                  {formatPercent(change)}
                </span>
              )}
              {subValue && (
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {subValue}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            iconBg
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

function PerformerCard({
  title,
  holding,
  type,
}: {
  title: string
  holding: PortfolioHolding | null
  type: 'best' | 'worst'
}) {
  if (!holding) {
    return (
      <Card className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
          {title}
        </p>
        <p className="text-[13px] text-[var(--color-text-muted)]">Không có dữ liệu</p>
      </Card>
    )
  }

  const isPositive = holding.unrealizedPLPercent >= 0

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            {title}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--color-text-primary)]">
              {holding.symbol}
            </span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono',
                isPositive
                  ? 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]'
                  : 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]'
              )}
            >
              {isPositive ? '+' : ''}
              {formatPercent(holding.unrealizedPLPercent)}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate">
            {holding.name}
          </p>
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            type === 'best'
              ? 'bg-[var(--color-positive)]/10'
              : 'bg-[var(--color-negative)]/10'
          )}
        >
          {type === 'best' ? (
            <Trophy className="h-5 w-5 text-[var(--color-positive)]" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-[var(--color-negative)]" />
          )}
        </div>
      </div>
    </Card>
  )
}

export function PerformanceCards({
  summary,
  bestPerformer,
  worstPerformer,
}: PerformanceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Total Portfolio Value */}
      <MetricCard
        title="Tổng giá trị"
        value={formatCurrency(summary.totalValue)}
        change={summary.totalPLPercent}
        icon={<Wallet className="h-5 w-5 text-[var(--color-brand)]" />}
        iconBg="bg-[var(--color-brand)]/10"
      />

      {/* Total P&L */}
      <MetricCard
        title="Tổng lãi/lỗ"
        value={formatCurrency(summary.totalPL)}
        change={summary.totalPLPercent}
        icon={
          summary.totalPL >= 0 ? (
            <TrendingUp className="h-5 w-5 text-[var(--color-positive)]" />
          ) : (
            <TrendingDown className="h-5 w-5 text-[var(--color-negative)]" />
          )
        }
        iconBg={
          summary.totalPL >= 0
            ? 'bg-[var(--color-positive)]/10'
            : 'bg-[var(--color-negative)]/10'
        }
      />

      {/* Today's Change */}
      <MetricCard
        title="Hôm nay"
        value={formatCurrency(summary.dailyPL)}
        change={summary.dailyPLPercent}
        icon={
          summary.dailyPL >= 0 ? (
            <ArrowUpRight className="h-5 w-5 text-[var(--color-positive)]" />
          ) : (
            <ArrowDownRight className="h-5 w-5 text-[var(--color-negative)]" />
          )
        }
        iconBg={
          summary.dailyPL >= 0
            ? 'bg-[var(--color-positive)]/10'
            : 'bg-[var(--color-negative)]/10'
        }
      />

      {/* Best Performer */}
      <PerformerCard
        title="Tăng tốt nhất"
        holding={bestPerformer}
        type="best"
      />

      {/* Worst Performer */}
      <PerformerCard
        title="Giảm nhiều nhất"
        holding={worstPerformer}
        type="worst"
      />
    </div>
  )
}
