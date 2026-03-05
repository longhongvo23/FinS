package com.stockapp.crawlservice.service.scheduler;

import com.stockapp.crawlservice.service.HistoricalBackfillService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Startup backfill runner that checks and fills missing data when container
 * starts.
 * This ensures data continuity after server restarts or downtime.
 * 
 * CRITICAL: Runs in BLOCKING mode to ensure data is updated before app is ready
 * Enable/disable via: application.crawl.startup-backfill.enabled=true/false
 */
@Component
@ConditionalOnProperty(name = "application.crawl.startup-backfill.enabled", havingValue = "true", matchIfMissing = true)
public class StartupBackfillRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupBackfillRunner.class);
    private static final int STARTUP_DELAY_SECONDS = 10;
    private static final int BACKFILL_TIMEOUT_MINUTES = 30;

    private final HistoricalBackfillService historicalBackfillService;

    public StartupBackfillRunner(HistoricalBackfillService historicalBackfillService) {
        this.historicalBackfillService = historicalBackfillService;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("╔═══════════════════════════════════════════════════════════════╗");
        log.info("║   STARTUP BACKFILL: Checking for missing stock data          ║");
        log.info("╚═══════════════════════════════════════════════════════════════╝");

        // Delay startup backfill to allow services to initialize
        log.info("Waiting {} seconds for dependent services to initialize...", STARTUP_DELAY_SECONDS);
        try {
            Thread.sleep(STARTUP_DELAY_SECONDS * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Startup backfill interrupted during initialization delay");
            return;
        }

        try {
            log.info("Starting BLOCKING backfill (timeout: {} minutes)...", BACKFILL_TIMEOUT_MINUTES);

            // BLOCKING CALL - Wait for backfill to complete before app becomes ready
            historicalBackfillService.executeBackfill()
                    .block(Duration.ofMinutes(BACKFILL_TIMEOUT_MINUTES));

            log.info("╔═══════════════════════════════════════════════════════════════╗");
            log.info("║   ✓ STARTUP BACKFILL: Completed successfully                  ║");
            log.info("║   Application is ready with up-to-date stock data             ║");
            log.info("╚═══════════════════════════════════════════════════════════════╝");

        } catch (Exception e) {
            log.error("╔═══════════════════════════════════════════════════════════════╗");
            log.error("║   ✗ STARTUP BACKFILL: FAILED                                  ║");
            log.error("║   Error: {}                                            ║", e.getMessage());
            log.error("║   Application will continue but data may be outdated          ║");
            log.error("╚═══════════════════════════════════════════════════════════════╝");
            log.error("Full error details:", e);
            // Don't throw - allow app to start even if backfill fails
        }
    }
}
