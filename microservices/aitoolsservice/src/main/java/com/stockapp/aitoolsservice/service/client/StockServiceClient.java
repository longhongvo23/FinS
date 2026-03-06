package com.stockapp.aitoolsservice.service.client;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.stockapp.aitoolsservice.config.ApplicationProperties;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService.StockData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Client to fetch stock data from stockservice and Finnhub
 */
@Service
public class StockServiceClient {

        private static final Logger LOG = LoggerFactory.getLogger(StockServiceClient.class);

        private final WebClient webClient;
        private final ApplicationProperties properties;
        private final FinnhubClient finnhubClient;

        public StockServiceClient(ApplicationProperties properties, FinnhubClient finnhubClient) {
                this.properties = properties;
                this.finnhubClient = finnhubClient;
                this.webClient = WebClient.builder()
                                .baseUrl(properties.getStockService().getUrl())
                                .build();
        }

        /**
         * Get quote for a symbol using Finnhub API for real-time data
         */
        public Mono<QuoteResponse> getQuote(String symbol) {
                return finnhubClient.getQuote(symbol)
                                .filter(FinnhubClient.FinnhubQuoteResponse::isValid)
                                .map(finnhubQuote -> new QuoteResponse(
                                                symbol,
                                                null, // name not available from Finnhub quote
                                                finnhubQuote.o(),
                                                finnhubQuote.h(),
                                                finnhubQuote.l(),
                                                finnhubQuote.c(),
                                                null, // volume not available from Finnhub quote endpoint
                                                finnhubQuote.pc(),
                                                finnhubQuote.d(),
                                                finnhubQuote.dp()))
                                .doOnSuccess(quote -> {
                                        if (quote != null) {
                                                LOG.info("Got Finnhub quote for {}: ${}",
                                                                symbol, quote.close());
                                        }
                                })
                                .doOnError(e -> LOG.warn("Failed to get Finnhub quote for {}: {}",
                                                symbol, e.getMessage()))
                                .onErrorResume(e -> Mono.empty());
        }

        /**
         * Get all quotes for configured symbols
         */
        public Flux<StockData> getAllQuotes() {
                return Flux.fromIterable(properties.getSymbols())
                                .flatMap(symbol -> getQuote(symbol)
                                                .map(quote -> new StockData(
                                                                symbol,
                                                                quote.close() != null ? quote.close() : 0.0,
                                                                quote.percentChange() != null ? quote.percentChange()
                                                                                : 0.0,
                                                                quote.volume() != null ? quote.volume() : 0L)));
        }

        /**
         * Get all stock data as a single list (for batch operations)
         */
        public Mono<java.util.List<StockData>> getStockData() {
                return getAllQuotes().collectList();
        }

        /**
         * Get stock data for specific symbols (watchlist)
         */
        public Mono<java.util.List<StockData>> getStockDataForSymbols(java.util.List<String> symbols) {
                return Flux.fromIterable(symbols)
                                .flatMap(symbol -> getQuote(symbol)
                                                .map(quote -> new StockData(
                                                                symbol,
                                                                quote.close() != null ? quote.close() : 0.0,
                                                                quote.percentChange() != null ? quote.percentChange()
                                                                                : 0.0,
                                                                quote.volume() != null ? quote.volume() : 0L)))
                                .collectList()
                                .map(list -> {
                                        LOG.info("Fetched data for {} watchlist symbols", list.size());
                                        return list;
                                });
        }

        /**
         * Get company info
         */
        public Mono<CompanyResponse> getCompany(String symbol) {
                return webClient.get()
                                .uri("/api/public/stocks/{symbol}", symbol)
                                .retrieve()
                                .bodyToMono(CompanyResponse.class)
                                .onErrorResume(e -> Mono.empty());
        }

        /**
         * Get historical prices for a symbol
         */
        public Flux<HistoricalPriceResponse> getHistoricalPrices(String symbol, int days) {
                return webClient.get()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/api/public/stocks/{symbol}/history")
                                                .queryParam("size", days)
                                                .build(symbol))
                                .retrieve()
                                .bodyToFlux(HistoricalPriceResponse.class)
                                .doOnError(e -> LOG.warn("Failed to get history for {}: {}", symbol, e.getMessage()))
                                .onErrorResume(e -> Flux.empty());
        }

        /**
         * Get AI predictions for a symbol (from existing aiservice Prophet model)
         */
        public Mono<PredictionResponse> getPrediction(String symbol) {
                return WebClient.create("http://aiservice:8086")
                                .get()
                                .uri("/api/recommendation/{symbol}", symbol)
                                .retrieve()
                                .bodyToMono(PredictionResponse.class)
                                .timeout(Duration.ofSeconds(60))
                                .doOnSuccess(p -> {
                                        if (p != null) {
                                                LOG.info("Got Prophet prediction for {}: {} (buy={}, sell={}, hold={})",
                                                                symbol, p.recommendation(), p.buy(), p.sell(),
                                                                p.hold());
                                        }
                                })
                                .onErrorResume(e -> {
                                        LOG.warn("Failed to get Prophet prediction for {}: {}", symbol, e.getMessage());
                                        return Mono.empty();
                                });
        }

        /**
         * Get AI predictions for all configured symbols
         */
        public Mono<java.util.Map<String, PredictionResponse>> getAllPredictions() {
                return Flux.fromIterable(properties.getSymbols())
                                .flatMap(symbol -> getPrediction(symbol)
                                                .map(pred -> java.util.Map.entry(symbol, pred)), 3)
                                .collectMap(java.util.Map.Entry::getKey, java.util.Map.Entry::getValue)
                                .doOnSuccess(map -> {
                                        if (map.isEmpty()) {
                                                LOG.warn("Prophet predictions map is EMPTY — override will be skipped!");
                                        } else {
                                                LOG.info("Got Prophet predictions for {} symbols: {}", map.size(),
                                                                map.keySet());
                                        }
                                });
        }

        /**
         * Get AI predictions for specific symbols
         */
        public Mono<java.util.Map<String, PredictionResponse>> getPredictionsForSymbols(
                        java.util.List<String> symbols) {
                return Flux.fromIterable(symbols)
                                .flatMap(symbol -> getPrediction(symbol)
                                                .map(pred -> java.util.Map.entry(symbol, pred)), 3)
                                .collectMap(java.util.Map.Entry::getKey, java.util.Map.Entry::getValue)
                                .doOnSuccess(map -> {
                                        if (map.isEmpty()) {
                                                LOG.warn("Prophet predictions map is EMPTY for watchlist — override will be skipped!");
                                        } else {
                                                LOG.info("Got Prophet predictions for {} watchlist symbols: {}",
                                                                map.size(), map.keySet());
                                        }
                                });
        }

        // Response DTOs
        public record QuoteResponse(
                        String symbol,
                        String name,
                        Double open,
                        Double high,
                        Double low,
                        Double close,
                        Long volume,
                        Double previousClose,
                        Double change,
                        Double percentChange) {
        }

        public record CompanyResponse(
                        String symbol,
                        String name,
                        String exchange,
                        String industry,
                        String logo) {
        }

        public record HistoricalPriceResponse(
                        String datetime,
                        Double open,
                        Double high,
                        Double low,
                        Double close,
                        Long volume) {
        }

        public record PredictionMetadata(
                        Double predicted_price,
                        Double current_price,
                        Double change_percent,
                        Double confidence_lower,
                        Double confidence_upper) {
        }

        public record PredictionResponse(
                        String symbol,
                        String recommendation,
                        Integer buy,
                        Integer hold,
                        Integer sell,
                        @JsonAlias("strong_buy") Integer strongBuy,
                        @JsonAlias("strong_sell") Integer strongSell,
                        PredictionMetadata metadata,
                        String created_at) {

                /**
                 * Get predicted_price from metadata if available
                 */
                public Double predicted_price() {
                        return metadata != null ? metadata.predicted_price() : null;
                }

                /**
                 * Get change_percent from metadata if available
                 */
                public Double change_percent() {
                        return metadata != null ? metadata.change_percent() : null;
                }

                /**
                 * Get the dominant recommendation label from Prophet model.
                 * Uses the recommendation field directly (most reliable),
                 * falls back to count-based calculation if recommendation is missing.
                 */
                public String getDominantSignal() {
                        // Use recommendation field directly from Prophet model
                        if (recommendation != null && !recommendation.isBlank()) {
                                return recommendation.toUpperCase().trim();
                        }
                        // Fallback: calculate from counts
                        if (strongSell != null && strongSell > 0 && (sell == null || strongSell >= sell))
                                return "STRONG_SELL";
                        if (sell != null && sell > 30)
                                return "SELL";
                        if (strongBuy != null && strongBuy > 0 && (buy == null || strongBuy >= buy))
                                return "STRONG_BUY";
                        if (buy != null && buy > 30)
                                return "BUY";
                        return "HOLD";
                }
        }
}
