package com.stockapp.crawlservice.service.scheduler;

import com.stockapp.crawlservice.broker.NewsNotificationProducer;
import com.stockapp.crawlservice.client.api.MarketauxClient;
import com.stockapp.crawlservice.client.config.ApiProperties;
import com.stockapp.crawlservice.client.dto.NewsResponse;
import com.stockapp.crawlservice.domain.CrawlJobState;
import com.stockapp.crawlservice.domain.enumeration.JobStatus;
import com.stockapp.crawlservice.repository.CrawlJobStateRepository;
import com.stockapp.crawlservice.service.NewsServiceClient;
import com.stockapp.crawlservice.service.UserServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Daily News Scheduler (renamed from Hourly)
 * Runs 3 times per day during US market hours to fetch news efficiently
 * - 10:00 AM UTC (6AM EST) - Pre-market news
 * - 15:00 PM UTC (11AM EST) - Mid-day news
 * - 21:00 PM UTC (5PM EST) - Post-market news
 */
@Service
public class HourlyNewsScheduler {

    private static final Logger log = LoggerFactory.getLogger(HourlyNewsScheduler.class);
    // Marketaux API requires format: YYYY-MM-DDTHH:MM (no seconds, no timezone)
    private static final DateTimeFormatter MARKETAUX_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final MarketauxClient marketauxClient;
    private final ApiProperties apiProperties;
    private final CrawlJobStateRepository crawlJobStateRepository;
    private final NewsServiceClient newsServiceClient;
    private final UserServiceClient userServiceClient;
    private final NewsNotificationProducer newsNotificationProducer;

    public HourlyNewsScheduler(
            MarketauxClient marketauxClient,
            ApiProperties apiProperties,
            CrawlJobStateRepository crawlJobStateRepository,
            NewsServiceClient newsServiceClient,
            UserServiceClient userServiceClient,
            NewsNotificationProducer newsNotificationProducer) {
        this.marketauxClient = marketauxClient;
        this.apiProperties = apiProperties;
        this.crawlJobStateRepository = crawlJobStateRepository;
        this.newsServiceClient = newsServiceClient;
        this.userServiceClient = userServiceClient;
        this.newsNotificationProducer = newsNotificationProducer;
    }

    /**
     * Scheduled job: Daily news fetch (3 times per day)
     * Cron: 0 0 10,15,21 * * ? = 10AM, 3PM, 9PM UTC (6AM, 11AM, 5PM EST)
     * Optimized for US market hours when news is most active
     */
    @Scheduled(cron = "${application.crawl.schedule.daily-news}")
    public void fetchHourlyNews() {
        log.info("Starting daily news fetch job");

        // Fetch news from last 8 hours to ensure coverage
        Instant eightHoursAgo = Instant.now().minusSeconds(28800);
        // Format: YYYY-MM-DDTHH:MM (Marketaux API requirement)
        String publishedAfter = MARKETAUX_FORMATTER.format(eightHoursAgo.atZone(ZoneOffset.UTC));

        updateJobState("NEWS_ALL", JobStatus.RUNNING, null)
                .then(marketauxClient.getNewsWithDateRange(
                        apiProperties.getStock().getSymbols(),
                        publishedAfter,
                        null,
                        100 // Max articles per fetch (300/day total)
                ))
                .flatMap(newsResponse -> {
                    // Send to NewsService for persistence
                    return newsServiceClient.saveNews(new NewsRequest(newsResponse))
                            .then(sendNewsNotifications(newsResponse))
                            .then(updateJobState("NEWS_ALL", JobStatus.SUCCEEDED, null));
                })
                .onErrorResume(error -> {
                    log.error("Error fetching news: {}", error.getMessage());
                    return updateJobState("NEWS_ALL", JobStatus.FAILED, error.getMessage());
                })
                .doOnSuccess(v -> log.info("Daily news fetch completed successfully"))
                .doOnError(error -> log.error("Daily news fetch failed: {}", error.getMessage()))
                .subscribe();
    }

    /**
     * Send news notifications to users watching the relevant symbols
     */
    private Mono<Void> sendNewsNotifications(NewsResponse newsResponse) {
        if (newsResponse == null || newsResponse.getData() == null || newsResponse.getData().isEmpty()) {
            log.debug("No news to notify about");
            return Mono.empty();
        }

        log.info("Sending news notifications for {} articles", newsResponse.getData().size());

        // Get all configured symbols for matching
        List<String> configuredSymbols = apiProperties.getStock().getSymbols();

        return Flux.fromIterable(newsResponse.getData())
                .flatMap(article -> {
                    // Find symbols mentioned in this article by checking title/description/entities
                    List<String> matchedSymbols = configuredSymbols.stream()
                            .filter(symbol -> {
                                String title = article.getTitle() != null ? article.getTitle().toUpperCase() : "";
                                String desc = article.getDescription() != null ? article.getDescription().toUpperCase()
                                        : "";
                                List<String> entities = article.getEntities() != null ? article.getEntities()
                                        : List.of();

                                return title.contains(symbol) ||
                                        desc.contains(symbol) ||
                                        entities.stream().anyMatch(e -> e != null && e.toUpperCase().contains(symbol));
                            })
                            .distinct()
                            .toList();

                    if (matchedSymbols.isEmpty()) {
                        return Mono.empty();
                    }

                    log.debug("Article '{}' matches symbols: {}", article.getTitle(), matchedSymbols);

                    // For each matched symbol, get users watching it and send notification
                    return Flux.fromIterable(matchedSymbols)
                            .flatMap(symbol -> userServiceClient.getUserIdsBySymbol(symbol)
                                    .flatMapMany(userIds -> Flux.fromIterable(userIds)
                                            .flatMap(userId -> {
                                                var message = new NewsNotificationProducer.NewsUpdateMessage(
                                                        userId,
                                                        article.getUuid() != null ? article.getUuid()
                                                                : UUID.randomUUID().toString(),
                                                        article.getTitle(),
                                                        article.getDescription(),
                                                        article.getSource(),
                                                        article.getUrl(),
                                                        article.getImageUrl(),
                                                        symbol);
                                                return newsNotificationProducer.sendNewsUpdate(message);
                                            })))
                            .then();
                })
                .then()
                .doOnSuccess(v -> log.info("News notifications sent successfully"))
                .onErrorResume(e -> {
                    log.error("Failed to send news notifications: {}", e.getMessage());
                    return Mono.empty(); // Don't fail main flow
                });
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

    // Request DTO for NewsService
    private record NewsRequest(NewsResponse newsResponse) {
    }
}
