package com.stockapp.aitoolsservice.service.dto;

import com.stockapp.aitoolsservice.domain.enumeration.StockRecommendation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.stockapp.aitoolsservice.domain.StockResearchReport} entity.
 */
@Schema(description = "Stock Research Report - AI-generated stock analysis with scores\nMatches UI Image 2 - Research Detail Card")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class StockResearchReportDTO implements Serializable {

    private String id;

    @NotNull(message = "must not be null")
    @Pattern(regexp = "^[A-Z0-9\\.]+$")
    private String symbol;

    @NotNull(message = "must not be null")
    private Instant createdDate;

    @NotNull(message = "must not be null")
    private StockRecommendation recommendation;

    private BigDecimal targetPrice;

    private BigDecimal currentPrice;

    private Float upsidePercentage;

    @Min(value = 0)
    @Max(value = 100)
    private Integer financialScore;

    @Min(value = 0)
    @Max(value = 100)
    private Integer technicalScore;

    @Min(value = 0)
    @Max(value = 100)
    private Integer sentimentScore;

    @Min(value = 0)
    @Max(value = 100)
    private Integer overallScore;

    private String analysisSummary;

    private String keyFactors;

    private String riskFactors;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public StockRecommendation getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(StockRecommendation recommendation) {
        this.recommendation = recommendation;
    }

    public BigDecimal getTargetPrice() {
        return targetPrice;
    }

    public void setTargetPrice(BigDecimal targetPrice) {
        this.targetPrice = targetPrice;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Float getUpsidePercentage() {
        return upsidePercentage;
    }

    public void setUpsidePercentage(Float upsidePercentage) {
        this.upsidePercentage = upsidePercentage;
    }

    public Integer getFinancialScore() {
        return financialScore;
    }

    public void setFinancialScore(Integer financialScore) {
        this.financialScore = financialScore;
    }

    public Integer getTechnicalScore() {
        return technicalScore;
    }

    public void setTechnicalScore(Integer technicalScore) {
        this.technicalScore = technicalScore;
    }

    public Integer getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(Integer sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public String getAnalysisSummary() {
        return analysisSummary;
    }

    public void setAnalysisSummary(String analysisSummary) {
        this.analysisSummary = analysisSummary;
    }

    public String getKeyFactors() {
        return keyFactors;
    }

    public void setKeyFactors(String keyFactors) {
        this.keyFactors = keyFactors;
    }

    public String getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StockResearchReportDTO)) {
            return false;
        }

        StockResearchReportDTO stockResearchReportDTO = (StockResearchReportDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, stockResearchReportDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "StockResearchReportDTO{" +
            "id='" + getId() + "'" +
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
