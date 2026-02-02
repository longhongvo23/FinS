/**
 * Validation Schemas - Production-ready input validation
 * Using Zod for runtime type safety
 */

import { z } from 'zod'

// ============================================
// AUTH VALIDATIONS
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255, 'Email too long')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[\p{L}\s'-]+$/u, 'Invalid name characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const phoneSchema = z
  .string()
  .regex(/^(0|\+84)[0-9]{9,10}$/, 'Invalid Vietnamese phone number')

// ============================================
// TRADING VALIDATIONS
// ============================================

export const stockSymbolSchema = z
  .string()
  .min(2, 'Symbol too short')
  .max(10, 'Symbol too long')
  .regex(/^[A-Z0-9]+$/, 'Invalid symbol format')
  .transform((s) => s.toUpperCase())

export const orderSchema = z.object({
  symbol: stockSymbolSchema,
  quantity: z
    .number()
    .int('Quantity must be whole number')
    .min(100, 'Minimum 100 shares')
    .max(1000000, 'Maximum 1,000,000 shares')
    .refine((n) => n % 100 === 0, 'Quantity must be multiple of 100'),
  price: z
    .number()
    .positive('Price must be positive')
    .max(10000000, 'Price too high'),
  orderType: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  side: z.enum(['buy', 'sell']),
})

export const alertConditionSchema = z.object({
  indicator: z.enum(['price', 'volume', 'rsi', 'macd', 'ma', 'bb', 'change_percent']),
  operator: z.enum(['>=', '<=', '=', '>', '<', 'crosses_above', 'crosses_below', 'touches_upper', 'touches_lower']),
  value: z.number(),
  valueSecondary: z.number().optional(),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']).default('1d'),
})

export const smartAlertSchema = z.object({
  name: z
    .string()
    .min(2, 'Name too short')
    .max(100, 'Name too long'),
  symbol: stockSymbolSchema,
  conditions: z
    .array(alertConditionSchema)
    .min(1, 'At least one condition required')
    .max(5, 'Maximum 5 conditions'),
  logicOperator: z.enum(['AND', 'OR']).default('AND'),
  checkInterval: z.enum(['1m', '5m', '15m', '1h']).default('5m'),
  notificationChannels: z.array(z.enum(['push', 'in_app', 'email'])).default(['in_app']),
  expiresAt: z.string().datetime().optional(),
})

// ============================================
// SCREENER VALIDATIONS
// ============================================

export const screenerFilterSchema = z.object({
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().max(100000000).optional(),
  changeMin: z.number().min(-100).optional(),
  changeMax: z.number().max(100).optional(),
  volumeMin: z.number().min(0).optional(),
  volumeMax: z.number().optional(),
  peMin: z.number().optional(),
  peMax: z.number().optional(),
  pbMin: z.number().optional(),
  pbMax: z.number().optional(),
  marketCap: z.enum(['small', 'mid', 'large', 'all']).optional(),
  exchanges: z.array(z.enum(['HOSE', 'HNX', 'UPCOM'])).optional(),
  sectors: z.array(z.string().max(100)).optional(),
}).refine((data) => {
  if (data.priceMin !== undefined && data.priceMax !== undefined) {
    return data.priceMin <= data.priceMax
  }
  return true
}, { message: 'Min price must be less than max price' })

// ============================================
// PROFILE VALIDATIONS
// ============================================

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[\p{L}\s'-]+$/u)
    .optional(),
  phone: phoneSchema.optional(),
  avatar_url: z.string().url().optional(),
  risk_tolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  investment_goal: z.enum(['growth', 'income', 'preservation', 'speculation']).optional(),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  notification_settings: z.object({
    price_alerts: z.boolean(),
    order_updates: z.boolean(),
    ai_insights: z.boolean(),
    news: z.boolean(),
    email: z.boolean(),
    push: z.boolean(),
  }).optional(),
})

// ============================================
// AI CHAT VALIDATIONS
// ============================================

export const chatMessageSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message too long (max 2000 characters)')
  .transform((s) => s.trim())

export const aiContextSchema = z.object({
  symbol: stockSymbolSchema.optional(),
  portfolio: z.array(z.object({
    symbol: stockSymbolSchema,
    quantity: z.number(),
    avgCost: z.number(),
  })).optional(),
  watchlist: z.array(stockSymbolSchema).optional(),
})

// ============================================
// SEARCH & PAGINATION
// ============================================

export const searchQuerySchema = z
  .string()
  .max(100, 'Search query too long')
  .transform((s) => s.trim())
  .refine((s) => !/[<>'"`;]/.test(s), 'Invalid characters in search')

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type SmartAlertInput = z.infer<typeof smartAlertSchema>
export type ScreenerFilterInput = z.infer<typeof screenerFilterSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PaginationInput = z.infer<typeof paginationSchema>

// ============================================
// VALIDATION HELPER
// ============================================

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  }
}
