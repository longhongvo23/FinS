import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  PieChart,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/lib/formatters'
import type { PortfolioHolding, SectorAllocation } from '@/stores/portfolio-store'

interface RiskAnalysisProps {
  diversificationScore: number
  warnings: string[]
  sectorAllocation: SectorAllocation[]
  holdings: PortfolioHolding[]
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-[var(--color-positive)]'
    if (s >= 60) return 'text-[var(--color-brand)]'
    if (s >= 40) return 'text-[var(--color-warning)]'
    return 'text-[var(--color-negative)]'
  }

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Tốt'
    if (s >= 60) return 'Khá'
    if (s >= 40) return 'Trung bình'
    return 'Kém'
  }

  const getProgressColor = (s: number) => {
    if (s >= 80) return 'bg-[var(--color-positive)]'
    if (s >= 60) return 'bg-[var(--color-brand)]'
    if (s >= 40) return 'bg-[var(--color-warning)]'
    return 'bg-[var(--color-negative)]'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--color-text-secondary)]">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xl font-bold font-mono', getScoreColor(score))}>
            {score}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px]',
              score >= 60
                ? 'bg-[var(--color-positive)]/10 text-[var(--color-positive)]'
                : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
            )}
          >
            {getScoreLabel(score)}
          </Badge>
        </div>
      </div>
      <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getProgressColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function WarningsList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-positive)]/5 border border-[var(--color-positive)]/20">
        <Shield className="h-4 w-4 text-[var(--color-positive)]" />
        <span className="text-[13px] text-[var(--color-positive)]">
          Danh mục được phân bổ hợp lý
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-warning)]/5 border border-[var(--color-warning)]/20"
        >
          <AlertTriangle className="h-4 w-4 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
          <span className="text-[13px] text-[var(--color-text-secondary)]">{warning}</span>
        </div>
      ))}
    </div>
  )
}

function SectorExposure({ sectors }: { sectors: SectorAllocation[] }) {
  return (
    <div className="space-y-3">
      {sectors.slice(0, 6).map((sector) => (
        <div key={sector.sector} className="space-y-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-secondary)]">{sector.sector}</span>
            <span className="font-mono font-medium text-[var(--color-text-primary)]">
              {formatPercent(sector.percent)}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(sector.percent, 100)}%`,
                backgroundColor: sector.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RiskAnalysis({
  diversificationScore,
  warnings,
  sectorAllocation,
  holdings,
}: RiskAnalysisProps) {
  // Calculate additional risk metrics
  const metrics = useMemo(() => {
    if (holdings.length === 0) {
      return {
        volatilityScore: 0,
        concentrationRisk: 0,
        sectorDiversity: 0,
      }
    }

    // Concentration risk (based on top 3 holdings)
    const sortedByWeight = [...holdings].sort((a, b) => b.weight - a.weight)
    const top3Weight = sortedByWeight.slice(0, 3).reduce((sum, h) => sum + h.weight, 0)
    const concentrationRisk = Math.min(100, top3Weight)

    // Sector diversity (based on unique sectors)
    const uniqueSectors = new Set(holdings.map((h) => h.sector)).size
    const sectorDiversity = Math.min(100, uniqueSectors * 15)

    // Volatility score (simplified - based on avg absolute daily change)
    const avgAbsChange =
      holdings.reduce((sum, h) => sum + Math.abs(h.dayChangePercent), 0) / holdings.length
    const volatilityScore = Math.max(0, 100 - avgAbsChange * 20)

    return {
      volatilityScore: Math.round(volatilityScore),
      concentrationRisk: Math.round(concentrationRisk),
      sectorDiversity: Math.round(sectorDiversity),
    }
  }, [holdings])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Phân tích rủi ro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diversification Score */}
        <ScoreGauge score={diversificationScore} label="Chỉ số đa dạng hóa" />

        {/* Risk Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-center">
            <Activity className="h-4 w-4 mx-auto mb-1 text-[var(--color-text-muted)]" />
            <p className="text-lg font-bold font-mono text-[var(--color-text-primary)]">
              {metrics.volatilityScore}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Ổn định</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-center">
            <PieChart className="h-4 w-4 mx-auto mb-1 text-[var(--color-text-muted)]" />
            <p className="text-lg font-bold font-mono text-[var(--color-text-primary)]">
              {metrics.sectorDiversity}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Đa ngành</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-[var(--color-text-muted)]" />
            <p className="text-lg font-bold font-mono text-[var(--color-text-primary)]">
              {holdings.length}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Số mã</p>
          </div>
        </div>

        {/* Concentration Warnings */}
        <div className="space-y-2">
          <h4 className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Cảnh báo tập trung
          </h4>
          <WarningsList warnings={warnings} />
        </div>

        {/* Sector Exposure */}
        <div className="space-y-3">
          <h4 className="text-[12px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Phân bổ theo ngành
          </h4>
          <SectorExposure sectors={sectorAllocation} />
        </div>
      </CardContent>
    </Card>
  )
}
