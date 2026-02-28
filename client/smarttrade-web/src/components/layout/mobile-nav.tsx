import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
// motion import removed - not used
import { cn } from '@/lib/utils'
import {
  Home,
  BarChart3,
  MessageSquare,
  Star,
  Settings,
  Bell,
  Brain,
  Newspaper,
  LucideIcon,
  Sparkles,
} from 'lucide-react'

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  badge?: number
}

// All navigation items - matching sidebar menu
const navItems: NavItem[] = [
  { icon: Home, label: 'Tổng quan', href: '/dashboard' },
  { icon: BarChart3, label: 'Thị trường', href: '/market' },
  { icon: Star, label: 'Watchlist', href: '/watchlist' },
  { icon: Newspaper, label: 'Tin tức', href: '/news' },
  { icon: MessageSquare, label: 'AI Chat', href: '/ai-chat' },
  { icon: Sparkles, label: 'AI Insights', href: '/insights' },
  { icon: Brain, label: 'Research', href: '/research' },
  { icon: Bell, label: 'Thông báo', href: '/notifications', badge: 3 },
  { icon: Settings, label: 'Cài đặt', href: '/settings' },
]

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Find active index to auto-scroll
  const activeIndex = navItems.findIndex(
    item => location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  )

  return (
    <nav
      className={cn(
        'fixed bottom-4 left-3 right-3 z-50',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      {/* Floating pill container */}
      <div
        className={cn(
          'bg-[var(--color-surface)]/95 backdrop-blur-lg',
          'border border-[var(--color-border)]',
          'rounded-2xl shadow-lg shadow-black/10',
          'overflow-hidden'
        )}
      >
        {/* Scrollable nav items */}
        <div
          ref={scrollRef}
          className={cn(
            'flex items-center gap-1 px-2 py-2',
            'overflow-x-auto scrollbar-hide',
            'scroll-smooth snap-x snap-mandatory'
          )}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.href ||
              location.pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5',
                  'min-w-[60px] px-2 py-1.5 rounded-xl',
                  'transition-all duration-200 snap-center',
                  'active:scale-95',
                  isActive
                    ? 'bg-[var(--color-brand)] text-white'
                    : 'text-[var(--color-text-tertiary)] active:bg-[var(--color-bg-tertiary)]'
                )}
              >
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {/* Badge */}
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center text-[8px] font-bold bg-[var(--color-negative)] text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center gap-1 pb-1.5">
          {Array.from({ length: Math.ceil(navItems.length / 5) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1 h-1 rounded-full transition-colors',
                Math.floor(activeIndex / 5) === i
                  ? 'bg-[var(--color-brand)]'
                  : 'bg-[var(--color-border)]'
              )}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
