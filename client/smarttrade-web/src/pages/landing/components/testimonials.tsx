import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const testimonials = [
  {
    quote:
      'SmartTrade AI đã thay đổi căn bản cách đội nghiên cứu của chúng tôi hoạt động. Những gì trước đây mất nhiều ngày giờ đây diễn ra theo thời gian thực. Chất lượng phân tích AI sánh ngang với các chuyên viên phân tích cao cấp.',
    author: 'Nguyễn Minh Tuấn',
    title: 'Trưởng phòng Nghiên cứu',
    company: 'ABC Securities',
  },
  {
    quote:
      'Chúng tôi triển khai SmartTrade AI để giám sát toàn bộ danh mục. Hệ thống cảnh báo sớm đã phát hiện một cuộc khủng hoảng tiềm ẩn trong một cổ phiếu 3 ngày trước khi nó được công bố.',
    author: 'Trần Thị Hương',
    title: 'Quản lý Danh mục',
    company: 'Vietnam Capital Fund',
  },
  {
    quote:
      'Phân tích báo cáo tài chính thật xuất sắc. Giờ đây chúng tôi theo dõi được gấp 3 lần số công ty với cùng quy mô đội ngũ. ROI của nền tảng đã dương trong tháng đầu tiên.',
    author: 'Lê Hoàng Nam',
    title: 'Giám đốc Đầu tư',
    company: 'Dragon Capital Partners',
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = testimonials[currentIndex]

  return (
    <section id="testimonials" className="py-24 px-6 border-t border-gray-200 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-4">Đánh giá</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
            KHÁCH HÀNG NÓI GÌ
          </h2>
          <div className="w-24 h-0.5 bg-gray-200 dark:bg-[#1E1E1E] mt-6" />
        </motion.div>

        {/* Testimonial Card */}
        <div className="border border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] rounded-xl overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Quote */}
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-xl md:text-2xl text-gray-900 dark:text-white leading-relaxed mb-8 max-w-3xl"
              >
                "{current.quote}"
              </motion.blockquote>
            </AnimatePresence>

            {/* Author */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="w-0.5 h-12 bg-orange-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{current.author}</p>
                  <p className="text-sm text-gray-500 dark:text-[#64748B]">
                    {current.title}, {current.company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 px-8 py-4 border-t border-gray-200 dark:border-[#1E1E1E]">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-orange-500 scale-110'
                    : 'bg-gray-300 dark:bg-[#1E1E1E] hover:bg-gray-400 dark:hover:bg-[#2E2E2E]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
