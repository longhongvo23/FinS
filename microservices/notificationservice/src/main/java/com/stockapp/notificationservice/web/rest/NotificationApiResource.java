package com.stockapp.notificationservice.web.rest;

import com.stockapp.notificationservice.domain.enumeration.NotificationCategory;
import com.stockapp.notificationservice.service.NotificationService;
import com.stockapp.notificationservice.service.dto.NotificationDTO;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

/**
 * REST controller for user notification actions.
 * Provides endpoints for the Notification Center UI.
 * Base path: /api/notifications/user to avoid conflicts with JHipster CRUD
 * controller.
 */
@RestController
@RequestMapping("/api/notifications/user")
public class NotificationApiResource {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationApiResource.class);

    private final NotificationService notificationService;

    public NotificationApiResource(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * {@code GET /api/notifications/user} : Get all notifications for the current
     * user.
     *
     * @param category optional category filter (SYSTEM, PRICE_ALERT, AI_INSIGHT,
     *                 NEWS)
     * @param page     page number (default 0)
     * @param size     page size (default 20)
     * @param jwt      the JWT token
     * @return the list of notifications
     */
    @GetMapping("")
    public Mono<ResponseEntity<List<NotificationDTO>>> getNotifications(
            @RequestParam(required = false) NotificationCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        LOG.debug("REST request to get Notifications for user: {}, category: {}", userId, category);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return notificationService
                .getNotifications(userId, category, pageable)
                .collectList()
                .map(ResponseEntity::ok);
    }

    /**
     * {@code GET /api/notifications/user/unread} : Get unread notifications for the
     * current user.
     *
     * @param page page number (default 0)
     * @param size page size (default 20)
     * @param jwt  the JWT token
     * @return the list of unread notifications
     */
    @GetMapping("/unread")
    public Mono<ResponseEntity<List<NotificationDTO>>> getUnreadNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        LOG.debug("REST request to get unread Notifications for user: {}", userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return notificationService
                .getUnreadNotifications(userId, pageable)
                .collectList()
                .map(ResponseEntity::ok);
    }

    /**
     * {@code GET /api/notifications/user/unread-count} : Get the count of unread
     * notifications.
     *
     * @param jwt the JWT token
     * @return the count of unread notifications
     */
    @GetMapping("/unread-count")
    public Mono<ResponseEntity<Long>> getUnreadCount(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        LOG.debug("REST request to get unread count for user: {}", userId);

        return notificationService.getUnreadCount(userId).map(ResponseEntity::ok);
    }

    /**
     * {@code GET /api/notifications/user/count} : Get the total count of
     * notifications.
     *
     * @param category optional category filter
     * @param jwt      the JWT token
     * @return the count of notifications
     */
    @GetMapping("/count")
    public Mono<ResponseEntity<Long>> getNotificationCount(
            @RequestParam(required = false) NotificationCategory category,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        LOG.debug("REST request to get notification count for user: {}, category: {}", userId, category);

        if (category != null) {
            return notificationService.countByUserIdAndCategory(userId, category).map(ResponseEntity::ok);
        }
        return notificationService.countByUserId(userId).map(ResponseEntity::ok);
    }

    /**
     * {@code PUT /api/notifications/user/:id/read} : Mark a notification as read.
     *
     * @param id the notification id
     * @return the updated notification
     */
    @PutMapping("/{id}/read")
    public Mono<ResponseEntity<NotificationDTO>> markAsRead(@PathVariable String id) {
        LOG.debug("REST request to mark Notification as read: {}", id);

        return notificationService
                .markAsRead(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * {@code PUT /api/notifications/user/read-all} : Mark all notifications as
     * read.
     *
     * @param jwt the JWT token
     * @return the count of updated notifications
     */
    @PutMapping("/read-all")
    public Mono<ResponseEntity<Long>> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        LOG.debug("REST request to mark all Notifications as read for user: {}", userId);

        return notificationService.markAllAsRead(userId).map(ResponseEntity::ok);
    }
}
