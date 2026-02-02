/**
 * AITools Service for FinS
 * Connects to AIToolsService (Java/Gemini) for AI insights, research, and chat
 */

import { apiClient, API_ENDPOINTS } from './api-client'

// ==================== Types ====================

export interface DailyMarketInsight {
    id: string
    reportDate: string
    marketTrend: string
    summaryTitle: string
    summaryContent: string
    highlightsJson: string
    createdAt: string
    industries?: IndustryAnalysis[]
}

export interface IndustryAnalysis {
    id: string
    reportDate: string
    industryName: string
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
    summary: string
    relatedStocks: string
    createdAt: string
}

export interface StockResearchReport {
    id: string
    symbol: string
    createdDate: string
    recommendation: 'BUY' | 'HOLD' | 'SELL'
    targetPrice: number
    currentPrice: number
    upsidePercentage: number
    financialScore: number
    technicalScore: number
    sentimentScore: number
    overallScore: number
    analysisSummary: string
    keyFactors: string
    riskFactors: string
}

export interface ChatMessage {
    id: string
    userId: string
    sessionId: string
    userQuestion: string
    botResponse: string
    context?: string
    timestamp: string
}

export interface ChatRequest {
    question: string
    sessionId?: string
}

export interface ChatResponse {
    response: string
    sessionId: string
    timestamp: string
}

// Parsed types for UI
export interface Highlight {
    title: string
    description: string
}

export interface KeyFactor {
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
}

// ==================== Service ====================

export const aitoolsService = {
    // ==================== Market Insights ====================

    /**
     * Get today's market insights
     */
    async getTodayInsights(): Promise<DailyMarketInsight | null> {
        try {
            return await apiClient.get<DailyMarketInsight>(API_ENDPOINTS.aitools.insightsToday)
        } catch {
            return null
        }
    },

    /**
     * Get recent market insights (last 7 days)
     */
    async getRecentInsights(): Promise<DailyMarketInsight[]> {
        try {
            return await apiClient.get<DailyMarketInsight[]>(API_ENDPOINTS.aitools.insights)
        } catch {
            return []
        }
    },

    /**
     * Trigger manual insights generation
     */
    async generateInsights(): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>(API_ENDPOINTS.aitools.generateInsights)
    },

    /**
     * Parse highlights from JSON string
     */
    parseHighlights(highlightsJson: string | null): Highlight[] {
        if (!highlightsJson) return []
        try {
            return JSON.parse(highlightsJson) as Highlight[]
        } catch {
            return []
        }
    },

    // ==================== Industry Analysis ====================

    /**
     * Get recent industry analyses
     */
    async getIndustryAnalyses(): Promise<IndustryAnalysis[]> {
        try {
            return await apiClient.get<IndustryAnalysis[]>(API_ENDPOINTS.aitools.industries)
        } catch {
            return []
        }
    },

    /**
     * Get today's industry analyses
     */
    async getTodayIndustryAnalyses(): Promise<IndustryAnalysis[]> {
        try {
            return await apiClient.get<IndustryAnalysis[]>(API_ENDPOINTS.aitools.industriesToday)
        } catch {
            return []
        }
    },

    /**
     * Parse related stocks from comma-separated string
     */
    parseRelatedStocks(relatedStocks: string | null): string[] {
        if (!relatedStocks) return []
        return relatedStocks.split(',').map(s => s.trim()).filter(s => s.length > 0)
    },

    // ==================== Research Reports ====================

    /**
     * Get all recent research reports
     */
    async getResearchReports(): Promise<StockResearchReport[]> {
        try {
            return await apiClient.get<StockResearchReport[]>(API_ENDPOINTS.aitools.research)
        } catch {
            return []
        }
    },

    /**
     * Get latest research report for a symbol
     */
    async getResearchReport(symbol: string): Promise<StockResearchReport | null> {
        try {
            return await apiClient.get<StockResearchReport>(API_ENDPOINTS.aitools.researchBySymbol(symbol))
        } catch {
            return null
        }
    },

    /**
     * Generate new research report for a symbol
     */
    async generateResearchReport(symbol: string): Promise<StockResearchReport> {
        return apiClient.post<StockResearchReport>(API_ENDPOINTS.aitools.generateResearch(symbol))
    },

    /**
     * Parse key factors from JSON string
     */
    parseKeyFactors(keyFactorsJson: string | null): KeyFactor[] {
        if (!keyFactorsJson) return []
        try {
            return JSON.parse(keyFactorsJson) as KeyFactor[]
        } catch {
            return []
        }
    },

    /**
     * Parse risk factors from JSON string
     */
    parseRiskFactors(riskFactorsJson: string | null): string[] {
        if (!riskFactorsJson) return []
        try {
            return JSON.parse(riskFactorsJson) as string[]
        } catch {
            return []
        }
    },

    // ==================== AI Chat ====================

    /**
     * Send a chat message to AI
     */
    async chat(question: string, sessionId?: string): Promise<ChatResponse> {
        return apiClient.post<ChatResponse>(API_ENDPOINTS.aitools.chat, {
            question,
            sessionId,
        } as ChatRequest)
    },

    /**
     * Get chat history for current user
     */
    async getChatHistory(): Promise<ChatMessage[]> {
        try {
            return await apiClient.get<ChatMessage[]>(API_ENDPOINTS.aitools.chatHistory)
        } catch {
            return []
        }
    },

    // ==================== Utilities ====================

    /**
     * Get recommendation badge color
     */
    getRecommendationColor(recommendation: 'BUY' | 'HOLD' | 'SELL'): string {
        switch (recommendation) {
            case 'BUY':
                return 'var(--color-positive)'
            case 'SELL':
                return 'var(--color-negative)'
            default:
                return 'var(--color-warning)'
        }
    },

    /**
     * Get sentiment badge color
     */
    getSentimentColor(sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string {
        switch (sentiment) {
            case 'POSITIVE':
                return 'var(--color-positive)'
            case 'NEGATIVE':
                return 'var(--color-negative)'
            default:
                return 'var(--color-text-muted)'
        }
    },

    /**
     * Format recommendation for display
     */
    formatRecommendation(recommendation: 'BUY' | 'HOLD' | 'SELL'): string {
        switch (recommendation) {
            case 'BUY':
                return '🟢 MUA'
            case 'SELL':
                return '🔴 BÁN'
            default:
                return '🟡 GIỮ'
        }
    },

    /**
     * Get score color based on value
     */
    getScoreColor(score: number): string {
        if (score >= 70) return 'var(--color-positive)'
        if (score >= 40) return 'var(--color-warning)'
        return 'var(--color-negative)'
    },

    // ==================== Advanced Insights ====================

    /**
     * Get AI-analyzed top movers (gainers/losers)
     */
    async getTopMovers(): Promise<TopMoversResponse | null> {
        try {
            return await apiClient.get<TopMoversResponse>(API_ENDPOINTS.aitools.topMovers)
        } catch {
            return null
        }
    },

    /**
     * Get AI weekly market outlook
     */
    async getWeeklyOutlook(): Promise<WeeklyOutlookResponse | null> {
        try {
            return await apiClient.get<WeeklyOutlookResponse>(API_ENDPOINTS.aitools.weeklyOutlook)
        } catch {
            return null
        }
    },

    /**
     * Get AI trading signals
     */
    async getTradingSignals(): Promise<TradingSignalsResponse | null> {
        try {
            return await apiClient.get<TradingSignalsResponse>(API_ENDPOINTS.aitools.tradingSignals)
        } catch {
            return null
        }
    },

    /**
     * Get stock correlation analysis
     */
    async getCorrelationAnalysis(): Promise<CorrelationResponse | null> {
        try {
            return await apiClient.get<CorrelationResponse>(API_ENDPOINTS.aitools.correlation)
        } catch {
            return null
        }
    },

    // ==================== Watchlist Research ====================

    /**
     * Generate AI research summary for watchlist stocks
     */
    async getWatchlistResearch(symbols: string[]): Promise<WatchlistSummary | null> {
        try {
            return await apiClient.post<WatchlistSummary>(
                API_ENDPOINTS.aitools.watchlistResearch,
                { symbols }
            )
        } catch {
            return null
        }
    },

    /**
     * Get AI-generated alerts for watchlist stocks
     */
    async getWatchlistAlerts(symbols: string[]): Promise<WatchlistAlerts | null> {
        try {
            return await apiClient.post<WatchlistAlerts>(
                API_ENDPOINTS.aitools.watchlistAlerts,
                { symbols }
            )
        } catch {
            return null
        }
    },

    /**
     * Compare and rank watchlist stocks
     */
    async getWatchlistComparison(symbols: string[]): Promise<StockComparisonResponse | null> {
        try {
            return await apiClient.post<StockComparisonResponse>(
                API_ENDPOINTS.aitools.watchlistComparison,
                { symbols }
            )
        } catch {
            return null
        }
    },

    /**
     * Generate detailed research for a single watchlist stock
     */
    async getWatchlistStockResearch(symbol: string): Promise<WatchlistStockResearchResponse | null> {
        try {
            return await apiClient.post<WatchlistStockResearchResponse>(
                API_ENDPOINTS.aitools.watchlistStockResearch(symbol)
            )
        } catch {
            return null
        }
    },
}

// ==================== Advanced Insights Types ====================

export interface TopMoversResponse {
    gainers: StockMover[]
    losers: StockMover[]
    market_mood: 'bullish' | 'bearish' | 'neutral'
    summary: string
}

export interface StockMover {
    symbol: string
    name: string
    change: number
    reason: string
}

export interface WeeklyOutlookResponse {
    summary: string
    key_events: KeyEvent[]
    stocks_to_watch: string[]
    bullish_picks: string[]
    bearish_risks: string[]
    target_levels: Record<string, TargetLevel>
}

export interface KeyEvent {
    date: string
    event: string
}

export interface TargetLevel {
    support: number
    resistance: number
}

export interface TradingSignalsResponse {
    signals: TradingSignal[]
    market_bias: 'bullish' | 'bearish' | 'neutral'
    risk_level: 'low' | 'medium' | 'high'
}

export interface TradingSignal {
    symbol: string
    action: 'BUY' | 'SELL' | 'HOLD'
    strength: 'STRONG' | 'MODERATE' | 'WEAK'
    entry_price: number
    stop_loss: number
    take_profit: number
    reason: string
    timeframe: string
}

export interface CorrelationResponse {
    high_correlation_pairs: CorrelationPair[]
    low_correlation_pairs: CorrelationPair[]
    sector_leaders: string[]
    diversification_tip: string
}

export interface CorrelationPair {
    pair: string[]
    correlation: number
    insight: string
}

// ==================== Watchlist Research Types ====================

export interface WatchlistSummary {
    total_stocks: number
    bullish_count: number
    bearish_count: number
    neutral_count: number
    overall_sentiment: 'bullish' | 'bearish' | 'neutral'
    portfolio_score: number
    top_pick: string
    top_pick_reason: string
    worst_performer: string
    worst_reason: string
    summary: string
    recommendations: WatchlistRecommendation[]
    sector_analysis: string
}

export interface WatchlistRecommendation {
    symbol: string
    action: 'BUY' | 'HOLD' | 'SELL'
    priority: number
}

export interface WatchlistAlerts {
    alerts: WatchlistAlert[]
    total_alerts: number
    high_priority_count: number
    summary: string
}

export interface WatchlistAlert {
    symbol: string
    type: 'PRICE_SURGE' | 'PRICE_DROP' | 'BREAKOUT' | 'BREAKDOWN' | 'BUY_SIGNAL' | 'SELL_SIGNAL' | 'NEWS'
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
    title: string
    message: string
    action_suggested: string
    timestamp: string
}

export interface StockComparisonResponse {
    comparison_matrix: ComparisonItem[]
    best_value: string
    best_momentum: string
    lowest_risk: string
    highest_growth: string
    pair_trade_ideas: PairTrade[]
    portfolio_suggestion: string
}

export interface ComparisonItem {
    symbol: string
    rank: number
    momentum_score: number
    value_score: number
    risk_score: number
    overall_rank_reason: string
}

export interface PairTrade {
    long: string
    short: string
    reason: string
}

export interface WatchlistStockResearchResponse {
    symbol: string
    recommendation: 'BUY' | 'HOLD' | 'SELL'
    confidence_score: number
    current_price: number
    target_price: number
    upside_percentage: number
    technical_score: number
    fundamental_score: number
    sentiment_score: number
    summary: string
    key_factors: ResearchKeyFactor[]
    risk_factors: string[]
    opportunities: string[]
    support_level: number
    resistance_level: number
    stop_loss: number
    analysis_date: string
}

export interface ResearchKeyFactor {
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
}

export default aitoolsService
