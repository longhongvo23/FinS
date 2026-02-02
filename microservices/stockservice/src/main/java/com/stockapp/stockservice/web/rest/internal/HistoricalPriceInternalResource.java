package com.stockapp.stockservice.web.rest.internal;

import com.stockapp.stockservice.domain.Company;
import com.stockapp.stockservice.domain.HistoricalPrice;
import com.stockapp.stockservice.repository.CompanyRepository;
import com.stockapp.stockservice.repository.HistoricalPriceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Internal REST API for CrawlService to save historical prices
 * NOT exposed to public API Gateway
 */
@RestController
@RequestMapping("/api/internal/historical")
public class HistoricalPriceInternalResource {

    private static final Logger log = LoggerFactory.getLogger(HistoricalPriceInternalResource.class);

    private final HistoricalPriceRepository historicalPriceRepository;
    private final CompanyRepository companyRepository;

    public HistoricalPriceInternalResource(
            HistoricalPriceRepository historicalPriceRepository,
            CompanyRepository companyRepository) {
        this.historicalPriceRepository = historicalPriceRepository;
        this.companyRepository = companyRepository;
    }

    /**
     * POST /api/internal/historical/bulk
     * Save historical prices in bulk from TwelveData API
     */
    /**
     * Get latest historical price date for a symbol (for incremental updates)
     * GET /api/internal/historical/latest/{symbol}
     */
    @GetMapping("/latest/{symbol}")
    public Mono<ResponseEntity<LatestDateResponse>> getLatestDate(@PathVariable String symbol) {
        log.debug("Request to get latest date for symbol: {}", symbol);

        return historicalPriceRepository.findBySymbolOrderByDatetimeDesc(symbol)
                .next() // Take first result from Flux
                .map(price -> {
                    log.debug("Found latest date for {}: {}", symbol, price.getDatetime());
                    return ResponseEntity.ok(new LatestDateResponse(symbol, price.getDatetime().toString()));
                })
                .switchIfEmpty(Mono.fromSupplier(() -> {
                    log.debug("No historical data found for {}", symbol);
                    return ResponseEntity.ok(new LatestDateResponse(symbol, null));
                }))
                .doOnError(error -> log.error("Error getting latest date for {}: {}", symbol, error.getMessage()));
    }

    @PostMapping("/bulk")
    public Mono<ResponseEntity<BulkSaveResponse>> saveHistoricalPricesBulk(
            @RequestBody HistoricalPricesRequest request) {
        log.info("Received {} historical prices for symbol: {}",
                request.timeSeries().values() != null ? request.timeSeries().values().size() : 0,
                request.symbol());

        return companyRepository.findFirstBySymbol(request.symbol())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Company not found: " + request.symbol())))
                .flatMapMany(company -> {
                    var timeSeries = request.timeSeries();

                    if (timeSeries.values() == null || timeSeries.values().isEmpty()) {
                        return Flux.empty();
                    }

                    // Filter out duplicates and create new records
                    return Flux.fromIterable(timeSeries.values())
                            .filterWhen(value -> {
                                var instant = parseInstant(value.datetime());
                                // Check if NOT exists (only save new records)
                                return historicalPriceRepository.existsBySymbolAndDatetime(
                                        request.symbol(), instant)
                                        .map(exists -> !exists);
                            })
                            .map(value -> {
                                HistoricalPrice price = new HistoricalPrice();
                                price.setSymbol(request.symbol());
                                price.setDatetime(parseInstant(value.datetime()));
                                price.setInterval(timeSeries.meta() != null ? timeSeries.meta().interval() : "1day");
                                price.setOpen(parseBigDecimal(value.open()));
                                price.setHigh(parseBigDecimal(value.high()));
                                price.setLow(parseBigDecimal(value.low()));
                                price.setClose(parseBigDecimal(value.close()));
                                price.setVolume(parseLong(value.volume()));

                                price.setCompany(company);
                                return price;
                            });
                })
                .collectList()
                .flatMap(prices -> {
                    if (prices.isEmpty()) {
                        log.info("No new historical prices to save for {} (all duplicates skipped)", request.symbol());
                        return Mono.just(prices);
                    }
                    log.info("Saving {} new historical prices for {} (duplicates filtered)", prices.size(),
                            request.symbol());
                    return historicalPriceRepository.saveAll(prices).collectList();
                })
                .map(savedPrices -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(new BulkSaveResponse(savedPrices.size(),
                                savedPrices.isEmpty() ? "No new data (duplicates skipped)"
                                        : "Historical prices saved successfully")))
                .doOnSuccess(response -> log.info("Result: {} historical prices saved for {}",
                        response.getBody().count(), request.symbol()))
                .doOnError(error -> log.error("Error saving historical prices for {}: {}", request.symbol(),
                        error.getMessage()));
    }

    private Instant parseInstant(String datetime) {
        try {
            return Instant.parse(datetime);
        } catch (Exception e1) {
            try {
                return java.time.LocalDate.parse(datetime, DateTimeFormatter.ISO_DATE)
                        .atStartOfDay(java.time.ZoneOffset.UTC)
                        .toInstant();
            } catch (Exception e2) {
                log.warn("Failed to parse datetime: {}", datetime);
                return Instant.now();
            }
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        try {
            return value != null ? new BigDecimal(value) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Long parseLong(String value) {
        try {
            return value != null ? Long.parseLong(value) : null;
        } catch (Exception e) {
            return null;
        }
    }

    // Request DTOs
    public record HistoricalPricesRequest(
            String symbol,
            TimeSeriesData timeSeries) {
    }

    public record TimeSeriesData(
            MetaData meta,
            List<ValueData> values) {
    }

    public record MetaData(
            String symbol,
            String interval,
            String currency,
            String exchangeTimezone,
            String exchange,
            String micCode,
            String type) {
    }

    public record ValueData(
            String datetime,
            String open,
            String high,
            String low,
            String close,
            String volume) {
    }

    public record BulkSaveResponse(int count, String message) {
    }

    public record LatestDateResponse(String symbol, String latestDate) {
    }
}
