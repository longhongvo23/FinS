package com.stockapp.notificationservice.web.rest;

import com.stockapp.notificationservice.domain.enumeration.NotificationCategory;
import com.stockapp.notificationservice.domain.enumeration.NotificationStatus;
import com.stockapp.notificationservice.domain.enumeration.NotificationType;
import com.stockapp.notificationservice.service.NotificationService;
import com.stockapp.notificationservice.service.dto.NotificationDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Internal REST API for Notification - used by other microservices
 * Simplified to only AI and News notifications
 * No authentication required for internal calls
 */
@RestController
@RequestMapping("/api/internal/notifications")
@Tag(name = "Internal Notification API", description = "Internal endpoints for creating AI and News notifications")
public class InternalNotificationResource {

        private static final Logger LOG = LoggerFactory.getLogger(InternalNotificationResource.class);

        private final NotificationService notificationService;

        public InternalNotificationResource(NotificationService notificationService) {
                this.notificationService = notificationService;
        }

        // ==================== AI Notifications ====================

        /**
         * POST /api/internal/notifications/ai/prophet : Create AI Prophet forecast
         * notification
         * Called when Prophet model generates a new forecast for a stock
         */
        @PostMapping(value = "/ai/prophet", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create Prophet forecast notification", description = "Create notification when Prophet generates forecast for watchlist stock")
        public Mono<ResponseEntity<NotificationDTO>> createProphetNotification(
                        @RequestBody ProphetNotificationRequest request) {
                LOG.info("Creating Prophet notification for symbol: {} for user: {}", request.symbol(),
                                request.userId());

                String actionEmoji = request.predictedChange() > 0 ? "📈" : "📉";
                String direction = request.predictedChange() > 0 ? "tăng" : "giảm";
                String recommendation = request.predictedChange() > 3 ? "MUA"
                                : request.predictedChange() < -3 ? "BÁN" : "GIỮ";
                String recEmoji = recommendation.equals("MUA") ? "🟢" : recommendation.equals("BÁN") ? "🔴" : "🟡";

                String title = String.format("%s Prophet Dự đoán %s: %s %s",
                                actionEmoji, request.symbol(), recEmoji, recommendation);
                String content = String.format(
                                "AI Prophet dự đoán %s sẽ %s %.1f%% trong %d ngày tới. Giá dự đoán: %s. Độ tin cậy: %.0f%%.",
                                request.symbol(), direction, Math.abs(request.predictedChange()),
                                request.forecastDays(), request.predictedPrice(), request.confidence() * 100);

                NotificationDTO notification = createNotification(
                                request.userId(), title, content, NotificationCategory.AI_INSIGHT,
                                String.format("{\"symbol\":\"%s\",\"type\":\"prophet\",\"recommendation\":\"%s\"}",
                                                request.symbol(), recommendation));

                return notificationService.save(notification)
                                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
        }

        /**
         * POST /api/internal/notifications/ai/research : Create AI Research
         * notification
         * Called when AI Research loads new analysis for a stock
         */
        @PostMapping(value = "/ai/research", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create AI Research notification", description = "Create notification when AI Research completes analysis")
        public Mono<ResponseEntity<NotificationDTO>> createAIResearchNotification(
                        @RequestBody AIResearchNotificationRequest request) {
                LOG.info("Creating AI Research notification for symbol: {} for user: {}", request.symbol(),
                                request.userId());

                String title = String.format("🔬 AI Research: Phân tích mới cho %s", request.symbol());
                String content = String.format(
                                "AI đã hoàn thành phân tích chuyên sâu cho %s. %s Xem chi tiết để biết thêm.",
                                request.symbol(), request.summary() != null ? request.summary() : "");

                NotificationDTO notification = createNotification(
                                request.userId(), title, content, NotificationCategory.AI_INSIGHT,
                                String.format("{\"symbol\":\"%s\",\"type\":\"research\"}", request.symbol()));

                return notificationService.save(notification)
                                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
        }

        /**
         * POST /api/internal/notifications/ai/insight : Create AI Insight notification
         * Called when AI Insight loads new insights for a stock
         */
        @PostMapping(value = "/ai/insight", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create AI Insight notification", description = "Create notification when AI Insight loads new data")
        public Mono<ResponseEntity<NotificationDTO>> createAIInsightNotification(
                        @RequestBody AIInsightNotificationRequest request) {
                LOG.info("Creating AI Insight notification for symbol: {} for user: {}", request.symbol(),
                                request.userId());

                String title = String.format("💡 AI Insight: Cập nhật cho %s", request.symbol());
                String content = String.format(
                                "AI Insight đã cập nhật thông tin mới cho %s. %s",
                                request.symbol(),
                                request.insight() != null ? request.insight() : "Xem chi tiết để biết thêm.");

                NotificationDTO notification = createNotification(
                                request.userId(), title, content, NotificationCategory.AI_INSIGHT,
                                String.format("{\"symbol\":\"%s\",\"type\":\"insight\"}", request.symbol()));

                return notificationService.save(notification)
                                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
        }

        // ==================== News Notifications ====================

        /**
         * POST /api/internal/notifications/news : Create news notification
         * Called when new news is available for a watchlist stock
         */
        @PostMapping(value = "/news", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create news notification", description = "Create notification when new news is available for watchlist stock")
        public Mono<ResponseEntity<NotificationDTO>> createNewsNotification(
                        @RequestBody NewsNotificationRequest request) {
                LOG.info("Creating news notification for symbol: {} for user: {}", request.symbol(), request.userId());

                String title = String.format("📰 Tin mới về %s", request.symbol());
                String content = request.headline();
                if (request.source() != null) {
                        content += String.format(" (Nguồn: %s)", request.source());
                }

                NotificationDTO notification = createNotification(
                                request.userId(), title, content, NotificationCategory.NEWS,
                                String.format("{\"symbol\":\"%s\",\"newsId\":\"%s\",\"source\":\"%s\"}",
                                                request.symbol(),
                                                request.newsId() != null ? request.newsId() : "",
                                                request.source() != null ? request.source() : ""));

                return notificationService.save(notification)
                                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
        }

        /**
         * POST /api/internal/notifications/news/bulk : Create news notifications for
         * multiple users
         */
        @PostMapping(value = "/news/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create bulk news notifications", description = "Create news notifications for multiple users watching a stock")
        public Mono<ResponseEntity<BulkCreateResponse>> createBulkNewsNotifications(
                        @RequestBody BulkNewsNotificationRequest request) {
                LOG.info("Creating bulk news notifications for symbol: {} for {} users",
                                request.symbol(), request.userIds().size());

                String title = String.format("📰 Tin mới về %s", request.symbol());
                String content = request.headline();
                if (request.source() != null) {
                        content += String.format(" (Nguồn: %s)", request.source());
                }

                final String finalContent = content;
                return Flux.fromIterable(request.userIds())
                                .flatMap(userId -> {
                                        NotificationDTO notification = createNotification(
                                                        userId, title, finalContent, NotificationCategory.NEWS,
                                                        String.format("{\"symbol\":\"%s\",\"newsId\":\"%s\"}",
                                                                        request.symbol(),
                                                                        request.newsId() != null ? request.newsId()
                                                                                        : ""));
                                        return notificationService.save(notification);
                                })
                                .count()
                                .map(count -> ResponseEntity
                                                .ok(new BulkCreateResponse(count.intValue(), "Created successfully")));
        }

        // ==================== Price Notifications ====================

        /**
         * POST /api/internal/notifications/price : Create price update notification
         * Called when new daily price is crawled for a stock
         */
        @PostMapping(value = "/price", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create price notification", description = "Create notification when new daily price is available")
        public Mono<ResponseEntity<NotificationDTO>> createPriceNotification(
                        @RequestBody PriceNotificationRequest request) {
                LOG.info("Creating price notification for symbol: {} for user: {}", request.symbol(), request.userId());

                String changeEmoji = request.percentChange() >= 0 ? "📈" : "📉";
                String changeDirection = request.percentChange() >= 0 ? "tăng" : "giảm";
                String changeColor = request.percentChange() >= 0 ? "🟢" : "🔴";

                String title = String.format("%s Giá %s hôm nay: %s %.2f%%",
                                changeEmoji, request.symbol(), changeColor, Math.abs(request.percentChange()));
                String content = String.format(
                                "Cổ phiếu %s đã %s %.2f%% trong phiên giao dịch hôm nay. " +
                                                "Giá mở cửa: %s | Giá đóng cửa: %s | Cao nhất: %s | Thấp nhất: %s | Khối lượng: %s",
                                request.symbol(), changeDirection, Math.abs(request.percentChange()),
                                request.openPrice(), request.closePrice(),
                                request.highPrice(), request.lowPrice(), request.volume());

                NotificationDTO notification = createNotification(
                                request.userId(), title, content, NotificationCategory.PRICE,
                                String.format(
                                                "{\"symbol\":\"%s\",\"percentChange\":%.2f,\"closePrice\":\"%s\",\"date\":\"%s\"}",
                                                request.symbol(), request.percentChange(), request.closePrice(),
                                                request.date()));

                return notificationService.save(notification)
                                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
        }

        /**
         * POST /api/internal/notifications/price/bulk : Create price notifications for
         * multiple users
         */
        @PostMapping(value = "/price/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create bulk price notifications", description = "Create price notifications for all users watching a stock")
        public Mono<ResponseEntity<BulkCreateResponse>> createBulkPriceNotifications(
                        @RequestBody BulkPriceNotificationRequest request) {
                LOG.info("Creating bulk price notifications for symbol: {} for {} users",
                                request.symbol(), request.userIds().size());

                String changeEmoji = request.percentChange() >= 0 ? "📈" : "📉";
                String changeDirection = request.percentChange() >= 0 ? "tăng" : "giảm";
                String changeColor = request.percentChange() >= 0 ? "🟢" : "🔴";

                String title = String.format("%s Giá %s hôm nay: %s %.2f%%",
                                changeEmoji, request.symbol(), changeColor, Math.abs(request.percentChange()));
                String content = String.format(
                                "Cổ phiếu %s đã %s %.2f%% trong phiên giao dịch hôm nay. " +
                                                "Giá mở cửa: %s | Giá đóng cửa: %s | Cao nhất: %s | Thấp nhất: %s | Khối lượng: %s",
                                request.symbol(), changeDirection, Math.abs(request.percentChange()),
                                request.openPrice(), request.closePrice(),
                                request.highPrice(), request.lowPrice(), request.volume());

                final String finalTitle = title;
                final String finalContent = content;

                return Flux.fromIterable(request.userIds())
                                .flatMap(userId -> {
                                        NotificationDTO notification = createNotification(
                                                        userId, finalTitle, finalContent, NotificationCategory.PRICE,
                                                        String.format(
                                                                        "{\"symbol\":\"%s\",\"percentChange\":%.2f,\"closePrice\":\"%s\",\"date\":\"%s\"}",
                                                                        request.symbol(), request.percentChange(),
                                                                        request.closePrice(),
                                                                        request.date()));
                                        return notificationService.save(notification);
                                })
                                .count()
                                .map(count -> ResponseEntity
                                                .ok(new BulkCreateResponse(count.intValue(), "Created successfully")));
        }

        // ==================== Demo Data ====================

        /**
         * POST /api/internal/notifications/seed-demo : Seed demo notifications for
         * testing
         */
        @PostMapping(value = "/seed-demo")
        @Operation(summary = "Seed demo data", description = "Create sample AI and News notifications for demo")
        public Mono<ResponseEntity<BulkCreateResponse>> seedDemoData() {
                LOG.info("Seeding demo notification data (AI and News only)...");

                Instant twoDaysAgo = Instant.now().minus(2, ChronoUnit.DAYS);
                Instant yesterday = Instant.now().minus(1, ChronoUnit.DAYS);
                Instant today = Instant.now();
                Instant twoHoursAgo = today.minus(2, ChronoUnit.HOURS);
                Instant fourHoursAgo = today.minus(4, ChronoUnit.HOURS);

                return Flux.just(
                                // Prophet notifications - 2 days ago
                                createDemoNotification("_BROADCAST_",
                                                "📈 Prophet Dự đoán FPT: 🟢 MUA",
                                                "AI Prophet dự đoán FPT sẽ tăng 5.2% trong 7 ngày tới. Giá dự đoán: 103,500đ. Độ tin cậy: 75%.",
                                                NotificationCategory.AI_INSIGHT,
                                                "{\"symbol\":\"FPT\",\"type\":\"prophet\",\"recommendation\":\"MUA\"}",
                                                twoDaysAgo),
                                createDemoNotification("_BROADCAST_",
                                                "📉 Prophet Dự đoán HPG: 🔴 BÁN",
                                                "AI Prophet dự đoán HPG sẽ giảm 4.1% trong 7 ngày tới. Giá dự đoán: 24,200đ. Độ tin cậy: 68%.",
                                                NotificationCategory.AI_INSIGHT,
                                                "{\"symbol\":\"HPG\",\"type\":\"prophet\",\"recommendation\":\"BÁN\"}",
                                                twoDaysAgo.plus(30, ChronoUnit.MINUTES)),

                                // Prophet notifications - yesterday
                                createDemoNotification("_BROADCAST_",
                                                "📈 Prophet Dự đoán VNM: 🟢 MUA",
                                                "AI Prophet dự đoán VNM sẽ tăng 3.8% trong 7 ngày tới. Giá dự đoán: 75,800đ. Độ tin cậy: 72%.",
                                                NotificationCategory.AI_INSIGHT,
                                                "{\"symbol\":\"VNM\",\"type\":\"prophet\",\"recommendation\":\"MUA\"}",
                                                yesterday),
                                createDemoNotification("_BROADCAST_",
                                                "📈 Prophet Dự đoán VIC: 🟡 GIỮ",
                                                "AI Prophet dự đoán VIC sẽ tăng 1.2% trong 7 ngày tới. Giá dự đoán: 42,500đ. Độ tin cậy: 65%.",
                                                NotificationCategory.AI_INSIGHT,
                                                "{\"symbol\":\"VIC\",\"type\":\"prophet\",\"recommendation\":\"GIỮ\"}",
                                                yesterday.plus(1, ChronoUnit.HOURS)),

                                // Prophet notifications - today
                                createDemoNotification("_BROADCAST_",
                                                "📈 Prophet Dự đoán MWG: 🟢 MUA",
                                                "AI Prophet dự đoán MWG sẽ tăng 6.5% trong 7 ngày tới. Giá dự đoán: 58,200đ. Độ tin cậy: 78%.",
                                                NotificationCategory.AI_INSIGHT,
                                                "{\"symbol\":\"MWG\",\"type\":\"prophet\",\"recommendation\":\"MUA\"}",
                                                twoHoursAgo),

                                // AI Research notification
                                createDemoNotification("_BROADCAST_",
                                                "🔬 AI Research: Phân tích mới cho FPT",
                                                "AI đã hoàn thành phân tích chuyên sâu cho FPT. Doanh nghiệp có tăng trưởng ổn định, biên lợi nhuận cải thiện.",
                                                NotificationCategory.AI_INSIGHT,
                                                "{\"symbol\":\"FPT\",\"type\":\"research\"}",
                                                fourHoursAgo),

                                // AI Insight notification
                                createDemoNotification("_BROADCAST_",
                                                "💡 AI Insight: Cập nhật cho VNM",
                                                "AI Insight đã cập nhật thông tin mới cho VNM. Xu hướng kỹ thuật cho thấy tín hiệu tích cực trong ngắn hạn.",
                                                NotificationCategory.AI_INSIGHT,
                                                "{\"symbol\":\"VNM\",\"type\":\"insight\"}",
                                                twoHoursAgo.plus(30, ChronoUnit.MINUTES)),

                                // News notifications
                                createDemoNotification("_BROADCAST_",
                                                "📰 Tin mới về FPT",
                                                "FPT công bố kết quả kinh doanh Q4/2025: Lợi nhuận tăng 25% so với cùng kỳ. (Nguồn: VnExpress)",
                                                NotificationCategory.NEWS,
                                                "{\"symbol\":\"FPT\",\"type\":\"news\",\"source\":\"VnExpress\"}",
                                                yesterday.plus(3, ChronoUnit.HOURS)),
                                createDemoNotification("_BROADCAST_",
                                                "📰 Tin mới về VNM",
                                                "Vinamilk ký thỏa thuận hợp tác chiến lược với đối tác Nhật Bản. (Nguồn: CafeF)",
                                                NotificationCategory.NEWS,
                                                "{\"symbol\":\"VNM\",\"type\":\"news\",\"source\":\"CafeF\"}",
                                                twoHoursAgo.minus(30, ChronoUnit.MINUTES)),
                                createDemoNotification("_BROADCAST_",
                                                "📰 Tin mới về HPG",
                                                "Hòa Phát dự kiến sản lượng thép năm 2026 tăng 15%. (Nguồn: VietStock)",
                                                NotificationCategory.NEWS,
                                                "{\"symbol\":\"HPG\",\"type\":\"news\",\"source\":\"VietStock\"}",
                                                twoDaysAgo.plus(5, ChronoUnit.HOURS)))
                                .flatMap(notificationService::save)
                                .count()
                                .map(count -> ResponseEntity.ok(new BulkCreateResponse(count.intValue(),
                                                "Demo data seeded successfully (AI and News)")));
        }

        // ==================== Helper Methods ====================

        private NotificationDTO createNotification(String userId, String title, String content,
                        NotificationCategory category, String metadata) {
                NotificationDTO notification = new NotificationDTO();
                notification.setUserId(userId);
                notification.setRecipient(userId);
                notification.setTitle(title);
                notification.setSubject(title);
                notification.setContent(content);
                notification.setCategory(category);
                notification.setType(NotificationType.IN_APP);
                notification.setStatus(NotificationStatus.PENDING);
                notification.setRead(false);
                notification.setMetadata(metadata);
                notification.setCreatedAt(Instant.now());
                return notification;
        }

        private NotificationDTO createDemoNotification(String userId, String title, String content,
                        NotificationCategory category, String metadata, Instant createdAt) {
                NotificationDTO notification = createNotification(userId, title, content, category, metadata);
                notification.setCreatedAt(createdAt);
                return notification;
        }

        // ==================== Request DTOs ====================

        public record ProphetNotificationRequest(
                        String userId,
                        String symbol,
                        double predictedChange,
                        String predictedPrice,
                        int forecastDays,
                        double confidence) {
        }

        public record AIResearchNotificationRequest(
                        String userId,
                        String symbol,
                        String summary) {
        }

        public record AIInsightNotificationRequest(
                        String userId,
                        String symbol,
                        String insight) {
        }

        public record NewsNotificationRequest(
                        String userId,
                        String symbol,
                        String headline,
                        String source,
                        String newsId) {
        }

        public record BulkNewsNotificationRequest(
                        List<String> userIds,
                        String symbol,
                        String headline,
                        String source,
                        String newsId) {
        }

        public record PriceNotificationRequest(
                        String userId,
                        String symbol,
                        double percentChange,
                        String openPrice,
                        String closePrice,
                        String highPrice,
                        String lowPrice,
                        String volume,
                        String date) {
        }

        public record BulkPriceNotificationRequest(
                        List<String> userIds,
                        String symbol,
                        double percentChange,
                        String openPrice,
                        String closePrice,
                        String highPrice,
                        String lowPrice,
                        String volume,
                        String date) {
        }

        public record BulkCreateResponse(int created, String message) {
        }
}
