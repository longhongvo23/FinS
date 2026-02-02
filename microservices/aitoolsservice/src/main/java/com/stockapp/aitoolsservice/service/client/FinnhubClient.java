package com.stockapp.aitoolsservice.service.client;

import com.stockapp.aitoolsservice.config.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

/**
 * Client to fetch real-time stock quotes from Finnhub API
 * https://finnhub.io/docs/api/quote
 */
@Service
public class FinnhubClient {

    private static final Logger LOG = LoggerFactory.getLogger(FinnhubClient.class);

    private final WebClient webClient;
    private final ApplicationProperties properties;

    public FinnhubClient(ApplicationProperties properties) {
        this.properties = properties;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getFinnhub().getBaseUrl())
                .build();
    }

    /**
     * Fetch real-time quote for a stock symbol from Finnhub
     * 
     * @param symbol Stock symbol (e.g., AAPL, NVDA, MSFT)
     * @return Mono of FinnhubQuoteResponse
     */
    public Mono<FinnhubQuoteResponse> getQuote(String symbol) {
        String apiKey = properties.getFinnhub().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            LOG.warn("Finnhub API key not configured, skipping quote fetch for {}", symbol);
            return Mono.empty();
        }

        LOG.debug("Fetching quote from Finnhub for symbol: {}", symbol);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/quote")
                        .queryParam("symbol", symbol)
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(FinnhubQuoteResponse.class)
                .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                        .filter(throwable -> throwable instanceof WebClientResponseException.TooManyRequests)
                        .doBeforeRetry(retrySignal -> LOG.warn("Finnhub rate limited, retrying... attempt: {}",
                                retrySignal.totalRetries() + 1)))
                .doOnSuccess(response -> {
                    if (response != null && response.c() != null && response.c() > 0) {
                        LOG.info("Successfully fetched Finnhub quote for {}: price=${}", symbol, response.c());
                    } else {
                        LOG.warn("Empty or invalid response from Finnhub for {}", symbol);
                    }
                })
                .doOnError(error -> LOG.error("Error fetching Finnhub quote for {}: {}", symbol, error.getMessage()))
                .onErrorResume(e -> Mono.empty());
    }

    /**
     * Finnhub Quote Response DTO
     * https://finnhub.io/docs/api/quote
     *
     * @param c  Current price
     * @param d  Change
     * @param dp Percent change
     * @param h  High price of the day
     * @param l  Low price of the day
     * @param o  Open price of the day
     * @param pc Previous close price
     * @param t  Timestamp
     */
    public record FinnhubQuoteResponse(
            Double c, // Current price
            Double d, // Change
            Double dp, // Percent change
            Double h, // High price of the day
            Double l, // Low price of the day
            Double o, // Open price of the day
            Double pc, // Previous close price
            Long t // Timestamp
    ) {
        /**
         * Check if this is a valid quote (has price data)
         */
        public boolean isValid() {
            return c != null && c > 0;
        }
    }
}
