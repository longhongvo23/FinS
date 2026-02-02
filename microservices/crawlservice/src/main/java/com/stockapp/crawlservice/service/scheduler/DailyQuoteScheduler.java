package com.stockapp.crawlservice.service.scheduler;

import com.stockapp.crawlservice.client.api.TwelveDataClient;
import com.stockapp.crawlservice.client.config.ApiProperties;
import com.stockapp.crawlservice.client.dto.QuoteResponse;
import com.stockapp.crawlservice.domain.CrawlJobState;
import com.stockapp.crawlservice.domain.enumeration.JobStatus;
import com.stockapp.crawlservice.repository.CrawlJobStateRepository;
import com.stockapp.crawlservice.service.NotificationServiceClient;
import com.stockapp.crawlservice.service.StockServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;

/**
 * Daily Quote Scheduler
 * Runs at 9 PM UTC to fetch latest quotes and update StockService
 */
@Service
public class DailyQuoteScheduler {

    private static final Logger log = LoggerFactory.getLogger(DailyQuoteScheduler.class);
    private static final double VOLATILITY_THRESHOLD = 5.0; // Alert when change > 5%

    private final TwelveDataClient twelveDataClient;
    private final ApiProperties apiProperties;
    private final CrawlJobStateRepository crawlJobStateRepository;
    private final StockServiceClient stockServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    public DailyQuoteScheduler(
            TwelveDataClient twelveDataClient,
            ApiProperties apiProperties,
            CrawlJobStateRepository crawlJobStateRepository,
            StockServiceClient stockServiceClient,
            NotificationServiceClient notificationServiceClient) {
        this.twelveDataClient = twelveDataClient;
        this.apiProperties = apiProperties;
        this.crawlJobStateRepository = crawlJobStateRepository;
        this.stockServiceClient = stockServiceClient;
        this.notificationServiceClient = notificationServiceClient;
    }

    /**
     * Scheduled job: Daily quote update at 9 PM UTC
     * Cron: 0 0 21 * * ?
     */
    @Scheduled(cron = "${application.crawl.schedule.daily-quote}")
    public void updateDailyQuotes() {
        log.info("Starting daily quote update job");

        Flux.fromIterable(apiProperties.getStock().getSymbols())
                .flatMap(symbol -> updateQuoteForSymbol(symbol)
                        .delayElement(Duration.ofSeconds(1)) // Rate limiting
                )
                .then()
                .doOnSuccess(v -> log.info("Daily quote update completed successfully"))
                .doOnError(error -> log.error("Daily quote update failed: {}", error.getMessage()))
                .subscribe();
    }

    /**
     * Update quote for a single symbol
     */
    private Mono<Void> updateQuoteForSymbol(String symbol) {
        log.info("Updating quote for symbol: {}", symbol);

        return updateJobState(symbol, JobStatus.RUNNING, null)
                .then(twelveDataClient.getQuote(symbol))
                .flatMap(quote -> {
                    // Send to StockService for persistence
                    return stockServiceClient.updateDailyQuote(symbol, toQuoteUpdateRequest(symbol, quote))
                            .then(Mono.defer(() -> {
                                // Check for significant price movement and send notification
                                try {
                                    String percentChangeStr = quote.getPercentChange();
                                    if (percentChangeStr != null) {
                                        double percentChange = Double.parseDouble(percentChangeStr);
                                        if (Math.abs(percentChange) >= VOLATILITY_THRESHOLD) {
                                            log.info("Significant price movement detected for {}: {}%", symbol,
                                                    percentChange);
                                            return notificationServiceClient
                                                    .sendPriceAlert(symbol, percentChange, quote.getClose())
                                                    .then(updateJobState(symbol, JobStatus.SUCCEEDED, null));
                                        }
                                    }
                                } catch (NumberFormatException e) {
                                    log.warn("Could not parse percent change for {}: {}", symbol,
                                            quote.getPercentChange());
                                }
                                return updateJobState(symbol, JobStatus.SUCCEEDED, null);
                            }));
                })
                .onErrorResume(error -> {
                    log.error("Error updating quote for {}: {}", symbol, error.getMessage());
                    return updateJobState(symbol, JobStatus.FAILED, error.getMessage());
                })
                .then();
    }

    /**
     * Convert QuoteResponse to request DTO for StockService
     */
    private QuoteUpdateRequest toQuoteUpdateRequest(String symbol, QuoteResponse quote) {
        return new QuoteUpdateRequest(
                symbol,
                quote.getDatetime(),
                quote.getTimestamp(),
                quote.getOpen(),
                quote.getHigh(),
                quote.getLow(),
                quote.getClose(),
                quote.getVolume(),
                quote.getPreviousClose(),
                quote.getChange(),
                quote.getPercentChange(),
                quote.getAverageVolume(),
                quote.getIsMarketOpen());
    }

    /**
     * Update crawl job state
     */
    private Mono<CrawlJobState> updateJobState(String symbol, JobStatus status, String errorLog) {
        return crawlJobStateRepository.findBySymbol(symbol)
                .switchIfEmpty(Mono.fromSupplier(() -> {
                    CrawlJobState newState = new CrawlJobState();
                    newState.setSymbol(symbol);
                    return newState;
                }))
                .flatMap(state -> {
                    state.setLastSyncStatus(status);

                    if (status == JobStatus.SUCCEEDED) {
                        state.setLastSuccessfulTimestamp(Instant.now());
                        state.setErrorLog(null);
                    } else if (status == JobStatus.FAILED && errorLog != null) {
                        state.setErrorLog(errorLog);
                    }

                    return crawlJobStateRepository.save(state);
                });
    }

    // Request DTO for StockService
    private record QuoteUpdateRequest(
            String symbol,
            String datetime,
            Long timestamp,
            String open,
            String high,
            String low,
            String close,
            String volume,
            String previousClose,
            String change,
            String percentChange,
            String averageVolume,
            Boolean isMarketOpen) {
    }
}
