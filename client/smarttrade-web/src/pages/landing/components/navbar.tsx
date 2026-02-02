import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Tính năng', href: '#features' },
  { label: 'Bảng giá', href: '#pricing' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-[36px] w-full z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#1E1E1E] shadow-sm'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          SmartTrade
          <span className="text-orange-500">.</span>
        </Link>

        {/* Nav links - desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side - desktop */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Chuyển đổi theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </motion.div>
            </AnimatePresence>
          </button>

          <Link
            to="/login"
            className="text-sm text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="text-sm px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-[#0A0A0A] font-medium rounded-lg hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white transition-colors"
          >
            Bắt đầu ngay
          </Link>
        </div>

        {/* Mobile: Theme toggle + Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-[#94A3B8] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Chuyển đổi theme"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            className="p-2 text-gray-600 dark:text-[#94A3B8]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white transition-colors py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-[#1E1E1E] space-y-3">
                <Link
                  to="/login"
                  className="block text-sm text-gray-600 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white transition-colors py-2 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block text-sm px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-[#0A0A0A] font-medium text-center rounded-lg"
                >
                  Bắt đầu ngay
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
