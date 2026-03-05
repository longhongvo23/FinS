package com.stockapp.crawlservice.web.rest;

import com.stockapp.crawlservice.domain.CrawlJobState;
import com.stockapp.crawlservice.repository.CrawlJobStateRepository;
import com.stockapp.crawlservice.service.HistoricalBackfillService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for monitoring and managing crawl operations.
 * Provides endpoints for status checking, health monitoring, and manual
 * triggering.
 */
@RestController
@RequestMapping("/api/crawl")
public class CrawlStatusResource {

    private static final Logger log = LoggerFactory.getLogger(CrawlStatusResource.class);

    private final CrawlJobStateRepository crawlJobStateRepository;
    private final HistoricalBackfillService historicalBackfillService;

    public CrawlStatusResource(
            CrawlJobStateRepository crawlJobStateRepository,
            HistoricalBackfillService historicalBackfillService) {
        this.crawlJobStateRepository = crawlJobStateRepository;
        this.historicalBackfillService = historicalBackfillService;
    }

    /**
     * GET /api/crawl/status
     * Get current crawl status for all symbols
     * 
     * @return Map containing status information for each symbol
     */
    @GetMapping("/status")
    public Mono<ResponseEntity<Map<String, Object>>> getCrawlStatus() {
        log.info("Getting crawl status for all symbols");

        return crawlJobStateRepository.findAll()
                .collectList()
                .map(states -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("timestamp", Instant.now().toString());
                    response.put("totalSymbols", states.size());

                    // Overall status
                    long successCount = states.stream()
                            .filter(s -> s.getLastSyncStatus() != null &&
                                    s.getLastSyncStatus().name().equals("SUCCEEDED"))
                            .count();
                    long failedCount = states.stream()
                            .filter(s -> s.getLastSyncStatus() != null &&
                                    s.getLastSyncStatus().name().equals("FAILED"))
                            .count();

                    response.put("successCount", successCount);
                    response.put("failedCount", failedCount);
                    response.put("overallHealth", failedCount == 0 ? "HEALTHY" : "DEGRADED");

                    // Individual symbol status
                    List<Map<String, Object>> symbolStatus = states.stream()
                            .map(state -> {
                                Map<String, Object> status = new HashMap<>();
                                status.put("symbol", state.getSymbol());
                                status.put("lastSyncStatus", state.getLastSyncStatus());
                                status.put("lastSuccessfulTimestamp", state.getLastSuccessfulTimestamp());
                                status.put("errorLog", state.getErrorLog());

                                // Calculate time since last successful sync
                                if (state.getLastSuccessfulTimestamp() != null) {
                                    Duration timeSince = Duration.between(
                                            state.getLastSuccessfulTimestamp(),
                                            Instant.now());
                                    status.put("hoursSinceLastSuccess", timeSince.toHours());
                                    status.put("isStale", timeSince.toHours() > 24);
                                }

                                return status;
                            })
                            .toList();

                    response.put("symbols", symbolStatus);

                    return ResponseEntity.ok(response);
                })
                .defaultIfEmpty(ResponseEntity.ok(Map.of(
                        "timestamp", Instant.now().toString(),
                        "totalSymbols", 0,
                        "message", "No crawl data available yet")));
    }

    /**
     * GET /api/crawl/health
     * Simple health check endpoint
     * Returns 200 if all symbols are healthy, 503 if any failures
     * 
     * @return Health status
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> getHealth() {
        log.debug("Health check requested");

        return crawlJobStateRepository.findAll()
                .collectList()
                .map(states -> {
                    if (states.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                .body(Map.of(
                                        "status", "UNKNOWN",
                                        "message", "No crawl data available",
                                        "timestamp", Instant.now().toString()));
                    }

                    long failedCount = states.stream()
                            .filter(s -> s.getLastSyncStatus() != null &&
                                    s.getLastSyncStatus().name().equals("FAILED"))
                            .count();

                    long staleCount = states.stream()
                            .filter(s -> {
                                if (s.getLastSuccessfulTimestamp() == null)
                                    return true;
                                Duration timeSince = Duration.between(
                                        s.getLastSuccessfulTimestamp(),
                                        Instant.now());
                                return timeSince.toHours() > 24;
                            })
                            .count();

                    if (failedCount > 0 || staleCount > 0) {
                        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                .body(Map.of(
                                        "status", "UNHEALTHY",
                                        "failedSymbols", failedCount,
                                        "staleSymbols", staleCount,
                                        "totalSymbols", states.size(),
                                        "timestamp", Instant.now().toString()));
                    }

                    return ResponseEntity.ok(Map.of(
                            "status", "HEALTHY",
                            "totalSymbols", states.size(),
                            "timestamp", Instant.now().toString()));
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of(
                                "status", "UNKNOWN",
                                "message", "Unable to check health",
                                "timestamp", Instant.now().toString())));
    }

    /**
     * POST /api/crawl/trigger-backfill
     * Manually trigger a full backfill for all symbols
     * Use this after server restart or when data is stale
     * 
     * WARNING: This operation can take several minutes
     * 
     * @return Accepted response with message
     */
    @PostMapping("/trigger-backfill")
    public Mono<ResponseEntity<Map<String, String>>> triggerBackfill() {
        log.info("Manual backfill triggered via API");

        // Run backfill asynchronously and return immediately
        historicalBackfillService.executeBackfill()
                .doOnSuccess(v -> log.info("Manual backfill completed successfully"))
                .doOnError(e -> log.error("Manual backfill failed: {}", e.getMessage()))
                .subscribe();

        return Mono.just(ResponseEntity.accepted()
                .body(Map.of(
                        "status", "ACCEPTED",
                        "message", "Backfill started in background. Check /api/crawl/status for progress.",
                        "timestamp", Instant.now().toString())));
    }

    /**
     * GET /api/crawl/status/{symbol}
     * Get crawl status for a specific symbol
     * 
     * @param symbol Stock symbol (e.g., AAPL)
     * @return Status information for the symbol
     */
    @GetMapping("/status/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getSymbolStatus(@PathVariable String symbol) {
        log.info("Getting crawl status for symbol: {}", symbol);

        return crawlJobStateRepository.findFirstBySymbol(symbol)
                .map(state -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("symbol", state.getSymbol());
                    response.put("lastSyncStatus", state.getLastSyncStatus());
                    response.put("lastSuccessfulTimestamp", state.getLastSuccessfulTimestamp());
                    response.put("errorLog", state.getErrorLog());
                    response.put("timestamp", Instant.now().toString());

                    if (state.getLastSuccessfulTimestamp() != null) {
                        Duration timeSince = Duration.between(
                                state.getLastSuccessfulTimestamp(),
                                Instant.now());
                        response.put("hoursSinceLastSuccess", timeSince.toHours());
                        response.put("isStale", timeSince.toHours() > 24);
                    }

                    return ResponseEntity.ok(response);
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "error", "NOT_FOUND",
                                "message", "No crawl data found for symbol: " + symbol,
                                "timestamp", Instant.now().toString())));
    }
}
