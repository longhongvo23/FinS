import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ChevronRight } from 'lucide-react'

interface UpcomingEventsWidgetProps {
  limit?: number
}

// Placeholder for upcoming events widget
// Currently no events API is integrated, so we show an empty state
export function UpcomingEventsWidget({ limit = 5 }: UpcomingEventsWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Sự kiện sắp tới
          </CardTitle>
          <Link
            to="/news?tab=calendar"
            className="text-xs text-primary hover:underline flex items-center gap-0.5"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="py-6 text-center">
          <p className="text-sm text-foreground-muted">
            Không có sự kiện nào sắp tới
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
