package com.stockapp.crawlservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * REST client for UserService internal APIs
 * Used to get watchlist information for notifications
 */
@Service
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final WebClient webClient;

    public UserServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${application.user-service.url:http://userservice:8081}") String userServiceUrl) {
        this.webClient = webClientBuilder
                .baseUrl(userServiceUrl)
                .build();
    }

    /**
     * Get all user IDs who have a specific symbol in their watchlist
     * Used to send targeted price notifications
     */
    public Mono<List<String>> getUserIdsBySymbol(String symbol) {
        log.debug("Getting users watching symbol: {}", symbol);

        return webClient.get()
                .uri("/api/internal/watchlist/users/{symbol}", symbol)
                .retrieve()
                .bodyToFlux(String.class)
                .collectList()
                .doOnSuccess(userIds -> log.debug("Found {} users watching {}", userIds.size(), symbol))
                .doOnError(error -> log.error("Failed to get users for {}: {}", symbol, error.getMessage()))
                .onErrorReturn(List.of()); // Return empty list on error, don't fail the main flow
    }
}
