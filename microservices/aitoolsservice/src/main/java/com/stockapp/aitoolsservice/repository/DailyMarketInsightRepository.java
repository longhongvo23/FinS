package com.stockapp.aitoolsservice.repository;

import com.stockapp.aitoolsservice.domain.DailyMarketInsight;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.LocalDate;

/**
 * Spring Data MongoDB reactive repository for the DailyMarketInsight entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DailyMarketInsightRepository extends ReactiveMongoRepository<DailyMarketInsight, String> {

    Mono<DailyMarketInsight> findByReportDate(LocalDate reportDate);

    Flux<DailyMarketInsight> findAllByOrderByReportDateDesc();
}
