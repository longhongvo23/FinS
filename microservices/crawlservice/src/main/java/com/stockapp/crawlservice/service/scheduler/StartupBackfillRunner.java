package com.stockapp.crawlservice.service.scheduler;

import com.stockapp.crawlservice.service.HistoricalBackfillService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Startup backfill runner that checks and fills missing data when container
 * starts.
 * This ensures data continuity after server restarts or downtime.
 * 
 * Enable/disable via: application.crawl.startup-backfill.enabled=true/false
 */
@Component
@ConditionalOnProperty(name = "application.crawl.startup-backfill.enabled", havingValue = "true", matchIfMissing = true)
public class StartupBackfillRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupBackfillRunner.class);

    private final HistoricalBackfillService historicalBackfillService;

    public StartupBackfillRunner(HistoricalBackfillService historicalBackfillService) {
        this.historicalBackfillService = historicalBackfillService;
    }

    @Override
    public void run(String... args) {
        log.info("=== STARTUP BACKFILL: Checking for missing data ===");

        // Delay startup backfill by 10 seconds to allow services to initialize
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return;
        }

        historicalBackfillService.executeBackfill()
                .doOnSubscribe(s -> log.info("Starting startup backfill to fill any missing data..."))
                .doOnSuccess(v -> log.info("=== STARTUP BACKFILL: Completed successfully ==="))
                .doOnError(error -> log.error("=== STARTUP BACKFILL: Failed - {} ===", error.getMessage()))
                .subscribe();
    }
}
