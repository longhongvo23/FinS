package com.stockapp.userservice.web.rest;

import com.stockapp.userservice.service.WatchlistItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * Internal REST API for Watchlist - used by other microservices
 * No authentication required for internal calls (service-to-service)
 */
@RestController
@RequestMapping("/api/internal/watchlist")
@Tag(name = "Internal Watchlist API", description = "Internal endpoints for watchlist operations from other services")
public class InternalWatchlistResource {

    private static final Logger LOG = LoggerFactory.getLogger(InternalWatchlistResource.class);

    private final WatchlistItemService watchlistItemService;

    public InternalWatchlistResource(WatchlistItemService watchlistItemService) {
        this.watchlistItemService = watchlistItemService;
    }

    /**
     * GET /api/internal/watchlist/users/{symbol} : Get all user IDs watching a
     * symbol
     * Used by crawlservice, aiservice, newsservice to send targeted notifications
     *
     * @param symbol the stock symbol
     * @return list of user IDs who have this symbol in their watchlist
     */
    @GetMapping(value = "/users/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get users by symbol", description = "Get all user IDs watching a specific stock symbol")
    public Flux<String> getUsersBySymbol(@PathVariable String symbol) {
        LOG.info("Internal API request to get users watching symbol: {}", symbol);
        return watchlistItemService.findUserIdsBySymbol(symbol.toUpperCase());
    }
}
