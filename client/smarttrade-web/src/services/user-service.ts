/**
 * User Profile Service
 * Handles user profile operations
 */

import { apiClient, API_ENDPOINTS } from './api-client';

export interface UserProfile {
    login: string;
    email: string;
    emailVerified?: boolean;
    fullName?: string;
    phoneNumber?: string;
    phoneVerified?: boolean;
    country?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    bio?: string;
    language?: string;
    timezone?: string;
    profileVisibility?: string;
    showEmail?: boolean;
    showPhone?: boolean;
    // Investment profile
    riskTolerance?: string;
    investmentGoal?: string;
    investmentExperience?: string;
}

export interface UpdateProfileRequest {
    fullName?: string;
    phoneNumber?: string;
    country?: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    bio?: string;
    language?: string;
    timezone?: string;
    profileVisibility?: string;
    showEmail?: boolean;
    showPhone?: boolean;
    // Investment profile
    riskTolerance?: string;
    investmentGoal?: string;
    investmentExperience?: string;
}

class UserService {
    /**
     * Get current user's profile
     */
    async getMyProfile(): Promise<UserProfile> {
        return await apiClient.get<UserProfile>('/services/userservice/api/public/users/me');
    }

    /**
     * Update current user's profile
     */
    async updateMyProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
        return await apiClient.put<UserProfile>('/services/userservice/api/public/users/me', profileData);
    }

    /**
     * Delete current user's account
     */
    async deleteMyProfile(): Promise<void> {
        return await apiClient.delete<void>('/services/userservice/api/public/users/me');
    }

    /**
     * Upload avatar image
     * @param file The image file to upload
     * @returns The new avatar URL (base64 data URL)
     */
    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const rawBaseUrl = import.meta.env.VITE_API_URL || '';
        const baseUrl = (rawBaseUrl && rawBaseUrl.startsWith('http'))
            ? rawBaseUrl
            : (window.location.origin + (rawBaseUrl || ''));

        const response = await fetch(`${baseUrl}/services/userservice/api/public/users/me/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('fins_access_token')}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    }

    /**
     * Delete avatar image
     */
    async deleteAvatar(): Promise<void> {
        await apiClient.delete<void>('/services/userservice/api/public/users/me/avatar');
    }
}

export const userService = new UserService();

