package com.stockapp.notificationservice.repository;

import com.stockapp.notificationservice.domain.Notification;
import com.stockapp.notificationservice.domain.enumeration.NotificationCategory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data MongoDB reactive repository for the Notification entity.
 */
@SuppressWarnings("unused")
@Repository
public interface NotificationRepository extends ReactiveMongoRepository<Notification, String> {

    /**
     * Find all notifications with pagination
     */
    Flux<Notification> findAllBy(Pageable pageable);

    /**
     * Find notifications by recipient (legacy)
     */
    Flux<Notification> findByRecipient(String recipient, Pageable pageable);

    /**
     * Find notifications by userId ordered by createdAt desc
     */
    Flux<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Find notifications by userId and category ordered by createdAt desc
     */
    Flux<Notification> findByUserIdAndCategoryOrderByCreatedAtDesc(
            String userId,
            NotificationCategory category,
            Pageable pageable);

    /**
     * Find unread notifications by userId ordered by createdAt desc
     */
    Flux<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Count all notifications by userId
     */
    Mono<Long> countByUserId(String userId);

    /**
     * Count unread notifications by userId
     */
    Mono<Long> countByUserIdAndIsReadFalse(String userId);

    /**
     * Count notifications by userId and category
     */
    Mono<Long> countByUserIdAndCategory(String userId, NotificationCategory category);

    /**
     * Find all notifications by userId (for marking all as read)
     */
    Flux<Notification> findByUserId(String userId);

    /**
     * Find all unread notifications by userId (for marking all as read)
     */
    Flux<Notification> findByUserIdAndIsReadFalse(String userId);

    // ==================== Broadcast Support ====================

    /**
     * Find notifications for a user OR broadcast notifications
     */
    @Query("{ '$or': [ { 'userId': ?0 }, { 'userId': '_BROADCAST_' } ] }")
    Flux<Notification> findByUserIdOrBroadcast(String userId, Pageable pageable);

    /**
     * Find notifications for a user OR broadcast notifications, filtered by
     * category
     */
    @Query("{ '$and': [ { '$or': [ { 'userId': ?0 }, { 'userId': '_BROADCAST_' } ] }, { 'category': ?1 } ] }")
    Flux<Notification> findByUserIdOrBroadcastAndCategory(String userId, NotificationCategory category,
            Pageable pageable);

    /**
     * Find unread notifications for a user OR broadcast notifications
     */
    @Query("{ '$and': [ { '$or': [ { 'userId': ?0 }, { 'userId': '_BROADCAST_' } ] }, { 'isRead': false } ] }")
    Flux<Notification> findByUserIdOrBroadcastAndUnread(String userId, Pageable pageable);

    /**
     * Count unread notifications for a user OR broadcast
     */
    @Query(value = "{ '$and': [ { '$or': [ { 'userId': ?0 }, { 'userId': '_BROADCAST_' } ] }, { 'isRead': false } ] }", count = true)
    Mono<Long> countByUserIdOrBroadcastAndUnread(String userId);

    /**
     * Count all notifications for a user OR broadcast
     */
    @Query(value = "{ '$or': [ { 'userId': ?0 }, { 'userId': '_BROADCAST_' } ] }", count = true)
    Mono<Long> countByUserIdOrBroadcast(String userId);

    /**
     * Count notifications for a user OR broadcast, filtered by category
     */
    @Query(value = "{ '$and': [ { '$or': [ { 'userId': ?0 }, { 'userId': '_BROADCAST_' } ] }, { 'category': ?1 } ] }", count = true)
    Mono<Long> countByUserIdOrBroadcastAndCategory(String userId, NotificationCategory category);
}
