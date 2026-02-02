package com.stockapp.notificationservice.domain.enumeration;

/**
 * The NotificationCategory enumeration for UI tab filtering.
 * Supports AI, News, and Price notifications.
 */
public enum NotificationCategory {
    /**
     * AI predictions, insights, and research notifications.
     * Includes: Prophet forecasts, AI Research, AI Insight
     * UI Tab: "AI"
     */
    AI_INSIGHT,

    /**
     * Market news notifications for watchlist stocks.
     * UI Tab: "Tin tức"
     */
    NEWS,

    /**
     * Daily price update notifications for watchlist stocks.
     * Sent when new daily prices are crawled.
     * UI Tab: "Giá"
     */
    PRICE,
}
