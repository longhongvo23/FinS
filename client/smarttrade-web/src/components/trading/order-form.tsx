import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type OrderSide = 'buy' | 'sell'
export type OrderType = 'LO' | 'MP' | 'ATO' | 'ATC' | 'STOP' | 'STOP_LIMIT'

interface StockInfo {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  ceiling: number
  floor: number
  reference: number
  volume: number
}

export interface OrderData {
  symbol: string
  side: OrderSide
  type: OrderType
  quantity: number
  price: number
  stopPrice?: number
}

interface OrderFormProps {
  initialSymbol?: string
  initialSide?: OrderSide
  onSubmit?: (order: OrderData) => void
  className?: string
}

// Mock stock data
const mockStocks: Record<string, StockInfo> = {
  VNM: { symbol: 'VNM', name: 'Vinamilk', price: 85200, change: 1200, changePercent: 1.43, ceiling: 91100, floor: 79300, reference: 84000, volume: 2500000 },
  FPT: { symbol: 'FPT', name: 'FPT Corp', price: 92100, change: -480, changePercent: -0.52, ceiling: 98600, floor: 85700, reference: 92580, volume: 1800000 },
  VIC: { symbol: 'VIC', name: 'Vingroup', price: 42500, change: 900, changePercent: 2.16, ceiling: 45500, floor: 39500, reference: 41600, volume: 3200000 },
  HPG: { symbol: 'HPG', name: 'Hòa Phát', price: 25800, change: 300, changePercent: 1.18, ceiling: 27600, floor: 24000, reference: 25500, volume: 5600000 },
  VCB: { symbol: 'VCB', name: 'Vietcombank', price: 98500, change: 500, changePercent: 0.51, ceiling: 105400, floor: 91700, reference: 98000, volume: 980000 },
  TCB: { symbol: 'TCB', name: 'Techcombank', price: 32100, change: -100, changePercent: -0.31, ceiling: 34400, floor: 29900, reference: 32200, volume: 2800000 },
  MWG: { symbol: 'MWG', name: 'Thế Giới Di Động', price: 52000, change: -2400, changePercent: -4.41, ceiling: 55700, floor: 48400, reference: 54400, volume: 1900000 },
  SSI: { symbol: 'SSI', name: 'SSI Securities', price: 32500, change: 800, changePercent: 2.52, ceiling: 34800, floor: 30200, reference: 31700, volume: 2900000 },
}

const orderTypes: { value: OrderType; label: string; description: string }[] = [
  { value: 'LO', label: 'LO', description: 'Lệnh giới hạn' },
  { value: 'MP', label: 'MP', description: 'Lệnh thị trường' },
  { value: 'ATO', label: 'ATO', description: 'Lệnh mở cửa' },
  { value: 'ATC', label: 'ATC', description: 'Lệnh đóng cửa' },
  { value: 'STOP', label: 'Stop', description: 'Lệnh dừng' },
  { value: 'STOP_LIMIT', label: 'S-Limit', description: 'Dừng giới hạn' },
]

const LOT_SIZE = 100
const FEE_RATE = 0.0015 // 0.15%

export function OrderForm({
  initialSymbol = '',
  initialSide = 'buy',
  onSubmit,
  className,
}: OrderFormProps) {
  const [side, setSide] = useState<OrderSide>(initialSide)
  const [orderType, setOrderType] = useState<OrderType>('LO')
  const [symbolInput, setSymbolInput] = useState(initialSymbol)
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(
    initialSymbol ? mockStocks[initialSymbol] || null : null
  )
  const [quantity, setQuantity] = useState(100)
  const [price, setPrice] = useState(0)
  const [stopPrice, setStopPrice] = useState(0)
  const [showSymbolSearch, setShowSymbolSearch] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock available balance and holdings
  const availableBalance = 50000000
  const holdingQuantity = side === 'sell' && selectedStock ? 500 : 0

  // Update price when stock changes
  useEffect(() => {
    if (selectedStock) {
      setPrice(selectedStock.price)
      setStopPrice(Math.round(selectedStock.price * 0.95))
    }
  }, [selectedStock])

  // Search stocks
  const searchResults = useMemo(() => {
    if (!symbolInput) return []
    return Object.values(mockStocks).filter(
      (s) =>
        s.symbol.toLowerCase().includes(symbolInput.toLowerCase()) ||
        s.name.toLowerCase().includes(symbolInput.toLowerCase())
    )
  }, [symbolInput])

  // Calculate order value and fees
  const orderValue = useMemo(() => {
    if (!selectedStock || !quantity) return 0
    const p = orderType === 'MP' ? selectedStock.price : price
    return quantity * p
  }, [selectedStock, quantity, price, orderType])

  const estimatedFee = useMemo(() => {
    return Math.round(orderValue * FEE_RATE)
  }, [orderValue])

  const totalCost = useMemo(() => {
    return side === 'buy' ? orderValue + estimatedFee : orderValue - estimatedFee
  }, [side, orderValue, estimatedFee])

  // Max quantity calculation
  const maxQuantity = useMemo(() => {
    if (!selectedStock) return 0
    if (side === 'buy') {
      const p = orderType === 'MP' ? selectedStock.price : price
      if (p <= 0) return 0
      const maxByBalance = Math.floor(availableBalance / (p * (1 + FEE_RATE)))
      return Math.floor(maxByBalance / LOT_SIZE) * LOT_SIZE
    } else {
      return holdingQuantity
    }
  }, [selectedStock, side, price, orderType, availableBalance, holdingQuantity])

  // AI suggested price (mock)
  const aiSuggestedPrice = useMemo(() => {
    if (!selectedStock) return null
    return {
      price: Math.round(selectedStock.price * (side === 'buy' ? 0.995 : 1.005)),
      confidence: 78,
    }
  }, [selectedStock, side])

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedStock) {
      newErrors.symbol = 'Vui lòng chọn mã cổ phiếu'
    }

    if (quantity < LOT_SIZE) {
      newErrors.quantity = `Khối lượng tối thiểu ${LOT_SIZE}`
    }

    if (quantity % LOT_SIZE !== 0) {
      newErrors.quantity = `Khối lượng phải là bội số của ${LOT_SIZE}`
    }

    if (side === 'buy' && quantity > maxQuantity) {
      newErrors.quantity = 'Không đủ sức mua'
    }

    if (side === 'sell' && quantity > holdingQuantity) {
      newErrors.quantity = 'Không đủ số lượng nắm giữ'
    }

    if (orderType === 'LO' || orderType === 'STOP_LIMIT') {
      if (selectedStock && (price > selectedStock.ceiling || price < selectedStock.floor)) {
        newErrors.price = `Giá phải trong khoảng ${selectedStock.floor.toLocaleString()} - ${selectedStock.ceiling.toLocaleString()}`
      }
    }

    if (orderType === 'STOP' || orderType === 'STOP_LIMIT') {
      if (stopPrice <= 0) {
        newErrors.stopPrice = 'Vui lòng nhập giá kích hoạt'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSelectStock = (stock: StockInfo) => {
    setSelectedStock(stock)
    setSymbolInput(stock.symbol)
    setShowSymbolSearch(false)
  }

  const adjustQuantity = (delta: number) => {
    const newQty = Math.max(LOT_SIZE, quantity + delta * LOT_SIZE)
    setQuantity(Math.min(newQty, maxQuantity || newQty))
  }

  const adjustPrice = (delta: number) => {
    if (!selectedStock) return
    const step = selectedStock.price >= 50000 ? 100 : 50
    const newPrice = Math.max(selectedStock.floor, Math.min(selectedStock.ceiling, price + delta * step))
    setPrice(newPrice)
  }

  const handleSubmit = async () => {
    if (!validate() || !selectedStock) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 500))

    const orderData: OrderData = {
      symbol: selectedStock.symbol,
      side,
      type: orderType,
      quantity,
      price: orderType === 'MP' ? selectedStock.price : price,
      stopPrice: orderType === 'STOP' || orderType === 'STOP_LIMIT' ? stopPrice : undefined,
    }

    onSubmit?.(orderData)
    setIsSubmitting(false)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Đặt lệnh</span>
          {selectedStock && (
            <Badge variant="outline" className="font-mono">
              {selectedStock.symbol}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === 'buy' ? 'default' : 'outline'}
            className={cn(
              'font-semibold',
              side === 'buy' && 'bg-success hover:bg-success/90'
            )}
            onClick={() => setSide('buy')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            MUA
          </Button>
          <Button
            variant={side === 'sell' ? 'default' : 'outline'}
            className={cn(
              'font-semibold',
              side === 'sell' && 'bg-danger hover:bg-danger/90'
            )}
            onClick={() => setSide('sell')}
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            BÁN
          </Button>
        </div>

        {/* Symbol Search */}
        <div className="space-y-2">
          <Label>Mã cổ phiếu</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              value={symbolInput}
              onChange={(e) => {
                setSymbolInput(e.target.value.toUpperCase())
                setShowSymbolSearch(true)
              }}
              onFocus={() => setShowSymbolSearch(true)}
              placeholder="Tìm mã CK..."
              className="pl-9"
            />
            {showSymbolSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface-1 border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="flex items-center justify-between p-3 hover:bg-surface-2 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-xs text-foreground-muted">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{stock.price.toLocaleString()}</p>
                      <p className={cn(
                        'text-xs font-mono',
                        stock.changePercent >= 0 ? 'text-success' : 'text-danger'
                      )}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.symbol && (
            <p className="text-xs text-danger flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.symbol}
            </p>
          )}
        </div>

        {/* Current Price Display */}
        {selectedStock && (
          <div className="p-3 rounded-lg bg-surface-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-muted">Giá hiện tại</span>
              <Badge variant={selectedStock.changePercent >= 0 ? 'default' : 'destructive'}
                className={selectedStock.changePercent >= 0 ? 'bg-success' : ''}>
                {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
              </Badge>
            </div>
            <p className={cn(
              'text-2xl font-mono font-bold',
              selectedStock.changePercent > 0 && 'text-success',
              selectedStock.changePercent < 0 && 'text-danger',
              selectedStock.changePercent === 0 && 'text-warning'
            )}>
              {selectedStock.price.toLocaleString()}
            </p>
            <div className="flex justify-between text-xs text-foreground-muted mt-2">
              <span>Sàn: <span className="text-danger">{selectedStock.floor.toLocaleString()}</span></span>
              <span>TC: <span className="text-warning">{selectedStock.reference.toLocaleString()}</span></span>
              <span>Trần: <span className="text-success">{selectedStock.ceiling.toLocaleString()}</span></span>
            </div>
          </div>
        )}

        {/* Order Type */}
        <div className="space-y-2">
          <Label>Loại lệnh</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {orderTypes.map((type) => (
              <Button
                key={type.value}
                variant={orderType === type.value ? 'secondary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setOrderType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-foreground-muted flex items-center gap-1">
            <Info className="h-3 w-3" />
            {orderTypes.find((t) => t.value === orderType)?.description}
          </p>
        </div>

        {/* Price Input (for LO and STOP_LIMIT) */}
        {(orderType === 'LO' || orderType === 'STOP_LIMIT') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Giá đặt</Label>
              {aiSuggestedPrice && (
                <button
                  onClick={() => setPrice(aiSuggestedPrice.price)}
                  className="flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  AI: {aiSuggestedPrice.price.toLocaleString()} ({aiSuggestedPrice.confidence}%)
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => adjustPrice(-1)}
                disabled={!selectedStock || price <= selectedStock.floor}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="text-center font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => adjustPrice(1)}
                disabled={!selectedStock || price >= selectedStock.ceiling}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.price && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.price}
              </p>
            )}
          </div>
        )}

        {/* Stop Price Input (for STOP and STOP_LIMIT) */}
        {(orderType === 'STOP' || orderType === 'STOP_LIMIT') && (
          <div className="space-y-2">
            <Label>Giá kích hoạt</Label>
            <Input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(Number(e.target.value))}
              className="font-mono"
              placeholder="Giá stop"
            />
            {errors.stopPrice && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.stopPrice}
              </p>
            )}
          </div>
        )}

        {/* Quantity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Khối lượng</Label>
            <span className="text-xs text-foreground-muted">
              {side === 'buy'
                ? `Sức mua: ${maxQuantity.toLocaleString()}`
                : `Có thể bán: ${holdingQuantity.toLocaleString()}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => adjustQuantity(-1)}
              disabled={quantity <= LOT_SIZE}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="text-center font-mono"
              step={LOT_SIZE}
            />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => adjustQuantity(1)}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Quick quantity buttons */}
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  const qty = Math.floor((maxQuantity * percent) / 100 / LOT_SIZE) * LOT_SIZE
                  setQuantity(Math.max(LOT_SIZE, qty))
                }}
              >
                {percent}%
              </Button>
            ))}
          </div>
          {errors.quantity && (
            <p className="text-xs text-danger flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.quantity}
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="p-3 rounded-lg bg-surface-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Giá trị lệnh</span>
            <span className="font-mono">{orderValue.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Phí GD (~0.15%)</span>
            <span className="font-mono">{estimatedFee.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
            <span>{side === 'buy' ? 'Tổng tiền mua' : 'Tiền nhận về'}</span>
            <span className={cn(
              'font-mono',
              side === 'buy' ? 'text-danger' : 'text-success'
            )}>
              {totalCost.toLocaleString()} đ
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className={cn(
            'w-full font-semibold',
            side === 'buy'
              ? 'bg-success hover:bg-success/90'
              : 'bg-danger hover:bg-danger/90'
          )}
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedStock}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              {side === 'buy' ? 'ĐẶT LỆNH MUA' : 'ĐẶT LỆNH BÁN'}
            </>
          )}
        </Button>

        {/* Balance Info */}
        <div className="text-center text-xs text-foreground-muted">
          Số dư khả dụng: <span className="font-mono font-medium">{availableBalance.toLocaleString()} đ</span>
        </div>
      </CardContent>
    </Card>
  )
}
