package com.stockapp.stockservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stockapp.stockservice.security.encryption.Encrypted;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Company.
 */
@Document(collection = "company")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Company implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Pattern(regexp = "^[A-Z0-9\\.]+$")
    @Field("symbol")
    private String symbol;

    @NotNull(message = "must not be null")
    @Field("name")
    private String name;

    @Field("country")
    private String country;

    @Field("currency")
    private String currency;

    @Field("exchange")
    private String exchange;

    @Field("finnhub_industry")
    private String finnhubIndustry;

    @Field("ipo")
    private LocalDate ipo;

    @Size(max = 2048)
    @Field("logo")
    private String logo;

    @DecimalMin(value = "0")
    @Field("market_capitalization")
    private BigDecimal marketCapitalization;

    @DecimalMin(value = "0")
    @Field("share_outstanding")
    private BigDecimal shareOutstanding;

    @Size(max = 2048)
    @Field("weburl")
    private String weburl;

    @Encrypted
    @Field("phone")
    private String phone;

    @Field("historicalPrices")
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private Set<HistoricalPrice> historicalPrices = new HashSet<>();

    @Field("financials")
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private Set<Financial> financials = new HashSet<>();

    @Field("recommendations")
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private Set<Recommendation> recommendations = new HashSet<>();

    @Field("peers")
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private Set<PeerCompany> peers = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public Company id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSymbol() {
        return this.symbol;
    }

    public Company symbol(String symbol) {
        this.setSymbol(symbol);
        return this;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return this.name;
    }

    public Company name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCountry() {
        return this.country;
    }

    public Company country(String country) {
        this.setCountry(country);
        return this;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCurrency() {
        return this.currency;
    }

    public Company currency(String currency) {
        this.setCurrency(currency);
        return this;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getExchange() {
        return this.exchange;
    }

    public Company exchange(String exchange) {
        this.setExchange(exchange);
        return this;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getFinnhubIndustry() {
        return this.finnhubIndustry;
    }

    public Company finnhubIndustry(String finnhubIndustry) {
        this.setFinnhubIndustry(finnhubIndustry);
        return this;
    }

    public void setFinnhubIndustry(String finnhubIndustry) {
        this.finnhubIndustry = finnhubIndustry;
    }

    public LocalDate getIpo() {
        return this.ipo;
    }

    public Company ipo(LocalDate ipo) {
        this.setIpo(ipo);
        return this;
    }

    public void setIpo(LocalDate ipo) {
        this.ipo = ipo;
    }

    public String getLogo() {
        return this.logo;
    }

    public Company logo(String logo) {
        this.setLogo(logo);
        return this;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public BigDecimal getMarketCapitalization() {
        return this.marketCapitalization;
    }

    public Company marketCapitalization(BigDecimal marketCapitalization) {
        this.setMarketCapitalization(marketCapitalization);
        return this;
    }

    public void setMarketCapitalization(BigDecimal marketCapitalization) {
        this.marketCapitalization = marketCapitalization;
    }

    public BigDecimal getShareOutstanding() {
        return this.shareOutstanding;
    }

    public Company shareOutstanding(BigDecimal shareOutstanding) {
        this.setShareOutstanding(shareOutstanding);
        return this;
    }

    public void setShareOutstanding(BigDecimal shareOutstanding) {
        this.shareOutstanding = shareOutstanding;
    }

    public String getWeburl() {
        return this.weburl;
    }

    public Company weburl(String weburl) {
        this.setWeburl(weburl);
        return this;
    }

    public void setWeburl(String weburl) {
        this.weburl = weburl;
    }

    public String getPhone() {
        return this.phone;
    }

    public Company phone(String phone) {
        this.setPhone(phone);
        return this;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Set<HistoricalPrice> getHistoricalPrices() {
        return this.historicalPrices;
    }

    public void setHistoricalPrices(Set<HistoricalPrice> historicalPrices) {
        if (this.historicalPrices != null) {
            this.historicalPrices.forEach(i -> i.setCompany(null));
        }
        if (historicalPrices != null) {
            historicalPrices.forEach(i -> i.setCompany(this));
        }
        this.historicalPrices = historicalPrices;
    }

    public Company historicalPrices(Set<HistoricalPrice> historicalPrices) {
        this.setHistoricalPrices(historicalPrices);
        return this;
    }

    public Company addHistoricalPrices(HistoricalPrice historicalPrice) {
        this.historicalPrices.add(historicalPrice);
        historicalPrice.setCompany(this);
        return this;
    }

    public Company removeHistoricalPrices(HistoricalPrice historicalPrice) {
        this.historicalPrices.remove(historicalPrice);
        historicalPrice.setCompany(null);
        return this;
    }

    public Set<Financial> getFinancials() {
        return this.financials;
    }

    public void setFinancials(Set<Financial> financials) {
        if (this.financials != null) {
            this.financials.forEach(i -> i.setCompany(null));
        }
        if (financials != null) {
            financials.forEach(i -> i.setCompany(this));
        }
        this.financials = financials;
    }

    public Company financials(Set<Financial> financials) {
        this.setFinancials(financials);
        return this;
    }

    public Company addFinancials(Financial financial) {
        this.financials.add(financial);
        financial.setCompany(this);
        return this;
    }

    public Company removeFinancials(Financial financial) {
        this.financials.remove(financial);
        financial.setCompany(null);
        return this;
    }

    public Set<Recommendation> getRecommendations() {
        return this.recommendations;
    }

    public void setRecommendations(Set<Recommendation> recommendations) {
        if (this.recommendations != null) {
            this.recommendations.forEach(i -> i.setCompany(null));
        }
        if (recommendations != null) {
            recommendations.forEach(i -> i.setCompany(this));
        }
        this.recommendations = recommendations;
    }

    public Company recommendations(Set<Recommendation> recommendations) {
        this.setRecommendations(recommendations);
        return this;
    }

    public Company addRecommendations(Recommendation recommendation) {
        this.recommendations.add(recommendation);
        recommendation.setCompany(this);
        return this;
    }

    public Company removeRecommendations(Recommendation recommendation) {
        this.recommendations.remove(recommendation);
        recommendation.setCompany(null);
        return this;
    }

    public Set<PeerCompany> getPeers() {
        return this.peers;
    }

    public void setPeers(Set<PeerCompany> peerCompanies) {
        if (this.peers != null) {
            this.peers.forEach(i -> i.setCompany(null));
        }
        if (peerCompanies != null) {
            peerCompanies.forEach(i -> i.setCompany(this));
        }
        this.peers = peerCompanies;
    }

    public Company peers(Set<PeerCompany> peerCompanies) {
        this.setPeers(peerCompanies);
        return this;
    }

    public Company addPeers(PeerCompany peerCompany) {
        this.peers.add(peerCompany);
        peerCompany.setCompany(this);
        return this;
    }

    public Company removePeers(PeerCompany peerCompany) {
        this.peers.remove(peerCompany);
        peerCompany.setCompany(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Company)) {
            return false;
        }
        return getId() != null && getId().equals(((Company) o).getId());
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
        return "Company{" +
                "id=" + getId() +
                ", symbol='" + getSymbol() + "'" +
                ", name='" + getName() + "'" +
                ", country='" + getCountry() + "'" +
                ", currency='" + getCurrency() + "'" +
                ", exchange='" + getExchange() + "'" +
                ", finnhubIndustry='" + getFinnhubIndustry() + "'" +
                ", ipo='" + getIpo() + "'" +
                ", logo='" + getLogo() + "'" +
                ", marketCapitalization=" + getMarketCapitalization() +
                ", shareOutstanding=" + getShareOutstanding() +
                ", weburl='" + getWeburl() + "'" +
                ", phone='" + getPhone() + "'" +
                "}";
    }
}
