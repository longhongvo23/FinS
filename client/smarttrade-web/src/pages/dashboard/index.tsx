import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardLabel } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { PageHeader } from '@/components/layout/page-header'
import AdvancedChart from '@/components/tradingview/advanced-chart'
import StockHeatmap from '@/components/tradingview/stock-heatmap'
import { TopStories } from '@/components/tradingview/top-stories'
// AI components removed - will be re-implemented with FinS AIService

export function DashboardPage() {
  const { user } = useAuthStore()
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Xin chào, ${user?.full_name?.split(' ').pop() || 'Trader'}!`}
        description={`Cập nhật lúc ${lastUpdate.toLocaleTimeString('vi-VN')}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 text-[13px] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-2', isRefreshing && 'animate-spin')} />
            Làm mới
          </Button>
        }
      />

      {/* Advanced Real-Time Chart - Full Width */}
      <Card className="overflow-hidden bg-[var(--color-bg-secondary)]">
        <AdvancedChart />
      </Card>

      {/* Bottom Section: Top Stories (Left) & Stock Heatmap (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Top Stories */}
        <TopStories />

        {/* Stock Heatmap */}
        <Card className="overflow-hidden bg-[var(--color-bg-secondary)] flex flex-col h-full">
          <div className="p-4 border-b border-[var(--color-border)] flex-none">
            <h3 className="text-lg font-semibold">Bản đồ nhiệt thị trường</h3>
          </div>
          <div className="flex-1 min-h-0">
            <StockHeatmap />
          </div>
        </Card>
      </div>
    </div>
  )
}
