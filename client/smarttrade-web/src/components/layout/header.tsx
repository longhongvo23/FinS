import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { NotificationCenter } from '@/components/notifications'

export function Header() {
  const { theme, setTheme } = useUIStore()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--color-surface)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Tìm mã chứng khoán..."
              className="pl-9 h-9 text-[13px] bg-[var(--color-bg-secondary)] border-[var(--color-border)] focus:border-[var(--color-border-strong)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* Market Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-positive)] animate-pulse" />
            <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">Đang giao dịch</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <NotificationCenter />

        </div>
      </div>
    </header>
  )
}
