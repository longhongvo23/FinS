/**
 * Logger Service - Structured logging for production
 * Supports different log levels and external services
 */

// ============================================
// TYPES
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  appName: string
  environment: string
}

// ============================================
// LOG LEVEL PRIORITIES
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// ============================================
// LOGGER CLASS
// ============================================

class Logger {
  private config: LoggerConfig
  private buffer: LogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.config = {
      minLevel: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
      enableConsole: import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true',
      enableRemote: import.meta.env.PROD,
      remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT,
      appName: 'smarttrade-web',
      environment: import.meta.env.MODE,
    }

    // Start buffer flush interval in production
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.flushInterval = setInterval(() => this.flush(), 10000)
    }
  }

  /**
   * Check if log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  /**
   * Create log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        app: this.config.appName,
        env: this.config.environment,
        url: typeof window !== 'undefined' ? window.location.pathname : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      error,
    }
  }

  /**
   * Write log to console
   */
  private writeToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.context)
        break
      case 'info':
        console.info(prefix, entry.message, entry.context)
        break
      case 'warn':
        console.warn(prefix, entry.message, entry.context)
        break
      case 'error':
        console.error(prefix, entry.message, entry.context, entry.error)
        break
    }
  }

  /**
   * Buffer log for remote sending
   */
  private bufferLog(entry: LogEntry): void {
    this.buffer.push(entry)

    // Flush immediately for errors
    if (entry.level === 'error') {
      this.flush()
    }

    // Keep buffer size reasonable
    if (this.buffer.length > 100) {
      this.buffer = this.buffer.slice(-50)
    }
  }

  /**
   * Send buffered logs to remote endpoint
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) {
      return
    }

    const logsToSend = [...this.buffer]
    this.buffer = []

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: logsToSend,
          sessionId: this.getSessionId(),
        }),
        keepalive: true,
      })
    } catch {
      // Put logs back in buffer on failure
      this.buffer = [...logsToSend, ...this.buffer].slice(-100)
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    const key = 'log_session_id'
    let sessionId = sessionStorage.getItem(key)

    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      sessionStorage.setItem(key, sessionId)
    }

    return sessionId
  }

  /**
   * Process log entry
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry = this.createEntry(level, message, context, error)

    if (this.config.enableConsole) {
      this.writeToConsole(entry)
    }

    if (this.config.enableRemote) {
      this.bufferLog(entry)
    }
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  error(
    message: string,
    context?: Record<string, unknown> | Error,
    error?: Error
  ): void {
    if (context instanceof Error) {
      this.log('error', message, { errorMessage: context.message }, context)
    } else {
      this.log('error', message, context, error)
    }
  }

  /**
   * Track user action for analytics
   */
  track(event: string, properties?: Record<string, unknown>): void {
    this.info(`[TRACK] ${event}`, properties)
  }

  /**
   * Time a function execution
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` })
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.error(`${label} failed`, { duration: `${duration.toFixed(2)}ms` }, error as Error)
      throw error
    }
  }

  /**
   * Create child logger with preset context
   */
  child(context: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, context)
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// ============================================
// CHILD LOGGER
// ============================================

class ChildLogger {
  constructor(
    private parent: Logger,
    private context: Record<string, unknown>
  ) {}

  debug(message: string, context?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.context, ...context })
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.context, ...context })
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.context, ...context })
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.parent.error(message, { ...this.context, ...context }, error)
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const logger = new Logger()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush()
  })
}

// ============================================
// ERROR BOUNDARY HELPER
// ============================================

export function logError(error: Error, errorInfo?: { componentStack?: string }): void {
  logger.error('React Error Boundary caught error', {
    errorMessage: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
  }, error)
}

// ============================================
// PERFORMANCE HELPER
// ============================================

export function measurePerformance(name: string): () => void {
  const start = performance.now()

  return () => {
    const duration = performance.now() - start
    logger.debug(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` })
  }
}
