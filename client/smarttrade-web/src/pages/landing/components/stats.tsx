import { motion } from 'framer-motion'

const stats = [
  { value: '7+', label: 'Mã cổ phiếu Blue-chip được theo dõi' },
  { value: '10 Năm', label: 'Dữ liệu lịch sử từ 2015' },
  { value: '~90%', label: 'Độ tin cậy Prophet (Demo)' },
  { value: '<200ms', label: 'Tốc độ phản hồi Microservices' },
]

export function StatsSection() {
  return (
    <section className="py-20 px-6 border-t border-gray-200 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500 mb-4">Dữ liệu & Quy mô</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
            CON SỐ BIẾT NÓI
          </h2>
          <div className="w-24 h-0.5 bg-gray-200 dark:bg-[#1E1E1E] mt-6" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#1E1E1E] rounded-xl overflow-hidden">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white dark:bg-[#111111] p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-mono font-semibold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-[#64748B] uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
