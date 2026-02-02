package com.stockapp.userservice.service;

import com.stockapp.userservice.domain.AppUser;
import com.stockapp.userservice.domain.Session;
import com.stockapp.userservice.domain.enumeration.DeviceType;
import com.stockapp.userservice.domain.enumeration.SessionStatus;
import com.stockapp.userservice.repository.SessionRepository;
import com.stockapp.userservice.service.dto.SessionDTO;
import com.stockapp.userservice.service.mapper.SessionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.UUID;

/**
 * Service Implementation for managing
 * {@link com.stockapp.userservice.domain.Session}.
 */
@Service
public class SessionService {

    private static final Logger LOG = LoggerFactory.getLogger(SessionService.class);

    private final SessionRepository sessionRepository;

    private final SessionMapper sessionMapper;

    public SessionService(SessionRepository sessionRepository, SessionMapper sessionMapper) {
        this.sessionRepository = sessionRepository;
        this.sessionMapper = sessionMapper;
    }

    /**
     * Save a session.
     *
     * @param sessionDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<SessionDTO> save(SessionDTO sessionDTO) {
        LOG.debug("Request to save Session : {}", sessionDTO);
        return sessionRepository.save(sessionMapper.toEntity(sessionDTO)).map(sessionMapper::toDto);
    }

    /**
     * Update a session.
     *
     * @param sessionDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<SessionDTO> update(SessionDTO sessionDTO) {
        LOG.debug("Request to update Session : {}", sessionDTO);
        return sessionRepository.save(sessionMapper.toEntity(sessionDTO)).map(sessionMapper::toDto);
    }

    /**
     * Partially update a session.
     *
     * @param sessionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<SessionDTO> partialUpdate(SessionDTO sessionDTO) {
        LOG.debug("Request to partially update Session : {}", sessionDTO);

        return sessionRepository
                .findById(sessionDTO.getId())
                .map(existingSession -> {
                    sessionMapper.partialUpdate(existingSession, sessionDTO);

                    return existingSession;
                })
                .flatMap(sessionRepository::save)
                .map(sessionMapper::toDto);
    }

    /**
     * Get all the sessions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Flux<SessionDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Sessions");
        return sessionRepository.findAllBy(pageable).map(sessionMapper::toDto);
    }

    /**
     * Get all the sessions with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Flux<SessionDTO> findAllWithEagerRelationships(Pageable pageable) {
        return sessionRepository.findAllWithEagerRelationships(pageable).map(sessionMapper::toDto);
    }

    /**
     * Returns the number of sessions available.
     * 
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return sessionRepository.count();
    }

    /**
     * Get one session by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<SessionDTO> findOne(String id) {
        LOG.debug("Request to get Session : {}", id);
        return sessionRepository.findOneWithEagerRelationships(id).map(sessionMapper::toDto);
    }

    /**
     * Delete the session by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete Session : {}", id);
        return sessionRepository.deleteById(id);
    }

    // ============== Session Management Methods ==============

    /**
     * Find all active sessions for a user
     *
     * @param login the user login
     * @return list of active sessions
     */
    public Flux<SessionDTO> findActiveSessionsByUserLogin(String login) {
        LOG.debug("Request to get active Sessions for user: {}", login);
        return sessionRepository.findActiveSessionsByUserLogin(login).map(sessionMapper::toDto);
    }

    /**
     * Find all sessions for a user
     *
     * @param login the user login
     * @return list of sessions
     */
    public Flux<SessionDTO> findByUserLogin(String login) {
        LOG.debug("Request to get all Sessions for user: {}", login);
        return sessionRepository.findByUserLogin(login).map(sessionMapper::toDto);
    }

    /**
     * Create a new session for a user during login
     *
     * @param user         the user entity
     * @param accessToken  the JWT access token
     * @param refreshToken the refresh token
     * @param ipAddress    the client IP address
     * @param userAgent    the client User-Agent string
     * @param deviceInfo   parsed device information
     * @param rememberMe   whether to extend session validity
     * @return the created session
     */
    public Mono<SessionDTO> createSession(AppUser user, String accessToken, String refreshToken,
            String ipAddress, String userAgent, DeviceInfo deviceInfo,
            boolean rememberMe) {
        LOG.debug("Creating new session for user: {}", user.getLogin());

        Session session = new Session();
        session.setSessionId(UUID.randomUUID().toString());
        session.setToken(accessToken);
        session.setRefreshToken(refreshToken);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setLoginTime(Instant.now());
        session.setLastActivityTime(Instant.now());
        session.setStatus(SessionStatus.ACTIVE);
        session.setUser(user);

        // Set session expiry (30 days for remember me, 1 day otherwise)
        long validityInSeconds = rememberMe ? 30L * 24 * 60 * 60 : 24L * 60 * 60;
        session.setExpiryTime(Instant.now().plusSeconds(validityInSeconds));

        // Set device information
        if (deviceInfo != null) {
            session.setDeviceId(deviceInfo.getDeviceId());
            session.setDeviceName(deviceInfo.getDeviceName());
            session.setDeviceType(deviceInfo.getDeviceType());
            session.setOsName(deviceInfo.getOsName());
            session.setOsVersion(deviceInfo.getOsVersion());
            session.setBrowserName(deviceInfo.getBrowserName());
            session.setBrowserVersion(deviceInfo.getBrowserVersion());
            session.setLocation(deviceInfo.getLocation());
        }

        return sessionRepository.save(session).map(sessionMapper::toDto);
    }

    /**
     * Revoke a specific session by session ID
     *
     * @param id     the session id
     * @param reason the reason for revocation
     * @return the revoked session
     */
    public Mono<SessionDTO> revokeSession(String id, String reason) {
        LOG.debug("Request to revoke Session: {}", id);
        return sessionRepository.findById(id)
                .flatMap(session -> {
                    session.setStatus(SessionStatus.REVOKED);
                    session.setRevokedAt(Instant.now());
                    session.setRevokedReason(reason);
                    return sessionRepository.save(session);
                })
                .map(sessionMapper::toDto);
    }

    /**
     * Revoke a specific session by session ID for a specific user
     *
     * @param id        the session id
     * @param userLogin the user login (for verification)
     * @param reason    the reason for revocation
     * @return the revoked session
     */
    public Mono<SessionDTO> revokeSessionForUser(String id, String userLogin, String reason) {
        LOG.debug("Request to revoke Session {} for user: {}", id, userLogin);
        return sessionRepository.findById(id)
                .filter(session -> session.getUser() != null &&
                        session.getUser().getLogin() != null &&
                        session.getUser().getLogin().equals(userLogin))
                .flatMap(session -> {
                    session.setStatus(SessionStatus.REVOKED);
                    session.setRevokedAt(Instant.now());
                    session.setRevokedReason(reason);
                    return sessionRepository.save(session);
                })
                .map(sessionMapper::toDto);
    }

    /**
     * Revoke all sessions for a user except the current one
     *
     * @param userLogin        the user login
     * @param currentSessionId the current session ID to keep active
     * @param reason           the reason for revocation
     * @return count of revoked sessions
     */
    public Mono<Long> revokeAllSessionsExcept(String userLogin, String currentSessionId, String reason) {
        LOG.debug("Request to revoke all sessions for user {} except: {}", userLogin, currentSessionId);
        return sessionRepository.findActiveSessionsByUserLogin(userLogin)
                .filter(session -> !session.getId().equals(currentSessionId))
                .flatMap(session -> {
                    session.setStatus(SessionStatus.REVOKED);
                    session.setRevokedAt(Instant.now());
                    session.setRevokedReason(reason);
                    return sessionRepository.save(session);
                })
                .count();
    }

    /**
     * Revoke all sessions for a user (for account deletion)
     *
     * @param userLogin the user login
     * @return count of revoked sessions
     */
    public Mono<Long> revokeAllSessionsForUser(String userLogin) {
        LOG.debug("Request to revoke ALL sessions for user: {}", userLogin);
        return sessionRepository.findActiveSessionsByUserLogin(userLogin)
                .flatMap(session -> {
                    session.setStatus(SessionStatus.REVOKED);
                    session.setRevokedAt(Instant.now());
                    session.setRevokedReason("Account deleted");
                    return sessionRepository.save(session);
                })
                .count();
    }

    /**
     * Update last activity time for a session
     *
     * @param sessionId the session ID
     * @return the updated session
     */
    public Mono<SessionDTO> updateLastActivity(String sessionId) {
        LOG.debug("Updating last activity for session: {}", sessionId);
        return sessionRepository.findBySessionId(sessionId)
                .flatMap(session -> {
                    session.setLastActivityTime(Instant.now());
                    return sessionRepository.save(session);
                })
                .map(sessionMapper::toDto);
    }

    /**
     * Find session by token
     *
     * @param token the JWT token
     * @return the session if found
     */
    public Mono<SessionDTO> findByToken(String token) {
        return sessionRepository.findByToken(token).map(sessionMapper::toDto);
    }

    /**
     * Logout a session (mark as logged out)
     *
     * @param token the JWT token
     * @return the logged out session
     */
    public Mono<SessionDTO> logoutSession(String token) {
        LOG.debug("Logging out session with token");
        return sessionRepository.findByToken(token)
                .flatMap(session -> {
                    session.setStatus(SessionStatus.LOGGED_OUT);
                    session.setLogoutTime(Instant.now());
                    return sessionRepository.save(session);
                })
                .map(sessionMapper::toDto);
    }

    /**
     * Clean up expired sessions
     *
     * @return count of cleaned sessions
     */
    public Mono<Long> cleanupExpiredSessions() {
        LOG.debug("Cleaning up expired sessions");
        return sessionRepository.findExpiredActiveSessions(Instant.now())
                .flatMap(session -> {
                    session.setStatus(SessionStatus.EXPIRED);
                    return sessionRepository.save(session);
                })
                .count();
    }

    /**
     * Count active sessions for a user
     *
     * @param login the user login
     * @return the count of active sessions
     */
    public Mono<Long> countActiveSessionsByUserLogin(String login) {
        return sessionRepository.countActiveSessionsByUserLogin(login);
    }

    /**
     * Device information holder class
     */
    public static class DeviceInfo {
        private String deviceId;
        private String deviceName;
        private DeviceType deviceType;
        private String osName;
        private String osVersion;
        private String browserName;
        private String browserVersion;
        private String location;

        // Getters and Setters
        public String getDeviceId() {
            return deviceId;
        }

        public void setDeviceId(String deviceId) {
            this.deviceId = deviceId;
        }

        public String getDeviceName() {
            return deviceName;
        }

        public void setDeviceName(String deviceName) {
            this.deviceName = deviceName;
        }

        public DeviceType getDeviceType() {
            return deviceType;
        }

        public void setDeviceType(DeviceType deviceType) {
            this.deviceType = deviceType;
        }

        public String getOsName() {
            return osName;
        }

        public void setOsName(String osName) {
            this.osName = osName;
        }

        public String getOsVersion() {
            return osVersion;
        }

        public void setOsVersion(String osVersion) {
            this.osVersion = osVersion;
        }

        public String getBrowserName() {
            return browserName;
        }

        public void setBrowserName(String browserName) {
            this.browserName = browserName;
        }

        public String getBrowserVersion() {
            return browserVersion;
        }

        public void setBrowserVersion(String browserVersion) {
            this.browserVersion = browserVersion;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }
    }
}
