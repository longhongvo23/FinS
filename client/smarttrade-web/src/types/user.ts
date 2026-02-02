/**
 * User Types for FinS
 * Mapped from FinS Microservices DTOs
 */

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string

  // FinS specific fields
  login?: string
  activated?: boolean
  emailVerified?: boolean
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  authorities?: { name: string }[]

  // KYC (simplified for display)
  kyc_status: 'pending' | 'verified' | 'rejected'

  // Investment Profile
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
  investment_goal?: 'growth' | 'income' | 'preservation' | 'speculation'
  experience_level?: 'beginner' | 'intermediate' | 'advanced'

  // Subscription (simplified)
  subscription_tier: 'free' | 'premium' | 'vip'
  subscription_expires_at?: string

  // Settings
  theme: 'dark' | 'light' | 'auto'
  language: string
  notification_settings: NotificationSettings

  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  price_alerts: boolean
  order_updates: boolean
  ai_insights: boolean
  news: boolean
  email: boolean
  push: boolean
}

// TradingAccount removed - not in FinS scope
