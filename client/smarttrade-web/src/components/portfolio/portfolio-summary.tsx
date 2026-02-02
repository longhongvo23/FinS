import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Briefcase,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/formatters'

export interface PortfolioSummaryData {
  totalValue: number
  stockValue: number
  cashBalance: number
  buyingPower: number
  pendingCash: number
  totalPL: number
  totalPLPercent: number
  dailyPL: number
  dailyPLPercent: number
  realizedPL: number
  unrealizedPL: number
}

interface PortfolioSummaryProps {
  data: PortfolioSummaryData
}

export function PortfolioSummary({ data }: PortfolioSummaryProps) {
  const cashPercent = (data.cashBalance / data.totalValue) * 100
  const stockPercent = (data.stockValue / data.totalValue) * 100

  return (
    <div className="space-y-4">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand/10">
                  <Wallet className="h-4 w-4 text-brand" />
                </div>
                <span className="text-sm text-foreground-muted">Tổng tài sản</span>
              </div>
              <Badge variant="outline" className="text-xs">
                NAV
              </Badge>
            </div>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(data.totalValue)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={cn(
                  'flex items-center gap-1 text-sm',
                  data.dailyPLPercent >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                {data.dailyPLPercent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="font-mono font-medium">
                  {formatPercent(Math.abs(data.dailyPLPercent))}
                </span>
              </div>
              <span className="text-xs text-foreground-muted">hôm nay</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand to-brand/50" />
        </Card>

        {/* P/L Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    data.totalPL >= 0 ? 'bg-success/10' : 'bg-danger/10'
                  )}
                >
                  {data.totalPL >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger" />
                  )}
                </div>
                <span className="text-sm text-foreground-muted">Tổng lãi/lỗ</span>
              </div>
            </div>
            <p
              className={cn(
                'text-2xl font-bold font-mono',
                data.totalPL >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {data.totalPL >= 0 ? '+' : ''}
              {formatCurrency(data.totalPL)}
            </p>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span
                className={cn(
                  'font-mono',
                  data.totalPLPercent >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                {data.totalPLPercent >= 0 ? '+' : ''}
                {formatPercent(data.totalPLPercent)}
              </span>
              <span className="text-xs text-foreground-muted">tổng cộng</span>
            </div>
          </CardContent>
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 h-1',
              data.totalPL >= 0
                ? 'bg-gradient-to-r from-success to-success/50'
                : 'bg-gradient-to-r from-danger to-danger/50'
            )}
          />
        </Card>

        {/* Stock Value */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-chart-1/10">
                  <Briefcase className="h-4 w-4 text-chart-1" />
                </div>
                <span className="text-sm text-foreground-muted">Giá trị CP</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {stockPercent.toFixed(0)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(data.stockValue)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 rounded-full transition-all"
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-chart-1 to-chart-1/50" />
        </Card>

        {/* Cash Balance */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <DollarSign className="h-4 w-4 text-chart-2" />
                </div>
                <span className="text-sm text-foreground-muted">Tiền mặt</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {cashPercent.toFixed(0)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(data.cashBalance)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-2 rounded-full transition-all"
                  style={{ width: `${cashPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-chart-2 to-chart-2/50" />
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-3.5 w-3.5 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Sức mua</span>
            </div>
            <p className="text-lg font-semibold font-mono">
              {formatCurrency(data.buyingPower)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Tiền chờ về</span>
            </div>
            <p className="text-lg font-semibold font-mono">
              {formatCurrency(data.pendingCash)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Lãi đã thực hiện</span>
            </div>
            <p
              className={cn(
                'text-lg font-semibold font-mono',
                data.realizedPL >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {data.realizedPL >= 0 ? '+' : ''}
              {formatCurrency(data.realizedPL)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-3.5 w-3.5 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Lãi chưa thực hiện</span>
            </div>
            <p
              className={cn(
                'text-lg font-semibold font-mono',
                data.unrealizedPL >= 0 ? 'text-success' : 'text-danger'
              )}
            >
              {data.unrealizedPL >= 0 ? '+' : ''}
              {formatCurrency(data.unrealizedPL)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
