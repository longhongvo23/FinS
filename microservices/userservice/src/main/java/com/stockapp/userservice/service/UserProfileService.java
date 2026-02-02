package com.stockapp.userservice.service;

import com.stockapp.userservice.repository.UserProfileRepository;
import com.stockapp.userservice.service.dto.UserProfileDTO;
import com.stockapp.userservice.service.mapper.UserProfileMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing
 * {@link com.stockapp.userservice.domain.UserProfile}.
 */
@Service
public class UserProfileService {

    private static final Logger LOG = LoggerFactory.getLogger(UserProfileService.class);

    private final UserProfileRepository userProfileRepository;

    private final UserProfileMapper userProfileMapper;

    public UserProfileService(UserProfileRepository userProfileRepository, UserProfileMapper userProfileMapper) {
        this.userProfileRepository = userProfileRepository;
        this.userProfileMapper = userProfileMapper;
    }

    /**
     * Save a userProfile.
     *
     * @param userProfileDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<UserProfileDTO> save(UserProfileDTO userProfileDTO) {
        LOG.debug("Request to save UserProfile : {}", userProfileDTO);
        return userProfileRepository.save(userProfileMapper.toEntity(userProfileDTO)).map(userProfileMapper::toDto);
    }

    /**
     * Update a userProfile.
     *
     * @param userProfileDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<UserProfileDTO> update(UserProfileDTO userProfileDTO) {
        LOG.debug("Request to update UserProfile : {}", userProfileDTO);
        return userProfileRepository.save(userProfileMapper.toEntity(userProfileDTO)).map(userProfileMapper::toDto);
    }

    /**
     * Partially update a userProfile.
     *
     * @param userProfileDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<UserProfileDTO> partialUpdate(UserProfileDTO userProfileDTO) {
        LOG.debug("Request to partially update UserProfile : {}", userProfileDTO);

        return userProfileRepository
                .findById(userProfileDTO.getId())
                .map(existingUserProfile -> {
                    userProfileMapper.partialUpdate(existingUserProfile, userProfileDTO);

                    return existingUserProfile;
                })
                .flatMap(userProfileRepository::save)
                .map(userProfileMapper::toDto);
    }

    /**
     * Get all the userProfiles.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Flux<UserProfileDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all UserProfiles");
        return userProfileRepository.findAllBy(pageable).map(userProfileMapper::toDto);
    }

    /**
     * Get all the userProfiles with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Flux<UserProfileDTO> findAllWithEagerRelationships(Pageable pageable) {
        return userProfileRepository.findAllWithEagerRelationships(pageable).map(userProfileMapper::toDto);
    }

    /**
     * Returns the number of userProfiles available.
     * 
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return userProfileRepository.count();
    }

    /**
     * Get one userProfile by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<UserProfileDTO> findOne(String id) {
        LOG.debug("Request to get UserProfile : {}", id);
        return userProfileRepository.findOneWithEagerRelationships(id).map(userProfileMapper::toDto);
    }

    /**
     * Delete the userProfile by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete UserProfile : {}", id);
        return userProfileRepository.deleteById(id);
    }

    /**
     * Get userProfile by user ID.
     *
     * @param userId the user ID.
     * @return the entity.
     */
    public Mono<UserProfileDTO> findByUserId(String userId) {
        LOG.debug("Request to get UserProfile by userId : {}", userId);
        return userProfileRepository.findByUserId(userId).map(userProfileMapper::toDto);
    }

    /**
     * Get userProfile by user login (username).
     *
     * @param login the user login/username.
     * @return the entity.
     */
    public Mono<UserProfileDTO> findByUserLogin(String login) {
        LOG.debug("Request to get UserProfile by login : {}", login);
        return userProfileRepository.findByUserLogin(login).map(userProfileMapper::toDto);
    }
}
