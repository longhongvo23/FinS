import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/page-header'
import {
    TrendingUp,
    TrendingDown,
    FileText,
    Bell,
    RefreshCw,
    BarChart3,
    AlertTriangle,
    ArrowUpRight,
    Target,
    Shield,
    Zap,
    Scale,
} from 'lucide-react'
import { FullResearchReport } from './components/full-research-report'
import { QuickStatCard } from './components/quick-stat-card'
import { useAuthStore } from '@/stores/auth-store'
import { useWatchlistStore } from '@/stores/watchlist-store'
import { GuestRestricted } from '@/components/guest-restricted'
import { aitoolsService, WatchlistSummary, WatchlistAlerts, StockComparisonResponse } from '@/services/aitools-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ResearchDashboard() {
    const { isGuest, isAuthenticated } = useAuthStore()
    const { watchlists, activeWatchlistId, loadWatchlistFromAPI } = useWatchlistStore()

    // Sync watchlist from backend API on mount to get latest data
    useEffect(() => {
        if (isAuthenticated && !isGuest) {
            loadWatchlistFromAPI()
        }
    }, [isAuthenticated, isGuest, loadWatchlistFromAPI])

    // Show guest restriction if user is guest
    if (isGuest) {
        return <GuestRestricted featureName="AI Research" />
    }

    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

    // Get watchlist symbols
    const watchlistSymbols = useMemo(() => {
        const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId)
        if (activeWatchlist) {
            return activeWatchlist.stocks.map(s => s.symbol)
        }
        // Fallback: get all stocks from all watchlists
        const allSymbols = new Set<string>()
        watchlists.forEach(w => w.stocks.forEach(s => allSymbols.add(s.symbol)))
        return Array.from(allSymbols)
    }, [watchlists, activeWatchlistId])

    // Fetch watchlist summary
    const {
        data: watchlistSummary,
        isLoading: isSummaryLoading,
        refetch: refetchSummary,
    } = useQuery({
        queryKey: ['watchlist-summary', JSON.stringify(watchlistSymbols)],
        queryFn: () => watchlistSymbols.length > 0
            ? aitoolsService.getWatchlistResearch(watchlistSymbols)
            : Promise.resolve(null),
        enabled: watchlistSymbols.length > 0,
        staleTime: 30 * 1000, // 30 seconds for responsive updates
        refetchOnMount: 'always',
    })

    // Fetch alerts
    const {
        data: watchlistAlerts,
        isLoading: isAlertsLoading,
        refetch: refetchAlerts,
    } = useQuery({
        queryKey: ['watchlist-alerts', JSON.stringify(watchlistSymbols)],
        queryFn: () => watchlistSymbols.length > 0
            ? aitoolsService.getWatchlistAlerts(watchlistSymbols)
            : Promise.resolve(null),
        enabled: watchlistSymbols.length > 0,
        staleTime: 30 * 1000, // 30 seconds for responsive updates
        refetchOnMount: 'always',
    })

    // Fetch comparison
    const {
        data: stockComparison,
        isLoading: isComparisonLoading,
        refetch: refetchComparison,
    } = useQuery({
        queryKey: ['watchlist-comparison', JSON.stringify(watchlistSymbols)],
        queryFn: () => watchlistSymbols.length > 0
            ? aitoolsService.getWatchlistComparison(watchlistSymbols)
            : Promise.resolve(null),
        enabled: watchlistSymbols.length > 0,
        staleTime: 30 * 1000, // 30 seconds for responsive updates
        refetchOnMount: 'always',
    })

    const handleRefresh = () => {
        refetchSummary()
        refetchAlerts()
        refetchComparison()
        toast.success('Đang cập nhật phân tích...')
    }

    const buyRecommendations = watchlistSummary?.bullish_count || 0
    const unreadAlerts = watchlistAlerts?.high_priority_count || 0
    const portfolioScore = watchlistSummary?.portfolio_score || 0

    // No watchlist stocks
    if (watchlistSymbols.length === 0) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="AI Research Center"
                    description="Phân tích AI tự động cho danh sách theo dõi của bạn"
                />
                <div className="p-12 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
                    <p className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
                        Chưa có mã cổ phiếu nào trong watchlist
                    </p>
                    <p className="text-[13px] text-[var(--color-text-muted)]">
                        Thêm các mã cổ phiếu vào watchlist để nhận phân tích AI tự động
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="AI Research Center"
                description={`Phân tích AI tự động cho ${watchlistSymbols.length} mã cổ phiếu trong watchlist`}
                actions={
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[13px] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-2" />
                        Cập nhật
                    </Button>
                }
            />

            {/* Alerts Banner */}
            {watchlistAlerts && watchlistAlerts.alerts.length > 0 && (
                <AlertsBanner alerts={watchlistAlerts} />
            )}

            {/* Main Content */}
            <Tabs defaultValue="overview">
                <TabsList className="bg-[var(--color-bg-secondary)] p-1">
                    <TabsTrigger value="overview" className="text-[12px]">
                        <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="comparison" className="text-[12px]">
                        <Scale className="h-3.5 w-3.5 mr-1.5" />
                        So sánh
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="text-[12px]">
                        <Bell className="h-3.5 w-3.5 mr-1.5" />
                        Cảnh báo
                        {unreadAlerts > 0 && (
                            <Badge variant="destructive" className="ml-1.5 h-4 min-w-4 text-[10px]">
                                {unreadAlerts}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="text-[12px]">
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        Báo cáo
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <QuickStatCard
                            title="Mã theo dõi"
                            value={watchlistSymbols.length}
                            icon={TrendingUp}
                        />
                        <QuickStatCard
                            title="Khuyến nghị MUA"
                            value={buyRecommendations}
                            icon={TrendingUp}
                            color="text-success"
                        />
                        <QuickStatCard
                            title="Cảnh báo quan trọng"
                            value={unreadAlerts}
                            icon={Bell}
                            color="text-warning"
                        />
                        <QuickStatCard
                            title="Điểm danh mục"
                            value={portfolioScore}
                            icon={Target}
                        />
                    </div>

                    {/* Summary Card */}
                    {isSummaryLoading ? (
                        <SummarySkeleton />
                    ) : watchlistSummary ? (
                        <WatchlistSummaryCard summary={watchlistSummary} onSelectSymbol={setSelectedSymbol} />
                    ) : (
                        <div className="p-8 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] text-center">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-warning" />
                            <p className="text-[13px] text-[var(--color-text-muted)]">
                                Không thể tải phân tích. Vui lòng thử lại.
                            </p>
                        </div>
                    )}

                    {/* Recommendations Grid */}
                    {watchlistSummary?.recommendations && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {watchlistSummary.recommendations.map((rec) => (
                                <RecommendationCard
                                    key={rec.symbol}
                                    recommendation={rec}
                                    onClick={() => setSelectedSymbol(rec.symbol)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="comparison" className="mt-4">
                    {isComparisonLoading ? (
                        <ComparisonSkeleton />
                    ) : stockComparison ? (
                        <StockComparisonCard comparison={stockComparison} onSelectSymbol={setSelectedSymbol} />
                    ) : (
                        <div className="p-8 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] text-center">
                            <Scale className="h-8 w-8 mx-auto mb-3 text-[var(--color-text-muted)]" />
                            <p className="text-[13px] text-[var(--color-text-muted)]">
                                Không thể tải so sánh. Vui lòng thử lại.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="alerts" className="mt-4">
                    {isAlertsLoading ? (
                        <AlertsSkeleton />
                    ) : watchlistAlerts && watchlistAlerts.alerts.length > 0 ? (
                        <AlertsListCard alerts={watchlistAlerts} />
                    ) : (
                        <div className="p-8 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] text-center">
                            <Bell className="h-8 w-8 mx-auto mb-3 text-[var(--color-text-muted)]" />
                            <p className="text-[13px] text-[var(--color-text-muted)]">
                                Không có cảnh báo nào cho watchlist của bạn
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reports" className="mt-4">
                    {selectedSymbol ? (
                        <FullResearchReport
                            symbol={selectedSymbol}
                            onClose={() => setSelectedSymbol(null)}
                        />
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[13px] text-[var(--color-text-muted)]">
                                Chọn một mã cổ phiếu để xem báo cáo chi tiết
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {watchlistSymbols.map((symbol) => (
                                    <Button
                                        key={symbol}
                                        variant="outline"
                                        className="h-12"
                                        onClick={() => setSelectedSymbol(symbol)}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        {symbol}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Full Report Modal */}
            {selectedSymbol && (
                <FullResearchReport
                    symbol={selectedSymbol}
                    onClose={() => setSelectedSymbol(null)}
                />
            )}
        </div>
    )
}

// ==================== Sub Components ====================

function AlertsBanner({ alerts }: { alerts: WatchlistAlerts }) {
    const highPriorityAlerts = alerts.alerts.filter(a => a.severity === 'HIGH')
    if (highPriorityAlerts.length === 0) return null

    return (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-[14px] font-semibold text-warning mb-1">
                        {highPriorityAlerts.length} Cảnh báo quan trọng
                    </h3>
                    <p className="text-[13px] text-[var(--color-text-muted)]">
                        {highPriorityAlerts[0].title}: {highPriorityAlerts[0].message}
                    </p>
                </div>
            </div>
        </div>
    )
}

function WatchlistSummaryCard({ summary, onSelectSymbol }: { summary: WatchlistSummary; onSelectSymbol: (s: string) => void }) {
    const sentimentColors = {
        bullish: 'text-success',
        bearish: 'text-danger',
        neutral: 'text-warning',
    }

    return (
        <div className="p-6 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
                    Phân tích Watchlist
                </h3>
                <Badge className={cn('text-[11px]', sentimentColors[summary.overall_sentiment])}>
                    {summary.overall_sentiment === 'bullish' ? '🟢 Tích cực' :
                        summary.overall_sentiment === 'bearish' ? '🔴 Tiêu cực' : '🟡 Trung lập'}
                </Badge>
            </div>

            <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
                {summary.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-[12px] font-medium text-success">Top Pick</span>
                    </div>
                    <button
                        onClick={() => onSelectSymbol(summary.top_pick)}
                        className="text-[16px] font-bold text-[var(--color-text-primary)] hover:text-brand transition-colors"
                    >
                        {summary.top_pick}
                    </button>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 line-clamp-2">
                        {summary.top_pick_reason}
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-danger/10 border border-danger/30">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-danger" />
                        <span className="text-[12px] font-medium text-danger">Cần theo dõi</span>
                    </div>
                    <button
                        onClick={() => onSelectSymbol(summary.worst_performer)}
                        className="text-[16px] font-bold text-[var(--color-text-primary)] hover:text-brand transition-colors"
                    >
                        {summary.worst_performer}
                    </button>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 line-clamp-2">
                        {summary.worst_reason}
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-brand/10 border border-brand/30">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-brand" />
                        <span className="text-[12px] font-medium text-brand">Phân bổ ngành</span>
                    </div>
                    <p className="text-[12px] text-[var(--color-text-muted)] line-clamp-3">
                        {summary.sector_analysis}
                    </p>
                </div>
            </div>

            <div className="flex gap-4 text-[12px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Bullish: {summary.bullish_count}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    Neutral: {summary.neutral_count}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    Bearish: {summary.bearish_count}
                </span>
            </div>
        </div>
    )
}

function RecommendationCard({
    recommendation,
    onClick
}: {
    recommendation: { symbol: string; action: string; priority: number }
    onClick: () => void
}) {
    const actionColors: Record<string, string> = {
        STRONG_BUY: 'bg-[var(--color-strong-positive-soft)] border-[var(--color-strong-positive-soft)] text-[var(--color-strong-positive)]',
        BUY: 'bg-[var(--color-positive-soft)] border-[var(--color-positive-soft)] text-[var(--color-positive)]',
        HOLD: 'bg-[var(--color-warning-soft)] border-[var(--color-warning-soft)] text-[var(--color-warning)]',
        SELL: 'bg-[var(--color-negative-soft)] border-[var(--color-negative-soft)] text-[var(--color-negative)]',
        STRONG_SELL: 'bg-[var(--color-strong-negative-soft)] border-[var(--color-strong-negative-soft)] text-[var(--color-strong-negative)]',
    }

    const actionLabels: Record<string, string> = {
        STRONG_BUY: '🟢 MUA MẠNH',
        BUY: '🟢 MUA',
        HOLD: '🟡 GIỮ',
        SELL: '🔴 BÁN',
        STRONG_SELL: '🔴 BÁN MẠNH',
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                'p-4 rounded-xl border text-left transition-all hover:scale-[1.02]',
                actionColors[recommendation.action as keyof typeof actionColors] || actionColors.HOLD
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[16px] font-bold text-[var(--color-text-primary)]">
                    {recommendation.symbol}
                </span>
                <Badge variant="outline" className="text-[10px]">
                    #{recommendation.priority}
                </Badge>
            </div>
            <span className="text-[13px] font-medium">
                {actionLabels[recommendation.action as keyof typeof actionLabels]}
            </span>
        </button>
    )
}

function StockComparisonCard({
    comparison,
    onSelectSymbol
}: {
    comparison: StockComparisonResponse
    onSelectSymbol: (s: string) => void
}) {
    return (
        <div className="space-y-4">
            {/* Quick Picks */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-brand" />
                        <span className="text-[11px] text-[var(--color-text-muted)]">Best Value</span>
                    </div>
                    <button
                        onClick={() => onSelectSymbol(comparison.best_value)}
                        className="text-[16px] font-bold text-[var(--color-text-primary)] hover:text-brand"
                    >
                        {comparison.best_value}
                    </button>
                </div>
                <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-warning" />
                        <span className="text-[11px] text-[var(--color-text-muted)]">Best Momentum</span>
                    </div>
                    <button
                        onClick={() => onSelectSymbol(comparison.best_momentum)}
                        className="text-[16px] font-bold text-[var(--color-text-primary)] hover:text-brand"
                    >
                        {comparison.best_momentum}
                    </button>
                </div>
                <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-success" />
                        <span className="text-[11px] text-[var(--color-text-muted)]">Lowest Risk</span>
                    </div>
                    <button
                        onClick={() => onSelectSymbol(comparison.lowest_risk)}
                        className="text-[16px] font-bold text-[var(--color-text-primary)] hover:text-brand"
                    >
                        {comparison.lowest_risk}
                    </button>
                </div>
                <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight className="h-4 w-4 text-brand" />
                        <span className="text-[11px] text-[var(--color-text-muted)]">Highest Growth</span>
                    </div>
                    <button
                        onClick={() => onSelectSymbol(comparison.highest_growth)}
                        className="text-[16px] font-bold text-[var(--color-text-primary)] hover:text-brand"
                    >
                        {comparison.highest_growth}
                    </button>
                </div>
            </div>

            {/* Comparison Matrix */}
            <div className="rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden">
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                        Bảng so sánh
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--color-bg-secondary)]">
                                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--color-text-muted)]">Rank</th>
                                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--color-text-muted)]">Symbol</th>
                                <th className="px-4 py-3 text-center text-[11px] font-medium text-[var(--color-text-muted)]">Momentum</th>
                                <th className="px-4 py-3 text-center text-[11px] font-medium text-[var(--color-text-muted)]">Value</th>
                                <th className="px-4 py-3 text-center text-[11px] font-medium text-[var(--color-text-muted)]">Risk</th>
                                <th className="px-4 py-3 text-left text-[11px] font-medium text-[var(--color-text-muted)]">Lý do</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.comparison_matrix.map((item) => (
                                <tr key={item.symbol} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]">
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="text-[11px]">#{item.rank}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onSelectSymbol(item.symbol)}
                                            className="text-[13px] font-semibold text-brand hover:underline"
                                        >
                                            {item.symbol}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <ScoreBadge score={item.momentum_score} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <ScoreBadge score={item.value_score} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <ScoreBadge score={item.risk_score} inverted />
                                    </td>
                                    <td className="px-4 py-3 text-[12px] text-[var(--color-text-muted)] max-w-[200px] truncate">
                                        {item.overall_rank_reason}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Portfolio Suggestion */}
            <div className="p-4 rounded-xl border bg-brand/5 border-brand/30">
                <h4 className="text-[13px] font-semibold text-brand mb-2">💡 Gợi ý danh mục</h4>
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                    {comparison.portfolio_suggestion}
                </p>
            </div>
        </div>
    )
}

function ScoreBadge({ score, inverted = false }: { score: number; inverted?: boolean }) {
    let color = 'bg-success/20 text-success'
    if (inverted) {
        // For risk: higher is worse
        if (score >= 70) color = 'bg-danger/20 text-danger'
        else if (score >= 40) color = 'bg-warning/20 text-warning'
    } else {
        if (score < 40) color = 'bg-danger/20 text-danger'
        else if (score < 70) color = 'bg-warning/20 text-warning'
    }

    return (
        <span className={cn('px-2 py-0.5 rounded text-[11px] font-medium', color)}>
            {score}
        </span>
    )
}

function AlertsListCard({ alerts }: { alerts: WatchlistAlerts }) {
    const severityColors = {
        HIGH: 'border-danger/50 bg-danger/5',
        MEDIUM: 'border-warning/50 bg-warning/5',
        LOW: 'border-[var(--color-border)]',
    }

    const severityIcons = {
        HIGH: <AlertTriangle className="h-4 w-4 text-danger" />,
        MEDIUM: <Bell className="h-4 w-4 text-warning" />,
        LOW: <Bell className="h-4 w-4 text-[var(--color-text-muted)]" />,
    }

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                    {alerts.summary}
                </p>
            </div>

            <div className="space-y-3">
                {alerts.alerts.map((alert, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            'p-4 rounded-xl border',
                            severityColors[alert.severity]
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {severityIcons[alert.severity]}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[14px] font-semibold text-brand">
                                        {alert.symbol}
                                    </span>
                                    <Badge variant="outline" className="text-[10px]">
                                        {alert.type.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <h4 className="text-[13px] font-medium text-[var(--color-text-primary)] mb-1">
                                    {alert.title}
                                </h4>
                                <p className="text-[12px] text-[var(--color-text-muted)] mb-2">
                                    {alert.message}
                                </p>
                                <p className="text-[12px] text-brand font-medium">
                                    👉 {alert.action_suggested}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ==================== Skeletons ====================

function SummarySkeleton() {
    return (
        <div className="p-6 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
            </div>
        </div>
    )
}

function ComparisonSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
        </div>
    )
}

function AlertsSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
        </div>
    )
}

export default ResearchDashboard
