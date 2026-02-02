import { Search, X, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  useNewsStore,
  type NewsLanguage,
} from '@/stores/news-store'

const LANGUAGES: { value: NewsLanguage; label: string }[] = [
  { value: 'all', label: 'Tất cả ngôn ngữ' },
  { value: 'en', label: '🇺🇸 Tiếng Anh' },
  { value: 'vi', label: '🇻🇳 Tiếng Việt' },
]

export function NewsFilters() {
  const {
    newsFilters,
    setSearchQuery,
    setSelectedSymbol,
    setLanguage,
    clearFilters,
    getWatchedStocks,
  } = useNewsStore()

  const watchedStocks = getWatchedStocks()

  const hasActiveFilters =
    newsFilters.search ||
    newsFilters.selectedSymbol ||
    newsFilters.language !== 'all'

  return (
    <div className="space-y-4">
      {/* Stock Symbol Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={newsFilters.selectedSymbol === null ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setSelectedSymbol(null)}
        >
          Tất cả
        </Button>
        {watchedStocks.map((stock) => (
          <Button
            key={stock.symbol}
            variant={newsFilters.selectedSymbol === stock.symbol ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 text-xs',
              newsFilters.selectedSymbol === stock.symbol && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setSelectedSymbol(
              newsFilters.selectedSymbol === stock.symbol ? null : stock.symbol
            )}
          >
            {stock.symbol}
          </Button>
        ))}
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            value={newsFilters.search}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tin tức..."
            className="pl-10 h-10 text-sm"
          />
          {newsFilters.search && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-foreground-muted hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Language Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-10 text-sm',
                newsFilters.language !== 'all' && 'border-primary text-primary'
              )}
            >
              <Globe className="h-4 w-4 mr-2" />
              {LANGUAGES.find(l => l.value === newsFilters.language)?.label || 'Ngôn ngữ'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Chọn ngôn ngữ</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LANGUAGES.map((lang) => (
              <DropdownMenuCheckboxItem
                key={lang.value}
                checked={newsFilters.language === lang.value}
                onCheckedChange={() => setLanguage(lang.value)}
                className="text-sm"
              >
                {lang.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {newsFilters.search && (
            <Badge
              variant="secondary"
              className="text-xs gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => setSearchQuery('')}
            >
              Tìm: "{newsFilters.search}"
              <X className="h-3 w-3" />
            </Badge>
          )}

          {newsFilters.selectedSymbol && (
            <Badge
              variant="secondary"
              className="text-xs bg-primary/10 text-primary gap-1 cursor-pointer hover:bg-primary/20"
              onClick={() => setSelectedSymbol(null)}
            >
              {newsFilters.selectedSymbol}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {newsFilters.language !== 'all' && (
            <Badge
              variant="secondary"
              className="text-xs bg-purple-500/10 text-purple-500 gap-1 cursor-pointer hover:bg-purple-500/20"
              onClick={() => setLanguage('all')}
            >
              {LANGUAGES.find(l => l.value === newsFilters.language)?.label}
              <X className="h-3 w-3" />
            </Badge>
          )}

          <button
            onClick={clearFilters}
            className="text-xs text-foreground-muted hover:text-danger transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  )
}
