import { Link } from 'react-router-dom'
import { formatDistanceToNow, format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Calendar, TrendingUp, CircleDollarSign, Landmark, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Calendar event types
export type EventType = 'earnings' | 'economic' | 'dividend' | 'ipo'
export type EventImpact = 'high' | 'medium' | 'low'

export interface CalendarEvent {
  id: string
  title: string
  type: EventType
  date: string
  time?: string
  impact: EventImpact
  relatedSymbols: string[]
  description?: string
}

// Event type icons
function getEventIcon(type: EventType) {
  const icons = {
    earnings: TrendingUp,
    economic: Landmark,
    dividend: CircleDollarSign,
    ipo: Building2,
  }
  return icons[type] || Calendar
}

// Event type labels
function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    earnings: 'KQKD',
    economic: 'Kinh tế',
    dividend: 'Cổ tức',
    ipo: 'IPO',
  }
  return labels[type]
}

// Impact colors
function getImpactColor(impact: EventImpact): string {
  const colors: Record<EventImpact, string> = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
  }
  return colors[impact]
}

interface CalendarEventCardProps {
  event: CalendarEvent
}

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  const Icon = getEventIcon(event.type)
  const eventDate = new Date(event.date)
  const isUpcoming = eventDate > new Date()

  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-card border transition-colors',
        isUpcoming ? 'hover:border-primary/30' : 'opacity-75'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Date Badge */}
        <div className="flex flex-col items-center text-center min-w-[60px]">
          <span className="text-xs text-foreground-muted uppercase">
            {format(eventDate, 'MMM', { locale: vi })}
          </span>
          <span className="text-2xl font-bold">
            {format(eventDate, 'd')}
          </span>
          <span className="text-xs text-foreground-muted">
            {event.time || format(eventDate, 'EEEE', { locale: vi })}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              <Icon className="h-3 w-3 mr-1" />
              {getEventTypeLabel(event.type)}
            </Badge>
            <span className={cn('text-xs font-medium', getImpactColor(event.impact))}>
              {event.impact === 'high' ? 'Cao' : event.impact === 'medium' ? 'Trung bình' : 'Thấp'}
            </span>
          </div>

          <h4 className="font-medium text-sm mb-1">{event.title}</h4>

          {event.description && (
            <p className="text-xs text-foreground-muted line-clamp-2">{event.description}</p>
          )}

          {event.relatedSymbols.length > 0 && (
            <div className="flex gap-1 mt-2">
              {event.relatedSymbols.slice(0, 3).map((symbol: string) => (
                <Link
                  key={symbol}
                  to={`/stock/${symbol}`}
                  className="px-2 py-0.5 rounded bg-primary/10 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  {symbol}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface CalendarEventCompactProps {
  event: CalendarEvent
}

export function CalendarEventCompact({ event }: CalendarEventCompactProps) {
  const Icon = getEventIcon(event.type)
  const eventDate = new Date(event.date)

  const timeAgo = formatDistanceToNow(eventDate, {
    addSuffix: true,
    locale: vi,
  })

  return (
    <div className="flex items-center gap-3 py-2 hover:bg-secondary/50 rounded-lg px-2 -mx-2 transition-colors">
      <Icon className={cn('h-4 w-4', getImpactColor(event.impact))} />
      <span className="text-xs text-foreground-muted min-w-[80px]">{timeAgo}</span>
      <span className="text-sm flex-1 truncate">{event.title}</span>
      {event.relatedSymbols.slice(0, 1).map((symbol: string) => (
        <Link
          key={symbol}
          to={`/stock/${symbol}`}
          className="text-xs text-primary hover:underline"
        >
          {symbol}
        </Link>
      ))}
    </div>
  )
}
