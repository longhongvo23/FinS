package com.stockapp.userservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stockapp.userservice.domain.enumeration.DeviceType;
import com.stockapp.userservice.domain.enumeration.LoginMethod;
import com.stockapp.userservice.security.encryption.Encrypted;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A LoginHistory.
 */
@Document(collection = "login_history")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LoginHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @NotNull(message = "must not be null")
    @Field("login_time")
    private Instant loginTime;

    @NotNull(message = "must not be null")
    @Field("login_method")
    private LoginMethod loginMethod;

    @Size(max = 45)
    @Encrypted(reason = "PII - IP address can identify user location")
    @Field("ip_address")
    private String ipAddress;

    @Size(max = 1024)
    @Field("user_agent")
    private String userAgent;

    @Field("device_type")
    private DeviceType deviceType;

    @Size(max = 200)
    @Encrypted(reason = "PII - User location data")
    @Field("location")
    private String location;

    @NotNull(message = "must not be null")
    @Field("successful")
    private Boolean successful;

    @Size(max = 500)
    @Field("failure_reason")
    private String failureReason;

    @Field("user")
    @JsonIgnoreProperties(value = { "authorities", "profile", "notificationSetting" }, allowSetters = true)
    private AppUser user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public LoginHistory id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getLoginTime() {
        return this.loginTime;
    }

    public LoginHistory loginTime(Instant loginTime) {
        this.setLoginTime(loginTime);
        return this;
    }

    public void setLoginTime(Instant loginTime) {
        this.loginTime = loginTime;
    }

    public LoginMethod getLoginMethod() {
        return this.loginMethod;
    }

    public LoginHistory loginMethod(LoginMethod loginMethod) {
        this.setLoginMethod(loginMethod);
        return this;
    }

    public void setLoginMethod(LoginMethod loginMethod) {
        this.loginMethod = loginMethod;
    }

    public String getIpAddress() {
        return this.ipAddress;
    }

    public LoginHistory ipAddress(String ipAddress) {
        this.setIpAddress(ipAddress);
        return this;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return this.userAgent;
    }

    public LoginHistory userAgent(String userAgent) {
        this.setUserAgent(userAgent);
        return this;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public DeviceType getDeviceType() {
        return this.deviceType;
    }

    public LoginHistory deviceType(DeviceType deviceType) {
        this.setDeviceType(deviceType);
        return this;
    }

    public void setDeviceType(DeviceType deviceType) {
        this.deviceType = deviceType;
    }

    public String getLocation() {
        return this.location;
    }

    public LoginHistory location(String location) {
        this.setLocation(location);
        return this;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getSuccessful() {
        return this.successful;
    }

    public LoginHistory successful(Boolean successful) {
        this.setSuccessful(successful);
        return this;
    }

    public void setSuccessful(Boolean successful) {
        this.successful = successful;
    }

    public String getFailureReason() {
        return this.failureReason;
    }

    public LoginHistory failureReason(String failureReason) {
        this.setFailureReason(failureReason);
        return this;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public AppUser getUser() {
        return this.user;
    }

    public void setUser(AppUser appUser) {
        this.user = appUser;
    }

    public LoginHistory user(AppUser appUser) {
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
        if (!(o instanceof LoginHistory)) {
            return false;
        }
        return getId() != null && getId().equals(((LoginHistory) o).getId());
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
        return "LoginHistory{" +
                "id=" + getId() +
                ", loginTime='" + getLoginTime() + "'" +
                ", loginMethod='" + getLoginMethod() + "'" +
                ", ipAddress='" + getIpAddress() + "'" +
                ", userAgent='" + getUserAgent() + "'" +
                ", deviceType='" + getDeviceType() + "'" +
                ", location='" + getLocation() + "'" +
                ", successful='" + getSuccessful() + "'" +
                ", failureReason='" + getFailureReason() + "'" +
                "}";
    }
}
