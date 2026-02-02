export interface Stock {
  symbol: string
  name: string
  nameEn?: string
  exchange: 'HOSE' | 'HNX' | 'UPCOM'
  sector?: string
  industry?: string
  marketCap?: number
  isVn30?: boolean
  isActive?: boolean
  // Price data (when joined with StockPrice)
  price: number
  change: number
  changePercent: number
  volume: number
  high?: number
  low?: number
}

export interface StockPrice {
  symbol: string
  open_price: number
  high_price: number
  low_price: number
  close_price: number
  ref_price: number
  ceiling_price: number
  floor_price: number
  volume: number
  value: number
  price_date: string
}

export interface StockRealtime {
  symbol: string
  current_price: number
  change: number
  change_percent: number

  open_price: number
  high_price: number
  low_price: number
  ref_price: number
  ceiling_price: number
  floor_price: number

  total_volume: number
  total_value: number

  bid_prices: number[]
  bid_volumes: number[]
  ask_prices: number[]
  ask_volumes: number[]

  foreign_buy_volume: number
  foreign_sell_volume: number

  last_updated: string
}

export interface StockFundamentals {
  symbol: string
  pe_ratio?: number
  pb_ratio?: number
  roe?: number
  roa?: number
  eps?: number
  dividend_yield?: number
  market_cap?: number
}

export interface MarketIndex {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
  volume: number
  valueTrades?: number
  advances?: number
  declines?: number
  unchanged?: number
}
