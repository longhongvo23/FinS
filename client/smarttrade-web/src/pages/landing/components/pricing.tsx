import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'CÁ NHÂN',
    price: '₫0',
    period: '/tháng',
    description: 'Dành cho người mới bắt đầu',
    features: [
      '5 truy vấn AI/ngày',
      'Biểu đồ cơ bản',
      '5 mã trong danh sách theo dõi',
      'Hỗ trợ qua email',
    ],
    cta: 'Bắt đầu miễn phí',
    ctaLink: '/register',
    featured: false,
  },
  {
    name: 'CHUYÊN NGHIỆP',
    price: '₫199,000',
    period: '/tháng',
    description: 'Dành cho nhà đầu tư nghiêm túc',
    features: [
      'Truy vấn AI không giới hạn',
      'AI Research Agent',
      'Phân tích báo cáo tài chính',
      'Cảnh báo thông minh',
      'Hỗ trợ ưu tiên',
    ],
    cta: 'Đăng ký ngay',
    ctaLink: '/register?plan=pro',
    featured: true,
  },
  {
    name: 'TỔ CHỨC',
    price: 'Liên hệ',
    period: 'báo giá',
    description: 'Dành cho quỹ & tổ chức',
    features: [
      'Truy cập API đầy đủ',
      'Mô hình AI tùy chỉnh',
      'Hỗ trợ chuyên biệt',
      'Cam kết SLA',
      'Triển khai on-premise',
    ],
    cta: 'Liên hệ',
    ctaLink: '/contact',
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 border-t border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-4">Bảng giá</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
            GÓI DỊCH VỤ
          </h2>
          <div className="w-24 h-0.5 bg-gray-200 dark:bg-[#1E1E1E] mt-6" />
          <p className="text-gray-500 dark:text-[#64748B] mt-6">Cho nhà đầu tư cá nhân</p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border ${
                plan.featured
                  ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white'
                  : 'bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-[#1E1E1E]'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                  Phổ biến nhất
                </div>
              )}

              {/* Plan Name */}
              <p
                className={`text-xs uppercase tracking-[0.2em] mb-4 ${
                  plan.featured ? 'text-orange-500' : 'text-gray-500 dark:text-[#64748B]'
                }`}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={`text-3xl md:text-4xl font-mono font-semibold ${
                    plan.featured ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm ml-1 ${
                    plan.featured ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-[#64748B]'
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p
                className={`text-sm mb-6 ${
                  plan.featured ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-[#64748B]'
                }`}
              >
                {plan.description}
              </p>

              {/* Divider */}
              <div
                className={`w-full h-px mb-6 ${
                  plan.featured ? 'bg-gray-700 dark:bg-gray-300' : 'bg-gray-200 dark:bg-[#1E1E1E]'
                }`}
              />

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check
                      className={`w-4 h-4 ${
                        plan.featured ? 'text-orange-500' : 'text-orange-500'
                      }`}
                    />
                    <span
                      className={
                        plan.featured ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-[#94A3B8]'
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={plan.ctaLink}
                className={`block w-full py-3 text-center text-sm font-medium rounded-lg transition-all ${
                  plan.featured
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
