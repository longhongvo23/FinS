import { TrendingUp, TrendingDown, Newspaper, AlertCircle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AIDailyBriefing } from '@/types/ai'

interface DailyBriefingProps {
  briefing?: AIDailyBriefing
  isLoading?: boolean
  onRefresh?: () => void
}

export function DailyBriefing({ briefing, isLoading, onRefresh }: DailyBriefingProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!briefing) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-brand mb-4" />
          <h3 className="font-medium mb-2">AI Daily Briefing</h3>
          <p className="text-sm text-foreground-muted mb-4">
            Nhận phân tích thị trường hàng ngày từ AI
          </p>
          <Button onClick={onRefresh}>Tạo báo cáo</Button>
        </CardContent>
      </Card>
    )
  }

  const sentimentColors = {
    bullish: 'text-success bg-success/10',
    bearish: 'text-danger bg-danger/10',
    neutral: 'text-warning bg-warning/10',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand/10">
              <Sparkles className="h-4 w-4 text-brand" />
            </div>
            <CardTitle className="text-lg">AI Daily Briefing</CardTitle>
          </div>
          <Badge className={sentimentColors[briefing.sentiment]}>
            {briefing.sentiment === 'bullish' && 'Tích cực'}
            {briefing.sentiment === 'bearish' && 'Tiêu cực'}
            {briefing.sentiment === 'neutral' && 'Trung lập'}
          </Badge>
        </div>
        <p className="text-xs text-foreground-muted">
          {new Date(briefing.generatedAt).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Market Summary */}
        <div className="p-3 rounded-lg bg-surface-2">
          <p className="text-sm">{briefing.marketSummary}</p>
        </div>

        {/* Highlights */}
        {briefing.highlights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Điểm nhấn
            </h4>
            <div className="space-y-2">
              {briefing.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-lg bg-surface-2"
                >
                  <AlertCircle
                    className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      highlight.sentiment === 'bullish' && 'text-success',
                      highlight.sentiment === 'bearish' && 'text-danger',
                      highlight.sentiment === 'neutral' && 'text-warning'
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">{highlight.title}</p>
                    <p className="text-xs text-foreground-muted">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Movers */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Gainers */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-success">
              <TrendingUp className="h-4 w-4" />
              Tăng mạnh
            </h4>
            <div className="space-y-1">
              {briefing.topGainers.slice(0, 3).map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-2 rounded bg-success/5"
                >
                  <span className="text-sm font-medium">{stock.symbol}</span>
                  <span className="text-xs font-mono text-success">
                    +{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-danger">
              <TrendingDown className="h-4 w-4" />
              Giảm mạnh
            </h4>
            <div className="space-y-1">
              {briefing.topLosers.slice(0, 3).map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-2 rounded bg-danger/5"
                >
                  <span className="text-sm font-medium">{stock.symbol}</span>
                  <span className="text-xs font-mono text-danger">
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Watchlist Alerts */}
        {briefing.watchlistAlerts && briefing.watchlistAlerts.length > 0 && (
          <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
            <h4 className="text-sm font-medium text-warning mb-2">
              Cảnh báo Watchlist
            </h4>
            <ul className="space-y-1">
              {briefing.watchlistAlerts.map((alert, i) => (
                <li key={i} className="text-xs text-foreground-muted">
                  • {alert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Refresh button */}
        <Button variant="outline" size="sm" className="w-full" onClick={onRefresh}>
          <Sparkles className="h-4 w-4 mr-2" />
          Cập nhật
        </Button>
      </CardContent>
    </Card>
  )
}
