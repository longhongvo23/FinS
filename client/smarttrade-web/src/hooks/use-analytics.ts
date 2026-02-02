import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { analyticsService } from '@/services/analytics-service'

export function useAnalytics() {
  const location = useLocation()

  // Track page views
  useEffect(() => {
    analyticsService.trackPageView(location.pathname)
  }, [location.pathname])

  return analyticsService
}

// Re-export analytics for direct usage
export { analyticsService }
