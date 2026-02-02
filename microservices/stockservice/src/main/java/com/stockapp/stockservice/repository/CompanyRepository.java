package com.stockapp.stockservice.repository;

import com.stockapp.stockservice.domain.Company;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * Spring Data MongoDB reactive repository for the Company entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CompanyRepository extends ReactiveMongoRepository<Company, String> {
    Flux<Company> findAllBy(Pageable pageable);

    reactor.core.publisher.Mono<Company> findBySymbol(String symbol);

    // Use this when duplicates may exist - returns first match
    reactor.core.publisher.Mono<Company> findFirstBySymbol(String symbol);
}
