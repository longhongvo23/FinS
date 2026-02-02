import { motion } from 'framer-motion'

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 border-t border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-4">Tính năng</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
            ĐIỀU GÌ LÀM NÊN SỰ KHÁC BIỆT
          </h2>
          <div className="w-24 h-0.5 bg-gray-200 dark:bg-[#1E1E1E] mt-6" />
        </motion.div>

        {/* Feature 01 - MongoDB Security */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-4xl font-mono text-orange-500">01</span>
            <div className="w-8 h-0.5 bg-orange-500" />
          </div>
          <h3 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
            AN NINH & BẢO MẬT
          </h3>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-500 dark:text-[#64748B] mb-6">
            KIẾN TRÚC MONGODB SECURE
          </h3>
          <p className="text-gray-600 dark:text-[#94A3B8] max-w-xl mb-8">
            Chúng tôi không chỉ lưu trữ, chúng tôi bảo vệ tài sản dữ liệu của bạn bằng các tiêu chuẩn
            an ninh nghiêm ngặt nhất trên nền tảng NoSQL.
          </p>

          {/* Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#1E1E1E] rounded-xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#111111] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-[#64748B] mb-4">
                Truyền thống (Cũ)
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-lg text-gray-900 dark:text-white">Dữ liệu dạng text thô</p>
                  <p className="text-sm text-gray-500 dark:text-[#64748B]">Plain text storage</p>
                </div>
                <div>
                  <p className="text-lg text-gray-900 dark:text-white">Rủi ro Injection cao</p>
                  <p className="text-sm text-gray-500 dark:text-[#64748B]">SQL/NoSQL Injection vulnerabilities</p>
                </div>
                <div>
                  <p className="text-lg text-gray-900 dark:text-white">Quản lý quyền lỏng lẻo</p>
                  <p className="text-sm text-gray-500 dark:text-[#64748B]">Weak access control</p>
                </div>
                <div className="pt-2">
                  <p className="text-lg font-semibold text-red-600 dark:text-[#FF1744]">Đánh giá: Rủi ro cao</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0A0A0A] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-4">
                FinS Security (Mới)
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-lg text-green-600 dark:text-[#00C853]">Mã hóa 2 chiều</p>
                  <p className="text-sm text-gray-500 dark:text-[#64748B]">Dữ liệu nhạy cảm được mã hóa trước khi lưu</p>
                </div>
                <div>
                  <p className="text-lg text-green-600 dark:text-[#00C853]">Authentication & Authorization</p>
                  <p className="text-sm text-gray-500 dark:text-[#64748B]">Role-based + Spring Security</p>
                </div>
                <div>
                  <p className="text-lg text-green-600 dark:text-[#00C853]">Audit Logging</p>
                  <p className="text-sm text-gray-500 dark:text-[#64748B]">Ghi vết toàn bộ truy cập bất thường</p>
                </div>
                <div className="pt-2">
                  <p className="text-lg font-semibold text-green-600 dark:text-[#00C853]">Đánh giá: Tuyệt đối an toàn</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature 02 - AI Prophet Prediction */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-4xl font-mono text-orange-500">02</span>
            <div className="w-8 h-0.5 bg-orange-500" />
          </div>
          <h3 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
            DỰ BÁO TƯƠNG LAI
          </h3>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-500 dark:text-[#64748B] mb-6">
            MÔ HÌNH AI PROPHET & TIMESERIES
          </h3>
          <p className="text-gray-600 dark:text-[#94A3B8] max-w-xl mb-8">
            Loại bỏ cảm tính. Hệ thống tự động thu thập dữ liệu lịch sử của 7 mã cổ phiếu công nghệ
            hàng đầu (AAPL, NVDA, MSFT...) và sử dụng AI để vẽ ra xu hướng tương lai.
          </p>

          {/* AI Prediction Feed */}
          <AIPredictionFeed />
        </motion.div>

        {/* Feature 03 - Multi-Platform Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-4xl font-mono text-orange-500">03</span>
            <div className="w-8 h-0.5 bg-orange-500" />
          </div>
          <h3 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
            TRUY CẬP LINH HOẠT
          </h3>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-500 dark:text-[#64748B] mb-6">
            ĐỒNG BỘ HÓA TRẢI NGHIỆM ĐẦU TƯ
          </h3>
          <p className="text-gray-600 dark:text-[#94A3B8] max-w-xl mb-8">
            Thị trường không bao giờ ngủ, và bạn cũng không nên bỏ lỡ bất kỳ cơ hội nào.
            Hệ thống của chúng tôi cho phép bạn tiếp cận dữ liệu chứng khoán theo thời gian thực
            trên mọi thiết bị. Bắt đầu phân tích trên Web và theo dõi danh mục ngay trên điện thoại của bạn.
          </p>

          {/* Multi-Device Visual */}
          <MultiDeviceShowcase />
        </motion.div>
      </div>
    </section>
  )
}

function AIPredictionFeed() {
  const predictions = [
    {
      symbol: 'NVDA',
      name: 'Nvidia',
      prediction: 'Dự báo tăng trưởng +15% trong Q1',
      confidence: 92,
      level: 'High',
    },
    {
      symbol: 'AAPL',
      name: 'Apple',
      prediction: 'Xu hướng đi ngang (Sideways)',
      confidence: 78,
      level: 'Medium',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla',
      prediction: 'Biến động mạnh, cảnh báo rủi ro',
      confidence: 60,
      level: 'Low',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft',
      prediction: 'Tăng trưởng ổn định +8% trong Q1',
      confidence: 85,
      level: 'High',
    },
  ]

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'text-green-600 dark:text-[#00C853]'
      case 'Medium':
        return 'text-yellow-600 dark:text-[#FFD600]'
      case 'Low':
        return 'text-red-600 dark:text-[#FF1744]'
      default:
        return 'text-gray-500'
    }
  }

  const getBarColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-green-500 dark:bg-[#00C853]'
      case 'Medium':
        return 'bg-yellow-500 dark:bg-[#FFD600]'
      case 'Low':
        return 'bg-red-500 dark:bg-[#FF1744]'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="border border-gray-200 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#111111] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A]">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-[#64748B]">Data Real-time</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-[#00C853] animate-pulse" />
          <span className="text-xs font-mono text-gray-500 dark:text-[#64748B]">AI PROPHET</span>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-[#1E1E1E]">
        {predictions.map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="text-sm font-mono font-semibold text-orange-500">{item.symbol}</span>
              <p className="text-xs text-gray-500 dark:text-[#64748B]">{item.name}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">{item.prediction}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-mono ${getConfidenceColor(item.level)}`}>
                  Độ tin cậy AI: {item.level}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-24 h-1.5 bg-gray-200 dark:bg-[#1E1E1E] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getBarColor(item.level)}`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-500 dark:text-[#64748B]">{item.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-[#1E1E1E] bg-gray-100 dark:bg-[#0A0A0A]">
        <p className="text-xs text-gray-500 dark:text-[#64748B] italic">
          📌 Dữ liệu được training lại (retrain) định kỳ mỗi 24h trên Docker Container
        </p>
      </div>
    </div>
  )
}

function MultiDeviceShowcase() {
  return (
    <div className="border border-gray-200 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#111111] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A]">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-[#64748B]">
          Đa nền tảng
        </p>
      </div>

      {/* Device Mockups */}
      <div className="p-8 relative">
        {/* Cloud sync effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
          {/* Laptop - Web */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[280px] bg-gray-800 dark:bg-[#1a1a1a] rounded-t-lg p-2">
              <div className="bg-gray-900 dark:bg-[#0d0d0d] rounded-md aspect-video flex items-center justify-center overflow-hidden">
                {/* Mini chart mockup */}
                <div className="w-full h-full p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div className="text-[10px] font-mono text-green-500 mb-1">NVDA +2.34%</div>
                  <svg className="w-full h-12" viewBox="0 0 100 30">
                    <path
                      d="M0,25 L10,22 L20,18 L30,20 L40,15 L50,12 L60,14 L70,8 L80,10 L90,5 L100,3"
                      fill="none"
                      stroke="#00C853"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-full max-w-[300px] h-3 bg-gray-700 dark:bg-[#2a2a2a] rounded-b-lg" />
            <div className="w-16 h-1 bg-gray-600 dark:bg-[#333] rounded-full mt-1" />
            <div className="mt-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bản Web</span>
            </div>
          </div>

          {/* Cloud Sync Icon in center */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 dark:text-[#64748B] text-center">
              Đồng bộ<br />Real-time
            </p>
            {/* Animated dots */}
            <div className="flex gap-1 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse delay-150" />
            </div>
          </div>

          {/* Mobile Devices */}
          <div className="flex items-end justify-center gap-4">
            {/* iPhone */}
            <div className="flex flex-col items-center">
              <div className="w-[100px] bg-gray-800 dark:bg-[#1a1a1a] rounded-[20px] p-1.5">
                <div className="bg-gray-900 dark:bg-[#0d0d0d] rounded-[16px] aspect-[9/19] flex flex-col overflow-hidden">
                  {/* Notch */}
                  <div className="flex justify-center pt-1">
                    <div className="w-12 h-4 bg-black rounded-full" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-2 flex flex-col justify-center">
                    <div className="text-[8px] text-gray-400 mb-1">📈 Thông báo</div>
                    <div className="text-[9px] font-mono text-green-500">AAPL +1.2%</div>
                    <div className="text-[7px] text-gray-500 mt-0.5">Vượt ngưỡng kháng cự</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-xs text-gray-600 dark:text-gray-400">App Store</span>
              </div>
            </div>

            {/* Android */}
            <div className="flex flex-col items-center">
              <div className="w-[100px] bg-gray-800 dark:bg-[#1a1a1a] rounded-[16px] p-1.5">
                <div className="bg-gray-900 dark:bg-[#0d0d0d] rounded-[12px] aspect-[9/19] flex flex-col overflow-hidden">
                  {/* Status bar */}
                  <div className="flex justify-between px-2 pt-1">
                    <div className="text-[6px] text-gray-500">9:41</div>
                    <div className="flex gap-0.5">
                      <div className="w-2 h-1.5 bg-gray-600 rounded-sm" />
                      <div className="w-1 h-1.5 bg-gray-600 rounded-sm" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-2 flex flex-col justify-center">
                    <div className="text-[8px] text-gray-400 mb-1">📊 Dashboard</div>
                    <div className="text-[9px] font-mono text-orange-500">Portfolio</div>
                    <div className="text-[7px] text-green-500 mt-0.5">+2.45% hôm nay</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 2.215a.578.578 0 01-.133.164L12.89 6.516a.578.578 0 01-.78 0L7.61 2.38a.578.578 0 01-.133-.165.578.578 0 01.558-.735h8.93a.578.578 0 01.558.735zM6.45 3.17l4.5 4.137a.578.578 0 01.05.814L6.861 13.38a.578.578 0 01-.959-.261L4.73 4.54a.578.578 0 01.72-.682l1 .312zm11.1 0l-1 .312a.578.578 0 00-.72.682l1.17 8.578a.578.578 0 00.96.261l4.14-5.259a.578.578 0 00-.05-.814l-4.5-4.137v-.623zm-5.55 6.143l4.5 4.137a.578.578 0 01.133.164.578.578 0 01-.558.735h-8.93a.578.578 0 01-.558-.735.578.578 0 01.133-.164l4.5-4.137a.578.578 0 01.78 0z" />
                </svg>
                <span className="text-xs text-gray-600 dark:text-gray-400">Google Play</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer badges */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A]">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Đồng bộ tức thì
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Thông báo real-time
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Bảo mật end-to-end
          </div>
        </div>
      </div>
    </div>
  )
}
