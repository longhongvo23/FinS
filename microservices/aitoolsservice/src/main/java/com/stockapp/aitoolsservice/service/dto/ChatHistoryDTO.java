package com.stockapp.aitoolsservice.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.stockapp.aitoolsservice.domain.ChatHistory} entity.
 */
@Schema(description = "Chat History - Stores AI chat conversations\nFor RAG-based financial Q&A")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatHistoryDTO implements Serializable {

    private String id;

    @NotNull(message = "must not be null")
    private String userId;

    private String sessionId;

    private String userQuestion;

    private String botResponse;

    private String context;

    @NotNull(message = "must not be null")
    private Instant timestamp;

    private Integer tokensUsed;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserQuestion() {
        return userQuestion;
    }

    public void setUserQuestion(String userQuestion) {
        this.userQuestion = userQuestion;
    }

    public String getBotResponse() {
        return botResponse;
    }

    public void setBotResponse(String botResponse) {
        this.botResponse = botResponse;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getTokensUsed() {
        return tokensUsed;
    }

    public void setTokensUsed(Integer tokensUsed) {
        this.tokensUsed = tokensUsed;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChatHistoryDTO)) {
            return false;
        }

        ChatHistoryDTO chatHistoryDTO = (ChatHistoryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, chatHistoryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChatHistoryDTO{" +
            "id='" + getId() + "'" +
            ", userId='" + getUserId() + "'" +
            ", sessionId='" + getSessionId() + "'" +
            ", userQuestion='" + getUserQuestion() + "'" +
            ", botResponse='" + getBotResponse() + "'" +
            ", context='" + getContext() + "'" +
            ", timestamp='" + getTimestamp() + "'" +
            ", tokensUsed=" + getTokensUsed() +
            "}";
    }
}
