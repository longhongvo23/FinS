import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStockAnalysis } from '@/hooks/use-ai-chat'
import { getRatingColor, getRatingBgColor, getRatingLabel } from '@/lib/ai-prompts'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface StockAIAnalysisProps {
  symbol: string
  compact?: boolean
}

export function StockAIAnalysis({ symbol, compact = false }: StockAIAnalysisProps) {
  const { analysis, isLoading, fetchAnalysis, regenerateAnalysis } = useStockAnalysis(symbol)

  useEffect(() => {
    if (!analysis) {
      fetchAnalysis()
    }
  }, [analysis, fetchAnalysis])

  if (compact) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/5 via-transparent to-purple-500/5" />

        <CardContent className="relative p-4">
          {isLoading || !analysis ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3 bg-[var(--color-bg-tertiary)]" />
              <Skeleton className="h-16 w-full bg-[var(--color-bg-tertiary)]" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--color-brand)]" />
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                    AI Analysis
                  </span>
                </div>
                <Badge
                  className={cn(
                    'text-[10px] font-medium',
                    getRatingBgColor(analysis.rating),
                    getRatingColor(analysis.rating)
                  )}
                >
                  {getRatingLabel(analysis.rating)}
                </Badge>
              </div>
              <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-3">
                {analysis.overview}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/5 via-transparent to-purple-500/5" />

      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-purple-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Analysis - {symbol}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerateAnalysis}
            disabled={isLoading}
            className="h-8 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', isLoading && 'animate-spin')} />
            Phân tích lại
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {isLoading || !analysis ? (
          <>
            <Skeleton className="h-6 w-24 bg-[var(--color-bg-tertiary)]" />
            <Skeleton className="h-20 w-full bg-[var(--color-bg-tertiary)]" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 bg-[var(--color-bg-tertiary)]" />
              <Skeleton className="h-32 bg-[var(--color-bg-tertiary)]" />
            </div>
            <Skeleton className="h-24 w-full bg-[var(--color-bg-tertiary)]" />
          </>
        ) : (
          <>
            {/* Rating Badge */}
            <Badge
              className={cn(
                'text-[12px] font-semibold px-3 py-1',
                getRatingBgColor(analysis.rating),
                getRatingColor(analysis.rating)
              )}
            >
              {getRatingLabel(analysis.rating)}
            </Badge>

            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Tổng quan
              </h4>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                {analysis.overview}
              </p>
            </div>

            {/* Performance */}
            <div className="space-y-2">
              <h4 className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Hiệu suất gần đây
              </h4>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                {analysis.performance}
              </p>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pros */}
              <div className="p-4 rounded-lg bg-[var(--color-positive)]/5 border border-[var(--color-positive)]/20">
                <h4 className="text-[12px] font-medium flex items-center gap-2 text-[var(--color-positive)] mb-3">
                  <ThumbsUp className="h-4 w-4" />
                  Điểm mạnh
                </h4>
                <ul className="space-y-2">
                  {analysis.pros.map((pro, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)]"
                    >
                      <span className="text-[var(--color-positive)] mt-0.5">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="p-4 rounded-lg bg-[var(--color-negative)]/5 border border-[var(--color-negative)]/20">
                <h4 className="text-[12px] font-medium flex items-center gap-2 text-[var(--color-negative)] mb-3">
                  <ThumbsDown className="h-4 w-4" />
                  Rủi ro
                </h4>
                <ul className="space-y-2">
                  {analysis.cons.map((con, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)]"
                    >
                      <span className="text-[var(--color-negative)] mt-0.5">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Similar Stocks */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Cổ phiếu tương tự
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.similarStocks.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/stock/${stock.symbol}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)]/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-[var(--color-brand)]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[12px] font-medium text-[var(--color-text-primary)]">
                        {stock.symbol}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {stock.reason}
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)]">
              <Clock className="h-3 w-3" />
              Phân tích lúc{' '}
              {formatDistanceToNow(new Date(analysis.lastUpdated), {
                addSuffix: true,
                locale: vi,
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
