export interface Holding {
  id: string
  symbol: string
  quantity: number
  available_quantity: number
  avg_cost: number
  total_cost: number
  current_price: number
  market_value: number
  unrealized_pl: number
  unrealized_pl_percent: number
}

export interface PortfolioSummary {
  total_value: number
  cash_balance: number
  stock_value: number
  total_pl: number
  total_pl_percent: number
  daily_pl: number
  daily_pl_percent: number
}

export interface PortfolioSnapshot {
  snapshot_date: string
  total_value: number
  total_pl_percent: number
}
