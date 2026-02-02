import { Link2, Star, Sparkles } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Kết nối tài khoản',
    description:
      'Đăng ký miễn phí và kết nối với tài khoản chứng khoán của bạn. Hỗ trợ tất cả các công ty chứng khoán lớn tại Việt Nam.',
  },
  {
    number: '02',
    icon: Star,
    title: 'Thêm mã theo dõi',
    description:
      'Tạo watchlist với các mã cổ phiếu bạn quan tâm. AI sẽ tự động theo dõi và phân tích 24/7.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'AI làm việc 24/7',
    description:
      'Nhận insights, cảnh báo và khuyến nghị từ AI. Bạn có thể hỏi bất cứ điều gì về cổ phiếu của mình.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6366F1]/5 to-transparent" />

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            Bắt đầu trong{' '}
            <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
              3 bước đơn giản
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Không cần kiến thức kỹ thuật. Setup chỉ trong vài phút.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-gradient-to-r from-[#6366F1]/50 to-transparent" />
              )}

              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#6366F1]/50 transition-all group">
                {/* Step number */}
                <div className="absolute -top-4 left-8 px-3 py-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full text-sm font-bold">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="h-8 w-8 text-[#6366F1]" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
