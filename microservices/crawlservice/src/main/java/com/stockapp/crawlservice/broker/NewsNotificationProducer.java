package com.stockapp.crawlservice.broker;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Kafka producer for sending news update notifications.
 * Sends messages to stock.news.updates topic.
 */
@Component
public class NewsNotificationProducer {

    private static final Logger log = LoggerFactory.getLogger(NewsNotificationProducer.class);
    private static final String NEWS_UPDATE_BINDING = "newsUpdateProducer-out-0";

    private final StreamBridge streamBridge;
    private final ObjectMapper objectMapper;

    public NewsNotificationProducer(StreamBridge streamBridge, ObjectMapper objectMapper) {
        this.streamBridge = streamBridge;
        this.objectMapper = objectMapper;
    }

    /**
     * Send news notification to Kafka.
     * This will be consumed by NotificationService to create notifications for
     * users.
     */
    public Mono<Void> sendNewsUpdate(NewsUpdateMessage message) {
        return Mono.fromRunnable(() -> {
            try {
                String jsonMessage = objectMapper.writeValueAsString(message);
                boolean sent = streamBridge.send(NEWS_UPDATE_BINDING, jsonMessage);
                if (sent) {
                    log.info("Sent news update for symbol {} to user {}", message.symbol(), message.userId());
                } else {
                    log.warn("Failed to send news update for symbol {}", message.symbol());
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize news update message: {}", e.getMessage());
            }
        }).then();
    }

    /**
     * News update message DTO - sent per user
     */
    public record NewsUpdateMessage(
            String userId,
            String newsId,
            String title,
            String summary,
            String source,
            String url,
            String imageUrl,
            String symbol) {
    }
}
