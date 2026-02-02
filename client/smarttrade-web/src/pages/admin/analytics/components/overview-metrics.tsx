import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, DollarSign, MessageSquare, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber, formatCurrency } from '@/lib/formatters'

interface OverviewMetricsProps {
  dateRange: string
}

interface MetricData {
  totalUsers: number
  usersChange: number
  revenue: number
  revenueChange: number
  aiQueries: number
  aiChange: number
  orders: number
  ordersChange: number
}

// Demo data generator
function generateDemoMetrics(): MetricData {
  return {
    totalUsers: 12450,
    usersChange: 15.2,
    revenue: 245500000,
    revenueChange: 23.1,
    aiQueries: 89230,
    aiChange: 45.8,
    orders: 3420,
    ordersChange: 12.5,
  }
}

async function fetchOverviewMetrics(_dateRange: string): Promise<MetricData> {
  // In production, this would fetch from the API
  // const response = await fetch(`/api/analytics/overview?range=${dateRange}`)
  // return response.json()

  // Demo mode - return mock data
  await new Promise(resolve => setTimeout(resolve, 500))
  return generateDemoMetrics()
}

interface Metric {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ElementType
  color: string
}

export function OverviewMetrics({ dateRange }: OverviewMetricsProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics-overview', dateRange],
    queryFn: () => fetchOverviewMetrics(dateRange),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metricsData: Metric[] = [
    {
      title: 'Tổng Users',
      value: formatNumber(metrics?.totalUsers || 0, 0),
      change: metrics?.usersChange || 0,
      changeLabel: 'so với kỳ trước',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(metrics?.revenue || 0),
      change: metrics?.revenueChange || 0,
      changeLabel: 'so với kỳ trước',
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'AI Queries',
      value: formatNumber(metrics?.aiQueries || 0, 0),
      change: metrics?.aiChange || 0,
      changeLabel: 'so với kỳ trước',
      icon: MessageSquare,
      color: 'text-purple-500',
    },
    {
      title: 'Lệnh giao dịch',
      value: formatNumber(metrics?.orders || 0, 0),
      change: metrics?.ordersChange || 0,
      changeLabel: 'so với kỳ trước',
      icon: ShoppingCart,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground-muted">{metric.title}</span>
              <metric.icon className={cn('h-5 w-5', metric.color)} />
            </div>

            <div className="text-2xl font-bold mb-2">{metric.value}</div>

            <div className="flex items-center text-sm">
              {metric.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger mr-1" />
              )}
              <span className={cn(metric.change >= 0 ? 'text-success' : 'text-danger')}>
                {metric.change >= 0 ? '+' : ''}
                {metric.change.toFixed(1)}%
              </span>
              <span className="text-foreground-muted ml-1">{metric.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
