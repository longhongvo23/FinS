package com.stockapp.aitoolsservice.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockapp.aitoolsservice.config.ApplicationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Dedicated AI Service for Insights features
 * Uses different model priority to avoid impacting chat quota
 * 
 * AI_INSIGHTS Feature: Uses gemma-3-27b-it (optimized for reasoning)
 * Fallback order when RPD exceeded: gemma-3-12b-it → gemma-3-4b-it →
 * gemini-2.0-flash → gemini-2.5-flash
 * 
 * Model naming convention: Gemma models require "-it" suffix
 * (instruction-tuned)
 * RPD (Requests Per Day) priorities considered for fallback order
 */
@Service
public class InsightsAIService {

    private static final Logger LOG = LoggerFactory.getLogger(InsightsAIService.class);

    // Default AI_INSIGHTS models - CORRECT API names from Google AI Studio
    // Gemma models require "-it" suffix (instruction-tuned variants)
    // Order by: Reasoning capability → RPD availability
    private static final List<String> DEFAULT_INSIGHTS_MODELS = List.of(
            "gemma-3-27b-it", // Primary: Best reasoning capability (15K RPD)
            "gemma-3-12b-it", // Backup 1: Good reasoning (15K RPD)
            "gemma-3-4b-it", // Backup 2: Lighter model (15K RPD)
            "gemini-2.0-flash", // Backup 3: Stable Gemini
            "gemini-2.5-flash" // Backup 4: Latest Gemini
    );

    private final WebClient webClient;
    private final ApplicationProperties properties;
    private final ObjectMapper objectMapper;
    private final List<String> insightsModels;

    public InsightsAIService(ApplicationProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getGemini().getBaseUrl())
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        // Load insights models from configuration or use defaults
        List<String> configuredModels = properties.getGemini().getInsightsFallbackModels();
        this.insightsModels = (configuredModels != null && !configuredModels.isEmpty())
                ? configuredModels
                : DEFAULT_INSIGHTS_MODELS;

        LOG.info("AI_INSIGHTS initialized with models: {}", insightsModels);
    }

    /**
     * Generate Top Movers analysis for 7 tracked stocks
     */
    public Mono<TopMoversResponse> generateTopMovers(List<GeminiClientService.StockData> stocks) {
        String prompt = buildTopMoversPrompt(stocks);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, TopMoversResponse.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating top movers: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Generate Weekly Outlook for the market
     */
    public Mono<WeeklyOutlookResponse> generateWeeklyOutlook(List<GeminiClientService.StockData> stocks) {
        String prompt = buildWeeklyOutlookPrompt(stocks);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, WeeklyOutlookResponse.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating weekly outlook: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Generate Trading Signals based on technical analysis
     */
    public Mono<TradingSignalsResponse> generateTradingSignals(List<GeminiClientService.StockData> stocks) {
        String prompt = buildTradingSignalsPrompt(stocks);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, TradingSignalsResponse.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating trading signals: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Generate Stock Correlation analysis
     */
    public Mono<CorrelationResponse> generateCorrelationAnalysis(List<GeminiClientService.StockData> stocks) {
        String prompt = buildCorrelationPrompt(stocks);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, CorrelationResponse.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating correlation analysis: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    private Mono<String> callAI(String prompt) {
        String apiKey = properties.getGemini().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return Mono.error(new IllegalStateException("API key not configured"));
        }
        // AI_INSIGHTS uses configured insights models with gemma-3-27b as primary
        return callAIWithFallback(prompt, apiKey, insightsModels, 0);
    }

    private Mono<String> callAIWithFallback(String prompt, String apiKey, List<String> models, int modelIndex) {
        if (modelIndex >= models.size()) {
            LOG.error("All Insights AI models exhausted");
            return Mono.error(new IllegalStateException("All AI models unavailable"));
        }

        String currentModel = models.get(modelIndex);
        LOG.info("Insights AI calling model: {} (attempt {}/{})", currentModel, modelIndex + 1, models.size());

        // Build generation config - Gemma models don't support responseMimeType
        Map<String, Object> generationConfig = buildGenerationConfig(currentModel, 0.7, 4096);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt)))),
                "generationConfig", generationConfig);

        return webClient.post()
                .uri("/models/{model}:generateContent?key={key}", currentModel, apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractContentFromResponse)
                .onErrorResume(e -> {
                    if (shouldFallback(e)) {
                        LOG.warn("Insights model {} failed: {}, trying next...", currentModel, getErrorReason(e));
                        return callAIWithFallback(prompt, apiKey, models, modelIndex + 1);
                    }
                    return Mono.error(e);
                });
    }

    private boolean shouldFallback(Throwable e) {
        if (e instanceof WebClientResponseException wcre) {
            int status = wcre.getStatusCode().value();
            // 400 = Bad Request (model doesn't support config), 403 = Forbidden (model
            // unavailable),
            // 429 = Rate Limit, 503 = Service Unavailable, 500 = Server Error, 404 = Model
            // not found
            return status == 400 || status == 403 || status == 429 || status == 503 || status == 500 || status == 502
                    || status == 404;
        }
        return e.getMessage() != null && (e.getMessage().contains("quota") ||
                e.getMessage().contains("rate") ||
                e.getMessage().contains("limit"));
    }

    private String getErrorReason(Throwable e) {
        if (e instanceof WebClientResponseException wcre) {
            return "HTTP " + wcre.getStatusCode().value();
        }
        return e.getMessage();
    }

    /**
     * Build generation config based on model type.
     * Gemma models don't support responseMimeType, only Gemini models do.
     */
    private Map<String, Object> buildGenerationConfig(String modelName, double temperature, int maxOutputTokens) {
        // Gemma models (gemma-*) don't support responseMimeType
        boolean isGemmaModel = modelName.toLowerCase().startsWith("gemma");

        if (isGemmaModel) {
            return Map.of(
                    "temperature", temperature,
                    "maxOutputTokens", maxOutputTokens);
        } else {
            // Gemini models support responseMimeType for structured JSON output
            return Map.of(
                    "temperature", temperature,
                    "maxOutputTokens", maxOutputTokens,
                    "responseMimeType", "application/json");
        }
    }

    private String extractContentFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
        } catch (JsonProcessingException e) {
            LOG.error("Error parsing response: {}", e.getMessage());
            return "{}";
        }
    }

    private <T> T parseJsonResponse(String json, Class<T> clazz) {
        try {
            // Clean markdown code blocks if present (Gemma models)
            String cleanedJson = cleanMarkdownCodeBlock(json);
            return objectMapper.readValue(cleanedJson, clazz);
        } catch (JsonProcessingException e) {
            LOG.error("Error parsing JSON to {}: {}", clazz.getSimpleName(), e.getMessage());
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    /**
     * Clean markdown code blocks from Gemma model responses.
     * Gemma models often wrap JSON in ```json ... ``` blocks.
     */
    private String cleanMarkdownCodeBlock(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        String trimmed = content.trim();
        // Handle ```json ... ``` or ``` ... ``` blocks
        if (trimmed.startsWith("```")) {
            // Find first newline after opening ```
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) {
                // Remove opening ``` line
                trimmed = trimmed.substring(firstNewline + 1);
            }
            // Remove closing ```
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3).trim();
            }
        }
        return trimmed;
    }

    // ==================== Prompt Builders ====================

    private String buildTopMoversPrompt(List<GeminiClientService.StockData> stocks) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là chuyên gia phân tích 7 cổ phiếu tech US: AAPL, NVDA, MSFT, AMZN, TSLA, META, GOOGL.\n\n");
        sb.append("Dữ liệu hiện tại:\n");

        for (GeminiClientService.StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f, thay đổi %.2f%%, volume %d\n",
                    stock.symbol(), stock.price(), stock.percentChange(), stock.volume()));
        }

        sb.append("\nPhân tích top movers (tăng/giảm mạnh nhất) và giải thích LÝ DO cụ thể.\n");
        sb.append("Trả về JSON:\n");
        sb.append("""
                {
                    "gainers": [
                        {"symbol": "NVDA", "name": "NVIDIA Corp", "change": 3.81, "reason": "Lý do tăng chi tiết..."}
                    ],
                    "losers": [
                        {"symbol": "AMZN", "name": "Amazon.com", "change": -0.80, "reason": "Lý do giảm chi tiết..."}
                    ],
                    "market_mood": "bullish/bearish/neutral",
                    "summary": "Tóm tắt ngắn về thị trường hôm nay"
                }
                """);
        return sb.toString();
    }

    private String buildWeeklyOutlookPrompt(List<GeminiClientService.StockData> stocks) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là chuyên gia dự báo thị trường US tech. Hôm nay là " + today + ".\n\n");
        sb.append("7 mã theo dõi: AAPL, NVDA, MSFT, AMZN, TSLA, META, GOOGL\n\n");
        sb.append("Dữ liệu hiện tại:\n");

        for (GeminiClientService.StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f (%.2f%%)\n",
                    stock.symbol(), stock.price(), stock.percentChange()));
        }

        sb.append("\nHãy dự báo triển vọng TUẦN TỚI. Trả về JSON:\n");
        sb.append("""
                {
                    "summary": "Nhận định tổng quan tuần tới 2-3 câu...",
                    "key_events": [
                        {"date": "Thứ 2", "event": "Mô tả sự kiện quan trọng"},
                        {"date": "Thứ 4", "event": "FOMC meeting..."}
                    ],
                    "stocks_to_watch": ["NVDA", "AAPL", "MSFT"],
                    "bullish_picks": ["NVDA", "TSLA"],
                    "bearish_risks": ["GOOGL"],
                    "target_levels": {
                        "NASDAQ": {"support": 19500, "resistance": 20500},
                        "S&P500": {"support": 5800, "resistance": 6100}
                    }
                }
                """);
        return sb.toString();
    }

    private String buildTradingSignalsPrompt(List<GeminiClientService.StockData> stocks) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là technical analyst chuyên nghiệp. Phân tích 7 mã US tech:\n\n");

        for (GeminiClientService.StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f, biến động %.2f%%\n",
                    stock.symbol(), stock.price(), stock.percentChange()));
        }

        sb.append("\nĐưa ra TRADING SIGNALS dựa trên phân tích kỹ thuật. Trả về JSON:\n");
        sb.append("""
                {
                    "signals": [
                        {
                            "symbol": "NVDA",
                            "action": "BUY/SELL/HOLD",
                            "strength": "STRONG/MODERATE/WEAK",
                            "entry_price": 148.00,
                            "stop_loss": 140.00,
                            "take_profit": 165.00,
                            "reason": "RSI oversold, MACD bullish crossover...",
                            "timeframe": "1-2 tuần"
                        }
                    ],
                    "market_bias": "bullish/bearish/neutral",
                    "risk_level": "low/medium/high"
                }
                """);
        return sb.toString();
    }

    private String buildCorrelationPrompt(List<GeminiClientService.StockData> stocks) {
        StringBuilder sb = new StringBuilder();
        sb.append("Phân tích mối tương quan giữa 7 mã US tech:\n\n");

        for (GeminiClientService.StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f (%.2f%%)\n",
                    stock.symbol(), stock.price(), stock.percentChange()));
        }

        sb.append("\nXác định các cặp cổ phiếu có tương quan cao/thấp. Trả về JSON:\n");
        sb.append("""
                {
                    "high_correlation_pairs": [
                        {"pair": ["AAPL", "MSFT"], "correlation": 0.85, "insight": "Cả hai đều hưởng lợi từ AI..."}
                    ],
                    "low_correlation_pairs": [
                        {"pair": ["TSLA", "GOOGL"], "correlation": 0.25, "insight": "Ngành khác nhau..."}
                    ],
                    "sector_leaders": ["NVDA", "MSFT"],
                    "diversification_tip": "Để đa dạng hóa, nên kết hợp NVDA với AMZN..."
                }
                """);
        return sb.toString();
    }

    // ==================== Response DTOs ====================

    public record TopMoversResponse(
            List<StockMover> gainers,
            List<StockMover> losers,
            String market_mood,
            String summary) {
    }

    public record StockMover(
            String symbol,
            String name,
            Double change,
            String reason) {
    }

    public record WeeklyOutlookResponse(
            String summary,
            List<KeyEvent> key_events,
            List<String> stocks_to_watch,
            List<String> bullish_picks,
            List<String> bearish_risks,
            Map<String, TargetLevel> target_levels) {
    }

    public record KeyEvent(String date, String event) {
    }

    public record TargetLevel(Integer support, Integer resistance) {
    }

    public record TradingSignalsResponse(
            List<TradingSignal> signals,
            String market_bias,
            String risk_level) {
    }

    public record TradingSignal(
            String symbol,
            String action,
            String strength,
            Double entry_price,
            Double stop_loss,
            Double take_profit,
            String reason,
            String timeframe) {
    }

    public record CorrelationResponse(
            List<CorrelationPair> high_correlation_pairs,
            List<CorrelationPair> low_correlation_pairs,
            List<String> sector_leaders,
            String diversification_tip) {
    }

    public record CorrelationPair(
            List<String> pair,
            Double correlation,
            String insight) {
    }
}
