package com.stockapp.notificationservice.service;

import com.stockapp.notificationservice.domain.Notification;
import com.stockapp.notificationservice.domain.enumeration.NotificationCategory;
import com.stockapp.notificationservice.repository.NotificationRepository;
import com.stockapp.notificationservice.service.dto.NotificationDTO;
import com.stockapp.notificationservice.service.mapper.NotificationMapper;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing
 * {@link com.stockapp.notificationservice.domain.Notification}.
 */
@Service
public class NotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public NotificationService(NotificationRepository notificationRepository, NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    /**
     * Save a notification.
     *
     * @param notificationDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<NotificationDTO> save(NotificationDTO notificationDTO) {
        LOG.debug("Request to save Notification : {}", notificationDTO);
        return notificationRepository.save(notificationMapper.toEntity(notificationDTO)).map(notificationMapper::toDto);
    }

    /**
     * Save a notification entity directly.
     *
     * @param notification the entity to save.
     * @return the persisted entity.
     */
    public Mono<Notification> save(Notification notification) {
        LOG.debug("Request to save Notification entity: {}", notification);
        return notificationRepository.save(notification);
    }

    /**
     * Update a notification.
     *
     * @param notificationDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<NotificationDTO> update(NotificationDTO notificationDTO) {
        LOG.debug("Request to update Notification : {}", notificationDTO);
        return notificationRepository.save(notificationMapper.toEntity(notificationDTO)).map(notificationMapper::toDto);
    }

    /**
     * Partially update a notification.
     *
     * @param notificationDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<NotificationDTO> partialUpdate(NotificationDTO notificationDTO) {
        LOG.debug("Request to partially update Notification : {}", notificationDTO);

        return notificationRepository
                .findById(notificationDTO.getId())
                .map(existingNotification -> {
                    notificationMapper.partialUpdate(existingNotification, notificationDTO);
                    return existingNotification;
                })
                .flatMap(notificationRepository::save)
                .map(notificationMapper::toDto);
    }

    /**
     * Get all the notifications.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Flux<NotificationDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Notifications");
        return notificationRepository.findAllBy(pageable).map(notificationMapper::toDto);
    }

    /**
     * Returns the number of notifications available.
     *
     * @return the number of entities in the database.
     */
    public Mono<Long> countAll() {
        return notificationRepository.count();
    }

    /**
     * Get one notification by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<NotificationDTO> findOne(String id) {
        LOG.debug("Request to get Notification : {}", id);
        return notificationRepository.findById(id).map(notificationMapper::toDto);
    }

    /**
     * Delete the notification by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete Notification : {}", id);
        return notificationRepository.deleteById(id);
    }

    /**
     * Find notifications by recipient (legacy)
     *
     * @param recipient the recipient identifier
     * @param pageable  the pagination information
     * @return the list of entities
     */
    public Flux<NotificationDTO> findByRecipient(String recipient, Pageable pageable) {
        LOG.debug("Request to get Notifications by recipient : {}", recipient);
        return notificationRepository.findByRecipient(recipient, pageable).map(notificationMapper::toDto);
    }

    // ==================== New Methods for Notification Center ====================

    /**
     * Get notifications for a user with optional category filter.
     * Also includes broadcast notifications (_BROADCAST_).
     *
     * @param userId   the user identifier
     * @param category the notification category (optional)
     * @param pageable the pagination information
     * @return the list of notifications
     */
    public Flux<NotificationDTO> getNotifications(String userId, NotificationCategory category, Pageable pageable) {
        LOG.debug("Request to get Notifications for user: {}, category: {}", userId, category);

        if (category != null) {
            return notificationRepository
                    .findByUserIdOrBroadcastAndCategory(userId, category, pageable)
                    .map(notificationMapper::toDto);
        }

        return notificationRepository
                .findByUserIdOrBroadcast(userId, pageable)
                .map(notificationMapper::toDto);
    }

    /**
     * Get unread notifications for a user.
     * Also includes broadcast notifications (_BROADCAST_).
     *
     * @param userId   the user identifier
     * @param pageable the pagination information
     * @return the list of unread notifications
     */
    public Flux<NotificationDTO> getUnreadNotifications(String userId, Pageable pageable) {
        LOG.debug("Request to get unread Notifications for user: {}", userId);
        return notificationRepository
                .findByUserIdOrBroadcastAndUnread(userId, pageable)
                .map(notificationMapper::toDto);
    }

    /**
     * Get the count of unread notifications for a user.
     * Also includes broadcast notifications (_BROADCAST_).
     *
     * @param userId the user identifier
     * @return the count of unread notifications
     */
    public Mono<Long> getUnreadCount(String userId) {
        LOG.debug("Request to get unread count for user: {}", userId);
        return notificationRepository.countByUserIdOrBroadcastAndUnread(userId);
    }

    /**
     * Get the total count of notifications for a user.
     * Also includes broadcast notifications (_BROADCAST_).
     *
     * @param userId the user identifier
     * @return the total count of notifications
     */
    public Mono<Long> countByUserId(String userId) {
        LOG.debug("Request to get notification count for user: {}", userId);
        return notificationRepository.countByUserIdOrBroadcast(userId);
    }

    /**
     * Get the count of notifications for a user by category.
     * Also includes broadcast notifications (_BROADCAST_).
     *
     * @param userId   the user identifier
     * @param category the notification category
     * @return the count of notifications
     */
    public Mono<Long> countByUserIdAndCategory(String userId, NotificationCategory category) {
        LOG.debug("Request to get notification count for user: {}, category: {}", userId, category);
        return notificationRepository.countByUserIdOrBroadcastAndCategory(userId, category);
    }

    /**
     * Mark a notification as read.
     *
     * @param id the notification id
     * @return the updated notification
     */
    public Mono<NotificationDTO> markAsRead(String id) {
        LOG.debug("Request to mark Notification as read: {}", id);
        return notificationRepository
                .findById(id)
                .flatMap(notification -> {
                    notification.setRead(true);
                    notification.setReadAt(Instant.now());
                    return notificationRepository.save(notification);
                })
                .map(notificationMapper::toDto);
    }

    /**
     * Mark all notifications as read for a user.
     *
     * @param userId the user identifier
     * @return the count of updated notifications
     */
    public Mono<Long> markAllAsRead(String userId) {
        LOG.debug("Request to mark all Notifications as read for user: {}", userId);
        return notificationRepository
                .findByUserIdAndIsReadFalse(userId)
                .flatMap(notification -> {
                    notification.setRead(true);
                    notification.setReadAt(Instant.now());
                    return notificationRepository.save(notification);
                })
                .count();
    }
}
