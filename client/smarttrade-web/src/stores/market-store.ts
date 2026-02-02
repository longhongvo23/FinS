import { create } from 'zustand'
import type { MarketIndex, StockRealtime } from '@/types'

interface MarketState {
  indices: MarketIndex[]
  watchlist: StockRealtime[]
  selectedSymbol: string | null
  isMarketOpen: boolean

  // Actions
  setIndices: (indices: MarketIndex[]) => void
  setWatchlist: (stocks: StockRealtime[]) => void
  updateStockPrice: (symbol: string, data: Partial<StockRealtime>) => void
  setSelectedSymbol: (symbol: string | null) => void
  setMarketOpen: (open: boolean) => void
}

export const useMarketStore = create<MarketState>((set) => ({
  indices: [],
  watchlist: [],
  selectedSymbol: null,
  isMarketOpen: false,

  setIndices: (indices) => set({ indices }),

  setWatchlist: (stocks) => set({ watchlist: stocks }),

  updateStockPrice: (symbol, data) =>
    set((state) => ({
      watchlist: state.watchlist.map((stock) =>
        stock.symbol === symbol ? { ...stock, ...data } : stock
      ),
    })),

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

  setMarketOpen: (open) => set({ isMarketOpen: open }),
}))
