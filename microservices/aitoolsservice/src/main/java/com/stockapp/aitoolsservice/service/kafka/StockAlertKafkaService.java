package com.stockapp.aitoolsservice.service.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService;
import com.stockapp.aitoolsservice.service.ai.GeminiClientService.StockData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.function.Consumer;

/**
 * Kafka consumer and producer for stock alerts
 * Feature D: Smart Alerts
 */
@Configuration
public class StockAlertKafkaService {

    private static final Logger LOG = LoggerFactory.getLogger(StockAlertKafkaService.class);
    private static final int BATCH_SIZE = 7;

    private final GeminiClientService geminiClientService;
    private final StreamBridge streamBridge;
    private final ObjectMapper objectMapper;

    // Buffer for batching stock updates
    private final ConcurrentLinkedQueue<StockData> stockBuffer = new ConcurrentLinkedQueue<>();

    public StockAlertKafkaService(
            GeminiClientService geminiClientService,
            StreamBridge streamBridge,
            ObjectMapper objectMapper) {
        this.geminiClientService = geminiClientService;
        this.streamBridge = streamBridge;
        this.objectMapper = objectMapper;
    }

    /**
     * Kafka consumer for stock-updates topic
     * Buffers messages and triggers batch analysis with Gemini
     */
    @Bean
    public Consumer<String> stockUpdatesConsumer() {
        return message -> {
            try {
                StockData stockData = parseStockUpdate(message);
                if (stockData != null) {
                    stockBuffer.add(stockData);
                    LOG.debug("Buffered stock update: {}", stockData.symbol());

                    // Process batch when buffer reaches threshold
                    if (stockBuffer.size() >= BATCH_SIZE) {
                        processBatch();
                    }
                }
            } catch (Exception e) {
                LOG.error("Error processing stock update: {}", e.getMessage());
            }
        };
    }

    /**
     * Process buffered stocks with Gemini for anomaly detection
     */
    private void processBatch() {
        List<StockData> batch = new ArrayList<>();
        while (!stockBuffer.isEmpty() && batch.size() < BATCH_SIZE) {
            StockData data = stockBuffer.poll();
            if (data != null) {
                batch.add(data);
            }
        }

        if (batch.isEmpty())
            return;

        LOG.info("Processing batch of {} stocks for alert analysis", batch.size());

        geminiClientService.analyzeStockAlerts(batch)
                .doOnNext(alerts -> {
                    if (!alerts.isEmpty()) {
                        alerts.forEach(this::publishAlert);
                    }
                })
                .doOnError(e -> LOG.error("Error analyzing alerts: {}", e.getMessage()))
                .subscribe();
    }

    /**
     * Publish alert to Kafka alert-topic
     */
    private void publishAlert(GeminiClientService.AlertResponse alert) {
        try {
            String alertJson = objectMapper.writeValueAsString(alert);
            Message<String> message = MessageBuilder.withPayload(alertJson).build();

            boolean sent = streamBridge.send("alert-topic", message);
            if (sent) {
                LOG.info("Published alert for {}: {} - {}",
                        alert.symbol(), alert.alert_type(), alert.message());
            } else {
                LOG.warn("Failed to publish alert for {}", alert.symbol());
            }
        } catch (Exception e) {
            LOG.error("Error publishing alert: {}", e.getMessage());
        }
    }

    /**
     * Manual trigger for batch processing (testing)
     */
    public void triggerBatchProcess() {
        processBatch();
    }

    /**
     * Parse stock update message from Kafka
     */
    private StockData parseStockUpdate(String message) {
        try {
            JsonNode node = objectMapper.readTree(message);
            return new StockData(
                    node.path("symbol").asText(),
                    node.path("price").asDouble(0),
                    node.path("percentChange").asDouble(0),
                    node.path("volume").asLong(0));
        } catch (Exception e) {
            LOG.warn("Failed to parse stock update: {}", e.getMessage());
            return null;
        }
    }
}
