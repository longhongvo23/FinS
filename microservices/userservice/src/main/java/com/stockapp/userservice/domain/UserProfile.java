package com.stockapp.userservice.domain;

import com.stockapp.userservice.security.encryption.Encrypted;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A UserProfile.
 */
@Document(collection = "user_profile")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Pattern(regexp = "^[0-9\\-\\+]{9,15}$")
    @Encrypted(reason = "PII - Personal phone number")
    @Field("phone_number")
    private String phoneNumber;

    @Field("phone_verified")
    private Boolean phoneVerified;

    @Size(max = 100)
    @Field("country")
    private String country;

    @Size(max = 200)
    @Encrypted(reason = "PII - Personal name")
    @Field("full_name")
    private String fullName;

    @Size(max = 5242880) // 5MB
    @Field("avatar_url")
    private String avatarUrl;

    @Field("date_of_birth")
    private LocalDate dateOfBirth;

    @Size(max = 500)
    @Encrypted(reason = "Personal information")
    @Field("bio")
    private String bio;

    @Size(max = 20)
    @Field("profile_visibility")
    private String profileVisibility;

    @Field("show_email")
    private Boolean showEmail;

    @Field("show_phone")
    private Boolean showPhone;

    // Investment profile fields
    @Size(max = 20)
    @Field("risk_tolerance")
    private String riskTolerance;

    @Size(max = 20)
    @Field("investment_goal")
    private String investmentGoal;

    @Size(max = 20)
    @Field("investment_experience")
    private String investmentExperience;

    @Field("user")
    private AppUser user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public UserProfile id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    public UserProfile phoneNumber(String phoneNumber) {
        this.setPhoneNumber(phoneNumber);
        return this;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Boolean getPhoneVerified() {
        return this.phoneVerified;
    }

    public UserProfile phoneVerified(Boolean phoneVerified) {
        this.setPhoneVerified(phoneVerified);
        return this;
    }

    public void setPhoneVerified(Boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public String getCountry() {
        return this.country;
    }

    public UserProfile country(String country) {
        this.setCountry(country);
        return this;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getFullName() {
        return this.fullName;
    }

    public UserProfile fullName(String fullName) {
        this.setFullName(fullName);
        return this;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return this.avatarUrl;
    }

    public UserProfile avatarUrl(String avatarUrl) {
        this.setAvatarUrl(avatarUrl);
        return this;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

    public UserProfile dateOfBirth(LocalDate dateOfBirth) {
        this.setDateOfBirth(dateOfBirth);
        return this;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getBio() {
        return this.bio;
    }

    public UserProfile bio(String bio) {
        this.setBio(bio);
        return this;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfileVisibility() {
        return this.profileVisibility;
    }

    public UserProfile profileVisibility(String profileVisibility) {
        this.setProfileVisibility(profileVisibility);
        return this;
    }

    public void setProfileVisibility(String profileVisibility) {
        this.profileVisibility = profileVisibility;
    }

    public Boolean getShowEmail() {
        return this.showEmail;
    }

    public UserProfile showEmail(Boolean showEmail) {
        this.setShowEmail(showEmail);
        return this;
    }

    public void setShowEmail(Boolean showEmail) {
        this.showEmail = showEmail;
    }

    public Boolean getShowPhone() {
        return this.showPhone;
    }

    public UserProfile showPhone(Boolean showPhone) {
        this.setShowPhone(showPhone);
        return this;
    }

    public void setShowPhone(Boolean showPhone) {
        this.showPhone = showPhone;
    }

    // Investment profile getters and setters

    public String getRiskTolerance() {
        return this.riskTolerance;
    }

    public UserProfile riskTolerance(String riskTolerance) {
        this.setRiskTolerance(riskTolerance);
        return this;
    }

    public void setRiskTolerance(String riskTolerance) {
        this.riskTolerance = riskTolerance;
    }

    public String getInvestmentGoal() {
        return this.investmentGoal;
    }

    public UserProfile investmentGoal(String investmentGoal) {
        this.setInvestmentGoal(investmentGoal);
        return this;
    }

    public void setInvestmentGoal(String investmentGoal) {
        this.investmentGoal = investmentGoal;
    }

    public String getInvestmentExperience() {
        return this.investmentExperience;
    }

    public UserProfile investmentExperience(String investmentExperience) {
        this.setInvestmentExperience(investmentExperience);
        return this;
    }

    public void setInvestmentExperience(String investmentExperience) {
        this.investmentExperience = investmentExperience;
    }

    public AppUser getUser() {
        return this.user;
    }

    public void setUser(AppUser appUser) {
        this.user = appUser;
    }

    public UserProfile user(AppUser appUser) {
        this.setUser(appUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserProfile)) {
            return false;
        }
        return getId() != null && getId().equals(((UserProfile) o).getId());
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
        return "UserProfile{" +
                "id=" + getId() +
                ", phoneNumber='" + getPhoneNumber() + "'" +
                ", phoneVerified='" + getPhoneVerified() + "'" +
                ", country='" + getCountry() + "'" +
                ", fullName='" + getFullName() + "'" +
                ", avatarUrl='" + getAvatarUrl() + "'" +
                ", dateOfBirth='" + getDateOfBirth() + "'" +
                ", bio='" + getBio() + "'" +
                ", profileVisibility='" + getProfileVisibility() + "'" +
                ", showEmail='" + getShowEmail() + "'" +
                ", showPhone='" + getShowPhone() + "'" +
                "}";
    }
}
