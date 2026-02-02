/**
 * Stock Service for FinS Microservices
 * Replaces Supabase queries with REST API calls to StockService
 */

import { apiClient, API_ENDPOINTS } from './api-client'
import type { Stock, StockRealtime, StockPrice, StockFundamentals, MarketIndex } from '@/types'

// FinS DTOs mapped to frontend types
export interface CompanyDTO {
  id: string
  symbol: string
  name: string
  country?: string
  currency?: string
  exchange?: string
  finnhubIndustry?: string
  ipo?: string
  logo?: string
  marketCapitalization?: number
  shareOutstanding?: number
  weburl?: string
  phone?: string
}

export interface IntradayQuoteDTO {
  id: string
  symbol: string
  name?: string
  exchange?: string
  currency?: string
  datetime: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  previousClose?: number
  change?: number
  percentChange?: number
  isMarketOpen?: boolean
  updatedAt: string
}

export interface HistoricalPriceDTO {
  id: string
  symbol: string
  datetime: string
  interval: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockStatisticsDTO {
  id: string
  symbol: string
  averageVolume?: number
  rolling1dChange?: number
  rolling7dChange?: number
  fiftyTwoWeekLow?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekRange?: string
  updatedAt: string
}

// Map FinS DTOs to SmartTrade types
function mapCompanyToStock(company: CompanyDTO, quote?: IntradayQuoteDTO): Stock {
  return {
    symbol: company.symbol,
    name: company.name,
    nameEn: company.name,
    exchange: (company.exchange as 'HOSE' | 'HNX' | 'UPCOM') || 'HOSE',
    sector: company.finnhubIndustry,
    industry: company.finnhubIndustry,
    marketCap: company.marketCapitalization,
    isVn30: false,
    isActive: true,
    price: quote?.close || 0,
    change: quote?.change || 0,
    changePercent: quote?.percentChange || 0,
    volume: quote?.volume || 0,
    high: quote?.high,
    low: quote?.low,
  }
}

function mapQuoteToRealtime(quote: IntradayQuoteDTO): StockRealtime {
  return {
    symbol: quote.symbol,
    current_price: quote.close,
    change: quote.change || 0,
    change_percent: quote.percentChange || 0,
    open_price: quote.open,
    high_price: quote.high,
    low_price: quote.low,
    ref_price: quote.previousClose || quote.open,
    ceiling_price: quote.high * 1.07, // Vietnam market +7%
    floor_price: quote.low * 0.93,    // Vietnam market -7%
    total_volume: quote.volume,
    total_value: quote.volume * quote.close,
    bid_prices: [],
    bid_volumes: [],
    ask_prices: [],
    ask_volumes: [],
    foreign_buy_volume: 0,
    foreign_sell_volume: 0,
    last_updated: quote.updatedAt,
  }
}

function mapHistoricalToPrice(historical: HistoricalPriceDTO): StockPrice {
  return {
    symbol: historical.symbol,
    open_price: historical.open,
    high_price: historical.high,
    low_price: historical.low,
    close_price: historical.close,
    ref_price: historical.open,
    ceiling_price: historical.high,
    floor_price: historical.low,
    volume: historical.volume,
    value: historical.volume * historical.close,
    price_date: historical.datetime,
  }
}

export const stockService = {
  /**
   * Get all stocks
   */
  async getStocks(options?: {
    exchange?: string
    sector?: string
    search?: string
    limit?: number
  }): Promise<Stock[]> {
    const companies = await apiClient.get<CompanyDTO[]>(API_ENDPOINTS.stocks.all, {
      params: {
        size: options?.limit || 100,
      }
    })

    // Get quotes for each company
    const stocks = await Promise.all(
      companies.map(async (company) => {
        try {
          const quote = await apiClient.get<IntradayQuoteDTO>(API_ENDPOINTS.stocks.quote(company.symbol))
          return mapCompanyToStock(company, quote)
        } catch {
          return mapCompanyToStock(company)
        }
      })
    )

    // Apply filters
    let filtered = stocks
    if (options?.exchange) {
      filtered = filtered.filter(s => s.exchange === options.exchange)
    }
    if (options?.sector) {
      filtered = filtered.filter(s => s.sector === options.sector)
    }
    if (options?.search) {
      const query = options.search.toLowerCase()
      filtered = filtered.filter(s =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
      )
    }

    return filtered
  },

  /**
   * Get single stock
   */
  async getStock(symbol: string): Promise<Stock | null> {
    try {
      const company = await apiClient.get<CompanyDTO>(API_ENDPOINTS.stocks.bySymbol(symbol))
      const quote = await apiClient.get<IntradayQuoteDTO>(API_ENDPOINTS.stocks.quote(symbol))
      return mapCompanyToStock(company, quote)
    } catch {
      return null
    }
  },

  /**
   * Get realtime data for stocks
   */
  async getRealtimeData(symbols?: string[]): Promise<StockRealtime[]> {
    if (!symbols || symbols.length === 0) {
      // Get all stocks quotes
      const companies = await apiClient.get<CompanyDTO[]>(API_ENDPOINTS.stocks.all, {
        params: { size: 50 }
      })
      symbols = companies.map(c => c.symbol)
    }

    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await apiClient.get<IntradayQuoteDTO>(API_ENDPOINTS.stocks.quote(symbol))
          return mapQuoteToRealtime(quote)
        } catch {
          return null
        }
      })
    )

    return quotes.filter((q): q is StockRealtime => q !== null)
  },

  /**
   * Get historical prices
   */
  async getHistoricalPrices(
    symbol: string,
    options?: {
      from?: string
      to?: string
      limit?: number
      period?: string
    }
  ): Promise<StockPrice[]> {
    const historical = await apiClient.get<HistoricalPriceDTO[]>(
      API_ENDPOINTS.stocks.history(symbol),
      {
        params: {
          from: options?.from,
          to: options?.to,
          size: options?.limit || 100,
          interval: options?.period || '1day',
        }
      }
    )

    return historical.map(mapHistoricalToPrice)
  },

  /**
   * Get fundamentals (statistics)
   */
  async getFundamentals(symbol: string): Promise<StockFundamentals | null> {
    try {
      const stats = await apiClient.get<StockStatisticsDTO>(API_ENDPOINTS.stocks.statistics(symbol))
      return {
        symbol: stats.symbol,
        pe_ratio: undefined, // Not available in FinS yet
        pb_ratio: undefined,
        roe: undefined,
        roa: undefined,
        eps: undefined,
        dividend_yield: undefined,
        market_cap: undefined,
      }
    } catch {
      return null
    }
  },

  /**
   * Get market indices
   * Note: FinS doesn't have dedicated indices, we simulate with top stocks
   */
  async getMarketIndices(): Promise<MarketIndex[]> {
    // Simulate market indices with aggregate data
    const [gainers, losers] = await Promise.all([
      this.getTopMovers('gainers', 5),
      this.getTopMovers('losers', 5),
    ])

    const allStocks = [...gainers, ...losers]
    const avgChange = allStocks.reduce((sum, s) => sum + s.change_percent, 0) / allStocks.length

    return [
      {
        symbol: 'VNINDEX',
        name: 'VN-Index',
        value: 1250, // Placeholder
        change: avgChange * 12.5,
        changePercent: avgChange,
        volume: allStocks.reduce((sum, s) => sum + s.total_volume, 0),
        advances: gainers.length,
        declines: losers.length,
        unchanged: 0,
      },
    ]
  },

  /**
   * Get top movers
   */
  async getTopMovers(
    type: 'gainers' | 'losers' | 'active',
    limit = 10
  ): Promise<StockRealtime[]> {
    let endpoint: string

    switch (type) {
      case 'gainers':
        endpoint = API_ENDPOINTS.stocks.gainers
        break
      case 'losers':
        endpoint = API_ENDPOINTS.stocks.losers
        break
      case 'active':
        endpoint = API_ENDPOINTS.stocks.trending
        break
    }

    const quotes = await apiClient.get<IntradayQuoteDTO[]>(endpoint, {
      params: { limit }
    })

    return quotes.map(mapQuoteToRealtime)
  },

  /**
   * Subscribe to realtime updates
   * Note: FinS doesn't have WebSocket yet, use polling
   */
  subscribeToStock(symbol: string, callback: (data: StockRealtime) => void) {
    // Poll every 5 seconds
    const interval = setInterval(async () => {
      try {
        const quote = await apiClient.get<IntradayQuoteDTO>(API_ENDPOINTS.stocks.quote(symbol))
        callback(mapQuoteToRealtime(quote))
      } catch (error) {
        console.error('Failed to fetch stock update:', error)
      }
    }, 5000)

    // Return subscription-like object
    return {
      unsubscribe: () => clearInterval(interval),
    }
  },

  /**
   * Subscribe to multiple stocks
   */
  subscribeToStocks(symbols: string[], callback: (data: StockRealtime) => void) {
    const interval = setInterval(async () => {
      for (const symbol of symbols) {
        try {
          const quote = await apiClient.get<IntradayQuoteDTO>(API_ENDPOINTS.stocks.quote(symbol))
          callback(mapQuoteToRealtime(quote))
        } catch (error) {
          console.error(`Failed to fetch update for ${symbol}:`, error)
        }
      }
    }, 5000)

    return {
      unsubscribe: () => clearInterval(interval),
    }
  },

  /**
   * Search stocks
   */
  async searchStocks(searchQuery: string, limit = 10): Promise<Stock[]> {
    if (!searchQuery) return []

    interface SearchResult {
      symbol: string
      name: string
      exchange?: string
    }

    const results = await apiClient.get<SearchResult[]>(API_ENDPOINTS.stocks.search, {
      params: { q: searchQuery, limit }
    })

    return results.map((r) => ({
      symbol: r.symbol,
      name: r.name,
      exchange: (r.exchange as 'HOSE' | 'HNX' | 'UPCOM') || 'HOSE',
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
    }))
  },

  /**
   * Get chart data for a stock
   */
  async getChartData(symbol: string, period: string = '1M'): Promise<StockPrice[]> {
    interface ChartPoint {
      datetime: string
      open: number
      high: number
      low: number
      close: number
      volume: number
    }

    const data = await apiClient.get<ChartPoint[]>(API_ENDPOINTS.stocks.chart(symbol), {
      params: { period }
    })

    return data.map((point) => ({
      symbol,
      open_price: point.open,
      high_price: point.high,
      low_price: point.low,
      close_price: point.close,
      ref_price: point.open,
      ceiling_price: point.high,
      floor_price: point.low,
      volume: point.volume,
      value: point.volume * point.close,
      price_date: point.datetime,
    }))
  },
}
