/**
 * Notification Service for FinS Microservices
 * Supports AI, News, and Price notifications
 */

import { apiClient, API_ENDPOINTS } from './api-client'

// Notification categories - AI, News, and Price
export type NotificationCategory = 'AI_INSIGHT' | 'NEWS' | 'PRICE'

// Updated NotificationVM to match backend NotificationDTO
export interface NotificationVM {
    id: string
    userId: string
    title: string
    content?: string
    isRead: boolean
    category: NotificationCategory
    type?: 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP'
    status?: 'PENDING' | 'SENT' | 'FAILED'
    recipient?: string
    subject?: string
    createdAt: string
    sentAt?: string
    readAt?: string
    errorMessage?: string
    metadata?: string // JSON string with symbol, etc.
    // Legacy support
    read?: boolean
}

export const notificationService = {
    /**
     * Get user notifications with optional filters
     */
    async getNotifications(options?: {
        category?: NotificationCategory
        read?: boolean
        page?: number
        size?: number
    }): Promise<NotificationVM[]> {
        const params: Record<string, string | number | boolean | undefined> = {
            page: options?.page || 0,
            size: options?.size || 20,
        }
        if (options?.category) {
            params.category = options.category
        }
        if (options?.read !== undefined) {
            params.read = options.read
        }
        return apiClient.get<NotificationVM[]>(API_ENDPOINTS.notifications.all, { params })
    },

    /**
     * Get unread notifications - using the all endpoint with read filter
     */
    async getUnreadNotifications(options?: {
        page?: number
        size?: number
    }): Promise<NotificationVM[]> {
        return this.getNotifications({
            read: false,
            page: options?.page || 0,
            size: options?.size || 20,
        })
    },

    /**
     * Get unread count
     */
    async getUnreadCount(): Promise<number> {
        return apiClient.get<number>(API_ENDPOINTS.notifications.unreadCount)
    },

    /**
     * Mark notification as read
     */
    async markAsRead(id: string): Promise<NotificationVM> {
        return apiClient.put<NotificationVM>(API_ENDPOINTS.notifications.markRead(id))
    },

    /**
     * Mark all as read
     */
    async markAllAsRead(): Promise<{ updated: number }> {
        return apiClient.patch<{ updated: number }>(API_ENDPOINTS.notifications.markAllRead)
    },

    /**
     * Delete notification
     */
    async deleteNotification(id: string): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.notifications.delete(id))
    },

    /**
     * Delete all notifications
     */
    async deleteAllNotifications(): Promise<{ deleted: number }> {
        return apiClient.delete<{ deleted: number }>(API_ENDPOINTS.notifications.deleteAll)
    },
}
