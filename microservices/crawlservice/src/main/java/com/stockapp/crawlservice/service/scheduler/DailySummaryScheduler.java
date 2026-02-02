package com.stockapp.crawlservice.service.scheduler;

import com.stockapp.crawlservice.client.api.TwelveDataClient;
import com.stockapp.crawlservice.client.config.ApiProperties;
import com.stockapp.crawlservice.service.NotificationServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Daily Summary Scheduler
 * Runs at end of trading day to send market summary notification
 */
@Service
public class DailySummaryScheduler {

    private static final Logger log = LoggerFactory.getLogger(DailySummaryScheduler.class);

    private final TwelveDataClient twelveDataClient;
    private final ApiProperties apiProperties;
    private final NotificationServiceClient notificationServiceClient;

    public DailySummaryScheduler(
            TwelveDataClient twelveDataClient,
            ApiProperties apiProperties,
            NotificationServiceClient notificationServiceClient) {
        this.twelveDataClient = twelveDataClient;
        this.apiProperties = apiProperties;
        this.notificationServiceClient = notificationServiceClient;
    }

    /**
     * Scheduled job: Daily summary at 10 PM UTC (5 AM Vietnam time next day)
     * Cron: 0 0 22 * * ?
     */
    @Scheduled(cron = "${application.crawl.schedule.daily-summary:0 0 22 * * ?}")
    public void sendDailySummary() {
        log.info("Starting daily summary job");

        List<StockChange> allChanges = new CopyOnWriteArrayList<>();

        Flux.fromIterable(apiProperties.getStock().getSymbols())
                .flatMap(symbol -> twelveDataClient.getQuote(symbol)
                        .map(quote -> new StockChange(symbol, parseDouble(quote.getPercentChange())))
                        .onErrorResume(e -> Mono.empty())
                        .delayElement(Duration.ofMillis(500)))
                .doOnNext(allChanges::add)
                .collectList()
                .flatMap(changes -> {
                    if (changes.isEmpty()) {
                        log.warn("No stock data available for daily summary");
                        return Mono.empty();
                    }

                    // Calculate summary
                    int gainersCount = (int) changes.stream().filter(sc -> sc.percentChange() > 0).count();
                    int losersCount = (int) changes.stream().filter(sc -> sc.percentChange() < 0).count();

                    StockChange topGainer = changes.stream()
                            .max(Comparator.comparingDouble(StockChange::percentChange))
                            .orElse(new StockChange("N/A", 0));

                    StockChange topLoser = changes.stream()
                            .min(Comparator.comparingDouble(StockChange::percentChange))
                            .orElse(new StockChange("N/A", 0));

                    String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

                    log.info("Daily summary: {} gainers, {} losers. Top: {} (+{}%), Bottom: {} ({}%)",
                            gainersCount, losersCount,
                            topGainer.symbol(), topGainer.percentChange(),
                            topLoser.symbol(), topLoser.percentChange());

                    return notificationServiceClient.sendDailySummary(
                            today, gainersCount, losersCount,
                            topGainer.symbol(), topGainer.percentChange(),
                            topLoser.symbol(), topLoser.percentChange());
                })
                .doOnSuccess(v -> log.info("Daily summary sent successfully"))
                .doOnError(error -> log.error("Failed to send daily summary: {}", error.getMessage()))
                .subscribe();
    }

    private double parseDouble(String value) {
        if (value == null || value.isEmpty())
            return 0;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private record StockChange(String symbol, double percentChange) {
    }
}
