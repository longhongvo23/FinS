import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Trash2, Sparkles, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAIStore } from '@/stores/ai-store'
import { useAIChat } from '@/hooks/use-ai-chat'
import { ChatMessage, TypingIndicator } from './chat-message'
import { QuickQuestions } from './quick-questions'

export function AIChatPanel() {
  const { isChatOpen, closeChat } = useAIStore()
  const { messages, isTyping, sendMessage, clearMessages } = useAIChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Focus input when panel opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isChatOpen])

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 flex flex-col',
              'bg-[var(--color-surface)] border-l border-[var(--color-border)]',
              // Mobile: Full screen
              'inset-0',
              // Desktop: Side panel
              'lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-[400px]',
              'shadow-2xl'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                    SmartTrade AI
                  </h2>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Trợ lý đầu tư thông minh
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearMessages}
                    className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-negative)]"
                    title="Xóa lịch sử chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeChat}
                  className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-5 w-5 lg:hidden" />
                  <Minimize2 className="h-4 w-4 hidden lg:block" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="space-y-6">
                  {/* Welcome Message */}
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-purple-500 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)] mb-2">
                      Xin chào! 👋
                    </h3>
                    <p className="text-[13px] text-[var(--color-text-muted)] max-w-[280px] mx-auto">
                      Tôi là trợ lý AI của SmartTrade. Hãy hỏi tôi về thị trường, cổ phiếu, hoặc danh mục đầu tư của bạn.
                    </p>
                  </div>

                  {/* Quick Questions */}
                  <QuickQuestions onSelect={handleQuickQuestion} />
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-border)]">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isTyping}
                  className="flex-1 h-11 text-[14px] bg-[var(--color-bg-secondary)] border-[var(--color-border)] focus:border-[var(--color-brand)]"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="h-11 w-11 p-0 bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-2">
                AI có thể đưa ra thông tin không chính xác. Hãy xác minh lại trước khi quyết định.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
