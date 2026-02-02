/**
 * Session Service for FinS
 * Manages user login sessions across devices
 */

import { apiClient, API_ENDPOINTS } from './api-client'
import { Capacitor } from '@capacitor/core'

// Types for session data
export interface SessionInfo {
    id: string
    deviceName: string
    deviceType: 'WEB' | 'MOBILE_IOS' | 'MOBILE_ANDROID' | 'TABLET' | 'DESKTOP_APP'
    browserName?: string
    browserVersion?: string
    osName?: string
    osVersion?: string
    location?: string
    ipAddress?: string
    loginTime: string
    lastActivityTime?: string
    lastActive: string
    current: boolean
}

export interface MessageResponse {
    message: string
    success?: boolean
}

/**
 * Generate a simple device ID based on browser fingerprint
 * This is used when native device ID is not available
 */
function generateBrowserDeviceId(): string {
    try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl')
        const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info')
        const renderer = debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'

        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset(),
            screen.width,
            screen.height,
            renderer
        ].join('|')

        // Simple hash function
        let hash = 0
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }

        return `web-${Math.abs(hash).toString(36)}`
    } catch {
        return `web-${Date.now().toString(36)}`
    }
}

/**
 * Get device ID - generates a consistent ID for the device
 */
async function getDeviceId(): Promise<string | undefined> {
    // For now, use browser-based device ID for all platforms
    // Native device ID will be sent via User-Agent parsing on backend
    return generateBrowserDeviceId()
}

/**
 * Get device headers for API requests
 * These headers help the backend identify the device
 */
async function getDeviceHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}

    const deviceId = await getDeviceId()
    if (deviceId) {
        headers['X-Device-Id'] = deviceId
    }

    // Add platform info
    if (Capacitor.isNativePlatform()) {
        headers['X-Device-Platform'] = Capacitor.getPlatform()
    }

    return headers
}

export const sessionService = {
    /**
     * Get all active sessions for the current user
     */
    async getSessions(): Promise<SessionInfo[]> {
        const sessions = await apiClient.get<SessionInfo[]>(API_ENDPOINTS.auth.sessions)
        return sessions
    },

    /**
     * Revoke (logout) a specific session by ID
     * @param sessionId The ID of the session to revoke
     */
    async revokeSession(sessionId: string): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(
            API_ENDPOINTS.auth.revokeSession(sessionId)
        )
        return response
    },

    /**
     * Logout from all other devices (except current)
     */
    async logoutAllOtherDevices(): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(
            API_ENDPOINTS.auth.logoutAllDevices
        )
        return response
    },

    /**
     * Get the count of active sessions
     */
    async getSessionCount(): Promise<number> {
        const count = await apiClient.get<number>(API_ENDPOINTS.auth.sessionsCount)
        return count
    },

    /**
     * Get device headers to include in login request (for mobile apps)
     * This should be used when making login API calls
     */
    getDeviceHeaders,

    /**
     * Get device ID (for mobile apps)
     */
    getDeviceId,

    /**
     * Format the device display name for UI
     */
    formatDeviceName(session: SessionInfo): string {
        if (session.deviceName) {
            return session.deviceName
        }

        const browser = session.browserName || 'Browser'
        const os = session.osName || 'Unknown'
        return `${browser} on ${os}`
    },

    /**
     * Get device icon based on device type
     */
    getDeviceIcon(deviceType: string): 'smartphone' | 'tablet' | 'monitor' | 'laptop' {
        switch (deviceType) {
            case 'MOBILE_IOS':
            case 'MOBILE_ANDROID':
                return 'smartphone'
            case 'TABLET':
                return 'tablet'
            case 'DESKTOP_APP':
                return 'laptop'
            case 'WEB':
            default:
                return 'monitor'
        }
    },

    /**
     * Check if the session is from a mobile device
     */
    isMobileSession(session: SessionInfo): boolean {
        return ['MOBILE_IOS', 'MOBILE_ANDROID'].includes(session.deviceType)
    },
}
