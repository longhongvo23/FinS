/**
 * News Service for FinS Microservices
 * Fetches news from NewsService
 */

import { apiClient, API_ENDPOINTS } from './api-client'

export interface NewsListVM {
    id: string
    title: string
    description?: string
    snippet?: string
    imageUrl?: string
    source: string
    publishedAt: string
    symbols?: string[]
}

export interface NewsDetailVM extends NewsListVM {
    url: string
    language?: string
    keywords?: string
    relevanceScore?: number
    relatedCompanies?: RelatedCompany[]
}

export interface RelatedCompany {
    symbol: string
    name?: string
    exchange?: string
}

export const newsService = {
    /**
     * Get latest news
     */
    async getLatestNews(limit = 50): Promise<NewsListVM[]> {
        return apiClient.get<NewsListVM[]>(API_ENDPOINTS.news.all, {
            params: { limit }
        })
    },

    /**
     * Get news by ID
     */
    async getNewsById(id: string): Promise<NewsDetailVM | null> {
        try {
            return await apiClient.get<NewsDetailVM>(API_ENDPOINTS.news.byId(id))
        } catch {
            return null
        }
    },

    /**
     * Get news for a symbol
     */
    async getNewsBySymbol(symbol: string, limit = 20): Promise<NewsListVM[]> {
        return apiClient.get<NewsListVM[]>(API_ENDPOINTS.news.bySymbol(symbol), {
            params: { limit }
        })
    },

    /**
     * Get trending news
     */
    async getTrendingNews(hours = 24, limit = 10): Promise<NewsListVM[]> {
        return apiClient.get<NewsListVM[]>(API_ENDPOINTS.news.trending, {
            params: { hours, limit }
        })
    },

    /**
     * Search news
     */
    async searchNews(query: string, limit = 20): Promise<NewsListVM[]> {
        if (!query) return []

        return apiClient.get<NewsListVM[]>(API_ENDPOINTS.news.search, {
            params: { q: query, limit }
        })
    },
}
