import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { aitoolsService, StockResearchReport } from '@/services/aitools-service'
import { toast } from 'sonner'

interface FullResearchReportProps {
  symbol: string
  onClose: () => void
}

async function fetchFullReport(symbol: string) {
  // Try to fetch from API first
  const report = await aitoolsService.getResearchReport(symbol)

  if (report) {
    const ratingMap: Record<string, string> = {
      'BUY': 'buy',
      'SELL': 'sell',
      'HOLD': 'hold',
    }

    return {
      symbol: report.symbol,
      report_date: report.createdDate,
      executive_summary: report.analysisSummary || `Phân tích AI cho ${symbol}. Dựa trên các chỉ số tài chính và xu hướng thị trường.`,

      financial_analysis: {
        health_score: report.financialScore || 60,
        analysis: 'Phân tích dựa trên các chỉ số tài chính và báo cáo công ty.',
        highlights: [
          { metric: 'Overall Score', assessment: report.overallScore >= 70 ? 'positive' : report.overallScore >= 40 ? 'neutral' : 'negative', note: `${report.overallScore}/100` },
          { metric: 'Financial Score', assessment: report.financialScore >= 70 ? 'positive' : report.financialScore >= 40 ? 'neutral' : 'negative', note: `${report.financialScore}/100` },
          { metric: 'Technical Score', assessment: report.technicalScore >= 70 ? 'positive' : report.technicalScore >= 40 ? 'neutral' : 'negative', note: `${report.technicalScore}/100` },
          { metric: 'Sentiment Score', assessment: report.sentimentScore >= 70 ? 'positive' : report.sentimentScore >= 40 ? 'neutral' : 'negative', note: `${report.sentimentScore}/100` },
        ],
        concerns: [],
        strengths: [],
      },

      technical_analysis: {
        score: report.technicalScore || 50,
        trend: report.upsidePercentage > 0 ? 'uptrend' : report.upsidePercentage < 0 ? 'downtrend' : 'sideways',
        analysis: `Phân tích kỹ thuật cho ${symbol}. Tiềm năng tăng ${report.upsidePercentage?.toFixed(1) || 0}%.`,
        support_levels: [report.currentPrice * 0.95, report.currentPrice * 0.90],
        resistance_levels: [report.targetPrice, report.targetPrice * 1.1],
      },

      news_sentiment: {
        score: report.sentimentScore || 50,
        overall_sentiment: report.sentimentScore >= 70 ? 'positive' : report.sentimentScore <= 30 ? 'negative' : 'neutral',
        summary: 'Phân tích sentiment từ tin tức và mạng xã hội.',
        key_events: [],
      },

      ai_recommendation: {
        rating: ratingMap[report.recommendation] || 'hold',
        confidence: report.overallScore || 50,
        price_targets: {
          low: report.currentPrice * 0.9,
          mid: report.targetPrice || report.currentPrice * 1.1,
          high: report.targetPrice * 1.2 || report.currentPrice * 1.25,
        },
        time_horizon: '1-3 tháng',
        reasoning: report.analysisSummary || 'Phân tích AI.',
      },

      risks: aitoolsService.parseRiskFactors(report.riskFactors),
      opportunities: aitoolsService.parseKeyFactors(report.keyFactors).map(k => k.factor),
    }
  }

  // Return null if no report found
  return null
}

export function FullResearchReport({
  symbol,
  onClose,
}: FullResearchReportProps) {
  const queryClient = useQueryClient()

  const { data: report, isLoading } = useQuery({
    queryKey: ['research-report', symbol],
    queryFn: () => fetchFullReport(symbol),
  })

  const generateMutation = useMutation({
    mutationFn: () => aitoolsService.generateResearchReport(symbol),
    onSuccess: () => {
      toast.success('Đã tạo báo cáo nghiên cứu mới')
      queryClient.invalidateQueries({ queryKey: ['research-report', symbol] })
      queryClient.invalidateQueries({ queryKey: ['watchlist-research'] })
    },
    onError: () => {
      toast.error('Không thể tạo báo cáo. Vui lòng thử lại.')
    },
  })

  const ratingColors: Record<string, string> = {
    strong_buy: 'bg-success text-white',
    buy: 'bg-success/80 text-white',
    hold: 'bg-warning text-black',
    sell: 'bg-danger/80 text-white',
    strong_sell: 'bg-danger text-white',
  }

  const ratingLabels: Record<string, string> = {
    strong_buy: 'MUA MẠNH',
    buy: 'MUA',
    hold: 'GIỮ',
    sell: 'BÁN',
    strong_sell: 'BÁN MẠNH',
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand" />
              AI Research Report: {symbol}
            </DialogTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="h-8 text-[12px]"
            >
              {generateMutation.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              {report ? 'Tạo mới' : 'Tạo báo cáo'}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          {isLoading || generateMutation.isPending ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : report ? (
            <div className="space-y-4 mt-4">
              {/* AI Recommendation */}
              <Card className="border-brand/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={cn(
                          'text-lg px-3 py-1',
                          ratingColors[report.ai_recommendation.rating]
                        )}
                      >
                        {ratingLabels[report.ai_recommendation.rating]}
                      </Badge>
                      <span className="text-sm text-foreground-muted">
                        Confidence: {report.ai_recommendation.confidence}%
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-foreground-muted">Target Price</p>
                      <p className="font-bold">
                        {formatCurrency(report.ai_recommendation.price_targets.mid)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm">{report.executive_summary}</p>
                </CardContent>
              </Card>

              {/* Price Targets */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Mục tiêu giá
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-xs text-foreground-muted">Thấp</p>
                      <p className="font-mono font-bold text-danger">
                        {formatCurrency(report.ai_recommendation.price_targets.low)}
                      </p>
                    </div>
                    <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-danger via-warning to-success rounded-full" />
                    <div className="text-center">
                      <p className="text-xs text-foreground-muted">Cao</p>
                      <p className="font-mono font-bold text-success">
                        {formatCurrency(report.ai_recommendation.price_targets.high)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Phân tích tài chính
                    <Badge variant="outline" className="ml-auto">
                      Score: {report.financial_analysis.health_score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground-secondary">
                    {report.financial_analysis.analysis}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {report.financial_analysis.highlights.map((h, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-2 rounded-lg text-sm',
                          h.assessment === 'positive' && 'bg-success/10',
                          h.assessment === 'negative' && 'bg-danger/10',
                          h.assessment === 'neutral' && 'bg-surface-2'
                        )}
                      >
                        <p className="font-medium">{h.metric}</p>
                        <p className="text-xs text-foreground-muted">{h.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technical Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Phân tích kỹ thuật
                    <Badge
                      variant="outline"
                      className={cn(
                        'ml-auto',
                        report.technical_analysis.trend === 'uptrend' &&
                        'text-success border-success',
                        report.technical_analysis.trend === 'downtrend' &&
                        'text-danger border-danger'
                      )}
                    >
                      {report.technical_analysis.trend.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground-secondary">
                    {report.technical_analysis.analysis}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-foreground-muted mb-1">Hỗ trợ</p>
                      {report.technical_analysis.support_levels.map((level, i) => (
                        <p key={i} className="font-mono text-danger">
                          {formatCurrency(level)}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-foreground-muted mb-1">Kháng cự</p>
                      {report.technical_analysis.resistance_levels.map(
                        (level, i) => (
                          <p key={i} className="font-mono text-success">
                            {formatCurrency(level)}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risks & Opportunities */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-danger">
                      <AlertTriangle className="h-4 w-4" />
                      Rủi ro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {report.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-danger">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-success">
                      <Lightbulb className="h-4 w-4" />
                      Cơ hội
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {report.opportunities.map((opp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-success">•</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-foreground-muted text-center p-4 bg-surface-2 rounded-lg">
                Báo cáo này được tạo bởi AI và chỉ mang tính chất tham khảo.
                Vui lòng tự nghiên cứu trước khi đầu tư.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="h-16 w-16 text-[var(--color-text-muted)] mb-4 opacity-50" />
              <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2">
                Chưa có báo cáo cho {symbol}
              </h3>
              <p className="text-[13px] text-[var(--color-text-muted)] max-w-[300px] mb-4">
                Nhấn nút "Tạo báo cáo" để AI phân tích và tạo báo cáo nghiên cứu cho cổ phiếu này.
              </p>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90"
              >
                {generateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Tạo báo cáo AI
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
