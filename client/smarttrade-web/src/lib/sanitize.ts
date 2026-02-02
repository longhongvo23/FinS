/**
 * Sanitization Utilities - Prevent XSS and injection attacks
 * Production-ready input sanitization
 */

// ============================================
// HTML SANITIZATION
// ============================================

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Strip all HTML tags from string
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

// ============================================
// SQL-LIKE INJECTION PREVENTION
// ============================================

const SQL_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
  'ALTER', 'TRUNCATE', 'UNION', 'JOIN', 'WHERE', 'OR', 'AND',
  '--', '/*', '*/', ';', 'EXEC', 'EXECUTE', 'XP_', 'SP_',
]

/**
 * Check if string contains SQL injection patterns
 */
export function containsSqlInjection(str: string): boolean {
  const upper = str.toUpperCase()
  return SQL_KEYWORDS.some((keyword) => upper.includes(keyword))
}

/**
 * Sanitize string for safe use in Supabase queries
 * Escapes special characters used in PostgreSQL
 */
export function sanitizeForQuery(str: string): string {
  // Remove null bytes
  let sanitized = str.replace(/\0/g, '')

  // Escape special PostgreSQL characters
  sanitized = sanitized
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/%/g, '\\%')  // Escape LIKE wildcards
    .replace(/_/g, '\\_')

  return sanitized
}

/**
 * Sanitize string for ILIKE/pattern matching
 * Use with Supabase .ilike() or .or() filters
 */
export function sanitizeForSearch(str: string): string {
  // Remove dangerous characters but keep alphanumeric and Vietnamese
  return str
    .replace(/[<>'"`;\\]/g, '')
    .replace(/%/g, '')
    .replace(/_/g, '')
    .trim()
    .slice(0, 100) // Limit length
}

// ============================================
// URL SANITIZATION
// ============================================

/**
 * Sanitize URL to prevent javascript: and data: attacks
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase()

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '#'
  }

  return url
}

/**
 * Validate and sanitize external URLs
 */
export function sanitizeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    return parsed.href
  } catch {
    return null
  }
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * General purpose input sanitization
 * Removes dangerous characters while preserving Unicode
 */
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') {
    return ''
  }

  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
    .replace(/[<>]/g, '') // HTML brackets
    .trim()
    .slice(0, 10000) // Reasonable max length
}

/**
 * Sanitize stock symbol
 */
export function sanitizeSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10)
}

/**
 * Sanitize filename for uploads
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = filename.split(/[\\/]/).pop() || filename

  // Keep only safe characters
  return basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255)
}

/**
 * Sanitize phone number (Vietnamese format)
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digits except leading +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Ensure proper format
  if (cleaned.startsWith('+84')) {
    return cleaned
  }

  if (cleaned.startsWith('84')) {
    return `+${cleaned}`
  }

  if (cleaned.startsWith('0')) {
    return `+84${cleaned.slice(1)}`
  }

  return cleaned
}

// ============================================
// JSON SANITIZATION
// ============================================

/**
 * Deep clone and sanitize object keys/values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxDepth = 10
): T {
  if (maxDepth <= 0) return obj

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_')

    if (typeof value === 'string') {
      result[safeKey] = sanitizeInput(value)
    } else if (Array.isArray(value)) {
      result[safeKey] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeInput(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>, maxDepth - 1)
            : item
      )
    } else if (typeof value === 'object' && value !== null) {
      result[safeKey] = sanitizeObject(
        value as Record<string, unknown>,
        maxDepth - 1
      )
    } else {
      result[safeKey] = value
    }
  }

  return result as T
}

// ============================================
// NUMBER SANITIZATION
// ============================================

/**
 * Ensure number is within safe bounds
 */
export function sanitizeNumber(
  value: unknown,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  fallback = 0
): number {
  const num = Number(value)

  if (isNaN(num) || !isFinite(num)) {
    return fallback
  }

  return Math.min(Math.max(num, min), max)
}

/**
 * Sanitize price (VND format)
 */
export function sanitizePrice(value: unknown): number {
  const price = sanitizeNumber(value, 0, 100000000, 0)
  // Round to nearest 100 (minimum tick)
  return Math.round(price / 100) * 100
}

/**
 * Sanitize quantity (lot size 100)
 */
export function sanitizeQuantity(value: unknown): number {
  const qty = sanitizeNumber(value, 0, 10000000, 0)
  // Round to nearest 100
  return Math.round(qty / 100) * 100
}
