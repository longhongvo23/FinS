import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  useScreenerStore,
  type SortField,
} from '@/stores/screener-store'
import { mockScreenerStocks } from '@/lib/mock-stocks-data'
import { ResultRow } from './result-row'
import { toast } from 'sonner'

const columns: { field: SortField; label: string; align?: 'left' | 'right' }[] = [
  { field: 'symbol', label: 'Mã CK', align: 'left' },
  { field: 'price', label: 'Giá', align: 'right' },
  { field: 'changePercent', label: '% Thay đổi', align: 'right' },
  { field: 'volume', label: 'KL', align: 'right' },
  { field: 'marketCap', label: 'Vốn hóa', align: 'right' },
  { field: 'pe', label: 'P/E', align: 'right' },
  { field: 'dividendYield', label: 'Cổ tức', align: 'right' },
]

export function ScreenerResults() {
  const {
    stocks,
    setStocks,
    getPaginatedStocks,
    getFilteredStocks,
    getTotalPages,
    currentPage,
    setCurrentPage,
    sortField,
    sortDirection,
    setSortField,
  } = useScreenerStore()

  // Load mock data on mount
  useEffect(() => {
    if (stocks.length === 0) {
      setStocks(mockScreenerStocks)
    }
  }, [stocks.length, setStocks])

  const paginatedStocks = getPaginatedStocks()
  const totalFiltered = getFilteredStocks().length
  const totalPages = getTotalPages()

  const handleSort = (field: SortField) => {
    setSortField(field)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleExportCSV = () => {
    const filtered = getFilteredStocks()
    if (filtered.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }

    const headers = [
      'Mã',
      'Tên',
      'Sàn',
      'Ngành',
      'Giá',
      'Thay đổi %',
      'Khối lượng',
      'Vốn hóa',
      'P/E',
      'P/B',
      'Cổ tức %',
      'RSI',
    ]

    const rows = filtered.map((stock) => [
      stock.symbol,
      stock.name,
      stock.exchange,
      stock.sector,
      stock.price,
      stock.changePercent,
      stock.volume,
      stock.marketCap,
      stock.pe ?? '',
      stock.pb ?? '',
      stock.dividendYield,
      stock.rsi,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' && cell.includes(',')
              ? `"${cell}"`
              : cell
          )
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `screener_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success(`Đã xuất ${filtered.length} cổ phiếu`)
  }

  const handleAddToWatchlist = (symbol: string) => {
    // In production: add to watchlist via API
    toast.success(`Đã thêm ${symbol} vào Watchlist`)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-[var(--color-text-muted)]" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-[var(--color-brand)]" />
    ) : (
      <ArrowDown className="h-3 w-3 text-[var(--color-brand)]" />
    )
  }

  if (stocks.length === 0) {
    return <ScreenerResultsSkeleton />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Hiển thị {paginatedStocks.length} / {totalFiltered} cổ phiếu
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={totalFiltered === 0}
          className="h-8 px-3 text-[11px] border-[var(--color-border)]"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Xuất CSV
        </Button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1fr_100px_100px_90px_100px_80px_80px_60px_40px] gap-3 px-4 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        {columns.map((col) => (
          <button
            key={col.field}
            onClick={() => handleSort(col.field)}
            className={cn(
              'flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide',
              'hover:text-[var(--color-text-primary)] transition-colors',
              col.align === 'right' && 'justify-end'
            )}
          >
            {col.label}
            {getSortIcon(col.field)}
          </button>
        ))}
        {/* Sparkline & Expand columns */}
        <div className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase text-center">
          30D
        </div>
        <div />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {paginatedStocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-[15px] font-medium text-[var(--color-text-primary)] mb-2">
              Không tìm thấy cổ phiếu
            </p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              Thử điều chỉnh các bộ lọc của bạn
            </p>
          </div>
        ) : (
          paginatedStocks.map((stock) => (
            <ResultRow
              key={stock.symbol}
              stock={stock}
              onAddToWatchlist={handleAddToWatchlist}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="h-8 px-3 text-[12px] border-[var(--color-border)]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'h-8 w-8 p-0 text-[12px]',
                      page === currentPage
                        ? 'bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90'
                        : 'border-[var(--color-border)]'
                    )}
                  >
                    {page}
                  </Button>
                )
              } else if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={page} className="text-[var(--color-text-muted)] px-1">
                    ...
                  </span>
                )
              }
              return null
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-8 px-3 text-[12px] border-[var(--color-border)]"
          >
            Sau
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

function ScreenerResultsSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <Skeleton className="h-4 w-32 bg-[var(--color-bg-tertiary)]" />
        <Skeleton className="h-8 w-24 bg-[var(--color-bg-tertiary)]" />
      </div>
      <div className="px-4 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <div className="grid grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-4 bg-[var(--color-bg-tertiary)]" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg bg-[var(--color-bg-tertiary)]" />
        ))}
      </div>
    </div>
  )
}
