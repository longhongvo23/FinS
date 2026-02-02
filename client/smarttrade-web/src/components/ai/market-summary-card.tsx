import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Sparkles, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketSummary } from '@/hooks/use-ai-chat'
import { getSentimentColor, getSentimentBgColor, getSentimentLabel, getSentimentEmoji } from '@/lib/ai-prompts'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function MarketSummaryCard() {
  const { marketSummary, isLoading, fetchMarketSummary, refreshSummary } = useMarketSummary()

  useEffect(() => {
    if (!marketSummary) {
      fetchMarketSummary()
    }
  }, [marketSummary, fetchMarketSummary])

  const getSentimentIcon = () => {
    if (!marketSummary) return null
    switch (marketSummary.sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4" />
      case 'bearish':
        return <TrendingDown className="h-4 w-4" />
      case 'neutral':
        return <Minus className="h-4 w-4" />
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/5 via-transparent to-purple-500/5" />

      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-purple-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Market Summary
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshSummary}
            disabled={isLoading}
            className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {isLoading || !marketSummary ? (
          <>
            <Skeleton className="h-6 w-3/4 bg-[var(--color-bg-tertiary)]" />
            <Skeleton className="h-20 w-full bg-[var(--color-bg-tertiary)]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-[var(--color-bg-tertiary)]" />
              <Skeleton className="h-4 w-5/6 bg-[var(--color-bg-tertiary)]" />
              <Skeleton className="h-4 w-4/6 bg-[var(--color-bg-tertiary)]" />
            </div>
          </>
        ) : (
          <>
            {/* Title & Sentiment */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                {marketSummary.title}
              </h3>
              <Badge
                className={cn(
                  'flex items-center gap-1 px-2 py-1 text-[11px] font-medium',
                  getSentimentBgColor(marketSummary.sentiment),
                  getSentimentColor(marketSummary.sentiment)
                )}
              >
                {getSentimentIcon()}
                {getSentimentEmoji(marketSummary.sentiment)} {getSentimentLabel(marketSummary.sentiment)}
              </Badge>
            </div>

            {/* Summary */}
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              {marketSummary.summary}
            </p>

            {/* Highlights */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Điểm nổi bật
              </h4>
              <ul className="space-y-1.5">
                {marketSummary.highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)]"
                  >
                    <span className="text-[var(--color-brand)] mt-0.5">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
              <Clock className="h-3 w-3" />
              Cập nhật{' '}
              {formatDistanceToNow(new Date(marketSummary.lastUpdated), {
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
