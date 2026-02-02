import { Link, useLocation, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  User,
  Shield,
  Bell,
  Palette,
  Info,
  ChevronRight,
} from 'lucide-react'

const settingsNav = [
  { icon: User, label: 'Hồ sơ', href: '/settings/profile', description: 'Thông tin cá nhân' },
  { icon: Shield, label: 'Bảo mật', href: '/settings/security', description: 'Mật khẩu & xác thực' },
  { icon: Bell, label: 'Thông báo', href: '/settings/notifications', description: 'Tùy chỉnh cảnh báo' },
  { icon: Palette, label: 'Giao diện', href: '/settings/display', description: 'Theme & hiển thị' },
  { icon: Info, label: 'Giới thiệu', href: '/settings/about', description: 'Phiên bản & thông tin' },
]

export function SettingsLayout() {
  const location = useLocation()
  const isSettingsRoot = location.pathname === '/settings'

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - only show on desktop or settings root on mobile */}
      <div className={cn(!isSettingsRoot && 'hidden lg:block')}>
        <h1 className="text-xl lg:text-2xl font-bold text-[var(--color-text-primary)]">
          Cài đặt
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Quản lý tài khoản và tùy chỉnh ứng dụng
        </p>
      </div>

      {/* Desktop: Sidebar layout */}
      <div className="hidden lg:flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>

      {/* Mobile: Full width navigation or content */}
      <div className="lg:hidden">
        {isSettingsRoot ? (
          /* Mobile Settings Menu */
          <div className="space-y-2">
            {settingsNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl',
                  'bg-[var(--color-surface)] border border-[var(--color-border)]',
                  'active:bg-[var(--color-bg-tertiary)] transition-colors'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  'bg-[var(--color-brand)]/10'
                )}>
                  <item.icon className="h-5 w-5 text-[var(--color-brand)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {item.label}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)]" />
              </Link>
            ))}
          </div>
        ) : (
          /* Mobile Content */
          <Outlet />
        )}
      </div>
    </div>
  )
}
