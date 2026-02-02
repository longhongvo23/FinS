import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUIStore } from '@/stores/ui-store'
import { NotificationCenter } from '@/components/notifications'
import {
  Search,
  X,
  Sun,
  Moon,
  ArrowLeft,
  TrendingUp,
  Clock,
} from 'lucide-react'

interface MobileHeaderProps {
  title?: string
  showBack?: boolean
  className?: string
}

// Demo recent searches
const recentSearches = ['VNM', 'FPT', 'VIC', 'VHM', 'HPG']

// Demo trending stocks
const trendingStocks = [
  { symbol: 'VNM', name: 'Vinamilk', change: 2.5 },
  { symbol: 'FPT', name: 'FPT Corp', change: -1.2 },
  { symbol: 'VIC', name: 'Vingroup', change: 0.8 },
]

export function MobileHeader({ title, showBack, className }: MobileHeaderProps) {
  const navigate = useNavigate()
  const { theme, setTheme } = useUIStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  // Close search on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/stock/${query.toUpperCase()}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-30 h-14',
          'bg-[var(--color-surface)]/95 backdrop-blur-sm',
          'border-b border-[var(--color-border)]',
          className
        )}
      >
        <div className="h-full flex items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8 -ml-1 text-[var(--color-text-primary)]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Link to="/dashboard" className="flex items-center">
                <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                  SmartTrade
                  <span className="text-[var(--color-brand)]">.</span>
                </span>
              </Link>
            )}
            {title && (
              <span className="text-[15px] font-medium text-[var(--color-text-primary)]">
                {title}
              </span>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="h-8 w-8 text-[var(--color-text-tertiary)]"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-[var(--color-text-tertiary)]"
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <NotificationCenter />
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-[var(--color-bg-primary)]"
          >
            {/* Search Header */}
            <div className="h-14 flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(false)}
                className="h-8 w-8 -ml-1 text-[var(--color-text-tertiary)]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <Input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  placeholder="Tìm mã chứng khoán..."
                  className="pl-9 pr-9 h-10 text-[14px] bg-[var(--color-bg-secondary)] border-0 focus-visible:ring-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[12px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
                      Tìm kiếm gần đây
                    </h3>
                    <button className="text-[12px] text-[var(--color-brand)]">
                      Xóa
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => handleSearch(symbol)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                          'bg-[var(--color-bg-secondary)]',
                          'text-[13px] text-[var(--color-text-secondary)]',
                          'active:bg-[var(--color-bg-tertiary)]'
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              {!searchQuery && (
                <div>
                  <h3 className="text-[12px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase mb-3">
                    Xu hướng
                  </h3>
                  <div className="space-y-1">
                    {trendingStocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSearch(stock.symbol)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg',
                          'active:bg-[var(--color-bg-tertiary)]'
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center">
                          <TrendingUp className={cn(
                            'h-5 w-5',
                            stock.change >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
                          )} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                            {stock.symbol}
                          </p>
                          <p className="text-[12px] text-[var(--color-text-muted)]">
                            {stock.name}
                          </p>
                        </div>
                        <span className={cn(
                          'text-[13px] font-medium',
                          stock.change >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
                        )}>
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results Placeholder */}
              {searchQuery && (
                <div className="text-center py-12">
                  <p className="text-[14px] text-[var(--color-text-muted)]">
                    Nhấn Enter để tìm "{searchQuery.toUpperCase()}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Compact header for detail pages
export function CompactMobileHeader({
  title,
  subtitle,
  rightContent
}: {
  title: string
  subtitle?: string
  rightContent?: React.ReactNode
}) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--color-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="h-full flex items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 -ml-1 text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] text-[var(--color-text-muted)] truncate">
              {subtitle}
            </p>
          )}
        </div>

        {rightContent}
      </div>
    </header>
  )
}
