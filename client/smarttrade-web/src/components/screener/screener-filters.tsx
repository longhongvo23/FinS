import { DollarSign, TrendingUp, Percent, Building2, BarChart3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  useScreenerStore,
  sectors,
  type Exchange,
} from '@/stores/screener-store'
import { FilterSection } from './filter-section'
import { RangeSlider } from './range-slider'

const exchanges: { value: Exchange; label: string }[] = [
  { value: 'HOSE', label: 'HOSE' },
  { value: 'HNX', label: 'HNX' },
  { value: 'UPCOM', label: 'UPCOM' },
]

export function ScreenerFilters() {
  const { filters, setFilter, resetFilters, getActiveFilterCount } =
    useScreenerStore()

  const activeCount = getActiveFilterCount()

  const handleExchangeToggle = (exchange: Exchange) => {
    const current = filters.exchanges
    if (current.includes(exchange)) {
      setFilter(
        'exchanges',
        current.filter((e) => e !== exchange)
      )
    } else {
      setFilter('exchanges', [...current, exchange])
    }
  }

  const handleSectorToggle = (sector: string) => {
    const current = filters.sectors
    if (current.includes(sector)) {
      setFilter(
        'sectors',
        current.filter((s) => s !== sector)
      )
    } else {
      setFilter('sectors', [...current, sector])
    }
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            Bộ lọc
          </h2>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-[10px] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
            >
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 px-2 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-negative)]"
          >
            <X className="h-3 w-3 mr-1" />
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto">
        {/* Price & Volume */}
        <FilterSection
          title="Giá & Khối lượng"
          icon={<DollarSign className="h-4 w-4" />}
        >
          <RangeSlider
            label="Giá (VND)"
            minValue={filters.priceMin}
            maxValue={filters.priceMax}
            onMinChange={(v) => setFilter('priceMin', v)}
            onMaxChange={(v) => setFilter('priceMax', v)}
          />

          <RangeSlider
            label="% Thay đổi"
            minValue={filters.changeMin}
            maxValue={filters.changeMax}
            onMinChange={(v) => setFilter('changeMin', v)}
            onMaxChange={(v) => setFilter('changeMax', v)}
            suffix="%"
            formatValue={(v) => v.toString()}
            parseValue={(v) => parseFloat(v)}
            placeholder={{ min: '-10', max: '+10' }}
          />

          <RangeSlider
            label="Khối lượng"
            minValue={filters.volumeMin}
            maxValue={filters.volumeMax}
            onMinChange={(v) => setFilter('volumeMin', v)}
            onMaxChange={(v) => setFilter('volumeMax', v)}
            formatValue={(v) => {
              if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
              if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
              return v.toString()
            }}
            parseValue={(v) => {
              const num = parseFloat(v.replace(/[MK]/gi, ''))
              if (v.toUpperCase().includes('M')) return num * 1e6
              if (v.toUpperCase().includes('K')) return num * 1e3
              return num
            }}
          />

          <RangeSlider
            label="KL TB 20 ngày"
            minValue={filters.avgVolumeMin}
            maxValue={undefined}
            onMinChange={(v) => setFilter('avgVolumeMin', v)}
            onMaxChange={() => {}}
            formatValue={(v) => {
              if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
              if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
              return v.toString()
            }}
            parseValue={(v) => {
              const num = parseFloat(v.replace(/[MK]/gi, ''))
              if (v.toUpperCase().includes('M')) return num * 1e6
              if (v.toUpperCase().includes('K')) return num * 1e3
              return num
            }}
          />
        </FilterSection>

        {/* Valuation */}
        <FilterSection
          title="Định giá"
          icon={<TrendingUp className="h-4 w-4" />}
        >
          <RangeSlider
            label="P/E"
            minValue={filters.peMin}
            maxValue={filters.peMax}
            onMinChange={(v) => setFilter('peMin', v)}
            onMaxChange={(v) => setFilter('peMax', v)}
            formatValue={(v) => v.toFixed(1)}
            parseValue={(v) => parseFloat(v)}
          />

          <RangeSlider
            label="P/B"
            minValue={filters.pbMin}
            maxValue={filters.pbMax}
            onMinChange={(v) => setFilter('pbMin', v)}
            onMaxChange={(v) => setFilter('pbMax', v)}
            formatValue={(v) => v.toFixed(1)}
            parseValue={(v) => parseFloat(v)}
          />

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Vốn hóa
            </label>
            <Select
              value={filters.marketCap}
              onValueChange={(v) =>
                setFilter('marketCap', v as 'small' | 'mid' | 'large' | 'all')
              }
            >
              <SelectTrigger className="h-8 text-[12px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="large">Large Cap (&gt;50T)</SelectItem>
                <SelectItem value="mid">Mid Cap (10T-50T)</SelectItem>
                <SelectItem value="small">Small Cap (&lt;10T)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterSection>

        {/* Dividends */}
        <FilterSection
          title="Cổ tức"
          icon={<Percent className="h-4 w-4" />}
        >
          <RangeSlider
            label="Tỷ suất cổ tức (%)"
            minValue={filters.dividendYieldMin}
            maxValue={filters.dividendYieldMax}
            onMinChange={(v) => setFilter('dividendYieldMin', v)}
            onMaxChange={(v) => setFilter('dividendYieldMax', v)}
            suffix="%"
            formatValue={(v) => v.toFixed(1)}
            parseValue={(v) => parseFloat(v)}
          />

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Có trả cổ tức
            </label>
            <Select
              value={filters.hasDividend}
              onValueChange={(v) =>
                setFilter('hasDividend', v as 'yes' | 'no' | 'all')
              }
            >
              <SelectTrigger className="h-8 text-[12px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="yes">Có trả cổ tức</SelectItem>
                <SelectItem value="no">Không trả cổ tức</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterSection>

        {/* Classification */}
        <FilterSection
          title="Phân loại"
          icon={<Building2 className="h-4 w-4" />}
        >
          {/* Exchange */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Sàn giao dịch
            </label>
            <div className="flex flex-wrap gap-2">
              {exchanges.map((exchange) => (
                <Button
                  key={exchange.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExchangeToggle(exchange.value)}
                  className={cn(
                    'h-7 px-3 text-[11px] border-[var(--color-border)]',
                    filters.exchanges.includes(exchange.value) &&
                      'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                  )}
                >
                  {exchange.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Ngành ({filters.sectors.length} đã chọn)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
              {sectors.map((sector) => (
                <label
                  key={sector}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--color-bg-tertiary)] cursor-pointer"
                >
                  <Checkbox
                    checked={filters.sectors.includes(sector)}
                    onCheckedChange={() => handleSectorToggle(sector)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-[12px] text-[var(--color-text-secondary)]">
                    {sector}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Technical */}
        <FilterSection
          title="Kỹ thuật"
          icon={<BarChart3 className="h-4 w-4" />}
          defaultOpen={false}
        >
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Vị trí 52 tuần
            </label>
            <Select
              value={filters.near52WStatus}
              onValueChange={(v) =>
                setFilter('near52WStatus', v as 'high' | 'low' | 'all')
              }
            >
              <SelectTrigger className="h-8 text-[12px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="high">Gần đỉnh 52 tuần</SelectItem>
                <SelectItem value="low">Gần đáy 52 tuần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Trên MA50
            </label>
            <Select
              value={
                filters.aboveMA50 === 'all'
                  ? 'all'
                  : filters.aboveMA50
                  ? 'yes'
                  : 'no'
              }
              onValueChange={(v) => {
                if (v === 'all') setFilter('aboveMA50', 'all')
                else setFilter('aboveMA50', v === 'yes')
              }}
            >
              <SelectTrigger className="h-8 text-[12px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="yes">Trên MA50</SelectItem>
                <SelectItem value="no">Dưới MA50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              RSI
            </label>
            <Select
              value={filters.rsiStatus}
              onValueChange={(v) =>
                setFilter(
                  'rsiStatus',
                  v as 'oversold' | 'overbought' | 'neutral' | 'all'
                )
              }
            >
              <SelectTrigger className="h-8 text-[12px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="oversold">Quá bán (&lt;30)</SelectItem>
                <SelectItem value="overbought">Quá mua (&gt;70)</SelectItem>
                <SelectItem value="neutral">Trung lập (30-70)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterSection>
      </div>
    </div>
  )
}
