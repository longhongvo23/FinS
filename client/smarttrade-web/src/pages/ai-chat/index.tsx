import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader } from '@/components/layout/page-header'
import { ChangeBadge } from '@/components/ui/price-display'
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Zap,
  Trash2,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  getRemainingQueries,
  hasReachedLimit,
} from '@/services/ai-service'
import { aitoolsService } from '@/services/aitools-service'
import { PremiumUpgradeModal } from '@/components/ai/premium-upgrade-modal'
import { useAuthStore } from '@/stores/auth-store'
import { useAIStore } from '@/stores/ai-store'
import { GuestRestricted } from '@/components/guest-restricted'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestedActions?: string[]
  relatedStocks?: string[]
  error?: boolean
}

// Mock stock data for cards - 7 tracked US tech stocks
const mockStockData: Record<string, { price: number; change: number; changePercent: number }> = {
  AAPL: { price: 242.65, change: 3.21, changePercent: 1.34 },
  NVDA: { price: 148.32, change: 5.45, changePercent: 3.81 },
  MSFT: { price: 438.50, change: 2.15, changePercent: 0.49 },
  AMZN: { price: 225.18, change: -1.82, changePercent: -0.80 },
  TSLA: { price: 412.85, change: 8.90, changePercent: 2.20 },
  META: { price: 612.40, change: 4.20, changePercent: 0.69 },
  GOOGL: { price: 196.75, change: -0.85, changePercent: -0.43 },
}

const quickActions = [
  'Phân tích AAPL',
  'So sánh NVDA vs AMD',
  'Cổ phiếu tech nào nên mua?',
  'Nhận định thị trường US hôm nay',
]

// Stock Card Component with Bloomberg styling
function StockCard({ symbol }: { symbol: string }) {
  const stock = mockStockData[symbol.toUpperCase()]
  if (!stock) return null

  return (
    <Link to={`/stock/${symbol.toUpperCase()}`}>
      <div className="p-3 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-brand)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-bold font-mono rounded bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
              {symbol.toUpperCase()}
            </span>
            <ChangeBadge percent={stock.changePercent} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[14px] tabular-nums text-[var(--color-text-primary)]">
              ${stock.price.toLocaleString()}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export function AIChatPage() {
  const { isGuest } = useAuthStore()

  // Show guest restriction if user is guest
  if (isGuest) {
    return <GuestRestricted featureName="AI Chat" />
  }

  // Use global store for messages persistence - subscribe to userChats and currentUserId for reactivity
  const currentUserId = useAIStore((state) => state.currentUserId)
  const userChats = useAIStore((state) => state.userChats)
  const isTyping = useAIStore((state) => state.isTyping)
  const addMessage = useAIStore((state) => state.addMessage)
  const storeClearMessages = useAIStore((state) => state.clearMessages)
  const setIsTyping = useAIStore((state) => state.setIsTyping)
  const setSessionId = useAIStore((state) => state.setSessionId)

  // Compute current user's messages from userChats
  const userId = currentUserId || 'anonymous'
  const currentUserChat = userChats[userId] || { messages: [], sessionId: null }
  const storeMessages = currentUserChat.messages
  const sessionId = currentUserChat.sessionId

  const [input, setInput] = useState('')
  const [remainingQueries, setRemainingQueries] = useState(getRemainingQueries())
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Convert store messages to page format with extra fields
  const messages: Message[] = storeMessages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    suggestedActions: msg.role === 'assistant' ? ['Phân tích thêm', 'Xem báo cáo chi tiết', 'So sánh với thị trường'] : undefined,
    relatedStocks: msg.role === 'assistant' ? extractStockSymbols(msg.content) : undefined,
  }))

  // Extract stock symbols from text
  function extractStockSymbols(text: string): string[] | undefined {
    const symbolMatches = text.match(/\b([A-Z]{2,5})\b/g) || []
    const symbols = [...new Set(symbolMatches)].slice(0, 5)
    return symbols.length > 0 ? symbols : undefined
  }

  // Scroll to bottom when new message added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [storeMessages, isTyping])

  // Update remaining queries
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingQueries(getRemainingQueries())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isTyping) return

    // Check usage limit
    if (hasReachedLimit()) {
      setShowPremiumModal(true)
      return
    }

    // Add user message to store
    addMessage({ role: 'user', content: text })
    setInput('')
    setIsTyping(true)

    try {
      // Try aitoolsService (Gemini) first
      const response = await aitoolsService.chat(text, sessionId || undefined)

      // Store sessionId for context continuity
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId)
      }
      setRemainingQueries(getRemainingQueries())

      // Add AI response to store
      addMessage({ role: 'assistant', content: response.response })
    } catch (error) {
      console.error('AI Chat error:', error)

      const errorContent = 'Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.'
      addMessage({ role: 'assistant', content: errorContent })
      toast.error('Không thể kết nối tới AI Service')
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action: string) => {
    handleSend(action)
  }

  const handleRetry = () => {
    const lastUserMessage = [...storeMessages].reverse().find((m) => m.role === 'user')
    if (lastUserMessage) {
      handleSend(lastUserMessage.content)
    }
  }

  const handleNewChat = () => {
    storeClearMessages()
  }

  const handleClearHistory = () => {
    storeClearMessages()
    toast.success('Đã xóa lịch sử chat')
  }

  // Format message content with markdown-like parsing
  const formatContent = (content: string) => {
    return content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-[var(--color-brand)]">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      {/* Header */}
      <PageHeader
        title="AI Assistant"
        description="Powered by GPT-4o-mini"
        actions={
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-8 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Xóa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewChat}
                  className="h-8 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Mới
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Chat Container */}
      <div className="flex-1 flex flex-col rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="p-4 rounded-2xl bg-[var(--color-brand)]/10 mb-4">
                <Sparkles className="h-8 w-8 text-[var(--color-brand)]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2">
                Xin chào! Tôi là SmartTrade AI
              </h3>
              <p className="text-[13px] text-[var(--color-text-muted)] max-w-[360px] mb-6">
                Tôi có thể giúp bạn phân tích cổ phiếu, đề xuất đầu tư, và trả
                lời các câu hỏi về thị trường chứng khoán Việt Nam
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[12px] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-strong)]"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg shrink-0 h-fit',
                      message.role === 'user'
                        ? 'bg-[var(--color-brand)]/10'
                        : 'bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-[var(--color-brand)]" />
                    ) : (
                      <Bot className="h-4 w-4 text-[var(--color-text-muted)]" />
                    )}
                  </div>
                  <div className={cn('max-w-[80%] space-y-2')}>
                    <div
                      className={cn(
                        'p-3 rounded-lg',
                        message.role === 'user'
                          ? 'bg-[var(--color-brand)] text-white'
                          : message.error
                            ? 'bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/20'
                            : 'bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      {message.error && (
                        <div className="flex items-center gap-2 mb-2 text-[var(--color-negative)]">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-[12px] font-medium">Lỗi</span>
                        </div>
                      )}
                      <p className="text-[13px] whitespace-pre-wrap leading-relaxed">
                        {formatContent(message.content)}
                      </p>
                    </div>

                    {/* Stock Cards */}
                    {message.relatedStocks && message.relatedStocks.length > 0 && (
                      <div className="space-y-2">
                        {message.relatedStocks.slice(0, 3).map((symbol) => (
                          <StockCard key={symbol} symbol={symbol} />
                        ))}
                        {message.relatedStocks.length > 3 && (
                          <div className="flex flex-wrap gap-2">
                            {message.relatedStocks.slice(3).map((symbol) => (
                              <Link key={symbol} to={`/market/${symbol}`}>
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer transition-colors">
                                  <TrendingUp className="h-3 w-3" />
                                  {symbol}
                                  <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)]" />
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggested Actions */}
                    {message.suggestedActions &&
                      message.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.suggestedActions.map((action, i) => (
                            <Button
                              key={i}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                              onClick={() => handleSend(action)}
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      )}

                    {/* Retry button for error */}
                    {message.error && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="mt-2 h-7 text-[11px] border-[var(--color-border)]"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Thử lại
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <Bot className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-bounce" />
                      <div
                        className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          {hasReachedLimit() && (
            <div className="mb-3 p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20">
              <div className="flex items-center gap-2 text-[var(--color-warning)]">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[13px] font-medium">Bạn đã hết lượt hỏi AI hôm nay</span>
              </div>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                Nâng cấp Premium để không giới hạn câu hỏi và mở khóa tất cả
                tính năng AI.
              </p>
              <Button
                size="sm"
                className="mt-2 h-7 text-[11px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90"
                onClick={() => setShowPremiumModal(true)}
              >
                <Crown className="h-3 w-3 mr-1" />
                Nâng cấp Premium
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Hỏi AI về thị trường chứng khoán..."
              className="flex-1 h-10 text-[13px] bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] placeholder:text-[var(--color-text-muted)]"
              disabled={isTyping || hasReachedLimit()}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping || hasReachedLimit()}
              className="h-10 w-10 bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-2">
            AI có thể mắc lỗi. Các phân tích chỉ mang tính chất tham khảo.
          </p>
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
        trigger={hasReachedLimit() ? 'limit_reached' : 'manual'}
      />
    </div>
  )
}
