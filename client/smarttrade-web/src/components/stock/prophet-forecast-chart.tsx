import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    Brain,
    AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { aiService, ForecastChartData } from '@/services/ai-service'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Legend,
    ReferenceLine,
} from 'recharts'

interface ProphetForecastChartProps {
    symbol: string
    forecastDays?: number
    historyDays?: number
}

const RECOMMENDATION_COLORS = {
    STRONG_BUY: 'var(--color-positive)',
    BUY: '#22c55e',
    HOLD: 'var(--color-warning)',
    SELL: '#f97316',
    STRONG_SELL: 'var(--color-negative)',
}

const RECOMMENDATION_LABELS = {
    STRONG_BUY: 'Mua mạnh',
    BUY: 'Mua',
    HOLD: 'Giữ',
    SELL: 'Bán',
    STRONG_SELL: 'Bán mạnh',
}

export function ProphetForecastChart({
    symbol,
    forecastDays = 30,
    historyDays = 90,
}: ProphetForecastChartProps) {
    const [data, setData] = useState<ForecastChartData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchForecast = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await aiService.getForecastChart(symbol, forecastDays, historyDays)
            setData(result)
        } catch (err) {
            console.error('Failed to fetch forecast:', err)
            setError('Không thể tải dự đoán. Có thể chưa đủ dữ liệu lịch sử.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchForecast()
    }, [symbol, forecastDays, historyDays])

    // Process chart data
    const chartData = useMemo(() => {
        if (!data?.data) return []
        return data.data.map((point) => ({
            ...point,
            // Format date for display
            displayDate: new Date(point.date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
            }),
        }))
    }, [data])

    // Find the boundary between historical and forecast
    const forecastStartIndex = useMemo(() => {
        if (!chartData.length) return 0
        return chartData.findIndex((point) => point.actual === null)
    }, [chartData])

    const RecommendationIcon = data?.recommendation?.includes('BUY')
        ? TrendingUp
        : data?.recommendation?.includes('SELL')
            ? TrendingDown
            : Minus

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-[var(--color-brand)]" />
                        <Skeleton className="h-5 w-40" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-[var(--color-brand)]" />
                            <CardTitle className="text-base">Dự đoán AI Prophet</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchForecast}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <AlertCircle className="h-12 w-12 text-[var(--color-text-muted)] mb-3" />
                        <p className="text-sm text-[var(--color-text-muted)]">{error}</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={fetchForecast}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Thử lại
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data) return null

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-[var(--color-brand)]" />
                        <CardTitle className="text-base">Dự đoán AI Prophet</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchForecast}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Giá hiện tại</p>
                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                            ${data.current_price.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Dự đoán ({data.forecast_days} ngày)
                        </p>
                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                            ${data.predicted_price.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Thay đổi dự kiến</p>
                        <p
                            className={cn(
                                'text-lg font-bold',
                                data.change_percent >= 0
                                    ? 'text-[var(--color-positive)]'
                                    : 'text-[var(--color-negative)]'
                            )}
                        >
                            {data.change_percent >= 0 ? '+' : ''}
                            {data.change_percent.toFixed(2)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Khuyến nghị</p>
                        <div className="flex items-center gap-1">
                            <RecommendationIcon
                                className="h-4 w-4"
                                style={{ color: RECOMMENDATION_COLORS[data.recommendation] }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: RECOMMENDATION_COLORS[data.recommendation] }}
                            >
                                {RECOMMENDATION_LABELS[data.recommendation]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--color-border)"
                                opacity={0.5}
                            />
                            <XAxis
                                dataKey="displayDate"
                                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                                tickLine={false}
                                axisLine={{ stroke: 'var(--color-border)' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                                tickLine={false}
                                axisLine={{ stroke: 'var(--color-border)' }}
                                tickFormatter={(value) => `$${value}`}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                labelStyle={{ color: 'var(--color-text-primary)' }}
                                formatter={(value, name) => {
                                    if (value === null || value === undefined) return ['-', name]
                                    const numValue = typeof value === 'number' ? value : parseFloat(String(value))
                                    const label =
                                        name === 'actual'
                                            ? 'Thực tế'
                                            : name === 'predicted'
                                                ? 'Dự đoán'
                                                : name === 'upper'
                                                    ? 'Biên trên'
                                                    : 'Biên dưới'
                                    return [`$${numValue.toFixed(2)}`, label]
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: '11px' }}
                                formatter={(value) => {
                                    const labels: Record<string, string> = {
                                        actual: 'Giá thực tế',
                                        predicted: 'Dự đoán',
                                        upper: 'Biên trên',
                                        lower: 'Biên dưới',
                                    }
                                    return labels[value] || value
                                }}
                            />

                            {/* Confidence interval area */}
                            <Area
                                type="monotone"
                                dataKey="upper"
                                stroke="transparent"
                                fill="url(#confidenceGradient)"
                                connectNulls={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="lower"
                                stroke="transparent"
                                fill="var(--color-surface)"
                                connectNulls={false}
                            />

                            {/* Actual price line */}
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="var(--color-text-primary)"
                                strokeWidth={2}
                                dot={false}
                                connectNulls={false}
                                name="actual"
                            />

                            {/* Predicted price line */}
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="var(--color-brand)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                connectNulls={false}
                                name="predicted"
                            />

                            {/* Reference line at forecast start */}
                            {forecastStartIndex > 0 && (
                                <ReferenceLine
                                    x={chartData[forecastStartIndex]?.displayDate}
                                    stroke="var(--color-warning)"
                                    strokeDasharray="3 3"
                                    label={{
                                        value: 'Dự đoán',
                                        position: 'top',
                                        fill: 'var(--color-warning)',
                                        fontSize: 10,
                                    }}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Footer note */}
                <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                    Dự đoán sử dụng mô hình Prophet. Kết quả chỉ mang tính tham khảo, không phải lời khuyên đầu tư.
                </p>
            </CardContent>
        </Card>
    )
}
