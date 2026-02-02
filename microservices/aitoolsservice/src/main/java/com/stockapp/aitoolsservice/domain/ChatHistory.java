package com.stockapp.aitoolsservice.domain;

import com.stockapp.aitoolsservice.security.encryption.Encrypted;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Chat History - Stores AI chat conversations
 * For RAG-based financial Q&A
 */
@Document(collection = "chat_history")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Encrypted
    @Field("user_id")
    private String userId;

    @Encrypted
    @Field("session_id")
    private String sessionId;

    @Encrypted
    @Field("user_question")
    private String userQuestion;

    @Encrypted
    @Field("bot_response")
    private String botResponse;

    @Encrypted
    @Field("context")
    private String context;

    @NotNull(message = "must not be null")
    @Field("timestamp")
    private Instant timestamp;

    @Field("tokens_used")
    private Integer tokensUsed;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public ChatHistory id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return this.userId;
    }

    public ChatHistory userId(String userId) {
        this.setUserId(userId);
        return this;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSessionId() {
        return this.sessionId;
    }

    public ChatHistory sessionId(String sessionId) {
        this.setSessionId(sessionId);
        return this;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserQuestion() {
        return this.userQuestion;
    }

    public ChatHistory userQuestion(String userQuestion) {
        this.setUserQuestion(userQuestion);
        return this;
    }

    public void setUserQuestion(String userQuestion) {
        this.userQuestion = userQuestion;
    }

    public String getBotResponse() {
        return this.botResponse;
    }

    public ChatHistory botResponse(String botResponse) {
        this.setBotResponse(botResponse);
        return this;
    }

    public void setBotResponse(String botResponse) {
        this.botResponse = botResponse;
    }

    public String getContext() {
        return this.context;
    }

    public ChatHistory context(String context) {
        this.setContext(context);
        return this;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public Instant getTimestamp() {
        return this.timestamp;
    }

    public ChatHistory timestamp(Instant timestamp) {
        this.setTimestamp(timestamp);
        return this;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getTokensUsed() {
        return this.tokensUsed;
    }

    public ChatHistory tokensUsed(Integer tokensUsed) {
        this.setTokensUsed(tokensUsed);
        return this;
    }

    public void setTokensUsed(Integer tokensUsed) {
        this.tokensUsed = tokensUsed;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChatHistory)) {
            return false;
        }
        return getId() != null && getId().equals(((ChatHistory) o).getId());
    }

    @Override
    public int hashCode() {
        // see
        // https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChatHistory{" +
                "id=" + getId() +
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
