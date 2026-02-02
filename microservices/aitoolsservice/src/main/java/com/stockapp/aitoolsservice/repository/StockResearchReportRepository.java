package com.stockapp.aitoolsservice.repository;

import com.stockapp.aitoolsservice.domain.StockResearchReport;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data MongoDB reactive repository for the StockResearchReport entity.
 */
@SuppressWarnings("unused")
@Repository
public interface StockResearchReportRepository extends ReactiveMongoRepository<StockResearchReport, String> {
    Flux<StockResearchReport> findAllBy(Pageable pageable);

    Mono<StockResearchReport> findTopBySymbolOrderByCreatedDateDesc(String symbol);

    Flux<StockResearchReport> findAllByOrderByCreatedDateDesc();

    Flux<StockResearchReport> findBySymbol(String symbol);
}
