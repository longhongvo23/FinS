package com.stockapp.userservice.service;

import com.stockapp.userservice.repository.AppUserRepository;
import com.stockapp.userservice.service.dto.AppUserDTO;
import com.stockapp.userservice.service.mapper.AppUserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing
 * {@link com.stockapp.userservice.domain.AppUser}.
 */
@Service
public class AppUserService {

    private static final Logger LOG = LoggerFactory.getLogger(AppUserService.class);

    private final AppUserRepository appUserRepository;

    private final AppUserMapper appUserMapper;

    public AppUserService(AppUserRepository appUserRepository, AppUserMapper appUserMapper) {
        this.appUserRepository = appUserRepository;
        this.appUserMapper = appUserMapper;
    }

    /**
     * Save a appUser.
     *
     * @param appUserDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<AppUserDTO> save(AppUserDTO appUserDTO) {
        LOG.debug("Request to save AppUser : {}", appUserDTO);
        return appUserRepository.save(appUserMapper.toEntity(appUserDTO)).map(appUserMapper::toDto);
    }

    /**
     * Update a appUser.
     *
     * @param appUserDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<AppUserDTO> update(AppUserDTO appUserDTO) {
        LOG.debug("Request to update AppUser : {}", appUserDTO);
        return appUserRepository.save(appUserMapper.toEntity(appUserDTO)).map(appUserMapper::toDto);
    }

    /**
     * Partially update a appUser.
     *
     * @param appUserDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<AppUserDTO> partialUpdate(AppUserDTO appUserDTO) {
        LOG.debug("Request to partially update AppUser : {}", appUserDTO);

        return appUserRepository
                .findById(appUserDTO.getId())
                .map(existingAppUser -> {
                    appUserMapper.partialUpdate(existingAppUser, appUserDTO);

                    return existingAppUser;
                })
                .flatMap(appUserRepository::save)
                .map(appUserMapper::toDto);
    }

    /**
     * Get all the appUsers.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Flux<AppUserDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all AppUsers");
        return appUserRepository.findAllBy(pageable).map(appUserMapper::toDto);
    }

    /**
     * Get all the appUsers with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Flux<AppUserDTO> findAllWithEagerRelationships(Pageable pageable) {
        return appUserRepository.findAllWithEagerRelationships(pageable).map(appUserMapper::toDto);
    }

    /**
     * Get all the appUsers where Profile is {@code null}.
     * 
     * @return the flux of entities.
     */

    public Flux<AppUserDTO> findAllWhereProfileIsNull() {
        LOG.debug("Request to get all appUsers where Profile is null");
        return appUserRepository.findAll().filter(appUser -> appUser.getProfile() == null).map(appUserMapper::toDto);
    }

    /**
     * Get all the appUsers where NotificationSetting is {@code null}.
     * 
     * @return the flux of entities.
     */

    public Flux<AppUserDTO> findAllWhereNotificationSettingIsNull() {
        LOG.debug("Request to get all appUsers where NotificationSetting is null");
        return appUserRepository.findAll().filter(appUser -> appUser.getNotificationSetting() == null)
                .map(appUserMapper::toDto);
    }

    /**
     * Returns the number of appUsers available.
     * 
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return appUserRepository.count();
    }

    /**
     * Get one appUser by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<AppUserDTO> findOne(String id) {
        LOG.debug("Request to get AppUser : {}", id);
        return appUserRepository.findOneWithEagerRelationships(id).map(appUserMapper::toDto);
    }

    /**
     * Delete the appUser by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete AppUser : {}", id);
        return appUserRepository.deleteById(id);
    }

    /**
     * Find user by login username
     *
     * @param login the login username
     * @return the user entity
     */
    public Mono<AppUserDTO> findByLogin(String login) {
        LOG.debug("Request to get AppUser by login : {}", login);
        return appUserRepository.findByLogin(login).map(appUserMapper::toDto);
    }

    /**
     * Find user by email
     *
     * @param email the email address
     * @return the user entity
     */
    public Mono<AppUserDTO> findByEmail(String email) {
        LOG.debug("Request to get AppUser by email : {}", email);
        return appUserRepository.findByEmail(email).map(appUserMapper::toDto);
    }

    /**
     * Find user by login or email
     *
     * @param loginOrEmail the login username or email
     * @return the user entity
     */
    public Mono<AppUserDTO> findByLoginOrEmail(String loginOrEmail) {
        LOG.debug("Request to get AppUser by login or email : {}", loginOrEmail);
        return appUserRepository.findByLogin(loginOrEmail)
                .switchIfEmpty(appUserRepository.findByEmail(loginOrEmail))
                .map(appUserMapper::toDto);
    }

    /**
     * Find user by password reset token
     *
     * @param token the password reset token
     * @return the user entity
     */
    public Mono<AppUserDTO> findByPasswordResetToken(String token) {
        LOG.debug("Request to get AppUser by password reset token");
        return appUserRepository.findByPasswordResetToken(token).map(appUserMapper::toDto);
    }

    /**
     * Find user by email verification token
     *
     * @param token the email verification token
     * @return the user entity
     */
    public Mono<AppUserDTO> findByEmailVerificationToken(String token) {
        LOG.debug("Request to get AppUser by email verification token");
        return appUserRepository.findByEmailVerificationToken(token).map(appUserMapper::toDto);
    }

    /**
     * Find user by activation key
     *
     * @param key the activation key from email
     * @return the user entity
     */
    public Mono<AppUserDTO> findByActivationKey(String key) {
        LOG.debug("Request to get AppUser by activation key");
        return appUserRepository.findByActivationKey(key).map(appUserMapper::toDto);
    }

    /**
     * Activate user account by activation key
     * This method directly updates the Entity to avoid DTO mapping issues
     *
     * @param key the activation key from email
     * @return the activated user entity
     */
    public Mono<AppUserDTO> activateByKey(String key) {
        LOG.debug("Request to activate AppUser by key: {}", key);
        return appUserRepository.findByActivationKey(key)
                .flatMap(user -> {
                    LOG.info("Activating user: {} with id: {}", user.getLogin(), user.getId());
                    user.setActivated(true);
                    user.setEmailVerified(true);
                    user.setAccountStatus(com.stockapp.userservice.domain.enumeration.AccountStatus.ACTIVE);
                    user.setActivationKey(null);
                    user.setEmailVerificationToken(null);
                    user.setEmailVerificationTokenExpiry(null);
                    return appUserRepository.save(user);
                })
                .map(appUserMapper::toDto);
    }

    /**
     * Request password reset for user by email
     * This method directly updates the Entity to avoid DTO mapping issues
     *
     * @param email      the user's email
     * @param resetToken the generated reset token
     * @param expiry     the token expiry time
     * @return the updated user entity with reset token
     */
    public Mono<AppUserDTO> requestPasswordReset(String email, String resetToken, java.time.Instant expiry) {
        LOG.debug("Request to set password reset token for email: {}", email);
        return appUserRepository.findByEmail(email)
                .flatMap(user -> {
                    LOG.info("Setting password reset token for user: {} with id: {}", user.getLogin(), user.getId());
                    user.setPasswordResetToken(resetToken);
                    user.setPasswordResetTokenExpiry(expiry);
                    return appUserRepository.save(user);
                })
                .map(appUserMapper::toDto);
    }
}
