package com.stockapp.userservice.service.dto;

import com.stockapp.userservice.domain.enumeration.AccountStatus;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A DTO for the {@link com.stockapp.userservice.domain.AppUser} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AppUserDTO implements Serializable {

    private String id;

    @NotNull(message = "must not be null")
    @Size(min = 3)
    private String login;

    @NotNull(message = "must not be null")
    @Size(min = 4)
    private String password;

    @NotNull(message = "must not be null")
    @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    private String email;

    @NotNull(message = "must not be null")
    private Boolean activated;

    @NotNull(message = "must not be null")
    private AccountStatus accountStatus;

    @NotNull(message = "must not be null")
    private Boolean emailVerified;

    @NotNull(message = "must not be null")
    private Instant createdDate;

    private Instant lastModifiedDate;

    private Instant lastLoginDate;

    private Instant lastPasswordChangeDate;

    @Min(value = 0)
    @Max(value = 10)
    private Integer failedLoginAttempts;

    private Instant accountLockedUntil;

    @Size(max = 100)
    private String passwordResetToken;

    private Instant passwordResetTokenExpiry;

    @Size(max = 100)
    private String emailVerificationToken;

    private Instant emailVerificationTokenExpiry;

    @Size(max = 10485760) // 10MB limit for base64
    private String avatarUrl;

    @Size(max = 100)
    private String activationKey;

    @NotNull(message = "must not be null")
    private Boolean twoFactorEnabled;

    @Size(max = 64)
    private String twoFactorSecret;

    @Size(max = 45)
    private String lastLoginIp;

    @Size(max = 10)
    private String language;

    @Size(max = 50)
    private String timezone;

    private Set<AuthorityDTO> authorities = new HashSet<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getActivated() {
        return activated;
    }

    public void setActivated(Boolean activated) {
        this.activated = activated;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public Instant getLastLoginDate() {
        return lastLoginDate;
    }

    public void setLastLoginDate(Instant lastLoginDate) {
        this.lastLoginDate = lastLoginDate;
    }

    public Instant getLastPasswordChangeDate() {
        return lastPasswordChangeDate;
    }

    public void setLastPasswordChangeDate(Instant lastPasswordChangeDate) {
        this.lastPasswordChangeDate = lastPasswordChangeDate;
    }

    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public Instant getAccountLockedUntil() {
        return accountLockedUntil;
    }

    public void setAccountLockedUntil(Instant accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public Instant getPasswordResetTokenExpiry() {
        return passwordResetTokenExpiry;
    }

    public void setPasswordResetTokenExpiry(Instant passwordResetTokenExpiry) {
        this.passwordResetTokenExpiry = passwordResetTokenExpiry;
    }

    public String getEmailVerificationToken() {
        return emailVerificationToken;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public Instant getEmailVerificationTokenExpiry() {
        return emailVerificationTokenExpiry;
    }

    public void setEmailVerificationTokenExpiry(Instant emailVerificationTokenExpiry) {
        this.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
    }

    public String getActivationKey() {
        return activationKey;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    public Boolean getTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getTwoFactorSecret() {
        return twoFactorSecret;
    }

    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
    }

    public String getLastLoginIp() {
        return lastLoginIp;
    }

    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Set<AuthorityDTO> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<AuthorityDTO> authorities) {
        this.authorities = authorities;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    @Size(max = 100)
    private String fullName;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AppUserDTO)) {
            return false;
        }

        AppUserDTO appUserDTO = (AppUserDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, appUserDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AppUserDTO{" +
                "id='" + getId() + "'" +
                ", login='" + getLogin() + "'" +
                ", password='" + getPassword() + "'" +
                ", email='" + getEmail() + "'" +
                ", activated='" + getActivated() + "'" +
                ", accountStatus='" + getAccountStatus() + "'" +
                ", emailVerified='" + getEmailVerified() + "'" +
                ", createdDate='" + getCreatedDate() + "'" +
                ", lastModifiedDate='" + getLastModifiedDate() + "'" +
                ", lastLoginDate='" + getLastLoginDate() + "'" +
                ", lastPasswordChangeDate='" + getLastPasswordChangeDate() + "'" +
                ", failedLoginAttempts=" + getFailedLoginAttempts() +
                ", accountLockedUntil='" + getAccountLockedUntil() + "'" +
                ", passwordResetToken='" + getPasswordResetToken() + "'" +
                ", passwordResetTokenExpiry='" + getPasswordResetTokenExpiry() + "'" +
                ", emailVerificationToken='" + getEmailVerificationToken() + "'" +
                ", emailVerificationTokenExpiry='" + getEmailVerificationTokenExpiry() + "'" +
                ", twoFactorEnabled='" + getTwoFactorEnabled() + "'" +
                ", twoFactorSecret='" + getTwoFactorSecret() + "'" +
                ", lastLoginIp='" + getLastLoginIp() + "'" +
                ", language='" + getLanguage() + "'" +
                ", timezone='" + getTimezone() + "'" +
                ", authorities=" + getAuthorities() +
                "}";
    }
}
