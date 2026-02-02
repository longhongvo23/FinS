import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export type SentimentType = 'bullish' | 'bearish' | 'neutral'
export type StockRating = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface MarketSummary {
  sentiment: SentimentType
  title: string
  summary: string
  highlights: string[]
  lastUpdated: string
}

export interface StockAnalysis {
  symbol: string
  overview: string
  performance: string
  pros: string[]
  cons: string[]
  rating: StockRating
  similarStocks: { symbol: string; name: string; reason: string }[]
  lastUpdated: string
}

export interface SectorInsight {
  sector: string
  sentiment: SentimentType
  summary: string
  topStocks: string[]
}

// Store messages per user
interface UserChatData {
  messages: ChatMessage[]
  sessionId: string | null
}

interface AIState {
  // Current user
  currentUserId: string | null

  // Chat - stored per user
  userChats: Record<string, UserChatData>
  isTyping: boolean
  isChatOpen: boolean

  // Computed getters
  messages: ChatMessage[]
  sessionId: string | null

  // Market Summary
  marketSummary: MarketSummary | null
  isLoadingMarketSummary: boolean

  // Stock Analysis Cache
  stockAnalysisCache: Record<string, StockAnalysis>
  isLoadingStockAnalysis: boolean

  // Sector Insights
  sectorInsights: SectorInsight[]
  isLoadingSectorInsights: boolean

  // Actions - User
  setCurrentUser: (userId: string | null) => void

  // Actions - Chat
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setIsTyping: (isTyping: boolean) => void
  setSessionId: (sessionId: string) => void
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void

  // Actions - Market Summary
  setMarketSummary: (summary: MarketSummary) => void
  setIsLoadingMarketSummary: (isLoading: boolean) => void

  // Actions - Stock Analysis
  setStockAnalysis: (symbol: string, analysis: StockAnalysis) => void
  getStockAnalysis: (symbol: string) => StockAnalysis | null
  setIsLoadingStockAnalysis: (isLoading: boolean) => void

  // Actions - Sector Insights
  setSectorInsights: (insights: SectorInsight[]) => void
  setIsLoadingSectorInsights: (isLoading: boolean) => void

  // Selectors for current user's data
  getCurrentMessages: () => ChatMessage[]
  getCurrentSessionId: () => string | null
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Helper to get current user's chat data
function getCurrentUserChat(state: { currentUserId: string | null; userChats: Record<string, UserChatData> }): UserChatData {
  const userId = state.currentUserId || 'anonymous'
  return state.userChats[userId] || { messages: [], sessionId: null }
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUserId: null,
      userChats: {},
      isTyping: false,
      isChatOpen: false,
      marketSummary: null,
      isLoadingMarketSummary: false,
      stockAnalysisCache: {},
      isLoadingStockAnalysis: false,
      sectorInsights: [],
      isLoadingSectorInsights: false,

      // Backward compatibility - these will be computed from userChats
      messages: [],
      sessionId: null,

      // Selectors for current user's data
      getCurrentMessages: () => {
        const state = get()
        return getCurrentUserChat(state).messages
      },

      getCurrentSessionId: () => {
        const state = get()
        return getCurrentUserChat(state).sessionId
      },

      // User Actions
      setCurrentUser: (userId) => {
        set({ currentUserId: userId })
      },

      // Chat Actions
      addMessage: (message) => {
        const state = get()
        const userId = state.currentUserId || 'anonymous'
        const currentChat = state.userChats[userId] || { messages: [], sessionId: null }

        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        }

        set({
          userChats: {
            ...state.userChats,
            [userId]: {
              ...currentChat,
              messages: [...currentChat.messages, newMessage],
            },
          },
        })
      },

      clearMessages: () => {
        const state = get()
        const userId = state.currentUserId || 'anonymous'
        set({
          userChats: {
            ...state.userChats,
            [userId]: { messages: [], sessionId: null },
          },
        })
      },

      setIsTyping: (isTyping) => {
        set({ isTyping })
      },

      setSessionId: (sessionId) => {
        const state = get()
        const userId = state.currentUserId || 'anonymous'
        const currentChat = state.userChats[userId] || { messages: [], sessionId: null }
        set({
          userChats: {
            ...state.userChats,
            [userId]: {
              ...currentChat,
              sessionId,
            },
          },
        })
      },

      toggleChat: () => {
        set((state) => ({ isChatOpen: !state.isChatOpen }))
      },

      openChat: () => {
        set({ isChatOpen: true })
      },

      closeChat: () => {
        set({ isChatOpen: false })
      },

      // Market Summary Actions
      setMarketSummary: (summary) => {
        set({ marketSummary: summary })
      },

      setIsLoadingMarketSummary: (isLoading) => {
        set({ isLoadingMarketSummary: isLoading })
      },

      // Stock Analysis Actions
      setStockAnalysis: (symbol, analysis) => {
        set((state) => ({
          stockAnalysisCache: {
            ...state.stockAnalysisCache,
            [symbol]: analysis,
          },
        }))
      },

      getStockAnalysis: (symbol) => {
        return get().stockAnalysisCache[symbol] || null
      },

      setIsLoadingStockAnalysis: (isLoading) => {
        set({ isLoadingStockAnalysis: isLoading })
      },

      // Sector Insights Actions
      setSectorInsights: (insights) => {
        set({ sectorInsights: insights })
      },

      setIsLoadingSectorInsights: (isLoading) => {
        set({ isLoadingSectorInsights: isLoading })
      },
    }),
    {
      name: 'ai-storage',
      version: 1, // Increment version for migration
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        userChats: Object.fromEntries(
          Object.entries(state.userChats).map(([userId, chat]) => [
            userId,
            {
              messages: chat.messages.slice(-50), // Keep last 50 messages per user
              sessionId: chat.sessionId,
            },
          ])
        ),
        stockAnalysisCache: state.stockAnalysisCache,
      }),
      // Migration from old format (messages stored globally) to new format (per-user)
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Old format had messages and sessionId at root level
          const oldState = persistedState as {
            messages?: ChatMessage[]
            sessionId?: string | null
            stockAnalysisCache?: Record<string, StockAnalysis>
          }

          // Migrate old messages to 'anonymous' user (will be replaced when user logs in)
          const migratedState = {
            currentUserId: null,
            userChats: oldState.messages && oldState.messages.length > 0
              ? { anonymous: { messages: oldState.messages, sessionId: oldState.sessionId || null } }
              : {},
            stockAnalysisCache: oldState.stockAnalysisCache || {},
          }

          return migratedState
        }
        return persistedState
      },
    }
  )
)
