package com.stockapp.stockservice.web.rest.internal;

import com.stockapp.stockservice.domain.Company;
import com.stockapp.stockservice.domain.Recommendation;
import com.stockapp.stockservice.repository.CompanyRepository;
import com.stockapp.stockservice.repository.RecommendationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Internal REST API for CrawlService to save recommendations
 * NOT exposed to public API Gateway
 */
@RestController
@RequestMapping("/api/internal/recommendations")
public class RecommendationInternalResource {

    private static final Logger log = LoggerFactory.getLogger(RecommendationInternalResource.class);

    private final RecommendationRepository recommendationRepository;
    private final CompanyRepository companyRepository;

    public RecommendationInternalResource(
            RecommendationRepository recommendationRepository,
            CompanyRepository companyRepository) {
        this.recommendationRepository = recommendationRepository;
        this.companyRepository = companyRepository;
    }

    /**
     * POST /api/internal/recommendations/bulk
     * Save recommendations in bulk from Finnhub API
     */
    @PostMapping("/bulk")
    public Mono<ResponseEntity<BulkSaveResponse>> saveRecommendationsBulk(@RequestBody RecommendationsRequest request) {
        log.info("Received {} recommendations for symbol: {}",
                request.recommendations() != null ? request.recommendations().size() : 0,
                request.symbol());

        return companyRepository.findFirstBySymbol(request.symbol())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Company not found: " + request.symbol())))
                .flatMapMany(company -> {
                    if (request.recommendations() == null || request.recommendations().isEmpty()) {
                        return Flux.empty();
                    }

                    return Flux.fromIterable(request.recommendations())
                            .map(rec -> {
                                Recommendation recommendation = new Recommendation();
                                // Parse period from String to LocalDate
                                try {
                                    recommendation.setPeriod(java.time.LocalDate.parse(rec.period()));
                                } catch (Exception e) {
                                    log.warn("Failed to parse period: {}", rec.period());
                                }
                                recommendation.setBuy(rec.buy());
                                recommendation.setHold(rec.hold());
                                recommendation.setSell(rec.sell());
                                recommendation.setStrongBuy(rec.strongBuy());
                                recommendation.setStrongSell(rec.strongSell());
                                recommendation.setCompany(company);
                                return recommendation;
                            });
                })
                .collectList()
                .flatMap(recommendations -> recommendationRepository.saveAll(recommendations).collectList())
                .map(savedRecs -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(new BulkSaveResponse(savedRecs.size(), "Recommendations saved successfully")))
                .doOnSuccess(response -> log.info("Successfully saved {} recommendations for {}",
                        response.getBody().count(), request.symbol()))
                .doOnError(error -> log.error("Error saving recommendations for {}: {}", request.symbol(),
                        error.getMessage()));
    }

    // Request DTOs
    public record RecommendationsRequest(
            String symbol,
            List<RecommendationData> recommendations) {
    }

    public record RecommendationData(
            String symbol,
            String period,
            Integer buy,
            Integer hold,
            Integer sell,
            Integer strongBuy,
            Integer strongSell) {
    }

    public record BulkSaveResponse(int count, String message) {
    }
}
