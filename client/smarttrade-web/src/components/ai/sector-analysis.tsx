import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSectorInsights } from '@/hooks/use-ai-chat'
import { getSentimentColor, getSentimentBgColor, getSentimentLabel, getSentimentEmoji } from '@/lib/ai-prompts'

export function SectorAnalysis() {
  const { sectorInsights, isLoading, fetchSectorInsights } = useSectorInsights()

  useEffect(() => {
    if (sectorInsights.length === 0) {
      fetchSectorInsights()
    }
  }, [sectorInsights, fetchSectorInsights])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-purple-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Phân tích theo ngành
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || sectorInsights.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full bg-[var(--color-bg-tertiary)]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectorInsights.map((insight) => (
              <div
                key={insight.sector}
                className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                    {insight.sector}
                  </h4>
                  <Badge
                    className={cn(
                      'text-[10px] font-medium',
                      getSentimentBgColor(insight.sentiment),
                      getSentimentColor(insight.sentiment)
                    )}
                  >
                    {getSentimentEmoji(insight.sentiment)} {getSentimentLabel(insight.sentiment)}
                  </Badge>
                </div>

                {/* Summary */}
                <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-3">
                  {insight.summary}
                </p>

                {/* Top Stocks */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {insight.topStocks.slice(0, 4).map((symbol) => (
                      <Link
                        key={symbol}
                        to={`/stock/${symbol}`}
                        className="px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10 transition-colors"
                      >
                        {symbol}
                      </Link>
                    ))}
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SectorAnalysisCompact() {
  const { sectorInsights, isLoading, fetchSectorInsights } = useSectorInsights()

  useEffect(() => {
    if (sectorInsights.length === 0) {
      fetchSectorInsights()
    }
  }, [sectorInsights, fetchSectorInsights])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-brand)]" />
            Ngành nổi bật
          </CardTitle>
          <Link to="/insights" className="text-[11px] text-[var(--color-brand)] hover:underline">
            Xem tất cả
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || sectorInsights.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-[var(--color-bg-tertiary)]" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sectorInsights.slice(0, 4).map((insight) => (
              <div
                key={insight.sector}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <span className="text-[12px] font-medium text-[var(--color-text-primary)]">
                  {insight.sector}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px]',
                    getSentimentBgColor(insight.sentiment),
                    getSentimentColor(insight.sentiment)
                  )}
                >
                  {getSentimentEmoji(insight.sentiment)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
