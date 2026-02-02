package com.stockapp.userservice.repository;

import com.stockapp.userservice.domain.Session;
import com.stockapp.userservice.domain.enumeration.SessionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Spring Data MongoDB reactive repository for the Session entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SessionRepository extends ReactiveMongoRepository<Session, String> {
    Flux<Session> findAllBy(Pageable pageable);

    @Query("{}")
    Flux<Session> findAllWithEagerRelationships(Pageable pageable);

    @Query("{}")
    Flux<Session> findAllWithEagerRelationships();

    @Query("{'id': ?0}")
    Mono<Session> findOneWithEagerRelationships(String id);

    /**
     * Find all sessions for a specific user by their login
     */
    @Query("{'user.login': ?0}")
    Flux<Session> findByUserLogin(String login);

    /**
     * Find all active sessions for a specific user
     */
    @Query("{'user.login': ?0, 'status': 'ACTIVE'}")
    Flux<Session> findActiveSessionsByUserLogin(String login);

    /**
     * Find session by session ID (unique identifier)
     */
    Mono<Session> findBySessionId(String sessionId);

    /**
     * Find session by token
     */
    Mono<Session> findByToken(String token);

    /**
     * Find session by refresh token
     */
    Mono<Session> findByRefreshToken(String refreshToken);

    /**
     * Find all sessions for a user with a specific status
     */
    @Query("{'user.login': ?0, 'status': ?1}")
    Flux<Session> findByUserLoginAndStatus(String login, SessionStatus status);

    /**
     * Find all active sessions that have expired
     */
    @Query("{'status': 'ACTIVE', 'expiryTime': {$lt: ?0}}")
    Flux<Session> findExpiredActiveSessions(Instant now);

    /**
     * Count active sessions for a user
     */
    @Query(value = "{'user.login': ?0, 'status': 'ACTIVE'}", count = true)
    Mono<Long> countActiveSessionsByUserLogin(String login);

    /**
     * Find sessions by device ID for a user
     */
    @Query("{'user.login': ?0, 'deviceId': ?1}")
    Flux<Session> findByUserLoginAndDeviceId(String login, String deviceId);

    /**
     * Delete all sessions for a user
     */
    Mono<Void> deleteByUserLogin(String login);
}
