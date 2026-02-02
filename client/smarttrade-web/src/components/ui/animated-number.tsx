import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1,
  format = (n) => n.toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => format(Math.round(current)))
  const [displayValue, setDisplayValue] = useState(format(0))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    return display.on('change', (latest) => {
      setDisplayValue(latest)
    })
  }, [display])

  return <motion.span className={className}>{displayValue}</motion.span>
}

// Simplified counter that counts up from 0
interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function CountUp({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: CountUpProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      // Easing function (easeOutExpo)
      const eased = 1 - Math.pow(2, -10 * progress)
      setCount(eased * end)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  const formattedValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString()

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

// Currency formatter
interface AnimatedCurrencyProps {
  value: number
  currency?: string
  className?: string
}

export function AnimatedCurrency({
  value,
  currency = '₫',
  className,
}: AnimatedCurrencyProps) {
  return (
    <CountUp
      end={value}
      duration={1.5}
      prefix={currency}
      className={className}
    />
  )
}

// Percentage formatter
interface AnimatedPercentProps {
  value: number
  showSign?: boolean
  className?: string
}

export function AnimatedPercent({
  value,
  showSign = true,
  className,
}: AnimatedPercentProps) {
  const sign = showSign && value > 0 ? '+' : ''
  return (
    <CountUp
      end={value}
      duration={1}
      prefix={sign}
      suffix="%"
      decimals={2}
      className={className}
    />
  )
}
