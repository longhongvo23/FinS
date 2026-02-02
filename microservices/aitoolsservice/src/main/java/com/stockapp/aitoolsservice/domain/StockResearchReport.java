package com.stockapp.aitoolsservice.domain;

import com.stockapp.aitoolsservice.domain.enumeration.StockRecommendation;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Stock Research Report - AI-generated stock analysis with scores
 * Matches UI Image 2 - Research Detail Card
 */
@Document(collection = "stock_research_report")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class StockResearchReport implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Pattern(regexp = "^[A-Z0-9\\.]+$")
    @Field("symbol")
    private String symbol;

    @NotNull(message = "must not be null")
    @Field("created_date")
    private Instant createdDate;

    @NotNull(message = "must not be null")
    @Field("recommendation")
    private StockRecommendation recommendation;

    @Field("target_price")
    private BigDecimal targetPrice;

    @Field("current_price")
    private BigDecimal currentPrice;

    @Field("upside_percentage")
    private Float upsidePercentage;

    @Min(value = 0)
    @Max(value = 100)
    @Field("financial_score")
    private Integer financialScore;

    @Min(value = 0)
    @Max(value = 100)
    @Field("technical_score")
    private Integer technicalScore;

    @Min(value = 0)
    @Max(value = 100)
    @Field("sentiment_score")
    private Integer sentimentScore;

    @Min(value = 0)
    @Max(value = 100)
    @Field("overall_score")
    private Integer overallScore;

    @Field("analysis_summary")
    private String analysisSummary;

    @Field("key_factors")
    private String keyFactors;

    @Field("risk_factors")
    private String riskFactors;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public StockResearchReport id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSymbol() {
        return this.symbol;
    }

    public StockResearchReport symbol(String symbol) {
        this.setSymbol(symbol);
        return this;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Instant getCreatedDate() {
        return this.createdDate;
    }

    public StockResearchReport createdDate(Instant createdDate) {
        this.setCreatedDate(createdDate);
        return this;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public StockRecommendation getRecommendation() {
        return this.recommendation;
    }

    public StockResearchReport recommendation(StockRecommendation recommendation) {
        this.setRecommendation(recommendation);
        return this;
    }

    public void setRecommendation(StockRecommendation recommendation) {
        this.recommendation = recommendation;
    }

    public BigDecimal getTargetPrice() {
        return this.targetPrice;
    }

    public StockResearchReport targetPrice(BigDecimal targetPrice) {
        this.setTargetPrice(targetPrice);
        return this;
    }

    public void setTargetPrice(BigDecimal targetPrice) {
        this.targetPrice = targetPrice;
    }

    public BigDecimal getCurrentPrice() {
        return this.currentPrice;
    }

    public StockResearchReport currentPrice(BigDecimal currentPrice) {
        this.setCurrentPrice(currentPrice);
        return this;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Float getUpsidePercentage() {
        return this.upsidePercentage;
    }

    public StockResearchReport upsidePercentage(Float upsidePercentage) {
        this.setUpsidePercentage(upsidePercentage);
        return this;
    }

    public void setUpsidePercentage(Float upsidePercentage) {
        this.upsidePercentage = upsidePercentage;
    }

    public Integer getFinancialScore() {
        return this.financialScore;
    }

    public StockResearchReport financialScore(Integer financialScore) {
        this.setFinancialScore(financialScore);
        return this;
    }

    public void setFinancialScore(Integer financialScore) {
        this.financialScore = financialScore;
    }

    public Integer getTechnicalScore() {
        return this.technicalScore;
    }

    public StockResearchReport technicalScore(Integer technicalScore) {
        this.setTechnicalScore(technicalScore);
        return this;
    }

    public void setTechnicalScore(Integer technicalScore) {
        this.technicalScore = technicalScore;
    }

    public Integer getSentimentScore() {
        return this.sentimentScore;
    }

    public StockResearchReport sentimentScore(Integer sentimentScore) {
        this.setSentimentScore(sentimentScore);
        return this;
    }

    public void setSentimentScore(Integer sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public Integer getOverallScore() {
        return this.overallScore;
    }

    public StockResearchReport overallScore(Integer overallScore) {
        this.setOverallScore(overallScore);
        return this;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public String getAnalysisSummary() {
        return this.analysisSummary;
    }

    public StockResearchReport analysisSummary(String analysisSummary) {
        this.setAnalysisSummary(analysisSummary);
        return this;
    }

    public void setAnalysisSummary(String analysisSummary) {
        this.analysisSummary = analysisSummary;
    }

    public String getKeyFactors() {
        return this.keyFactors;
    }

    public StockResearchReport keyFactors(String keyFactors) {
        this.setKeyFactors(keyFactors);
        return this;
    }

    public void setKeyFactors(String keyFactors) {
        this.keyFactors = keyFactors;
    }

    public String getRiskFactors() {
        return this.riskFactors;
    }

    public StockResearchReport riskFactors(String riskFactors) {
        this.setRiskFactors(riskFactors);
        return this;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StockResearchReport)) {
            return false;
        }
        return getId() != null && getId().equals(((StockResearchReport) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "StockResearchReport{" +
            "id=" + getId() +
            ", symbol='" + getSymbol() + "'" +
            ", createdDate='" + getCreatedDate() + "'" +
            ", recommendation='" + getRecommendation() + "'" +
            ", targetPrice=" + getTargetPrice() +
            ", currentPrice=" + getCurrentPrice() +
            ", upsidePercentage=" + getUpsidePercentage() +
            ", financialScore=" + getFinancialScore() +
            ", technicalScore=" + getTechnicalScore() +
            ", sentimentScore=" + getSentimentScore() +
            ", overallScore=" + getOverallScore() +
            ", analysisSummary='" + getAnalysisSummary() + "'" +
            ", keyFactors='" + getKeyFactors() + "'" +
            ", riskFactors='" + getRiskFactors() + "'" +
            "}";
    }
}
