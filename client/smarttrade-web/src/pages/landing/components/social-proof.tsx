const brokers = ['SSI', 'VPS', 'TCBS', 'VnDirect', 'MBS', 'HSC', 'VCSC', 'Mirae']

const stats = [
  { value: '10K+', label: 'Nhà đầu tư' },
  { value: '500K+', label: 'AI queries/tháng' },
  { value: '99.9%', label: 'Uptime' },
]

export function SocialProof() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <p className="text-center text-sm text-neutral-500 mb-10">
          Được tin dùng bởi hơn 10,000 nhà đầu tư Việt Nam
        </p>

        {/* Broker logos */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 mb-16">
          {brokers.map((broker) => (
            <span
              key={broker}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              {broker}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-xl border border-white/[0.06] bg-[#141414]"
            >
              <p className="text-3xl font-semibold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
