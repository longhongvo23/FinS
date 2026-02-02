import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface UserGrowthChartProps {
  dateRange: string
}

interface GrowthData {
  date: string
  totalUsers: number
  newUsers: number
  premiumUsers: number
}

// Generate demo data based on date range
function generateDemoData(dateRange: string): GrowthData[] {
  const days = dateRange === 'today' ? 24 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
  const data: GrowthData[] = []
  const baseDate = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i)

    data.push({
      date: dateRange === 'today'
        ? `${date.getHours()}:00`
        : `${date.getDate()}/${date.getMonth() + 1}`,
      totalUsers: 10000 + Math.floor(Math.random() * 3000) + (days - i) * 50,
      newUsers: 100 + Math.floor(Math.random() * 200),
      premiumUsers: 800 + Math.floor(Math.random() * 500) + (days - i) * 10,
    })
  }

  return data
}

async function fetchUserGrowth(dateRange: string): Promise<GrowthData[]> {
  // In production, fetch from API
  await new Promise((resolve) => setTimeout(resolve, 600))
  return generateDemoData(dateRange)
}

export function UserGrowthChart({ dateRange }: UserGrowthChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-user-growth', dateRange],
    queryFn: () => fetchUserGrowth(dateRange),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis
                  dataKey="date"
                  stroke="#71717A"
                  tick={{ fill: '#71717A', fontSize: 12 }}
                />
                <YAxis stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    border: '1px solid #27272A',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalUsers"
                  stroke="#6366F1"
                  strokeWidth={2}
                  name="Tổng users"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Users mới"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="premiumUsers"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Premium"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
