import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ChevronDown,
  ChevronUp,
  Search,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/formatters'

export interface Holding {
  symbol: string
  name: string
  quantity: number
  availableQuantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  costBasis: number
  unrealizedPL: number
  unrealizedPLPercent: number
  weight: number
  dayChange: number
  dayChangePercent: number
}

interface HoldingsTableProps {
  holdings: Holding[]
  totalValue: number
}

type SortField = 'symbol' | 'marketValue' | 'unrealizedPL' | 'unrealizedPLPercent' | 'weight' | 'dayChangePercent'
type SortDirection = 'asc' | 'desc'

export function HoldingsTable({ holdings, totalValue }: HoldingsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('marketValue')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleExpand = (symbol: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol)
    } else {
      newExpanded.add(symbol)
    }
    setExpandedRows(newExpanded)
  }

  const filteredAndSortedHoldings = holdings
    .filter(
      (h) =>
        h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1
      if (sortField === 'symbol') {
        return multiplier * a.symbol.localeCompare(b.symbol)
      }
      return multiplier * (a[sortField] - b[sortField])
    })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    )
  }

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
  }) => (
    <th
      className={cn(
        'pb-3 font-medium cursor-pointer hover:text-foreground transition-colors select-none',
        className
      )}
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </th>
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Danh mục cổ phiếu
            <Badge variant="secondary" className="ml-2">
              {holdings.length} mã
            </Badge>
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Tìm mã CK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-foreground-muted">
                <SortableHeader field="symbol">Mã CK</SortableHeader>
                <th className="pb-3 font-medium text-right">SL</th>
                <th className="pb-3 font-medium text-right">Giá TB</th>
                <th className="pb-3 font-medium text-right">Giá TT</th>
                <SortableHeader field="marketValue" className="text-right justify-end">
                  Giá trị
                </SortableHeader>
                <SortableHeader field="unrealizedPLPercent" className="text-right justify-end">
                  Lãi/Lỗ
                </SortableHeader>
                <SortableHeader field="weight" className="text-right justify-end">
                  Tỷ trọng
                </SortableHeader>
                <SortableHeader field="dayChangePercent" className="text-right justify-end">
                  Hôm nay
                </SortableHeader>
                <th className="pb-3 font-medium text-center w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedHoldings.map((holding) => (
                <>
                  <tr
                    key={holding.symbol}
                    className={cn(
                      'border-b border-border hover:bg-surface-2 cursor-pointer transition-colors',
                      expandedRows.has(holding.symbol) && 'bg-surface-2'
                    )}
                    onClick={() => toggleExpand(holding.symbol)}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-1 h-8 rounded-full',
                            holding.unrealizedPL >= 0 ? 'bg-success' : 'bg-danger'
                          )}
                        />
                        <div>
                          <p className="font-semibold">{holding.symbol}</p>
                          <p className="text-xs text-foreground-muted line-clamp-1">
                            {holding.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono">
                      <div>
                        <p>{holding.quantity.toLocaleString()}</p>
                        {holding.availableQuantity < holding.quantity && (
                          <p className="text-xs text-warning">
                            KD: {holding.availableQuantity.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-sm">
                      {holding.avgCost.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        'py-3 text-right font-mono font-semibold',
                        holding.dayChangePercent > 0 && 'text-success',
                        holding.dayChangePercent < 0 && 'text-danger'
                      )}
                    >
                      {holding.currentPrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono">
                      {formatCurrency(holding.marketValue)}
                    </td>
                    <td className="py-3 text-right">
                      <div
                        className={cn(
                          'flex flex-col items-end',
                          holding.unrealizedPL >= 0 ? 'text-success' : 'text-danger'
                        )}
                      >
                        <div className="flex items-center gap-1 font-mono font-semibold">
                          {holding.unrealizedPL >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {formatCurrency(Math.abs(holding.unrealizedPL))}
                        </div>
                        <span className="text-xs font-mono">
                          {holding.unrealizedPLPercent >= 0 ? '+' : ''}
                          {formatPercent(holding.unrealizedPLPercent)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full"
                            style={{ width: `${Math.min(holding.weight, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm w-12 text-right">
                          {holding.weight.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div
                        className={cn(
                          'flex items-center justify-end gap-1 font-mono text-sm',
                          holding.dayChangePercent > 0 && 'text-success',
                          holding.dayChangePercent < 0 && 'text-danger',
                          holding.dayChangePercent === 0 && 'text-reference'
                        )}
                      >
                        {holding.dayChangePercent > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : holding.dayChangePercent < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {holding.dayChangePercent >= 0 ? '+' : ''}
                        {formatPercent(holding.dayChangePercent)}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  {/* Expanded Row */}
                  {expandedRows.has(holding.symbol) && (
                    <tr key={`${holding.symbol}-expanded`} className="bg-surface-2">
                      <td colSpan={9} className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-foreground-muted mb-1">Giá vốn</p>
                            <p className="font-mono font-medium">
                              {formatCurrency(holding.costBasis)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground-muted mb-1">Giá trị hiện tại</p>
                            <p className="font-mono font-medium">
                              {formatCurrency(holding.marketValue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground-muted mb-1">Thay đổi hôm nay</p>
                            <p
                              className={cn(
                                'font-mono font-medium',
                                holding.dayChange >= 0 ? 'text-success' : 'text-danger'
                              )}
                            >
                              {holding.dayChange >= 0 ? '+' : ''}
                              {formatCurrency(holding.dayChange)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-foreground-muted mb-1">KL khả dụng</p>
                            <p className="font-mono font-medium">
                              {holding.availableQuantity.toLocaleString()} CP
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link to={`/trading?symbol=${holding.symbol}&side=buy`}>
                            <Button size="sm" className="bg-success hover:bg-success/90">
                              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                              Mua thêm
                            </Button>
                          </Link>
                          <Link to={`/trading?symbol=${holding.symbol}&side=sell`}>
                            <Button size="sm" variant="destructive">
                              <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                              Bán
                            </Button>
                          </Link>
                          <Link to={`/market/${holding.symbol}`}>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Chi tiết
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filteredAndSortedHoldings.length === 0 && (
            <div className="text-center py-8 text-foreground-muted">
              {searchTerm ? 'Không tìm thấy mã CK' : 'Chưa có cổ phiếu trong danh mục'}
            </div>
          )}
        </div>

        {/* Total Row */}
        {filteredAndSortedHoldings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-medium">Tổng giá trị danh mục</span>
            <span className="text-xl font-bold font-mono">{formatCurrency(totalValue)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
