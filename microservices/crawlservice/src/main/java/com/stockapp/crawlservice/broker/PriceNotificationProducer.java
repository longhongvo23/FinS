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
 * Kafka producer for sending price update notifications.
 * Sends messages to stock.price.updates topic.
 */
@Component
public class PriceNotificationProducer {

    private static final Logger log = LoggerFactory.getLogger(PriceNotificationProducer.class);
    private static final String PRICE_UPDATE_BINDING = "priceUpdateProducer-out-0";

    private final StreamBridge streamBridge;
    private final ObjectMapper objectMapper;

    public PriceNotificationProducer(StreamBridge streamBridge, ObjectMapper objectMapper) {
        this.streamBridge = streamBridge;
        this.objectMapper = objectMapper;
    }

    /**
     * Send price update notification to Kafka.
     * This will be consumed by NotificationService to create notifications for
     * users.
     */
    public Mono<Void> sendPriceUpdate(PriceUpdateMessage message) {
        return Mono.fromRunnable(() -> {
            try {
                String jsonMessage = objectMapper.writeValueAsString(message);
                boolean sent = streamBridge.send(PRICE_UPDATE_BINDING, jsonMessage);
                if (sent) {
                    log.info("Sent price update for {} to {} users", message.symbol(), message.userIds().size());
                } else {
                    log.warn("Failed to send price update for {}", message.symbol());
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize price update message for {}: {}", message.symbol(), e.getMessage());
            }
        }).then();
    }

    /**
     * Price update message DTO
     */
    public record PriceUpdateMessage(
            String symbol,
            List<String> userIds,
            double percentChange,
            String openPrice,
            String closePrice,
            String highPrice,
            String lowPrice,
            String volume,
            String date) {
    }
}
