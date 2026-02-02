package com.stockapp.aitoolsservice.repository;

import com.stockapp.aitoolsservice.domain.IndustryAnalysis;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

/**
 * Spring Data MongoDB reactive repository for the IndustryAnalysis entity.
 */
@SuppressWarnings("unused")
@Repository
public interface IndustryAnalysisRepository extends ReactiveMongoRepository<IndustryAnalysis, String> {
    @Query("{}")
    Flux<IndustryAnalysis> findAllWithEagerRelationships(Pageable pageable);

    @Query("{}")
    Flux<IndustryAnalysis> findAllWithEagerRelationships();

    @Query("{'id': ?0}")
    Mono<IndustryAnalysis> findOneWithEagerRelationships(String id);

    /**
     * Find all industry analyses ordered by report date descending
     */
    Flux<IndustryAnalysis> findAllByOrderByReportDateDesc();

    /**
     * Find industry analyses by report date
     */
    Flux<IndustryAnalysis> findByReportDate(LocalDate reportDate);

    /**
     * Find industry analyses by industry name
     */
    Flux<IndustryAnalysis> findByIndustryNameOrderByReportDateDesc(String industryName);
}
