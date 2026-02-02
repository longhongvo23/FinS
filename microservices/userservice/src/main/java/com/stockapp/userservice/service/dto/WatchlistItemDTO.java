package com.stockapp.userservice.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.stockapp.userservice.domain.WatchlistItem} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class WatchlistItemDTO implements Serializable {

    private String id;

    @NotNull(message = "must not be null")
    @Pattern(regexp = "^[A-Z0-9\\.]+$")
    private String symbol;

    @NotNull(message = "must not be null")
    private Instant addedAt;

    @Size(max = 500)
    private String notes;

    private String userId;

    private AppUserDTO user;

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

    public Instant getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Instant addedAt) {
        this.addedAt = addedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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
        if (!(o instanceof WatchlistItemDTO)) {
            return false;
        }

        WatchlistItemDTO watchlistItemDTO = (WatchlistItemDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, watchlistItemDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "WatchlistItemDTO{" +
                "id='" + getId() + "'" +
                ", symbol='" + getSymbol() + "'" +
                ", addedAt='" + getAddedAt() + "'" +
                ", notes='" + getNotes() + "'" +
                ", user=" + getUser() +
                "}";
    }
}
