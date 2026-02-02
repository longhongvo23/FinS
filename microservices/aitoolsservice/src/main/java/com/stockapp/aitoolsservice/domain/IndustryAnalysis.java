package com.stockapp.aitoolsservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stockapp.aitoolsservice.domain.enumeration.Sentiment;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Industry Analysis - Sector-specific insights
 * Matches UI Image 1 - Industry Cards
 */
@Document(collection = "industry_analysis")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class IndustryAnalysis implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Field("report_date")
    private LocalDate reportDate;

    @NotNull(message = "must not be null")
    @Field("industry_name")
    private String industryName;

    @NotNull(message = "must not be null")
    @Field("sentiment")
    private Sentiment sentiment;

    @Field("summary")
    private String summary;

    @Field("related_stocks")
    private String relatedStocks;

    @NotNull(message = "must not be null")
    @Field("created_at")
    private Instant createdAt;

    @Field("dailyInsight")
    @JsonIgnoreProperties(value = { "industries" }, allowSetters = true)
    private DailyMarketInsight dailyInsight;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public IndustryAnalysis id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getReportDate() {
        return this.reportDate;
    }

    public IndustryAnalysis reportDate(LocalDate reportDate) {
        this.setReportDate(reportDate);
        return this;
    }

    public void setReportDate(LocalDate reportDate) {
        this.reportDate = reportDate;
    }

    public String getIndustryName() {
        return this.industryName;
    }

    public IndustryAnalysis industryName(String industryName) {
        this.setIndustryName(industryName);
        return this;
    }

    public void setIndustryName(String industryName) {
        this.industryName = industryName;
    }

    public Sentiment getSentiment() {
        return this.sentiment;
    }

    public IndustryAnalysis sentiment(Sentiment sentiment) {
        this.setSentiment(sentiment);
        return this;
    }

    public void setSentiment(Sentiment sentiment) {
        this.sentiment = sentiment;
    }

    public String getSummary() {
        return this.summary;
    }

    public IndustryAnalysis summary(String summary) {
        this.setSummary(summary);
        return this;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getRelatedStocks() {
        return this.relatedStocks;
    }

    public IndustryAnalysis relatedStocks(String relatedStocks) {
        this.setRelatedStocks(relatedStocks);
        return this;
    }

    public void setRelatedStocks(String relatedStocks) {
        this.relatedStocks = relatedStocks;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public IndustryAnalysis createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public DailyMarketInsight getDailyInsight() {
        return this.dailyInsight;
    }

    public void setDailyInsight(DailyMarketInsight dailyMarketInsight) {
        this.dailyInsight = dailyMarketInsight;
    }

    public IndustryAnalysis dailyInsight(DailyMarketInsight dailyMarketInsight) {
        this.setDailyInsight(dailyMarketInsight);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof IndustryAnalysis)) {
            return false;
        }
        return getId() != null && getId().equals(((IndustryAnalysis) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "IndustryAnalysis{" +
            "id=" + getId() +
            ", reportDate='" + getReportDate() + "'" +
            ", industryName='" + getIndustryName() + "'" +
            ", sentiment='" + getSentiment() + "'" +
            ", summary='" + getSummary() + "'" +
            ", relatedStocks='" + getRelatedStocks() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
