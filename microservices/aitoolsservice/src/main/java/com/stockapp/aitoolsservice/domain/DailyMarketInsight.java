package com.stockapp.aitoolsservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Daily Market Insight - Stores AI-generated daily market summary
 * Matches UI Image 1 - Dashboard Overview
 */
@Document(collection = "daily_market_insight")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DailyMarketInsight implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Field("report_date")
    private LocalDate reportDate;

    @Field("market_trend")
    private String marketTrend;

    @Field("summary_title")
    private String summaryTitle;

    @Field("summary_content")
    private String summaryContent;

    @Field("highlights_json")
    private String highlightsJson;

    @NotNull(message = "must not be null")
    @Field("created_at")
    private Instant createdAt;

    @Field("industries")
    @JsonIgnoreProperties(value = { "dailyInsight" }, allowSetters = true)
    private Set<IndustryAnalysis> industries = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public DailyMarketInsight id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getReportDate() {
        return this.reportDate;
    }

    public DailyMarketInsight reportDate(LocalDate reportDate) {
        this.setReportDate(reportDate);
        return this;
    }

    public void setReportDate(LocalDate reportDate) {
        this.reportDate = reportDate;
    }

    public String getMarketTrend() {
        return this.marketTrend;
    }

    public DailyMarketInsight marketTrend(String marketTrend) {
        this.setMarketTrend(marketTrend);
        return this;
    }

    public void setMarketTrend(String marketTrend) {
        this.marketTrend = marketTrend;
    }

    public String getSummaryTitle() {
        return this.summaryTitle;
    }

    public DailyMarketInsight summaryTitle(String summaryTitle) {
        this.setSummaryTitle(summaryTitle);
        return this;
    }

    public void setSummaryTitle(String summaryTitle) {
        this.summaryTitle = summaryTitle;
    }

    public String getSummaryContent() {
        return this.summaryContent;
    }

    public DailyMarketInsight summaryContent(String summaryContent) {
        this.setSummaryContent(summaryContent);
        return this;
    }

    public void setSummaryContent(String summaryContent) {
        this.summaryContent = summaryContent;
    }

    public String getHighlightsJson() {
        return this.highlightsJson;
    }

    public DailyMarketInsight highlightsJson(String highlightsJson) {
        this.setHighlightsJson(highlightsJson);
        return this;
    }

    public void setHighlightsJson(String highlightsJson) {
        this.highlightsJson = highlightsJson;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public DailyMarketInsight createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Set<IndustryAnalysis> getIndustries() {
        return this.industries;
    }

    public void setIndustries(Set<IndustryAnalysis> industryAnalyses) {
        if (this.industries != null) {
            this.industries.forEach(i -> i.setDailyInsight(null));
        }
        if (industryAnalyses != null) {
            industryAnalyses.forEach(i -> i.setDailyInsight(this));
        }
        this.industries = industryAnalyses;
    }

    public DailyMarketInsight industries(Set<IndustryAnalysis> industryAnalyses) {
        this.setIndustries(industryAnalyses);
        return this;
    }

    public DailyMarketInsight addIndustries(IndustryAnalysis industryAnalysis) {
        this.industries.add(industryAnalysis);
        industryAnalysis.setDailyInsight(this);
        return this;
    }

    public DailyMarketInsight removeIndustries(IndustryAnalysis industryAnalysis) {
        this.industries.remove(industryAnalysis);
        industryAnalysis.setDailyInsight(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DailyMarketInsight)) {
            return false;
        }
        return getId() != null && getId().equals(((DailyMarketInsight) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DailyMarketInsight{" +
            "id=" + getId() +
            ", reportDate='" + getReportDate() + "'" +
            ", marketTrend='" + getMarketTrend() + "'" +
            ", summaryTitle='" + getSummaryTitle() + "'" +
            ", summaryContent='" + getSummaryContent() + "'" +
            ", highlightsJson='" + getHighlightsJson() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
