import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  GitBranch,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { MarketSummaryCard, SectorAnalysis } from '@/components/ai'
import { useMarketSummary } from '@/hooks/use-ai-chat'
import { useAuthStore } from '@/stores/auth-store'
import { GuestRestricted } from '@/components/guest-restricted'
import { aitoolsService } from '@/services/aitools-service'

type TimeFilter = 'today' | 'week' | 'month'

// TopMoversCard - Uses real API
function TopMoversCard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['top-movers'],
    queryFn: () => aitoolsService.getTopMovers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--color-brand)]" />
            Top Movers Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--color-brand)]" />
            Top Movers Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Không thể tải dữ liệu. Vui lòng thử lại sau.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--color-brand)]" />
            Top Movers Analysis
          </CardTitle>
          {data.market_mood && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px]",
                data.market_mood === 'bullish' && 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]',
                data.market_mood === 'bearish' && 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]',
                data.market_mood === 'neutral' && 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
              )}
            >
              {data.market_mood === 'bullish' ? '🐂 Bullish' :
                data.market_mood === 'bearish' ? '🐻 Bearish' : '⚖️ Neutral'}
            </Badge>
          )}
        </div>
        {data.summary && (
          <p className="text-[12px] text-[var(--color-text-muted)] mt-2">
            {data.summary}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gainers */}
        <div className="space-y-3">
          <h4 className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-positive)] flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Tăng mạnh nhất
          </h4>
          <div className="space-y-3">
            {data.gainers?.map((stock) => (
              <div
                key={stock.symbol}
                className="p-3 rounded-lg bg-[var(--color-positive)]/5 border border-[var(--color-positive)]/20"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                      {stock.symbol}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {stock.name}
                    </span>
                  </div>
                  <Badge className="bg-[var(--color-positive)]/10 text-[var(--color-positive)] text-[11px] font-mono">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    +{stock.change?.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  💡 {stock.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="space-y-3">
          <h4 className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-negative)] flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5" />
            Giảm mạnh nhất
          </h4>
          <div className="space-y-3">
            {data.losers?.map((stock) => (
              <div
                key={stock.symbol}
                className="p-3 rounded-lg bg-[var(--color-negative)]/5 border border-[var(--color-negative)]/20"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                      {stock.symbol}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {stock.name}
                    </span>
                  </div>
                  <Badge className="bg-[var(--color-negative)]/10 text-[var(--color-negative)] text-[11px] font-mono">
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    {stock.change?.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  ⚠️ {stock.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// WeeklyOutlookCard - Uses real API
function WeeklyOutlookCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['weekly-outlook'],
    queryFn: () => aitoolsService.getWeeklyOutlook(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--color-brand)]" />
            Triển vọng tuần tới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--color-brand)]" />
            Triển vọng tuần tới
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] text-[var(--color-text-muted)]">
            Đang cập nhật dự báo...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--color-brand)]" />
          Triển vọng tuần tới
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
          {data.summary}
        </p>

        {/* Key Events */}
        {data.key_events && data.key_events.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Sự kiện quan trọng
            </h4>
            <div className="space-y-2">
              {data.key_events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-bg-secondary)]"
                >
                  <span className="text-[11px] font-medium text-[var(--color-brand)] w-16">
                    {event.date}
                  </span>
                  <span className="text-[12px] text-[var(--color-text-secondary)]">
                    {event.event}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bullish/Bearish Picks */}
        <div className="grid grid-cols-2 gap-3">
          {data.bullish_picks && data.bullish_picks.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-medium uppercase text-[var(--color-positive)]">
                🐂 Bullish
              </h4>
              <div className="flex flex-wrap gap-1">
                {data.bullish_picks.map((symbol) => (
                  <Badge key={symbol} variant="secondary" className="text-[10px] bg-[var(--color-positive)]/10 text-[var(--color-positive)]">
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {data.bearish_risks && data.bearish_risks.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-medium uppercase text-[var(--color-negative)]">
                🐻 Rủi ro
              </h4>
              <div className="flex flex-wrap gap-1">
                {data.bearish_risks.map((symbol) => (
                  <Badge key={symbol} variant="secondary" className="text-[10px] bg-[var(--color-negative)]/10 text-[var(--color-negative)]">
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Watchlist */}
        {data.stocks_to_watch && data.stocks_to_watch.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Mã cần theo dõi
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.stocks_to_watch.map((symbol) => (
                <Badge
                  key={symbol}
                  variant="secondary"
                  className="text-[11px] font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] hover:bg-[var(--color-brand)]/20 cursor-pointer"
                >
                  {symbol}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// TradingSignalsCard - NEW Feature
function TradingSignalsCard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trading-signals'],
    queryFn: () => aitoolsService.getTradingSignals(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--color-brand)]" />
            Trading Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.signals || data.signals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--color-brand)]" />
            Trading Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Không có tín hiệu giao dịch mới.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--color-brand)]" />
            Trading Signals
          </CardTitle>
          <div className="flex items-center gap-2">
            {data.market_bias && (
              <Badge variant="secondary" className={cn(
                "text-[10px]",
                data.market_bias === 'bullish' && 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]',
                data.market_bias === 'bearish' && 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]',
              )}>
                {data.market_bias}
              </Badge>
            )}
            {data.risk_level && (
              <Badge variant="secondary" className={cn(
                "text-[10px]",
                data.risk_level === 'low' && 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]',
                data.risk_level === 'high' && 'bg-[var(--color-negative)]/10 text-[var(--color-negative)]',
                data.risk_level === 'medium' && 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
              )}>
                Risk: {data.risk_level}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.signals.map((signal, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border",
              signal.action === 'BUY' && 'bg-[var(--color-positive)]/5 border-[var(--color-positive)]/20',
              signal.action === 'SELL' && 'bg-[var(--color-negative)]/5 border-[var(--color-negative)]/20',
              signal.action === 'HOLD' && 'bg-[var(--color-warning)]/5 border-[var(--color-warning)]/20'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold">{signal.symbol}</span>
                <Badge className={cn(
                  "text-[11px] font-semibold",
                  signal.action === 'BUY' && 'bg-[var(--color-positive)] text-white',
                  signal.action === 'SELL' && 'bg-[var(--color-negative)] text-white',
                  signal.action === 'HOLD' && 'bg-[var(--color-warning)] text-white'
                )}>
                  {signal.action}
                </Badge>
                {signal.strength && (
                  <Badge variant="outline" className="text-[10px]">
                    {signal.strength}
                  </Badge>
                )}
              </div>
              {signal.timeframe && (
                <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {signal.timeframe}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-2 text-[11px]">
              {signal.entry_price && (
                <div>
                  <span className="text-[var(--color-text-muted)]">Entry</span>
                  <p className="font-mono font-semibold">${signal.entry_price.toFixed(2)}</p>
                </div>
              )}
              {signal.stop_loss && (
                <div>
                  <span className="text-[var(--color-negative)]">Stop Loss</span>
                  <p className="font-mono font-semibold">${signal.stop_loss.toFixed(2)}</p>
                </div>
              )}
              {signal.take_profit && (
                <div>
                  <span className="text-[var(--color-positive)]">Take Profit</span>
                  <p className="font-mono font-semibold">${signal.take_profit.toFixed(2)}</p>
                </div>
              )}
            </div>

            {signal.reason && (
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                {signal.reason}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// CorrelationCard - NEW Feature
function CorrelationCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['correlation'],
    queryFn: () => aitoolsService.getCorrelationAnalysis(),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[var(--color-brand)]" />
            Stock Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[var(--color-brand)]" />
          Stock Correlation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Correlation */}
        {data.high_correlation_pairs && data.high_correlation_pairs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium uppercase text-[var(--color-text-muted)]">
              Tương quan cao (cùng chiều)
            </h4>
            {data.high_correlation_pairs.map((pair, i) => (
              <div key={i} className="p-2 rounded-lg bg-[var(--color-bg-secondary)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold">
                    {pair.pair?.join(' ↔ ')}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {(pair.correlation * 100).toFixed(0)}%
                  </Badge>
                </div>
                {pair.insight && (
                  <p className="text-[11px] text-[var(--color-text-muted)]">{pair.insight}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Low Correlation */}
        {data.low_correlation_pairs && data.low_correlation_pairs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium uppercase text-[var(--color-text-muted)]">
              Tương quan thấp (đa dạng hóa)
            </h4>
            {data.low_correlation_pairs.map((pair, i) => (
              <div key={i} className="p-2 rounded-lg bg-[var(--color-positive)]/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold">
                    {pair.pair?.join(' ↔ ')}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono bg-[var(--color-positive)]/10 text-[var(--color-positive)]">
                    {(pair.correlation * 100).toFixed(0)}%
                  </Badge>
                </div>
                {pair.insight && (
                  <p className="text-[11px] text-[var(--color-text-muted)]">{pair.insight}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sector Leaders */}
        {data.sector_leaders && data.sector_leaders.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium uppercase text-[var(--color-text-muted)]">
              Dẫn đầu ngành
            </h4>
            <div className="flex gap-2 flex-wrap">
              {data.sector_leaders.map((symbol) => (
                <Badge key={symbol} className="bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  👑 {symbol}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Diversification Tip */}
        {data.diversification_tip && (
          <div className="p-3 rounded-lg bg-[var(--color-brand)]/5 border border-[var(--color-brand)]/20">
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              💡 <strong>Gợi ý:</strong> {data.diversification_tip}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InsightsPage() {
  const { isGuest } = useAuthStore()

  // Show guest restriction if user is guest
  if (isGuest) {
    return <GuestRestricted featureName="AI Insights" />
  }

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today')
  const { refreshSummary, isLoading } = useMarketSummary()

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="AI Insights"
        description="Phân tích và nhận định thị trường từ AI"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter */}
            <div className="flex bg-[var(--color-bg-secondary)] rounded-lg p-1 overflow-x-auto scrollbar-hide">
              {(['today', 'week', 'month'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    'px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors',
                    timeFilter === filter
                      ? 'bg-[var(--color-brand)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {filter === 'today' ? 'Hôm nay' : filter === 'week' ? 'Tuần này' : 'Tháng này'}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSummary}
              disabled={isLoading}
              className="h-8 text-[13px] border-[var(--color-border)]"
            >
              <RefreshCw className={cn('h-3.5 w-3.5 mr-2', isLoading && 'animate-spin')} />
              Làm mới
            </Button>
          </div>
        }
      />

      {/* Hero Section - Market Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MarketSummaryCard />
        </div>
        <WeeklyOutlookCard />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="movers" className="w-full">
        <TabsList className="w-full justify-start bg-[var(--color-bg-secondary)] p-1 overflow-x-auto scrollbar-hide flex-nowrap h-auto">
          <TabsTrigger value="movers" className="text-[12px]">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Top Movers
          </TabsTrigger>
          <TabsTrigger value="signals" className="text-[12px]">
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Trading Signals
          </TabsTrigger>
          <TabsTrigger value="sectors" className="text-[12px]">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Phân tích ngành
          </TabsTrigger>
          <TabsTrigger value="correlation" className="text-[12px]">
            <GitBranch className="h-3.5 w-3.5 mr-1.5" />
            Correlation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movers" className="mt-6">
          <TopMoversCard />
        </TabsContent>

        <TabsContent value="signals" className="mt-6">
          <TradingSignalsCard />
        </TabsContent>

        <TabsContent value="sectors" className="mt-6">
          <SectorAnalysis />
        </TabsContent>

        <TabsContent value="correlation" className="mt-6">
          <CorrelationCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InsightsPage
