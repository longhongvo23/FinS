import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  History,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

export interface Transaction {
  id: string
  date: string
  time: string
  type: 'buy' | 'sell' | 'dividend' | 'fee' | 'deposit' | 'withdraw'
  symbol?: string
  quantity?: number
  price?: number
  amount: number
  fee?: number
  balance: number
  description?: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  pageSize?: number
}

const typeLabels: Record<Transaction['type'], string> = {
  buy: 'Mua',
  sell: 'Bán',
  dividend: 'Cổ tức',
  fee: 'Phí',
  deposit: 'Nạp tiền',
  withdraw: 'Rút tiền',
}

const typeColors: Record<Transaction['type'], string> = {
  buy: 'bg-danger',
  sell: 'bg-success',
  dividend: 'bg-chart-2',
  fee: 'bg-foreground-muted',
  deposit: 'bg-brand',
  withdraw: 'bg-warning',
}

export function TransactionHistory({
  transactions,
  pageSize = 10,
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<Transaction['type'] | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      (t.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    return matchesSearch && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleExportCSV = () => {
    const headers = ['Ngày', 'Giờ', 'Loại', 'Mã CK', 'KL', 'Giá', 'Giá trị', 'Phí', 'Số dư']
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.time,
      typeLabels[t.type],
      t.symbol || '',
      t.quantity?.toString() || '',
      t.price?.toString() || '',
      t.amount.toString(),
      t.fee?.toString() || '',
      t.balance.toString(),
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lich-su-giao-dich-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử giao dịch
            <Badge variant="secondary" className="ml-2">
              {filteredTransactions.length} giao dịch
            </Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Tìm mã CK hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTypeFilter('all')
                setCurrentPage(1)
              }}
            >
              Tất cả
            </Button>
            <Button
              variant={typeFilter === 'buy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTypeFilter('buy')
                setCurrentPage(1)
              }}
              className={typeFilter === 'buy' ? 'bg-danger hover:bg-danger/90' : ''}
            >
              Mua
            </Button>
            <Button
              variant={typeFilter === 'sell' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTypeFilter('sell')
                setCurrentPage(1)
              }}
              className={typeFilter === 'sell' ? 'bg-success hover:bg-success/90' : ''}
            >
              Bán
            </Button>
            <Button
              variant={typeFilter === 'dividend' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTypeFilter('dividend')
                setCurrentPage(1)
              }}
            >
              Cổ tức
            </Button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {paginatedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 bg-surface-2 rounded-lg hover:bg-surface-3 transition-colors"
            >
              {/* Type Icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  transaction.type === 'buy' && 'bg-danger/10',
                  transaction.type === 'sell' && 'bg-success/10',
                  transaction.type === 'dividend' && 'bg-chart-2/10',
                  transaction.type === 'fee' && 'bg-foreground-muted/10',
                  transaction.type === 'deposit' && 'bg-brand/10',
                  transaction.type === 'withdraw' && 'bg-warning/10'
                )}
              >
                {transaction.type === 'buy' ? (
                  <ArrowDownRight className="h-5 w-5 text-danger" />
                ) : transaction.type === 'sell' ? (
                  <ArrowUpRight className="h-5 w-5 text-success" />
                ) : transaction.type === 'dividend' ? (
                  <ArrowUpRight className="h-5 w-5 text-chart-2" />
                ) : transaction.type === 'deposit' ? (
                  <ArrowUpRight className="h-5 w-5 text-brand" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-warning" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={cn('text-xs', typeColors[transaction.type])}>
                    {typeLabels[transaction.type]}
                  </Badge>
                  {transaction.symbol && (
                    <span className="font-semibold">{transaction.symbol}</span>
                  )}
                  {transaction.quantity && transaction.price && (
                    <span className="text-sm text-foreground-muted">
                      {transaction.quantity.toLocaleString()} @ {transaction.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <Calendar className="h-3 w-3" />
                  {transaction.date} {transaction.time}
                  {transaction.description && (
                    <span className="truncate">• {transaction.description}</span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p
                  className={cn(
                    'font-mono font-semibold',
                    ['sell', 'dividend', 'deposit'].includes(transaction.type)
                      ? 'text-success'
                      : 'text-danger'
                  )}
                >
                  {['sell', 'dividend', 'deposit'].includes(transaction.type) ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </p>
                {transaction.fee && transaction.fee > 0 && (
                  <p className="text-xs text-foreground-muted">
                    Phí: {formatCurrency(transaction.fee)}
                  </p>
                )}
                <p className="text-xs text-foreground-muted">
                  SD: {formatCurrency(transaction.balance)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {paginatedTransactions.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            {searchTerm || typeFilter !== 'all'
              ? 'Không tìm thấy giao dịch phù hợp'
              : 'Chưa có giao dịch nào'}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-foreground-muted">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
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
      </CardContent>
    </Card>
  )
}
