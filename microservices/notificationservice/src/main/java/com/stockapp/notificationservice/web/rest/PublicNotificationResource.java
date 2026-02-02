package com.stockapp.notificationservice.web.rest;

import com.stockapp.notificationservice.domain.enumeration.NotificationCategory;
import com.stockapp.notificationservice.domain.enumeration.NotificationStatus;
import com.stockapp.notificationservice.service.NotificationService;
import com.stockapp.notificationservice.service.dto.NotificationDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Public REST API for Notification management
 * Requires authentication
 * 
 * Simplified notification system with only AI and News notifications
 */
@RestController
@RequestMapping("/api/public/notifications")
@Tag(name = "Notification API", description = "Endpoints for managing user notifications")
@SecurityRequirement(name = "bearer-jwt")
public class PublicNotificationResource {

    private static final Logger LOG = LoggerFactory.getLogger(PublicNotificationResource.class);

    private final NotificationService notificationService;

    public PublicNotificationResource(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Response DTO for notifications
     */
    public static class NotificationResponse {
        private String id;
        private String recipient;
        private String type;
        private String status;
        private String subject;
        private String content;
        private String title;
        private String category;
        private String metadata;
        private Instant createdAt;
        private Instant sentAt;
        private boolean read;

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getRecipient() {
            return recipient;
        }

        public void setRecipient(String recipient) {
            this.recipient = recipient;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getMetadata() {
            return metadata;
        }

        public void setMetadata(String metadata) {
            this.metadata = metadata;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }

        public Instant getSentAt() {
            return sentAt;
        }

        public void setSentAt(Instant sentAt) {
            this.sentAt = sentAt;
        }

        public boolean isRead() {
            return read;
        }

        public void setRead(boolean read) {
            this.read = read;
        }
    }

    /**
     * GET /api/public/notifications : Get user's notifications
     *
     * @param read     filter by read status (optional)
     * @param category filter by category (AI_INSIGHT, NEWS) (optional)
     * @param page     page number (default: 0)
     * @param size     page size (default: 20)
     * @return paginated list of notifications
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get notifications", description = "Get paginated list of user notifications")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notifications retrieved successfully")
    })
    public Flux<NotificationResponse> getUserNotifications(
            @Parameter(description = "Filter by read status") @RequestParam(required = false) Boolean read,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {

        LOG.debug("Public API request to get notifications - read: {}, category: {}, page: {}, size: {}",
                read, category, page, size);

        return getCurrentUserId()
                .flatMapMany(userId -> {
                    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

                    // Parse category if provided
                    NotificationCategory categoryEnum = null;
                    if (category != null && !category.isEmpty()) {
                        try {
                            categoryEnum = NotificationCategory.valueOf(category);
                        } catch (IllegalArgumentException e) {
                            LOG.warn("Invalid category: {}", category);
                        }
                    }

                    // Use the proper service method that queries by userId
                    Flux<NotificationDTO> allNotifications = notificationService.getNotifications(userId, categoryEnum,
                            pageable);

                    // Filter by read status if provided
                    if (read != null) {
                        allNotifications = allNotifications
                                .filter(n -> Boolean.valueOf(n.isRead()).equals(read));
                    }

                    return allNotifications.map(this::toNotificationResponse);
                });
    }

    /**
     * GET /api/public/notifications/unread-count : Get count of unread
     * notifications
     *
     * @return unread count
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    })
    public Mono<ResponseEntity<Long>> getUnreadCount() {
        LOG.debug("Public API request to get unread count");

        return getCurrentUserId()
                .flatMap(userId -> notificationService.getUnreadCount(userId))
                .map(ResponseEntity::ok);
    }

    /**
     * PUT /api/public/notifications/{id}/read : Mark notification as read
     *
     * @param id the notification ID
     * @return updated notification
     */
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark as read", description = "Mark a notification as read")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notification marked as read"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public Mono<ResponseEntity<NotificationResponse>> markAsRead(@PathVariable String id) {
        LOG.debug("Public API request to mark notification as read: {}", id);

        return notificationService.findOne(id)
                .flatMap(notification -> {
                    notification.setStatus(NotificationStatus.SENT);
                    notification.setSentAt(Instant.now());
                    return notificationService.update(notification);
                })
                .map(this::toNotificationResponse)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * PATCH /api/public/notifications/read-all : Mark all notifications as read
     *
     * @return number of notifications updated
     */
    @PatchMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all user notifications as read")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All notifications marked as read")
    })
    public Mono<ResponseEntity<Map<String, Long>>> markAllAsRead() {
        LOG.debug("Public API request to mark all notifications as read");

        return getCurrentUserId()
                .flatMap(userId -> notificationService.markAllAsRead(userId))
                .map(count -> {
                    Map<String, Long> result = new HashMap<>();
                    result.put("updated", count);
                    return ResponseEntity.ok(result);
                });
    }

    /**
     * DELETE /api/public/notifications/{id} : Delete a notification
     *
     * @param id the notification ID
     * @return status 204 (NO_CONTENT)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Delete a notification")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Notification deleted"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public Mono<ResponseEntity<Void>> deleteNotification(@PathVariable String id) {
        LOG.debug("Public API request to delete notification: {}", id);

        return notificationService.delete(id)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
    }

    /**
     * DELETE /api/public/notifications : Delete all user's notifications
     *
     * @return number of notifications deleted
     */
    @DeleteMapping
    @Operation(summary = "Delete all notifications", description = "Delete all user's notifications")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All notifications deleted")
    })
    public Mono<ResponseEntity<Map<String, Long>>> deleteAllNotifications() {
        LOG.debug("Public API request to delete all notifications");

        return getCurrentUserId()
                .flatMapMany(userId -> notificationService.getNotifications(userId, null, Pageable.unpaged()))
                .flatMap(notification -> notificationService.delete(notification.getId()))
                .count()
                .map(count -> {
                    Map<String, Long> result = new HashMap<>();
                    result.put("deleted", count);
                    return ResponseEntity.ok(result);
                });
    }

    // Helper methods

    private Mono<String> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName);
    }

    private NotificationResponse toNotificationResponse(NotificationDTO dto) {
        NotificationResponse response = new NotificationResponse();
        response.setId(dto.getId());
        response.setRecipient(dto.getRecipient());
        response.setType(dto.getType() != null ? dto.getType().name() : null);
        response.setStatus(dto.getStatus() != null ? dto.getStatus().name() : null);
        response.setSubject(dto.getSubject());
        response.setContent(dto.getContent());
        response.setTitle(dto.getTitle());
        response.setCategory(dto.getCategory() != null ? dto.getCategory().name() : null);
        response.setMetadata(dto.getMetadata());
        response.setCreatedAt(dto.getCreatedAt());
        response.setSentAt(dto.getSentAt());
        response.setRead(NotificationStatus.SENT.equals(dto.getStatus()));
        return response;
    }
}
