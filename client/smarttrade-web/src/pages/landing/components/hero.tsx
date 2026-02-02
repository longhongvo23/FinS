import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { FloatingCards } from './floating-cards'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'

export function HeroSection() {
  const navigate = useNavigate()
  const { signInAsGuest } = useAuthStore()

  const handleDemoClick = () => {
    signInAsGuest()
    navigate('/dashboard')
  }

  return (
    <section className="relative min-h-screen flex items-center py-24 lg:py-32 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-[#0A0A0A] dark:to-[#0A0A0A]">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow */}
            <motion.p
              className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-6 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Trí Tuệ Nhân Tạo • Phân Tích Tài Chính
            </motion.p>

            {/* Main Headline */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-[72px] font-semibold tracking-[-0.03em] leading-[0.95] mb-8 text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              LỢI THẾ
              <br />
              <span className="text-orange-500">THÔNG MINH</span>
              <br />
              CHO NHÀ ĐẦU TƯ
            </motion.h1>

            {/* Divider */}
            <motion.div
              className="w-24 h-0.5 bg-orange-500 mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />

            {/* Subheadline */}
            <motion.p
              className="text-xl text-gray-600 dark:text-[#94A3B8] leading-relaxed mb-10 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Khai thác sức mạnh của kiến trúc Microservices và AI để xử lý khối lượng dữ liệu khổng lồ trong tích tắc.
              Hỗ trợ ra quyết định đầu tư tức thì với trải nghiệm đồng bộ hóa xuyên suốt trên đa nền tảng.
            </motion.p>

            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-[#0A0A0A] font-medium rounded-lg hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white transition-all shadow-lg hover:shadow-orange-500/20"
              >
                Bắt Đầu Miễn Phí
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={handleDemoClick}
                className="group inline-flex items-center gap-3 px-8 py-4 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              >
                <Play className="w-4 h-4" />
                Xem Demo
              </button>

            </motion.div>
          </motion.div>

          {/* Right: Floating Cards */}
          <div className="hidden lg:block">
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  )
}
