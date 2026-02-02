import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface QuickStatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: string
}

export function QuickStatCard({
  title,
  value,
  icon: Icon,
  color,
}: QuickStatCardProps) {
  const colorClass = color === 'text-success'
    ? 'text-[var(--color-positive)]'
    : color === 'text-warning'
      ? 'text-[var(--color-warning)]'
      : 'text-[var(--color-brand)]'

  return (
    <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-1">
            {title}
          </p>
          <p className="text-xl font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
            {value}
          </p>
        </div>
        <Icon className={cn('h-7 w-7', colorClass)} />
      </div>
    </div>
  )
}
