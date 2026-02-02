package com.stockapp.notificationservice.service.dto.kafka;

import java.io.Serializable;

/**
 * DTO for news update messages from stock.news.updates topic.
 */
public record NewsUpdateMessage(
                String userId,
                String newsId,
                String title,
                String summary,
                String source,
                String url,
                String imageUrl,
                String symbol) implements Serializable {
}
