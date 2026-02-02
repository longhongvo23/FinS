import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export type AlertCondition = 'above' | 'below' | 'crosses' | 'change_above' | 'change_below'
export type AlertStatus = 'active' | 'triggered' | 'paused'
export type NotificationType = 'alert_triggered' | 'price_target' | 'system'

export interface PriceAlert {
  id: string
  symbol: string
  stockName: string
  condition: AlertCondition
  targetPrice: number
  basePrice: number // Price when alert was created (for % change)
  currentPrice: number
  note?: string
  isRecurring: boolean
  status: AlertStatus
  createdAt: string
  triggeredAt?: string
}

export interface Notification {
  id: string
  alertId?: string
  type: NotificationType
  title: string
  message: string
  symbol?: string
  isRead: boolean
  createdAt: string
}

interface AlertsState {
  // Alerts
  alerts: PriceAlert[]

  // Notifications
  notifications: Notification[]
  unreadCount: number

  // Sound settings
  soundEnabled: boolean

  // Actions - Alerts
  createAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'status'>) => void
  updateAlert: (id: string, updates: Partial<PriceAlert>) => void
  deleteAlert: (id: string) => void
  pauseAlert: (id: string) => void
  resumeAlert: (id: string) => void
  triggerAlert: (id: string, currentPrice: number) => void
  resetTriggeredAlert: (id: string) => void
  deleteAllTriggered: () => void

  // Actions - Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void

  // Actions - Settings
  toggleSound: () => void

  // Actions - Price update
  updatePrices: (prices: Record<string, number>) => void
  checkAlerts: (prices: Record<string, number>) => PriceAlert[]
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Check if alert condition is met
function checkCondition(
  alert: PriceAlert,
  currentPrice: number
): boolean {
  const { condition, targetPrice, basePrice } = alert

  switch (condition) {
    case 'above':
      return currentPrice >= targetPrice
    case 'below':
      return currentPrice <= targetPrice
    case 'crosses':
      // Check if price crossed the target (was on one side, now on other)
      const wasAbove = alert.currentPrice >= targetPrice
      const isAbove = currentPrice >= targetPrice
      return wasAbove !== isAbove
    case 'change_above':
      const changeUp = ((currentPrice - basePrice) / basePrice) * 100
      return changeUp >= targetPrice // targetPrice is % in this case
    case 'change_below':
      const changeDown = ((currentPrice - basePrice) / basePrice) * 100
      return changeDown <= -targetPrice // targetPrice is % in this case
    default:
      return false
  }
}

// Initial mock alerts
const initialAlerts: PriceAlert[] = [
  {
    id: 'alert-demo-001',
    symbol: 'VNM',
    stockName: 'CTCP Sữa Việt Nam',
    condition: 'above',
    targetPrice: 88000,
    basePrice: 85200,
    currentPrice: 85200,
    note: 'Mua khi vượt kháng cự',
    isRecurring: false,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'alert-demo-002',
    symbol: 'FPT',
    stockName: 'CTCP FPT',
    condition: 'below',
    targetPrice: 88000,
    basePrice: 92100,
    currentPrice: 92100,
    note: 'Mua khi về vùng hỗ trợ',
    isRecurring: true,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'alert-demo-003',
    symbol: 'HPG',
    stockName: 'CTCP Tập đoàn Hòa Phát',
    condition: 'change_above',
    targetPrice: 5, // 5% change
    basePrice: 25800,
    currentPrice: 25800,
    note: 'Bán khi tăng 5%',
    isRecurring: false,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
]

// Initial notifications
const initialNotifications: Notification[] = [
  {
    id: 'notif-demo-001',
    type: 'system',
    title: 'Chào mừng bạn đến SmartTrade!',
    message: 'Thiết lập alerts để nhận thông báo khi giá đạt mức mong muốn.',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: initialAlerts,
      notifications: initialNotifications,
      unreadCount: initialNotifications.filter((n) => !n.isRead).length,
      soundEnabled: true,

      // Alert Actions
      createAlert: (alertData) => {
        const newAlert: PriceAlert = {
          ...alertData,
          id: generateId(),
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          alerts: [newAlert, ...state.alerts],
        }))
      },

      updateAlert: (id, updates) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }))
      },

      deleteAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }))
      },

      pauseAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, status: 'paused' as AlertStatus } : a
          ),
        }))
      },

      resumeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, status: 'active' as AlertStatus } : a
          ),
        }))
      },

      triggerAlert: (id, currentPrice) => {
        const { alerts, addNotification, soundEnabled } = get()
        const alert = alerts.find((a) => a.id === id)

        if (!alert) return

        // Update alert status
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: a.isRecurring ? 'active' : ('triggered' as AlertStatus),
                  triggeredAt: new Date().toISOString(),
                  currentPrice,
                }
              : a
          ),
        }))

        // Create notification
        const conditionText = getConditionText(alert.condition, alert.targetPrice)
        addNotification({
          alertId: id,
          type: 'alert_triggered',
          title: `${alert.symbol} đạt điều kiện!`,
          message: `Giá ${alert.symbol} ${conditionText}. Giá hiện tại: ${currentPrice.toLocaleString()}đ`,
          symbol: alert.symbol,
        })

        // Play sound
        if (soundEnabled) {
          playAlertSound()
        }
      },

      resetTriggeredAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id
              ? { ...a, status: 'active' as AlertStatus, triggeredAt: undefined }
              : a
          ),
        }))
      },

      deleteAllTriggered: () => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.status !== 'triggered'),
        }))
      },

      // Notification Actions
      addNotification: (notifData) => {
        const newNotif: Notification = {
          ...notifData,
          id: generateId(),
          isRead: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50), // Keep max 50
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (id) => {
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id)
          if (!notif || notif.isRead) return state

          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }))
      },

      deleteNotification: (id) => {
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id)
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notif && !notif.isRead ? state.unreadCount - 1 : state.unreadCount,
          }
        })
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      // Settings
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }))
      },

      // Price updates
      updatePrices: (prices) => {
        set((state) => ({
          alerts: state.alerts.map((a) => ({
            ...a,
            currentPrice: prices[a.symbol] ?? a.currentPrice,
          })),
        }))
      },

      checkAlerts: (prices) => {
        const { alerts, triggerAlert } = get()
        const triggeredAlerts: PriceAlert[] = []

        alerts
          .filter((a) => a.status === 'active')
          .forEach((alert) => {
            const currentPrice = prices[alert.symbol]
            if (currentPrice && checkCondition(alert, currentPrice)) {
              triggeredAlerts.push(alert)
              triggerAlert(alert.id, currentPrice)
            }
          })

        return triggeredAlerts
      },
    }),
    {
      name: 'alerts-storage',
    }
  )
)

// Helper functions
function getConditionText(condition: AlertCondition, targetPrice: number): string {
  switch (condition) {
    case 'above':
      return `vượt ${targetPrice.toLocaleString()}đ`
    case 'below':
      return `xuống dưới ${targetPrice.toLocaleString()}đ`
    case 'crosses':
      return `chạm mốc ${targetPrice.toLocaleString()}đ`
    case 'change_above':
      return `tăng trên ${targetPrice}%`
    case 'change_below':
      return `giảm trên ${targetPrice}%`
    default:
      return ''
  }
}

function playAlertSound() {
  try {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3

    oscillator.start()

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}

// Export helper
export { getConditionText }
