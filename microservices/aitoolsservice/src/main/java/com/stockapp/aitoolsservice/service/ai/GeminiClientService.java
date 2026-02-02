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
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for interacting with Google Gemini API
 * Handles all AI prompts and JSON parsing
 * Supports automatic model fallback when quota is exceeded
 * 
 * AI_CHAT Feature: Uses gemma-3-12b-it (optimized for speed)
 * Fallback order when RPD exceeded: gemma-3-4b-it → gemma-3-1b-it →
 * gemini-2.0-flash-lite → gemini-2.0-flash
 * 
 * Model naming convention: Gemma models require "-it" suffix
 * (instruction-tuned)
 * RPD (Requests Per Day) priorities considered for fallback order
 */
@Service
public class GeminiClientService {

    private static final Logger LOG = LoggerFactory.getLogger(GeminiClientService.class);

    // Default AI_CHAT models - CORRECT API names from Google AI Studio
    // Gemma models require "-it" suffix (instruction-tuned variants)
    // Order by: Speed optimization → RPD availability
    private static final List<String> DEFAULT_CHAT_MODELS = List.of(
            "gemma-3-12b-it", // Primary: Fast responses, good capability (15K RPD)
            "gemma-3-4b-it", // Backup 1: Lighter, faster (15K RPD)
            "gemma-3-1b-it", // Backup 2: Smallest gemma, fastest (15K RPD)
            "gemini-2.0-flash-lite", // Backup 3: High throughput Gemini
            "gemini-2.0-flash" // Backup 4: Stable Gemini fallback
    );

    private final WebClient webClient;
    private final ApplicationProperties properties;
    private final ObjectMapper objectMapper;
    private final List<String> chatModels;

    // Track current model index for fallback
    private final AtomicInteger currentModelIndex = new AtomicInteger(0);

    public GeminiClientService(ApplicationProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getGemini().getBaseUrl())
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();

        // Load chat models from configuration or use defaults
        List<String> configuredModels = properties.getGemini().getChatFallbackModels();
        this.chatModels = (configuredModels != null && !configuredModels.isEmpty())
                ? configuredModels
                : DEFAULT_CHAT_MODELS;

        LOG.info("AI_CHAT initialized with models: {}", chatModels);
    }

    /**
     * Generate market insights from stock data
     * Returns JSON with market_summary, highlights, and sector_analysis
     */
    public Mono<MarketInsightsResponse> generateMarketInsights(List<StockData> stocks) {
        String prompt = buildMarketInsightsPrompt(stocks);
        return callGemini(prompt)
                .map(response -> parseJsonResponse(response, MarketInsightsResponse.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating market insights: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Generate research report for a specific stock
     * Returns JSON with scores, recommendation, and analysis
     */
    public Mono<ResearchReportResponse> generateResearchReport(String symbol, StockData stockData) {
        String prompt = buildResearchReportPrompt(symbol, stockData);
        return callGemini(prompt)
                .map(response -> parseJsonResponse(response, ResearchReportResponse.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating research report for {}: {}", symbol, e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * AI Chat with context (RAG-style)
     */
    public Mono<String> chat(String context, String userQuestion) {
        String prompt = buildChatPrompt(context, userQuestion);
        return callGemini(prompt)
                .map(this::extractTextResponse)
                .onErrorResume(e -> {
                    LOG.error("Error in AI chat: {}", e.getMessage());
                    return Mono.just("Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn.");
                });
    }

    /**
     * Analyze stock batch for anomalies/alerts
     */
    public Mono<List<AlertResponse>> analyzeStockAlerts(List<StockData> stocks) {
        String prompt = buildAlertPrompt(stocks);
        return callGemini(prompt)
                .map(response -> parseJsonListResponse(response, AlertResponse.class))
                .onErrorResume(e -> {
                    LOG.error("Error analyzing alerts: {}", e.getMessage());
                    return Mono.just(List.of());
                });
    }

    private Mono<String> callGemini(String prompt) {
        String apiKey = properties.getGemini().getApiKey();

        if (apiKey == null || apiKey.isBlank()) {
            LOG.warn("Gemini API key not configured");
            return Mono.error(new IllegalStateException("Gemini API key not configured"));
        }

        // AI_CHAT uses configured chat models with gemma-3-12b as primary
        return callGeminiWithFallback(prompt, apiKey, chatModels, 0);
    }

    /**
     * Call Gemini API with automatic model fallback on quota/rate limit errors
     */
    private Mono<String> callGeminiWithFallback(String prompt, String apiKey, List<String> models, int modelIndex) {
        if (modelIndex >= models.size()) {
            LOG.error("All Gemini models exhausted, no fallback available");
            return Mono.error(
                    new IllegalStateException("All AI models are currently unavailable. Please try again later."));
        }

        String currentModel = models.get(modelIndex);
        LOG.info("Calling Gemini with model: {} (attempt {}/{})", currentModel, modelIndex + 1, models.size());

        // Build generation config - Gemma models don't support responseMimeType
        // Use smaller maxOutputTokens for chat (1024) for faster responses
        Map<String, Object> generationConfig = buildGenerationConfig(currentModel, 0.7, 1024);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt)))),
                "generationConfig", generationConfig);

        return webClient.post()
                .uri("/models/{model}:generateContent?key={key}", currentModel, apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .doOnNext(response -> {
                    LOG.debug("Gemini response from {}: {}", currentModel,
                            response.substring(0, Math.min(200, response.length())));
                    // Update current model index on success
                    currentModelIndex.set(modelIndex);
                })
                .map(this::extractContentFromResponse)
                .onErrorResume(e -> {
                    if (shouldFallback(e)) {
                        LOG.warn("Model {} failed with {}, trying next model...",
                                currentModel, getErrorReason(e));
                        return callGeminiWithFallback(prompt, apiKey, models, modelIndex + 1);
                    }
                    // Non-recoverable error, don't fallback
                    LOG.error("Non-recoverable error from {}: {}", currentModel, e.getMessage());
                    return Mono.error(e);
                });
    }

    /**
     * Determine if we should fallback to next model based on error type
     */
    private boolean shouldFallback(Throwable e) {
        if (e instanceof WebClientResponseException wcre) {
            int status = wcre.getStatusCode().value();
            // 400 = Bad Request (model doesn't support config), 429 = Rate Limit,
            // 503 = Service Unavailable, 500 = Server Error, 404 = Model not found
            return status == 400 || status == 429 || status == 503 || status == 500 || status == 502 || status == 404;
        }
        // Fallback for connection/timeout errors
        return e.getMessage() != null && (e.getMessage().contains("quota") ||
                e.getMessage().contains("rate") ||
                e.getMessage().contains("limit") ||
                e.getMessage().contains("exhausted") ||
                e.getMessage().contains("timeout") ||
                e.getMessage().contains("Connection"));
    }

    private String getErrorReason(Throwable e) {
        if (e instanceof WebClientResponseException wcre) {
            return "HTTP " + wcre.getStatusCode().value() + ": " + wcre.getStatusText();
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

    /**
     * Get current active model name (for monitoring)
     */
    public String getCurrentModel() {
        int index = currentModelIndex.get();
        if (index < chatModels.size()) {
            return chatModels.get(index);
        }
        return chatModels.get(0); // Default to primary model
    }

    /**
     * Get list of available chat models (for API info)
     */
    public List<String> getAvailableModels() {
        return chatModels;
    }

    private String extractContentFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
        } catch (JsonProcessingException e) {
            LOG.error("Error parsing Gemini response: {}", e.getMessage());
            return "{}";
        }
    }

    private String extractTextResponse(String jsonContent) {
        try {
            // Clean markdown code blocks if present (Gemma models return ```json ... ```)
            String cleanedJson = cleanMarkdownCodeBlock(jsonContent);
            JsonNode root = objectMapper.readTree(cleanedJson);
            if (root.has("response")) {
                return root.get("response").asText();
            }
            return cleanedJson;
        } catch (JsonProcessingException e) {
            // If can't parse as JSON, return cleaned content directly
            return cleanMarkdownCodeBlock(jsonContent);
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

    private <T> T parseJsonResponse(String json, Class<T> clazz) {
        try {
            // Clean markdown code blocks if present (Gemma models)
            String cleanedJson = cleanMarkdownCodeBlock(json);
            return objectMapper.readValue(cleanedJson, clazz);
        } catch (JsonProcessingException e) {
            LOG.error("Error parsing JSON to {}: {}", clazz.getSimpleName(), e.getMessage());
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }

    private <T> List<T> parseJsonListResponse(String json, Class<T> clazz) {
        try {
            // Clean markdown code blocks if present (Gemma models)
            String cleanedJson = cleanMarkdownCodeBlock(json);
            var type = objectMapper.getTypeFactory().constructCollectionType(List.class, clazz);
            return objectMapper.readValue(cleanedJson, type);
        } catch (JsonProcessingException e) {
            LOG.error("Error parsing JSON list: {}", e.getMessage());
            return List.of();
        }
    }

    // Prompt builders

    private String buildMarketInsightsPrompt(List<StockData> stocks) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                "Bạn là chuyên gia phân tích thị trường chứng khoán. Dựa trên dữ liệu sau, hãy viết báo cáo thị trường:\n\n");

        for (StockData stock : stocks) {
            sb.append(String.format("- %s: Giá %.2f, Thay đổi %.2f%%\n",
                    stock.symbol(), stock.price(), stock.percentChange()));
        }

        sb.append("\nTrả về JSON với format:\n");
        sb.append(
                """
                        {
                            "market_trend": "Bullish/Bearish/Neutral",
                            "summary_title": "Tiêu đề chính",
                            "summary_content": "Nội dung phân tích chi tiết",
                            "highlights": [
                                {"title": "Highlight 1", "description": "Mô tả"},
                                {"title": "Highlight 2", "description": "Mô tả"}
                            ],
                            "sector_analysis": [
                                {"industry": "Technology", "sentiment": "POSITIVE", "summary": "Phân tích ngành", "stocks": "AAPL,MSFT"}
                            ]
                        }
                        """);
        return sb.toString();
    }

    private String buildResearchReportPrompt(String symbol, StockData data) {
        return String.format("""
                Bạn là nhà phân tích tài chính. Đánh giá cổ phiếu %s:
                - Giá hiện tại: %.2f
                - Thay đổi 24h: %.2f%%
                - Volume: %d

                Trả về JSON với format:
                {
                    "recommendation": "BUY/HOLD/SELL",
                    "target_price": 150.00,
                    "upside_percentage": 5.5,
                    "financial_score": 75,
                    "technical_score": 80,
                    "sentiment_score": 70,
                    "overall_score": 75,
                    "analysis_summary": "Phân tích chi tiết...",
                    "key_factors": [{"factor": "Doanh thu tăng", "impact": "positive"}],
                    "risk_factors": ["Rủi ro 1", "Rủi ro 2"]
                }
                """, symbol, data.price(), data.percentChange(), data.volume());
    }

    private String buildChatPrompt(String context, String question) {
        return String.format("""
                Bạn là trợ lý AI chuyên về chứng khoán và đầu tư.

                CONTEXT (thông tin thị trường hiện tại):
                %s

                CÂU HỎI CỦA NGƯỜI DÙNG:
                %s

                Trả lời bằng tiếng Việt, ngắn gọn và hữu ích. Trả về JSON:
                {"response": "Câu trả lời của bạn"}
                """, context, question);
    }

    private String buildAlertPrompt(List<StockData> stocks) {
        StringBuilder sb = new StringBuilder();
        sb.append("Phân tích và tìm các cổ phiếu có dấu hiệu bất thường:\n\n");

        for (StockData stock : stocks) {
            sb.append(String.format("- %s: %.2f (%.2f%%), Vol: %d\n",
                    stock.symbol(), stock.price(), stock.percentChange(), stock.volume()));
        }

        sb.append(
                """

                        Trả về JSON array các cổ phiếu cần cảnh báo:
                        [
                            {"symbol": "AAPL", "alert_type": "VOLATILITY", "message": "Biến động bất thường", "severity": "HIGH"}
                        ]
                        Nếu không có cảnh báo, trả về []
                        """);
        return sb.toString();
    }

    // DTO Records
    public record StockData(String symbol, double price, double percentChange, long volume) {
    }

    public record MarketInsightsResponse(
            String market_trend,
            String summary_title,
            String summary_content,
            List<Highlight> highlights,
            List<SectorAnalysis> sector_analysis) {
    }

    public record Highlight(String title, String description) {
    }

    public record SectorAnalysis(String industry, String sentiment, String summary, String stocks) {
    }

    public record ResearchReportResponse(
            String recommendation,
            Double target_price,
            Double upside_percentage,
            Integer financial_score,
            Integer technical_score,
            Integer sentiment_score,
            Integer overall_score,
            String analysis_summary,
            List<KeyFactor> key_factors,
            List<String> risk_factors) {
    }

    public record KeyFactor(String factor, String impact) {
    }

    public record AlertResponse(String symbol, String alert_type, String message, String severity) {
    }
}
