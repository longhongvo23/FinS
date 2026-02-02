import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { formatNumber } from '@/lib/formatters'

interface FeatureUsageTableProps {
  dateRange: string
}

interface FeatureUsage {
  name: string
  usageCount: number
  uniqueUsers: number
  avgDuration: number
  percentage: number
}

// Generate demo data
function generateDemoData(): FeatureUsage[] {
  return [
    { name: 'AI Chat', usageCount: 45230, uniqueUsers: 8420, avgDuration: 180, percentage: 45 },
    { name: 'Stock Detail', usageCount: 28150, uniqueUsers: 9200, avgDuration: 120, percentage: 28 },
    { name: 'Trading', usageCount: 18340, uniqueUsers: 3450, avgDuration: 240, percentage: 18 },
    { name: 'Portfolio', usageCount: 9120, uniqueUsers: 4200, avgDuration: 90, percentage: 9 },
    { name: 'Watchlist', usageCount: 7650, uniqueUsers: 5600, avgDuration: 60, percentage: 8 },
    { name: 'Market Screener', usageCount: 5420, uniqueUsers: 2100, avgDuration: 150, percentage: 5 },
    { name: 'Derivatives', usageCount: 3210, uniqueUsers: 890, avgDuration: 200, percentage: 3 },
    { name: 'Settings', usageCount: 1840, uniqueUsers: 1200, avgDuration: 45, percentage: 2 },
  ]
}

async function fetchFeatureUsage(_dateRange: string): Promise<FeatureUsage[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return generateDemoData()
}

export function FeatureUsageTable({ dateRange }: FeatureUsageTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-feature-usage', dateRange],
    queryFn: () => fetchFeatureUsage(dateRange),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(data || []).map((feature) => (
              <div key={feature.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{feature.name}</span>
                  <div className="flex items-center gap-4 text-foreground-muted">
                    <span>{formatNumber(feature.usageCount, 0)} uses</span>
                    <span>{formatNumber(feature.uniqueUsers, 0)} users</span>
                    <span className="font-medium text-foreground">{feature.percentage}%</span>
                  </div>
                </div>
                <Progress value={feature.percentage} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
