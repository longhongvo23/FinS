/**
 * AI Service for FinS Microservices
 * Connects to AIService (Prophet predictions) instead of OpenAI
 */

import { apiClient, API_ENDPOINTS } from './api-client'

// Request/Response types for FinS AIService
export interface PredictionRequest {
  symbol: string
  forecast_days?: number
}

export interface PredictionResult {
  symbol: string
  current_price: number
  predicted_price: number
  predicted_change_percent: number
  forecast_dates: string[]
  forecast_values: number[]
  confidence_upper: number[]
  confidence_lower: number[]
  trend: 'bullish' | 'bearish' | 'neutral'
  generated_at: string
}

// Forecast chart data types
export interface ForecastDataPoint {
  date: string
  actual: number | null
  predicted: number | null
  lower: number | null
  upper: number | null
}

export interface ForecastChartData {
  symbol: string
  forecast_days: number
  current_price: number
  predicted_price: number
  change_percent: number
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
  data: ForecastDataPoint[]
  created_at: string
  // Data freshness information
  last_data_date?: string  // Last date of historical data (YYYY-MM-DD)
  data_age_days?: number   // How many days old the data is
  is_data_fresh?: boolean  // Whether data is fresh (<= 1 day old)
}

export interface RecommendationResult {
  symbol: string
  period: string
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
  overallRating: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
  metadata?: {
    predicted_price: number
    current_price: number
    change_percent: number
  }
}

export interface SymbolInfo {
  symbol: string
  data_points: number
  last_date: string
  has_enough_data: boolean
}

export interface HealthStatus {
  status: string
  services: {
    mongodb: string
    kafka: string
    consul: string
  }
}

// Message type for chat-like interface
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type: 'text' | 'prediction' | 'recommendation'
  data?: PredictionResult | RecommendationResult
}

// Chat Response type (compatible with original SmartTrade format)
export interface ChatResponse {
  message: string
  conversation_id: string
  suggested_actions?: string[]
  related_stocks?: string[]
}

// Portfolio Health types
export interface PortfolioHealthResponse {
  health_score: number
  metrics: Array<{ name: string; value: number; description: string }>
  concerns: string[]
  recommendations: string[]
}

// Stock Insight types
export interface StockInsightResponse {
  symbol: string
  insight: string
  sentiment: 'positive' | 'negative' | 'neutral'
  key_points: string[]
  technical_analysis: {
    rsi?: number
    macd?: string
    trend?: string
  }
}

// Briefing types
export interface DailyBriefingResponse {
  date: string
  market_summary: string
  highlights: Array<{ title: string; description: string }>
  watchlist_alerts: Array<{ symbol: string; message: string; type: string }>
  top_gainers: Array<{ symbol: string; change_percent: number }>
  top_losers: Array<{ symbol: string; change_percent: number }>
}

// Simple query limiting (client-side only for demo)
const DAILY_LIMIT = 20
const STORAGE_KEY = 'fins_ai_queries'

interface QueryTracker {
  date: string
  count: number
}

function getQueryTracker(): QueryTracker {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const tracker = JSON.parse(stored) as QueryTracker
      const today = new Date().toISOString().split('T')[0]
      if (tracker.date === today) {
        return tracker
      }
    }
  } catch {
    // ignore
  }
  return { date: new Date().toISOString().split('T')[0], count: 0 }
}

function incrementQueryCount(): void {
  const tracker = getQueryTracker()
  tracker.count++
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker))
}

export function getRemainingQueries(): number {
  const tracker = getQueryTracker()
  return Math.max(0, DAILY_LIMIT - tracker.count)
}

export function hasReachedLimit(): boolean {
  return getRemainingQueries() <= 0
}

export const aiService = {
  /**
   * Get AI service health
   */
  async getHealth(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>(API_ENDPOINTS.ai.health)
  },

  /**
   * Get prediction for a symbol
   */
  async getPrediction(symbol: string, forecastDays = 30): Promise<PredictionResult> {
    return apiClient.post<PredictionResult>(API_ENDPOINTS.ai.predict, {
      symbol,
      forecast_days: forecastDays,
    })
  },

  /**
   * Get forecast chart data for a symbol
   */
  async getForecastChart(
    symbol: string,
    forecastDays = 30,
    historyDays = 90
  ): Promise<ForecastChartData> {
    const url = `${API_ENDPOINTS.ai.forecast(symbol)}?forecast_days=${forecastDays}&history_days=${historyDays}`
    return apiClient.get<ForecastChartData>(url)
  },

  /**
   * Get recommendation for a symbol
   */
  async getRecommendation(symbol: string): Promise<RecommendationResult | null> {
    try {
      return await apiClient.get<RecommendationResult>(API_ENDPOINTS.ai.recommendation(symbol))
    } catch {
      return null
    }
  },

  /**
   * Generate new recommendation
   */
  async generateRecommendation(symbol: string, forecastDays = 30): Promise<RecommendationResult> {
    return apiClient.post<RecommendationResult>(API_ENDPOINTS.ai.generateRecommendation, {
      symbol,
      forecast_days: forecastDays,
    })
  },

  /**
   * Get all available symbols with data statistics
   */
  async getSymbols(): Promise<SymbolInfo[]> {
    return apiClient.get<SymbolInfo[]>(API_ENDPOINTS.ai.symbols)
  },

  /**
   * Chat with AI about a stock
   * Returns ChatResponse for compatibility with original SmartTrade format
   */
  async chat(message: string, _conversationId?: string): Promise<ChatResponse> {
    incrementQueryCount()

    // Extract symbol from message
    const symbolMatch = message.match(/\b([A-Z]{2,5})\b/)
    const symbol = symbolMatch?.[1]

    if (!symbol) {
      return {
        message: 'Xin hãy cho tôi biết mã cổ phiếu bạn muốn phân tích. Ví dụ: "Phân tích cổ phiếu FPT"',
        conversation_id: _conversationId || `conv-${Date.now()}`,
        suggested_actions: ['Phân tích VNM', 'Phân tích FPT', 'Phân tích VIC'],
      }
    }

    try {
      // Get prediction and recommendation
      const [prediction, recommendation] = await Promise.all([
        this.getPrediction(symbol),
        this.getRecommendation(symbol),
      ])

      // Format response
      const trend = prediction.predicted_change_percent > 2 ? '📈 tăng' :
        prediction.predicted_change_percent < -2 ? '📉 giảm' : '➡️ đi ngang'

      const ratingMap: Record<string, string> = {
        'STRONG_BUY': '🟢 MUA MẠNH',
        'BUY': '🟢 MUA',
        'HOLD': '🟡 GIỮ',
        'SELL': '🔴 BÁN',
        'STRONG_SELL': '🔴 BÁN MẠNH',
      }

      const rating = recommendation?.overallRating
        ? ratingMap[recommendation.overallRating]
        : 'Chưa có đánh giá'

      const content = `
**Phân tích ${symbol}**

**Dự đoán giá (30 ngày)**
• Giá hiện tại: ${prediction.current_price.toLocaleString()} VNĐ
• Giá dự đoán: ${prediction.predicted_price.toLocaleString()} VNĐ
• Thay đổi dự kiến: ${prediction.predicted_change_percent > 0 ? '+' : ''}${prediction.predicted_change_percent.toFixed(2)}%
• Xu hướng: ${trend}

**Khuyến nghị:** ${rating}

*Phân tích bởi FinS AI sử dụng mô hình Prophet*
      `.trim()

      return {
        message: content,
        conversation_id: _conversationId || `conv-${Date.now()}`,
        suggested_actions: [
          `So sánh ${symbol} với đối thủ`,
          `Tin tức về ${symbol}`,
          'Cổ phiếu nào nên mua?',
        ],
        related_stocks: [symbol],
      }
    } catch {
      return {
        message: `Xin lỗi, tôi không thể phân tích ${symbol} lúc này. Có thể chưa đủ dữ liệu lịch sử.`,
        conversation_id: _conversationId || `conv-${Date.now()}`,
        suggested_actions: ['Thử mã khác', 'Xem thị trường'],
      }
    }
  },

  /**
   * Get daily briefing (mock implementation)
   */
  async getDailyBriefing(_userId: string, _watchlist: string[]): Promise<DailyBriefingResponse> {
    // This would normally fetch from backend, using mock for now
    return {
      date: new Date().toISOString(),
      market_summary: 'Thị trường hôm nay giao dịch tích cực với VN-Index tăng nhẹ.',
      highlights: [
        { title: 'Nhóm ngân hàng dẫn dắt', description: 'Các cổ phiếu ngân hàng tăng mạnh trong phiên' },
        { title: 'Khối ngoại mua ròng', description: 'Khối ngoại tiếp tục mua ròng trên sàn HSX' },
      ],
      watchlist_alerts: [],
      top_gainers: [
        { symbol: 'VCB', change_percent: 2.5 },
        { symbol: 'TCB', change_percent: 2.1 },
      ],
      top_losers: [
        { symbol: 'HPG', change_percent: -1.5 },
        { symbol: 'HSG', change_percent: -1.2 },
      ],
    }
  },

  /**
   * Get portfolio health (mock implementation)
   */
  async getPortfolioHealth(_userId: string, _holdings: unknown[]): Promise<PortfolioHealthResponse> {
    return {
      health_score: 75,
      metrics: [
        { name: 'Đa dạng hóa', value: 70, description: 'Danh mục cần đa dạng hơn về ngành' },
        { name: 'Rủi ro', value: 60, description: 'Mức rủi ro trung bình' },
      ],
      concerns: ['Tập trung quá nhiều vào một ngành'],
      recommendations: ['Xem xét thêm cổ phiếu ngành khác'],
    }
  },

  /**
   * Get stock insight (mock implementation based on prediction)
   */
  async getStockInsight(symbol: string): Promise<StockInsightResponse> {
    try {
      const prediction = await this.getPrediction(symbol)
      const sentiment = prediction.predicted_change_percent > 2 ? 'positive' :
        prediction.predicted_change_percent < -2 ? 'negative' : 'neutral'

      return {
        symbol,
        insight: `Dự đoán ${symbol} sẽ ${prediction.trend === 'bullish' ? 'tăng' : prediction.trend === 'bearish' ? 'giảm' : 'đi ngang'} trong 30 ngày tới.`,
        sentiment,
        key_points: [
          `Giá dự đoán: ${prediction.predicted_price.toLocaleString()} VNĐ`,
          `Thay đổi: ${prediction.predicted_change_percent.toFixed(2)}%`,
          `Xu hướng: ${prediction.trend}`,
        ],
        technical_analysis: {
          trend: prediction.trend,
        },
      }
    } catch {
      return {
        symbol,
        insight: 'Không đủ dữ liệu để phân tích',
        sentiment: 'neutral',
        key_points: [],
        technical_analysis: {},
      }
    }
  },

  /**
   * Get stock research report
   */
  async getResearchReport(symbol: string): Promise<{
    prediction: PredictionResult | null
    recommendation: RecommendationResult | null
  }> {
    const [prediction, recommendation] = await Promise.all([
      this.getPrediction(symbol).catch(() => null),
      this.getRecommendation(symbol).catch(() => null),
    ])

    return { prediction, recommendation }
  },

  /**
   * Analyze portfolio
   * Returns predictions for multiple symbols
   */
  async analyzePortfolio(symbols: string[]): Promise<Map<string, PredictionResult>> {
    const results = new Map<string, PredictionResult>()

    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const prediction = await this.getPrediction(symbol)
          results.set(symbol, prediction)
        } catch (error) {
          console.error(`Failed to get prediction for ${symbol}:`, error)
        }
      })
    )

    return results
  },
}
