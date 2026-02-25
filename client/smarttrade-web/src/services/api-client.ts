/**
 * API Client for FinS Microservices
 * Replaces Supabase client with REST API calls
 */

// Gateway URL - all microservices are accessed through the gateway
// In production (Docker), use relative path to go through nginx proxy (same origin = no CORS)
// In development, use localhost:8080 directly
const API_BASE_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '' : 'http://localhost:8080');

// Token management
const TOKEN_KEY = 'fins_access_token';
const REFRESH_TOKEN_KEY = 'fins_refresh_token';

export const tokenStorage = {
    getAccessToken: () => localStorage.getItem(TOKEN_KEY),
    setAccessToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
    clearTokens: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};

interface RequestConfig extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T> {
    data: T;
    headers: Headers;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
        // If baseUrl is relative (starts with /), use window.location.origin as base
        // If baseUrl is empty, default to origin
        const base = (this.baseUrl && this.baseUrl.startsWith('http'))
            ? this.baseUrl
            : (window.location.origin + (this.baseUrl || ''));

        // Construct URL safely. Note: new URL(endpoint, base) handles leading slashes in endpoint
        const url = new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, base);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }
        return url.toString();
    }

    private getAuthHeaders(): HeadersInit {
        const token = tokenStorage.getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        const { params, ...fetchConfig } = config;
        const url = this.buildUrl(endpoint, params);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
            ...config.headers,
        };

        const response = await fetch(url, {
            ...fetchConfig,
            headers,
        });

        if (!response.ok) {
            // Handle 401 - try to refresh token
            if (response.status === 401) {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    // Retry the original request
                    return this.request<T>(endpoint, config);
                }
                // Clear tokens and throw
                tokenStorage.clearTokens();
            }

            const errorData = await response.json().catch(() => ({}));

            // Map error messages to Vietnamese friendly messages
            const errorMessage = this.getVietnameseErrorMessage(response.status, errorData, endpoint);
            throw new ApiError(response.status, errorMessage, errorData);
        }

        // Handle empty response (204 No Content)
        if (response.status === 204) {
            return { data: null as T, headers: response.headers };
        }

        const data = await response.json();
        return { data, headers: response.headers };
    }

    private getVietnameseErrorMessage(status: number, errorData: Record<string, unknown>, endpoint: string): string {
        // If backend provides a message, use it
        if (errorData.message && typeof errorData.message === 'string' && errorData.message !== 'Request failed') {
            return errorData.message;
        }

        // Map by endpoint + status for specific messages
        const isLoginEndpoint = endpoint.includes('/auth/login');
        const isRegisterEndpoint = endpoint.includes('/auth/register');
        const isResetPasswordEndpoint = endpoint.includes('/reset-password') || endpoint.includes('/forgot-password');

        switch (status) {
            case 400:
                if (isRegisterEndpoint) return 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.';
                if (isResetPasswordEndpoint) return 'Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.';
                return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.';

            case 401:
                if (isLoginEndpoint) return 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
                return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';

            case 403:
                if (isLoginEndpoint) return 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt.';
                return 'Bạn không có quyền thực hiện thao tác này.';

            case 404:
                return 'Không tìm thấy dữ liệu yêu cầu.';

            case 409:
                if (isRegisterEndpoint) return 'Email này đã được sử dụng. Vui lòng dùng email khác.';
                return 'Xung đột dữ liệu. Vui lòng thử lại.';

            case 423:
                return 'Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau 30 phút.';

            case 429:
                return 'Quá nhiều yêu cầu. Vui lòng đợi một lát và thử lại.';

            case 500:
            case 502:
            case 503:
                return 'Hệ thống đang bận. Vui lòng thử lại sau.';

            default:
                return 'Có lỗi xảy ra. Vui lòng thử lại sau.';
        }
    }

    private async tryRefreshToken(): Promise<boolean> {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${this.baseUrl}/services/userservice/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                tokenStorage.setAccessToken(data.token);
                if (data.refreshToken) {
                    tokenStorage.setRefreshToken(data.refreshToken);
                }
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    }

    // Convenience methods
    async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        const response = await this.request<T>(endpoint, { ...config, method: 'GET' });
        return response.data;
    }

    async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data;
    }

    async put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data;
    }

    async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data;
    }

    async delete<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...config,
            method: 'DELETE',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data;
    }
}

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(status: number, message: string, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Service-specific endpoints
export const API_ENDPOINTS = {
    // UserService
    auth: {
        login: '/services/userservice/api/auth/login',
        register: '/services/userservice/api/auth/register',
        logout: '/services/userservice/api/auth/logout',
        refresh: '/services/userservice/api/auth/refresh',
        me: '/services/userservice/api/auth/me',
        forgotPassword: '/services/userservice/api/auth/forgot-password',
        resetPassword: '/services/userservice/api/auth/reset-password',
        verifyEmail: '/services/userservice/api/auth/verify-email',
        resendActivation: '/services/userservice/api/auth/resend-activation',
        changePassword: '/services/userservice/api/auth/change-password',
        activate: '/services/userservice/api/auth/activate',
        deleteAccount: '/services/userservice/api/auth/account',
        // Session management
        sessions: '/services/userservice/api/auth/sessions',
        revokeSession: (id: string) => `/services/userservice/api/auth/sessions/${id}`,
        logoutAllDevices: '/services/userservice/api/auth/sessions/logout-all',
        sessionsCount: '/services/userservice/api/auth/sessions/count',
    },
    watchlist: {
        base: '/services/userservice/api/public/watchlist',
        bySymbol: (symbol: string) => `/services/userservice/api/public/watchlist/${symbol}`,
        check: (symbol: string) => `/services/userservice/api/public/watchlist/check/${symbol}`,
    },
    userProfile: '/services/userservice/api/user-profiles',

    // StockService
    stocks: {
        all: '/services/stockservice/api/public/stocks',
        bySymbol: (symbol: string) => `/services/stockservice/api/public/stocks/${symbol}`,
        quote: (symbol: string) => `/services/stockservice/api/public/stocks/${symbol}/quote`,
        history: (symbol: string) => `/services/stockservice/api/public/stocks/${symbol}/history`,
        chart: (symbol: string) => `/services/stockservice/api/public/stocks/${symbol}/chart`,
        statistics: (symbol: string) => `/services/stockservice/api/public/stocks/${symbol}/statistics`,
        financials: (symbol: string) => `/services/stockservice/api/public/stocks/${symbol}/financials`,
        intraday: (symbol: string) => `/services/stockservice/api/public/stocks/${symbol}/intraday`,
        trending: '/services/stockservice/api/public/stocks/trending',
        gainers: '/services/stockservice/api/public/stocks/gainers',
        losers: '/services/stockservice/api/public/stocks/losers',
        search: '/services/stockservice/api/public/stocks/search',
    },

    // NewsService
    news: {
        all: '/services/newsservice/api/public/news',
        byId: (id: string) => `/services/newsservice/api/public/news/${id}`,
        bySymbol: (symbol: string) => `/services/newsservice/api/public/news/symbol/${symbol}`,
        trending: '/services/newsservice/api/public/news/trending',
        search: '/services/newsservice/api/public/news/search',
    },

    // NotificationService - Simplified for AI and News only
    notifications: {
        // Public notification endpoints (authenticated)
        all: '/services/notificationservice/api/public/notifications',
        unreadCount: '/services/notificationservice/api/public/notifications/unread-count',
        markRead: (id: string) => `/services/notificationservice/api/public/notifications/${id}/read`,
        markAllRead: '/services/notificationservice/api/public/notifications/read-all',
        delete: (id: string) => `/services/notificationservice/api/public/notifications/${id}`,
        deleteAll: '/services/notificationservice/api/public/notifications',
    },

    // AIService (Python - Prophet predictions)
    ai: {
        predict: '/services/aiservice/api/predict',
        predictBatch: '/services/aiservice/api/predict/batch',
        forecast: (symbol: string) => `/services/aiservice/api/forecast/${symbol}`,
        recommendation: (symbol: string) => `/services/aiservice/api/recommendation/${symbol}`,
        generateRecommendation: '/services/aiservice/api/recommendation/generate',
        symbols: '/services/aiservice/api/symbols',
        health: '/services/aiservice/health',
    },

    // AIToolsService (Java - Gemini AI)
    aitools: {
        // Market Insights (Public)
        insightsToday: '/services/aitoolsservice/api/public/ai/insights/today',
        insights: '/services/aitoolsservice/api/public/ai/insights',
        generateInsights: '/services/aitoolsservice/api/public/ai/insights/generate',

        // Industry Analysis (Public)
        industries: '/services/aitoolsservice/api/public/ai/industries',
        industriesToday: '/services/aitoolsservice/api/public/ai/industries/today',

        // Research Reports (Public)
        research: '/services/aitoolsservice/api/public/ai/research',
        researchBySymbol: (symbol: string) => `/services/aitoolsservice/api/public/ai/research/${symbol}`,
        generateResearch: (symbol: string) => `/services/aitoolsservice/api/public/ai/research/${symbol}`,

        // AI Chat (Public)
        chat: '/services/aitoolsservice/api/public/ai/chat',
        chatHistory: '/services/aitoolsservice/api/ai/chat/history', // Auth required for user history

        // Advanced Insights (Public - Uses separate AI model)
        topMovers: '/services/aitoolsservice/api/public/ai/insights/top-movers',
        weeklyOutlook: '/services/aitoolsservice/api/public/ai/insights/weekly-outlook',
        tradingSignals: '/services/aitoolsservice/api/public/ai/insights/trading-signals',
        correlation: '/services/aitoolsservice/api/public/ai/insights/correlation',

        // Watchlist Research (AI-powered watchlist analysis)
        watchlistResearch: '/services/aitoolsservice/api/public/ai/research/watchlist',
        watchlistAlerts: '/services/aitoolsservice/api/public/ai/research/watchlist/alerts',
        watchlistComparison: '/services/aitoolsservice/api/public/ai/research/watchlist/comparison',
        watchlistStockResearch: (symbol: string) => `/services/aitoolsservice/api/public/ai/research/watchlist/stock/${symbol}`,
    },
};
