export type Sentiment = 'bullish' | 'bearish' | 'neutral'
export type RiskLevel = 'low' | 'medium' | 'high'
export type RecommendationType = 'buy' | 'sell' | 'hold' | 'watch'

export interface AIHighlight {
  title: string
  description: string
  sentiment: Sentiment
  impact: 'high' | 'medium' | 'low'
}

export interface AIStockMovement {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  reason?: string
}

export interface AIRecommendation {
  type: RecommendationType
  symbol: string
  reason: string
  confidence: number
  targetPrice?: number
  stopLoss?: number
}

export interface AIDailyBriefing {
  id?: string
  date?: Date
  marketSummary: string
  sentiment: Sentiment
  highlights: AIHighlight[]
  topGainers: AIStockMovement[]
  topLosers: AIStockMovement[]
  watchlistAlerts?: string[]
  recommendations: AIRecommendation[]
  generatedAt: Date
}

export interface AITechnicalAnalysis {
  trend: 'uptrend' | 'downtrend' | 'sideways'
  support: number
  resistance: number
  rsi: number
  macdSignal: 'buy' | 'sell' | 'neutral'
  volumeTrend: 'increasing' | 'decreasing' | 'stable'
}

export interface AIFundamentalAnalysis {
  peRatio?: number
  pbRatio?: number
  eps?: number
  revenueGrowth?: number
  profitMargin?: number
  debtToEquity?: number
  valuation: 'undervalued' | 'fairly_valued' | 'overvalued'
}

export interface AIStockInsight {
  symbol: string
  name: string
  analysis: string
  sentiment: Sentiment
  score: number
  riskLevel: RiskLevel
  technicals?: AITechnicalAnalysis
  fundamentals?: AIFundamentalAnalysis
  keyPoints: string[]
  recommendation: AIRecommendation
  generatedAt: Date
}

export interface AIPortfolioMetric {
  name: string
  value: number
  status: 'good' | 'warning' | 'danger'
  description: string
}

export interface AIPortfolioHealth {
  overallScore: number
  riskLevel: RiskLevel
  diversificationScore: number
  metrics: AIPortfolioMetric[]
  concerns: string[]
  recommendations: AIRecommendation[]
  generatedAt: Date
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: AIChatAttachment[]
  actions?: AIChatAction[]
  created_at: string
}

export interface AIChatAttachment {
  type: 'stock_card' | 'chart' | 'comparison'
  data: Record<string, unknown>
}

export interface AIChatAction {
  type: 'buy' | 'sell' | 'view' | 'add_watchlist'
  symbol?: string
  label: string
}
