import { TrendingUp, TrendingDown, Target, AlertTriangle, Info, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AIStockInsight } from '@/types/ai'

interface StockInsightProps {
  insight?: AIStockInsight
  isLoading?: boolean
  onRefresh?: () => void
}

export function StockInsight({ insight, isLoading, onRefresh }: StockInsightProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!insight) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-brand mb-4" />
          <h3 className="font-medium mb-2">AI Stock Insight</h3>
          <p className="text-sm text-foreground-muted">
            Chọn một mã cổ phiếu để xem phân tích AI
          </p>
        </CardContent>
      </Card>
    )
  }

  const sentimentColors = {
    bullish: 'text-success bg-success/10',
    bearish: 'text-danger bg-danger/10',
    neutral: 'text-warning bg-warning/10',
  }

  const riskColors = {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-danger',
  }

  const recommendationColors = {
    buy: 'bg-success text-white',
    sell: 'bg-danger text-white',
    hold: 'bg-warning text-white',
    watch: 'bg-brand text-white',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{insight.symbol}</CardTitle>
            <p className="text-sm text-foreground-muted">{insight.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={sentimentColors[insight.sentiment]}>
              {insight.sentiment === 'bullish' && 'Tích cực'}
              {insight.sentiment === 'bearish' && 'Tiêu cực'}
              {insight.sentiment === 'neutral' && 'Trung lập'}
            </Badge>
            <Badge className={recommendationColors[insight.recommendation.type]}>
              {insight.recommendation.type === 'buy' && 'MUA'}
              {insight.recommendation.type === 'sell' && 'BÁN'}
              {insight.recommendation.type === 'hold' && 'GIỮ'}
              {insight.recommendation.type === 'watch' && 'THEO DÕI'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">Điểm AI</span>
            <span className="font-mono font-medium">{insight.score}/100</span>
          </div>
          <Progress value={insight.score} className="h-2" />
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn('h-4 w-4', riskColors[insight.riskLevel])} />
            <span className="text-sm">Mức rủi ro</span>
          </div>
          <span className={cn('text-sm font-medium', riskColors[insight.riskLevel])}>
            {insight.riskLevel === 'low' && 'Thấp'}
            {insight.riskLevel === 'medium' && 'Trung bình'}
            {insight.riskLevel === 'high' && 'Cao'}
          </span>
        </div>

        {/* Analysis */}
        <div className="p-3 rounded-lg bg-surface-2">
          <p className="text-sm">{insight.analysis}</p>
        </div>

        {/* Key Points */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Điểm chính
          </h4>
          <ul className="space-y-1">
            {insight.keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-foreground-muted flex items-start gap-2">
                <span className="text-brand">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Analysis */}
        {insight.technicals && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Phân tích kỹ thuật</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-surface-2">
                <p className="text-xs text-foreground-muted">Xu hướng</p>
                <p className="text-sm font-medium capitalize">
                  {insight.technicals.trend === 'uptrend' && 'Tăng'}
                  {insight.technicals.trend === 'downtrend' && 'Giảm'}
                  {insight.technicals.trend === 'sideways' && 'Sideway'}
                </p>
              </div>
              <div className="p-2 rounded bg-surface-2">
                <p className="text-xs text-foreground-muted">RSI</p>
                <p className="text-sm font-mono font-medium">
                  {insight.technicals.rsi.toFixed(1)}
                </p>
              </div>
              <div className="p-2 rounded bg-surface-2">
                <p className="text-xs text-foreground-muted">Hỗ trợ</p>
                <p className="text-sm font-mono font-medium text-success">
                  {insight.technicals.support.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded bg-surface-2">
                <p className="text-xs text-foreground-muted">Kháng cự</p>
                <p className="text-sm font-mono font-medium text-danger">
                  {insight.technicals.resistance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="p-3 rounded-lg border border-brand/30 bg-brand/5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-brand" />
            <h4 className="text-sm font-medium text-brand">Khuyến nghị</h4>
          </div>
          <p className="text-sm mb-2">{insight.recommendation.reason}</p>
          <div className="flex items-center gap-4 text-xs">
            {insight.recommendation.targetPrice && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                Mục tiêu: {insight.recommendation.targetPrice.toLocaleString()}
              </span>
            )}
            {insight.recommendation.stopLoss && (
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-danger" />
                Cắt lỗ: {insight.recommendation.stopLoss.toLocaleString()}
              </span>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs text-foreground-muted">
              Độ tin cậy: {(insight.recommendation.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-foreground-muted text-center">
          Cập nhật: {new Date(insight.generatedAt).toLocaleString('vi-VN')}
        </p>

        <Button variant="outline" size="sm" className="w-full" onClick={onRefresh}>
          <Sparkles className="h-4 w-4 mr-2" />
          Phân tích lại
        </Button>
      </CardContent>
    </Card>
  )
}
