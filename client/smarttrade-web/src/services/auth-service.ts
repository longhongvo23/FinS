/**
 * Auth Service for FinS Microservices
 * Replaces Supabase Auth with JWT-based authentication
 */

import { apiClient, API_ENDPOINTS, tokenStorage, ApiError } from './api-client'
import type { User } from '@/types'

// Types matching backend LoginVM
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

// Types matching backend AuthResponseVM
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  login: string
  email: string
  fullName?: string
  avatarUrl?: string
  authorities: string[]
}

// Types matching backend MessageResponseVM
export interface MessageResponse {
  message: string
  success?: boolean
}

// Types matching backend RegisterVM
export interface RegisterRequest {
  login: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  language?: string
}

export interface AuthUser {
  id: string
  login: string
  email: string
  activated: boolean
  emailVerified: boolean
  authorities: { name: string }[]
  createdDate?: string
  lastLoginDate?: string
  full_name: string
  avatar_url?: string
}

export const authService = {
  /**
   * Sign up with full details (login, firstName, lastName, email, password)
   * Endpoint: POST /api/auth/register
   */
  async signUpWithDetails(data: {
    login: string
    email: string
    password: string
    firstName?: string
    lastName?: string
  }): Promise<{ message: string }> {
    const registerData: RegisterRequest = {
      login: data.login.toLowerCase(),
      email: data.email.toLowerCase(),
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      language: 'vi',
    }

    const response = await apiClient.post<MessageResponse>(API_ENDPOINTS.auth.register, registerData)
    return { message: response.message }
  },

  /**
   * Sign up with email and password (legacy - auto-generates login from email)
   * Endpoint: POST /api/auth/register
   */
  async signUp(email: string, password: string, fullName?: string): Promise<{ message: string }> {
    const nameParts = fullName?.split(' ') || []
    const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts[0] : undefined

    const registerData: RegisterRequest = {
      login: email.split('@')[0].toLowerCase(), // Use email prefix as login
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      language: 'vi',
    }

    const response = await apiClient.post<MessageResponse>(API_ENDPOINTS.auth.register, registerData)
    return { message: response.message }
  },

  /**
   * Sign in with username/email and password
   * Endpoint: POST /api/auth/login
   */
  async signIn(email: string, password: string, rememberMe = true): Promise<{ user: AuthUser; session: LoginResponse }> {
    const loginData: LoginRequest = {
      username: email.toLowerCase(),
      password,
      rememberMe,
    }

    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, loginData)

    // Store tokens
    tokenStorage.setAccessToken(response.accessToken)
    if (response.refreshToken) {
      tokenStorage.setRefreshToken(response.refreshToken)
    }

    // Create user object from login response
    const user: AuthUser = {
      id: response.login, // Use login as ID since it's unique
      login: response.login,
      email: response.email,
      full_name: response.fullName || response.login,
      avatar_url: response.avatarUrl,
      activated: true, // Login was successful, so activated
      emailVerified: true,
      authorities: response.authorities.map(auth => ({ name: auth })),
    }

    return {
      user,
      session: response,
    }
  },

  /**
   * Sign out
   * Endpoint: POST /api/auth/logout
   */
  async signOut(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout)
    } catch (error) {
      console.warn('Logout API call failed, clearing local tokens anyway')
    } finally {
      tokenStorage.clearTokens()
    }
  },

  /**
   * Get current session (check if token exists and is valid)
   */
  async getSession(): Promise<{ token: string } | null> {
    const token = tokenStorage.getAccessToken()
    if (!token) return null

    try {
      // Validate token by fetching current user
      await this.getCurrentUser()
      return { token }
    } catch (error) {
      tokenStorage.clearTokens()
      return null
    }
  },

  /**
   * Get current user profile
   * Endpoint: GET /api/auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    const token = tokenStorage.getAccessToken()
    if (!token) return null

    try {
      const data = await apiClient.get<any>(API_ENDPOINTS.auth.me)

      // Map backend DTO (camelCase) to frontend User (snake_case)
      const user: User = {
        ...data,
        full_name: data.fullName || data.login,
        avatar_url: data.avatarUrl,
        // Ensure other fields are mapped if necessary, otherwise rely on spreading data
      }
      return user
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        tokenStorage.clearTokens()
        return null
      }
      throw error
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await apiClient.patch(`${API_ENDPOINTS.userProfile}/${userId}`, updates)
    // Fetch fresh user data to ensure we have the full object with correct mapping
    const refreshedUser = await this.getCurrentUser()
    if (!refreshedUser) {
      throw new Error('Failed to refresh user profile')
    }
    return refreshedUser
  },

  /**
   * Request password reset
   * Endpoint: POST /api/auth/forgot-password
   */
  async resetPassword(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email: email.toLowerCase() })
  },

  /**
   * Reset password with token
   * Endpoint: POST /api/auth/reset-password
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.resetPassword, { token, newPassword })
  },

  /**
   * Change password (for authenticated user)
   * Endpoint: POST /api/auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.changePassword, {
      currentPassword,
      newPassword,
    })
  },

  /**
   * Verify email / Activate account with token
   * Endpoint: GET /api/auth/activate?key=xxx
   */
  async activateAccount(key: string): Promise<MessageResponse> {
    const response = await apiClient.get<MessageResponse>(API_ENDPOINTS.auth.activate, { params: { key } })
    return response
  },

  /**
   * Verify email with token (alias for activateAccount)
   * Endpoint: GET /api/auth/verify-email?token=xxx
   */
  async verifyEmail(token: string): Promise<MessageResponse> {
    const response = await apiClient.get<MessageResponse>(API_ENDPOINTS.auth.verifyEmail, { params: { token } })
    return response
  },

  /**
   * Resend activation email
   * Endpoint: POST /api/auth/resend-activation
   */
  async resendActivation(email: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(API_ENDPOINTS.auth.resendActivation, { email: email.toLowerCase() })
    return response
  },

  /**
   * Delete user account
   * Endpoint: DELETE /api/auth/account
   */
  async deleteAccount(password: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(API_ENDPOINTS.auth.deleteAccount, { password })
    tokenStorage.clearTokens()
    return response
  },

  /**
   * Subscribe to auth changes
   * Note: This is a simplified version since we don't have real-time auth like Supabase
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    // Check auth state periodically or on storage events
    const checkAuth = async () => {
      const session = await this.getSession()
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
    }

    // Listen to storage events (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fins_access_token') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('storage', handleStorageChange)
          },
        },
      },
    }
  },
}
