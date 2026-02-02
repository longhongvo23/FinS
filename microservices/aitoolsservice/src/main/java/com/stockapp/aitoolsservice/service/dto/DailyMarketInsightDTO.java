package com.stockapp.aitoolsservice.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.stockapp.aitoolsservice.domain.DailyMarketInsight} entity.
 */
@Schema(description = "Daily Market Insight - Stores AI-generated daily market summary\nMatches UI Image 1 - Dashboard Overview")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DailyMarketInsightDTO implements Serializable {

    private String id;

    @NotNull(message = "must not be null")
    private LocalDate reportDate;

    private String marketTrend;

    private String summaryTitle;

    private String summaryContent;

    private String highlightsJson;

    @NotNull(message = "must not be null")
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getReportDate() {
        return reportDate;
    }

    public void setReportDate(LocalDate reportDate) {
        this.reportDate = reportDate;
    }

    public String getMarketTrend() {
        return marketTrend;
    }

    public void setMarketTrend(String marketTrend) {
        this.marketTrend = marketTrend;
    }

    public String getSummaryTitle() {
        return summaryTitle;
    }

    public void setSummaryTitle(String summaryTitle) {
        this.summaryTitle = summaryTitle;
    }

    public String getSummaryContent() {
        return summaryContent;
    }

    public void setSummaryContent(String summaryContent) {
        this.summaryContent = summaryContent;
    }

    public String getHighlightsJson() {
        return highlightsJson;
    }

    public void setHighlightsJson(String highlightsJson) {
        this.highlightsJson = highlightsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DailyMarketInsightDTO)) {
            return false;
        }

        DailyMarketInsightDTO dailyMarketInsightDTO = (DailyMarketInsightDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, dailyMarketInsightDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DailyMarketInsightDTO{" +
            "id='" + getId() + "'" +
            ", reportDate='" + getReportDate() + "'" +
            ", marketTrend='" + getMarketTrend() + "'" +
            ", summaryTitle='" + getSummaryTitle() + "'" +
            ", summaryContent='" + getSummaryContent() + "'" +
            ", highlightsJson='" + getHighlightsJson() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
