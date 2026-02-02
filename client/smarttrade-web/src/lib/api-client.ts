/**
 * API Client - Centralized HTTP client with error handling
 * Production-ready with retries, timeout, and error classification
 */

import { z } from 'zod'
import { logger } from './logger'

// ============================================
// TYPES
// ============================================

export interface ApiConfig {
  baseUrl: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

export interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
}

export interface ApiError {
  code: string
  message: string
  status: number
  details?: unknown
  retryable: boolean
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// ============================================
// ERROR CODES
// ============================================

export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const

// ============================================
// API CLIENT CLASS
// ============================================

export class ApiClient {
  private config: Required<ApiConfig>

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      retries: 2,
      retryDelay: 1000,
      headers: {},
      ...config,
    }
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.config.headers['Authorization'] = `Bearer ${token}`
  }

  /**
   * Clear authorization header
   */
  clearAuthToken(): void {
    delete this.config.headers['Authorization']
  }

  /**
   * Make HTTP request with retries and error handling
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    options?: {
      body?: unknown
      params?: Record<string, string | number | boolean | undefined>
      schema?: z.ZodSchema<T>
      retries?: number
    }
  ): Promise<ApiResponse<T>> {
    const maxRetries = options?.retries ?? this.config.retries
    let lastError: ApiError | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.executeRequest<T>(method, endpoint, options)
        return response
      } catch (error) {
        lastError = error as ApiError

        // Don't retry non-retryable errors
        if (!lastError.retryable || attempt === maxRetries) {
          break
        }

        // Wait before retry with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt)
        await this.sleep(delay)

        logger.warn('API retry', {
          endpoint,
          attempt: attempt + 1,
          maxRetries,
          error: lastError.code,
        })
      }
    }

    throw lastError
  }

  /**
   * Execute single HTTP request
   */
  private async executeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    options?: {
      body?: unknown
      params?: Record<string, string | number | boolean | undefined>
      schema?: z.ZodSchema<T>
    }
  ): Promise<ApiResponse<T>> {
    // Build URL with query params
    const url = new URL(endpoint, this.config.baseUrl)
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    // Setup abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url.toString(), {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.config.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      })

      clearTimeout(timeoutId)

      // Parse response
      const data = await this.parseResponse<T>(response, options?.schema)

      // Handle error responses
      if (!response.ok) {
        throw this.createError(response.status, data)
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw {
          code: API_ERROR_CODES.TIMEOUT,
          message: 'Request timeout',
          status: 408,
          retryable: true,
        } as ApiError
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          code: API_ERROR_CODES.NETWORK_ERROR,
          message: 'Network error - please check your connection',
          status: 0,
          retryable: true,
        } as ApiError
      }

      // Re-throw ApiError
      if ((error as ApiError).code) {
        throw error
      }

      // Unknown error
      throw {
        code: API_ERROR_CODES.UNKNOWN,
        message: String(error),
        status: 0,
        retryable: false,
      } as ApiError
    }
  }

  /**
   * Parse response body with optional schema validation
   */
  private async parseResponse<T>(
    response: Response,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const text = await response.text()

    if (!text) {
      return {} as T
    }

    try {
      const data = JSON.parse(text)

      if (schema) {
        const result = schema.safeParse(data)
        if (!result.success) {
          logger.error('Response validation failed', {
            errors: result.error.errors,
          })
        }
        return result.success ? result.data : data
      }

      return data
    } catch {
      logger.error('Failed to parse response', { text: text.slice(0, 200) })
      return text as unknown as T
    }
  }

  /**
   * Create ApiError from response
   */
  private createError(status: number, data: unknown): ApiError {
    const detail = (data as { detail?: string; message?: string })?.detail ||
      (data as { message?: string })?.message ||
      'Unknown error'

    switch (status) {
      case 401:
        return {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: 'Authentication required',
          status,
          details: data,
          retryable: false,
        }
      case 403:
        return {
          code: API_ERROR_CODES.FORBIDDEN,
          message: 'Access denied',
          status,
          details: data,
          retryable: false,
        }
      case 404:
        return {
          code: API_ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
          status,
          details: data,
          retryable: false,
        }
      case 422:
        return {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: detail,
          status,
          details: data,
          retryable: false,
        }
      case 429:
        return {
          code: API_ERROR_CODES.RATE_LIMITED,
          message: 'Too many requests. Please slow down.',
          status,
          details: data,
          retryable: true,
        }
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          code: API_ERROR_CODES.SERVER_ERROR,
          message: 'Server error. Please try again later.',
          status,
          details: data,
          retryable: true,
        }
      default:
        return {
          code: API_ERROR_CODES.UNKNOWN,
          message: detail,
          status,
          details: data,
          retryable: false,
        }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  async get<T>(
    endpoint: string,
    options?: {
      params?: Record<string, string | number | boolean | undefined>
      schema?: z.ZodSchema<T>
    }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options)
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: { schema?: z.ZodSchema<T> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { body, ...options })
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: { schema?: z.ZodSchema<T> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { body, ...options })
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: { schema?: z.ZodSchema<T> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { body, ...options })
  }

  async delete<T>(
    endpoint: string,
    options?: { schema?: z.ZodSchema<T> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options)
  }
}

// ============================================
// PRE-CONFIGURED CLIENTS
// ============================================

export const aiApiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000,
  retries: 2,
})

export const backendApiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
  retries: 1,
})

// ============================================
// ERROR HELPER
// ============================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'status' in error
  )
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
