import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAIStore } from '@/stores/ai-store'

export function AIChatButton() {
  const { isChatOpen, toggleChat } = useAIStore()
  const location = useLocation()

  // Hide button when already on AI Chat page to avoid duplicate functionality
  if (location.pathname === '/ai-chat') {
    return null
  }

  return (
    <motion.button
      onClick={toggleChat}
      className={cn(
        'fixed z-40 right-4',
        // Higher on mobile to avoid floating nav, normal on desktop
        'bottom-24 lg:bottom-6',
        'w-[38px] h-[38px] rounded-full',
        'bg-gradient-to-br from-[var(--color-brand)] to-purple-500',
        'text-white shadow-lg',
        'flex items-center justify-center',
        'hover:shadow-xl hover:scale-105',
        'transition-all duration-200',
        // Hide on desktop when chat is open (panel takes its place)
        isChatOpen && 'lg:hidden'
      )}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 0.5 }}
    >
      {/* Pulse Animation */}
      {!isChatOpen && (
        <span className="absolute inset-0 rounded-full bg-[var(--color-brand)] animate-ping opacity-20" />
      )}

      {/* Icon */}
      <motion.div
        animate={{ rotate: isChatOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isChatOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </motion.div>

      {/* Tooltip - only show when closed */}
      {!isChatOpen && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className={cn(
            'absolute right-full mr-3 px-3 py-1.5 rounded-lg',
            'bg-[var(--color-surface)] border border-[var(--color-border)]',
            'text-[12px] font-medium text-[var(--color-text-primary)]',
            'whitespace-nowrap shadow-lg',
            'hidden lg:block'
          )}
        >
          Hỏi AI trợ lý
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-[var(--color-surface)] border-r border-t border-[var(--color-border)]" />
        </motion.div>
      )}
    </motion.button>
  )
}
