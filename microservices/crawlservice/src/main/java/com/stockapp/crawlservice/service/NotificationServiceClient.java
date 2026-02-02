package com.stockapp.crawlservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * REST client for NotificationService internal APIs
 * Sends notifications when significant events occur
 */
@Service
public class NotificationServiceClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceClient.class);

    private final WebClient webClient;

    public NotificationServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${application.notification-service.url:http://notificationservice:8085}") String notificationServiceUrl) {
        this.webClient = webClientBuilder
                .baseUrl(notificationServiceUrl)
                .build();
    }

    /**
     * Send price volatility alert
     * Called when a stock's price changes more than threshold (e.g., 5%)
     */
    public Mono<Void> sendPriceAlert(String symbol, double percentChange, String currentPrice) {
        log.info("Sending price alert for {} ({}%)", symbol, percentChange);

        PriceAlertRequest request = new PriceAlertRequest(symbol, percentChange, currentPrice);

        return webClient.post()
                .uri("/api/internal/notifications/price-alert")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.info("Successfully sent price alert for {}", symbol))
                .doOnError(error -> log.error("Failed to send price alert for {}: {}", symbol, error.getMessage()))
                .onErrorResume(e -> Mono.empty()); // Don't fail the main flow if notification fails
    }

    /**
     * Send AI recommendation notification
     */
    public Mono<Void> sendAIRecommendation(String symbol, String recommendation, double percentChange,
            int forecastDays, double confidence, String reason) {
        log.info("Sending AI recommendation for {}: {}", symbol, recommendation);

        AIRecommendationRequest request = new AIRecommendationRequest(
                symbol, recommendation, percentChange, forecastDays, confidence, reason);

        return webClient.post()
                .uri("/api/internal/notifications/ai-recommendation")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.info("Successfully sent AI recommendation for {}", symbol))
                .doOnError(
                        error -> log.error("Failed to send AI recommendation for {}: {}", symbol, error.getMessage()))
                .onErrorResume(e -> Mono.empty());
    }

    /**
     * Send daily market summary notification
     */
    public Mono<Void> sendDailySummary(String date, int gainersCount, int losersCount,
            String topGainer, double topGainerPercent,
            String topLoser, double topLoserPercent) {
        log.info("Sending daily summary for {}", date);

        DailySummaryRequest request = new DailySummaryRequest(
                date, gainersCount, losersCount, topGainer, topGainerPercent, topLoser, topLoserPercent);

        return webClient.post()
                .uri("/api/internal/notifications/daily-summary")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.info("Successfully sent daily summary"))
                .doOnError(error -> log.error("Failed to send daily summary: {}", error.getMessage()))
                .onErrorResume(e -> Mono.empty());
    }

    // Request DTOs
    private record PriceAlertRequest(String symbol, double percentChange, String currentPrice) {
    }

    private record AIRecommendationRequest(String symbol, String recommendation, double percentChange,
            int forecastDays, double confidence, String reason) {
    }

    private record DailySummaryRequest(String date, int gainersCount, int losersCount,
            String topGainer, double topGainerPercent,
            String topLoser, double topLoserPercent) {
    }
}
