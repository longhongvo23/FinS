package com.stockapp.crawlservice.domain;

import com.stockapp.crawlservice.domain.enumeration.JobStatus;
import com.stockapp.crawlservice.security.encryption.Encrypted;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A CrawlJobState.
 */
@Document(collection = "crawl_job_state")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CrawlJobState implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Indexed(unique = true)
    @Field("symbol")
    private String symbol;

    @Field("last_successful_timestamp")
    private Instant lastSuccessfulTimestamp;

    @Field("last_sync_status")
    private JobStatus lastSyncStatus;

    @Encrypted
    @Field("error_log")
    private String errorLog;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public CrawlJobState id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSymbol() {
        return this.symbol;
    }

    public CrawlJobState symbol(String symbol) {
        this.setSymbol(symbol);
        return this;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Instant getLastSuccessfulTimestamp() {
        return this.lastSuccessfulTimestamp;
    }

    public CrawlJobState lastSuccessfulTimestamp(Instant lastSuccessfulTimestamp) {
        this.setLastSuccessfulTimestamp(lastSuccessfulTimestamp);
        return this;
    }

    public void setLastSuccessfulTimestamp(Instant lastSuccessfulTimestamp) {
        this.lastSuccessfulTimestamp = lastSuccessfulTimestamp;
    }

    public JobStatus getLastSyncStatus() {
        return this.lastSyncStatus;
    }

    public CrawlJobState lastSyncStatus(JobStatus lastSyncStatus) {
        this.setLastSyncStatus(lastSyncStatus);
        return this;
    }

    public void setLastSyncStatus(JobStatus lastSyncStatus) {
        this.lastSyncStatus = lastSyncStatus;
    }

    public String getErrorLog() {
        return this.errorLog;
    }

    public CrawlJobState errorLog(String errorLog) {
        this.setErrorLog(errorLog);
        return this;
    }

    public void setErrorLog(String errorLog) {
        this.errorLog = errorLog;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CrawlJobState)) {
            return false;
        }
        return getId() != null && getId().equals(((CrawlJobState) o).getId());
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
        return "CrawlJobState{" +
                "id=" + getId() +
                ", symbol='" + getSymbol() + "'" +
                ", lastSuccessfulTimestamp='" + getLastSuccessfulTimestamp() + "'" +
                ", lastSyncStatus='" + getLastSyncStatus() + "'" +
                ", errorLog='" + getErrorLog() + "'" +
                "}";
    }
}
