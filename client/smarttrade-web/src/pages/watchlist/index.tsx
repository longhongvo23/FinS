import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Star,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WatchlistTable } from '@/components/watchlist/watchlist-table'
import { useWatchlistStore } from '@/stores/watchlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { GuestRestricted } from '@/components/guest-restricted'

export function WatchlistPage() {
  const {
    watchlists,
    activeWatchlistId,
    isLoading,
    error,
    loadWatchlistFromAPI,
  } = useWatchlistStore()

  const { isAuthenticated, isGuest } = useAuthStore()

  // Show guest restriction if user is guest
  if (isGuest) {
    return <GuestRestricted featureName="Danh sách theo dõi" />
  }

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId)
  const stocks = activeWatchlist?.stocks || []

  // Calculate summary stats
  const stats = useMemo(() => {
    if (stocks.length === 0) {
      return { gainers: 0, losers: 0, topStock: null, avgChange: 0 }
    }

    const gainers = stocks.filter((s) => s.changePercent > 0).length
    const losers = stocks.filter((s) => s.changePercent < 0).length
    const topStock = stocks.reduce((max, s) =>
      s.changePercent > (max?.changePercent || -Infinity) ? s : max
      , stocks[0])
    const avgChange = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length

    return { gainers, losers, topStock, avgChange }
  }, [stocks])

  // Load watchlist from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWatchlistFromAPI()
    }
  }, [isAuthenticated, loadWatchlistFromAPI])

  const handleRefresh = () => {
    loadWatchlistFromAPI()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh sách theo dõi</h1>
          <p className="text-foreground-muted">
            Theo dõi các cổ phiếu yêu thích của bạn
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Làm mới
        </Button>
      </div>

      {/* Summary Stats Bar */}
      {stocks.length > 0 && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Gainers */}
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Tăng giá</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.gainers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Losers */}
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Giảm giá</p>
                  <p className="text-2xl font-bold text-red-500">{stats.losers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performer */}
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground-muted">Top tăng</p>
                  {stats.topStock && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate">{stats.topStock.symbol}</span>
                      <Badge variant="secondary" className="text-emerald-500 bg-emerald-500/10">
                        +{stats.topStock.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Stocks */}
          <Card className="bg-secondary/50 border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <BarChart3 className="h-5 w-5 text-foreground-muted" />
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">Đang theo dõi</p>
                  <p className="text-2xl font-bold">{stocks.length} mã</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-foreground-muted">Đang tải danh sách theo dõi...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="h-8 w-8 text-danger mb-4" />
              <p className="text-danger mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && stocks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-6">
                <Star className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chưa có cổ phiếu nào</h3>
              <p className="text-foreground-muted mb-6 max-w-md">
                Bắt đầu theo dõi các cổ phiếu yêu thích bằng cách nhấn vào biểu tượng ⭐ trên trang thị trường.
              </p>
              <Link to="/market">
                <Button>
                  Khám phá thị trường
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Table */}
      {!isLoading && !error && stocks.length > 0 && activeWatchlist && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>{activeWatchlist.name}</CardTitle>
                <Badge variant="outline">{stocks.length} mã</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WatchlistTable watchlist={activeWatchlist} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
