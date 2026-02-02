import type { PortfolioHolding, PerformanceSnapshot } from '@/stores/portfolio-store'

/**
 * Calculate total portfolio value from holdings + cash
 */
export function calculateTotalValue(holdings: PortfolioHolding[], cashBalance: number): number {
  const stockValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  return stockValue + cashBalance
}

/**
 * Calculate total P&L from all holdings
 */
export function calculateTotalPL(holdings: PortfolioHolding[]): {
  amount: number
  percent: number
} {
  const totalPL = holdings.reduce((sum, h) => sum + h.unrealizedPL, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0)
  const percent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0

  return {
    amount: totalPL,
    percent: Math.round(percent * 100) / 100,
  }
}

/**
 * Calculate daily P&L from all holdings
 */
export function calculateDailyPL(holdings: PortfolioHolding[]): {
  amount: number
  percent: number
} {
  const dailyPL = holdings.reduce((sum, h) => sum + h.dayChange, 0)
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  const percent = totalValue > 0 ? (dailyPL / (totalValue - dailyPL)) * 100 : 0

  return {
    amount: dailyPL,
    percent: Math.round(percent * 100) / 100,
  }
}

/**
 * Calculate returns for a given time period
 */
export function calculatePeriodReturns(
  history: PerformanceSnapshot[],
  period: '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'
): {
  portfolioReturn: number
  benchmarkReturn: number
  alpha: number
} {
  if (history.length < 2) {
    return { portfolioReturn: 0, benchmarkReturn: 0, alpha: 0 }
  }

  const now = new Date()
  let startDate: Date

  switch (period) {
    case '1W':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '1M':
      startDate = new Date(now)
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case '3M':
      startDate = new Date(now)
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case '6M':
      startDate = new Date(now)
      startDate.setMonth(startDate.getMonth() - 6)
      break
    case '1Y':
      startDate = new Date(now)
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    case 'YTD':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'ALL':
    default:
      startDate = new Date(0)
  }

  const filteredHistory = history.filter((h) => new Date(h.date) >= startDate)

  if (filteredHistory.length < 2) {
    return { portfolioReturn: 0, benchmarkReturn: 0, alpha: 0 }
  }

  const first = filteredHistory[0]
  const last = filteredHistory[filteredHistory.length - 1]

  const portfolioReturn =
    ((last.portfolioValue - first.portfolioValue) / first.portfolioValue) * 100
  const benchmarkReturn =
    ((last.benchmarkValue - first.benchmarkValue) / first.benchmarkValue) * 100
  const alpha = portfolioReturn - benchmarkReturn

  return {
    portfolioReturn: Math.round(portfolioReturn * 100) / 100,
    benchmarkReturn: Math.round(benchmarkReturn * 100) / 100,
    alpha: Math.round(alpha * 100) / 100,
  }
}

/**
 * Calculate portfolio weight for a holding
 */
export function calculateWeight(holdingValue: number, totalValue: number): number {
  if (totalValue === 0) return 0
  return Math.round((holdingValue / totalValue) * 10000) / 100
}

/**
 * Calculate Sharpe ratio (simplified)
 */
export function calculateSharpeRatio(
  history: PerformanceSnapshot[],
  riskFreeRate: number = 0.05
): number {
  if (history.length < 30) return 0

  // Calculate daily returns
  const returns: number[] = []
  for (let i = 1; i < history.length; i++) {
    const dailyReturn =
      (history[i].portfolioValue - history[i - 1].portfolioValue) /
      history[i - 1].portfolioValue
    returns.push(dailyReturn)
  }

  // Calculate mean return
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length

  // Calculate standard deviation
  const squaredDiffs = returns.map((r) => Math.pow(r - meanReturn, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
  const stdDev = Math.sqrt(avgSquaredDiff)

  // Annualize
  const annualizedReturn = meanReturn * 252
  const annualizedStdDev = stdDev * Math.sqrt(252)

  // Sharpe ratio
  if (annualizedStdDev === 0) return 0
  return Math.round(((annualizedReturn - riskFreeRate) / annualizedStdDev) * 100) / 100
}

/**
 * Calculate max drawdown
 */
export function calculateMaxDrawdown(history: PerformanceSnapshot[]): {
  percentage: number
  startDate: string
  endDate: string
} {
  if (history.length < 2) {
    return { percentage: 0, startDate: '', endDate: '' }
  }

  let maxDrawdown = 0
  let peak = history[0].portfolioValue
  let peakDate = history[0].date
  let drawdownStartDate = ''
  let drawdownEndDate = ''

  for (const snapshot of history) {
    if (snapshot.portfolioValue > peak) {
      peak = snapshot.portfolioValue
      peakDate = snapshot.date
    }

    const drawdown = ((peak - snapshot.portfolioValue) / peak) * 100

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
      drawdownStartDate = peakDate
      drawdownEndDate = snapshot.date
    }
  }

  return {
    percentage: Math.round(maxDrawdown * 100) / 100,
    startDate: drawdownStartDate,
    endDate: drawdownEndDate,
  }
}

/**
 * Calculate sector weights
 */
export function calculateSectorWeights(
  holdings: PortfolioHolding[]
): Map<string, number> {
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  const sectorWeights = new Map<string, number>()

  holdings.forEach((h) => {
    const current = sectorWeights.get(h.sector) || 0
    sectorWeights.set(
      h.sector,
      current + calculateWeight(h.marketValue, totalValue)
    )
  })

  return sectorWeights
}

/**
 * Format currency for display (VND)
 */
export function formatVND(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return `${(value / 1e12).toFixed(1)}T`
  }
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  }
  return value.toLocaleString('vi-VN')
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, showSign: boolean = true): string {
  const sign = showSign && value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Get color based on value (positive/negative)
 */
export function getValueColor(value: number): string {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-danger'
  return 'text-foreground-muted'
}

/**
 * Get background color based on value
 */
export function getValueBgColor(value: number): string {
  if (value > 0) return 'bg-success/10'
  if (value < 0) return 'bg-danger/10'
  return 'bg-muted/10'
}
