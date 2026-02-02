package com.stockapp.aitoolsservice.repository;

import com.stockapp.aitoolsservice.domain.ChatHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * Spring Data MongoDB reactive repository for the ChatHistory entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ChatHistoryRepository extends ReactiveMongoRepository<ChatHistory, String> {
    Flux<ChatHistory> findAllBy(Pageable pageable);

    Flux<ChatHistory> findByUserIdOrderByTimestampDesc(String userId);

    Flux<ChatHistory> findBySessionIdOrderByTimestampAsc(String sessionId);
}
