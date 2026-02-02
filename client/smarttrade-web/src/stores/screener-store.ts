import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export type Exchange = 'HOSE' | 'HNX' | 'UPCOM'
export type MarketCapCategory = 'small' | 'mid' | 'large'
export type Near52WStatus = 'high' | 'low' | 'all'
export type RSIStatus = 'oversold' | 'overbought' | 'neutral' | 'all'
export type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'pe' | 'dividendYield'
export type SortDirection = 'asc' | 'desc'

export interface ScreenerStock {
  symbol: string
  name: string
  exchange: Exchange
  sector: string
  industry: string
  price: number
  change: number
  changePercent: number
  volume: number
  avgVolume20D: number
  marketCap: number
  marketCapCategory: MarketCapCategory
  pe: number | null
  pb: number | null
  dividendYield: number
  high52W: number
  low52W: number
  aboveMA50: boolean
  rsi: number
  sparklineData: number[]
}

export interface ScreenerFilters {
  priceMin?: number
  priceMax?: number
  changeMin?: number
  changeMax?: number
  volumeMin?: number
  volumeMax?: number
  avgVolumeMin?: number
  peMin?: number
  peMax?: number
  pbMin?: number
  pbMax?: number
  marketCap: 'small' | 'mid' | 'large' | 'all'
  dividendYieldMin?: number
  dividendYieldMax?: number
  hasDividend: 'yes' | 'no' | 'all'
  exchanges: Exchange[]
  sectors: string[]
  near52WStatus: Near52WStatus
  aboveMA50: boolean | 'all'
  rsiStatus: RSIStatus
}

export interface SavedScreen {
  id: string
  name: string
  filters: ScreenerFilters
  createdAt: string
}

export interface PresetScreen {
  id: string
  name: string
  description: string
  filters: Partial<ScreenerFilters>
}

// Default filters
export const defaultFilters: ScreenerFilters = {
  marketCap: 'all',
  hasDividend: 'all',
  exchanges: [],
  sectors: [],
  near52WStatus: 'all',
  aboveMA50: 'all',
  rsiStatus: 'all',
}

// Preset screens
export const presetScreens: PresetScreen[] = [
  {
    id: 'value',
    name: 'Cổ phiếu giá trị',
    description: 'P/E < 10, Cổ tức > 3%',
    filters: {
      peMax: 10,
      dividendYieldMin: 3,
    },
  },
  {
    id: 'growth',
    name: 'Tăng trưởng mạnh',
    description: 'Tăng > 5%, Volume cao',
    filters: {
      changeMin: 5,
      volumeMin: 1000000,
    },
  },
  {
    id: 'bluechip',
    name: 'Blue chips',
    description: 'Large cap, HOSE',
    filters: {
      marketCap: 'large',
      exchanges: ['HOSE'],
    },
  },
  {
    id: 'dividend',
    name: 'Cổ tức cao',
    description: 'Dividend Yield > 5%',
    filters: {
      dividendYieldMin: 5,
      hasDividend: 'yes',
    },
  },
  {
    id: 'oversold',
    name: 'Oversold',
    description: 'RSI < 30, Gần đáy 52 tuần',
    filters: {
      rsiStatus: 'oversold',
      near52WStatus: 'low',
    },
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Gần đỉnh 52 tuần, Volume tăng',
    filters: {
      near52WStatus: 'high',
      volumeMin: 500000,
    },
  },
]

// Sectors
export const sectors = [
  'Ngân hàng',
  'Bất động sản',
  'Công nghệ',
  'Tiêu dùng',
  'Thép & Vật liệu',
  'Dầu khí',
  'Điện & Năng lượng',
  'Y tế & Dược phẩm',
  'Hàng không',
  'Chứng khoán',
  'Bảo hiểm',
  'Thực phẩm & Đồ uống',
  'Xây dựng',
  'Vận tải & Logistics',
]

// Store interface
interface ScreenerState {
  // Data
  stocks: ScreenerStock[]

  // Filters
  filters: ScreenerFilters

  // Saved screens
  savedScreens: SavedScreen[]

  // Sorting
  sortField: SortField
  sortDirection: SortDirection

  // Pagination
  currentPage: number
  itemsPerPage: number

  // UI State
  filtersOpen: boolean
  expandedRows: string[]

  // Actions
  setStocks: (stocks: ScreenerStock[]) => void
  setFilter: <K extends keyof ScreenerFilters>(key: K, value: ScreenerFilters[K]) => void
  setFilters: (filters: Partial<ScreenerFilters>) => void
  resetFilters: () => void
  applyPreset: (preset: PresetScreen) => void

  // Saved screens actions
  saveScreen: (name: string) => void
  loadScreen: (id: string) => void
  deleteScreen: (id: string) => void

  // Sorting actions
  setSortField: (field: SortField) => void
  toggleSortDirection: () => void

  // Pagination actions
  setCurrentPage: (page: number) => void

  // UI actions
  toggleFilters: () => void
  toggleRowExpanded: (symbol: string) => void

  // Computed
  getFilteredStocks: () => ScreenerStock[]
  getSortedStocks: () => ScreenerStock[]
  getPaginatedStocks: () => ScreenerStock[]
  getTotalPages: () => number
  getActiveFilterCount: () => number
}

export const useScreenerStore = create<ScreenerState>()(
  persist(
    (set, get) => ({
      // Initial state
      stocks: [],
      filters: { ...defaultFilters },
      savedScreens: [],
      sortField: 'marketCap',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 20,
      filtersOpen: true,
      expandedRows: [],

      // Actions
      setStocks: (stocks) => set({ stocks }),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          currentPage: 1, // Reset to first page on filter change
        })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          currentPage: 1,
        })),

      resetFilters: () =>
        set({
          filters: { ...defaultFilters },
          currentPage: 1,
        }),

      applyPreset: (preset) =>
        set({
          filters: { ...defaultFilters, ...preset.filters },
          currentPage: 1,
        }),

      // Saved screens
      saveScreen: (name) =>
        set((state) => ({
          savedScreens: [
            ...state.savedScreens,
            {
              id: `screen-${Date.now()}`,
              name,
              filters: { ...state.filters },
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      loadScreen: (id) => {
        const screen = get().savedScreens.find((s) => s.id === id)
        if (screen) {
          set({
            filters: { ...screen.filters },
            currentPage: 1,
          })
        }
      },

      deleteScreen: (id) =>
        set((state) => ({
          savedScreens: state.savedScreens.filter((s) => s.id !== id),
        })),

      // Sorting
      setSortField: (field) =>
        set((state) => ({
          sortField: field,
          sortDirection: state.sortField === field
            ? state.sortDirection === 'asc' ? 'desc' : 'asc'
            : 'desc',
        })),

      toggleSortDirection: () =>
        set((state) => ({
          sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
        })),

      // Pagination
      setCurrentPage: (page) => set({ currentPage: page }),

      // UI
      toggleFilters: () =>
        set((state) => ({ filtersOpen: !state.filtersOpen })),

      toggleRowExpanded: (symbol) =>
        set((state) => ({
          expandedRows: state.expandedRows.includes(symbol)
            ? state.expandedRows.filter((s) => s !== symbol)
            : [...state.expandedRows, symbol],
        })),

      // Computed
      getFilteredStocks: () => {
        const { stocks, filters } = get()

        return stocks.filter((stock) => {
          // Price filter
          if (filters.priceMin !== undefined && stock.price < filters.priceMin) return false
          if (filters.priceMax !== undefined && stock.price > filters.priceMax) return false

          // Change filter
          if (filters.changeMin !== undefined && stock.changePercent < filters.changeMin) return false
          if (filters.changeMax !== undefined && stock.changePercent > filters.changeMax) return false

          // Volume filter
          if (filters.volumeMin !== undefined && stock.volume < filters.volumeMin) return false
          if (filters.volumeMax !== undefined && stock.volume > filters.volumeMax) return false

          // Avg Volume filter
          if (filters.avgVolumeMin !== undefined && stock.avgVolume20D < filters.avgVolumeMin) return false

          // P/E filter
          if (filters.peMin !== undefined && (stock.pe === null || stock.pe < filters.peMin)) return false
          if (filters.peMax !== undefined && (stock.pe === null || stock.pe > filters.peMax)) return false

          // P/B filter
          if (filters.pbMin !== undefined && (stock.pb === null || stock.pb < filters.pbMin)) return false
          if (filters.pbMax !== undefined && (stock.pb === null || stock.pb > filters.pbMax)) return false

          // Market cap filter
          if (filters.marketCap !== 'all' && stock.marketCapCategory !== filters.marketCap) return false

          // Dividend filter
          if (filters.dividendYieldMin !== undefined && stock.dividendYield < filters.dividendYieldMin) return false
          if (filters.dividendYieldMax !== undefined && stock.dividendYield > filters.dividendYieldMax) return false
          if (filters.hasDividend === 'yes' && stock.dividendYield === 0) return false
          if (filters.hasDividend === 'no' && stock.dividendYield > 0) return false

          // Exchange filter
          if (filters.exchanges.length > 0 && !filters.exchanges.includes(stock.exchange)) return false

          // Sector filter
          if (filters.sectors.length > 0 && !filters.sectors.includes(stock.sector)) return false

          // 52-week filter
          if (filters.near52WStatus === 'high') {
            const threshold = stock.high52W * 0.95
            if (stock.price < threshold) return false
          }
          if (filters.near52WStatus === 'low') {
            const threshold = stock.low52W * 1.05
            if (stock.price > threshold) return false
          }

          // MA50 filter
          if (filters.aboveMA50 === true && !stock.aboveMA50) return false
          if (filters.aboveMA50 === false && stock.aboveMA50) return false

          // RSI filter
          if (filters.rsiStatus === 'oversold' && stock.rsi >= 30) return false
          if (filters.rsiStatus === 'overbought' && stock.rsi <= 70) return false
          if (filters.rsiStatus === 'neutral' && (stock.rsi < 30 || stock.rsi > 70)) return false

          return true
        })
      },

      getSortedStocks: () => {
        const { sortField, sortDirection } = get()
        const filtered = get().getFilteredStocks()

        return [...filtered].sort((a, b) => {
          let aVal: number | string | null = a[sortField]
          let bVal: number | string | null = b[sortField]

          // Handle null values
          if (aVal === null) aVal = -Infinity
          if (bVal === null) bVal = -Infinity

          if (typeof aVal === 'string') {
            return sortDirection === 'asc'
              ? aVal.localeCompare(bVal as string)
              : (bVal as string).localeCompare(aVal)
          }

          return sortDirection === 'asc'
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number)
        })
      },

      getPaginatedStocks: () => {
        const { currentPage, itemsPerPage } = get()
        const sorted = get().getSortedStocks()
        const start = (currentPage - 1) * itemsPerPage
        return sorted.slice(start, start + itemsPerPage)
      },

      getTotalPages: () => {
        const { itemsPerPage } = get()
        const filtered = get().getFilteredStocks()
        return Math.ceil(filtered.length / itemsPerPage)
      },

      getActiveFilterCount: () => {
        const { filters } = get()
        let count = 0

        if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++
        if (filters.changeMin !== undefined || filters.changeMax !== undefined) count++
        if (filters.volumeMin !== undefined || filters.volumeMax !== undefined) count++
        if (filters.avgVolumeMin !== undefined) count++
        if (filters.peMin !== undefined || filters.peMax !== undefined) count++
        if (filters.pbMin !== undefined || filters.pbMax !== undefined) count++
        if (filters.marketCap !== 'all') count++
        if (filters.dividendYieldMin !== undefined || filters.dividendYieldMax !== undefined) count++
        if (filters.hasDividend !== 'all') count++
        if (filters.exchanges.length > 0) count++
        if (filters.sectors.length > 0) count++
        if (filters.near52WStatus !== 'all') count++
        if (filters.aboveMA50 !== 'all') count++
        if (filters.rsiStatus !== 'all') count++

        return count
      },
    }),
    {
      name: 'screener-storage',
      partialize: (state) => ({
        savedScreens: state.savedScreens,
      }),
    }
  )
)

// Helper functions
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value)
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `${formatNumber(value / 1e12, 1)}T`
  }
  if (value >= 1e9) {
    return `${formatNumber(value / 1e9, 1)}B`
  }
  return `${formatNumber(value / 1e6, 0)}M`
}

export function formatVolume(value: number): string {
  if (value >= 1e6) {
    return `${formatNumber(value / 1e6, 1)}M`
  }
  if (value >= 1e3) {
    return `${formatNumber(value / 1e3, 1)}K`
  }
  return formatNumber(value)
}

export function getMarketCapLabel(category: MarketCapCategory): string {
  switch (category) {
    case 'large': return 'Large Cap'
    case 'mid': return 'Mid Cap'
    case 'small': return 'Small Cap'
  }
}
