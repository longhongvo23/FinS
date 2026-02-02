import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Newspaper, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useNewsStore } from '@/stores/news-store'
import { NewsCard } from './news-card'
import { NewsFilters } from './news-filters'

interface NewsFeedProps {
  showFilters?: boolean
}

export function NewsFeed({ showFilters = true }: NewsFeedProps) {
  const {
    isLoading,
    error,
    lastUpdated,
    currentPage,
    setCurrentPage,
    getPaginatedArticles,
    getTotalPages,
    getFilteredArticles,
    loadNewsFromFinnhub,
  } = useNewsStore()

  // Load news on mount
  useEffect(() => {
    loadNewsFromFinnhub()

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadNewsFromFinnhub()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [loadNewsFromFinnhub])

  const paginatedArticles = getPaginatedArticles()
  const totalPages = getTotalPages()
  const filteredCount = getFilteredArticles().length

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

  const handleRefresh = () => {
    loadNewsFromFinnhub()
  }

  // Loading state
  if (isLoading && paginatedArticles.length === 0) {
    return (
      <div className="space-y-4">
        {showFilters && <NewsFilters />}
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-foreground-muted">Đang tải tin tức từ Finnhub...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && paginatedArticles.length === 0) {
    return (
      <div className="space-y-4">
        {showFilters && <NewsFilters />}
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
          <AlertCircle className="h-8 w-8 text-danger mb-4" />
          <p className="text-danger mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && <NewsFilters />}

      {/* Results Count & Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          Hiển thị {paginatedArticles.length} / {filteredCount} tin tức
        </p>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-foreground-muted">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Articles List */}
      {paginatedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
          <Newspaper className="h-12 w-12 text-foreground-muted mb-4" />
          <h3 className="text-base font-medium mb-2">
            Không tìm thấy tin tức
          </h3>
          <p className="text-sm text-foreground-muted text-center">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="h-9 px-3 text-sm"
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
                      'h-9 w-9 p-0 text-sm',
                      page === currentPage && 'bg-primary'
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
                  <span key={page} className="text-foreground-muted px-1">
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
            className="h-9 px-3 text-sm"
          >
            Sau
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function NewsFeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl border">
          <Skeleton className="w-[120px] h-[90px] rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
