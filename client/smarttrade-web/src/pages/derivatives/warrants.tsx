import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Search,
  Clock,
  AlertTriangle,
  Info,
  ShoppingCart,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock CW Data
const mockWarrants = [
  {
    symbol: 'CVNM2401',
    underlying: 'VNM',
    issuer: 'SSI',
    type: 'call',
    strikePrice: 80000,
    lastPrice: 2850,
    change: 150,
    changePercent: 5.56,
    volume: 125000,
    expiry: '2025-03-20',
    iv: 32.5,
    delta: 0.65,
    theta: -0.025,
    intrinsicValue: 5200,
    timeValue: 850,
    ratio: '1:1',
    breakeven: 82850,
    underlyingPrice: 85200,
  },
  {
    symbol: 'CFPT2402',
    underlying: 'FPT',
    issuer: 'VND',
    type: 'call',
    strikePrice: 88000,
    lastPrice: 3200,
    change: -80,
    changePercent: -2.44,
    volume: 85000,
    expiry: '2025-04-17',
    iv: 28.3,
    delta: 0.58,
    theta: -0.018,
    intrinsicValue: 4100,
    timeValue: 1200,
    ratio: '1:1',
    breakeven: 91200,
    underlyingPrice: 92100,
  },
  {
    symbol: 'CVIC2403',
    underlying: 'VIC',
    issuer: 'HSC',
    type: 'call',
    strikePrice: 40000,
    lastPrice: 1850,
    change: 280,
    changePercent: 17.83,
    volume: 250000,
    expiry: '2025-02-20',
    iv: 45.2,
    delta: 0.72,
    theta: -0.042,
    intrinsicValue: 2500,
    timeValue: 650,
    ratio: '1:1',
    breakeven: 41850,
    underlyingPrice: 42500,
  },
  {
    symbol: 'PHPG2401',
    underlying: 'HPG',
    issuer: 'MBS',
    type: 'put',
    strikePrice: 28000,
    lastPrice: 1200,
    change: -150,
    changePercent: -11.11,
    volume: 45000,
    expiry: '2025-03-20',
    iv: 38.7,
    delta: -0.35,
    theta: -0.032,
    intrinsicValue: 2200,
    timeValue: 200,
    ratio: '1:1',
    breakeven: 26800,
    underlyingPrice: 25800,
  },
  {
    symbol: 'CMWG2402',
    underlying: 'MWG',
    issuer: 'SSI',
    type: 'call',
    strikePrice: 48000,
    lastPrice: 2100,
    change: -320,
    changePercent: -13.22,
    volume: 68000,
    expiry: '2025-04-17',
    iv: 52.1,
    delta: 0.62,
    theta: -0.028,
    intrinsicValue: 4000,
    timeValue: 900,
    ratio: '1:1',
    breakeven: 50100,
    underlyingPrice: 52000,
  },
  {
    symbol: 'CVPB2403',
    underlying: 'VPB',
    issuer: 'VND',
    type: 'call',
    strikePrice: 18000,
    lastPrice: 980,
    change: 120,
    changePercent: 13.95,
    volume: 92000,
    expiry: '2025-05-15',
    iv: 35.8,
    delta: 0.68,
    theta: -0.015,
    intrinsicValue: 1800,
    timeValue: 380,
    ratio: '1:1',
    breakeven: 18980,
    underlyingPrice: 19800,
  },
]

const issuers = ['Tất cả', 'SSI', 'VND', 'HSC', 'MBS', 'VCSC']
const underlyings = ['Tất cả', 'VNM', 'FPT', 'VIC', 'HPG', 'MWG', 'VPB', 'TCB']
const types = ['Tất cả', 'Call', 'Put']

export function WarrantsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIssuer, setSelectedIssuer] = useState('Tất cả')
  const [selectedUnderlying, setSelectedUnderlying] = useState('Tất cả')
  const [selectedType, setSelectedType] = useState('Tất cả')
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'expiry'>('volume')
  const [selectedWarrant, setSelectedWarrant] = useState(mockWarrants[0])

  const filteredWarrants = mockWarrants
    .filter((w) => {
      if (searchTerm && !w.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (selectedIssuer !== 'Tất cả' && w.issuer !== selectedIssuer) {
        return false
      }
      if (selectedUnderlying !== 'Tất cả' && w.underlying !== selectedUnderlying) {
        return false
      }
      if (selectedType !== 'Tất cả' && w.type !== selectedType.toLowerCase()) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'volume') return b.volume - a.volume
      if (sortBy === 'change') return b.changePercent - a.changePercent
      if (sortBy === 'expiry') return new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
      return 0
    })

  const getDaysToExpiry = (expiry: string) => {
    const days = Math.ceil(
      (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const getExpiryColor = (days: number) => {
    if (days <= 14) return 'text-danger'
    if (days <= 30) return 'text-warning'
    return 'text-foreground-muted'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chứng quyền có bảo đảm</h1>
          <p className="text-sm text-foreground-muted">
            Covered Warrants (CW) trên HOSE
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Tìm mã CW..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedUnderlying} onValueChange={setSelectedUnderlying}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="CP cơ sở" />
              </SelectTrigger>
              <SelectContent>
                {underlyings.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedIssuer} onValueChange={setSelectedIssuer}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="TCPH" />
              </SelectTrigger>
              <SelectContent>
                {issuers.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[130px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Khối lượng</SelectItem>
                <SelectItem value="change">% Thay đổi</SelectItem>
                <SelectItem value="expiry">Đáo hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warrants List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Danh sách CW ({filteredWarrants.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredWarrants.map((warrant) => (
                  <div
                    key={warrant.symbol}
                    onClick={() => setSelectedWarrant(warrant)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedWarrant.symbol === warrant.symbol
                        ? 'border-brand bg-brand/5'
                        : 'border-border hover:border-brand/50 hover:bg-surface-2'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-mono',
                            warrant.type === 'call'
                              ? 'text-success border-success'
                              : 'text-danger border-danger'
                          )}
                        >
                          {warrant.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{warrant.symbol}</span>
                        <Badge variant="secondary" className="text-xs">
                          {warrant.underlying}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">
                          {warrant.lastPrice.toLocaleString()}
                        </p>
                        <p
                          className={cn(
                            'text-xs font-mono',
                            warrant.changePercent >= 0 ? 'text-success' : 'text-danger'
                          )}
                        >
                          {warrant.changePercent >= 0 ? '+' : ''}
                          {warrant.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-foreground-muted">Delta</p>
                        <p className="font-mono">{warrant.delta.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-foreground-muted">IV</p>
                        <p className="font-mono">{warrant.iv.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-foreground-muted">KL</p>
                        <p className="font-mono">{(warrant.volume / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className={cn('text-foreground-muted', getExpiryColor(getDaysToExpiry(warrant.expiry)))}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getDaysToExpiry(warrant.expiry)}d
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warrant Details */}
        <div className="space-y-4">
          {/* Selected Warrant Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      selectedWarrant.type === 'call' ? 'bg-success' : 'bg-danger'
                    )}
                  >
                    {selectedWarrant.type === 'call' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {selectedWarrant.type.toUpperCase()}
                  </Badge>
                  <CardTitle className="text-lg">{selectedWarrant.symbol}</CardTitle>
                </div>
                <Badge variant="outline">{selectedWarrant.issuer}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold font-mono">
                    {selectedWarrant.lastPrice.toLocaleString()}
                  </p>
                  <p
                    className={cn(
                      'text-sm font-mono',
                      selectedWarrant.changePercent >= 0 ? 'text-success' : 'text-danger'
                    )}
                  >
                    {selectedWarrant.changePercent >= 0 ? '+' : ''}
                    {selectedWarrant.change.toLocaleString()} (
                    {selectedWarrant.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <Link to={`/market/${selectedWarrant.underlying}`}>
                  <Button variant="outline" size="sm">
                    {selectedWarrant.underlying}: {selectedWarrant.underlyingPrice.toLocaleString()}
                  </Button>
                </Link>
              </div>

              {/* Expiry Countdown */}
              <div className="p-3 bg-surface-2 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-muted">Thời gian còn lại</span>
                  <span className={cn('text-sm font-medium', getExpiryColor(getDaysToExpiry(selectedWarrant.expiry)))}>
                    {getDaysToExpiry(selectedWarrant.expiry)} ngày
                  </span>
                </div>
                <Progress
                  value={Math.max(0, 100 - (getDaysToExpiry(selectedWarrant.expiry) / 90) * 100)}
                  className="h-2"
                />
                <p className="text-xs text-foreground-muted mt-1">
                  Đáo hạn: {new Date(selectedWarrant.expiry).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Greeks */}
              <div>
                <p className="text-sm font-medium mb-2">Greeks</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-surface-2 rounded-lg text-center">
                    <p className="text-xs text-foreground-muted">Delta</p>
                    <p className="font-mono font-bold">{selectedWarrant.delta.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-surface-2 rounded-lg text-center">
                    <p className="text-xs text-foreground-muted">Theta</p>
                    <p className="font-mono font-bold text-danger">
                      {selectedWarrant.theta.toFixed(3)}
                    </p>
                  </div>
                  <div className="p-2 bg-surface-2 rounded-lg text-center">
                    <p className="text-xs text-foreground-muted">IV</p>
                    <p className="font-mono font-bold">{selectedWarrant.iv.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Value Breakdown */}
              <div>
                <p className="text-sm font-medium mb-2">Giá trị CW</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Giá thực hiện</span>
                    <span className="font-mono">{selectedWarrant.strikePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Giá trị nội tại</span>
                    <span className="font-mono text-success">
                      {selectedWarrant.intrinsicValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Giá trị thời gian</span>
                    <span className="font-mono text-warning">
                      {selectedWarrant.timeValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Hòa vốn</span>
                    <span className="font-mono">{selectedWarrant.breakeven.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Quick Trade */}
              <Button
                className={cn(
                  'w-full',
                  selectedWarrant.type === 'call'
                    ? 'bg-success hover:bg-success/90'
                    : 'bg-danger hover:bg-danger/90'
                )}
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Mua {selectedWarrant.symbol}
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                <CardTitle className="text-sm">AI Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-success/5 text-xs text-success">
                <TrendingUp className="h-3 w-3 shrink-0 mt-0.5" />
                <span>Delta cao ({selectedWarrant.delta.toFixed(2)}), phù hợp trading ngắn hạn</span>
              </div>
              {getDaysToExpiry(selectedWarrant.expiry) <= 30 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-warning/5 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>Gần đáo hạn, time decay tăng nhanh</span>
                </div>
              )}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-2 text-xs text-foreground-muted">
                <Info className="h-3 w-3 shrink-0 mt-0.5" />
                <span>IV {selectedWarrant.iv.toFixed(1)}% - {selectedWarrant.iv > 40 ? 'Cao' : selectedWarrant.iv > 25 ? 'Trung bình' : 'Thấp'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Risk Warning */}
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="text-xs text-warning">
                  <p className="font-medium mb-1">Cảnh báo rủi ro</p>
                  <p>
                    CW có thể mất toàn bộ giá trị khi đáo hạn nếu giá CP cơ sở
                    không thuận lợi. Hãy cân nhắc kỹ trước khi giao dịch.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
