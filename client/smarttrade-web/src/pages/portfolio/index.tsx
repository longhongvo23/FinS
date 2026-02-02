import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, Settings, BarChart3, PieChart, History, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/page-header'
import { usePortfolioStore } from '@/stores/portfolio-store'
import {
  PortfolioSummary,
  HoldingsTable,
  AllocationChart,
  AllocationBar,
  CHART_COLORS,
  PerformanceChart,
  TransactionHistory,
  PerformanceCards,
  AllocationTreemap,
  RiskAnalysis,
  ExportReport,
} from '@/components/portfolio'

// Generate mock transactions
const generateTransactions = (count: number) => {
  const types = ['buy', 'sell', 'dividend', 'fee', 'deposit', 'withdraw'] as const
  const symbols = ['VNM', 'FPT', 'VIC', 'HPG', 'MWG', 'TCB']
  const transactions = []
  let balance = 45000000

  for (let i = 0; i < count; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i * 2 - Math.floor(Math.random() * 3))

    const type = types[Math.floor(Math.random() * types.length)]
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const quantity = Math.floor(Math.random() * 500 + 100) * 100
    const price = Math.floor(Math.random() * 50000 + 20000)
    const amount = type === 'buy' || type === 'sell' ? quantity * price : Math.floor(Math.random() * 5000000)
    const fee = ['buy', 'sell'].includes(type) ? Math.round(amount * 0.0015) : 0

    if (type === 'buy' || type === 'withdraw' || type === 'fee') {
      balance += amount + fee
    } else {
      balance -= amount - fee
    }

    transactions.push({
      id: `tx-${i}`,
      date: date.toISOString().split('T')[0],
      time: `${String(9 + Math.floor(Math.random() * 6)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      type,
      symbol: ['buy', 'sell'].includes(type) ? symbol : undefined,
      quantity: ['buy', 'sell'].includes(type) ? quantity : undefined,
      price: ['buy', 'sell'].includes(type) ? price : undefined,
      amount,
      fee: fee > 0 ? fee : undefined,
      balance,
      description: type === 'dividend' ? `Cổ tức ${symbol}` : type === 'deposit' ? 'Nạp tiền từ tài khoản ngân hàng' : type === 'withdraw' ? 'Rút tiền về tài khoản ngân hàng' : undefined,
    })
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const mockTransactions = generateTransactions(50)

export function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get data from store
  const {
    holdings,
    summary,
    performanceHistory,
    lastUpdated,
    refreshData,
    getBestPerformer,
    getWorstPerformer,
    getSectorAllocation,
    getDiversificationScore,
    getConcentrationWarnings,
  } = usePortfolioStore()

  // Compute derived data
  const bestPerformer = getBestPerformer()
  const worstPerformer = getWorstPerformer()
  const sectorAllocation = getSectorAllocation()
  const diversificationScore = getDiversificationScore()
  const warnings = getConcentrationWarnings()

  // Transform data for charts
  const performanceData = useMemo(() => {
    return performanceHistory.map((p) => ({
      time: p.date,
      portfolio: p.portfolioValue,
      benchmark: p.benchmarkValue,
    }))
  }, [performanceHistory])

  const sectorChartData = useMemo(() => {
    return sectorAllocation.map((s) => ({
      name: s.sector,
      value: s.value,
      percent: s.percent,
      color: s.color,
    }))
  }, [sectorAllocation])

  const stockChartData = useMemo(() => {
    return holdings.map((h, i) => ({
      name: h.symbol,
      value: h.marketValue,
      percent: h.weight,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }))
  }, [holdings])

  // Transform holdings for table
  const tableHoldings = useMemo(() => {
    return holdings.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      quantity: h.quantity,
      availableQuantity: h.availableQuantity,
      avgCost: h.avgCost,
      currentPrice: h.currentPrice,
      marketValue: h.marketValue,
      costBasis: h.costBasis,
      unrealizedPL: h.unrealizedPL,
      unrealizedPLPercent: h.unrealizedPLPercent,
      weight: h.weight,
      dayChange: h.dayChange,
      dayChangePercent: h.dayChangePercent,
    }))
  }, [holdings])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh with store update
    await new Promise((r) => setTimeout(r, 800))
    refreshData()
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Danh mục đầu tư"
        description={`Cập nhật lúc ${new Date(lastUpdated).toLocaleTimeString('vi-VN')}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 text-[13px] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5 mr-2', isRefreshing && 'animate-spin')}
              />
              Làm mới
            </Button>
            <ExportReport holdings={holdings} summary={summary} />
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      {/* Performance Cards */}
      <PerformanceCards
        summary={summary}
        bestPerformer={bestPerformer}
        worstPerformer={worstPerformer}
      />

      {/* Portfolio Summary */}
      <PortfolioSummary
        data={{
          totalValue: summary.totalValue,
          stockValue: summary.stockValue,
          cashBalance: summary.cashBalance,
          buyingPower: summary.buyingPower,
          pendingCash: summary.pendingCash,
          totalPL: summary.totalPL,
          totalPLPercent: summary.totalPLPercent,
          dailyPL: summary.dailyPL,
          dailyPLPercent: summary.dailyPLPercent,
          realizedPL: summary.realizedPL,
          unrealizedPL: summary.unrealizedPL,
        }}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[var(--color-bg-secondary)] p-1">
          <TabsTrigger value="overview" className="text-[12px]">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="holdings" className="text-[12px]">
            <PieChart className="h-3.5 w-3.5 mr-1.5" />
            Danh mục
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-[12px]">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Hiệu suất
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-[12px]">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Rủi ro
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[12px]">
            <History className="h-3.5 w-3.5 mr-1.5" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Holdings Table */}
          <HoldingsTable
            holdings={tableHoldings}
            totalValue={summary.stockValue}
          />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation Treemap */}
            <AllocationTreemap holdings={holdings} />

            {/* Sector Allocation */}
            <AllocationChart
              title="Phân bổ theo ngành"
              data={sectorChartData}
              type="sector"
            />
          </div>

          {/* Performance Chart */}
          <PerformanceChart
            data={performanceData}
            benchmarkName="VN-Index"
          />
        </TabsContent>

        {/* Holdings Tab */}
        <TabsContent value="holdings" className="space-y-6 mt-6">
          <HoldingsTable
            holdings={tableHoldings}
            totalValue={summary.stockValue}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AllocationBar
              title="Phân bổ theo ngành"
              data={sectorChartData}
            />
            <AllocationBar
              title="Phân bổ theo mã"
              data={stockChartData}
            />
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <PerformanceChart
            data={performanceData}
            benchmarkName="VN-Index"
            height={400}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AllocationChart
              title="Phân bổ theo ngành"
              data={sectorChartData}
              type="sector"
            />
            <AllocationChart
              title="Phân bổ theo mã"
              data={stockChartData}
              type="stock"
            />
          </div>
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AllocationTreemap holdings={holdings} />
            </div>
            <RiskAnalysis
              diversificationScore={diversificationScore}
              warnings={warnings}
              sectorAllocation={sectorAllocation}
              holdings={holdings}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AllocationChart
              title="Phân bổ theo ngành"
              data={sectorChartData}
              type="sector"
            />
            <AllocationBar
              title="Tỷ trọng ngành"
              data={sectorChartData}
            />
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <TransactionHistory transactions={mockTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
