package com.stockapp.stockservice.web.rest.internal;

import com.stockapp.stockservice.domain.Company;
import com.stockapp.stockservice.repository.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Internal REST API for CrawlService to save company profiles
 * NOT exposed to public API Gateway
 */
@RestController
@RequestMapping("/api/internal/companies")
public class CompanyInternalResource {

    private static final Logger log = LoggerFactory.getLogger(CompanyInternalResource.class);

    private final CompanyRepository companyRepository;

    public CompanyInternalResource(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    /**
     * POST /api/internal/companies/profile
     * Save or update company profile from Finnhub API
     */
    @PostMapping("/profile")
    public Mono<ResponseEntity<Void>> saveCompanyProfile(@RequestBody CompanyProfileRequest request) {
        log.info("Received company profile for symbol: {}", request.symbol());

        return companyRepository.findFirstBySymbol(request.symbol())
                .switchIfEmpty(Mono.fromSupplier(() -> {
                    Company newCompany = new Company();
                    newCompany.setSymbol(request.symbol());
                    return newCompany;
                }))
                .flatMap(company -> {
                    // Map ProfileResponse to Company entity
                    var profile = request.profile();

                    company.setName(profile.name());
                    company.setCountry(profile.country());
                    company.setCurrency(profile.currency());
                    company.setExchange(profile.exchange());
                    company.setFinnhubIndustry(profile.finnhubIndustry());
                    company.setLogo(profile.logo());
                    company.setWeburl(profile.weburl());
                    company.setPhone(profile.phone());

                    if (profile.marketCapitalization() != null) {
                        company.setMarketCapitalization(BigDecimal.valueOf(profile.marketCapitalization()));
                    }

                    if (profile.shareOutstanding() != null) {
                        company.setShareOutstanding(BigDecimal.valueOf(profile.shareOutstanding()));
                    }

                    if (profile.ipo() != null && !profile.ipo().isEmpty()) {
                        try {
                            company.setIpo(LocalDate.parse(profile.ipo(), DateTimeFormatter.ISO_DATE));
                        } catch (Exception e) {
                            log.warn("Failed to parse IPO date: {}", profile.ipo());
                        }
                    }

                    return companyRepository.save(company);
                })
                .then(Mono.just(ResponseEntity.status(HttpStatus.CREATED).<Void>build()))
                .doOnSuccess(v -> log.info("Successfully saved company profile for {}", request.symbol()))
                .doOnError(error -> log.error("Error saving company profile for {}: {}", request.symbol(),
                        error.getMessage()));
    }

    // Request DTOs
    public record CompanyProfileRequest(
            String symbol,
            ProfileData profile) {
    }

    public record ProfileData(
            String country,
            String currency,
            String exchange,
            String ipo,
            Double marketCapitalization,
            String name,
            String phone,
            Double shareOutstanding,
            String ticker,
            String weburl,
            String logo,
            String finnhubIndustry) {
    }
}
