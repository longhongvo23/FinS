import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { watchlistService, type WatchlistVM } from '@/services/watchlist-service'

// Finnhub API configuration
const FINNHUB_API_KEY = 'd3su1ohr01qpdd5lapsgd3su1ohr01qpdd5lapt0'
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

// Available stocks for filtering with high-quality logos
// Using publicly accessible logo URLs
export const WATCHED_STOCKS = [
  { symbol: 'AAPL', name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', color: '#000000' },
  { symbol: 'NVDA', name: 'NVIDIA', logo: 'https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg', color: '#76B900' },
  { symbol: 'MSFT', name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', color: '#00A4EF' },
  { symbol: 'AMZN', name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', color: '#FF9900' },
  { symbol: 'TSLA', name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png', color: '#CC0000' },
  { symbol: 'META', name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', color: '#0081FB' },
  { symbol: 'GOOGL', name: 'Alphabet', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', color: '#4285F4' },
]

// Get company info by symbol
export function getCompanyInfo(symbol: string): { logo: string; color: string; name: string } | undefined {
  const stock = WATCHED_STOCKS.find(s => s.symbol === symbol)
  if (stock) {
    return { logo: stock.logo, color: stock.color, name: stock.name }
  }
  return undefined
}

// Types
export type NewsLanguage = 'en' | 'vi' | 'all'
export type SortOrder = 'newest' | 'oldest'

export interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  imageUrl?: string
  category: string
  relatedSymbols: string[]
  publishedAt: string
  language: NewsLanguage
}

// Finnhub news response
interface FinnhubNews {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

interface NewsFilters {
  search: string
  selectedSymbol: string | null
  language: NewsLanguage
  sortOrder: SortOrder
}

// Watched stock with info
export interface WatchedStock {
  symbol: string
  name: string
  logo: string
  color: string
}

interface NewsState {
  // Articles
  articles: NewsArticle[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null

  // User watchlist
  userWatchlist: WatchedStock[]
  isLoadingWatchlist: boolean

  // Saved
  savedArticleIds: string[]

  // Filters
  newsFilters: NewsFilters

  // Pagination
  currentPage: number
  itemsPerPage: number

  // Actions
  loadUserWatchlist: () => Promise<void>
  loadNewsFromFinnhub: () => Promise<void>
  setArticles: (articles: NewsArticle[]) => void
  getWatchedStocks: () => WatchedStock[]

  // Saved
  toggleSaveArticle: (id: string) => void
  isArticleSaved: (id: string) => boolean
  getSavedArticles: () => NewsArticle[]

  // Filters
  setSearchQuery: (query: string) => void
  setSelectedSymbol: (symbol: string | null) => void
  setLanguage: (language: NewsLanguage) => void
  setSortOrder: (order: SortOrder) => void
  clearFilters: () => void

  // Pagination
  setCurrentPage: (page: number) => void

  // Computed
  getFilteredArticles: () => NewsArticle[]
  getTrendingArticles: () => NewsArticle[]
  getTotalPages: () => number
  getPaginatedArticles: () => NewsArticle[]
}

const defaultFilters: NewsFilters = {
  search: '',
  selectedSymbol: null,
  language: 'all',
  sortOrder: 'newest',
}

// Fetch news from Finnhub for a specific symbol
async function fetchFinnhubNews(symbol: string): Promise<FinnhubNews[]> {
  try {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const from = weekAgo.toISOString().split('T')[0]
    const to = today.toISOString().split('T')[0]

    const response = await fetch(
      `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch news for ${symbol}:`, error)
    return []
  }
}

// Convert Finnhub news to our format
function convertFinnhubNews(news: FinnhubNews, symbol: string): NewsArticle {
  return {
    id: `finnhub-${news.id}`,
    title: news.headline,
    summary: news.summary || news.headline,
    source: news.source,
    sourceUrl: news.url,
    imageUrl: news.image || undefined,
    category: news.category || 'general',
    relatedSymbols: news.related ? news.related.split(',').map(s => s.trim()) : [symbol],
    publishedAt: new Date(news.datetime * 1000).toISOString(),
    language: 'en' as NewsLanguage,
  }
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      articles: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      userWatchlist: [],
      isLoadingWatchlist: false,
      savedArticleIds: [],
      newsFilters: defaultFilters,
      currentPage: 1,
      itemsPerPage: 10,

      // Load user watchlist from API
      loadUserWatchlist: async () => {
        set({ isLoadingWatchlist: true })
        try {
          const watchlistItems = await watchlistService.getWatchlist()
          const watchedStocks: WatchedStock[] = watchlistItems.map((item: WatchlistVM) => {
            // Try to get info from default stocks, otherwise use symbol
            const defaultStock = WATCHED_STOCKS.find(s => s.symbol === item.symbol)
            return {
              symbol: item.symbol,
              name: defaultStock?.name || item.symbol,
              logo: defaultStock?.logo || '',
              color: defaultStock?.color || '#6B7280',
            }
          })
          set({ userWatchlist: watchedStocks, isLoadingWatchlist: false })
        } catch (error) {
          console.error('Failed to load watchlist:', error)
          // Fallback to default stocks if not logged in
          set({ userWatchlist: [], isLoadingWatchlist: false })
        }
      },

      // Get watched stocks - prefer user watchlist, fallback to defaults
      getWatchedStocks: () => {
        const { userWatchlist } = get()
        return userWatchlist.length > 0 ? userWatchlist : WATCHED_STOCKS
      },

      // Load news from Finnhub
      loadNewsFromFinnhub: async () => {
        set({ isLoading: true, error: null })

        try {
          // Always fetch news for all 7 default stocks (not just user's watchlist)
          // This ensures "Tất cả" and "Tin nổi bật" show news from all stocks
          const newsPromises = WATCHED_STOCKS.map(async (stock) => {
            const finnhubNews = await fetchFinnhubNews(stock.symbol)
            return finnhubNews.map(n => convertFinnhubNews(n, stock.symbol))
          })

          const allNewsArrays = await Promise.all(newsPromises)
          const allNews = allNewsArrays.flat()

          // Remove duplicates by ID
          const uniqueNews = allNews.filter(
            (article, index, self) =>
              index === self.findIndex(a => a.id === article.id)
          )

          // Sort by date (newest first)
          uniqueNews.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          )

          set({
            articles: uniqueNews,
            isLoading: false,
            lastUpdated: new Date(),
            error: null,
          })
        } catch (error) {
          console.error('Failed to load news:', error)
          set({
            isLoading: false,
            error: 'Không thể tải tin tức. Vui lòng thử lại sau.'
          })
        }
      },

      setArticles: (articles) => set({ articles }),

      // Saved
      toggleSaveArticle: (id) => {
        set((state) => ({
          savedArticleIds: state.savedArticleIds.includes(id)
            ? state.savedArticleIds.filter((savedId) => savedId !== id)
            : [...state.savedArticleIds, id],
        }))
      },

      isArticleSaved: (id) => get().savedArticleIds.includes(id),

      getSavedArticles: () => {
        const { articles, savedArticleIds } = get()
        return articles.filter((a) => savedArticleIds.includes(a.id))
      },

      // Filters
      setSearchQuery: (query) => {
        set((state) => ({
          newsFilters: { ...state.newsFilters, search: query },
          currentPage: 1,
        }))
      },

      setSelectedSymbol: (symbol) => {
        set((state) => ({
          newsFilters: { ...state.newsFilters, selectedSymbol: symbol },
          currentPage: 1,
        }))
      },

      setLanguage: (language) => {
        set((state) => ({
          newsFilters: { ...state.newsFilters, language },
          currentPage: 1,
        }))
      },

      setSortOrder: (order) => {
        set((state) => ({
          newsFilters: { ...state.newsFilters, sortOrder: order },
        }))
      },

      clearFilters: () => {
        set({ newsFilters: defaultFilters, currentPage: 1 })
      },

      // Pagination
      setCurrentPage: (page) => set({ currentPage: page }),

      // Filtered articles
      getFilteredArticles: () => {
        const { articles, newsFilters } = get()
        let filtered = [...articles]

        // Search
        if (newsFilters.search) {
          const searchLower = newsFilters.search.toLowerCase()
          filtered = filtered.filter(
            (a) =>
              a.title.toLowerCase().includes(searchLower) ||
              a.summary.toLowerCase().includes(searchLower)
          )
        }

        // Symbol filter
        if (newsFilters.selectedSymbol) {
          filtered = filtered.filter((a) =>
            a.relatedSymbols.includes(newsFilters.selectedSymbol!)
          )
        }

        // Language filter
        if (newsFilters.language !== 'all') {
          filtered = filtered.filter((a) => a.language === newsFilters.language)
        }

        // Sort
        filtered.sort((a, b) => {
          const dateA = new Date(a.publishedAt).getTime()
          const dateB = new Date(b.publishedAt).getTime()
          return newsFilters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB
        })

        return filtered
      },

      // Trending articles (most recent with images)
      getTrendingArticles: () => {
        const { articles } = get()
        return articles
          .filter(a => a.imageUrl)
          .slice(0, 5)
      },

      // Pagination
      getTotalPages: () => {
        const { itemsPerPage, getFilteredArticles } = get()
        return Math.ceil(getFilteredArticles().length / itemsPerPage)
      },

      getPaginatedArticles: () => {
        const { currentPage, itemsPerPage, getFilteredArticles } = get()
        const filtered = getFilteredArticles()
        const start = (currentPage - 1) * itemsPerPage
        return filtered.slice(start, start + itemsPerPage)
      },
    }),
    {
      name: 'news-storage',
      partialize: (state) => ({
        savedArticleIds: state.savedArticleIds,
      }),
    }
  )
)

// Helper function to format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} phút trước`
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`
  } else {
    return date.toLocaleDateString('vi-VN')
  }
}
