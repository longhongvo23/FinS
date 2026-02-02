package com.stockapp.userservice.repository;

import com.stockapp.userservice.domain.UserProfile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data MongoDB reactive repository for the UserProfile entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserProfileRepository extends ReactiveMongoRepository<UserProfile, String> {
    Flux<UserProfile> findAllBy(Pageable pageable);

    @Query("{}")
    Flux<UserProfile> findAllWithEagerRelationships(Pageable pageable);

    @Query("{}")
    Flux<UserProfile> findAllWithEagerRelationships();

    @Query("{'id': ?0}")
    Mono<UserProfile> findOneWithEagerRelationships(String id);

    // Custom query for finding profile by user ID
    Mono<UserProfile> findByUserId(String userId);

    // Find profile by user login (username)
    @Query("{'user.login': ?0}")
    Mono<UserProfile> findByUserLogin(String login);
}
