package com.stockapp.notificationservice.domain;

import com.stockapp.notificationservice.domain.enumeration.NotificationCategory;
import com.stockapp.notificationservice.domain.enumeration.NotificationStatus;
import com.stockapp.notificationservice.domain.enumeration.NotificationType;
import com.stockapp.notificationservice.security.encryption.Encrypted;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Notification entity for the Notification Center.
 */
@Document(collection = "notification")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Notification implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    /**
     * User identifier for the notification recipient
     */
    @NotNull(message = "must not be null")
    @Indexed
    @Encrypted
    @Field("user_id")
    private String userId;

    /**
     * Notification title for display
     */
    @NotNull(message = "must not be null")
    @Field("title")
    private String title;

    /**
     * Notification content/body
     */
    @Encrypted
    @Field("content")
    private String content;

    /**
     * Whether the notification has been read
     */
    @Field("is_read")
    private boolean isRead = false;

    /**
     * Category for UI tab filtering (SYSTEM, PRICE_ALERT, AI_INSIGHT, NEWS)
     */
    @NotNull(message = "must not be null")
    @Indexed
    @Field("category")
    private NotificationCategory category;

    /**
     * Legacy type field for delivery method (EMAIL, PUSH, SMS, IN_APP)
     */
    @Field("type")
    private NotificationType type;

    /**
     * Status of sending the notification
     */
    @Field("status")
    private NotificationStatus status;

    /**
     * Email recipient (for EMAIL type)
     */
    @Encrypted
    @Field("recipient")
    private String recipient;

    /**
     * Subject line (for EMAIL type)
     */
    @Field("subject")
    private String subject;

    /**
     * Timestamp when notification was created
     */
    @NotNull(message = "must not be null")
    @Indexed
    @Field("created_at")
    private Instant createdAt;

    /**
     * Timestamp when notification was sent
     */
    @Field("sent_at")
    private Instant sentAt;

    /**
     * Timestamp when notification was read
     */
    @Field("read_at")
    private Instant readAt;

    /**
     * Error message if sending failed
     */
    @Field("error_message")
    private String errorMessage;

    /**
     * Additional metadata as JSON string
     */
    @Field("metadata")
    private String metadata;

    // Getters and Setters

    public String getId() {
        return this.id;
    }

    public Notification id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return this.userId;
    }

    public Notification userId(String userId) {
        this.setUserId(userId);
        return this;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return this.title;
    }

    public Notification title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return this.content;
    }

    public Notification content(String content) {
        this.setContent(content);
        return this;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isRead() {
        return this.isRead;
    }

    public Notification isRead(boolean isRead) {
        this.setRead(isRead);
        return this;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public NotificationCategory getCategory() {
        return this.category;
    }

    public Notification category(NotificationCategory category) {
        this.setCategory(category);
        return this;
    }

    public void setCategory(NotificationCategory category) {
        this.category = category;
    }

    public NotificationType getType() {
        return this.type;
    }

    public Notification type(NotificationType type) {
        this.setType(type);
        return this;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public NotificationStatus getStatus() {
        return this.status;
    }

    public Notification status(NotificationStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public String getRecipient() {
        return this.recipient;
    }

    public Notification recipient(String recipient) {
        this.setRecipient(recipient);
        return this;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return this.subject;
    }

    public Notification subject(String subject) {
        this.setSubject(subject);
        return this;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Notification createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getSentAt() {
        return this.sentAt;
    }

    public Notification sentAt(Instant sentAt) {
        this.setSentAt(sentAt);
        return this;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public Instant getReadAt() {
        return this.readAt;
    }

    public Notification readAt(Instant readAt) {
        this.setReadAt(readAt);
        return this;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public String getErrorMessage() {
        return this.errorMessage;
    }

    public Notification errorMessage(String errorMessage) {
        this.setErrorMessage(errorMessage);
        return this;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getMetadata() {
        return this.metadata;
    }

    public Notification metadata(String metadata) {
        this.setMetadata(metadata);
        return this;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Notification)) {
            return false;
        }
        return getId() != null && getId().equals(((Notification) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Notification{" +
                "id=" + getId() +
                ", userId='" + getUserId() + "'" +
                ", title='" + getTitle() + "'" +
                ", content='" + getContent() + "'" +
                ", isRead=" + isRead() +
                ", category='" + getCategory() + "'" +
                ", type='" + getType() + "'" +
                ", status='" + getStatus() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                "}";
    }
}
