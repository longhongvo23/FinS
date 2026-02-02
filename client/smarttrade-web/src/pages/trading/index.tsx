import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrderForm, OrderData } from '@/components/trading/order-form'
import { OrderConfirmationModal } from '@/components/trading/order-confirmation-modal'
import { OrderBook } from '@/components/trading/order-book'
import { CandlestickChart, OHLCData } from '@/components/charts/candlestick-chart'
import { toast } from 'sonner'

// Generate mock OHLC data
const generateOHLCData = (days: number, basePrice: number): OHLCData[] => {
  const data: OHLCData[] = []
  let price = basePrice * 0.9
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const volatility = 0.02
    const change = (Math.random() - 0.5) * 2 * volatility * price
    const open = price
    const close = price + change
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    const volume = Math.floor(1000000 + Math.random() * 5000000)

    data.push({
      time: date.toISOString().slice(0, 10),
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    })

    price = close
  }

  return data
}

// Mock recent orders
const mockRecentOrders = [
  { id: '1', symbol: 'VNM', side: 'buy' as const, type: 'LO', quantity: 500, price: 85200, status: 'filled', time: '09:15:32' },
  { id: '2', symbol: 'FPT', side: 'sell' as const, type: 'LO', quantity: 200, price: 92500, status: 'pending', time: '10:22:15' },
  { id: '3', symbol: 'VIC', side: 'buy' as const, type: 'MP', quantity: 1000, price: 42300, status: 'filled', time: '11:05:48' },
  { id: '4', symbol: 'HPG', side: 'buy' as const, type: 'ATO', quantity: 300, price: 25700, status: 'cancelled', time: '09:00:00' },
]

// Mock order book data
const generateOrderBook = (basePrice: number) => {
  const bids = []
  const asks = []
  const step = 100

  for (let i = 0; i < 10; i++) {
    bids.push({
      price: basePrice - step * (i + 1),
      volume: Math.floor(50000 + Math.random() * 200000),
      orders: Math.floor(5 + Math.random() * 30),
    })
    asks.push({
      price: basePrice + step * (i + 1),
      volume: Math.floor(50000 + Math.random() * 200000),
      orders: Math.floor(5 + Math.random() * 30),
    })
  }

  return { bids, asks }
}

export function TradingPage() {
  const [searchParams] = useSearchParams()
  const initialSymbol = searchParams.get('symbol') || ''
  const initialSide = (searchParams.get('side') as 'buy' | 'sell') || 'buy'

  const [pendingOrder, setPendingOrder] = useState<OrderData | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedStock] = useState({ symbol: 'VNM', price: 85200 })

  const chartData = useMemo(() => generateOHLCData(180, selectedStock.price), [selectedStock])
  const orderBook = useMemo(() => generateOrderBook(selectedStock.price), [selectedStock.price])

  const handleOrderSubmit = (order: OrderData) => {
    setPendingOrder(order)
    setShowConfirmation(true)
  }

  const handleOrderConfirm = () => {
    toast.success(`Đã đặt lệnh ${pendingOrder?.side === 'buy' ? 'mua' : 'bán'} ${pendingOrder?.symbol}`)
    setShowConfirmation(false)
    setPendingOrder(null)
  }

  const handleOrderCancel = () => {
    setShowConfirmation(false)
    setPendingOrder(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded bg-[var(--color-positive)]/10 text-[var(--color-positive)]">
            <CheckCircle className="h-3 w-3 mr-1" />Khớp
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
            <Clock className="h-3 w-3 mr-1" />Chờ
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded bg-[var(--color-negative)]/10 text-[var(--color-negative)]">
            <XCircle className="h-3 w-3 mr-1" />Hủy
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border border-[var(--color-border)] text-[var(--color-text-muted)]">
            {status}
          </span>
        )
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Form - Left Sidebar */}
        <div className="lg:col-span-3">
          <OrderForm
            initialSymbol={initialSymbol}
            initialSide={initialSide}
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6 space-y-6">
          {/* Chart */}
          <div className="rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  Biểu đồ {selectedStock.symbol}
                </h3>
                <span className="px-2 py-0.5 text-[12px] font-mono font-bold rounded border border-[var(--color-border)] text-[var(--color-text-primary)]">
                  {selectedStock.price.toLocaleString()} đ
                </span>
              </div>
            </div>
            <div className="p-4">
              <CandlestickChart data={chartData} height={350} />
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  <History className="h-4 w-4 text-[var(--color-text-muted)]" />
                  Lệnh gần đây
                </h3>
                <Link to="/trading/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                  >
                    Xem tất cả
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {mockRecentOrders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded',
                        order.side === 'buy'
                          ? 'bg-[var(--color-positive)] text-white'
                          : 'bg-[var(--color-negative)] text-white'
                      )}
                    >
                      {order.side === 'buy' ? 'M' : 'B'}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                        {order.symbol}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--color-text-muted)]">
                        {order.quantity.toLocaleString()} @ {order.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{order.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Book - Right Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                Sổ lệnh
              </h3>
            </div>
            <div className="p-4">
              <OrderBook
                bids={orderBook.bids}
                asks={orderBook.asks}
                lastPrice={selectedStock.price}
                showHeader={false}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                Thống kê hôm nay
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-[12px] text-[var(--color-text-muted)]">Tổng lệnh</span>
                <span className="text-[12px] font-mono font-medium text-[var(--color-text-primary)]">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-[var(--color-text-muted)]">Đã khớp</span>
                <span className="text-[12px] font-mono font-medium text-[var(--color-positive)]">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-[var(--color-text-muted)]">Chờ khớp</span>
                <span className="text-[12px] font-mono font-medium text-[var(--color-warning)]">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-[var(--color-text-muted)]">Đã hủy</span>
                <span className="text-[12px] font-mono font-medium text-[var(--color-negative)]">1</span>
              </div>
              <div className="pt-3 border-t border-[var(--color-border)]">
                <div className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-text-muted)]">Tổng GTGD</span>
                  <span className="text-[12px] font-mono font-medium text-[var(--color-text-primary)]">245.6M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={pendingOrder}
        isOpen={showConfirmation}
        onConfirm={handleOrderConfirm}
        onCancel={handleOrderCancel}
      />
    </>
  )
}
