import { useRef } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { TrendingUp, Brain, PieChart, Sparkles } from 'lucide-react'

interface CardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  accentColor: string
  delay: number
  position: { x: number; y: number; z: number }
  mouseX: any
  mouseY: any
}

function FloatingCard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  delay,
  position,
  mouseX,
  mouseY,
}: CardProps) {
  // Parallax depth - cards at different z-levels move at different speeds
  const depth = position.z / 100

  // Transform mouse position to rotation/movement
  const rotateX = useTransform(mouseY, [-300, 300], [10 * depth, -10 * depth])
  const rotateY = useTransform(mouseX, [-300, 300], [-10 * depth, 10 * depth])
  const translateX = useTransform(mouseX, [-300, 300], [-20 * depth, 20 * depth])
  const translateY = useTransform(mouseY, [-300, 300], [-15 * depth, 15 * depth])

  // Smooth springs for natural motion
  const springConfig = { stiffness: 100, damping: 20 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)
  const springTranslateX = useSpring(translateX, springConfig)
  const springTranslateY = useSpring(translateY, springConfig)

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        x: springTranslateX,
        y: springTranslateY,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: {
          duration: 3 + delay,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay,
        },
      }}
    >
      {/* Card */}
      <div
        className={`
          relative p-5 rounded-2xl
          bg-white/90 dark:bg-[#111111]/90
          backdrop-blur-xl
          border border-gray-200/50 dark:border-white/10
          shadow-xl shadow-black/5 dark:shadow-black/20
          min-w-[200px]
        `}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Accent glow */}
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-20 blur-xl"
          style={{ background: accentColor }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${accentColor}20` }}
            >
              <span style={{ color: accentColor }}>{icon}</span>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {title}
            </span>
          </div>

          {/* Value */}
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono mb-1">
            {value}
          </div>

          {/* Subtitle */}
          <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
        </div>

        {/* 3D edge effect */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)',
            transform: 'translateZ(1px)',
          }}
        />
      </div>
    </motion.div>
  )
}

export function FloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    // Animate back to center
    mouseX.set(0)
    mouseY.set(0)
  }

  const cards = [
    {
      title: 'AI Insight',
      value: 'TÍCH CỰC',
      subtitle: 'Độ tin cậy 87%',
      icon: <Brain className="w-4 h-4" />,
      accentColor: '#00C853',
      position: { x: 10, y: 15, z: 30 },
      delay: 0,
    },
    {
      title: 'Giá Cổ Phiếu',
      value: '₫76,500',
      subtitle: '+2.34% hôm nay',
      icon: <TrendingUp className="w-4 h-4" />,
      accentColor: '#FF6B35',
      position: { x: 55, y: 5, z: 50 },
      delay: 0.2,
    },
    {
      title: 'Danh Mục',
      value: '+18.5%',
      subtitle: 'Lợi nhuận tháng này',
      icon: <PieChart className="w-4 h-4" />,
      accentColor: '#3B82F6',
      position: { x: 25, y: 60, z: 70 },
      delay: 0.4,
    },
  ]

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] lg:h-[500px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      {/* Background gradient orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 1,
        }}
      />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-orange-500/30 dark:bg-orange-500/50"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3], 
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Sparkle icon in center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 3, repeat: Infinity, repeatType: 'reverse' },
        }}
      >
        <Sparkles className="w-6 h-6 text-orange-500/20 dark:text-orange-500/30" />
      </motion.div>

      {/* Cards */}
      {cards.map((card) => (
        <FloatingCard
          key={card.title}
          {...card}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
    </div>
  )
}
