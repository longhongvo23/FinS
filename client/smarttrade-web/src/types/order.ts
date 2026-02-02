export type OrderSide = 'BUY' | 'SELL'
export type OrderType = 'LO' | 'MP' | 'ATO' | 'ATC' | 'MTL' | 'MOK' | 'MAK'
export type OrderStatus = 'pending' | 'open' | 'partial' | 'filled' | 'cancelled' | 'rejected'

export interface Order {
  id: string
  user_id: string
  account_id: string
  order_number: string

  symbol: string
  side: OrderSide
  order_type: OrderType

  quantity: number
  price?: number
  stop_price?: number

  filled_quantity: number
  avg_filled_price?: number
  remaining_quantity: number

  status: OrderStatus
  reject_reason?: string

  commission: number
  tax: number
  total_fee: number

  created_at: string
  filled_at?: string

  ai_suggested: boolean
}

export interface OrderFormData {
  symbol: string
  side: OrderSide
  order_type: OrderType
  quantity: number
  price?: number
  stop_price?: number
}
