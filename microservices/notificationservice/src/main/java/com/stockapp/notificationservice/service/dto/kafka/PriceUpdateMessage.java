package com.stockapp.notificationservice.service.dto.kafka;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for daily price update messages from stock.price.updates topic.
 * Sent by crawlservice after successfully crawling new daily prices.
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
        String date) implements Serializable {
}
