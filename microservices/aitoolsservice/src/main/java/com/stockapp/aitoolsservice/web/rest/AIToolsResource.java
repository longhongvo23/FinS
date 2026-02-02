package com.stockapp.aitoolsservice.web.rest;

import com.stockapp.aitoolsservice.domain.ChatHistory;
import com.stockapp.aitoolsservice.domain.DailyMarketInsight;
import com.stockapp.aitoolsservice.domain.StockResearchReport;
import com.stockapp.aitoolsservice.domain.enumeration.StockRecommendation;
import com.stockapp.aitoolsservice.repository.ChatHistoryRepository;
import com.stockapp.aitoolsservice.repository.DailyMarketInsightRepository;
import com.stockapp.aitoolsservice.repository.StockResearchReportRepository;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService.StockData;
import com.stockapp.aitoolsservice.service.client.StockServiceClient;
import com.stockapp.aitoolsservice.service.scheduler.DailyInsightsScheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * REST controller for AI Tools features
 */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Tools", description = "AI-powered financial analysis endpoints")
public class AIToolsResource {

    private static final Logger LOG = LoggerFactory.getLogger(AIToolsResource.class);

    private final GeminiClientService geminiClientService;
    private final StockServiceClient stockServiceClient;
    private final StockResearchReportRepository researchReportRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final DailyMarketInsightRepository insightRepository;
    private final DailyInsightsScheduler dailyInsightsScheduler;

    public AIToolsResource(
            GeminiClientService geminiClientService,
            StockServiceClient stockServiceClient,
            StockResearchReportRepository researchReportRepository,
            ChatHistoryRepository chatHistoryRepository,
            DailyMarketInsightRepository insightRepository,
            DailyInsightsScheduler dailyInsightsScheduler) {
        this.geminiClientService = geminiClientService;
        this.stockServiceClient = stockServiceClient;
        this.researchReportRepository = researchReportRepository;
        this.chatHistoryRepository = chatHistoryRepository;
        this.insightRepository = insightRepository;
        this.dailyInsightsScheduler = dailyInsightsScheduler;
    }

    // ========== FEATURE A: Market Insights ==========

    /**
     * GET /api/ai/insights/today : Get today's market insights
     */
    @GetMapping("/insights/today")
    @Operation(summary = "Get today's market insights")
    public Mono<ResponseEntity<DailyMarketInsight>> getTodayInsights() {
        return insightRepository.findByReportDate(LocalDate.now())
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/ai/insights : Get recent market insights
     */
    @GetMapping("/insights")
    @Operation(summary = "Get recent market insights")
    public Flux<DailyMarketInsight> getRecentInsights() {
        return insightRepository.findAllByOrderByReportDateDesc()
                .take(7);
    }

    /**
     * POST /api/ai/insights/generate : Manually trigger insights generation
     */
    @PostMapping("/insights/generate")
    @Operation(summary = "Trigger daily insights generation")
    public Mono<ResponseEntity<String>> triggerInsightsGeneration() {
        dailyInsightsScheduler.triggerManually();
        return Mono.just(ResponseEntity.ok("Insights generation triggered"));
    }

    // ========== FEATURE B: Research Reports ==========

    /**
     * POST /api/ai/research/{symbol} : Generate AI research report for a stock
     */
    @PostMapping("/research/{symbol}")
    @Operation(summary = "Generate AI research report for a stock")
    public Mono<ResponseEntity<StockResearchReport>> generateResearchReport(@PathVariable String symbol) {
        LOG.info("Generating research report for symbol: {}", symbol);

        return stockServiceClient.getQuote(symbol)
                .map(quote -> new StockData(
                        symbol,
                        quote.close() != null ? quote.close() : 0.0,
                        quote.percentChange() != null ? quote.percentChange() : 0.0,
                        quote.volume() != null ? quote.volume() : 0L))
                .flatMap(stockData -> geminiClientService.generateResearchReport(symbol, stockData)
                        .map(response -> createReport(symbol, stockData, response)))
                .flatMap(researchReportRepository::save)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/ai/research/{symbol} : Get latest research report for a stock
     */
    @GetMapping("/research/{symbol}")
    @Operation(summary = "Get latest research report for a stock")
    public Mono<ResponseEntity<StockResearchReport>> getLatestReport(@PathVariable String symbol) {
        return researchReportRepository.findTopBySymbolOrderByCreatedDateDesc(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/ai/research : Get all recent research reports
     */
    @GetMapping("/research")
    @Operation(summary = "Get all recent research reports")
    public Flux<StockResearchReport> getAllReports() {
        return researchReportRepository.findAllByOrderByCreatedDateDesc()
                .take(50);
    }

    // ========== FEATURE C: AI Chat ==========

    /**
     * POST /api/ai/chat : Send a question to AI
     */
    @PostMapping("/chat")
    @Operation(summary = "Ask AI a financial question")
    public Mono<ResponseEntity<ChatResponse>> chat(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt != null ? jwt.getSubject() : "anonymous";
        String sessionId = request.sessionId() != null ? request.sessionId() : UUID.randomUUID().toString();

        LOG.info("Chat request from user {}: {}", userId, request.question());

        // Build context from recent market data
        return stockServiceClient.getAllQuotes()
                .collectList()
                .map(this::buildContext)
                .flatMap(context -> geminiClientService.chat(context, request.question())
                        .flatMap(response -> saveChatHistoryAsync(userId, sessionId, request.question(), response,
                                context)))
                .map(chat -> ResponseEntity.ok(new ChatResponse(
                        chat.getBotResponse(),
                        chat.getSessionId(),
                        chat.getTimestamp())));
    }

    /**
     * GET /api/ai/chat/history : Get chat history for current user
     */
    @GetMapping("/chat/history")
    @Operation(summary = "Get user's chat history")
    public Flux<ChatHistory> getChatHistory(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt != null ? jwt.getSubject() : "anonymous";
        return chatHistoryRepository.findByUserIdOrderByTimestampDesc(userId)
                .take(50);
    }

    // ========== Helper Methods ==========

    private StockResearchReport createReport(String symbol, StockData stockData,
            GeminiClientService.ResearchReportResponse response) {
        StockResearchReport report = new StockResearchReport();
        report.setSymbol(symbol);
        report.setCreatedDate(Instant.now());
        report.setRecommendation(parseRecommendation(response.recommendation()));
        report.setCurrentPrice(BigDecimal.valueOf(stockData.price()));
        report.setTargetPrice(response.target_price() != null ? BigDecimal.valueOf(response.target_price()) : null);
        report.setUpsidePercentage(
                response.upside_percentage() != null ? response.upside_percentage().floatValue() : null);
        report.setFinancialScore(response.financial_score());
        report.setTechnicalScore(response.technical_score());
        report.setSentimentScore(response.sentiment_score());
        report.setOverallScore(response.overall_score());
        report.setAnalysisSummary(response.analysis_summary());

        // Convert key factors and risk factors to JSON
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            if (response.key_factors() != null) {
                report.setKeyFactors(mapper.writeValueAsString(response.key_factors()));
            }
            if (response.risk_factors() != null) {
                report.setRiskFactors(mapper.writeValueAsString(response.risk_factors()));
            }
        } catch (Exception e) {
            LOG.warn("Failed to serialize factors: {}", e.getMessage());
        }

        return report;
    }

    private StockRecommendation parseRecommendation(String recommendation) {
        if (recommendation == null)
            return StockRecommendation.HOLD;
        return switch (recommendation.toUpperCase()) {
            case "BUY", "MUA" -> StockRecommendation.BUY;
            case "SELL", "BÁN" -> StockRecommendation.SELL;
            default -> StockRecommendation.HOLD;
        };
    }

    private String buildContext(java.util.List<StockData> stocks) {
        StringBuilder sb = new StringBuilder("Thông tin thị trường hiện tại:\n");
        for (StockData stock : stocks) {
            sb.append(String.format("- %s: $%.2f (%+.2f%%)\n",
                    stock.symbol(), stock.price(), stock.percentChange()));
        }
        return sb.toString();
    }

    private Mono<ChatHistory> saveChatHistoryAsync(String userId, String sessionId, String question, String response,
            String context) {
        ChatHistory chat = new ChatHistory();
        chat.setUserId(userId);
        chat.setSessionId(sessionId);
        chat.setUserQuestion(question);
        chat.setBotResponse(response);
        chat.setContext(context);
        chat.setTimestamp(Instant.now());
        return chatHistoryRepository.save(chat);
    }

    // DTOs
    public record ChatRequest(String question, String sessionId) {
    }

    public record ChatResponse(String response, String sessionId, Instant timestamp) {
    }
}
