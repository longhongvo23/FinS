package com.stockapp.aitoolsservice.service.scheduler;

import com.stockapp.aitoolsservice.domain.DailyMarketInsight;
import com.stockapp.aitoolsservice.domain.IndustryAnalysis;
import com.stockapp.aitoolsservice.domain.enumeration.Sentiment;
import com.stockapp.aitoolsservice.repository.DailyMarketInsightRepository;
import com.stockapp.aitoolsservice.repository.IndustryAnalysisRepository;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService.StockData;
import com.stockapp.aitoolsservice.service.client.StockServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled job for daily AI market insights generation
 * Runs at 8 AM UTC every day
 */
@Service
public class DailyInsightsScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(DailyInsightsScheduler.class);

    private final StockServiceClient stockServiceClient;
    private final GeminiClientService geminiClientService;
    private final DailyMarketInsightRepository insightRepository;
    private final IndustryAnalysisRepository industryRepository;

    public DailyInsightsScheduler(
            StockServiceClient stockServiceClient,
            GeminiClientService geminiClientService,
            DailyMarketInsightRepository insightRepository,
            IndustryAnalysisRepository industryRepository) {
        this.stockServiceClient = stockServiceClient;
        this.geminiClientService = geminiClientService;
        this.insightRepository = insightRepository;
        this.industryRepository = industryRepository;
    }

    /**
     * Generate daily market insights at 8 AM UTC
     */
    @Scheduled(cron = "${application.schedule.daily-insights:0 0 8 * * ?}")
    public void generateDailyInsights() {
        LOG.info("Starting daily market insights generation...");

        stockServiceClient.getAllQuotes()
                .collectList()
                .filter(stocks -> !stocks.isEmpty())
                .flatMap(stocks -> {
                    LOG.info("Fetched {} stock quotes, calling Gemini...", stocks.size());
                    return geminiClientService.generateMarketInsights(stocks)
                            .flatMap(response -> saveInsights(stocks, response));
                })
                .doOnSuccess(saved -> LOG.info("Daily insights generated successfully"))
                .doOnError(error -> LOG.error("Failed to generate daily insights: {}", error.getMessage()))
                .subscribe();
    }

    private Mono<DailyMarketInsight> saveInsights(List<StockData> stocks,
            GeminiClientService.MarketInsightsResponse response) {
        LocalDate today = LocalDate.now();

        // Create main insight
        DailyMarketInsight insight = new DailyMarketInsight();
        insight.setReportDate(today);
        insight.setMarketTrend(response.market_trend());
        insight.setSummaryTitle(response.summary_title());
        insight.setSummaryContent(response.summary_content());

        // Convert highlights to JSON
        if (response.highlights() != null) {
            try {
                insight.setHighlightsJson(new com.fasterxml.jackson.databind.ObjectMapper()
                        .writeValueAsString(response.highlights()));
            } catch (Exception e) {
                insight.setHighlightsJson("[]");
            }
        }
        insight.setCreatedAt(Instant.now());

        // Save insight first, then save industry analyses reactively
        return insightRepository.save(insight)
                .flatMap(savedInsight -> {
                    if (response.sector_analysis() != null && !response.sector_analysis().isEmpty()) {
                        return Flux.fromIterable(response.sector_analysis())
                                .map(sector -> {
                                    IndustryAnalysis industry = new IndustryAnalysis();
                                    industry.setReportDate(today);
                                    industry.setIndustryName(sector.industry());
                                    industry.setSentiment(parseSentiment(sector.sentiment()));
                                    industry.setSummary(sector.summary());
                                    industry.setRelatedStocks(sector.stocks());
                                    industry.setCreatedAt(Instant.now());
                                    industry.setDailyInsight(savedInsight);
                                    return industry;
                                })
                                .flatMap(industryRepository::save)
                                .then(Mono.just(savedInsight));
                    }
                    return Mono.just(savedInsight);
                });
    }

    private Sentiment parseSentiment(String sentiment) {
        if (sentiment == null)
            return Sentiment.NEUTRAL;
        return switch (sentiment.toUpperCase()) {
            case "POSITIVE" -> Sentiment.POSITIVE;
            case "NEGATIVE" -> Sentiment.NEGATIVE;
            default -> Sentiment.NEUTRAL;
        };
    }

    /**
     * Manual trigger for testing
     */
    public void triggerManually() {
        generateDailyInsights();
    }
}
