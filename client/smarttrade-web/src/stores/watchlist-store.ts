import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { watchlistService } from '@/services/watchlist-service'

// Finnhub API configuration (same as stock-quotes-table)
const FINNHUB_API_KEY = 'd3su1ohr01qpdd5lapsgd3su1ohr01qpdd5lapt0'
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

// Types
export interface WatchlistStock {
  symbol: string
  name: string
  exchange: string
  sector: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  high52w: number
  low52w: number
  sparklineData: number[]
  addedAt: string
  notes?: string
  logo?: string
}

export interface Watchlist {
  id: string
  name: string
  color: string
  stocks: WatchlistStock[]
  createdAt: string
  updatedAt: string
}

interface WatchlistState {
  watchlists: Watchlist[]
  activeWatchlistId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  createWatchlist: (name: string, color?: string) => void
  deleteWatchlist: (id: string) => void
  renameWatchlist: (id: string, name: string) => void
  setWatchlistColor: (id: string, color: string) => void
  setActiveWatchlist: (id: string) => void

  addStock: (watchlistId: string, stock: Omit<WatchlistStock, 'addedAt'>) => void
  removeStock: (watchlistId: string, symbol: string) => void
  updateStockNote: (watchlistId: string, symbol: string, note: string) => void
  moveStock: (fromWatchlistId: string, toWatchlistId: string, symbol: string) => void

  getActiveWatchlist: () => Watchlist | null

  // API actions
  loadWatchlistFromAPI: () => Promise<void>
}

// Predefined colors for watchlists
export const WATCHLIST_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

// Finnhub API interfaces
interface FinnhubQuote {
  c: number   // Current price
  d: number   // Change
  dp: number  // Percent change
  h: number   // High price of the day
  l: number   // Low price of the day
  o: number   // Open price of the day
  pc: number  // Previous close price
  t: number   // Timestamp
}

interface FinnhubProfile {
  logo: string
  name: string
  finnhubIndustry: string
  marketCapitalization: number
  exchange: string
}

// Fetch quote from Finnhub
async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.c === 0 && data.pc === 0) {
      return null
    }
    return data
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error)
    return null
  }
}

// Fetch company profile from Finnhub
async function fetchFinnhubProfile(symbol: string): Promise<FinnhubProfile | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Failed to fetch profile for ${symbol}:`, error)
    return null
  }
}

// Finnhub Candle response
interface FinnhubCandle {
  c: number[]  // Close prices
  h: number[]  // High prices
  l: number[]  // Low prices
  o: number[]  // Open prices
  t: number[]  // Timestamps
  v: number[]  // Volumes
  s: string    // Status: 'ok' or 'no_data'
}

// Generate fallback sparkline data when API fails
function generateFallbackSparkline(basePrice: number, isPositive: boolean): number[] {
  if (basePrice <= 0) return []

  const data: number[] = []
  // Start from a slightly different price to create trend
  let price = isPositive ? basePrice * 0.97 : basePrice * 1.03

  for (let i = 0; i < 20; i++) {
    // Add small random variation but trend towards current price
    const trend = isPositive ? 0.001 : -0.001
    price = price * (1 + trend + (Math.random() - 0.5) * 0.01)
    data.push(Math.round(price * 100) / 100)
  }

  // Make sure last point is close to current price
  data[data.length - 1] = basePrice
  return data
}

// Fetch historical candle data from Finnhub (for sparkline) with timeout
async function fetchFinnhubCandle(symbol: string): Promise<number[]> {
  try {
    // Get last 30 days of daily data
    const to = Math.floor(Date.now() / 1000)
    const from = to - (30 * 24 * 60 * 60) // 30 days ago

    // Create abort controller with 5 second timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
      { signal: controller.signal }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FinnhubCandle = await response.json()

    if (data.s === 'no_data' || !data.c || data.c.length === 0) {
      return []
    }

    // Return last 20 close prices for sparkline
    return data.c.slice(-20)
  } catch (error) {
    console.error(`Failed to fetch candle data for ${symbol}:`, error)
    return []
  }
}

// Initial empty watchlist (will be populated from API)
const initialWatchlists: Watchlist[] = [
  {
    id: 'default',
    name: 'Danh sách chính',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stocks: [],
  },
]

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlists: initialWatchlists,
      activeWatchlistId: 'default',
      isLoading: false,
      error: null,

      loadWatchlistFromAPI: async () => {
        set({ isLoading: true, error: null })
        try {
          // 1. Get symbols from watchlist API (backend UserService)
          const watchlistItems = await watchlistService.getWatchlist()

          if (watchlistItems.length === 0) {
            set((state) => ({
              watchlists: state.watchlists.map(w =>
                w.id === 'default'
                  ? { ...w, stocks: [], updatedAt: new Date().toISOString() }
                  : w
              ),
              isLoading: false,
              error: null,
            }))
            return
          }

          // 2. Fetch real-time data from Finnhub for each symbol
          const stockDetails = await Promise.all(
            watchlistItems.map(async (item) => {
              try {
                const [quote, profile, candleData] = await Promise.all([
                  fetchFinnhubQuote(item.symbol),
                  fetchFinnhubProfile(item.symbol),
                  fetchFinnhubCandle(item.symbol),
                ])

                const price = quote?.c || 0
                const changePercent = quote?.dp || 0

                // Use real candle data if available, otherwise generate fallback
                const sparklineData = candleData.length > 0
                  ? candleData
                  : generateFallbackSparkline(price, changePercent >= 0)

                return {
                  symbol: item.symbol,
                  name: profile?.name || item.symbol,
                  exchange: profile?.exchange || 'NASDAQ',
                  sector: profile?.finnhubIndustry || '-',
                  price,
                  change: quote?.d || 0,
                  changePercent,
                  volume: 0, // Not available in basic quote
                  marketCap: (profile?.marketCapitalization || 0) * 1000000, // Convert from millions
                  pe: 0, // Not available in profile
                  high52w: 0,
                  low52w: 0,
                  sparklineData,
                  addedAt: item.addedAt,
                  logo: profile?.logo || '',
                } as WatchlistStock
              } catch {
                // Return basic stock info if API fails
                return {
                  symbol: item.symbol,
                  name: item.symbol,
                  exchange: 'NASDAQ',
                  sector: '-',
                  price: 0,
                  change: 0,
                  changePercent: 0,
                  volume: 0,
                  marketCap: 0,
                  pe: 0,
                  high52w: 0,
                  low52w: 0,
                  sparklineData: [],
                  addedAt: item.addedAt,
                } as WatchlistStock
              }
            })
          )

          // 3. Update default watchlist with real-time Finnhub data
          set((state) => ({
            watchlists: state.watchlists.map(w =>
              w.id === 'default'
                ? { ...w, stocks: stockDetails, updatedAt: new Date().toISOString() }
                : w
            ),
            isLoading: false,
            error: null,
          }))
        } catch (error) {
          console.error('Failed to load watchlist from API:', error)
          set({
            isLoading: false,
            error: 'Không thể tải danh sách theo dõi. Vui lòng thử lại sau.'
          })
        }
      },

      createWatchlist: (name, color) => {
        const id = `watchlist-${Date.now()}`
        const newWatchlist: Watchlist = {
          id,
          name,
          color: color || WATCHLIST_COLORS[get().watchlists.length % WATCHLIST_COLORS.length],
          stocks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          watchlists: [...state.watchlists, newWatchlist],
          activeWatchlistId: id,
        }))
      },

      deleteWatchlist: (id) => {
        set((state) => {
          const newWatchlists = state.watchlists.filter((w) => w.id !== id)
          return {
            watchlists: newWatchlists,
            activeWatchlistId:
              state.activeWatchlistId === id
                ? newWatchlists[0]?.id || null
                : state.activeWatchlistId,
          }
        })
      },

      renameWatchlist: (id, name) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === id ? { ...w, name, updatedAt: new Date().toISOString() } : w
          ),
        }))
      },

      setWatchlistColor: (id, color) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === id ? { ...w, color, updatedAt: new Date().toISOString() } : w
          ),
        }))
      },

      setActiveWatchlist: (id) => {
        set({ activeWatchlistId: id })
      },

      addStock: (watchlistId, stock) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id !== watchlistId) return w
            // Check if stock already exists
            if (w.stocks.some((s) => s.symbol === stock.symbol)) return w
            return {
              ...w,
              stocks: [...w.stocks, { ...stock, addedAt: new Date().toISOString() }],
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      removeStock: (watchlistId, symbol) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id !== watchlistId) return w
            return {
              ...w,
              stocks: w.stocks.filter((s) => s.symbol !== symbol),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      updateStockNote: (watchlistId, symbol, note) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id !== watchlistId) return w
            return {
              ...w,
              stocks: w.stocks.map((s) =>
                s.symbol === symbol ? { ...s, notes: note } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      moveStock: (fromWatchlistId, toWatchlistId, symbol) => {
        const state = get()
        const fromWatchlist = state.watchlists.find((w) => w.id === fromWatchlistId)
        const stock = fromWatchlist?.stocks.find((s) => s.symbol === symbol)
        if (!stock) return

        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id === fromWatchlistId) {
              return {
                ...w,
                stocks: w.stocks.filter((s) => s.symbol !== symbol),
                updatedAt: new Date().toISOString(),
              }
            }
            if (w.id === toWatchlistId) {
              // Don't add if already exists
              if (w.stocks.some((s) => s.symbol === symbol)) return w
              return {
                ...w,
                stocks: [...w.stocks, stock],
                updatedAt: new Date().toISOString(),
              }
            }
            return w
          }),
        }))
      },

      getActiveWatchlist: () => {
        const state = get()
        return state.watchlists.find((w) => w.id === state.activeWatchlistId) || null
      },
    }),
    {
      name: 'watchlist-storage',
    }
  )
)
