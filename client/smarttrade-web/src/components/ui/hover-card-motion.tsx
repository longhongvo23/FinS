import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HoverCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function HoverCard({ children, className, onClick }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border cursor-pointer',
        'bg-[var(--color-surface)] border-[var(--color-border)]',
        'transition-colors',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Interactive list item with hover effect
interface HoverListItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function HoverListItem({ children, className, onClick }: HoverListItemProps) {
  return (
    <motion.div
      whileHover={{
        backgroundColor: 'var(--color-bg-tertiary)',
        x: 2,
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={cn(
        'rounded-lg cursor-pointer transition-colors',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// Button with scale animation
interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function AnimatedButton({
  children,
  className,
  onClick,
  disabled,
}: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  )
}

// Pulse animation for notifications/badges
interface PulseProps {
  children: React.ReactNode
  className?: string
  active?: boolean
}

export function Pulse({ children, className, active = true }: PulseProps) {
  return (
    <motion.div
      animate={
        active
          ? {
              scale: [1, 1.05, 1],
            }
          : undefined
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Shake animation for errors
interface ShakeProps {
  children: React.ReactNode
  className?: string
  trigger?: boolean
}

export function Shake({ children, className, trigger }: ShakeProps) {
  return (
    <motion.div
      animate={
        trigger
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : undefined
      }
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
