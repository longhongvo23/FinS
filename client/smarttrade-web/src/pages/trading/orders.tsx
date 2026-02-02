import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Search,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Order {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  type: string
  quantity: number
  filledQuantity: number
  price: number
  matchedPrice?: number
  stopPrice?: number
  status: 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected'
  createdAt: string
  updatedAt: string
  fee?: number
}

// Mock orders data
const mockOrders: Order[] = [
  { id: 'ORD001', symbol: 'VNM', side: 'buy', type: 'LO', quantity: 500, filledQuantity: 500, price: 85200, matchedPrice: 85200, status: 'filled', createdAt: '2024-12-24 09:15:32', updatedAt: '2024-12-24 09:15:45', fee: 63900 },
  { id: 'ORD002', symbol: 'FPT', side: 'sell', type: 'LO', quantity: 200, filledQuantity: 0, price: 92500, status: 'pending', createdAt: '2024-12-24 10:22:15', updatedAt: '2024-12-24 10:22:15' },
  { id: 'ORD003', symbol: 'VIC', side: 'buy', type: 'MP', quantity: 1000, filledQuantity: 1000, price: 42300, matchedPrice: 42350, status: 'filled', createdAt: '2024-12-24 11:05:48', updatedAt: '2024-12-24 11:05:52', fee: 63525 },
  { id: 'ORD004', symbol: 'HPG', side: 'buy', type: 'ATO', quantity: 300, filledQuantity: 0, price: 25700, status: 'cancelled', createdAt: '2024-12-24 09:00:00', updatedAt: '2024-12-24 09:15:00' },
  { id: 'ORD005', symbol: 'TCB', side: 'sell', type: 'LO', quantity: 1000, filledQuantity: 500, price: 32100, matchedPrice: 32100, status: 'partial', createdAt: '2024-12-24 14:30:00', updatedAt: '2024-12-24 14:32:15', fee: 24075 },
  { id: 'ORD006', symbol: 'VCB', side: 'buy', type: 'LO', quantity: 200, filledQuantity: 200, price: 98500, matchedPrice: 98400, status: 'filled', createdAt: '2024-12-23 10:15:22', updatedAt: '2024-12-23 10:15:35', fee: 29520 },
  { id: 'ORD007', symbol: 'MBB', side: 'sell', type: 'LO', quantity: 500, filledQuantity: 0, price: 25300, status: 'rejected', createdAt: '2024-12-23 09:05:00', updatedAt: '2024-12-23 09:05:01' },
  { id: 'ORD008', symbol: 'SSI', side: 'buy', type: 'STOP', quantity: 1000, filledQuantity: 0, price: 33000, stopPrice: 32000, status: 'pending', createdAt: '2024-12-22 11:30:00', updatedAt: '2024-12-22 11:30:00' },
]

export function OrdersPage() {
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [sideFilter, setSideFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const pendingOrders = useMemo(() => {
    return mockOrders.filter((o) => o.status === 'pending' || o.status === 'partial')
  }, [])

  const historyOrders = useMemo(() => {
    let orders = mockOrders.filter((o) => o.status !== 'pending' && o.status !== 'partial')

    if (searchQuery) {
      orders = orders.filter((o) =>
        o.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (sideFilter !== 'all') {
      orders = orders.filter((o) => o.side === sideFilter)
    }

    return orders
  }, [searchQuery, sideFilter])

  const handleCancelOrder = (orderId: string) => {
    toast.success(`Đã hủy lệnh ${orderId}`)
  }

  const handleModifyOrder = (orderId: string) => {
    toast.info(`Sửa lệnh ${orderId} - Tính năng đang phát triển`)
  }

  const exportToCSV = () => {
    const headers = ['Mã lệnh', 'Mã CK', 'Loại', 'M/B', 'KL đặt', 'KL khớp', 'Giá đặt', 'Giá khớp', 'Trạng thái', 'Thời gian']
    const rows = historyOrders.map((o) => [
      o.id,
      o.symbol,
      o.type,
      o.side === 'buy' ? 'Mua' : 'Bán',
      o.quantity,
      o.filledQuantity,
      o.price,
      o.matchedPrice || '',
      o.status,
      o.createdAt,
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast.success('Đã xuất file CSV')
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'filled':
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Đã khớp</Badge>
      case 'partial':
        return <Badge className="bg-warning"><Clock className="h-3 w-3 mr-1" />Khớp một phần</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Chờ khớp</Badge>
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Đã hủy</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const OrderRow = ({ order, showActions = false }: { order: Order; showActions?: boolean }) => {
    const isExpanded = expandedOrder === order.id
    const orderValue = order.quantity * order.price
    const filledValue = order.filledQuantity * (order.matchedPrice || order.price)

    return (
      <>
        <div
          className={cn(
            'flex items-center justify-between p-4 bg-surface-2 rounded-lg cursor-pointer hover:bg-surface-2/80 transition-colors',
            isExpanded && 'rounded-b-none'
          )}
          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
        >
          <div className="flex items-center gap-4">
            <Badge
              className={cn(
                'text-xs w-8 justify-center',
                order.side === 'buy' ? 'bg-success' : 'bg-danger'
              )}
            >
              {order.side === 'buy' ? 'M' : 'B'}
            </Badge>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{order.symbol}</span>
                <Badge variant="outline" className="text-xs">{order.type}</Badge>
              </div>
              <p className="text-xs text-foreground-muted">
                {order.quantity.toLocaleString()} @ {order.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              {getStatusBadge(order.status)}
              <p className="text-xs text-foreground-muted mt-1">
                {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
              </p>
            </div>
            {showActions && order.status === 'pending' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModifyOrder(order.id)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-danger hover:text-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelOrder(order.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-foreground-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground-muted" />
            )}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="p-4 bg-surface-2/50 rounded-b-lg border-t border-border space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-foreground-muted">Mã lệnh</p>
                <p className="font-mono">{order.id}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Giá trị lệnh</p>
                <p className="font-mono">{orderValue.toLocaleString()} đ</p>
              </div>
              <div>
                <p className="text-foreground-muted">KL đã khớp</p>
                <p className="font-mono">
                  {order.filledQuantity.toLocaleString()} / {order.quantity.toLocaleString()}
                </p>
              </div>
              {order.matchedPrice && (
                <div>
                  <p className="text-foreground-muted">Giá khớp TB</p>
                  <p className="font-mono">{order.matchedPrice.toLocaleString()} đ</p>
                </div>
              )}
              {order.stopPrice && (
                <div>
                  <p className="text-foreground-muted">Giá kích hoạt</p>
                  <p className="font-mono">{order.stopPrice.toLocaleString()} đ</p>
                </div>
              )}
              {order.fee && (
                <div>
                  <p className="text-foreground-muted">Phí GD</p>
                  <p className="font-mono">{order.fee.toLocaleString()} đ</p>
                </div>
              )}
              <div>
                <p className="text-foreground-muted">Thời gian đặt</p>
                <p className="font-mono text-xs">{order.createdAt}</p>
              </div>
              <div>
                <p className="text-foreground-muted">Cập nhật</p>
                <p className="font-mono text-xs">{order.updatedAt}</p>
              </div>
            </div>

            {order.status === 'filled' && (
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-muted">
                    {order.side === 'buy' ? 'Tổng tiền mua' : 'Tiền nhận về'}
                  </span>
                  <span className={cn(
                    'font-mono font-bold',
                    order.side === 'buy' ? 'text-danger' : 'text-success'
                  )}>
                    {(filledValue + (order.side === 'buy' ? (order.fee || 0) : -(order.fee || 0))).toLocaleString()} đ
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/trading">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Quản lý lệnh</h1>
            <p className="text-sm text-foreground-muted">
              Theo dõi và quản lý các lệnh giao dịch
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Lệnh chờ
            {pendingOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Calendar className="h-4 w-4" />
            Lịch sử lệnh
          </TabsTrigger>
        </TabsList>

        {/* Pending Orders */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lệnh đang chờ khớp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-foreground-muted">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Không có lệnh nào đang chờ</p>
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <OrderRow key={order.id} order={order} showActions />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order History */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-base">Lịch sử giao dịch</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    <Input
                      placeholder="Tìm mã CK..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={sideFilter} onValueChange={setSideFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Loại lệnh" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="buy">Mua</SelectItem>
                      <SelectItem value="sell">Bán</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Xuất CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {historyOrders.length === 0 ? (
                <div className="text-center py-8 text-foreground-muted">
                  <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Không tìm thấy lệnh nào</p>
                </div>
              ) : (
                historyOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
