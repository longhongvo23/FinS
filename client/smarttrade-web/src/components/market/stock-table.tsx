import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  value: number
  exchange: string
  high: number
  low: number
  open: number
  foreignBuy: number
  foreignSell: number
}

interface StockTableProps {
  stocks: StockData[]
  pageSize?: number
  onAddToWatchlist?: (symbol: string) => void
  watchlist?: string[]
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'value'
type SortDirection = 'asc' | 'desc' | null

export function StockTable({
  stocks,
  pageSize = 20,
  onAddToWatchlist,
  watchlist = [],
}: StockTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const sortedStocks = useMemo(() => {
    if (!sortField || !sortDirection) return stocks

    return [...stocks].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : 1
      }
      return aVal > bVal ? -1 : 1
    })
  }, [stocks, sortField, sortDirection])

  const totalPages = Math.ceil(sortedStocks.length / pageSize)
  const paginatedStocks = sortedStocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 ml-1" />
    if (sortDirection === 'asc') return <ChevronUp className="h-3 w-3 ml-1" />
    return <ChevronDown className="h-3 w-3 ml-1" />
  }

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`
    return vol.toString()
  }

  const formatValue = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`
    return val.toLocaleString()
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-sm text-foreground-muted">
              <th className="pb-3 pr-2 w-8"></th>
              <th
                className="pb-3 font-medium cursor-pointer hover:text-foreground"
                onClick={() => handleSort('symbol')}
              >
                <span className="flex items-center">
                  Mã CK
                  <SortIcon field="symbol" />
                </span>
              </th>
              <th
                className="pb-3 font-medium cursor-pointer hover:text-foreground text-right"
                onClick={() => handleSort('price')}
              >
                <span className="flex items-center justify-end">
                  Giá
                  <SortIcon field="price" />
                </span>
              </th>
              <th
                className="pb-3 font-medium cursor-pointer hover:text-foreground text-right"
                onClick={() => handleSort('changePercent')}
              >
                <span className="flex items-center justify-end">
                  +/-
                  <SortIcon field="changePercent" />
                </span>
              </th>
              <th
                className="pb-3 font-medium cursor-pointer hover:text-foreground text-right hidden md:table-cell"
                onClick={() => handleSort('volume')}
              >
                <span className="flex items-center justify-end">
                  KL
                  <SortIcon field="volume" />
                </span>
              </th>
              <th
                className="pb-3 font-medium cursor-pointer hover:text-foreground text-right hidden lg:table-cell"
                onClick={() => handleSort('value')}
              >
                <span className="flex items-center justify-end">
                  Giá trị
                  <SortIcon field="value" />
                </span>
              </th>
              <th className="pb-3 font-medium text-center hidden lg:table-cell">
                Cao/Thấp
              </th>
              <th className="pb-3 font-medium hidden md:table-cell">Sàn</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStocks.map((stock) => (
              <tr
                key={stock.symbol}
                className="border-b border-border/50 hover:bg-surface-2 transition-colors"
              >
                <td className="py-3 pr-2">
                  <button
                    onClick={() => onAddToWatchlist?.(stock.symbol)}
                    className="p-1 hover:bg-surface-3 rounded transition-colors"
                  >
                    <Star
                      className={cn(
                        'h-4 w-4',
                        watchlist.includes(stock.symbol)
                          ? 'fill-warning text-warning'
                          : 'text-foreground-muted'
                      )}
                    />
                  </button>
                </td>
                <td className="py-3">
                  <Link to={`/stock/${stock.symbol}`} className="block">
                    <p className="font-medium hover:text-brand transition-colors">
                      {stock.symbol}
                    </p>
                    <p className="text-xs text-foreground-muted truncate max-w-[120px]">
                      {stock.name}
                    </p>
                  </Link>
                </td>
                <td className="py-3 text-right">
                  <p
                    className={cn(
                      'font-mono font-semibold',
                      stock.changePercent > 0 && 'text-success',
                      stock.changePercent < 0 && 'text-danger',
                      stock.changePercent === 0 && 'text-warning'
                    )}
                  >
                    {stock.price.toLocaleString('vi-VN')}
                  </p>
                </td>
                <td className="py-3 text-right">
                  <div className="flex flex-col items-end">
                    <Badge
                      variant={
                        stock.changePercent >= 0
                          ? stock.changePercent === 0
                            ? 'secondary'
                            : 'default'
                          : 'destructive'
                      }
                      className={cn(
                        'font-mono text-xs',
                        stock.changePercent > 0 && 'bg-success hover:bg-success/80',
                        stock.changePercent === 0 && 'bg-warning hover:bg-warning/80'
                      )}
                    >
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </Badge>
                    <span
                      className={cn(
                        'text-xs font-mono mt-0.5',
                        stock.change >= 0 ? 'text-success' : 'text-danger'
                      )}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right hidden md:table-cell">
                  <div className="flex items-center justify-end gap-1 text-foreground-muted">
                    <Activity className="h-3 w-3" />
                    <span className="font-mono text-sm">
                      {formatVolume(stock.volume)}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right hidden lg:table-cell">
                  <span className="font-mono text-sm text-foreground-muted">
                    {formatValue(stock.value)}
                  </span>
                </td>
                <td className="py-3 hidden lg:table-cell">
                  <div className="flex items-center justify-center gap-2 text-xs font-mono">
                    <span className="text-success">{stock.high.toLocaleString()}</span>
                    <span className="text-foreground-muted">/</span>
                    <span className="text-danger">{stock.low.toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-3 hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">
                    {stock.exchange}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground-muted">
            Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, sortedStocks.length)} / {sortedStocks.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
