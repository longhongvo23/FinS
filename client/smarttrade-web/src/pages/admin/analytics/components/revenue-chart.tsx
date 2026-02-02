import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCompact } from '@/lib/formatters'

interface RevenueChartProps {
  dateRange: string
}

interface RevenueData {
  date: string
  subscriptions: number
  transactions: number
  total: number
}

// Generate demo data
function generateDemoData(dateRange: string): RevenueData[] {
  const days = dateRange === 'today' ? 24 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
  const data: RevenueData[] = []
  const baseDate = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i)

    const subscriptions = 5000000 + Math.floor(Math.random() * 10000000)
    const transactions = 2000000 + Math.floor(Math.random() * 5000000)

    data.push({
      date:
        dateRange === 'today'
          ? `${date.getHours()}:00`
          : `${date.getDate()}/${date.getMonth() + 1}`,
      subscriptions,
      transactions,
      total: subscriptions + transactions,
    })
  }

  return data
}

async function fetchRevenueData(dateRange: string): Promise<RevenueData[]> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  return generateDemoData(dateRange)
}

export function RevenueChart({ dateRange }: RevenueChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-revenue', dateRange],
    queryFn: () => fetchRevenueData(dateRange),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis
                  dataKey="date"
                  stroke="#71717A"
                  tick={{ fill: '#71717A', fontSize: 12 }}
                />
                <YAxis
                  stroke="#71717A"
                  tick={{ fill: '#71717A', fontSize: 12 }}
                  tickFormatter={(value) => formatCompact(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    border: '1px solid #27272A',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCompact(value), '']}
                />
                <Legend />
                <Bar
                  dataKey="subscriptions"
                  fill="#6366F1"
                  name="Subscriptions"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="transactions"
                  fill="#10B981"
                  name="Giao dịch"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
