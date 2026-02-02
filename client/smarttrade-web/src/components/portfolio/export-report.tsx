import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PortfolioHolding, PortfolioSummary } from '@/stores/portfolio-store'

interface ExportReportProps {
  holdings: PortfolioHolding[]
  summary: PortfolioSummary
}

type DateRange = '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL'

interface ExportOptions {
  dateRange: DateRange
  includeSummary: boolean
  includeHoldings: boolean
  includePerformance: boolean
  includeAllocation: boolean
  includeRisk: boolean
}

function generateCSVContent(
  holdings: PortfolioHolding[],
  summary: PortfolioSummary,
  options: ExportOptions
): string {
  const lines: string[] = []
  const now = new Date().toLocaleString('vi-VN')

  // Header
  lines.push('BÁO CÁO DANH MỤC ĐẦU TƯ')
  lines.push(`Ngày xuất: ${now}`)
  lines.push('')

  // Summary section
  if (options.includeSummary) {
    lines.push('=== TỔNG QUAN ===')
    lines.push(`Tổng giá trị danh mục,${summary.totalValue}`)
    lines.push(`Giá trị cổ phiếu,${summary.stockValue}`)
    lines.push(`Tiền mặt,${summary.cashBalance}`)
    lines.push(`Tổng lãi/lỗ,${summary.totalPL}`)
    lines.push(`Tổng lãi/lỗ (%),${summary.totalPLPercent}%`)
    lines.push(`Thay đổi hôm nay,${summary.dailyPL}`)
    lines.push(`Thay đổi hôm nay (%),${summary.dailyPLPercent}%`)
    lines.push('')
  }

  // Holdings section
  if (options.includeHoldings) {
    lines.push('=== DANH MỤC CỔ PHIẾU ===')
    lines.push(
      'Mã,Tên,Số lượng,Giá TB,Giá TT,Giá trị,Giá vốn,Lãi/Lỗ,Lãi/Lỗ (%),Tỷ trọng (%)'
    )

    holdings.forEach((h) => {
      lines.push(
        [
          h.symbol,
          `"${h.name}"`,
          h.quantity,
          h.avgCost,
          h.currentPrice,
          h.marketValue,
          h.costBasis,
          h.unrealizedPL,
          `${h.unrealizedPLPercent}%`,
          `${h.weight}%`,
        ].join(',')
      )
    })
    lines.push('')
  }

  // Allocation section
  if (options.includeAllocation) {
    lines.push('=== PHÂN BỔ THEO NGÀNH ===')
    const sectorMap = new Map<string, number>()
    holdings.forEach((h) => {
      const current = sectorMap.get(h.sector) || 0
      sectorMap.set(h.sector, current + h.marketValue)
    })

    lines.push('Ngành,Giá trị,Tỷ trọng (%)')
    sectorMap.forEach((value, sector) => {
      const percent = (value / summary.stockValue) * 100
      lines.push(`${sector},${value},${percent.toFixed(2)}%`)
    })
    lines.push('')
  }

  // Risk section
  if (options.includeRisk) {
    lines.push('=== PHÂN TÍCH RỦI RO ===')
    lines.push(`Số mã cổ phiếu,${holdings.length}`)

    const uniqueSectors = new Set(holdings.map((h) => h.sector)).size
    lines.push(`Số ngành,${uniqueSectors}`)

    const sortedByWeight = [...holdings].sort((a, b) => b.weight - a.weight)
    const top3 = sortedByWeight.slice(0, 3)
    lines.push('Top 3 tỷ trọng lớn nhất:')
    top3.forEach((h, i) => {
      lines.push(`  ${i + 1}. ${h.symbol}: ${h.weight}%`)
    })
    lines.push('')
  }

  return lines.join('\n')
}

export function ExportReport({ holdings, summary }: ExportReportProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    dateRange: '1M',
    includeSummary: true,
    includeHoldings: true,
    includePerformance: true,
    includeAllocation: true,
    includeRisk: true,
  })

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Generate CSV content
      const csvContent = generateCSVContent(holdings, summary, options)

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `portfolio-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Xuất báo cáo thành công!')
      setOpen(false)
    } catch (error) {
      toast.error('Có lỗi khi xuất báo cáo')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[13px] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
        >
          <Download className="h-3.5 w-3.5 mr-2" />
          Xuất báo cáo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Xuất báo cáo danh mục
          </DialogTitle>
          <DialogDescription>
            Chọn các mục cần xuất trong báo cáo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Khoảng thời gian</label>
            <Select
              value={options.dateRange}
              onValueChange={(value) =>
                setOptions({ ...options, dateRange: value as DateRange })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1W">1 tuần</SelectItem>
                <SelectItem value="1M">1 tháng</SelectItem>
                <SelectItem value="3M">3 tháng</SelectItem>
                <SelectItem value="6M">6 tháng</SelectItem>
                <SelectItem value="YTD">Từ đầu năm</SelectItem>
                <SelectItem value="1Y">1 năm</SelectItem>
                <SelectItem value="ALL">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Nội dung báo cáo</label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="summary"
                checked={options.includeSummary}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeSummary: !!checked })
                }
              />
              <label htmlFor="summary" className="text-sm cursor-pointer">
                Tổng quan danh mục
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="holdings"
                checked={options.includeHoldings}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeHoldings: !!checked })
                }
              />
              <label htmlFor="holdings" className="text-sm cursor-pointer">
                Chi tiết cổ phiếu
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="performance"
                checked={options.includePerformance}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includePerformance: !!checked })
                }
              />
              <label htmlFor="performance" className="text-sm cursor-pointer">
                Biểu đồ hiệu suất
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allocation"
                checked={options.includeAllocation}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeAllocation: !!checked })
                }
              />
              <label htmlFor="allocation" className="text-sm cursor-pointer">
                Phân bổ ngành
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="risk"
                checked={options.includeRisk}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeRisk: !!checked })
                }
              />
              <label htmlFor="risk" className="text-sm cursor-pointer">
                Phân tích rủi ro
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Xuất CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
