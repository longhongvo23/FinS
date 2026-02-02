package com.stockapp.notificationservice.service.dto.kafka;

import java.io.Serializable;

/**
 * DTO for AI prediction messages from ai.prediction.completed topic.
 */
public record AIPredictionMessage(
        String userId,
        String symbol,
        String predictionType,
        String prediction,
        Double confidence,
        String details,
        String modelName) implements Serializable {
}
