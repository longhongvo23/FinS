import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OnlineIndicatorProps {
  status: 'online' | 'offline' | 'loading'
  label?: string
  className?: string
}

export function OnlineIndicator({
  status,
  label,
  className,
}: OnlineIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            status === 'online' && 'bg-[var(--color-positive)]',
            status === 'offline' && 'bg-[var(--color-text-muted)]',
            status === 'loading' && 'bg-[var(--color-warning)]'
          )}
        />

        {status === 'online' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--color-positive)]"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {label && (
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {label}
        </span>
      )}
    </div>
  )
}

// Live indicator with pulse dot
interface LiveIndicatorProps {
  className?: string
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-[var(--color-positive)]" />
        <motion.div
          className="absolute inset-0 rounded-full bg-[var(--color-positive)]"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-positive)]">
        Live
      </span>
    </div>
  )
}

// Market status indicator
interface MarketStatusProps {
  isOpen: boolean
  className?: string
}

export function MarketStatus({ isOpen, className }: MarketStatusProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md',
        isOpen
          ? 'bg-[var(--color-positive)]/10'
          : 'bg-[var(--color-text-muted)]/10',
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isOpen ? 'bg-[var(--color-positive)]' : 'bg-[var(--color-text-muted)]'
          )}
        />
        {isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--color-positive)]"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      <span
        className={cn(
          'text-[10px] font-medium',
          isOpen ? 'text-[var(--color-positive)]' : 'text-[var(--color-text-muted)]'
        )}
      >
        {isOpen ? 'Đang giao dịch' : 'Đóng cửa'}
      </span>
    </div>
  )
}
