/**
 * Feature Flags - Gradual rollout and A/B testing support
 * Production-ready feature management
 */

// ============================================
// TYPES
// ============================================

interface FeatureFlag {
  key: string
  enabled: boolean
  rolloutPercentage?: number // 0-100
  enabledForUsers?: string[]
  enabledForTiers?: ('free' | 'premium' | 'enterprise')[]
  expiresAt?: string // ISO date
}

interface UserContext {
  userId?: string
  tier?: 'free' | 'premium' | 'enterprise'
  isAdmin?: boolean
}

// ============================================
// FEATURE FLAG DEFINITIONS
// ============================================

const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Core Features
  DEMO_MODE: {
    key: 'DEMO_MODE',
    enabled: import.meta.env.VITE_DEMO_MODE === 'true',
  },

  // AI Features
  AI_CHAT: {
    key: 'AI_CHAT',
    enabled: true,
    enabledForTiers: ['free', 'premium', 'enterprise'],
  },
  AI_RESEARCH: {
    key: 'AI_RESEARCH',
    enabled: true,
    enabledForTiers: ['premium', 'enterprise'],
  },
  AI_AUTO_TRADE: {
    key: 'AI_AUTO_TRADE',
    enabled: false, // Not released yet
    enabledForTiers: ['enterprise'],
  },

  // Smart Alerts
  SMART_ALERTS: {
    key: 'SMART_ALERTS',
    enabled: true,
    enabledForTiers: ['free', 'premium', 'enterprise'],
  },
  SMART_ALERTS_UNLIMITED: {
    key: 'SMART_ALERTS_UNLIMITED',
    enabled: true,
    enabledForTiers: ['premium', 'enterprise'],
  },

  // Trading Features
  MARGIN_TRADING: {
    key: 'MARGIN_TRADING',
    enabled: false,
    rolloutPercentage: 0,
  },
  DERIVATIVES: {
    key: 'DERIVATIVES',
    enabled: true,
    enabledForTiers: ['premium', 'enterprise'],
  },

  // UI Features
  NEW_DASHBOARD: {
    key: 'NEW_DASHBOARD',
    enabled: true,
    rolloutPercentage: 100,
  },
  DARK_MODE: {
    key: 'DARK_MODE',
    enabled: true,
  },
  MOBILE_APP_BANNER: {
    key: 'MOBILE_APP_BANNER',
    enabled: false,
  },

  // Analytics
  ANALYTICS_V2: {
    key: 'ANALYTICS_V2',
    enabled: true,
    enabledForTiers: ['enterprise'],
  },

  // Experimental
  REAL_TIME_QUOTES: {
    key: 'REAL_TIME_QUOTES',
    enabled: true,
    enabledForTiers: ['premium', 'enterprise'],
  },
  SOCIAL_TRADING: {
    key: 'SOCIAL_TRADING',
    enabled: false,
    rolloutPercentage: 0,
  },
}

// ============================================
// FEATURE FLAG CHECKER
// ============================================

class FeatureFlagManager {
  private context: UserContext = {}
  private overrides: Map<string, boolean> = new Map()

  /**
   * Set user context for evaluation
   */
  setContext(context: UserContext): void {
    this.context = context
  }

  /**
   * Get current context
   */
  getContext(): UserContext {
    return this.context
  }

  /**
   * Override a flag locally (for testing)
   */
  override(key: string, enabled: boolean): void {
    this.overrides.set(key, enabled)
  }

  /**
   * Clear all overrides
   */
  clearOverrides(): void {
    this.overrides.clear()
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(key: string): boolean {
    // Check local override first
    if (this.overrides.has(key)) {
      return this.overrides.get(key)!
    }

    const flag = FEATURE_FLAGS[key]
    if (!flag) {
      console.warn(`Unknown feature flag: ${key}`)
      return false
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false
    }

    // Check expiration
    if (flag.expiresAt && new Date(flag.expiresAt) < new Date()) {
      return false
    }

    // Admin always gets access
    if (this.context.isAdmin) {
      return true
    }

    // Check user-specific enablement
    if (flag.enabledForUsers?.length) {
      if (!this.context.userId || !flag.enabledForUsers.includes(this.context.userId)) {
        return false
      }
    }

    // Check tier-specific enablement
    if (flag.enabledForTiers?.length) {
      if (!this.context.tier || !flag.enabledForTiers.includes(this.context.tier)) {
        return false
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      return this.isInRollout(flag.key, flag.rolloutPercentage)
    }

    return true
  }

  /**
   * Check if user is in rollout percentage
   * Uses consistent hashing for stable experience
   */
  private isInRollout(flagKey: string, percentage: number): boolean {
    const userId = this.context.userId || 'anonymous'
    const hash = this.simpleHash(`${flagKey}:${userId}`)
    return (hash % 100) < percentage
  }

  /**
   * Simple hash function for consistent rollout
   */
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get all flags with their status
   */
  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {}
    for (const key of Object.keys(FEATURE_FLAGS)) {
      result[key] = this.isEnabled(key)
    }
    return result
  }

  /**
   * Get flag definition
   */
  getFlag(key: string): FeatureFlag | undefined {
    return FEATURE_FLAGS[key]
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const featureFlags = new FeatureFlagManager()

// ============================================
// REACT HOOK
// ============================================

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function useFeatureFlag(key: string): boolean {
  const user = useAuthStore((state) => state.user)

  return useMemo(() => {
    // Update context with current user
    featureFlags.setContext({
      userId: user?.id,
      tier: user?.subscription_tier as 'free' | 'premium' | 'enterprise',
    })

    return featureFlags.isEnabled(key)
  }, [key, user?.id, user?.subscription_tier])
}

export function useFeatureFlags(keys: string[]): Record<string, boolean> {
  const user = useAuthStore((state) => state.user)

  return useMemo(() => {
    featureFlags.setContext({
      userId: user?.id,
      tier: user?.subscription_tier as 'free' | 'premium' | 'enterprise',
    })

    const result: Record<string, boolean> = {}
    for (const key of keys) {
      result[key] = featureFlags.isEnabled(key)
    }
    return result
  }, [keys, user?.id, user?.subscription_tier])
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export const FLAGS = Object.keys(FEATURE_FLAGS).reduce((acc, key) => {
  acc[key] = key
  return acc
}, {} as Record<string, string>)

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return featureFlags.isEnabled('DEMO_MODE')
}

/**
 * Check if user has premium features
 */
export function hasPremiumAccess(): boolean {
  const tier = featureFlags.getContext().tier
  return tier === 'premium' || tier === 'enterprise'
}
