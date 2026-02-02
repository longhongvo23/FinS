package com.stockapp.userservice.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link com.stockapp.userservice.domain.UserProfile} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserProfileDTO implements Serializable {

    private String id;

    @Pattern(regexp = "^[0-9\\-\\+]{9,15}$")
    private String phoneNumber;

    private Boolean phoneVerified;

    @Size(max = 100)
    private String country;

    @Size(max = 200)
    private String fullName;

    @Size(max = 5242880) // 5MB
    private String avatarUrl;

    private LocalDate dateOfBirth;

    @Size(max = 500)
    private String bio;

    @Size(max = 20)
    private String profileVisibility;

    private Boolean showEmail;

    private Boolean showPhone;

    // Investment profile fields
    @Size(max = 20)
    private String riskTolerance;

    @Size(max = 20)
    private String investmentGoal;

    @Size(max = 20)
    private String investmentExperience;

    private AppUserDTO user;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Boolean getPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(Boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfileVisibility() {
        return profileVisibility;
    }

    public void setProfileVisibility(String profileVisibility) {
        this.profileVisibility = profileVisibility;
    }

    public Boolean getShowEmail() {
        return showEmail;
    }

    public void setShowEmail(Boolean showEmail) {
        this.showEmail = showEmail;
    }

    public Boolean getShowPhone() {
        return showPhone;
    }

    public void setShowPhone(Boolean showPhone) {
        this.showPhone = showPhone;
    }

    // Investment profile getters and setters

    public String getRiskTolerance() {
        return riskTolerance;
    }

    public void setRiskTolerance(String riskTolerance) {
        this.riskTolerance = riskTolerance;
    }

    public String getInvestmentGoal() {
        return investmentGoal;
    }

    public void setInvestmentGoal(String investmentGoal) {
        this.investmentGoal = investmentGoal;
    }

    public String getInvestmentExperience() {
        return investmentExperience;
    }

    public void setInvestmentExperience(String investmentExperience) {
        this.investmentExperience = investmentExperience;
    }

    public AppUserDTO getUser() {
        return user;
    }

    public void setUser(AppUserDTO user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserProfileDTO)) {
            return false;
        }

        UserProfileDTO userProfileDTO = (UserProfileDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, userProfileDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserProfileDTO{" +
                "id='" + getId() + "'" +
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
                ", user=" + getUser() +
                "}";
    }
}
