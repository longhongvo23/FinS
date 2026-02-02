package com.stockapp.aitoolsservice.service.dto;

import com.stockapp.aitoolsservice.domain.enumeration.Sentiment;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.stockapp.aitoolsservice.domain.IndustryAnalysis} entity.
 */
@Schema(description = "Industry Analysis - Sector-specific insights\nMatches UI Image 1 - Industry Cards")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class IndustryAnalysisDTO implements Serializable {

    private String id;

    @NotNull(message = "must not be null")
    private LocalDate reportDate;

    @NotNull(message = "must not be null")
    private String industryName;

    @NotNull(message = "must not be null")
    private Sentiment sentiment;

    private String summary;

    private String relatedStocks;

    @NotNull(message = "must not be null")
    private Instant createdAt;

    private DailyMarketInsightDTO dailyInsight;

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

    public String getIndustryName() {
        return industryName;
    }

    public void setIndustryName(String industryName) {
        this.industryName = industryName;
    }

    public Sentiment getSentiment() {
        return sentiment;
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = sentiment;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRelatedStocks() {
        return relatedStocks;
    }

    public void setRelatedStocks(String relatedStocks) {
        this.relatedStocks = relatedStocks;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public DailyMarketInsightDTO getDailyInsight() {
        return dailyInsight;
    }

    public void setDailyInsight(DailyMarketInsightDTO dailyInsight) {
        this.dailyInsight = dailyInsight;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof IndustryAnalysisDTO)) {
            return false;
        }

        IndustryAnalysisDTO industryAnalysisDTO = (IndustryAnalysisDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, industryAnalysisDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "IndustryAnalysisDTO{" +
            "id='" + getId() + "'" +
            ", reportDate='" + getReportDate() + "'" +
            ", industryName='" + getIndustryName() + "'" +
            ", sentiment='" + getSentiment() + "'" +
            ", summary='" + getSummary() + "'" +
            ", relatedStocks='" + getRelatedStocks() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", dailyInsight=" + getDailyInsight() +
            "}";
    }
}
