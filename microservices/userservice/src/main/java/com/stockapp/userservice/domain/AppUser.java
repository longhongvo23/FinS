package com.stockapp.userservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stockapp.userservice.domain.enumeration.AccountStatus;
import com.stockapp.userservice.security.encryption.Encrypted;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A AppUser.
 */
@Document(collection = "app_user")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AppUser implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Size(min = 3)
    @Field("login")
    private String login;

    @NotNull(message = "must not be null")
    @Size(min = 4)
    @Field("password")
    private String password;

    // NOTE: email is NOT encrypted because it's used for login authentication
    // and needs to be queried directly via findByEmail()
    @NotNull(message = "must not be null")
    @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
    @Field("email")
    private String email;

    @NotNull(message = "must not be null")
    @Field("activated")
    private Boolean activated;

    @NotNull(message = "must not be null")
    @Field("account_status")
    private AccountStatus accountStatus;

    @NotNull(message = "must not be null")
    @Field("email_verified")
    private Boolean emailVerified;

    @NotNull(message = "must not be null")
    @Field("created_date")
    private Instant createdDate;

    @Field("last_modified_date")
    private Instant lastModifiedDate;

    @Field("last_login_date")
    private Instant lastLoginDate;

    @Field("last_password_change_date")
    private Instant lastPasswordChangeDate;

    @Min(value = 0)
    @Max(value = 10)
    @Field("failed_login_attempts")
    private Integer failedLoginAttempts;

    @Field("account_locked_until")
    private Instant accountLockedUntil;

    // NOTE: password_reset_token is NOT encrypted because it needs to be queried
    // directly
    // Security: Token is random UUID with expiry, one-time use only
    @Size(max = 100)
    @Field("password_reset_token")
    private String passwordResetToken;

    @Field("password_reset_token_expiry")
    private Instant passwordResetTokenExpiry;

    // NOTE: email_verification_token is NOT encrypted because it needs to be
    // queried directly
    // Security: Token is random UUID with expiry, one-time use only
    @Size(max = 100)
    @Field("email_verification_token")
    private String emailVerificationToken;

    @Field("email_verification_token_expiry")
    private Instant emailVerificationTokenExpiry;

    // NOTE: activation_key is NOT encrypted because it needs to be queried directly
    // Security: Key is random UUID, one-time use only
    @Size(max = 100)
    @Field("activation_key")
    private String activationKey;

    @NotNull(message = "must not be null")
    @Field("two_factor_enabled")
    private Boolean twoFactorEnabled;

    @Size(max = 64)
    @Encrypted(reason = "2FA secret - critical security data")
    @Field("two_factor_secret")
    private String twoFactorSecret;

    @Size(max = 45)
    @Encrypted(reason = "PII - IP address can identify user location")
    @Field("last_login_ip")
    private String lastLoginIp;

    @Size(max = 10)
    @Field("language")
    private String language;

    @Size(max = 50)
    @Field("timezone")
    private String timezone;

    @Field("authorities")
    @JsonIgnoreProperties(value = { "users" }, allowSetters = true)
    private Set<Authority> authorities = new HashSet<>();

    private UserProfile profile;

    private NotificationSetting notificationSetting;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public AppUser id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLogin() {
        return this.login;
    }

    public AppUser login(String login) {
        this.setLogin(login);
        return this;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return this.password;
    }

    public AppUser password(String password) {
        this.setPassword(password);
        return this;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return this.email;
    }

    public AppUser email(String email) {
        this.setEmail(email);
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getActivated() {
        return this.activated;
    }

    public AppUser activated(Boolean activated) {
        this.setActivated(activated);
        return this;
    }

    public void setActivated(Boolean activated) {
        this.activated = activated;
    }

    public AccountStatus getAccountStatus() {
        return this.accountStatus;
    }

    public AppUser accountStatus(AccountStatus accountStatus) {
        this.setAccountStatus(accountStatus);
        return this;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public Boolean getEmailVerified() {
        return this.emailVerified;
    }

    public AppUser emailVerified(Boolean emailVerified) {
        this.setEmailVerified(emailVerified);
        return this;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public Instant getCreatedDate() {
        return this.createdDate;
    }

    public AppUser createdDate(Instant createdDate) {
        this.setCreatedDate(createdDate);
        return this;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public Instant getLastModifiedDate() {
        return this.lastModifiedDate;
    }

    public AppUser lastModifiedDate(Instant lastModifiedDate) {
        this.setLastModifiedDate(lastModifiedDate);
        return this;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public Instant getLastLoginDate() {
        return this.lastLoginDate;
    }

    public AppUser lastLoginDate(Instant lastLoginDate) {
        this.setLastLoginDate(lastLoginDate);
        return this;
    }

    public void setLastLoginDate(Instant lastLoginDate) {
        this.lastLoginDate = lastLoginDate;
    }

    public Instant getLastPasswordChangeDate() {
        return this.lastPasswordChangeDate;
    }

    public AppUser lastPasswordChangeDate(Instant lastPasswordChangeDate) {
        this.setLastPasswordChangeDate(lastPasswordChangeDate);
        return this;
    }

    public void setLastPasswordChangeDate(Instant lastPasswordChangeDate) {
        this.lastPasswordChangeDate = lastPasswordChangeDate;
    }

    public Integer getFailedLoginAttempts() {
        return this.failedLoginAttempts;
    }

    public AppUser failedLoginAttempts(Integer failedLoginAttempts) {
        this.setFailedLoginAttempts(failedLoginAttempts);
        return this;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public Instant getAccountLockedUntil() {
        return this.accountLockedUntil;
    }

    public AppUser accountLockedUntil(Instant accountLockedUntil) {
        this.setAccountLockedUntil(accountLockedUntil);
        return this;
    }

    public void setAccountLockedUntil(Instant accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }

    public String getPasswordResetToken() {
        return this.passwordResetToken;
    }

    public AppUser passwordResetToken(String passwordResetToken) {
        this.setPasswordResetToken(passwordResetToken);
        return this;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public Instant getPasswordResetTokenExpiry() {
        return this.passwordResetTokenExpiry;
    }

    public AppUser passwordResetTokenExpiry(Instant passwordResetTokenExpiry) {
        this.setPasswordResetTokenExpiry(passwordResetTokenExpiry);
        return this;
    }

    public void setPasswordResetTokenExpiry(Instant passwordResetTokenExpiry) {
        this.passwordResetTokenExpiry = passwordResetTokenExpiry;
    }

    public String getEmailVerificationToken() {
        return this.emailVerificationToken;
    }

    public AppUser emailVerificationToken(String emailVerificationToken) {
        this.setEmailVerificationToken(emailVerificationToken);
        return this;
    }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken;
    }

    public Instant getEmailVerificationTokenExpiry() {
        return this.emailVerificationTokenExpiry;
    }

    public AppUser emailVerificationTokenExpiry(Instant emailVerificationTokenExpiry) {
        this.setEmailVerificationTokenExpiry(emailVerificationTokenExpiry);
        return this;
    }

    public void setEmailVerificationTokenExpiry(Instant emailVerificationTokenExpiry) {
        this.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
    }

    public String getActivationKey() {
        return this.activationKey;
    }

    public AppUser activationKey(String activationKey) {
        this.setActivationKey(activationKey);
        return this;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    public Boolean getTwoFactorEnabled() {
        return this.twoFactorEnabled;
    }

    public AppUser twoFactorEnabled(Boolean twoFactorEnabled) {
        this.setTwoFactorEnabled(twoFactorEnabled);
        return this;
    }

    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getTwoFactorSecret() {
        return this.twoFactorSecret;
    }

    public AppUser twoFactorSecret(String twoFactorSecret) {
        this.setTwoFactorSecret(twoFactorSecret);
        return this;
    }

    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
    }

    public String getLastLoginIp() {
        return this.lastLoginIp;
    }

    public AppUser lastLoginIp(String lastLoginIp) {
        this.setLastLoginIp(lastLoginIp);
        return this;
    }

    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }

    public String getLanguage() {
        return this.language;
    }

    public AppUser language(String language) {
        this.setLanguage(language);
        return this;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTimezone() {
        return this.timezone;
    }

    public AppUser timezone(String timezone) {
        this.setTimezone(timezone);
        return this;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Set<Authority> getAuthorities() {
        return this.authorities;
    }

    public void setAuthorities(Set<Authority> authorities) {
        this.authorities = authorities;
    }

    public AppUser authorities(Set<Authority> authorities) {
        this.setAuthorities(authorities);
        return this;
    }

    public AppUser addAuthorities(Authority authority) {
        this.authorities.add(authority);
        return this;
    }

    public AppUser removeAuthorities(Authority authority) {
        this.authorities.remove(authority);
        return this;
    }

    public UserProfile getProfile() {
        return this.profile;
    }

    public void setProfile(UserProfile userProfile) {
        if (this.profile != null) {
            this.profile.setUser(null);
        }
        if (userProfile != null) {
            userProfile.setUser(this);
        }
        this.profile = userProfile;
    }

    public AppUser profile(UserProfile userProfile) {
        this.setProfile(userProfile);
        return this;
    }

    public NotificationSetting getNotificationSetting() {
        return this.notificationSetting;
    }

    public void setNotificationSetting(NotificationSetting notificationSetting) {
        if (this.notificationSetting != null) {
            this.notificationSetting.setUser(null);
        }
        if (notificationSetting != null) {
            notificationSetting.setUser(this);
        }
        this.notificationSetting = notificationSetting;
    }

    public AppUser notificationSetting(NotificationSetting notificationSetting) {
        this.setNotificationSetting(notificationSetting);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AppUser)) {
            return false;
        }
        return getId() != null && getId().equals(((AppUser) o).getId());
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
        return "AppUser{" +
                "id=" + getId() +
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
                "}";
    }
}
