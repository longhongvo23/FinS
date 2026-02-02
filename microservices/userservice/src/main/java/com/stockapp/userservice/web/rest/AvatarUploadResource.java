package com.stockapp.userservice.web.rest;

import com.stockapp.userservice.service.UserProfileService;
import com.stockapp.userservice.service.dto.UserProfileDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.Map;
import java.util.Set;

/**
 * REST controller for managing user avatar uploads.
 */
@RestController
@RequestMapping("/api/public/users/me")
public class AvatarUploadResource {

    private static final Logger LOG = LoggerFactory.getLogger(AvatarUploadResource.class);
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/jpg");

    private final UserProfileService userProfileService;
    private final com.stockapp.userservice.service.AppUserService appUserService;

    public AvatarUploadResource(UserProfileService userProfileService,
            com.stockapp.userservice.service.AppUserService appUserService) {
        this.userProfileService = userProfileService;
        this.appUserService = appUserService;
    }

    /**
     * POST /api/public/users/me/avatar : Upload user avatar
     *
     * @param filePart the avatar image file
     * @return the avatar URL (base64 data URL)
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<Map<String, String>>> uploadAvatar(@RequestPart("file") FilePart filePart) {
        LOG.debug("REST request to upload avatar");

        return getCurrentUsername()
                .flatMap(username -> {
                    String contentType = filePart.headers().getContentType() != null
                            ? filePart.headers().getContentType().toString()
                            : "image/jpeg";

                    // Validate content type
                    // simple check, splitting just in case of charset
                    String mimeType = contentType.split(";")[0].trim().toLowerCase();
                    if (!ALLOWED_TYPES.contains(mimeType)) {
                        LOG.warn("Invalid content type: {}", mimeType);
                        return Mono.just(ResponseEntity.badRequest()
                                .body(Map.of("error", "Only supports JPG or PNG")));
                    }

                    // Read file content and convert to base64
                    return org.springframework.core.io.buffer.DataBufferUtils.join(filePart.content())
                            .flatMap(dataBuffer -> {
                                byte[] bytes = new byte[dataBuffer.readableByteCount()];
                                dataBuffer.read(bytes);
                                org.springframework.core.io.buffer.DataBufferUtils.release(dataBuffer);

                                // Validate file size
                                if (bytes.length > MAX_FILE_SIZE) {
                                    return Mono.just(ResponseEntity.badRequest()
                                            .body(Map.of("error", "File size too large (max 2MB)")));
                                }

                                // Convert to base64 data URL
                                String base64 = Base64.getEncoder().encodeToString(bytes);
                                String dataUrl = "data:" + mimeType + ";base64," + base64;

                                // Update user profile with new avatar URL
                                return userProfileService.findByUserLogin(username)
                                        .flatMap(profile -> {
                                            profile.setAvatarUrl(dataUrl);
                                            return userProfileService.save(profile);
                                        })
                                        .switchIfEmpty(Mono.defer(() ->
                                // Create new profile if not exists - MUST link to AppUser
                                appUserService.findByLogin(username)
                                        .flatMap(userDTO -> {
                                            UserProfileDTO newProfile = new UserProfileDTO();
                                            newProfile.setAvatarUrl(dataUrl);
                                            newProfile.setUser(userDTO); // Link to user
                                            return userProfileService.save(newProfile);
                                        })))
                                        .map(savedProfile -> ResponseEntity.ok(Map.of(
                                                "avatarUrl", savedProfile.getAvatarUrl())));
                            });
                })
                .switchIfEmpty(Mono.error(new RuntimeException("User not found or not authenticated")))
                .onErrorResume(e -> {
                    LOG.error("Error uploading avatar: {}", e.getMessage(), e);
                    return Mono.just(ResponseEntity.internalServerError()
                            .body(Map.of("error", "Server error during upload: " + e.getMessage())));
                });
    }

    /**
     * DELETE /api/public/users/me/avatar : Remove user avatar
     *
     * @return empty response
     */
    @DeleteMapping("/avatar")
    public Mono<ResponseEntity<Void>> deleteAvatar() {
        LOG.debug("REST request to delete avatar");

        return getCurrentUsername()
                .flatMap(username -> userProfileService.findByUserLogin(username)
                        .flatMap(profile -> {
                            profile.setAvatarUrl(null);
                            return userProfileService.save(profile);
                        })
                        .map(saved -> ResponseEntity.noContent().<Void>build())
                        .switchIfEmpty(Mono.just(ResponseEntity.noContent().build())));
    }

    private Mono<String> getCurrentUsername() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(auth -> auth.getName());
    }
}
