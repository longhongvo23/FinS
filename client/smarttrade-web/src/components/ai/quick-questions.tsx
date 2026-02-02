import { TrendingUp, Briefcase, GitCompare, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickQuestionsProps {
  onSelect: (question: string) => void
}

const quickQuestions = [
  {
    icon: TrendingUp,
    label: 'Thị trường hôm nay',
    question: 'Tóm tắt thị trường hôm nay như thế nào?',
    color: 'text-[var(--color-positive)]',
    bgColor: 'bg-[var(--color-positive)]/10',
  },
  {
    icon: Briefcase,
    label: 'Danh mục của tôi',
    question: 'Phân tích danh mục đầu tư của tôi',
    color: 'text-[var(--color-brand)]',
    bgColor: 'bg-[var(--color-brand)]/10',
  },
  {
    icon: GitCompare,
    label: 'So sánh mã',
    question: 'So sánh VNM và VCB cho tôi',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Lightbulb,
    label: 'Gợi ý mua',
    question: 'Cổ phiếu nào đáng mua tuần này?',
    color: 'text-[var(--color-warning)]',
    bgColor: 'bg-[var(--color-warning)]/10',
  },
]

export function QuickQuestions({ onSelect }: QuickQuestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        Câu hỏi gợi ý
      </p>
      <div className="grid grid-cols-2 gap-2">
        {quickQuestions.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.question)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-left transition-all',
              'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]',
              'border border-transparent hover:border-[var(--color-border)]'
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', item.bgColor)}>
              <item.icon className={cn('h-4 w-4', item.color)} />
            </div>
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
