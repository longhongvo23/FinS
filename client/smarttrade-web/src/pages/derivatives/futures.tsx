import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calculator,
  AlertTriangle,
  Info,
  Sparkles,
  Clock,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CandlestickChart, OHLCData } from '@/components/charts/candlestick-chart'

// Mock VN30F Contracts Data
const mockContracts = [
  {
    symbol: 'VN30F2501',
    name: 'VN30F Tháng 1/2025',
    lastPrice: 1298.5,
    change: 12.3,
    changePercent: 0.96,
    open: 1286.2,
    high: 1302.0,
    low: 1284.5,
    volume: 125430,
    openInterest: 45230,
    expiry: '2025-01-16',
    basis: -13.82,
    type: 'monthly',
  },
  {
    symbol: 'VN30F2502',
    name: 'VN30F Tháng 2/2025',
    lastPrice: 1295.0,
    change: 10.5,
    changePercent: 0.82,
    open: 1284.5,
    high: 1298.0,
    low: 1282.0,
    volume: 32150,
    openInterest: 12450,
    expiry: '2025-02-20',
    basis: -17.32,
    type: 'monthly',
  },
  {
    symbol: 'VN30F2503',
    name: 'VN30F Tháng 3/2025',
    lastPrice: 1292.5,
    change: 8.0,
    changePercent: 0.62,
    open: 1284.5,
    high: 1295.0,
    low: 1280.0,
    volume: 8520,
    openInterest: 5230,
    expiry: '2025-03-20',
    basis: -19.82,
    type: 'monthly',
  },
  {
    symbol: 'VN30F25Q1',
    name: 'VN30F Quý 1/2025',
    lastPrice: 1290.0,
    change: 5.5,
    changePercent: 0.43,
    open: 1284.5,
    high: 1292.0,
    low: 1278.0,
    volume: 2150,
    openInterest: 1850,
    expiry: '2025-03-27',
    basis: -22.32,
    type: 'quarterly',
  },
]

// Generate mock OHLC data
const generateFuturesOHLC = (basePrice: number): OHLCData[] => {
  const data: OHLCData[] = []
  let price = basePrice - 50
  const now = new Date()

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const volatility = 0.015
    const change = (Math.random() - 0.5) * 2 * volatility * price
    const open = price
    const close = price + change
    const high = Math.max(open, close) * (1 + Math.random() * 0.008)
    const low = Math.min(open, close) * (1 - Math.random() * 0.008)
    const volume = Math.floor(50000 + Math.random() * 100000)

    data.push({
      time: date.toISOString().slice(0, 10),
      open: Math.round(open * 10) / 10,
      high: Math.round(high * 10) / 10,
      low: Math.round(low * 10) / 10,
      close: Math.round(close * 10) / 10,
      volume,
    })

    price = close
  }

  return data
}

// Mock AI Insights for Futures
const mockFuturesInsights = [
  { type: 'bullish', text: 'VN30F đang trong xu hướng tăng ngắn hạn, target 1,310' },
  { type: 'warning', text: 'Open Interest tăng mạnh, có thể có biến động lớn' },
  { type: 'neutral', text: 'Basis đang thu hẹp, arbitrage opportunity giảm' },
]

export function FuturesPage() {
  const [selectedContract, setSelectedContract] = useState(mockContracts[0])
  const [orderType, setOrderType] = useState<'long' | 'short'>('long')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [leverage, setLeverage] = useState('10')

  const chartData = useMemo(
    () => generateFuturesOHLC(selectedContract.lastPrice),
    [selectedContract.symbol]
  )

  const calculateMargin = () => {
    const qty = parseInt(quantity) || 0
    const prc = parseFloat(price) || selectedContract.lastPrice
    const lev = parseInt(leverage) || 10
    const contractValue = qty * prc * 100000 // VN30F multiplier
    const margin = contractValue / lev
    return { contractValue, margin }
  }

  const { contractValue, margin } = calculateMargin()

  const getDaysToExpiry = (expiry: string) => {
    const days = Math.ceil(
      (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hợp đồng Tương lai</h1>
          <p className="text-sm text-foreground-muted">
            Giao dịch VN30 Index Futures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-brand border-brand">
            <Activity className="h-3 w-3 mr-1" />
            VN30 Index: 1,312.32
          </Badge>
        </div>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hợp đồng VN30F</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Mã HĐ</th>
                  <th className="text-right py-2 px-3 font-medium">Giá</th>
                  <th className="text-right py-2 px-3 font-medium">+/-</th>
                  <th className="text-right py-2 px-3 font-medium">KL</th>
                  <th className="text-right py-2 px-3 font-medium">OI</th>
                  <th className="text-right py-2 px-3 font-medium">Basis</th>
                  <th className="text-right py-2 px-3 font-medium">Đáo hạn</th>
                  <th className="text-center py-2 px-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {mockContracts.map((contract) => (
                  <tr
                    key={contract.symbol}
                    className={cn(
                      'border-b border-border/50 hover:bg-surface-2 cursor-pointer transition-colors',
                      selectedContract.symbol === contract.symbol && 'bg-brand/5'
                    )}
                    onClick={() => setSelectedContract(contract)}
                  >
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium">{contract.symbol}</p>
                        <p className="text-xs text-foreground-muted">
                          {contract.type === 'monthly' ? 'Tháng' : 'Quý'}
                        </p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3 font-mono font-medium">
                      {contract.lastPrice.toFixed(1)}
                    </td>
                    <td
                      className={cn(
                        'text-right py-3 px-3 font-mono',
                        contract.changePercent >= 0 ? 'text-success' : 'text-danger'
                      )}
                    >
                      {contract.changePercent >= 0 ? '+' : ''}
                      {contract.changePercent.toFixed(2)}%
                    </td>
                    <td className="text-right py-3 px-3 font-mono">
                      {contract.volume.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-3 font-mono">
                      {contract.openInterest.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        'text-right py-3 px-3 font-mono text-xs',
                        contract.basis < 0 ? 'text-danger' : 'text-success'
                      )}
                    >
                      {contract.basis.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3 text-foreground-muted" />
                        <span className="text-xs">
                          {getDaysToExpiry(contract.expiry)}d
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3">
                      <Button
                        size="sm"
                        variant={
                          selectedContract.symbol === contract.symbol
                            ? 'default'
                            : 'outline'
                        }
                        className="h-7 text-xs"
                      >
                        Chọn
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart & Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{selectedContract.symbol}</CardTitle>
                  <Badge
                    className={cn(
                      selectedContract.changePercent >= 0 ? 'bg-success' : 'bg-danger'
                    )}
                  >
                    {selectedContract.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {selectedContract.changePercent >= 0 ? '+' : ''}
                    {selectedContract.changePercent.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold font-mono">
                  {selectedContract.lastPrice.toFixed(1)}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <CandlestickChart data={chartData} height={350} />
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-foreground-muted">Mở cửa</p>
                  <p className="text-lg font-mono font-bold">
                    {selectedContract.open.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-foreground-muted">Cao nhất</p>
                  <p className="text-lg font-mono font-bold text-success">
                    {selectedContract.high.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-foreground-muted">Thấp nhất</p>
                  <p className="text-lg font-mono font-bold text-danger">
                    {selectedContract.low.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-foreground-muted">Open Interest</p>
                  <p className="text-lg font-mono font-bold">
                    {selectedContract.openInterest.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <CardTitle className="text-sm">AI Insights - {selectedContract.symbol}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockFuturesInsights.map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-lg text-xs',
                    insight.type === 'bullish' && 'bg-success/5 text-success',
                    insight.type === 'warning' && 'bg-warning/5 text-warning',
                    insight.type === 'neutral' && 'bg-surface-2 text-foreground-muted'
                  )}
                >
                  {insight.type === 'bullish' && <TrendingUp className="h-3 w-3 shrink-0 mt-0.5" />}
                  {insight.type === 'warning' && <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />}
                  {insight.type === 'neutral' && <Info className="h-3 w-3 shrink-0 mt-0.5" />}
                  <span>{insight.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Form & Margin Calculator */}
        <div className="space-y-4">
          {/* Order Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Đặt lệnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Long/Short Toggle */}
              <Tabs
                value={orderType}
                onValueChange={(v) => setOrderType(v as 'long' | 'short')}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="long"
                    className="data-[state=active]:bg-success data-[state=active]:text-white"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Long
                  </TabsTrigger>
                  <TabsTrigger
                    value="short"
                    className="data-[state=active]:bg-danger data-[state=active]:text-white"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Short
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Contract */}
              <div className="space-y-2">
                <Label>Hợp đồng</Label>
                <Select
                  value={selectedContract.symbol}
                  onValueChange={(v) =>
                    setSelectedContract(mockContracts.find((c) => c.symbol === v)!)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContracts.map((c) => (
                      <SelectItem key={c.symbol} value={c.symbol}>
                        {c.symbol} - {c.lastPrice.toFixed(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Số lượng (hợp đồng)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>Giá đặt</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={selectedContract.lastPrice.toFixed(1)}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* Leverage */}
              <div className="space-y-2">
                <Label>Đòn bẩy</Label>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                    <SelectItem value="15">15x</SelectItem>
                    <SelectItem value="20">20x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                className={cn(
                  'w-full',
                  orderType === 'long'
                    ? 'bg-success hover:bg-success/90'
                    : 'bg-danger hover:bg-danger/90'
                )}
                size="lg"
              >
                {orderType === 'long' ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Mở vị thế Long
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Mở vị thế Short
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Margin Calculator */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-foreground-muted" />
                <CardTitle className="text-base">Tính ký quỹ</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Giá trị HĐ</span>
                <span className="font-mono">
                  {contractValue.toLocaleString()}đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Đòn bẩy</span>
                <span className="font-mono">{leverage}x</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="font-medium">Ký quỹ yêu cầu</span>
                <span className="font-mono font-bold text-brand">
                  {margin.toLocaleString()}đ
                </span>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg">
                <p className="text-xs text-warning flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  Giao dịch phái sinh có rủi ro cao. Bạn có thể mất nhiều hơn số vốn đầu tư ban đầu.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Open Interest Chart */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-foreground-muted" />
                <CardTitle className="text-base">Open Interest</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockContracts.map((c) => (
                  <div key={c.symbol} className="flex items-center gap-2">
                    <span className="text-xs w-24 text-foreground-muted">
                      {c.symbol.slice(-4)}
                    </span>
                    <div className="flex-1 bg-surface-2 rounded-full h-2">
                      <div
                        className="bg-brand h-2 rounded-full"
                        style={{
                          width: `${(c.openInterest / mockContracts[0].openInterest) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono w-16 text-right">
                      {(c.openInterest / 1000).toFixed(1)}K
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
