package com.stockapp.userservice.repository;

import com.stockapp.userservice.domain.WatchlistItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data MongoDB reactive repository for the WatchlistItem entity.
 */
@SuppressWarnings("unused")
@Repository
public interface WatchlistItemRepository extends ReactiveMongoRepository<WatchlistItem, String> {
    Flux<WatchlistItem> findAllBy(Pageable pageable);

    @Query("{}")
    Flux<WatchlistItem> findAllWithEagerRelationships(Pageable pageable);

    @Query("{}")
    Flux<WatchlistItem> findAllWithEagerRelationships();

    @Query("{'id': ?0}")
    Mono<WatchlistItem> findOneWithEagerRelationships(String id);

    // Custom queries for public API
    Flux<WatchlistItem> findByUserId(String userId);

    Mono<WatchlistItem> findByUserIdAndSymbol(String userId, String symbol);

    Mono<Void> deleteByUserIdAndSymbol(String userId, String symbol);

    // Find all users watching a specific symbol (for notifications)
    Flux<WatchlistItem> findBySymbol(String symbol);
}
