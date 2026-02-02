/**
 * Sentry Error Tracking Configuration
 * Only initializes in production with valid DSN
 */

import * as Sentry from '@sentry/react'

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  // Only initialize if DSN is provided and in production
  if (!dsn || import.meta.env.DEV) {
    console.log('[Sentry] Skipped - no DSN or development mode')
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: `smarttrade-web@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Sample rates
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Filter out noisy errors
    beforeSend(event, hint) {
      const error = hint.originalException

      // Ignore specific errors
      if (error instanceof Error) {
        // Ignore network errors that users can't do anything about
        if (error.message.includes('Failed to fetch')) {
          return null
        }

        // Ignore cancelled requests
        if (error.message.includes('AbortError')) {
          return null
        }

        // Ignore ResizeObserver errors (browser quirk)
        if (error.message.includes('ResizeObserver')) {
          return null
        }
      }

      return event
    },

    // Ignore specific URLs
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox extensions
      /^moz-extension:\/\//i,
      // Safari extensions
      /^safari-extension:\/\//i,
    ],
  })

  console.log('[Sentry] Initialized successfully')
}

/**
 * Capture exception with additional context
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (import.meta.env.DEV) {
    console.error('[Sentry] Would capture:', error, context)
    return
  }

  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string } | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    })
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}

/**
 * Error boundary fallback component
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary
