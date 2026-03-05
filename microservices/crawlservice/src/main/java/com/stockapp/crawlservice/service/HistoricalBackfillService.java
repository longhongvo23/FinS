package com.stockapp.crawlservice.service;

import com.stockapp.crawlservice.broker.PriceNotificationProducer;
import com.stockapp.crawlservice.client.api.FinnhubClient;
import com.stockapp.crawlservice.client.api.TwelveDataClient;
import com.stockapp.crawlservice.client.config.ApiProperties;
import com.stockapp.crawlservice.client.dto.ProfileResponse;
import com.stockapp.crawlservice.client.dto.TimeSeriesResponse;
import com.stockapp.crawlservice.domain.CrawlJobState;
import com.stockapp.crawlservice.domain.enumeration.JobStatus;
import com.stockapp.crawlservice.repository.CrawlJobStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class HistoricalBackfillService {

    private static final Logger log = LoggerFactory.getLogger(HistoricalBackfillService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final TwelveDataClient twelveDataClient;
    private final FinnhubClient finnhubClient;
    private final ApiProperties apiProperties;
    private final CrawlJobStateRepository crawlJobStateRepository;
    private final StockServiceClient stockServiceClient;
    private final UserServiceClient userServiceClient;
    private final PriceNotificationProducer priceNotificationProducer;

    public HistoricalBackfillService(
            TwelveDataClient twelveDataClient,
            FinnhubClient finnhubClient,
            ApiProperties apiProperties,
            CrawlJobStateRepository crawlJobStateRepository,
            StockServiceClient stockServiceClient,
            UserServiceClient userServiceClient,
            PriceNotificationProducer priceNotificationProducer) {
        this.twelveDataClient = twelveDataClient;
        this.finnhubClient = finnhubClient;
        this.apiProperties = apiProperties;
        this.crawlJobStateRepository = crawlJobStateRepository;
        this.stockServiceClient = stockServiceClient;
        this.userServiceClient = userServiceClient;
        this.priceNotificationProducer = priceNotificationProducer;
    }

    /**
     * Execute one-time historical backfill for all configured symbols
     * 2015-01-01 to now, ~17,500 records (7 symbols × 2,500 days)
     * Uses concatMap for sequential execution to avoid race conditions
     */
    public Mono<Void> executeBackfill() {
        List<String> symbols = apiProperties.getStock().getSymbols();
        int totalSymbols = symbols.size();

        log.info("╔════════════════════════════════════════════════════════════════╗");
        log.info("║  Starting historical backfill for {} symbols                   ║", totalSymbols);
        log.info("║  Symbols: {}                                    ║", String.join(", ", symbols));
        log.info("╚════════════════════════════════════════════════════════════════╝");

        String startDate = apiProperties.getCrawl().getHistorical().getStartDate();
        String endDate = LocalDate.now().format(DATE_FORMATTER);
        String interval = apiProperties.getCrawl().getHistorical().getInterval();

        log.info("Date range: {} to {} (interval: {})", startDate, endDate, interval);

        final int[] counter = { 0 }; // Progress counter

        return Flux.fromIterable(symbols)
                .concatMap(symbol -> {
                    counter[0]++;
                    int currentIndex = counter[0];
                    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    log.info("Processing symbol {}/{}: {}", currentIndex, totalSymbols, symbol);
                    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                    return backfillSymbol(symbol, startDate, endDate, interval)
                            .doOnSuccess(
                                    v -> log.info("✓ Symbol {}/{} ({}) completed", currentIndex, totalSymbols, symbol))
                            .doOnError(e -> log.error("✗ Symbol {}/{} ({}) failed: {}", currentIndex, totalSymbols,
                                    symbol, e.getMessage()))
                            .delayElement(Duration.ofSeconds(1)); // Rate limiting: 1 symbol/second
                })
                .then()
                .doOnSuccess(v -> {
                    log.info("╔════════════════════════════════════════════════════════════════╗");
                    log.info("║  ✓ Historical backfill completed successfully                  ║");
                    log.info("║  Total symbols processed: {}/{}                               ║", counter[0],
                            totalSymbols);
                    log.info("╚════════════════════════════════════════════════════════════════╝");
                })
                .doOnError(error -> {
                    log.error("╔════════════════════════════════════════════════════════════════╗");
                    log.error("║  ✗ Historical backfill failed                                  ║");
                    log.error("║  Processed: {}/{} symbols                                     ║", counter[0],
                            totalSymbols);
                    log.error("║  Error: {}                                              ║", error.getMessage());
                    log.error("╚════════════════════════════════════════════════════════════════╝");
                });
    }

    /**
     * Backfill historical data for a single symbol
     * Smart incremental: fetches only from latest DB date to now
     * If no data exists, fetches from configured startDate (2015-01-01)
     */
    private Mono<Void> backfillSymbol(String symbol, String startDate, String endDate, String interval) {
        log.info("→ Starting backfill for symbol: {}", symbol);

        // Query latest date from stockservice (no RUNNING state to avoid race
        // condition)
        return stockServiceClient.getLatestHistoricalDate(symbol)
                .defaultIfEmpty(startDate) // If no data exists, use configured startDate
                .flatMap(latestDate -> {
                    // Calculate next day after latest date
                    String fromDate;
                    if (latestDate == null || latestDate.isEmpty()) {
                        fromDate = startDate; // No data, full backfill
                        log.info("  ℹ No existing data for {}", symbol);
                        log.info("  → Full backfill from {} to {}", fromDate, endDate);
                    } else {
                        // Parse and add 1 day to latest date
                        // Handle both yyyy-MM-dd and ISO8601 (yyyy-MM-ddTHH:mm:ssZ) formats
                        String dateOnly = latestDate.length() > 10 ? latestDate.substring(0, 10) : latestDate;
                        fromDate = LocalDate.parse(dateOnly, DATE_FORMATTER)
                                .plusDays(1)
                                .format(DATE_FORMATTER);
                        log.info("  ℹ Latest data: {}", dateOnly);
                        log.info("  → Incremental backfill from {} to {}", fromDate, endDate);
                    }

                    // Check if we need to fetch anything
                    if (LocalDate.parse(fromDate, DATE_FORMATTER)
                            .isAfter(LocalDate.parse(endDate, DATE_FORMATTER))) {
                        log.info("  ✓ {} is already up to date (no new data to fetch)", symbol);
                        return updateJobState(symbol, JobStatus.SUCCEEDED, null).then();
                    }

                    // Fetch and save data
                    return Mono.zip(
                            fetchCompanyProfile(symbol),
                            fetchHistoricalPrices(symbol, fromDate, endDate, interval))
                            .flatMap(tuple -> {
                                ProfileResponse profile = tuple.getT1();
                                TimeSeriesResponse timeSeries = tuple.getT2();

                                return stockServiceClient.saveCompanyProfile(symbol, profile)
                                        .then(saveHistoricalDataInChunks(symbol, timeSeries))
                                        .then(sendPriceNotification(symbol, timeSeries))
                                        .then(updateJobState(symbol, JobStatus.SUCCEEDED, null));
                            });
                }).onErrorResume(error -> {
                    log.error("Error backfilling symbol {}: {}", symbol, error.getMessage());
                    return updateJobState(symbol, JobStatus.FAILED, error.getMessage());
                })
                .then();
    }

    /**
     * Save historical data in chunks of 100 records to avoid request size limits
     */
    private Mono<Void> saveHistoricalDataInChunks(String symbol, TimeSeriesResponse timeSeries) {
        if (timeSeries.getValues() == null || timeSeries.getValues().isEmpty()) {
            log.info("  ⚠ No historical data returned for {}", symbol);
            return Mono.empty();
        }

        int totalSize = timeSeries.getValues().size();
        int chunkSize = 100;
        int totalChunks = (totalSize + chunkSize - 1) / chunkSize;
        log.info("  → Saving {} records for {} in {} chunks", totalSize, symbol, totalChunks);

        return Flux.range(0, (totalSize + chunkSize - 1) / chunkSize)
                .flatMap(i -> {
                    int fromIndex = i * chunkSize;
                    int toIndex = Math.min(fromIndex + chunkSize, totalSize);
                    var chunk = timeSeries.getValues().subList(fromIndex, toIndex);

                    // Create a new TimeSeriesResponse with chunk data
                    var chunkResponse = new TimeSeriesResponse();
                    chunkResponse.setMeta(timeSeries.getMeta());
                    chunkResponse.setValues(chunk);
                    chunkResponse.setStatus(timeSeries.getStatus());

                    log.info("    → Chunk {}/{}: {} records",
                            i + 1, (totalSize + chunkSize - 1) / chunkSize, chunk.size());

                    return stockServiceClient.saveHistoricalPrices(symbol, chunkResponse)
                            .delayElement(Duration.ofMillis(500)); // Rate limiting between chunks
                })
                .then()
                .doOnSuccess(v -> log.info("  ✓ Saved all {} records for {}", totalSize, symbol));
    }

    /**
     * Fetch company profile from Finnhub
     */
    private Mono<ProfileResponse> fetchCompanyProfile(String symbol) {
        return finnhubClient.getCompanyProfile(symbol)
                .doOnSuccess(profile -> log.info("Fetched company profile for {}: {}", symbol, profile.getName()));
    }

    /**
     * Fetch historical prices from TwelveData
     * outputsize=5000 to get maximum data points per request
     */
    private Mono<TimeSeriesResponse> fetchHistoricalPrices(
            String symbol,
            String startDate,
            String endDate,
            String interval) {
        return twelveDataClient.getTimeSeries(symbol, interval, startDate, endDate, 5000)
                .doOnSuccess(response -> {
                    int count = response.getValues() != null ? response.getValues().size() : 0;
                    log.info("Fetched {} historical prices for {}", count, symbol);
                });
    }

    /**
     * Update crawl job state in MongoDB
     */
    private Mono<CrawlJobState> updateJobState(String symbol, JobStatus status, String errorLog) {
        return crawlJobStateRepository.findFirstBySymbol(symbol)
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
                })
                .doOnSuccess(state -> log.debug("Updated job state for {}: {}", symbol, status));
    }

    /**
     * Send price notification to users watching this symbol via Kafka
     * Only sends notification for the latest (most recent) price data
     */
    private Mono<Void> sendPriceNotification(String symbol, TimeSeriesResponse timeSeries) {
        if (timeSeries.getValues() == null || timeSeries.getValues().isEmpty()) {
            log.debug("No price data to notify for {}", symbol);
            return Mono.empty();
        }

        // Get the most recent (first) price from the time series
        var latestPrice = timeSeries.getValues().get(0);

        // Calculate percent change (close - open) / open * 100
        double openPrice = parseDouble(latestPrice.getOpen());
        double closePrice = parseDouble(latestPrice.getClose());
        double percentChange = openPrice > 0 ? ((closePrice - openPrice) / openPrice) * 100 : 0;

        log.info("Preparing price notification for {} - Date: {}, Change: {}%",
                symbol, latestPrice.getDatetime(), String.format("%.2f", percentChange));

        // Get users watching this symbol, then send Kafka message
        return userServiceClient.getUserIdsBySymbol(symbol)
                .filter(userIds -> !userIds.isEmpty())
                .flatMap(userIds -> {
                    log.info("Sending price notification for {} to {} users", symbol, userIds.size());

                    PriceNotificationProducer.PriceUpdateMessage message = new PriceNotificationProducer.PriceUpdateMessage(
                            symbol,
                            userIds,
                            percentChange,
                            latestPrice.getOpen(),
                            latestPrice.getClose(),
                            latestPrice.getHigh(),
                            latestPrice.getLow(),
                            latestPrice.getVolume(),
                            latestPrice.getDatetime());

                    return priceNotificationProducer.sendPriceUpdate(message);
                })
                .then()
                .doOnSuccess(v -> log.debug("Price notification sent for {}", symbol))
                .onErrorResume(e -> {
                    log.error("Failed to send price notification for {}: {}", symbol, e.getMessage());
                    return Mono.empty(); // Don't fail the main backfill flow
                });
    }

    /**
     * Parse string to double safely
     */
    private double parseDouble(String value) {
        try {
            return value != null ? Double.parseDouble(value) : 0.0;
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
