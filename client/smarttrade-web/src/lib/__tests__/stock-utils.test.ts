import { describe, it, expect } from 'vitest'

describe('Stock Utils', () => {
  // ============================================
  // Price Color Determination
  // ============================================

  describe('getPriceColor', () => {
    const getPriceColor = (
      price: number,
      reference: number,
      ceiling: number,
      floor: number
    ) => {
      if (price === ceiling) return 'purple' // Trần
      if (price === floor) return 'cyan' // Sàn
      if (price > reference) return 'green' // Tăng
      if (price < reference) return 'red' // Giảm
      return 'yellow' // Tham chiếu
    }

    it('returns purple for ceiling price', () => {
      expect(getPriceColor(82000, 76500, 82000, 71000)).toBe('purple')
    })

    it('returns cyan for floor price', () => {
      expect(getPriceColor(71000, 76500, 82000, 71000)).toBe('cyan')
    })

    it('returns green for price above reference', () => {
      expect(getPriceColor(78000, 76500, 82000, 71000)).toBe('green')
    })

    it('returns red for price below reference', () => {
      expect(getPriceColor(74000, 76500, 82000, 71000)).toBe('red')
    })

    it('returns yellow for reference price', () => {
      expect(getPriceColor(76500, 76500, 82000, 71000)).toBe('yellow')
    })

    it('returns green for slightly above reference', () => {
      expect(getPriceColor(76600, 76500, 82000, 71000)).toBe('green')
    })

    it('returns red for slightly below reference', () => {
      expect(getPriceColor(76400, 76500, 82000, 71000)).toBe('red')
    })
  })

  // ============================================
  // Price Formatting
  // ============================================

  describe('formatStockPrice', () => {
    const formatStockPrice = (price: number) => {
      if (price >= 1000) {
        return price.toLocaleString('vi-VN')
      }
      return price.toFixed(2)
    }

    it('formats large prices with separators', () => {
      expect(formatStockPrice(76500)).toBe('76.500')
    })

    it('formats small prices with decimals', () => {
      expect(formatStockPrice(12.5)).toBe('12.50')
    })

    it('formats very large prices', () => {
      expect(formatStockPrice(150000)).toBe('150.000')
    })

    it('formats prices at boundary', () => {
      expect(formatStockPrice(1000)).toBe('1.000')
    })

    it('formats prices below boundary with decimals', () => {
      expect(formatStockPrice(999)).toBe('999.00')
    })
  })

  // ============================================
  // Symbol Validation
  // ============================================

  describe('validateSymbol', () => {
    const validateSymbol = (symbol: string) => {
      const regex = /^[A-Z0-9]{3}$/
      return regex.test(symbol)
    }

    it('accepts valid 3-character symbols', () => {
      expect(validateSymbol('VNM')).toBe(true)
      expect(validateSymbol('FPT')).toBe(true)
      expect(validateSymbol('VCB')).toBe(true)
    })

    it('accepts alphanumeric symbols', () => {
      expect(validateSymbol('VN3')).toBe(true)
      expect(validateSymbol('X26')).toBe(true)
    })

    it('rejects lowercase symbols', () => {
      expect(validateSymbol('vnm')).toBe(false)
      expect(validateSymbol('Vnm')).toBe(false)
    })

    it('rejects 2-character symbols', () => {
      expect(validateSymbol('VN')).toBe(false)
    })

    it('rejects 4-character symbols', () => {
      expect(validateSymbol('VNMX')).toBe(false)
      expect(validateSymbol('VN30')).toBe(false)
    })

    it('rejects symbols with special characters', () => {
      expect(validateSymbol('VN-M')).toBe(false)
      expect(validateSymbol('V.N')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(validateSymbol('')).toBe(false)
    })
  })

  // ============================================
  // Market Cap Formatting
  // ============================================

  describe('formatMarketCap', () => {
    const formatMarketCap = (value: number) => {
      if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
      return value.toLocaleString()
    }

    it('formats trillions', () => {
      expect(formatMarketCap(1.5e12)).toBe('1.5T')
      expect(formatMarketCap(180e12)).toBe('180.0T')
    })

    it('formats billions', () => {
      expect(formatMarketCap(250e9)).toBe('250.0B')
      expect(formatMarketCap(1.2e9)).toBe('1.2B')
    })

    it('formats millions', () => {
      expect(formatMarketCap(50e6)).toBe('50.0M')
      expect(formatMarketCap(500e6)).toBe('500.0M')
    })

    it('formats smaller values normally', () => {
      expect(formatMarketCap(100000)).toBe('100,000')
    })

    it('handles edge cases at boundaries', () => {
      expect(formatMarketCap(1e12)).toBe('1.0T')
      expect(formatMarketCap(1e9)).toBe('1.0B')
      expect(formatMarketCap(1e6)).toBe('1.0M')
    })
  })

  // ============================================
  // Exchange Identification
  // ============================================

  describe('getExchange', () => {
    const getExchange = (symbol: string): 'HOSE' | 'HNX' | 'UPCOM' | 'Unknown' => {
      const hoseSymbols = ['VNM', 'FPT', 'VCB', 'HPG', 'MWG', 'VIC', 'VHM', 'VRE']
      const hnxSymbols = ['SHS', 'PVS', 'CEO']

      if (hoseSymbols.includes(symbol)) return 'HOSE'
      if (hnxSymbols.includes(symbol)) return 'HNX'
      return 'UPCOM'
    }

    it('identifies HOSE stocks', () => {
      expect(getExchange('VNM')).toBe('HOSE')
      expect(getExchange('FPT')).toBe('HOSE')
      expect(getExchange('VCB')).toBe('HOSE')
    })

    it('identifies HNX stocks', () => {
      expect(getExchange('SHS')).toBe('HNX')
      expect(getExchange('PVS')).toBe('HNX')
    })

    it('defaults to UPCOM for unknown stocks', () => {
      expect(getExchange('XXX')).toBe('UPCOM')
      expect(getExchange('ABC')).toBe('UPCOM')
    })
  })

  // ============================================
  // Change Percent Calculations
  // ============================================

  describe('calculateChange', () => {
    const calculateChange = (current: number, reference: number) => {
      const change = current - reference
      const changePercent = reference > 0 ? (change / reference) * 100 : 0
      return { change, changePercent }
    }

    it('calculates positive change', () => {
      const result = calculateChange(82000, 76500)
      expect(result.change).toBe(5500)
      expect(result.changePercent).toBeCloseTo(7.19, 2)
    })

    it('calculates negative change', () => {
      const result = calculateChange(71000, 76500)
      expect(result.change).toBe(-5500)
      expect(result.changePercent).toBeCloseTo(-7.19, 2)
    })

    it('calculates zero change', () => {
      const result = calculateChange(76500, 76500)
      expect(result.change).toBe(0)
      expect(result.changePercent).toBe(0)
    })

    it('handles zero reference price', () => {
      const result = calculateChange(100, 0)
      expect(result.changePercent).toBe(0)
    })
  })

  // ============================================
  // Volume Formatting
  // ============================================

  describe('formatVolume', () => {
    const formatVolume = (volume: number) => {
      if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`
      if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`
      if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`
      return volume.toString()
    }

    it('formats billions', () => {
      expect(formatVolume(1.5e9)).toBe('1.50B')
    })

    it('formats millions', () => {
      expect(formatVolume(2.5e6)).toBe('2.50M')
    })

    it('formats thousands', () => {
      expect(formatVolume(500e3)).toBe('500.00K')
    })

    it('formats small volumes', () => {
      expect(formatVolume(500)).toBe('500')
    })
  })

  // ============================================
  // Price Limit Calculations
  // ============================================

  describe('calculatePriceLimits', () => {
    const calculatePriceLimits = (reference: number, limitPercent: number = 7) => {
      const ceiling = Math.round((reference * (1 + limitPercent / 100)) / 100) * 100
      const floor = Math.round((reference * (1 - limitPercent / 100)) / 100) * 100
      return { ceiling, floor }
    }

    it('calculates HOSE limits (7%)', () => {
      const result = calculatePriceLimits(76500, 7)
      // 76500 * 1.07 = 81855 -> rounds to 81900
      // 76500 * 0.93 = 71145 -> rounds to 71100
      expect(result.ceiling).toBe(81900)
      expect(result.floor).toBe(71100)
    })

    it('calculates HNX limits (10%)', () => {
      const result = calculatePriceLimits(76500, 10)
      expect(result.ceiling).toBe(84200)
      expect(result.floor).toBe(68900)
    })

    it('rounds to nearest 100', () => {
      const result = calculatePriceLimits(50000, 7)
      expect(result.ceiling % 100).toBe(0)
      expect(result.floor % 100).toBe(0)
    })
  })
})
