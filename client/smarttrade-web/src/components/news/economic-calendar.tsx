import { Calendar } from 'lucide-react'

// Placeholder economic calendar component
// Will be implemented when calendar API is available
export function EconomicCalendar() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
        <Calendar className="h-12 w-12 text-foreground-muted mb-4" />
        <h3 className="text-base font-medium mb-2">
          Lịch kinh tế
        </h3>
        <p className="text-sm text-foreground-muted text-center max-w-sm">
          Tính năng này sẽ sớm được cập nhật
        </p>
      </div>
    </div>
  )
}
