package com.stockapp.crawlservice.repository;

import com.stockapp.crawlservice.domain.CrawlJobState;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * Spring Data MongoDB reactive repository for the CrawlJobState entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CrawlJobStateRepository extends ReactiveMongoRepository<CrawlJobState, String> {
    Flux<CrawlJobState> findAllBy(Pageable pageable);

    reactor.core.publisher.Mono<CrawlJobState> findBySymbol(String symbol);

    // Use this when duplicates may exist - returns first match
    reactor.core.publisher.Mono<CrawlJobState> findFirstBySymbol(String symbol);
}
