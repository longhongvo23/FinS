/**
 * Watchlist Service for FinS Microservices
 * Manages user watchlists via UserService
 */

import { apiClient, API_ENDPOINTS } from './api-client'

export interface WatchlistVM {
    symbol: string
    addedAt: string
}

export const watchlistService = {
    /**
     * Get user's watchlist
     */
    async getWatchlist(): Promise<WatchlistVM[]> {
        return apiClient.get<WatchlistVM[]>(API_ENDPOINTS.watchlist.base)
    },

    /**
     * Add symbol to watchlist
     */
    async addToWatchlist(symbol: string): Promise<WatchlistVM> {
        return apiClient.post<WatchlistVM>(API_ENDPOINTS.watchlist.bySymbol(symbol))
    },

    /**
     * Remove symbol from watchlist
     */
    async removeFromWatchlist(symbol: string): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.watchlist.bySymbol(symbol))
    },

    /**
     * Check if symbol is in watchlist
     */
    async isInWatchlist(symbol: string): Promise<boolean> {
        const result = await apiClient.get<boolean>(API_ENDPOINTS.watchlist.check(symbol))
        return result
    },

    /**
     * Batch check symbols in watchlist
     */
    async checkSymbols(symbols: string[]): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>()

        await Promise.all(
            symbols.map(async (symbol) => {
                try {
                    const inWatchlist = await this.isInWatchlist(symbol)
                    results.set(symbol, inWatchlist)
                } catch {
                    results.set(symbol, false)
                }
            })
        )

        return results
    },
}
