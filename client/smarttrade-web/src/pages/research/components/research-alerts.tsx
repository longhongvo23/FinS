import { Button } from '@/components/ui/button'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatters'
import { getAlertIcon } from '@/lib/icons'

interface Alert {
  id: string
  symbol: string
  alert_type: string
  priority: string
  title: string
  summary: string
  is_read: boolean
  created_at: string
}

interface ResearchAlertsProps {
  alerts: Alert[]
}

export function ResearchAlerts({ alerts }: ResearchAlertsProps) {
  const unreadAlerts = alerts.filter((a) => !a.is_read)

  if (unreadAlerts.length === 0) return null

  return (
    <div className="p-4 rounded-xl border bg-[var(--color-warning)]/5 border-[var(--color-warning)]/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-[var(--color-warning)]" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-warning)] text-black text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadAlerts.length}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
              Bạn có {unreadAlerts.length} cảnh báo mới
            </p>

            <div className="space-y-2">
              {unreadAlerts.slice(0, 3).map((alert) => {
                const AlertIcon = getAlertIcon(alert.alert_type)
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-2"
                  >
                    <span
                      className={cn(
                        'shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded border',
                        alert.priority === 'high' &&
                          'border-[var(--color-negative)]/50 text-[var(--color-negative)] bg-[var(--color-negative)]/10',
                        alert.priority === 'medium' &&
                          'border-[var(--color-warning)]/50 text-[var(--color-warning)] bg-[var(--color-warning)]/10',
                        alert.priority === 'low' &&
                          'border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      {alert.symbol}
                    </span>
                    <div className="flex items-start gap-1.5">
                      <AlertIcon className="h-3.5 w-3.5 mt-0.5 text-[var(--color-text-secondary)] shrink-0" />
                      <div>
                        <p className="text-[12px] font-medium text-[var(--color-text-primary)]">
                          {alert.title}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {formatRelativeTime(alert.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {unreadAlerts.length > 3 && (
              <button className="text-[12px] font-medium text-[var(--color-brand)] hover:underline">
                Xem tất cả {unreadAlerts.length} cảnh báo
              </button>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-7 w-7 hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
