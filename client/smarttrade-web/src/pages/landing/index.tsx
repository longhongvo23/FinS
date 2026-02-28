import { useEffect } from 'react'
import { TickerTape } from './components/ticker-tape'
import { LandingNavbar } from './components/navbar'
import { HeroSection } from './components/hero'
import { TerminalPreview } from './components/terminal-preview'
import { FeaturesSection } from './components/features'
import { StatsSection } from './components/stats'
import { CTASection } from './components/cta-section'
import { LandingFooter } from './components/footer'
import { useUIStore } from '@/stores/ui-store'

export function LandingPage() {
  const { theme } = useUIStore()

  // Apply theme class on mount
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* Fixed Ticker Tape at very top with Safe Area support */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gray-50 dark:bg-[#0A0A0A] pt-[env(safe-area-inset-top)]">
        <TickerTape />
      </div>

      {/* Navbar below ticker */}
      <LandingNavbar />

      {/* Main Content with padding for fixed ticker + safe area */}
      <main className="pt-[calc(36px+env(safe-area-inset-top))]">
        <HeroSection />
        <TerminalPreview />
        <FeaturesSection />
        <StatsSection />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  )
}

export default LandingPage
