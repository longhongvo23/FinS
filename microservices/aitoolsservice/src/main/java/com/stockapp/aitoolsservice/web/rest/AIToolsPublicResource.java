package com.stockapp.aitoolsservice.web.rest;

import com.stockapp.aitoolsservice.domain.ChatHistory;
import com.stockapp.aitoolsservice.domain.DailyMarketInsight;
import com.stockapp.aitoolsservice.domain.IndustryAnalysis;
import com.stockapp.aitoolsservice.domain.StockResearchReport;
import com.stockapp.aitoolsservice.domain.enumeration.StockRecommendation;
import com.stockapp.aitoolsservice.repository.ChatHistoryRepository;
import com.stockapp.aitoolsservice.repository.DailyMarketInsightRepository;
import com.stockapp.aitoolsservice.repository.IndustryAnalysisRepository;
import com.stockapp.aitoolsservice.repository.StockResearchReportRepository;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService.StockData;
import com.stockapp.aitoolsservice.service.ai.InsightsAIService;
import com.stockapp.aitoolsservice.service.ai.ResearchAIService;
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
 * Public REST controller for AI Tools features (no authentication required for
 * read operations)
 */
@RestController
@RequestMapping("/api/public/ai")
@Tag(name = "AI Tools Public", description = "Public AI-powered financial analysis endpoints")
public class AIToolsPublicResource {

    private static final Logger LOG = LoggerFactory.getLogger(AIToolsPublicResource.class);

    private final GeminiClientService geminiClientService;
    private final InsightsAIService insightsAIService;
    private final ResearchAIService researchAIService;
    private final StockServiceClient stockServiceClient;
    private final StockResearchReportRepository researchReportRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    private final DailyMarketInsightRepository insightRepository;
    private final IndustryAnalysisRepository industryAnalysisRepository;
    private final DailyInsightsScheduler dailyInsightsScheduler;

    public AIToolsPublicResource(
            GeminiClientService geminiClientService,
            InsightsAIService insightsAIService,
            ResearchAIService researchAIService,
            StockServiceClient stockServiceClient,
            StockResearchReportRepository researchReportRepository,
            ChatHistoryRepository chatHistoryRepository,
            DailyMarketInsightRepository insightRepository,
            IndustryAnalysisRepository industryAnalysisRepository,
            DailyInsightsScheduler dailyInsightsScheduler) {
        this.geminiClientService = geminiClientService;
        this.insightsAIService = insightsAIService;
        this.researchAIService = researchAIService;
        this.stockServiceClient = stockServiceClient;
        this.researchReportRepository = researchReportRepository;
        this.chatHistoryRepository = chatHistoryRepository;
        this.insightRepository = insightRepository;
        this.industryAnalysisRepository = industryAnalysisRepository;
        this.dailyInsightsScheduler = dailyInsightsScheduler;
    }

    // ========== FEATURE A: Market Insights (Public Read) ==========

    /**
     * GET /api/public/ai/insights/today : Get today's market insights
     */
    @GetMapping("/insights/today")
    @Operation(summary = "Get today's market insights (public)")
    public Mono<ResponseEntity<DailyMarketInsight>> getTodayInsights() {
        LOG.info("Public request for today's market insights");
        return insightRepository.findByReportDate(LocalDate.now())
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/public/ai/insights : Get recent market insights
     */
    @GetMapping("/insights")
    @Operation(summary = "Get recent market insights (public)")
    public Flux<DailyMarketInsight> getRecentInsights() {
        LOG.info("Public request for recent market insights");
        return insightRepository.findAllByOrderByReportDateDesc()
                .take(7);
    }

    /**
     * GET /api/public/ai/industries : Get industry analyses
     */
    @GetMapping("/industries")
    @Operation(summary = "Get recent industry analyses (public)")
    public Flux<IndustryAnalysis> getRecentIndustryAnalyses() {
        LOG.info("Public request for industry analyses");
        return industryAnalysisRepository.findAllByOrderByReportDateDesc()
                .take(20);
    }

    /**
     * GET /api/public/ai/industries/today : Get today's industry analyses
     */
    @GetMapping("/industries/today")
    @Operation(summary = "Get today's industry analyses (public)")
    public Flux<IndustryAnalysis> getTodayIndustryAnalyses() {
        LOG.info("Public request for today's industry analyses");
        return industryAnalysisRepository.findByReportDate(LocalDate.now());
    }

    // ========== FEATURE B: Research Reports (Public Read) ==========

    /**
     * GET /api/public/ai/research/{symbol} : Get latest research report for a stock
     */
    @GetMapping("/research/{symbol}")
    @Operation(summary = "Get latest research report for a stock (public)")
    public Mono<ResponseEntity<StockResearchReport>> getLatestReport(@PathVariable String symbol) {
        LOG.info("Public request for research report: {}", symbol);
        return researchReportRepository.findTopBySymbolOrderByCreatedDateDesc(symbol)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/public/ai/research : Get all recent research reports
     */
    @GetMapping("/research")
    @Operation(summary = "Get all recent research reports (public)")
    public Flux<StockResearchReport> getAllReports() {
        LOG.info("Public request for all research reports");
        return researchReportRepository.findAllByOrderByCreatedDateDesc()
                .take(50);
    }

    // ========== FEATURE C: AI Chat (Public - anonymous users) ==========

    /**
     * POST /api/public/ai/chat : Send a question to AI (for anonymous users)
     */
    @PostMapping("/chat")
    @Operation(summary = "Ask AI a financial question (public)")
    public Mono<ResponseEntity<ChatResponse>> chat(@RequestBody ChatRequest request) {
        String sessionId = request.sessionId() != null ? request.sessionId() : UUID.randomUUID().toString();
        String userId = "anonymous";

        LOG.info("Public chat request: {}", request.question());

        // Build context from recent market data (with fallback if stock service
        // unavailable)
        return stockServiceClient.getAllQuotes()
                .collectList()
                .map(this::buildContext)
                .defaultIfEmpty("Không có dữ liệu thị trường hiện tại.")
                .flatMap(context -> geminiClientService.chat(context, request.question())
                        .flatMap(response -> saveChatHistoryAsync(userId, sessionId, request.question(), response,
                                context))
                        .map(chat -> ResponseEntity.ok(new ChatResponse(
                                chat.getBotResponse(),
                                chat.getSessionId(),
                                chat.getTimestamp())))
                        .onErrorResume(e -> {
                            LOG.error("Gemini API error: {}", e.getMessage());
                            // Return a fallback response when Gemini is unavailable
                            Instant now = Instant.now();
                            return Mono.just(ResponseEntity.ok(new ChatResponse(
                                    "Xin lỗi, dịch vụ AI đang tạm thời không khả dụng. Vui lòng thử lại sau.",
                                    sessionId,
                                    now)));
                        }));
    }

    // ========== FEATURE D: Generate Operations (require rate limiting in
    // production) ==========

    /**
     * POST /api/public/ai/research/{symbol} : Generate AI research report for a
     * stock
     */
    @PostMapping("/research/{symbol}")
    @Operation(summary = "Generate AI research report for a stock (public)")
    public Mono<ResponseEntity<StockResearchReport>> generateResearchReport(@PathVariable String symbol) {
        LOG.info("Public request to generate research report for: {}", symbol);

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
     * POST /api/public/ai/insights/generate : Manually trigger insights generation
     */
    @PostMapping("/insights/generate")
    @Operation(summary = "Trigger daily insights generation (public)")
    public Mono<ResponseEntity<String>> triggerInsightsGeneration() {
        LOG.info("Public request to trigger insights generation");
        dailyInsightsScheduler.triggerManually();
        return Mono.just(ResponseEntity.ok("Insights generation triggered"));
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

    // ========== FEATURE E: Advanced Insights (Uses separate AI model) ==========

    /**
     * GET /api/public/ai/insights/top-movers : Get AI-analyzed top movers
     */
    @GetMapping("/insights/top-movers")
    @Operation(summary = "Get AI-analyzed top gainers and losers")
    public Mono<ResponseEntity<InsightsAIService.TopMoversResponse>> getTopMovers() {
        LOG.info("Public request for top movers analysis");
        return stockServiceClient.getStockData()
                .flatMap(stocks -> insightsAIService.generateTopMovers(stocks))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/public/ai/insights/weekly-outlook : Get AI weekly market outlook
     */
    @GetMapping("/insights/weekly-outlook")
    @Operation(summary = "Get AI weekly market outlook and predictions")
    public Mono<ResponseEntity<InsightsAIService.WeeklyOutlookResponse>> getWeeklyOutlook() {
        LOG.info("Public request for weekly outlook");
        return stockServiceClient.getStockData()
                .flatMap(stocks -> insightsAIService.generateWeeklyOutlook(stocks))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/public/ai/insights/trading-signals : Get AI trading signals
     */
    @GetMapping("/insights/trading-signals")
    @Operation(summary = "Get AI-generated trading signals with entry/exit points")
    public Mono<ResponseEntity<InsightsAIService.TradingSignalsResponse>> getTradingSignals() {
        LOG.info("Public request for trading signals");
        return stockServiceClient.getStockData()
                .flatMap(stocks -> insightsAIService.generateTradingSignals(stocks))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/public/ai/insights/correlation : Get stock correlation analysis
     */
    @GetMapping("/insights/correlation")
    @Operation(summary = "Get AI stock correlation and diversification analysis")
    public Mono<ResponseEntity<InsightsAIService.CorrelationResponse>> getCorrelationAnalysis() {
        LOG.info("Public request for correlation analysis");
        return stockServiceClient.getStockData()
                .flatMap(stocks -> insightsAIService.generateCorrelationAnalysis(stocks))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // ========== FEATURE F: Watchlist Research (AI-powered watchlist analysis)
    // ==========

    /**
     * POST /api/public/ai/research/watchlist : Generate research for watchlist
     * symbols
     * Accepts a list of symbols and returns comprehensive analysis for each
     */
    @PostMapping("/research/watchlist")
    @Operation(summary = "Generate AI research for watchlist stocks")
    public Mono<ResponseEntity<ResearchAIService.WatchlistSummary>> generateWatchlistResearch(
            @RequestBody WatchlistRequest request) {
        LOG.info("Public request for watchlist research: {}", request.symbols());

        if (request.symbols() == null || request.symbols().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        // Fetch stock data for requested symbols
        return stockServiceClient.getStockDataForSymbols(request.symbols())
                .flatMap(stocks -> researchAIService.generateWatchlistSummary(stocks))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/public/ai/research/watchlist/alerts : Get alerts for watchlist
     * stocks
     */
    @PostMapping("/research/watchlist/alerts")
    @Operation(summary = "Get AI-generated alerts for watchlist stocks")
    public Mono<ResponseEntity<ResearchAIService.WatchlistAlerts>> getWatchlistAlerts(
            @RequestBody WatchlistRequest request) {
        LOG.info("Public request for watchlist alerts: {}", request.symbols());

        if (request.symbols() == null || request.symbols().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return stockServiceClient.getStockDataForSymbols(request.symbols())
                .flatMap(stocks -> researchAIService.generateWatchlistAlerts(stocks))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/public/ai/research/watchlist/comparison : Compare watchlist stocks
     */
    @PostMapping("/research/watchlist/comparison")
    @Operation(summary = "Compare and rank watchlist stocks")
    public Mono<ResponseEntity<ResearchAIService.StockComparison>> compareWatchlistStocks(
            @RequestBody WatchlistRequest request) {
        LOG.info("Public request for watchlist comparison: {}", request.symbols());

        if (request.symbols() == null || request.symbols().isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return stockServiceClient.getStockDataForSymbols(request.symbols())
                .flatMap(stocks -> researchAIService.generateStockComparison(stocks))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/public/ai/research/watchlist/stock : Generate detailed research for
     * a single stock
     */
    @PostMapping("/research/watchlist/stock/{symbol}")
    @Operation(summary = "Generate detailed AI research for a single watchlist stock")
    public Mono<ResponseEntity<ResearchAIService.WatchlistStockResearch>> generateStockResearch(
            @PathVariable String symbol) {
        LOG.info("Public request for single stock research: {}", symbol);

        return stockServiceClient.getQuote(symbol)
                .map(quote -> new StockData(
                        symbol,
                        quote.close() != null ? quote.close() : 0.0,
                        quote.percentChange() != null ? quote.percentChange() : 0.0,
                        quote.volume() != null ? quote.volume() : 0L))
                .flatMap(stockData -> researchAIService.generateWatchlistStockResearch(symbol, stockData))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // DTOs
    public record ChatRequest(String question, String sessionId) {
    }

    public record ChatResponse(String response, String sessionId, Instant timestamp) {
    }

    public record WatchlistRequest(java.util.List<String> symbols) {
    }
}
