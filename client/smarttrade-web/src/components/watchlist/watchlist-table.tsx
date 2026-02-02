import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Star,
  Trash2,
  MoveRight,
  FileText,
  ShoppingCart,
  Bell,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/charts/sparkline'
import { WatchlistStock, useWatchlistStore, Watchlist } from '@/stores/watchlist-store'

interface WatchlistTableProps {
  watchlist: Watchlist
  onMoveStock?: (symbol: string, toWatchlistId: string) => void
}

export function WatchlistTable({ watchlist, onMoveStock }: WatchlistTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const { watchlists, removeStock } = useWatchlistStore()

  const formatNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    return value.toLocaleString()
  }

  const columns = useMemo<ColumnDef<WatchlistStock>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'symbol',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Mã
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <Link to={`/stock/${row.original.symbol}`} className="block">
            <div className="font-semibold text-primary hover:underline">{row.original.symbol}</div>
            <div className="text-xs text-foreground-muted truncate max-w-[120px]">
              {row.original.name}
            </div>
          </Link>
        ),
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Giá
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className={cn(
              'font-mono font-medium',
              row.original.changePercent >= 0 ? 'text-success' : 'text-danger'
            )}
          >
            {row.original.price.toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'changePercent',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            % Thay đổi
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div
            className={cn(
              'flex items-center gap-1 font-mono',
              row.original.changePercent >= 0 ? 'text-success' : 'text-danger'
            )}
          >
            {row.original.changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {row.original.changePercent >= 0 ? '+' : ''}
              {row.original.changePercent.toFixed(2)}%
            </span>
          </div>
        ),
      },
      {
        id: 'chart',
        header: 'Biểu đồ',
        cell: ({ row }) => (
          <Sparkline
            data={row.original.sparklineData}
            width={80}
            height={28}
            isPositive={row.original.changePercent >= 0}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'volume',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            KL
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm">{formatNumber(row.original.volume)}</div>
        ),
      },
      {
        accessorKey: 'marketCap',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Vốn hóa
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm">{formatNumber(row.original.marketCap)}</div>
        ),
      },
      {
        accessorKey: 'pe',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            P/E
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => <div className="font-mono text-sm">{row.original.pe.toFixed(1)}</div>,
      },
      {
        accessorKey: 'sector',
        header: 'Ngành',
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {row.original.sector}
          </Badge>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/stock/${row.original.symbol}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/trading">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Giao dịch
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  Tạo cảnh báo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {watchlists.length > 1 && (
                <>
                  <DropdownMenuItem disabled className="text-xs opacity-50">
                    Di chuyển đến...
                  </DropdownMenuItem>
                  {watchlists
                    .filter((w) => w.id !== watchlist.id)
                    .map((w) => (
                      <DropdownMenuItem
                        key={w.id}
                        onClick={() => onMoveStock?.(row.original.symbol, w.id)}
                      >
                        <MoveRight className="mr-2 h-4 w-4" />
                        <span
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: w.color }}
                        />
                        {w.name}
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                className="text-danger focus:text-danger"
                onClick={() => removeStock(watchlist.id, row.original.symbol)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa khỏi danh sách
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 40,
      },
    ],
    [watchlist.id, watchlists, onMoveStock, removeStock]
  )

  const table = useReactTable({
    data: watchlist.stocks,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  })

  const selectedCount = Object.keys(rowSelection).length

  const handleExportCSV = () => {
    const headers = ['Mã', 'Tên', 'Sàn', 'Ngành', 'Giá', 'Thay đổi %', 'Khối lượng', 'Vốn hóa', 'P/E']
    const rows = watchlist.stocks.map((s) => [
      s.symbol,
      s.name,
      s.exchange,
      s.sector,
      s.price,
      s.changePercent,
      s.volume,
      s.marketCap,
      s.pe,
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${watchlist.name}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleBulkDelete = () => {
    const selectedSymbols = table
      .getSelectedRowModel()
      .rows.map((r) => r.original.symbol)
    selectedSymbols.forEach((symbol) => removeStock(watchlist.id, symbol))
    setRowSelection({})
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Tìm mã, tên công ty..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              <span className="text-sm text-foreground-muted">
                Đã chọn {selectedCount} mã
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left text-xs font-medium text-foreground-muted px-4 py-3"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-8 text-foreground-muted"
                  >
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>Chưa có mã nào trong danh sách</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-surface-2/50 transition-colors',
                      row.getIsSelected() && 'bg-surface-2'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-foreground-muted">
        <div>
          {table.getFilteredRowModel().rows.length} mã
          {globalFilter && ` (lọc từ ${watchlist.stocks.length})`}
        </div>
        <div>Cập nhật: {new Date(watchlist.updatedAt).toLocaleString('vi-VN')}</div>
      </div>
    </div>
  )
}
