import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AIUsageChartProps {
  dateRange: string
}

interface AIUsageData {
  date: string
  chatMessages: number
  stockInsights: number
  portfolioHealth: number
  dailyBriefing: number
}

interface AIBreakdown {
  name: string
  value: number
  color: string
}

// Generate demo data
function generateDemoData(dateRange: string): AIUsageData[] {
  const days = dateRange === 'today' ? 24 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
  const data: AIUsageData[] = []
  const baseDate = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i)

    data.push({
      date:
        dateRange === 'today'
          ? `${date.getHours()}:00`
          : `${date.getDate()}/${date.getMonth() + 1}`,
      chatMessages: 500 + Math.floor(Math.random() * 1000),
      stockInsights: 300 + Math.floor(Math.random() * 500),
      portfolioHealth: 100 + Math.floor(Math.random() * 200),
      dailyBriefing: 200 + Math.floor(Math.random() * 300),
    })
  }

  return data
}

function generateBreakdown(): AIBreakdown[] {
  return [
    { name: 'AI Chat', value: 45, color: '#6366F1' },
    { name: 'Stock Insights', value: 28, color: '#10B981' },
    { name: 'Portfolio Health', value: 18, color: '#F59E0B' },
    { name: 'Daily Briefing', value: 9, color: '#EC4899' },
  ]
}

async function fetchAIUsage(dateRange: string): Promise<{
  timeline: AIUsageData[]
  breakdown: AIBreakdown[]
}> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    timeline: generateDemoData(dateRange),
    breakdown: generateBreakdown(),
  }
}

export function AIUsageChart({ dateRange }: AIUsageChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-ai-usage', dateRange],
    queryFn: () => fetchAIUsage(dateRange),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timeline Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>AI Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.timeline || []}>
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
                  <Area
                    type="monotone"
                    dataKey="chatMessages"
                    stackId="1"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.6}
                    name="Chat"
                  />
                  <Area
                    type="monotone"
                    dataKey="stockInsights"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Stock Insights"
                  />
                  <Area
                    type="monotone"
                    dataKey="portfolioHealth"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.6}
                    name="Portfolio"
                  />
                  <Area
                    type="monotone"
                    dataKey="dailyBriefing"
                    stackId="1"
                    stroke="#EC4899"
                    fill="#EC4899"
                    fillOpacity={0.6}
                    name="Daily Briefing"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.breakdown || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {(data?.breakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 space-y-2">
                {(data?.breakdown || []).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
