import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Bell, CheckCheck, Settings, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { notificationService, type NotificationVM } from '@/services/notification-service'
import { toast } from 'sonner'

interface DisplayNotification {
  id: string
  type: 'price_alert' | 'ai_insight' | 'news' | 'system'
  title: string
  message: string
  symbol?: string
  isRead: boolean
  createdAt: string
}

// Map backend notification to display format
function mapNotification(n: NotificationVM): DisplayNotification {
  const subject = n.subject?.toLowerCase() || ''
  let type: DisplayNotification['type'] = 'system'
  let symbol: string | undefined = undefined

  if (subject.includes('price alert') || subject.includes('cảnh báo giá')) {
    type = 'price_alert'
    // Extract symbol from subject like "Price Alert: AAPL"
    const match = n.subject?.match(/:\s*(\w+)/)
    if (match) symbol = match[1]
  } else if (subject.includes('ai') || subject.includes('khuyến nghị')) {
    type = 'ai_insight'
  } else if (subject.includes('news') || subject.includes('tin')) {
    type = 'news'
  }

  return {
    id: n.id,
    type,
    title: n.subject || 'Thông báo',
    message: n.content || '',
    symbol,
    isRead: n.status === 'SENT' || n.read === true,
    createdAt: n.createdAt,
  }
}

interface NotificationItemProps {
  notification: DisplayNotification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: vi,
  })

  const getIcon = () => {
    switch (notification.type) {
      case 'price_alert':
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4 text-[var(--color-warning)]" />
          </div>
        )
      case 'ai_insight':
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--color-positive)]/10 flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4 text-[var(--color-positive)]" />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand)]/10 flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4 text-[var(--color-brand)]" />
          </div>
        )
    }
  }

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        !notification.isRead
          ? 'bg-[var(--color-brand)]/5 hover:bg-[var(--color-brand)]/10'
          : 'hover:bg-[var(--color-bg-tertiary)]'
      )}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-[13px] line-clamp-1',
              !notification.isRead
                ? 'font-medium text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)]'
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-[12px] text-[var(--color-text-muted)] line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-[var(--color-text-muted)]">{timeAgo}</span>
          {notification.symbol && (
            <Link
              to={`/stock/${notification.symbol}`}
              className="text-[11px] text-[var(--color-brand)] hover:underline flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {notification.symbol}
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(notification.id)
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-negative)] transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<DisplayNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const [data, count] = await Promise.all([
        notificationService.getNotifications({ size: 20 }),
        notificationService.getUnreadCount(),
      ])
      setNotifications(data.map(mapNotification))
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [])

  // Fetch notifications when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  // Poll for unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const count = await notificationService.getUnreadCount()
        setUnreadCount(count)
      } catch {
        // Ignore errors in background polling
      }
    }, 30000)

    // Initial fetch
    notificationService.getUnreadCount().then(setUnreadCount).catch(() => { })

    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Không thể đánh dấu tất cả đã đọc')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      const deleted = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await fetchNotifications()
    setIsLoading(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[var(--color-negative)] rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0 bg-[var(--color-surface)] border-[var(--color-border)]"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded">
                {unreadCount} mới
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-7 w-7 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              title="Làm mới"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkAllAsRead}
                className="h-7 w-7 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            <Link to="/notifications">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                title="Cài đặt thông báo"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[340px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-[var(--color-text-muted)]" />
              </div>
              <p className="text-[13px] text-[var(--color-text-muted)] text-center">
                Chưa có thông báo nào
              </p>
              <p className="text-[12px] text-[var(--color-text-muted)] text-center mt-1">
                Tạo cảnh báo giá để nhận thông báo khi giá đạt mức mong muốn
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1 group">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-center p-2 border-t border-[var(--color-border)]">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-[12px] text-[var(--color-brand)] hover:underline"
            >
              Xem tất cả thông báo
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
