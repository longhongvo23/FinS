import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { useAlertsStore } from '@/stores/alerts-store'

interface UseAlertCheckerOptions {
  // Check interval in milliseconds (default: 30 seconds)
  interval?: number
  // Whether to enable checking (default: true)
  enabled?: boolean
}

// Mock price data generator - In production, this would fetch from API
function generateMockPrices(symbols: string[]): Record<string, number> {
  const basePrices: Record<string, number> = {
    VNM: 85200,
    FPT: 92100,
    HPG: 25800,
    VIC: 42500,
    MWG: 51200,
    TCB: 35600,
    VHM: 45000,
    MSN: 75000,
    VCB: 92000,
    BID: 48000,
  }

  const prices: Record<string, number> = {}
  symbols.forEach((symbol) => {
    const basePrice = basePrices[symbol] || 50000
    // Random fluctuation of ±3%
    const fluctuation = 1 + (Math.random() * 0.06 - 0.03)
    prices[symbol] = Math.round(basePrice * fluctuation)
  })

  return prices
}

export function useAlertChecker(options: UseAlertCheckerOptions = {}) {
  const { interval = 30000, enabled = true } = options
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { alerts, updatePrices, checkAlerts } = useAlertsStore()

  const checkAndTrigger = useCallback(() => {
    // Get unique symbols from active alerts
    const activeAlerts = alerts.filter((a) => a.status === 'active')
    if (activeAlerts.length === 0) return

    const symbols = [...new Set(activeAlerts.map((a) => a.symbol))]

    // Get current prices (mock for now)
    const prices = generateMockPrices(symbols)

    // Update prices in store
    updatePrices(prices)

    // Check alerts and get triggered ones
    const triggeredAlerts = checkAlerts(prices)

    // Show toast for each triggered alert
    triggeredAlerts.forEach((alert) => {
      const currentPrice = prices[alert.symbol]
      toast.success(`${alert.symbol} đạt điều kiện!`, {
        description: `Giá hiện tại: ${currentPrice?.toLocaleString()}đ`,
        action: {
          label: 'Xem chi tiết',
          onClick: () => {
            window.location.href = `/stock/${alert.symbol}`
          },
        },
        duration: 10000,
      })
    })
  }, [alerts, updatePrices, checkAlerts])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial check after a short delay
    const initialTimeout = setTimeout(() => {
      checkAndTrigger()
    }, 2000)

    // Set up interval
    intervalRef.current = setInterval(checkAndTrigger, interval)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, checkAndTrigger])

  // Return function to manually trigger check
  return {
    checkNow: checkAndTrigger,
    isEnabled: enabled,
    activeAlertsCount: alerts.filter((a) => a.status === 'active').length,
  }
}

// Hook to use in App.tsx or main layout to enable global alert checking
export function useGlobalAlertChecker() {
  return useAlertChecker({
    interval: 30000, // Check every 30 seconds
    enabled: true,
  })
}
