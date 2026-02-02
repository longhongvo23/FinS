import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bell,
  CheckCheck,
  Sparkles,
  Newspaper,
  Settings,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Brain,
  Lightbulb,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { notificationService, type NotificationVM, type NotificationCategory } from '@/services/notification-service'

// Notification types - AI, News, and Price
type DisplayNotificationType = 'ai_prophet' | 'ai_research' | 'ai_insight' | 'news' | 'price'

interface DisplayNotification {
  id: string
  type: DisplayNotificationType
  title: string
  description: string
  read: boolean
  timestamp: Date
  actionUrl?: string
  category: NotificationCategory
  symbol?: string
}

const categoryToDisplayType = (category: NotificationCategory, title?: string): DisplayNotificationType => {
  if (category === 'NEWS') return 'news'
  if (category === 'PRICE') return 'price'
  // Determine AI sub-type from title
  if (title?.includes('Prophet') || title?.includes('Dự đoán')) return 'ai_prophet'
  if (title?.includes('Research') || title?.includes('Phân tích')) return 'ai_research'
  return 'ai_insight'
}

const mapToDisplayNotification = (notification: NotificationVM): DisplayNotification => {
  const title = notification.title || notification.subject || 'Thông báo'
  let symbol: string | undefined
  try {
    if (notification.metadata) {
      symbol = JSON.parse(notification.metadata).symbol
    }
  } catch {
    // metadata might not be valid JSON
  }
  return {
    id: notification.id,
    type: categoryToDisplayType(notification.category, title),
    title,
    description: notification.content || '',
    read: notification.isRead ?? notification.read ?? false,
    timestamp: new Date(notification.createdAt),
    category: notification.category,
    symbol,
  }
}

const getNotificationIcon = (type: DisplayNotificationType) => {
  switch (type) {
    case 'ai_prophet':
      return <TrendingUp className="h-4 w-4 text-brand" />
    case 'ai_research':
      return <Brain className="h-4 w-4 text-purple-500" />
    case 'ai_insight':
      return <Lightbulb className="h-4 w-4 text-yellow-500" />
    case 'news':
      return <Newspaper className="h-4 w-4 text-blue-500" />
    case 'price':
      return <DollarSign className="h-4 w-4 text-green-500" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getNotificationBg = (type: DisplayNotificationType) => {
  switch (type) {
    case 'ai_prophet':
      return 'bg-brand/10'
    case 'ai_research':
      return 'bg-purple-500/10'
    case 'ai_insight':
      return 'bg-yellow-500/10'
    case 'news':
      return 'bg-blue-500/10'
    case 'price':
      return 'bg-green-500/10'
    default:
      return 'bg-surface-2'
  }
}

// Map tab to backend category
const tabToCategory: Record<string, NotificationCategory | undefined> = {
  all: undefined,
  unread: undefined,
  ai: 'AI_INSIGHT',
  news: 'NEWS',
  price: 'PRICE',
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<DisplayNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({})

  const fetchNotifications = useCallback(async (tab: string, showRefreshToast = false) => {
    try {
      let data: NotificationVM[]

      if (tab === 'unread') {
        data = await notificationService.getUnreadNotifications({ size: 50 })
      } else {
        const category = tabToCategory[tab]
        data = await notificationService.getNotifications({ category, size: 50 })
      }

      const mapped = data.map(mapToDisplayNotification)
      setNotifications(mapped)

      if (showRefreshToast) {
        toast.success('Đã làm mới thông báo')
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Không thể tải thông báo')
    }
  }, [])

  const fetchCounts = useCallback(async () => {
    try {
      // Get unread count from API
      const unread = await notificationService.getUnreadCount()
      setUnreadCount(unread)

      // Get counts by fetching all notifications and counting
      const allNotifications = await notificationService.getNotifications({ size: 100 })
      const aiCount = allNotifications.filter(n => n.category === 'AI_INSIGHT').length
      const newsCount = allNotifications.filter(n => n.category === 'NEWS').length
      const priceCount = allNotifications.filter(n => n.category === 'PRICE').length
      setTabCounts({
        ai: aiCount,
        news: newsCount,
        price: priceCount,
      })
    } catch (error) {
      console.error('Failed to fetch counts:', error)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchNotifications(activeTab),
        fetchCounts(),
      ])
      setIsLoading(false)
    }
    load()
  }, [activeTab, fetchNotifications, fetchCounts])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      fetchNotifications(activeTab, true),
      fetchCounts(),
    ])
    setIsRefreshing(false)
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error('Không thể đánh dấu đã đọc')
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('Đã đánh dấu tất cả đã đọc')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Không thể đánh dấu tất cả đã đọc')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      toast.success('Đã xóa thông báo')
      await fetchCounts()
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Không thể xóa thông báo')
    }
  }

  const clearAll = async () => {
    try {
      await Promise.all(notifications.map(n => notificationService.deleteNotification(n.id)))
      setNotifications([])
      toast.success('Đã xóa tất cả thông báo')
      await fetchCounts()
    } catch (error) {
      console.error('Failed to clear all:', error)
      toast.error('Không thể xóa tất cả thông báo')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Bell className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Thông báo</h1>
            <p className="text-sm text-foreground-muted">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tất cả
              </DropdownMenuItem>
              <Link to="/settings/notifications">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt thông báo
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs - Simplified: All, Unread, AI, News */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="border-b border-border px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="all" className="data-[state=active]:bg-transparent">
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:bg-transparent">
                  Chưa đọc
                  {unreadCount > 0 && (
                    <Badge className="ml-2 text-xs bg-brand">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-transparent">
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI
                  {tabCounts.ai > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {tabCounts.ai}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="news" className="data-[state=active]:bg-transparent">
                  <Newspaper className="h-4 w-4 mr-1" />
                  Tin tức
                  {tabCounts.news > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {tabCounts.news}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="price" className="data-[state=active]:bg-transparent">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Giá
                  {tabCounts.price > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {tabCounts.price}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {notifications.length === 0 ? (
                <div className="py-16 text-center">
                  <Bell className="h-12 w-12 text-foreground-muted mx-auto mb-4 opacity-50" />
                  <p className="text-foreground-muted">Không có thông báo nào</p>
                  <p className="text-sm text-foreground-muted mt-1">
                    Thêm cổ phiếu vào danh sách theo dõi để nhận thông báo AI và tin tức
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-4 p-4 hover:bg-surface-2 transition-colors cursor-pointer',
                        !notification.read && 'bg-brand/5'
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl
                        }
                      }}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'p-2 rounded-lg shrink-0',
                          getNotificationBg(notification.type)
                        )}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={cn('font-medium', !notification.read && 'text-foreground')}>
                                {notification.title}
                              </p>
                              {notification.symbol && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.symbol}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground-muted mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-brand shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted mt-2">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <CheckCheck className="h-4 w-4 mr-2" />
                              Đánh dấu đã đọc
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="text-danger"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
