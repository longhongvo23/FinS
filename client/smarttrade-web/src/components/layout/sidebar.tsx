import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  PieChart,
  MessageSquare,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  Brain,
  Sparkles,
  Newspaper,
  User,
  LogOut,
  ChevronUp,
  LucideIcon,
  BarChart3,
} from 'lucide-react'
import { notificationService } from '@/services/notification-service'

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  premium?: boolean
  badge?: number
  matchPath?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// Grouped navigation with Bloomberg-style sections
const navGroups: NavGroup[] = [
  {
    label: 'CHÍNH',
    items: [
      { icon: Home, label: 'Trang chủ', href: '/dashboard' },
      { icon: BarChart3, label: 'Thị trường', href: '/market' },
      { icon: Star, label: 'Watchlist', href: '/watchlist' },
      { icon: Newspaper, label: 'Tin tức', href: '/news' },
    ],
  },
  {
    label: 'AI TOOLS',
    items: [
      { icon: MessageSquare, label: 'AI Chat', href: '/ai-chat' },
      { icon: Sparkles, label: 'AI Insights', href: '/insights' },
      { icon: Brain, label: 'AI Research', href: '/research' },
    ],
  },
  {
    label: 'HỆ THỐNG',
    items: [
      { icon: Bell, label: 'Thông báo', href: '/notifications' },
      { icon: Settings, label: 'Cài đặt', href: '/settings', matchPath: '/settings' },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user, signOut } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread count from API only when user is logged in
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount()
        setUnreadCount(count)
      } catch {
        // Silently fail - don't show badge if can't fetch
        setUnreadCount(0)
      }
    }

    fetchUnreadCount()

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col',
        'bg-[var(--color-surface)] border-r border-[var(--color-border)]',
        'transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
        {!sidebarCollapsed && (
          <Link to="/dashboard">
            <Logo size="md" hideIcon />
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="flex justify-center w-full">
            <Link to="/dashboard">
              <Logo iconOnly size="sm" hideIcon />
            </Link>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && 'mt-4')}>
            {/* Section Label */}
            {!sidebarCollapsed && (
              <div className="px-4 mb-2">
                <span className="text-[10px] font-medium tracking-[0.1em] text-[var(--color-text-muted)]">
                  {group.label}
                </span>
              </div>
            )}

            {/* Items */}
            <div className="px-2 space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.matchPath
                  ? location.pathname.startsWith(item.matchPath)
                  : location.pathname === item.href || location.pathname.startsWith(item.href + '/')

                // Check if this is the notifications item
                const isNotificationItem = item.href === '/notifications'
                const badgeCount = isNotificationItem ? unreadCount : item.badge

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg relative group',
                      'transition-all duration-150',
                      isActive
                        ? 'text-[var(--color-brand)] font-medium'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--color-brand)] rounded-r" />
                    )}

                    <item.icon className={cn(
                      'h-[18px] w-[18px] flex-shrink-0',
                      isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
                    )} />

                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-[13px]">{item.label}</span>
                        {item.premium && (
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wide bg-[var(--color-brand)]/10 text-[var(--color-brand)] rounded">
                            PRO
                          </span>
                        )}
                        {badgeCount !== undefined && badgeCount > 0 && (
                          <span className="px-1.5 min-w-[18px] text-center py-0.5 text-[9px] font-semibold bg-[var(--color-negative)] text-white rounded-full">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && badgeCount !== undefined && badgeCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-negative)] rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg',
                'hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer',
                'focus:outline-none focus:ring-0'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[var(--color-brand)] font-medium text-sm">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align={sidebarCollapsed ? 'center' : 'start'}
            className="w-56 mb-2 bg-[var(--color-surface)] border-[var(--color-border)]"
          >
            <div className="px-3 py-2">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {user?.email || 'user@example.com'}
              </p>
            </div>

            <DropdownMenuSeparator className="bg-[var(--color-border)]" />

            <DropdownMenuItem asChild className="text-[13px] cursor-pointer">
              <Link to="/settings/profile">
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="text-[13px] cursor-pointer">
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[var(--color-border)]" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-[13px] cursor-pointer text-[var(--color-negative)] focus:text-[var(--color-negative)]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
