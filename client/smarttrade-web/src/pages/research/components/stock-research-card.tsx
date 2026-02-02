import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

interface StockResearchCardProps {
  research: {
    symbol: string
    ai_rating: string
    confidence_score: number
    financial_health_score: number
    technical_score: number
    sentiment_score: number
    executive_summary: string
    current_price: number
    price_target_mid: number
    risks: string[]
    opportunities: string[]
  }
  onClick: () => void
}

const ratingConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string; icon: typeof TrendingUp | null }
> = {
  strong_buy: {
    label: 'MUA MẠNH',
    bgColor: 'bg-[var(--color-positive)]',
    textColor: 'text-white',
    icon: TrendingUp,
  },
  buy: {
    label: 'MUA',
    bgColor: 'bg-[var(--color-positive)]/80',
    textColor: 'text-white',
    icon: TrendingUp,
  },
  hold: {
    label: 'GIỮ',
    bgColor: 'bg-[var(--color-warning)]',
    textColor: 'text-black',
    icon: null,
  },
  sell: {
    label: 'BÁN',
    bgColor: 'bg-[var(--color-negative)]/80',
    textColor: 'text-white',
    icon: TrendingDown,
  },
  strong_sell: {
    label: 'BÁN MẠNH',
    bgColor: 'bg-[var(--color-negative)]',
    textColor: 'text-white',
    icon: TrendingDown,
  },
}

export function StockResearchCard({
  research,
  onClick,
}: StockResearchCardProps) {
  const rating = ratingConfig[research.ai_rating] || ratingConfig.hold
  const upside =
    ((research.price_target_mid - research.current_price) /
      research.current_price) *
    100

  return (
    <div
      className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-brand)]/50 transition-colors cursor-pointer space-y-4"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            {research.symbol}
          </h3>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Confidence: {research.confidence_score}%
          </p>
        </div>

        <span
          className={cn(
            'px-2 py-0.5 text-[10px] font-bold rounded',
            rating.bgColor,
            rating.textColor
          )}
        >
          {rating.label}
        </span>
      </div>

      {/* Scores */}
      <div className="space-y-2">
        <ScoreBar label="Tài chính" score={research.financial_health_score} />
        <ScoreBar label="Kỹ thuật" score={research.technical_score} />
        <ScoreBar label="Sentiment" score={research.sentiment_score} />
      </div>

      {/* Price Target */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg-tertiary)]">
        <span className="text-[11px] text-[var(--color-text-muted)]">Target Price</span>
        <div className="text-right">
          <span className="font-mono font-bold text-[13px] text-[var(--color-text-primary)]">
            {formatCurrency(research.price_target_mid)}
          </span>
          <span
            className={cn(
              'text-[11px] font-medium ml-2',
              upside > 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
            )}
          >
            ({upside > 0 ? '+' : ''}
            {upside.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-[12px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
        {research.executive_summary}
      </p>

      {/* Quick Info */}
      <div className="flex items-center gap-2">
        {research.opportunities?.length > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded border border-[var(--color-positive)]/30 text-[var(--color-positive)] bg-[var(--color-positive)]/10">
            {research.opportunities.length} cơ hội
          </span>
        )}
        {research.risks?.length > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded border border-[var(--color-warning)]/30 text-[var(--color-warning)] bg-[var(--color-warning)]/10">
            {research.risks.length} rủi ro
          </span>
        )}
      </div>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--color-text-muted)] w-16">{label}</span>
      <Progress value={score} className="h-1.5 flex-1" />
      <span className="text-[10px] font-mono font-medium w-8 text-right text-[var(--color-text-secondary)]">
        {score}
      </span>
    </div>
  )
}
