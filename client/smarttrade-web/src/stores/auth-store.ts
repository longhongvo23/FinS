/**
 * Auth Store for FinS Microservices
 * Uses JWT authentication instead of Supabase
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authService } from '@/services/auth-service'
import { userService } from '@/services/user-service'
import { tokenStorage } from '@/services/api-client'
import { useAIStore } from '@/stores/ai-store'

// Demo mode - set to true to enable demo login without backend
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

// Demo user for testing
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@fins.vn',
  full_name: 'Demo User',
  phone: '0912345678',
  avatar_url: undefined,
  kyc_status: 'verified',
  risk_tolerance: 'moderate',
  investment_goal: 'growth',
  experience_level: 'intermediate',
  subscription_tier: 'premium',
  theme: 'dark',
  language: 'vi',
  notification_settings: {
    price_alerts: true,
    order_updates: true,
    ai_insights: true,
    news: true,
    email: true,
    push: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Guest user for demo without login
const GUEST_USER: User = {
  id: 'guest-user-001',
  email: 'guest@smarttrade.ai',
  full_name: 'Guest',
  phone: '',
  avatar_url: undefined,
  kyc_status: 'pending',
  risk_tolerance: 'moderate',
  investment_goal: 'growth',
  experience_level: 'beginner',
  subscription_tier: 'free',
  theme: 'dark',
  language: 'vi',
  notification_settings: {
    price_alerts: false,
    order_updates: false,
    ai_insights: false,
    news: true,
    email: false,
    push: false,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInAsGuest: () => void
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  updateLocalUser: (updates: Partial<User>) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
      error: null,

      initialize: async () => {
        try {
          set({ isLoading: true })

          // Check for existing token
          const token = tokenStorage.getAccessToken()

          // Check if guest mode from storage
          const { isGuest, isAuthenticated } = get()
          if (isGuest) {
            set({
              user: GUEST_USER,
              isLoading: false,
            })
            return
          }

          // Demo mode - check if already authenticated from storage
          if (DEMO_MODE) {
            const { isAuthenticated } = get()
            if (isAuthenticated) {
              set({
                user: DEMO_USER,
                isLoading: false,
              })
            } else {
              set({ isLoading: false })
            }
            return
          }

          if (token) {
            // Validate token by fetching current user
            const user = await authService.getCurrentUser()

            if (user) {
              // Set current user for AI store to use separate chat history
              useAIStore.getState().setCurrentUser(user.id)

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              })
            } else {
              // Token invalid - clear it
              tokenStorage.clearTokens()
              useAIStore.getState().setCurrentUser(null)
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              })
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch {
          tokenStorage.clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            error: 'Failed to initialize auth',
            isLoading: false,
          })
        }
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null })

          // Demo mode - accept any credentials
          if (DEMO_MODE) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800))

            set({
              user: { ...DEMO_USER, email },
              isAuthenticated: true,
              isGuest: false,
              isLoading: false,
            })
            return
          }

          const { user } = await authService.signIn(email, password)

          // Fetch profile to get avatar (in case login response doesn't have it)
          let avatarUrl = user.avatar_url
          let fullName = user.full_name
          try {
            const profile = await userService.getMyProfile()
            if (profile.avatarUrl) {
              avatarUrl = profile.avatarUrl
            }
            if (profile.fullName) {
              fullName = profile.fullName
            }
          } catch (e) {
            console.warn('Could not fetch profile for avatar:', e)
          }

          // Set current user for AI store to use separate chat history
          useAIStore.getState().setCurrentUser(user.id)

          set({
            user: { ...user, avatar_url: avatarUrl, full_name: fullName } as unknown as User,
            isAuthenticated: true,
            isGuest: false,
            isLoading: false,
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Đăng nhập thất bại'
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      signInAsGuest: () => {
        set({
          user: GUEST_USER,
          isAuthenticated: true,
          isGuest: true,
          isLoading: false,
          error: null,
        })
      },

      signUp: async (email, password, fullName) => {
        try {
          set({ isLoading: true, error: null })

          await authService.signUp(email, password, fullName)
          // Note: User needs to verify email before signing in

          set({ isLoading: false })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Đăng ký thất bại'
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      signOut: async () => {
        try {
          const { isGuest } = get()
          if (!DEMO_MODE && !isGuest) {
            await authService.signOut()
          }
          tokenStorage.clearTokens()
          // Clear current user from AI store so next user gets their own chat
          useAIStore.getState().setCurrentUser(null)
          set({
            user: null,
            isAuthenticated: false,
            isGuest: false,
          })
        } catch (error: unknown) {
          // Clear anyway even if logout request fails
          tokenStorage.clearTokens()
          useAIStore.getState().setCurrentUser(null)
          const message = error instanceof Error ? error.message : 'Đăng xuất thất bại'
          set({
            user: null,
            isAuthenticated: false,
            isGuest: false,
            error: message
          })
        }
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return

        try {
          const updated = await authService.updateProfile(user.id, updates)
          set({ user: updated })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Cập nhật thất bại'
          set({ error: message })
          throw error
        }
      },

      updateLocalUser: (updates) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, ...updates } })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'fins-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
)
