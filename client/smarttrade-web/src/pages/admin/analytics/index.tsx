import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OverviewMetrics } from './components/overview-metrics'
import { UserGrowthChart } from './components/user-growth-chart'
import { RevenueChart } from './components/revenue-chart'
import { AIUsageChart } from './components/ai-usage-chart'
import { FeatureUsageTable } from './components/feature-usage-table'
import { ConversionFunnel } from './components/conversion-funnel'
import { TopStocksTable } from './components/top-stocks-table'
import { RealtimeUsers } from './components/realtime-users'

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7d')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-foreground-muted">
            Track user behavior, revenue, and platform performance
          </p>
        </div>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="7d">7 ngày qua</SelectItem>
            <SelectItem value="30d">30 ngày qua</SelectItem>
            <SelectItem value="90d">90 ngày qua</SelectItem>
            <SelectItem value="1y">1 năm qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Realtime indicator */}
      <RealtimeUsers />

      {/* Overview Metrics */}
      <OverviewMetrics dateRange={dateRange} />

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart dateRange={dateRange} />
        <RevenueChart dateRange={dateRange} />
      </div>

      {/* Tabs for detailed analytics */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="ai">AI Usage</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureUsageTable dateRange={dateRange} />
            <TopStocksTable dateRange={dateRange} />
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <AIUsageChart dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground-muted">Trading analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <ConversionFunnel dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
