import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './button'
import {
  Search,
  TrendingUp,
  Bell,
  MessageSquare,
  Briefcase,
  FileText,
  Star,
  BarChart3,
} from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {/* Illustration */}
      {icon ? (
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-6">
          <div className="text-[var(--color-text-muted)]">{icon}</div>
        </div>
      ) : (
        <EmptyIllustration className="w-32 h-32 mb-6" />
      )}

      {/* Content */}
      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[13px] text-[var(--color-text-muted)] max-w-sm mb-6">
        {description}
      </p>

      {/* Action */}
      {action && (
        <Button
          onClick={action.onClick}
          size="sm"
          className="h-8 text-[13px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

// Simple SVG illustration
function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn('text-[var(--color-border)]', className)}
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <rect
        x="35"
        y="40"
        width="50"
        height="35"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="40"
        y1="50"
        x2="80"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="40"
        y1="58"
        x2="70"
        y2="58"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="40"
        y1="66"
        x2="60"
        y2="66"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

// Pre-configured empty states
export function EmptyWatchlist({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<Star className="w-8 h-8" />}
      title="Chưa có mã theo dõi"
      description="Thêm cổ phiếu vào danh sách theo dõi để nhận thông báo và phân tích AI."
      action={{ label: 'Thêm mã đầu tiên', onClick: onAdd }}
    />
  )
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8" />}
      title="Không tìm thấy kết quả"
      description="Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại bộ lọc."
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8" />}
      title="Không có thông báo"
      description="Bạn sẽ nhận được thông báo khi có tin quan trọng hoặc cảnh báo giá."
    />
  )
}

export function EmptyChatHistory() {
  return (
    <EmptyState
      icon={<MessageSquare className="w-8 h-8" />}
      title="Bắt đầu cuộc trò chuyện"
      description="Hỏi AI về thị trường, phân tích cổ phiếu, hoặc xin tư vấn đầu tư."
    />
  )
}

export function EmptyPortfolio({ onAddStock }: { onAddStock: () => void }) {
  return (
    <EmptyState
      icon={<Briefcase className="w-8 h-8" />}
      title="Danh mục trống"
      description="Bắt đầu xây dựng danh mục đầu tư bằng cách mua cổ phiếu đầu tiên."
      action={{ label: 'Mua cổ phiếu', onClick: onAddStock }}
    />
  )
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<TrendingUp className="w-8 h-8" />}
      title="Chưa có lệnh nào"
      description="Lệnh mua/bán của bạn sẽ hiển thị ở đây."
    />
  )
}

export function EmptyAlerts({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8" />}
      title="Chưa có alert nào"
      description="Tạo alert để nhận thông báo khi cổ phiếu đạt điều kiện bạn đặt ra."
      action={{ label: 'Tạo Alert đầu tiên', onClick: onCreate }}
    />
  )
}

export function EmptyReports() {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8" />}
      title="Chưa có báo cáo"
      description="Chọn một mã cổ phiếu để xem báo cáo phân tích chi tiết."
    />
  )
}

export function EmptyChart() {
  return (
    <EmptyState
      icon={<BarChart3 className="w-8 h-8" />}
      title="Chưa có dữ liệu"
      description="Dữ liệu biểu đồ sẽ hiển thị khi có giao dịch."
    />
  )
}
