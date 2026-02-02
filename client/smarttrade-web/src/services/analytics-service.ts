/**
 * Analytics Service for FinS
 * Simplified version without Supabase
 */

export interface AnalyticsEvent {
  event_name: string
  event_data?: Record<string, unknown>
  timestamp?: string
}

export const analyticsService = {
  /**
   * Track an event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    // For now, just log to console
    // In production, this would send to an analytics endpoint
    console.log('[Analytics]', event.event_name, event.event_data)
  },

  /**
   * Track page view
   */
  async trackPageView(path: string): Promise<void> {
    await this.trackEvent({
      event_name: 'page_view',
      event_data: { path },
    })
  },

  /**
   * Get analytics data (admin only)
   * This is a placeholder - needs backend implementation
   */
  async getAnalyticsData(_options?: {
    from?: string
    to?: string
  }): Promise<{ users: number; events: number }> {
    // Placeholder
    return { users: 0, events: 0 }
  },
}
