import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileHeader } from './mobile-header'
import { MobileNav } from './mobile-nav'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { AIChatButton, AIChatPanel } from '@/components/ai'

// Page titles for mobile header
const pageTitles: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/portfolio': 'Danh mục',
  '/watchlist': 'Watchlist',
  '/news': 'Tin tức',
  '/ai-chat': 'AI Chat',
  '/research': 'AI Research',
  '/insights': 'AI Insights',
  '/alerts': 'Thông báo', // Redirects to notifications
  '/notifications': 'Thông báo',
  '/settings': 'Cài đặt',
  '/settings/profile': 'Hồ sơ',
  '/settings/security': 'Bảo mật',
  '/settings/notifications': 'Thông báo',
  '/settings/display': 'Giao diện',
  '/settings/about': 'Giới thiệu',
}

// Pages that should show back button on mobile
const pagesWithBackButton = [
  '/settings/',
  '/stock/',
]

export function AppLayout() {
  const location = useLocation()
  const { sidebarCollapsed } = useUIStore()

  // Determine if we should show back button
  const showBack = pagesWithBackButton.some(path =>
    location.pathname.startsWith(path)
  )

  // Get page title for mobile header
  const getPageTitle = () => {
    // Exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname]
    }
    // Check for partial match
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path)) {
        return title
      }
    }
    return undefined
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <MobileHeader
            title={showBack ? getPageTitle() : undefined}
            showBack={showBack}
          />
        </div>

        {/* Main Content Area */}
        <main className={cn(
          'flex-1',
          // Mobile: padding top for fixed header (56px + safe area)
          'p-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-28',
          // Desktop: larger padding
          'lg:p-6 lg:pb-6'
        )}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav className="lg:hidden" />

      {/* AI Chat */}
      <AIChatButton />
      <AIChatPanel />
    </div>
  )
}

// Layout without sidebar (for auth pages, landing, etc.)
export function MinimalLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Outlet />
    </div>
  )
}

// Layout for stock detail pages on mobile
export function DetailLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Content - no extra headers, pages handle their own */}
        <main className={cn(
          'flex-1',
          'p-0 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-24',
          'lg:p-6 lg:pb-6'
        )}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav className="lg:hidden" />

      {/* AI Chat */}
      <AIChatButton />
      <AIChatPanel />
    </div>
  )
}
