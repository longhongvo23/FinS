package com.stockapp.notificationservice.broker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockapp.notificationservice.domain.Notification;
import com.stockapp.notificationservice.domain.enumeration.NotificationCategory;
import com.stockapp.notificationservice.domain.enumeration.NotificationStatus;
import com.stockapp.notificationservice.domain.enumeration.NotificationType;
import com.stockapp.notificationservice.repository.NotificationRepository;
import com.stockapp.notificationservice.service.dto.kafka.AIPredictionMessage;
import com.stockapp.notificationservice.service.dto.kafka.NewsUpdateMessage;
import com.stockapp.notificationservice.service.dto.kafka.PriceUpdateMessage;
import java.time.Instant;
import java.util.function.Consumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Flux;

/**
 * Kafka consumers for notification events from multiple topics.
 * Consumes messages and creates Notification entities in MongoDB.
 * 
 * Supports AI, News, and Price notifications.
 */
@Configuration
public class NotificationKafkaConsumer {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationKafkaConsumer.class);

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public NotificationKafkaConsumer(NotificationRepository notificationRepository, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Consumer for news update messages.
     * Topic: stock.news.updates
     */
    @Bean
    public Consumer<String> newsUpdateConsumer() {
        return message -> {
            LOG.debug("Received news update message: {}", message);
            try {
                NewsUpdateMessage news = objectMapper.readValue(message, NewsUpdateMessage.class);

                String symbol = news.symbol() != null ? news.symbol() : "";
                String title = String.format("📰 Tin mới về %s", symbol.isEmpty() ? "thị trường" : symbol);
                String content = news.title();
                if (news.source() != null && !news.source().isEmpty()) {
                    content += String.format(" (Nguồn: %s)", news.source());
                }

                String metadata = String.format(
                        "{\"symbol\":\"%s\",\"newsId\":\"%s\",\"source\":\"%s\",\"url\":\"%s\"}",
                        symbol,
                        news.newsId() != null ? news.newsId() : "",
                        news.source() != null ? news.source() : "",
                        news.url() != null ? news.url() : "");

                Notification notification = new Notification()
                        .userId(news.userId())
                        .title(title)
                        .content(content)
                        .category(NotificationCategory.NEWS)
                        .type(NotificationType.IN_APP)
                        .status(NotificationStatus.PENDING)
                        .createdAt(Instant.now())
                        .isRead(false)
                        .metadata(metadata);

                notificationRepository.save(notification)
                        .doOnSuccess(saved -> LOG.info("Saved news notification for {}: {}", symbol, saved.getId()))
                        .doOnError(e -> LOG.error("Failed to save news notification", e))
                        .subscribe();
            } catch (Exception e) {
                LOG.error("Failed to process news update message: {}", message, e);
            }
        };
    }

    /**
     * Consumer for AI prediction messages.
     * Topic: ai.prediction.completed
     */
    @Bean
    public Consumer<String> aiPredictionConsumer() {
        return message -> {
            LOG.debug("Received AI prediction message: {}", message);
            try {
                AIPredictionMessage prediction = objectMapper.readValue(message, AIPredictionMessage.class);

                Notification notification = new Notification()
                        .userId(prediction.userId())
                        .title(String.format("AI Insight: %s", prediction.symbol()))
                        .content(prediction.details() != null ? prediction.details()
                                : String.format("Dự đoán %s cho %s (Độ tin cậy: %.0f%%)",
                                        prediction.prediction(), prediction.symbol(), prediction.confidence() * 100))
                        .category(NotificationCategory.AI_INSIGHT)
                        .type(NotificationType.IN_APP)
                        .status(NotificationStatus.PENDING)
                        .createdAt(Instant.now())
                        .isRead(false)
                        .metadata(message);

                notificationRepository.save(notification)
                        .doOnSuccess(saved -> LOG.info("Saved AI insight notification: {}", saved.getId()))
                        .doOnError(e -> LOG.error("Failed to save AI insight notification", e))
                        .subscribe();
            } catch (Exception e) {
                LOG.error("Failed to process AI prediction message: {}", message, e);
            }
        };
    }

    /**
     * Consumer for price update messages.
     * Topic: stock.price.updates
     * Creates notifications for all users watching the stock symbol.
     */
    @Bean
    public Consumer<String> priceUpdateConsumer() {
        return message -> {
            LOG.debug("Received price update message: {}", message);
            try {
                PriceUpdateMessage priceUpdate = objectMapper.readValue(message, PriceUpdateMessage.class);

                if (priceUpdate.userIds() == null || priceUpdate.userIds().isEmpty()) {
                    LOG.info("No users watching symbol {}, skipping price notification", priceUpdate.symbol());
                    return;
                }

                String changeEmoji = priceUpdate.percentChange() >= 0 ? "📈" : "📉";
                String changeDirection = priceUpdate.percentChange() >= 0 ? "tăng" : "giảm";
                String changeColor = priceUpdate.percentChange() >= 0 ? "🟢" : "🔴";

                String title = String.format("%s Giá %s hôm nay: %s %.2f%%",
                        changeEmoji, priceUpdate.symbol(), changeColor, Math.abs(priceUpdate.percentChange()));
                String content = String.format(
                        "Cổ phiếu %s đã %s %.2f%% trong phiên giao dịch. " +
                                "Giá mở cửa: %s | Giá đóng cửa: %s | Cao nhất: %s | Thấp nhất: %s | Khối lượng: %s",
                        priceUpdate.symbol(), changeDirection, Math.abs(priceUpdate.percentChange()),
                        priceUpdate.openPrice(), priceUpdate.closePrice(),
                        priceUpdate.highPrice(), priceUpdate.lowPrice(), priceUpdate.volume());

                String metadata = String.format(
                        "{\"symbol\":\"%s\",\"percentChange\":%.2f,\"closePrice\":\"%s\",\"date\":\"%s\"}",
                        priceUpdate.symbol(), priceUpdate.percentChange(), priceUpdate.closePrice(),
                        priceUpdate.date());

                Flux.fromIterable(priceUpdate.userIds())
                        .flatMap(userId -> {
                            Notification notification = new Notification()
                                    .userId(userId)
                                    .title(title)
                                    .content(content)
                                    .category(NotificationCategory.PRICE)
                                    .type(NotificationType.IN_APP)
                                    .status(NotificationStatus.PENDING)
                                    .createdAt(Instant.now())
                                    .isRead(false)
                                    .metadata(metadata);
                            return notificationRepository.save(notification);
                        })
                        .doOnComplete(() -> LOG.info("Created {} price notifications for symbol {}",
                                priceUpdate.userIds().size(), priceUpdate.symbol()))
                        .doOnError(e -> LOG.error("Failed to save price notifications", e))
                        .subscribe();
            } catch (Exception e) {
                LOG.error("Failed to process price update message: {}", message, e);
            }
        };
    }
}
