import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export function RealtimeUsers() {
  const [activeUsers, setActiveUsers] = useState(42) // Demo initial value
  const [recentPages, setRecentPages] = useState<string[]>(['/dashboard', '/market', '/ai-chat'])

  useEffect(() => {
    // Simulate some activity in demo mode
    // In production, this would use WebSocket or SSE
    const interval = setInterval(() => {
      const pages = ['/dashboard', '/market', '/ai-chat', '/portfolio', '/watchlist', '/stock/VNM', '/stock/FPT']
      const randomPage = pages[Math.floor(Math.random() * pages.length)]
      setRecentPages((prev) => [randomPage, ...prev.slice(0, 4)])

      // Random fluctuation
      setActiveUsers((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1
        return Math.max(30, Math.min(100, prev + change))
      })
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <Card className="border-brand/50 bg-brand/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="h-5 w-5 text-brand" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{activeUsers}</span>
                <span className="text-foreground-muted">users online</span>
              </div>
            </div>
          </div>

          {recentPages.length > 0 && (
            <div className="text-sm text-foreground-muted hidden md:block">
              <span>Recent: </span>
              {recentPages.slice(0, 3).map((page, i) => (
                <span key={i} className="text-foreground">
                  {page.replace('/', '') || 'home'}
                  {i < 2 && ', '}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
