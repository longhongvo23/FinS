import { cn } from '@/lib/utils'

// Enhanced skeleton with shimmer effect
interface SkeletonShimmerProps {
  className?: string
}

export function SkeletonShimmer({ className }: SkeletonShimmerProps) {
  return (
    <div className={cn('relative overflow-hidden rounded', className)}>
      <div className="absolute inset-0 bg-[var(--color-bg-tertiary)]" />
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        }}
      />
    </div>
  )
}

// Stock card skeleton
export function StockCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <SkeletonShimmer className="h-6 w-16 mb-2" />
          <SkeletonShimmer className="h-4 w-24" />
        </div>
        <SkeletonShimmer className="h-6 w-12 rounded" />
      </div>

      {/* Price */}
      <div className="mb-4">
        <SkeletonShimmer className="h-8 w-32 mb-2" />
        <SkeletonShimmer className="h-4 w-24" />
      </div>

      {/* Chart */}
      <SkeletonShimmer className="h-12 w-full rounded-lg mb-4" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--color-border)]">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonShimmer className="h-3 w-8 mb-1" />
            <SkeletonShimmer className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Table skeleton
interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="border rounded-xl overflow-hidden border-[var(--color-border)]">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonShimmer key={i} className="h-3 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-[var(--color-border)] last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonShimmer key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SkeletonShimmer className="h-8 w-64 mb-2" />
          <SkeletonShimmer className="h-4 w-48" />
        </div>
        <SkeletonShimmer className="h-4 w-32" />
      </div>

      {/* Hero Card */}
      <div className="p-6 rounded-2xl border bg-[var(--color-surface)] border-[var(--color-border)]">
        <SkeletonShimmer className="h-3 w-32 mb-3" />
        <SkeletonShimmer className="h-10 w-64 mb-2" />
        <SkeletonShimmer className="h-5 w-48" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]"
          >
            <SkeletonShimmer className="h-3 w-16 mb-3" />
            <SkeletonShimmer className="h-7 w-24 mb-2" />
            <SkeletonShimmer className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton rows={5} columns={6} />
        </div>
        <div className="space-y-4">
          <SkeletonShimmer className="h-48 w-full rounded-xl" />
          <SkeletonShimmer className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Chat skeleton
export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Message from AI */}
      <div className="flex gap-3">
        <SkeletonShimmer className="h-8 w-8 rounded-lg shrink-0" />
        <div className="space-y-2 flex-1 max-w-[80%]">
          <SkeletonShimmer className="h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* Message from user */}
      <div className="flex gap-3 flex-row-reverse">
        <SkeletonShimmer className="h-8 w-8 rounded-lg shrink-0" />
        <div className="space-y-2 max-w-[60%]">
          <SkeletonShimmer className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Message from AI */}
      <div className="flex gap-3">
        <SkeletonShimmer className="h-8 w-8 rounded-lg shrink-0" />
        <div className="space-y-2 flex-1 max-w-[80%]">
          <SkeletonShimmer className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Alert card skeleton
export function AlertCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonShimmer className="h-5 w-12" />
            <SkeletonShimmer className="h-5 w-32" />
            <SkeletonShimmer className="h-5 w-16" />
          </div>
          <SkeletonShimmer className="h-4 w-full max-w-md" />
          <div className="flex items-center gap-4">
            <SkeletonShimmer className="h-3 w-16" />
            <SkeletonShimmer className="h-3 w-20" />
            <SkeletonShimmer className="h-3 w-24" />
          </div>
        </div>
        <SkeletonShimmer className="h-6 w-12" />
      </div>
    </div>
  )
}

// Research card skeleton
export function ResearchCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <SkeletonShimmer className="h-6 w-16 mb-2" />
          <SkeletonShimmer className="h-4 w-24" />
        </div>
        <SkeletonShimmer className="h-6 w-20" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <SkeletonShimmer className="h-3 w-16" />
            <SkeletonShimmer className="h-1.5 flex-1" />
            <SkeletonShimmer className="h-3 w-8" />
          </div>
        ))}
      </div>

      <SkeletonShimmer className="h-10 w-full rounded-lg" />
      <SkeletonShimmer className="h-12 w-full" />
    </div>
  )
}
