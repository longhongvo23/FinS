import { useCallback } from 'react'
import { useAIStore } from '@/stores/ai-store'
import {
  generateMarketSummary,
  generateStockAnalysis,
  generateSectorInsights,
  generateChatResponse,
} from '@/lib/ai-prompts'
import { aitoolsService } from '@/services/aitools-service'

// Simulate typing delay (50-100ms per word)
function getTypingDelay(text: string): number {
  const words = text.split(' ').length
  const msPerWord = 50 + Math.random() * 50
  return Math.min(words * msPerWord, 3000) // Cap at 3 seconds
}

// Simulate API delay (1-3 seconds)
function getAPIDelay(): number {
  return 1000 + Math.random() * 2000
}

export function useAIChat() {
  const {
    messages,
    isTyping,
    sessionId,
    addMessage,
    clearMessages,
    setIsTyping,
    setSessionId,
  } = useAIStore()

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    addMessage({ role: 'user', content })

    // Set typing indicator
    setIsTyping(true)

    try {
      // Call real API with sessionId for context continuity
      const response = await aitoolsService.chat(content, sessionId || undefined)

      // Store sessionId for subsequent messages
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId)
      }

      // Add AI response
      addMessage({ role: 'assistant', content: response.response })
    } catch (error) {
      console.error('AI Chat error:', error)
      // Fallback to mock response on error
      const fallbackResponse = generateChatResponse(content)
      addMessage({ role: 'assistant', content: fallbackResponse })
    } finally {
      // Clear typing indicator
      setIsTyping(false)
    }
  }, [addMessage, setIsTyping, sessionId, setSessionId])

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
  }
}

export function useMarketSummary() {
  const {
    marketSummary,
    isLoadingMarketSummary,
    setMarketSummary,
    setIsLoadingMarketSummary,
  } = useAIStore()

  const fetchMarketSummary = useCallback(async () => {
    setIsLoadingMarketSummary(true)

    try {
      // Try to fetch from aitoolsService first
      const insights = await aitoolsService.getTodayInsights()

      if (insights) {
        // Transform API response to market summary format
        const highlights = aitoolsService.parseHighlights(insights.highlightsJson)

        setMarketSummary({
          sentiment: (insights.marketTrend?.toLowerCase() as 'bullish' | 'bearish' | 'neutral') || 'neutral',
          title: insights.summaryTitle || 'Tổng quan thị trường',
          summary: insights.summaryContent || 'Đang cập nhật...',
          highlights: highlights.map(h => h.title),
          lastUpdated: insights.createdAt,
        })
      } else {
        // Fallback to mock data
        const summary = generateMarketSummary()
        setMarketSummary(summary)
      }
    } catch (error) {
      console.error('Failed to fetch market summary:', error)
      // Fallback to mock data
      const summary = generateMarketSummary()
      setMarketSummary(summary)
    }

    setIsLoadingMarketSummary(false)
  }, [setMarketSummary, setIsLoadingMarketSummary])

  const refreshSummary = useCallback(async () => {
    await fetchMarketSummary()
  }, [fetchMarketSummary])

  return {
    marketSummary,
    isLoading: isLoadingMarketSummary,
    fetchMarketSummary,
    refreshSummary,
  }
}

export function useStockAnalysis(symbol: string) {
  const {
    isLoadingStockAnalysis,
    setStockAnalysis,
    getStockAnalysis,
    setIsLoadingStockAnalysis,
  } = useAIStore()

  const analysis = getStockAnalysis(symbol)

  const fetchAnalysis = useCallback(async () => {
    setIsLoadingStockAnalysis(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, getAPIDelay()))

    const newAnalysis = generateStockAnalysis(symbol)
    setStockAnalysis(symbol, newAnalysis)

    setIsLoadingStockAnalysis(false)
  }, [symbol, setStockAnalysis, setIsLoadingStockAnalysis])

  const regenerateAnalysis = useCallback(async () => {
    await fetchAnalysis()
  }, [fetchAnalysis])

  return {
    analysis,
    isLoading: isLoadingStockAnalysis,
    fetchAnalysis,
    regenerateAnalysis,
  }
}

export function useSectorInsights() {
  const {
    sectorInsights,
    isLoadingSectorInsights,
    setSectorInsights,
    setIsLoadingSectorInsights,
  } = useAIStore()

  const fetchSectorInsights = useCallback(async () => {
    setIsLoadingSectorInsights(true)

    try {
      // Try to fetch from aitoolsService first
      const industries = await aitoolsService.getTodayIndustryAnalyses()

      if (industries && industries.length > 0) {
        // Transform API response to sector insights format
        const transformedInsights = industries.map(industry => {
          const sentimentMap: Record<string, 'bullish' | 'neutral' | 'bearish'> = {
            'POSITIVE': 'bullish',
            'NEUTRAL': 'neutral',
            'NEGATIVE': 'bearish',
          }

          return {
            sector: industry.industryName,
            sentiment: sentimentMap[industry.sentiment] || 'neutral',
            summary: industry.summary,
            topStocks: aitoolsService.parseRelatedStocks(industry.relatedStocks),
          }
        })

        setSectorInsights(transformedInsights)
      } else {
        // Fallback to mock data
        const insights = generateSectorInsights()
        setSectorInsights(insights)
      }
    } catch (error) {
      console.error('Failed to fetch sector insights:', error)
      // Fallback to mock data
      const insights = generateSectorInsights()
      setSectorInsights(insights)
    }

    setIsLoadingSectorInsights(false)
  }, [setSectorInsights, setIsLoadingSectorInsights])

  return {
    sectorInsights,
    isLoading: isLoadingSectorInsights,
    fetchSectorInsights,
  }
}
