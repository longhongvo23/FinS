import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, Newspaper } from 'lucide-react'
import { NewsFeed } from '@/components/news/news-feed'
import { NewsCard } from '@/components/news/news-card'
import { useNewsStore } from '@/stores/news-store'

export function NewsPage() {
  const {
    articles,
    isLoading,
    isLoadingWatchlist,
    getTrendingArticles,
    loadNewsFromFinnhub,
    loadUserWatchlist,
    getWatchedStocks
  } = useNewsStore()

  const watchedStocks = getWatchedStocks()

  // Load watchlist for filter display
  useEffect(() => {
    loadUserWatchlist()
  }, [loadUserWatchlist])

  // Load news from all 7 default stocks on mount
  useEffect(() => {
    if (articles.length === 0) {
      loadNewsFromFinnhub()
    }
  }, [articles.length, loadNewsFromFinnhub])

  const trendingArticles = getTrendingArticles()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6" />
          Tin tức & Nghiên cứu
        </h1>
        <p className="text-foreground-muted mt-1">
          Cập nhật tin tức mới nhất về {watchedStocks.length} cổ phiếu đang theo dõi
        </p>
      </div>

      {/* Trending Section */}
      {trendingArticles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Tin nổi bật
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border overflow-hidden">
                    <Skeleton className="aspect-[16/9]" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingArticles.slice(0, 3).map((article) => (
                  <NewsCard key={article.id} article={article} featured />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stock Info Bar */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-foreground-muted">
        <span>Đang theo dõi:</span>
        {isLoadingWatchlist ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-12 rounded-full" />
            ))}
          </>
        ) : watchedStocks.length > 0 ? (
          watchedStocks.map((stock) => (
            <Badge key={stock.symbol} variant="outline" className="text-xs">
              {stock.symbol}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground italic">
            Chưa có cổ phiếu nào trong danh sách theo dõi
          </span>
        )}
      </div>

      {/* News Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tất cả tin tức</CardTitle>
        </CardHeader>
        <CardContent>
          <NewsFeed showFilters />
        </CardContent>
      </Card>
    </div>
  )
}

export default NewsPage
