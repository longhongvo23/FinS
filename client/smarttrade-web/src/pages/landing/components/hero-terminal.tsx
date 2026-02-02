import { useEffect, useState } from 'react'

export function HeroTerminal() {
  const [price, setPrice] = useState(76500)
  const [lastUpdated, setLastUpdated] = useState(2)

  // Simulate price updates
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setPrice((prev) => prev + Math.floor(Math.random() * 200 - 100))
    }, 3000)

    const timeInterval = setInterval(() => {
      setLastUpdated((prev) => (prev >= 10 ? 1 : prev + 1))
    }, 1000)

    return () => {
      clearInterval(priceInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const change = price - 74750
  const changePercent = ((change / 74750) * 100).toFixed(2)

  return (
    <div className="relative">
      {/* Subtle glow behind */}
      <div className="absolute -inset-8 bg-[#FF6B35]/5 blur-3xl rounded-3xl" />

      {/* Terminal container */}
      <div className="relative bg-[#0D0D0D] border border-[#1E1E1E] overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E1E1E] bg-[#0A0A0A]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
          </div>
          <span className="text-xs text-[#64748B] ml-2 font-mono uppercase tracking-wider">
            SmartTrade Terminal
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#28CA42] rounded-full animate-pulse" />
            <span className="text-xs text-[#64748B] font-mono">LIVE</span>
          </div>
        </div>

        {/* Terminal content - 3 columns */}
        <div className="grid grid-cols-3 divide-x divide-[#1E1E1E]">
          {/* Column 1: Stock Price */}
          <div className="p-4">
            <div className="text-[10px] text-[#64748B] mb-1 font-mono uppercase tracking-wider">
              HOSE
            </div>
            <div className="text-lg font-semibold">VNM</div>
            <div className="text-2xl font-bold font-mono mt-1">
              ₫{price.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-sm font-mono ${change >= 0 ? 'text-[#00C853]' : 'text-[#FF1744]'}`}
              >
                {change >= 0 ? '▲' : '▼'} {change >= 0 ? '+' : ''}
                {change.toLocaleString()}
              </span>
              <span
                className={`text-sm font-mono ${change >= 0 ? 'text-[#00C853]' : 'text-[#FF1744]'}`}
              >
                ({change >= 0 ? '+' : ''}{changePercent}%)
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Vol</span>
                <span className="font-mono text-white">2.3M</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Val</span>
                <span className="font-mono text-white">₫175B</span>
              </div>
            </div>
          </div>

          {/* Column 2: Mini Chart */}
          <div className="p-4">
            <div className="text-[10px] text-[#64748B] mb-2 font-mono uppercase tracking-wider">
              Price Chart
            </div>
            <MiniChart />
          </div>

          {/* Column 3: AI Insight */}
          <div className="p-4 bg-[#0A0A0A]">
            <div className="text-[10px] text-[#64748B] mb-2 font-mono uppercase tracking-wider">
              AI Signal
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#00C853]/10 border border-[#00C853]/30">
              <span className="text-[#00C853] font-semibold text-sm font-mono">BUY</span>
            </div>
            <div className="mt-3">
              <div className="text-[10px] text-[#64748B] mb-1 uppercase">Confidence</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-[#1E1E1E] overflow-hidden">
                  <div
                    className="h-full bg-[#00C853] transition-all duration-1000"
                    style={{ width: '87%' }}
                  />
                </div>
                <span className="text-xs font-mono text-white">87%</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#94A3B8] leading-relaxed">
              "Breakout above MA50, strong volume support"
            </p>
          </div>
        </div>

        {/* Bottom ticker */}
        <div className="border-t border-[#1E1E1E] px-4 py-2.5 flex items-center gap-6 bg-[#0A0A0A]">
          <TickerItem symbol="HPG" change="+6.2%" positive />
          <TickerItem symbol="FPT" change="+4.1%" positive />
          <TickerItem symbol="VCB" change="+2.8%" positive />
          <TickerItem symbol="MWG" change="-1.2%" positive={false} />
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 bg-[#111] border border-[#1E1E1E] px-3 py-2 shadow-xl">
        <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Updated</div>
        <div className="text-sm font-mono text-[#FF6B35]">{lastUpdated}s ago</div>
      </div>
    </div>
  )
}

function MiniChart() {
  const points = [40, 42, 38, 45, 43, 48, 52, 50, 55, 58, 62, 65]

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100
      const y = 60 - p * 0.8
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <div className="h-20">
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid line */}
        <line x1="0" y1="30" x2="100" y2="30" stroke="#1E1E1E" strokeDasharray="2,2" />

        {/* Gradient */}
        <defs>
          <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C853" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path d={`${path} L 100 60 L 0 60 Z`} fill="url(#heroChartFill)" />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke="#00C853"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End dot with pulse */}
        <circle
          cx="100"
          cy={60 - points[points.length - 1] * 0.8}
          r="4"
          fill="#0A0A0A"
          stroke="#00C853"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

function TickerItem({
  symbol,
  change,
  positive,
}: {
  symbol: string
  change: string
  positive: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono whitespace-nowrap">
      <span className="text-white">{symbol}</span>
      <span className={positive ? 'text-[#00C853]' : 'text-[#FF1744]'}>
        {positive ? '▲' : '▼'} {change}
      </span>
    </div>
  )
}
