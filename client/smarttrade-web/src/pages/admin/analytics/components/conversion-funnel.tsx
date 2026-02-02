import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/formatters'

interface ConversionFunnelProps {
  dateRange: string
}

interface FunnelStep {
  name: string
  count: number
  rate: number
}

// Generate demo data
function generateDemoFunnel(): FunnelStep[] {
  return [
    { name: 'Visitors', count: 100000, rate: 100 },
    { name: 'Signups', count: 12450, rate: 12.45 },
    { name: 'Activated', count: 8200, rate: 65.86 },
    { name: 'First Trade', count: 4100, rate: 50 },
    { name: 'Premium', count: 1230, rate: 30 },
  ]
}

async function fetchFunnelData(_dateRange: string): Promise<FunnelStep[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return generateDemoFunnel()
}

const funnelColors = [
  'bg-brand',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-green-500',
  'bg-amber-500',
]

export function ConversionFunnel({ dateRange }: ConversionFunnelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-funnel', dateRange],
    queryFn: () => fetchFunnelData(dateRange),
  })

  const funnel = data || []
  const maxCount = Math.max(...funnel.map((s) => s.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {funnel.map((step, i) => (
              <div key={step.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{step.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-foreground-muted">
                      {formatNumber(step.count, 0)}
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        i === 0 ? 'text-foreground' : 'text-success'
                      )}
                    >
                      {step.rate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="relative h-8 bg-surface-2 rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-lg transition-all',
                      funnelColors[i]
                    )}
                    style={{ width: `${(step.count / maxCount) * 100}%` }}
                  />
                </div>

                {i < funnel.length - 1 && (
                  <div className="flex justify-center">
                    <div className="text-xs text-foreground-muted">
                      ↓ {((funnel[i + 1].count / step.count) * 100).toFixed(1)}% conversion
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
