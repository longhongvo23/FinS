import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface PortfolioHolding {
  symbol: string
  name: string
  sector: string
  assetType: 'stock' | 'etf' | 'crypto' | 'bond'
  quantity: number
  availableQuantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  costBasis: number
  unrealizedPL: number
  unrealizedPLPercent: number
  weight: number
  dayChange: number
  dayChangePercent: number
  purchaseHistory: PurchaseRecord[]
  sparklineData: number[]
}

export interface PurchaseRecord {
  date: string
  quantity: number
  price: number
  total: number
}

export interface PortfolioSummary {
  totalValue: number
  stockValue: number
  cashBalance: number
  buyingPower: number
  pendingCash: number
  totalPL: number
  totalPLPercent: number
  dailyPL: number
  dailyPLPercent: number
  realizedPL: number
  unrealizedPL: number
}

export interface PerformanceSnapshot {
  date: string
  portfolioValue: number
  benchmarkValue: number
}

export interface SectorAllocation {
  sector: string
  value: number
  percent: number
  color: string
}

export interface AssetAllocation {
  type: 'stock' | 'etf' | 'crypto' | 'bond' | 'cash'
  value: number
  percent: number
  color: string
}

interface PortfolioState {
  // Data
  holdings: PortfolioHolding[]
  summary: PortfolioSummary
  performanceHistory: PerformanceSnapshot[]
  lastUpdated: string

  // Actions
  setHoldings: (holdings: PortfolioHolding[]) => void
  setSummary: (summary: PortfolioSummary) => void
  setPerformanceHistory: (history: PerformanceSnapshot[]) => void
  updateHolding: (symbol: string, updates: Partial<PortfolioHolding>) => void
  refreshData: () => void

  // Computed helpers
  getBestPerformer: () => PortfolioHolding | null
  getWorstPerformer: () => PortfolioHolding | null
  getSectorAllocation: () => SectorAllocation[]
  getAssetAllocation: () => AssetAllocation[]
  getDiversificationScore: () => number
  getConcentrationWarnings: () => string[]
}

// Sector colors
const SECTOR_COLORS: Record<string, string> = {
  'Công nghệ': '#6366F1',
  'Ngân hàng': '#22C55E',
  'Bất động sản': '#F59E0B',
  'Tiêu dùng': '#EC4899',
  'Thép & Vật liệu': '#3B82F6',
  'Bán lẻ': '#8B5CF6',
  'Y tế': '#14B8A6',
  'Năng lượng': '#EF4444',
  'Khác': '#71717A',
}

// Asset type colors
const ASSET_COLORS: Record<string, string> = {
  stock: '#6366F1',
  etf: '#22C55E',
  crypto: '#F59E0B',
  bond: '#3B82F6',
  cash: '#71717A',
}

// Generate mock sparkline data
const generateSparkline = (basePrice: number, trend: number = 0): number[] => {
  const data: number[] = []
  let price = basePrice * 0.95
  for (let i = 0; i < 20; i++) {
    price = price + (Math.random() - 0.45 + trend * 0.1) * basePrice * 0.02
    data.push(Math.round(price))
  }
  return data
}

// Generate performance history
const generatePerformanceHistory = (days: number): PerformanceSnapshot[] => {
  const history: PerformanceSnapshot[] = []
  let portfolioValue = 200000000
  let benchmarkValue = 1200

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    portfolioValue *= 1 + (Math.random() - 0.48) * 0.02
    benchmarkValue *= 1 + (Math.random() - 0.48) * 0.015

    history.push({
      date: date.toISOString().split('T')[0],
      portfolioValue: Math.round(portfolioValue),
      benchmarkValue: Math.round(benchmarkValue * 100) / 100,
    })
  }

  return history
}

// Initial mock data
const initialHoldings: PortfolioHolding[] = [
  {
    symbol: 'VNM',
    name: 'CTCP Sữa Việt Nam',
    sector: 'Tiêu dùng',
    assetType: 'stock',
    quantity: 500,
    availableQuantity: 500,
    avgCost: 82000,
    currentPrice: 85200,
    marketValue: 42600000,
    costBasis: 41000000,
    unrealizedPL: 1600000,
    unrealizedPLPercent: 3.9,
    weight: 17.4,
    dayChange: 800000,
    dayChangePercent: 1.91,
    purchaseHistory: [
      { date: '2024-06-15', quantity: 300, price: 80000, total: 24000000 },
      { date: '2024-08-20', quantity: 200, price: 85000, total: 17000000 },
    ],
    sparklineData: generateSparkline(85200, 0.3),
  },
  {
    symbol: 'FPT',
    name: 'CTCP FPT',
    sector: 'Công nghệ',
    assetType: 'stock',
    quantity: 300,
    availableQuantity: 300,
    avgCost: 88000,
    currentPrice: 92100,
    marketValue: 27630000,
    costBasis: 26400000,
    unrealizedPL: 1230000,
    unrealizedPLPercent: 4.66,
    weight: 11.3,
    dayChange: 450000,
    dayChangePercent: 1.65,
    purchaseHistory: [
      { date: '2024-05-10', quantity: 300, price: 88000, total: 26400000 },
    ],
    sparklineData: generateSparkline(92100, 0.5),
  },
  {
    symbol: 'VIC',
    name: 'Tập đoàn Vingroup',
    sector: 'Bất động sản',
    assetType: 'stock',
    quantity: 1000,
    availableQuantity: 800,
    avgCost: 45000,
    currentPrice: 42500,
    marketValue: 42500000,
    costBasis: 45000000,
    unrealizedPL: -2500000,
    unrealizedPLPercent: -5.56,
    weight: 17.3,
    dayChange: -850000,
    dayChangePercent: -1.96,
    purchaseHistory: [
      { date: '2024-04-01', quantity: 500, price: 48000, total: 24000000 },
      { date: '2024-07-15', quantity: 500, price: 42000, total: 21000000 },
    ],
    sparklineData: generateSparkline(42500, -0.3),
  },
  {
    symbol: 'HPG',
    name: 'CTCP Tập đoàn Hòa Phát',
    sector: 'Thép & Vật liệu',
    assetType: 'stock',
    quantity: 2000,
    availableQuantity: 2000,
    avgCost: 24000,
    currentPrice: 25800,
    marketValue: 51600000,
    costBasis: 48000000,
    unrealizedPL: 3600000,
    unrealizedPLPercent: 7.5,
    weight: 21.0,
    dayChange: 1200000,
    dayChangePercent: 2.38,
    purchaseHistory: [
      { date: '2024-03-20', quantity: 1000, price: 22000, total: 22000000 },
      { date: '2024-06-10', quantity: 1000, price: 26000, total: 26000000 },
    ],
    sparklineData: generateSparkline(25800, 0.4),
  },
  {
    symbol: 'MWG',
    name: 'CTCP Đầu tư Thế Giới Di Động',
    sector: 'Bán lẻ',
    assetType: 'stock',
    quantity: 400,
    availableQuantity: 400,
    avgCost: 52000,
    currentPrice: 54500,
    marketValue: 21800000,
    costBasis: 20800000,
    unrealizedPL: 1000000,
    unrealizedPLPercent: 4.81,
    weight: 8.9,
    dayChange: 320000,
    dayChangePercent: 1.49,
    purchaseHistory: [
      { date: '2024-07-01', quantity: 400, price: 52000, total: 20800000 },
    ],
    sparklineData: generateSparkline(54500, 0.2),
  },
  {
    symbol: 'TCB',
    name: 'Ngân hàng TMCP Kỹ Thương Việt Nam',
    sector: 'Ngân hàng',
    assetType: 'stock',
    quantity: 500,
    availableQuantity: 500,
    avgCost: 27500,
    currentPrice: 27800,
    marketValue: 13900000,
    costBasis: 13750000,
    unrealizedPL: 150000,
    unrealizedPLPercent: 1.09,
    weight: 5.7,
    dayChange: 100000,
    dayChangePercent: 0.72,
    purchaseHistory: [
      { date: '2024-08-15', quantity: 500, price: 27500, total: 13750000 },
    ],
    sparklineData: generateSparkline(27800, 0.1),
  },
  {
    symbol: 'VCB',
    name: 'Ngân hàng TMCP Ngoại Thương',
    sector: 'Ngân hàng',
    assetType: 'stock',
    quantity: 200,
    availableQuantity: 200,
    avgCost: 89000,
    currentPrice: 91500,
    marketValue: 18300000,
    costBasis: 17800000,
    unrealizedPL: 500000,
    unrealizedPLPercent: 2.81,
    weight: 7.5,
    dayChange: 200000,
    dayChangePercent: 1.10,
    purchaseHistory: [
      { date: '2024-09-01', quantity: 200, price: 89000, total: 17800000 },
    ],
    sparklineData: generateSparkline(91500, 0.25),
  },
  {
    symbol: 'SSI',
    name: 'CTCP Chứng khoán SSI',
    sector: 'Công nghệ',
    assetType: 'stock',
    quantity: 800,
    availableQuantity: 800,
    avgCost: 32000,
    currentPrice: 33500,
    marketValue: 26800000,
    costBasis: 25600000,
    unrealizedPL: 1200000,
    unrealizedPLPercent: 4.69,
    weight: 10.9,
    dayChange: 400000,
    dayChangePercent: 1.52,
    purchaseHistory: [
      { date: '2024-08-01', quantity: 800, price: 32000, total: 25600000 },
    ],
    sparklineData: generateSparkline(33500, 0.35),
  },
]

const initialSummary: PortfolioSummary = {
  totalValue: 290130000,
  stockValue: 245130000,
  cashBalance: 45000000,
  buyingPower: 145000000,
  pendingCash: 0,
  totalPL: 6780000,
  totalPLPercent: 2.84,
  dailyPL: 2620000,
  dailyPLPercent: 0.91,
  realizedPL: 5500000,
  unrealizedPL: 6780000,
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      holdings: initialHoldings,
      summary: initialSummary,
      performanceHistory: generatePerformanceHistory(365),
      lastUpdated: new Date().toISOString(),

      setHoldings: (holdings) => set({ holdings, lastUpdated: new Date().toISOString() }),

      setSummary: (summary) => set({ summary }),

      setPerformanceHistory: (history) => set({ performanceHistory: history }),

      updateHolding: (symbol, updates) =>
        set((state) => ({
          holdings: state.holdings.map((h) =>
            h.symbol === symbol ? { ...h, ...updates } : h
          ),
          lastUpdated: new Date().toISOString(),
        })),

      refreshData: () => {
        // Simulate data refresh with small random changes
        set((state) => ({
          holdings: state.holdings.map((h) => {
            const priceChange = (Math.random() - 0.5) * 0.02 * h.currentPrice
            const newPrice = Math.round(h.currentPrice + priceChange)
            const newMarketValue = newPrice * h.quantity
            const newPL = newMarketValue - h.costBasis
            const newPLPercent = (newPL / h.costBasis) * 100

            return {
              ...h,
              currentPrice: newPrice,
              marketValue: newMarketValue,
              unrealizedPL: newPL,
              unrealizedPLPercent: Math.round(newPLPercent * 100) / 100,
              dayChange: Math.round(priceChange * h.quantity),
              dayChangePercent: Math.round((priceChange / h.currentPrice) * 10000) / 100,
            }
          }),
          lastUpdated: new Date().toISOString(),
        }))
      },

      getBestPerformer: () => {
        const { holdings } = get()
        if (holdings.length === 0) return null
        return holdings.reduce((best, current) =>
          current.unrealizedPLPercent > best.unrealizedPLPercent ? current : best
        )
      },

      getWorstPerformer: () => {
        const { holdings } = get()
        if (holdings.length === 0) return null
        return holdings.reduce((worst, current) =>
          current.unrealizedPLPercent < worst.unrealizedPLPercent ? current : worst
        )
      },

      getSectorAllocation: () => {
        const { holdings, summary } = get()
        const sectorMap = new Map<string, number>()

        holdings.forEach((h) => {
          const current = sectorMap.get(h.sector) || 0
          sectorMap.set(h.sector, current + h.marketValue)
        })

        // Add cash
        sectorMap.set('Tiền mặt', summary.cashBalance)

        const total = summary.totalValue
        const allocations: SectorAllocation[] = []

        sectorMap.forEach((value, sector) => {
          allocations.push({
            sector,
            value,
            percent: Math.round((value / total) * 10000) / 100,
            color: SECTOR_COLORS[sector] || SECTOR_COLORS['Khác'],
          })
        })

        return allocations.sort((a, b) => b.value - a.value)
      },

      getAssetAllocation: () => {
        const { holdings, summary } = get()
        const assetMap = new Map<string, number>()

        holdings.forEach((h) => {
          const current = assetMap.get(h.assetType) || 0
          assetMap.set(h.assetType, current + h.marketValue)
        })

        // Add cash
        assetMap.set('cash', summary.cashBalance)

        const total = summary.totalValue
        const allocations: AssetAllocation[] = []

        assetMap.forEach((value, type) => {
          allocations.push({
            type: type as AssetAllocation['type'],
            value,
            percent: Math.round((value / total) * 10000) / 100,
            color: ASSET_COLORS[type] || ASSET_COLORS['cash'],
          })
        })

        return allocations.sort((a, b) => b.value - a.value)
      },

      getDiversificationScore: () => {
        const { holdings } = get()
        if (holdings.length === 0) return 0

        // Factors:
        // 1. Number of holdings (more = better, up to 15)
        // 2. Sector diversity (more sectors = better)
        // 3. Concentration (lower max weight = better)

        const holdingsScore = Math.min(holdings.length / 15, 1) * 30 // Max 30 points

        const sectors = new Set(holdings.map((h) => h.sector))
        const sectorScore = Math.min(sectors.size / 8, 1) * 30 // Max 30 points

        const maxWeight = Math.max(...holdings.map((h) => h.weight))
        const concentrationScore = Math.max(0, 1 - (maxWeight - 10) / 40) * 40 // Max 40 points

        return Math.round(holdingsScore + sectorScore + concentrationScore)
      },

      getConcentrationWarnings: () => {
        const { holdings } = get()
        const warnings: string[] = []

        holdings.forEach((h) => {
          if (h.weight > 25) {
            warnings.push(`${h.symbol} chiếm ${h.weight.toFixed(1)}% danh mục (>25%)`)
          }
        })

        // Check sector concentration
        const sectorWeights = new Map<string, number>()
        holdings.forEach((h) => {
          const current = sectorWeights.get(h.sector) || 0
          sectorWeights.set(h.sector, current + h.weight)
        })

        sectorWeights.forEach((weight, sector) => {
          if (weight > 40) {
            warnings.push(`Ngành ${sector} chiếm ${weight.toFixed(1)}% danh mục (>40%)`)
          }
        })

        return warnings
      },
    }),
    {
      name: 'portfolio-storage',
    }
  )
)
