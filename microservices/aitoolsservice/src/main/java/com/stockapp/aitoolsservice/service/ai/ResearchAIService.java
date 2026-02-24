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
 * Dedicated AI Service for Research features (Watchlist Analysis)
 * Uses different model priority to avoid impacting chat quota
 * 
 * AI_RESEARCH Feature: Uses gemma-3-27b-it (optimized for depth analysis)
 * Fallback order when RPD exceeded: gemma-3-12b-it → gemma-3-4b-it →
 * gemini-2.0-flash → gemini-2.5-flash
 * 
 * Model naming convention: Gemma models require "-it" suffix
 * (instruction-tuned)
 * RPD (Requests Per Day) priorities considered for fallback order
 */
@Service
public class ResearchAIService {

    private static final Logger LOG = LoggerFactory.getLogger(ResearchAIService.class);

    // Default AI_RESEARCH models - CORRECT API names from Google AI Studio
    // Gemma models require "-it" suffix (instruction-tuned variants)
    // Order by: Depth/analysis capability → RPD availability
    private static final List<String> DEFAULT_RESEARCH_MODELS = List.of(
            "gemma-3-27b-it", // Primary: Best for in-depth analysis (15K RPD)
            "gemma-3-12b-it", // Backup 1: Good analysis capability (15K RPD)
            "gemma-3-4b-it", // Backup 2: Lighter but capable (15K RPD)
            "gemini-2.0-flash", // Backup 3: Stable Gemini
            "gemini-2.5-flash" // Backup 4: Latest Gemini
    );

    private final WebClient webClient;
    private final ApplicationProperties properties;
    private final ObjectMapper objectMapper;
    private final List<String> researchModels;

    public ResearchAIService(ApplicationProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getGemini().getBaseUrl())
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        // Load research models from configuration or use defaults
        List<String> configuredModels = properties.getGemini().getResearchFallbackModels();
        this.researchModels = (configuredModels != null && !configuredModels.isEmpty())
                ? configuredModels
                : DEFAULT_RESEARCH_MODELS;

        LOG.info("AI_RESEARCH initialized with models: {}", researchModels);
    }

    /**
     * Generate comprehensive research report for a watchlist stock
     */
    public Mono<WatchlistStockResearch> generateWatchlistStockResearch(
            String symbol,
            GeminiClientService.StockData stockData) {
        String prompt = buildStockResearchPrompt(symbol, stockData);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, WatchlistStockResearch.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating research for {}: {}", symbol, e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Generate summary analysis for entire watchlist
     */
    public Mono<WatchlistSummary> generateWatchlistSummary(List<GeminiClientService.StockData> stocks) {
        String prompt = buildWatchlistSummaryPrompt(stocks);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, WatchlistSummary.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating watchlist summary: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Generate alerts for watchlist stocks based on price movements
     */
    public Mono<WatchlistAlerts> generateWatchlistAlerts(List<GeminiClientService.StockData> stocks) {
        String prompt = buildAlertsPrompt(stocks);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, WatchlistAlerts.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating alerts: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Generate quick comparison between watchlist stocks
     */
    public Mono<StockComparison> generateStockComparison(List<GeminiClientService.StockData> stocks) {
        String prompt = buildComparisonPrompt(stocks);
        return callAI(prompt)
                .map(response -> parseJsonResponse(response, StockComparison.class))
                .onErrorResume(e -> {
                    LOG.error("Error generating comparison: {}", e.getMessage());
                    return Mono.empty();
                });
    }

    private Mono<String> callAI(String prompt) {
        String apiKey = properties.getGemini().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return Mono.error(new IllegalStateException("API key not configured"));
        }
        // AI_RESEARCH uses configured research models with gemma-3-27b as primary
        return callAIWithFallback(prompt, apiKey, researchModels, 0);
    }

    private Mono<String> callAIWithFallback(String prompt, String apiKey, List<String> models, int modelIndex) {
        if (modelIndex >= models.size()) {
            LOG.error("All Research AI models exhausted");
            return Mono.error(new IllegalStateException("All AI models unavailable"));
        }

        String currentModel = models.get(modelIndex);
        LOG.info("Research AI calling model: {} (attempt {}/{})", currentModel, modelIndex + 1, models.size());

        // Build generation config - Gemma models don't support responseMimeType
        Map<String, Object> generationConfig = buildGenerationConfig(currentModel, 0.6, 8192);

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
                        LOG.warn("Research model {} failed: {}, trying next...", currentModel, getErrorReason(e));
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
     * Clean markdown code blocks and extract JSON from Gemma model responses.
     * Gemma models often wrap JSON in ```json ... ``` blocks or add conversational
     * text.
     */
    private String cleanMarkdownCodeBlock(String content) {
        if (content == null || content.isBlank()) {
            return "{}";
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

        // If result doesn't start with { or [, try to extract JSON from mixed text
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            trimmed = extractJsonFromText(trimmed);
        }

        return trimmed;
    }

    /**
     * Extract JSON object or array from text that may contain conversational
     * content.
     * Handles cases where AI returns text like "Tuyệt! Đây là phân tích: {...}"
     */
    private String extractJsonFromText(String text) {
        if (text == null || text.isBlank()) {
            return "{}";
        }

        // Find the first { or [
        int jsonStart = -1;
        char openChar = ' ';
        char closeChar = ' ';

        int braceIndex = text.indexOf('{');
        int bracketIndex = text.indexOf('[');

        if (braceIndex >= 0 && (bracketIndex < 0 || braceIndex < bracketIndex)) {
            jsonStart = braceIndex;
            openChar = '{';
            closeChar = '}';
        } else if (bracketIndex >= 0) {
            jsonStart = bracketIndex;
            openChar = '[';
            closeChar = ']';
        }

        if (jsonStart < 0) {
            LOG.warn("No JSON found in response, returning empty object");
            return "{}";
        }

        // Find matching closing brace/bracket
        int depth = 0;
        int jsonEnd = -1;
        for (int i = jsonStart; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == openChar) {
                depth++;
            } else if (c == closeChar) {
                depth--;
                if (depth == 0) {
                    jsonEnd = i + 1;
                    break;
                }
            }
        }

        if (jsonEnd > jsonStart) {
            String extracted = text.substring(jsonStart, jsonEnd);
            LOG.debug("Extracted JSON from position {} to {}", jsonStart, jsonEnd);
            return extracted;
        }

        // Fallback: return from first { to end
        LOG.warn("Could not find matching closing brace, attempting best effort extraction");
        return text.substring(jsonStart);
    }

    // ==================== Prompt Builders ====================

    private String buildStockResearchPrompt(String symbol, GeminiClientService.StockData stockData) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        return String.format(
                """
                        QUAN TRỌNG: Chỉ trả về JSON thuần túy. KHÔNG có bất kỳ text, giải thích, hay lời chào nào trước hoặc sau JSON.

                        Bạn là chuyên gia phân tích cổ phiếu US. Hôm nay là %s.

                        Phân tích chi tiết cổ phiếu: %s
                        - Giá hiện tại: $%.2f
                        - Biến động: %.2f%%
                        - Khối lượng: %d

                        Hãy phân tích toàn diện bao gồm:
                        1. Đánh giá tổng quan (điểm 0-100)
                        2. Khuyến nghị (BUY/HOLD/SELL)
                        3. Phân tích kỹ thuật
                        4. Rủi ro và cơ hội
                        5. Mức giá mục tiêu

                        CHỈ TRẢ VỀ JSON (không markdown, không ```):
                        {
                            "symbol": "%s",
                            "recommendation": "BUY/HOLD/SELL",
                            "confidence_score": 75,
                            "current_price": %.2f,
                            "target_price": 180.00,
                            "upside_percentage": 15.5,
                            "technical_score": 72,
                            "fundamental_score": 68,
                            "sentiment_score": 80,
                            "summary": "Phân tích tóm tắt 2-3 câu...",
                            "key_factors": [
                                {"factor": "AI chip demand strong", "impact": "positive"},
                                {"factor": "High valuation", "impact": "negative"}
                            ],
                            "risk_factors": ["Rủi ro 1", "Rủi ro 2"],
                            "opportunities": ["Cơ hội 1", "Cơ hội 2"],
                            "support_level": 140.00,
                            "resistance_level": 170.00,
                            "stop_loss": 135.00,
                            "analysis_date": "%s"
                        }
                        """,
                today, symbol, stockData.price(), stockData.percentChange(), stockData.volume(),
                symbol, stockData.price(), today);
    }

    private String buildWatchlistSummaryPrompt(List<GeminiClientService.StockData> stocks) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        StringBuilder sb = new StringBuilder();
        sb.append(
                "QUAN TRỌNG: Chỉ trả về JSON thuần túy. KHÔNG có bất kỳ text, giải thích, hay lời chào nào trước hoặc sau JSON.\n\n");
        sb.append("Bạn là chuyên gia phân tích danh mục đầu tư. Hôm nay là " + today + ".\n\n");
        sb.append("Phân tích danh sách watchlist sau:\n\n");

        for (GeminiClientService.StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f, biến động %.2f%%, volume %d\n",
                    stock.symbol(), stock.price(), stock.percentChange(), stock.volume()));
        }

        sb.append("""

                Đưa ra nhận định tổng quan về watchlist. CHỈ TRẢ VỀ JSON (không markdown, không ```):
                {
                    "total_stocks": 7,
                    "bullish_count": 4,
                    "bearish_count": 2,
                    "neutral_count": 1,
                    "overall_sentiment": "bullish/bearish/neutral",
                    "portfolio_score": 72,
                    "top_pick": "NVDA",
                    "top_pick_reason": "Lý do chọn top pick...",
                    "worst_performer": "AMZN",
                    "worst_reason": "Lý do hoạt động kém...",
                    "summary": "Tổng quan ngắn gọn về watchlist 2-3 câu...",
                    "recommendations": [
                        {"symbol": "NVDA", "action": "BUY", "priority": 1},
                        {"symbol": "AAPL", "action": "HOLD", "priority": 2}
                    ],
                    "sector_analysis": "Phân tích theo ngành..."
                }
                """);
        return sb.toString();
    }

    private String buildAlertsPrompt(List<GeminiClientService.StockData> stocks) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                "QUAN TRỌNG: Chỉ trả về JSON thuần túy. KHÔNG có bất kỳ text, giải thích, hay lời chào nào trước hoặc sau JSON.\n\n");
        sb.append("Phân tích các cổ phiếu sau và tạo CẢNH BÁO quan trọng:\n\n");

        for (GeminiClientService.StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f, biến động %.2f%%\n",
                    stock.symbol(), stock.price(), stock.percentChange()));
        }

        sb.append("""

                Xác định các cảnh báo quan trọng như:
                - Biến động bất thường (>3%)
                - Phá vỡ ngưỡng kỹ thuật
                - Tin tức quan trọng
                - Cơ hội mua/bán

                CHỈ TRẢ VỀ JSON (không markdown, không ```):
                {
                    "alerts": [
                        {
                            "symbol": "NVDA",
                            "type": "PRICE_SURGE/PRICE_DROP/BREAKOUT/BREAKDOWN/BUY_SIGNAL/SELL_SIGNAL/NEWS",
                            "severity": "HIGH/MEDIUM/LOW",
                            "title": "Tiêu đề cảnh báo ngắn",
                            "message": "Mô tả chi tiết cảnh báo...",
                            "action_suggested": "Hành động gợi ý...",
                            "timestamp": "2025-01-23T10:30:00"
                        }
                    ],
                    "total_alerts": 3,
                    "high_priority_count": 1,
                    "summary": "Tóm tắt các cảnh báo quan trọng..."
                }
                """);
        return sb.toString();
    }

    private String buildComparisonPrompt(List<GeminiClientService.StockData> stocks) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                "QUAN TRỌNG: Chỉ trả về JSON thuần túy. KHÔNG có bất kỳ text, giải thích, hay lời chào nào trước hoặc sau JSON.\n\n");
        sb.append("So sánh các cổ phiếu sau trong watchlist:\n\n");

        for (GeminiClientService.StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f, biến động %.2f%%\n",
                    stock.symbol(), stock.price(), stock.percentChange()));
        }

        sb.append("""

                Đưa ra so sánh chi tiết giữa các cổ phiếu. CHỈ TRẢ VỀ JSON (không markdown, không ```):
                {
                    "comparison_matrix": [
                        {
                            "symbol": "NVDA",
                            "rank": 1,
                            "momentum_score": 85,
                            "value_score": 60,
                            "risk_score": 70,
                            "overall_rank_reason": "Lý do xếp hạng..."
                        }
                    ],
                    "best_value": "AAPL",
                    "best_momentum": "NVDA",
                    "lowest_risk": "MSFT",
                    "highest_growth": "NVDA",
                    "pair_trade_ideas": [
                        {"long": "NVDA", "short": "INTC", "reason": "Lý do pair trade..."}
                    ],
                    "portfolio_suggestion": "Gợi ý phân bổ danh mục..."
                }
                """);
        return sb.toString();
    }

    // ==================== Response DTOs ====================

    public record WatchlistStockResearch(
            String symbol,
            String recommendation,
            Integer confidence_score,
            Double current_price,
            Double target_price,
            Double upside_percentage,
            Integer technical_score,
            Integer fundamental_score,
            Integer sentiment_score,
            String summary,
            List<KeyFactor> key_factors,
            List<String> risk_factors,
            List<String> opportunities,
            Double support_level,
            Double resistance_level,
            Double stop_loss,
            String analysis_date) {
    }

    public record KeyFactor(String factor, String impact) {
    }

    public record WatchlistSummary(
            Integer total_stocks,
            Integer bullish_count,
            Integer bearish_count,
            Integer neutral_count,
            String overall_sentiment,
            Integer portfolio_score,
            String top_pick,
            String top_pick_reason,
            String worst_performer,
            String worst_reason,
            String summary,
            List<StockRecommendation> recommendations,
            String sector_analysis) {
    }

    public record StockRecommendation(String symbol, String action, Integer priority) {
    }

    public record WatchlistAlerts(
            List<Alert> alerts,
            Integer total_alerts,
            Integer high_priority_count,
            String summary) {
    }

    public record Alert(
            String symbol,
            String type,
            String severity,
            String title,
            String message,
            String action_suggested,
            String timestamp) {
    }

    public record StockComparison(
            List<ComparisonItem> comparison_matrix,
            String best_value,
            String best_momentum,
            String lowest_risk,
            String highest_growth,
            List<PairTrade> pair_trade_ideas,
            String portfolio_suggestion) {
    }

    public record ComparisonItem(
            String symbol,
            Integer rank,
            Integer momentum_score,
            Integer value_score,
            Integer risk_score,
            String overall_rank_reason) {
    }

    public record PairTrade(String longPosition, String shortPosition, String reason) {
    }
}
