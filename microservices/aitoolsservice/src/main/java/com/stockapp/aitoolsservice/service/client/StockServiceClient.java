package com.stockapp.aitoolsservice.service.client;

import com.stockapp.aitoolsservice.config.ApplicationProperties;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService.StockData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
         * Get AI predictions for a symbol (from existing aiservice)
         */
        public Mono<PredictionResponse> getPrediction(String symbol) {
                // Call the existing Python aiservice
                return WebClient.create("http://aiservice:8086")
                                .get()
                                .uri("/predictions/{symbol}/latest", symbol)
                                .retrieve()
                                .bodyToMono(PredictionResponse.class)
                                .onErrorResume(e -> Mono.empty());
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

        public record PredictionResponse(
                        String symbol,
                        String recommendation,
                        Double predicted_price,
                        Double confidence,
                        String created_at) {
        }
}
