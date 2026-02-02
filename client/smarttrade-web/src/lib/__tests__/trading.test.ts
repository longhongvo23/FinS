import { describe, it, expect } from 'vitest'

// ============================================
// Price Validation
// ============================================

describe('Price Validation', () => {
  const validatePrice = (price: number, floor: number, ceiling: number) => {
    if (price < floor) return { valid: false, error: 'Giá thấp hơn giá sàn' }
    if (price > ceiling) return { valid: false, error: 'Giá cao hơn giá trần' }
    if (price % 100 !== 0) return { valid: false, error: 'Giá phải là bội số của 100' }
    return { valid: true, error: null }
  }

  it('accepts valid price within range', () => {
    expect(validatePrice(76500, 71000, 82000).valid).toBe(true)
  })

  it('rejects price below floor', () => {
    const result = validatePrice(70000, 71000, 82000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('sàn')
  })

  it('rejects price above ceiling', () => {
    const result = validatePrice(85000, 71000, 82000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('trần')
  })

  it('rejects price not multiple of 100', () => {
    const result = validatePrice(76550, 71000, 82000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('bội số')
  })

  it('accepts floor price', () => {
    expect(validatePrice(71000, 71000, 82000).valid).toBe(true)
  })

  it('accepts ceiling price', () => {
    expect(validatePrice(82000, 71000, 82000).valid).toBe(true)
  })
})

// ============================================
// Quantity Validation
// ============================================

describe('Quantity Validation', () => {
  const validateQuantity = (qty: number, maxQty?: number) => {
    if (qty <= 0) return { valid: false, error: 'Khối lượng phải lớn hơn 0' }
    if (qty % 100 !== 0) return { valid: false, error: 'Khối lượng phải là bội số của 100' }
    if (maxQty && qty > maxQty) return { valid: false, error: 'Vượt quá số lượng khả dụng' }
    return { valid: true, error: null }
  }

  it('accepts valid quantity', () => {
    expect(validateQuantity(100).valid).toBe(true)
    expect(validateQuantity(1000).valid).toBe(true)
  })

  it('rejects zero quantity', () => {
    expect(validateQuantity(0).valid).toBe(false)
  })

  it('rejects negative quantity', () => {
    expect(validateQuantity(-100).valid).toBe(false)
  })

  it('rejects non-lot quantity', () => {
    expect(validateQuantity(150).valid).toBe(false)
    expect(validateQuantity(50).valid).toBe(false)
  })

  it('rejects quantity exceeding max', () => {
    const result = validateQuantity(2000, 1000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('khả dụng')
  })

  it('accepts quantity at max', () => {
    expect(validateQuantity(1000, 1000).valid).toBe(true)
  })
})

// ============================================
// Fee Calculations
// ============================================

describe('Fee Calculations', () => {
  const FEE_RATES = {
    buy: 0.0015,      // 0.15%
    sell: 0.0015,     // 0.15%
    tax: 0.001,       // 0.1% (sell only)
  }

  const calculateFees = (value: number, side: 'buy' | 'sell') => {
    const tradingFee = Math.round(value * FEE_RATES[side])
    const tax = side === 'sell' ? Math.round(value * FEE_RATES.tax) : 0
    return { tradingFee, tax, total: tradingFee + tax }
  }

  it('calculates buy fees correctly', () => {
    const fees = calculateFees(10000000, 'buy')
    expect(fees.tradingFee).toBe(15000)
    expect(fees.tax).toBe(0)
    expect(fees.total).toBe(15000)
  })

  it('calculates sell fees with tax', () => {
    const fees = calculateFees(10000000, 'sell')
    expect(fees.tradingFee).toBe(15000)
    expect(fees.tax).toBe(10000)
    expect(fees.total).toBe(25000)
  })

  it('handles small values', () => {
    const fees = calculateFees(100000, 'buy')
    expect(fees.tradingFee).toBe(150)
  })

  it('rounds to nearest VND', () => {
    const fees = calculateFees(7650000, 'buy')
    expect(Number.isInteger(fees.tradingFee)).toBe(true)
  })

  it('handles zero value', () => {
    const fees = calculateFees(0, 'buy')
    expect(fees.total).toBe(0)
  })
})

// ============================================
// P&L Calculations
// ============================================

describe('P&L Calculations', () => {
  interface Holding {
    quantity: number
    avgPrice: number
    currentPrice: number
  }

  const calculatePnL = (holding: Holding) => {
    const costBasis = holding.quantity * holding.avgPrice
    const currentValue = holding.quantity * holding.currentPrice
    const pnl = currentValue - costBasis
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0
    return { costBasis, currentValue, pnl, pnlPercent }
  }

  it('calculates profit correctly', () => {
    const result = calculatePnL({ quantity: 1000, avgPrice: 72000, currentPrice: 76500 })
    expect(result.costBasis).toBe(72000000)
    expect(result.currentValue).toBe(76500000)
    expect(result.pnl).toBe(4500000)
    expect(result.pnlPercent).toBeCloseTo(6.25, 2)
  })

  it('calculates loss correctly', () => {
    const result = calculatePnL({ quantity: 1000, avgPrice: 80000, currentPrice: 76500 })
    expect(result.pnl).toBe(-3500000)
    expect(result.pnlPercent).toBeCloseTo(-4.375, 2)
  })

  it('handles zero profit', () => {
    const result = calculatePnL({ quantity: 1000, avgPrice: 76500, currentPrice: 76500 })
    expect(result.pnl).toBe(0)
    expect(result.pnlPercent).toBe(0)
  })

  it('handles zero quantity', () => {
    const result = calculatePnL({ quantity: 0, avgPrice: 76500, currentPrice: 76500 })
    expect(result.currentValue).toBe(0)
    expect(result.pnlPercent).toBe(0)
  })
})

// ============================================
// Portfolio Calculations
// ============================================

describe('Portfolio Calculations', () => {
  interface PortfolioHolding {
    symbol: string
    quantity: number
    avgPrice: number
    currentPrice: number
  }

  const calculatePortfolioSummary = (holdings: PortfolioHolding[], cashBalance: number) => {
    let totalCost = 0
    let totalValue = 0

    holdings.forEach(h => {
      totalCost += h.quantity * h.avgPrice
      totalValue += h.quantity * h.currentPrice
    })

    const stockValue = totalValue
    const totalPortfolioValue = stockValue + cashBalance
    const totalPnL = totalValue - totalCost
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

    return { stockValue, cashBalance, totalPortfolioValue, totalPnL, totalPnLPercent }
  }

  const mockHoldings: PortfolioHolding[] = [
    { symbol: 'VNM', quantity: 1000, avgPrice: 72000, currentPrice: 76500 },
    { symbol: 'FPT', quantity: 500, avgPrice: 85000, currentPrice: 92100 },
  ]

  it('calculates total portfolio value', () => {
    const result = calculatePortfolioSummary(mockHoldings, 100000000)
    expect(result.stockValue).toBe(76500000 + 46050000)
    expect(result.totalPortfolioValue).toBe(76500000 + 46050000 + 100000000)
  })

  it('calculates total P&L', () => {
    const result = calculatePortfolioSummary(mockHoldings, 0)
    const expectedPnL = (76500 - 72000) * 1000 + (92100 - 85000) * 500
    expect(result.totalPnL).toBe(expectedPnL)
  })

  it('handles empty portfolio', () => {
    const result = calculatePortfolioSummary([], 50000000)
    expect(result.stockValue).toBe(0)
    expect(result.totalPortfolioValue).toBe(50000000)
    expect(result.totalPnL).toBe(0)
  })

  it('calculates P&L percent correctly', () => {
    const result = calculatePortfolioSummary(mockHoldings, 0)
    const totalCost = 72000 * 1000 + 85000 * 500
    const totalValue = 76500 * 1000 + 92100 * 500
    const expectedPercent = ((totalValue - totalCost) / totalCost) * 100
    expect(result.totalPnLPercent).toBeCloseTo(expectedPercent, 2)
  })
})

// ============================================
// Order Value Calculations
// ============================================

describe('Order Value Calculations', () => {
  const calculateOrderSummary = (price: number, quantity: number, side: 'buy' | 'sell') => {
    const orderValue = price * quantity
    const feeRate = 0.0015
    const taxRate = side === 'sell' ? 0.001 : 0

    const fee = Math.round(orderValue * feeRate)
    const tax = Math.round(orderValue * taxRate)

    const totalCost = side === 'buy' ? orderValue + fee : orderValue - fee - tax
    const netProceeds = side === 'sell' ? orderValue - fee - tax : 0

    return { orderValue, fee, tax, totalCost, netProceeds }
  }

  it('calculates buy order correctly', () => {
    const result = calculateOrderSummary(76500, 100, 'buy')
    expect(result.orderValue).toBe(7650000)
    expect(result.fee).toBe(11475)
    expect(result.tax).toBe(0)
    expect(result.totalCost).toBe(7661475)
  })

  it('calculates sell order correctly', () => {
    const result = calculateOrderSummary(76500, 100, 'sell')
    expect(result.orderValue).toBe(7650000)
    expect(result.fee).toBe(11475)
    expect(result.tax).toBe(7650)
    expect(result.netProceeds).toBe(7650000 - 11475 - 7650)
  })

  it('handles large orders', () => {
    const result = calculateOrderSummary(100000, 10000, 'buy')
    expect(result.orderValue).toBe(1000000000)
    expect(result.fee).toBe(1500000)
  })
})

// ============================================
// Price Step Calculations
// ============================================

describe('Price Step Calculations', () => {
  const getPriceStep = (price: number): number => {
    if (price >= 50000) return 100
    if (price >= 10000) return 50
    return 10
  }

  const roundToStep = (price: number): number => {
    const step = getPriceStep(price)
    return Math.round(price / step) * step
  }

  it('returns correct step for high price stocks', () => {
    expect(getPriceStep(76500)).toBe(100)
    expect(getPriceStep(50000)).toBe(100)
  })

  it('returns correct step for mid price stocks', () => {
    expect(getPriceStep(25000)).toBe(50)
    expect(getPriceStep(10000)).toBe(50)
  })

  it('returns correct step for low price stocks', () => {
    expect(getPriceStep(5000)).toBe(10)
    expect(getPriceStep(1000)).toBe(10)
  })

  it('rounds price to correct step', () => {
    expect(roundToStep(76550)).toBe(76600)
    expect(roundToStep(76540)).toBe(76500)
  })
})
