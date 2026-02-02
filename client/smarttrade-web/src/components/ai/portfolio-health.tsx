import { Activity, AlertCircle, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AIPortfolioHealth } from '@/types/ai'

interface PortfolioHealthProps {
  health?: AIPortfolioHealth
  isLoading?: boolean
  onRefresh?: () => void
}

export function PortfolioHealth({ health, isLoading, onRefresh }: PortfolioHealthProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Activity className="h-12 w-12 mx-auto text-brand mb-4" />
          <h3 className="font-medium mb-2">Portfolio Health Check</h3>
          <p className="text-sm text-foreground-muted mb-4">
            Phân tích sức khỏe danh mục đầu tư của bạn
          </p>
          <Button onClick={onRefresh}>Phân tích ngay</Button>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-danger'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Tốt'
    if (score >= 60) return 'Khá'
    if (score >= 40) return 'Trung bình'
    return 'Cần cải thiện'
  }

  const riskColors = {
    low: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-danger/10 text-danger',
  }

  const statusIcons = {
    good: <CheckCircle className="h-4 w-4 text-success" />,
    warning: <AlertTriangle className="h-4 w-4 text-warning" />,
    danger: <AlertCircle className="h-4 w-4 text-danger" />,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand/10">
              <Activity className="h-4 w-4 text-brand" />
            </div>
            <CardTitle className="text-lg">Portfolio Health</CardTitle>
          </div>
          <Badge className={riskColors[health.riskLevel]}>
            {health.riskLevel === 'low' && 'Rủi ro thấp'}
            {health.riskLevel === 'medium' && 'Rủi ro TB'}
            {health.riskLevel === 'high' && 'Rủi ro cao'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center p-4 rounded-lg bg-surface-2">
          <p className="text-sm text-foreground-muted mb-1">Điểm sức khỏe</p>
          <div className="flex items-center justify-center gap-2">
            <span className={cn('text-4xl font-bold font-mono', getScoreColor(health.overallScore))}>
              {health.overallScore.toFixed(0)}
            </span>
            <span className="text-foreground-muted">/100</span>
          </div>
          <Badge variant="secondary" className="mt-2">
            {getScoreLabel(health.overallScore)}
          </Badge>
        </div>

        {/* Diversification */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">Đa dạng hóa</span>
            <span className="font-mono">{health.diversificationScore.toFixed(0)}%</span>
          </div>
          <Progress value={health.diversificationScore} className="h-2" />
        </div>

        {/* Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Chỉ số chi tiết</h4>
          <div className="space-y-2">
            {health.metrics.map((metric, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2 rounded-lg bg-surface-2"
              >
                {statusIcons[metric.status]}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{metric.name}</p>
                    <span className="text-sm font-mono">
                      {typeof metric.value === 'number'
                        ? metric.value.toFixed(1)
                        : metric.value}
                      {metric.name.includes('%') || metric.name.includes('Tỷ lệ') ? '%' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Concerns */}
        {health.concerns.length > 0 && (
          <div className="p-3 rounded-lg border border-danger/30 bg-danger/5">
            <h4 className="text-sm font-medium text-danger mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Điểm cần lưu ý
            </h4>
            <ul className="space-y-1">
              {health.concerns.map((concern, i) => (
                <li key={i} className="text-xs text-foreground-muted">
                  • {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {health.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              Đề xuất từ AI
            </h4>
            <div className="space-y-2">
              {health.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-brand/30 bg-brand/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={cn(
                        'text-xs',
                        rec.type === 'buy' && 'bg-success',
                        rec.type === 'sell' && 'bg-danger',
                        rec.type === 'hold' && 'bg-warning',
                        rec.type === 'watch' && 'bg-brand'
                      )}
                    >
                      {rec.symbol}
                    </Badge>
                    <span className="text-xs uppercase text-foreground-muted">
                      {rec.type === 'buy' && 'Mua'}
                      {rec.type === 'sell' && 'Bán'}
                      {rec.type === 'hold' && 'Giữ'}
                      {rec.type === 'watch' && 'Theo dõi'}
                    </span>
                  </div>
                  <p className="text-sm">{rec.reason}</p>
                  <p className="text-xs text-foreground-muted mt-1">
                    Độ tin cậy: {(rec.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-foreground-muted text-center">
          Cập nhật: {new Date(health.generatedAt).toLocaleString('vi-VN')}
        </p>

        <Button variant="outline" size="sm" className="w-full" onClick={onRefresh}>
          <Activity className="h-4 w-4 mr-2" />
          Phân tích lại
        </Button>
      </CardContent>
    </Card>
  )
}
